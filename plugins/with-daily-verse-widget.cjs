const { withDangerousMod, withXcodeProject } = require('expo/config-plugins');
const fs = require('node:fs');
const path = require('node:path');
const { Buffer } = require('node:buffer');
const { buildDailyVerseCatalog } = require('../scripts/lib/daily-verse-catalog.cjs');

const TARGET = 'DailyVerseWidget';
const SOURCES = ['DailyVerseWidget.swift', 'DailyVerseCalendar.swift', 'GeneratedDailyVerses.swift'];

function writeWidgetFiles(projectRoot, iosRoot) {
  const folder = path.join(iosRoot, TARGET);
  const catalog = buildDailyVerseCatalog(projectRoot);
  fs.mkdirSync(folder, { recursive: true });
  for (const file of SOURCES.slice(0, 2)) {
    fs.copyFileSync(path.join(projectRoot, 'widgets/ios', file), path.join(folder, file));
  }
  // Base64 avoids Swift literal interpolation/escaping changing source strings.
  const data = Buffer.from(JSON.stringify(catalog.verses)).toString('base64');
  fs.writeFileSync(path.join(folder, SOURCES[2]),
    `// Generated from the pinned reader texts. Do not edit.\nimport Foundation\nlet dailyVerses = try! JSONDecoder().decode([DailyVerse].self, from: Data(base64Encoded: "${data}")!)\n`);
  fs.writeFileSync(path.join(folder, 'Info.plist'), `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>NSExtension</key><dict><key>NSExtensionPointIdentifier</key><string>com.apple.widgetkit-extension</string></dict>
</dict></plist>
`);
}

function configureWidgetTarget(project, { bundleIdentifier, version = '1.0.0', buildNumber = '1', appleTeamId }) {
  const firstTarget = project.getFirstTarget();
  let target = Object.entries(project.pbxNativeTargetSection()).find(([, value]) =>
    value && typeof value === 'object' && value.name?.replaceAll('"', '') === TARGET);
  if (!target) {
    const added = project.addTarget(TARGET, 'app_extension', TARGET, `${bundleIdentifier}.widget`);
    target = [added.uuid, added.pbxNativeTarget];
    project.addBuildPhase([], 'PBXSourcesBuildPhase', 'Sources', added.uuid);
    project.addBuildPhase([], 'PBXFrameworksBuildPhase', 'Frameworks', added.uuid);
    const group = project.addPbxGroup([], TARGET, TARGET);
    project.addToPbxGroup(group.uuid, project.getFirstProject().firstProject.mainGroup);
    for (const file of SOURCES) project.addSourceFile(file, { target: added.uuid }, group.uuid);
  }
  const [, widget] = target;
  const configurationList = project.pbxXCConfigurationList()[widget.buildConfigurationList];
  const configurations = project.pbxXCBuildConfigurationSection();
  const parentList = project.pbxXCConfigurationList()[firstTarget.firstTarget.buildConfigurationList];
  for (const { value } of configurationList.buildConfigurations) {
    const config = configurations[value];
    const parentConfig = parentList.buildConfigurations.map(({ value }) => configurations[value])
      .find((parent) => parent.name === config.name);
    Object.assign(config.buildSettings, {
      INFOPLIST_FILE: `${TARGET}/Info.plist`,
      GENERATE_INFOPLIST_FILE: 'YES',
      INFOPLIST_KEY_CFBundleDisplayName: '"Daily Bible Verse"',
      PRODUCT_BUNDLE_IDENTIFIER: `"${bundleIdentifier}.widget"`,
      MARKETING_VERSION: `"${version}"`,
      CURRENT_PROJECT_VERSION: `"${buildNumber}"`,
      IPHONEOS_DEPLOYMENT_TARGET: '17.0',
      SWIFT_VERSION: '5.0',
      TARGETED_DEVICE_FAMILY: '"1,2"',
      APPLICATION_EXTENSION_API_ONLY: 'YES',
      CODE_SIGN_STYLE: 'Automatic',
      DEVELOPMENT_TEAM: appleTeamId ?? parentConfig?.buildSettings.DEVELOPMENT_TEAM ?? '""',
      SWIFT_OPTIMIZATION_LEVEL: config.name === 'Debug' ? '"-Onone"' : '"-O"',
    });
  }
  return project;
}

function withDailyVerseWidget(config) {
  if (!config.ios?.bundleIdentifier) {
    throw new Error('Daily verse widget requires ios.bundleIdentifier');
  }
  config = withDangerousMod(config, ['ios', async (mod) => {
    writeWidgetFiles(mod.modRequest.projectRoot, mod.modRequest.platformProjectRoot);
    return mod;
  }]);
  return withXcodeProject(config, (mod) => {
    configureWidgetTarget(mod.modResults, {
      bundleIdentifier: mod.ios.bundleIdentifier,
      appleTeamId: mod.ios.appleTeamId,
      version: mod.version,
      buildNumber: mod.ios.buildNumber,
    });
    return mod;
  });
}

module.exports = withDailyVerseWidget;
module.exports.configureWidgetTarget = configureWidgetTarget;
module.exports.writeWidgetFiles = writeWidgetFiles;
