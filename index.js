// Nạp bộ lọc cảnh báo trước tiên để chặn popup LogBox của expo-notifications trên Expo Go
import './src/config/ignoreWarnings';

import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
