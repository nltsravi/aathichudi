const fs = require('fs');
const path = require('path');

const target1 = path.resolve(
  __dirname,
  '../node_modules/expo-notifications/build/TopicSubscriptionModule.android.js'
);
if (fs.existsSync(target1)) {
  const content = `import { requireOptionalNativeModule } from 'expo';
let nativeModule = null;
try {
  nativeModule = requireOptionalNativeModule('ExpoTopicSubscriptionModule');
} catch (e) {
  nativeModule = null;
}
export default nativeModule || {
  addListener: () => {},
  removeListeners: () => {},
  subscribeToTopicAsync: () => Promise.resolve(),
  unsubscribeFromTopicAsync: () => Promise.resolve(),
};
`;
  fs.writeFileSync(target1, content, 'utf8');
  console.log('Patched TopicSubscriptionModule.android.js for Expo Go compatibility');
}

const target2 = path.resolve(
  __dirname,
  '../node_modules/expo-notifications/build/ServerRegistrationModule.native.js'
);
if (fs.existsSync(target2)) {
  const content = `import { requireOptionalNativeModule } from 'expo';
let nativeModule = null;
try {
  nativeModule = requireOptionalNativeModule('NotificationsServerRegistrationModule');
} catch (e) {
  nativeModule = null;
}
export default nativeModule || {
  addListener: () => {},
  removeListeners: () => {},
  getRegistrationInfoAsync: () => Promise.resolve(null),
  setRegistrationInfoAsync: () => Promise.resolve(),
};
`;
  fs.writeFileSync(target2, content, 'utf8');
  console.log('Patched ServerRegistrationModule.native.js for Expo Go compatibility');
}
