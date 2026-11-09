import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firebaseService } from '../services/firebaseService';

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadOrders = async () => {
    try {
      const data = await firebaseService.getOrderHistory();
      setOrders(data);
    } catch (e) {
      console.log('[OrdersScreen] Lỗi tải đơn hàng:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadOrders();
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      {/* Header đơn hàng */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderCode}>
            Đơn hàng #{item.id ? item.id.slice(-6).toUpperCase() : 'N/A'}
          </Text>
          <Text style={styles.orderDate}>
            {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : 'Vừa xong'}
          </Text>
        </View>

        {/* Badge nhận diện nguồn dữ liệu (Firebase Cloud vs Local Fallback) */}
        <View
          style={[
            styles.sourceBadge,
            item.source === 'firebase' ? styles.sourceFirebase : styles.sourceLocal,
          ]}
        >
          <Ionicons
            name={item.source === 'firebase' ? 'cloud-done-outline' : 'save-outline'}
            size={12}
            color={item.source === 'firebase' ? '#059669' : '#D97706'}
          />
          <Text
            style={[
              styles.sourceBadgeText,
              { color: item.source === 'firebase' ? '#059669' : '#D97706' },
            ]}
          >
            {item.source === 'firebase' ? 'Firebase Cloud' : 'Local Fallback'}
          </Text>
        </View>
      </View>

      {/* Trạng thái đơn */}
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Trạng thái:</Text>
        <Text style={styles.statusVal}>{item.status || 'Đang xử lý'}</Text>
      </View>

      {/* Danh sách các sản phẩm trong đơn */}
      <View style={styles.itemsPreview}>
        {(item.items || []).map((prod, idx) => (
          <View key={idx} style={styles.previewItemRow}>
            {prod.thumbnail && (
              <Image source={{ uri: prod.thumbnail }} style={styles.previewThumb} />
            )}
            <Text style={styles.previewTitle} numberOfLines={1}>
              {prod.title} (x{prod.quantity})
            </Text>
            <Text style={styles.previewPrice}>${(prod.price * prod.quantity).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Footer đơn hàng: Tổng tiền */}
      <View style={styles.cardFooter}>
        <Text style={styles.itemCountText}>Tổng cộng ({item.totalCount || 0} món):</Text>
        <Text style={styles.orderTotal}>${(item.totalAmount || 0).toFixed(2)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Banner thông tin Firebase */}
      <View style={styles.topBanner}>
        <Ionicons name="server-outline" size={18} color="#2563EB" />
        <Text style={styles.topBannerText}>
          {firebaseService.isOnline()
            ? 'Firebase Firestore: Đang kết nối Trực tuyến (Online Sync)'
            : 'Firebase: Chế độ an toàn Local Fallback (Sẵn sàng đồng bộ)'}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Đang đọc dữ liệu đơn hàng...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="receipt-outline" size={70} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>Chưa có lịch sử đơn hàng</Text>
          <Text style={styles.emptySub}>
            Khi bạn đặt hàng từ Giỏ hàng, dữ liệu sẽ được ghi nhận tại đây!
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item, index) => item.id || String(index)}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={['#2563EB']} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  topBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#DBEAFE',
    gap: 8,
  },
  topBannerText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '600',
    flex: 1,
  },
  listContent: {
    padding: 14,
    gap: 12,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    paddingBottom: 8,
  },
  orderCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  orderDate: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  sourceFirebase: {
    backgroundColor: '#D1FAE5',
  },
  sourceLocal: {
    backgroundColor: '#FEF3C7',
  },
  sourceBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    marginLeft: 6,
  },
  itemsPreview: {
    marginTop: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 8,
    gap: 6,
  },
  previewItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewThumb: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 6,
  },
  previewTitle: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
  },
  previewPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
  },
  itemCountText: {
    fontSize: 13,
    color: '#6B7280',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#DC2626',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#6B7280',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#374151',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
});

