/** @type {import('@bacons/apple-targets/app.plugin').Config} */
module.exports = {
  type: 'watch',
  name: 'PantrosWatch',
  displayName: 'Pantros',
  bundleIdentifier: '.watch',
  icon: '../../assets/images/icon.png',
  deploymentTarget: '10.0',
  frameworks: ['SwiftUI', 'WatchConnectivity'],
  colors: {
    $accent: '#2D6A4F',
  },
};
