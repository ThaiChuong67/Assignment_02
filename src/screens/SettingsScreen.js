import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { notificationService } from '../services/notificationService';
import { firebaseService } from '../services/firebaseService';

export default function SettingsScreen() {
  const [permissionStatus, setPermissionStatus] = useState('Đang kiểm tra...');
  const [isGranted, setIsGranted] = useState(false);

  const checkStatus = async () => {
    const res = await notificationService.getPermissionStatus();
    setIsGranted(res.granted);
    if (res.granted) {
      setPermissionStatus('Đã cấp quyền (Granted)');
    } else if (res.status === 'denied') {
      setPermissionStatus('Bị từ chối (Denied)');
    } else {
      setPermissionStatus('Chưa xác định (Undetermined)');
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission();
    await checkStatus();
    if (granted) {
      Alert.alert('Thành công', 'Đã cấp quyền thông báo thành công cho ứng dụng!');
    } else {
      Alert.alert(
        'Từ chối quyền',
        'Quyền thông báo chưa được cấp. Bạn vẫn có thể tiếp tục sử dụng ứng dụng bình thường mà không bị gián đoạn.'
      );
    }
  };

  const handleSendTestNotification = async () => {
    const result = await notificationService.sendTestNotification();
    if (result.success) {
      Alert.alert('Đã gửi thông báo', 'Hãy vuốt thanh thông báo của điện thoại để xem!');
    } else {
      Alert.alert(
        'Không thể gửi thông báo',
        'Cần cấp quyền thông báo trước khi nhận thông báo từ hệ thống.'
      );
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Xóa bộ nhớ đệm',
      'Bạn có muốn xóa dữ liệu đơn hàng cục bộ để kiểm tra từ đầu?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa ngay',
          style: 'destructive',
          onPress: async () => {
            await firebaseService.clearLocalOrders();
            Alert.alert('Đã xóa', 'Bộ nhớ đệm đơn hàng cục bộ đã được làm mới.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Box Quản lý Thông báo */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="notifications" size={22} color="#2563EB" />
          <Text style={styles.cardTitle}>Quản lý Thông báo (Notifications)</Text>
        </View>
        <Text style={styles.cardDesc}>
          Ứng dụng sử dụng thông báo cục bộ để thông tin tới khách hàng ngay khi đơn hàng được tạo
          thành công (Order Fulfillment Event).
        </Text>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Trạng thái quyền thông báo:</Text>
          <View
            style={[
              styles.statusBadge,
              isGranted ? styles.statusBadgeGranted : styles.statusBadgeDenied,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                { color: isGranted ? '#059669' : '#DC2626' },
              ]}
            >
              {permissionStatus}
            </Text>
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleRequestPermission}
          >
            <Ionicons name="shield-checkmark-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Yêu cầu cấp quyền thông báo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={handleSendTestNotification}
          >
            <Ionicons name="paper-plane-outline" size={18} color="#2563EB" />
            <Text style={styles.secondaryBtnText}>Gửi thông báo kiểm tra (Test Alert)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Box Kiến trúc Hệ thống & Tích hợp */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="cube-outline" size={22} color="#059669" />
          <Text style={styles.cardTitle}>Thông tin Tích hợp Hệ thống</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Mã môn học:</Text>
          <Text style={styles.infoVal}>MMA301 - Multiplatform Mobile App</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Nền tảng:</Text>
          <Text style={styles.infoVal}>React Native 0.86 + Expo SDK 57</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Remote Catalog API:</Text>
          <Text style={styles.infoVal}>DummyJSON Products (Pagination & Search)</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>State Management:</Text>
          <Text style={styles.infoVal}>Context API + Derived Totals</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Persistent Storage:</Text>
          <Text style={styles.infoVal}>AsyncStorage (Cart State)</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Firebase Backend:</Text>
          <Text style={styles.infoVal}>
            {firebaseService.isOnline() ? 'Cloud Firestore' : 'Safe Fallback Cache'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>AI Integration:</Text>
          <Text style={styles.infoVal}>Gemini 1.5 Flash + Catalog Validator</Text>
        </View>
      </View>

      {/* Box Tiện ích Kiểm thử / Reset */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="build-outline" size={22} color="#DC2626" />
          <Text style={styles.cardTitle}>Tiện ích Kiểm thử & Dọn dẹp</Text>
        </View>
        <TouchableOpacity style={styles.dangerBtn} onPress={handleClearCache}>
          <Ionicons name="trash-bin-outline" size={18} color="#FFFFFF" />
          <Text style={styles.dangerBtnText}>Xóa lịch sử đơn hàng bộ nhớ đệm</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 14,
    gap: 14,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  cardDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 19,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  statusLabel: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeGranted: {
    backgroundColor: '#D1FAE5',
  },
  statusBadgeDenied: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  buttonGroup: {
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  secondaryBtnText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  infoKey: {
    fontSize: 12,
    color: '#6B7280',
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    maxWidth: '65%',
    textAlign: 'right',
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 6,
  },
  dangerBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
});

