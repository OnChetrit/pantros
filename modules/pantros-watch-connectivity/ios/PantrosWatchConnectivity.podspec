Pod::Spec.new do |s|
  s.name           = 'PantrosWatchConnectivity'
  s.version        = '1.0.0'
  s.summary        = 'WatchConnectivity bridge for Pantros'
  s.description    = 'Native WatchConnectivity transport for the Pantros iPhone companion.'
  s.author         = { 'Pantros' => 'on.chetrit' }
  s.homepage       = 'https://github.com/onchetrit/pantros'
  s.source         = { :git => 'https://github.com/onchetrit/pantros.git', :tag => s.version.to_s }
  s.license        = { :type => 'MIT' }
  s.platforms      = { :ios => '16.4' }
  s.source_files   = '**/*.{h,m,mm,swift}'
  s.dependency 'ExpoModulesCore'
end
