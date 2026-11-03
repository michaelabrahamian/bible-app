Pod::Spec.new do |s|
  s.name = 'BibleDisplayRegions'
  s.version = '1.0.0'
  s.summary = 'Local display division geometry for the Bible reader'
  s.description = s.summary
  s.license = { :type => 'UNLICENSED' }
  s.author = 'Bilingual Bible'
  s.homepage = 'https://github.com/michaelabrahamian/bible-app'
  s.source = { :git => s.homepage }
  s.platform = :ios, '16.4'
  s.swift_version = '5.9'
  s.static_framework = true
  s.source_files = '**/*.{h,m,mm,swift}'
  s.dependency 'ExpoModulesCore'
end
