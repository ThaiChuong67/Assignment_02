import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/env';

/**
 * Service quản lý tích hợp Firebase Cloud Firestore cho bài toán E-Commerce:
 * Nghiệp vụ: Lưu trữ và đồng bộ Lịch sử Đơn hàng (Order History) của khách hàng.
 *
 * Tiêu chí thiết kế:
 * 1. Khởi tạo Firebase App an toàn (không bị trùng lặp khi hot-reload).
 * 2. Cung cấp chức năng tạo đơn hàng (Create Order) và xem lịch sử (Get Orders).
 * 3. Fallback Mechanism: Nếu chưa cấu hình Key hoặc mất mạng, tự động lưu offline vào AsyncStorage
 *    giúp ứng dụng KHÔNG BAO GIỜ BỊ CRASH và phản hồi thông báo rõ ràng cho người dùng.
 */

let db = null;
let isFirebaseInitialized = false;

try {
  const firebaseConfig = ENV.FIREBASE_CONFIG;
  // Kiểm tra cấu hình có phải placeholder hay không
  if (
    firebaseConfig &&
    firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.includes('Placeholder')
  ) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    isFirebaseInitialized = true;
    console.log('[Firebase] Đã kết nối Firestore Cloud thành công.');
  } else {
    console.log(
      '[Firebase] Đang chạy chế độ Local-Offline Mode (do cấu hình Firebase chưa điền key thật).'
    );
  }
} catch (error) {
  console.log('[Firebase] Khởi tạo Firebase thất bại, chuyển sang fallback:', error.message);
  isFirebaseInitialized = false;
}

const LOCAL_ORDERS_KEY = '@assignment2_firebase_local_orders';

export const firebaseService = {
  /**
   * Kiểm tra xem Firebase Firestore online đã sẵn sàng chưa
   */
  isOnline() {
    return isFirebaseInitialized && db !== null;
  },

  /**
   * Tạo đơn hàng mới (Nghiệp vụ Checkout)
   * @param {Object} orderData Dữ liệu đơn hàng: items, totalAmount, totalCount, customerName, address
   * @returns {Promise<{ id: string, source: 'firebase' | 'local_fallback', ... }>}
   */
  async createOrder(orderData) {
    const payload = {
      ...orderData,
      createdAt: new Date().toISOString(),
      status: 'Đang xử lý (Processing)',
    };

    // 1. Thử ghi vào Firebase Firestore nếu đã cấu hình
    if (this.isOnline()) {
      try {
        const ordersRef = collection(db, 'orders');
        const docRef = await addDoc(ordersRef, {
          ...payload,
          serverTimestamp: serverTimestamp(),
        });

        console.log('[Firebase] Lưu đơn hàng thành công lên Firestore ID:', docRef.id);
        return {
          id: docRef.id,
          source: 'firebase',
          ...payload,
        };
      } catch (fbError) {
        console.log(
          '[Firebase] Ghi lên Firestore thất bại, chuyển sang lưu fallback:',
          fbError.message
        );
        // Fallback ghi xuống local để bảo toàn dữ liệu người dùng
      }
    }

    // 2. Chế độ Fallback an toàn (Lưu cục bộ khi Firebase lỗi / chưa gắn key)
    try {
      const existing = await AsyncStorage.getItem(LOCAL_ORDERS_KEY);
      const orders = existing ? JSON.parse(existing) : [];
      const newOrder = {
        id: `LOCAL_ORD_${Date.now()}`,
        source: 'local_fallback',
        ...payload,
      };
      orders.unshift(newOrder);
      await AsyncStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
      return newOrder;
    } catch (storageError) {
      console.error('[Firebase] Lỗi lưu fallback:', storageError);
      throw new Error('Không thể lưu đơn hàng. Vui lòng thử lại sau.');
    }
  },

  /**
   * Lấy danh sách lịch sử đơn hàng
   * @returns {Promise<Array>}
   */
  async getOrderHistory() {
    let ordersList = [];

    // Lấy từ Firebase nếu online
    if (this.isOnline()) {
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        snapshot.forEach((doc) => {
          ordersList.push({ id: doc.id, source: 'firebase', ...doc.data() });
        });
        return ordersList;
      } catch (err) {
        console.log('[Firebase] Đọc Firestore lỗi, đọc từ local cache:', err.message);
      }
    }

    // Đọc từ Local Fallback
    try {
      const existing = await AsyncStorage.getItem(LOCAL_ORDERS_KEY);
      if (existing) {
        ordersList = JSON.parse(existing);
      }
    } catch (e) {
      console.error('[Firebase] Lỗi đọc fallback orders:', e);
    }

    return ordersList;
  },

  /**
   * Xóa toàn bộ lịch sử đơn hàng (tiện ích test)
   */
  async clearLocalOrders() {
    await AsyncStorage.removeItem(LOCAL_ORDERS_KEY);
  },
};

