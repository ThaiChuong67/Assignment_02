import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { firebaseService } from '../services/firebaseService';
import { notificationService } from '../services/notificationService';

export default function CartScreen({ navigation }) {
  const { cartItems, updateQuantity, removeFromCart, clearCart, totalCount, totalPrice } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Xử lý Đặt hàng (Checkout) -> Ghi vào Firebase + Gửi Local Notification
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Vui lòng chọn ít nhất 1 sản phẩm trước khi thanh toán.');
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Tạo bản ghi đơn hàng
      const orderPayload = {
        items: cartItems.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          thumbnail: item.thumbnail,
        })),
        totalCount: totalCount,
        totalAmount: totalPrice,
        customerName: 'Sinh viên MMA301',
      };

      // 2. Lưu vào Firebase (có fallback local)
      const createdOrder = await firebaseService.createOrder(orderPayload);

      // 3. Kích hoạt Notification (Nghiệp vụ thông báo sau đơn hàng)
      await notificationService.sendOrderNotification(createdOrder.id, totalPrice);

      // 4. Xóa sạch giỏ hàng & thông báo người dùng
      await clearCart();

      const storageNotice =
        createdOrder.source === 'firebase'
          ? 'Đã đồng bộ lên Firebase Cloud Firestore thành công!'
          : 'Đã lưu đơn hàng vào hệ thống an toàn (Local Fallback Mode).';

      Alert.alert(
        '🎉 Đặt hàng thành công!',
        `Mã đơn hàng: #${createdOrder.id.slice(-6).toUpperCase()}\nTổng tiền: $${totalPrice.toFixed(
          2
        )}\n\n${storageNotice}`,
        [
          {
            text: 'Xem Lịch sử Đơn hàng',
            onPress: () => navigation.navigate('OrdersTab'),
          },
          { text: 'Tiếp tục mua sắm', style: 'cancel' },
        ]
      );
    } catch (err) {
      Alert.alert('Lỗi đặt hàng', err.message || 'Không thể hoàn tất đơn hàng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartCard}>
      <Image source={{ uri: item.thumbnail }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.itemPrice}>${item.price}</Text>

        <View style={styles.quantityContainer}>
          {/* Nút giảm số lượng (nếu về 0 sẽ tự xóa) */}
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateQuantity(item.id, -1)}
          >
            <Ionicons name="remove" size={16} color="#374151" />
          </TouchableOpacity>

          <Text style={styles.qtyText}>{item.quantity}</Text>

          {/* Nút tăng số lượng */}
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateQuantity(item.id, 1)}
          >
            <Ionicons name="add" size={16} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Nút xóa hẳn khỏi giỏ hàng */}
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() =>
          Alert.alert(
            'Xác nhận xóa',
            `Bạn có chắc muốn xóa "${item.title}" khỏi giỏ hàng?`,
            [
              { text: 'Hủy', style: 'cancel' },
              { text: 'Xóa', style: 'destructive', onPress: () => removeFromCart(item.id) },
            ]
          )
        }
      >
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Giỏ hàng đang trống</Text>
          <Text style={styles.emptySub}>Hãy thêm sản phẩm từ Danh mục để tiến hành đặt hàng!</Text>
          <TouchableOpacity
            style={styles.shopNowBtn}
            onPress={() => navigation.navigate('CatalogTab')}
          >
            <Text style={styles.shopNowText}>Khám phá sản phẩm ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderCartItem}
            contentContainerStyle={styles.listContent}
          />

          {/* Checkout Footer with Derived Totals */}
          <View style={styles.checkoutFooter}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tổng số lượng món:</Text>
              <Text style={styles.summaryValue}>{totalCount} món</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.totalPriceLabel}>Tổng thanh toán:</Text>
              <Text style={styles.totalPriceValue}>${totalPrice.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={[styles.checkoutBtn, isSubmitting && styles.checkoutBtnDisabled]}
              onPress={handleCheckout}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="card-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.checkoutBtnText}>Xác nhận Đặt hàng (Firebase Sync)</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  listContent: {
    padding: 14,
    paddingBottom: 160,
    gap: 12,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  qtyBtn: {
    padding: 6,
    paddingHorizontal: 8,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 8,
    color: '#1F2937',
  },
  deleteBtn: {
    padding: 8,
  },
  checkoutFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 6,
    elevation: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  totalPriceLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  totalPriceValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#DC2626',
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
    gap: 8,
  },
  checkoutBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginTop: 14,
  },
  emptySub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  shopNowBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopNowText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

