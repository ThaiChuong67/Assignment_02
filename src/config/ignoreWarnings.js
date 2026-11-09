import { LogBox } from 'react-native';

/**
 * Bỏ qua cảnh báo tư vấn của expo-notifications khi chạy trên Expo Go:
 * "Push notifications (remote notifications) are unavailable in Expo Go on Android since SDK 53. Local notifications remain available."
 *
 * Lưu ý: Ứng dụng E-Commerce của chúng ta chỉ sử dụng Local Notifications (thông báo cục bộ
 * khi đặt hàng thành công) nên hoạt động hoàn toàn bình thường 100%.
 */

LogBox.ignoreLogs([
  '`expo-notifications` functionality is not fully supported in Expo Go',
  '[expo-notifications] Push notifications (remote notifications) are unavailable in Expo Go',
  'Push notifications (remote notifications) are unavailable in Expo Go',
  '`shouldShowAlert` is deprecated',
]);

// Chặn thông báo cảnh báo tư vấn từ việc nạp thư viện expo-notifications trên Expo Go
const originalWarn = console.warn;
console.warn = (...args) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    ((message.includes('expo-notifications') && message.includes('Expo Go')) ||
      message.includes('shouldShowAlert'))
  ) {
    // Bỏ qua cảnh báo tư vấn của Expo Go và thuộc tính deprecated
    return;
  }
  originalWarn(...args);
};

