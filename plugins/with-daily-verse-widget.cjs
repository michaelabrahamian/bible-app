const { withDangerousMod, withXcodeProject, withInfoPlist, withEntitlementsPlist } = require('expo/config-plugins');
const plist = require('@expo/plist').default;
const fs = require('node:fs');
const path = require('node:path');
const { Buffer } = require('node:buffer');
const { buildDailyVerseCatalog } = require('../scripts/lib/daily-verse-catalog.cjs');

const TARGET = 'DailyVerseWidget';
const SOURCES = ['DailyVerseWidget.swift', 'DailyVerseCalendar.swift', 'SharedWidgetAppearance.swift', 'GeneratedDailyVerses.swift'];

function writeWidgetFiles(projectRoot, iosRoot, groupIdentifier) {
  if (!groupIdentifier) throw new Error('Widget appearance requires an App Group identifier');
  const folder = path.join(iosRoot, TARGET);
  const catalog = buildDailyVerseCatalog(projectRoot);
  fs.mkdirSync(folder, { recursive: true });
  for (const file of SOURCES.slice(0, 2)) {
    fs.copyFileSync(path.join(projectRoot, 'widgets/ios', file), path.join(folder, file));
  }
  fs.copyFileSync(path.join(projectRoot, 'modules/bible-widget-appearance/ios/SharedWidgetAppearance.swift'),
    path.join(folder, 'SharedWidgetAppearance.swift'));
  // Base64 avoids Swift literal interpolation/escaping changing source strings.
  const data = Buffer.from(JSON.stringify(catalog.verses)).toString('base64');
  fs.writeFileSync(path.join(folder, 'GeneratedDailyVerses.swift'),
    `// Generated from the pinned reader texts. Do not edit.\nimport Foundation\nlet dailyVerses = try! JSONDecoder().decode([DailyVerse].self, from: Data(base64Encoded: "${data}")!)\n`);
  fs.writeFileSync(path.join(folder, 'Info.plist'), plist.build({
    NSExtension: { NSExtensionPointIdentifier: 'com.apple.widgetkit-extension' },
    BibleWidgetAppGroupIdentifier: groupIdentifier,
  }));
  fs.writeFileSync(path.join(folder, `${TARGET}.entitlements`), plist.build({
    'com.apple.security.application-groups': [groupIdentifier],
  }));
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
  }
  // Update existing generated projects too when a shared source is introduced.
  let groupKey = project.findPBXGroupKey({ name: TARGET });
  if (!groupKey) {
    groupKey = project.addPbxGroup([], TARGET, TARGET).uuid;
    project.addToPbxGroup(groupKey, project.getFirstProject().firstProject.mainGroup);
  }
  for (const file of SOURCES) project.addSourceFile(file, { target: target[0] }, groupKey);
  const attributes = project.getFirstProject().firstProject.attributes;
  attributes.TargetAttributes ??= {};
  for (const id of [firstTarget.uuid, target[0]]) {
    const targetAttributes = attributes.TargetAttributes[id] ??= {};
    targetAttributes.SystemCapabilities ??= {};
    targetAttributes.SystemCapabilities['com.apple.ApplicationGroups'] = { enabled: 1 };
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
      CODE_SIGN_ENTITLEMENTS: `${TARGET}/${TARGET}.entitlements`,
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
  const groupIdentifier = `group.${config.ios.bundleIdentifier}.widgets`;
  config = withInfoPlist(config, (mod) => {
    mod.modResults.BibleWidgetAppGroupIdentifier = groupIdentifier;
    return mod;
  });
  config = withEntitlementsPlist(config, (mod) => {
    mod.modResults['com.apple.security.application-groups'] = [...new Set([
      ...(mod.modResults['com.apple.security.application-groups'] ?? []), groupIdentifier,
    ])];
    return mod;
  });
  config = withDangerousMod(config, ['ios', async (mod) => {
    writeWidgetFiles(mod.modRequest.projectRoot, mod.modRequest.platformProjectRoot, groupIdentifier);
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
