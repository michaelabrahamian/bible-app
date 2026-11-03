Pod::Spec.new do |s|
  s.name = 'BibleWidgetAppearance'
  s.version = '1.0.0'
  s.summary = 'Shares app appearance with Bible widgets'
  s.description = s.summary
  s.license = { :type => 'UNLICENSED' }
  s.author = 'Bilingual Bible'
  s.homepage = 'https://github.com/michaelabrahamian/bible-app'
  s.source = { :git => s.homepage }
  s.platform = :ios, '16.4'
  s.swift_version = '5.9'
  s.static_framework = true
  s.source_files = '**/*.swift'
  s.frameworks = 'WidgetKit'
  s.dependency 'ExpoModulesCore'
end
