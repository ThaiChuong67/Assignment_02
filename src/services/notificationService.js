import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Service quản lý quyền (Permissions) và gửi Thông báo nội bộ (Local Notifications)
 * Phục vụ nghiệp vụ: Báo trạng thái đơn hàng khi khách hàng thanh toán thành công.
 */

// Cấu hình cách hiển thị thông báo khi app đang mở (Foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  /**
   * Khởi tạo kênh thông báo (Android Notification Channel)
   */
  async setupNotificationChannel() {
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Đơn hàng & Mua sắm',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      } catch (err) {
        // Expo Go trên Android không cho phép can thiệp channel provider, bỏ qua an toàn
      }
    }
  },

  /**
   * Kiểm tra trạng thái cấp quyền hiện tại
   * @returns {Promise<{ granted: boolean, status: string }>}
   */
  async getPermissionStatus() {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return {
        granted: status === 'granted',
        status: status,
      };
    } catch (error) {
      console.log('[Notification] Lỗi kiểm tra quyền:', error.message);
      return { granted: false, status: 'unknown' };
    }
  },

  /**
   * Yêu cầu người dùng cấp quyền thông báo
   * @returns {Promise<boolean>}
   */
  async requestPermission() {
    try {
      await this.setupNotificationChannel();
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (error) {
      console.log('[Notification] Lỗi xin quyền thông báo:', error.message);
      return false;
    }
  },

  /**
   * Gửi thông báo khi đặt hàng thành công (Business Event)
   * @param {string} orderId Mã đơn hàng
   * @param {number} totalAmount Tổng tiền
   */
  async sendOrderNotification(orderId, totalAmount) {
    try {
      const permission = await this.getPermissionStatus();
      if (!permission.granted) {
        console.log('[Notification] Quyền thông báo bị từ chối, bỏ qua hiển thị notify.');
        return { success: false, reason: 'PERMISSION_DENIED' };
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 Đặt hàng thành công!',
          body: `Mã đơn #${orderId.slice(-6).toUpperCase()} với tổng thanh toán $${totalAmount.toFixed(
            2
          )} đang được xử lý. Cảm ơn bạn!`,
          data: { orderId, screen: 'Orders' },
        },
        trigger: null, // Hiển thị ngay lập tức
      });

      return { success: true };
    } catch (error) {
      console.log('[Notification] Gửi thông báo thất bại:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Gửi thông báo thử nghiệm từ màn hình Settings
   */
  async sendTestNotification() {
    const isGranted = await this.requestPermission();
    if (!isGranted) {
      return { success: false, reason: 'PERMISSION_DENIED' };
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Thông báo kiểm tra',
        body: 'Hệ thống thông báo thông minh của ứng dụng E-Commerce đang hoạt động hoàn hảo!',
        data: { type: 'test' },
      },
      trigger: null,
    });

    return { success: true };
  },
};

