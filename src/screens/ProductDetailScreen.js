import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';

export default function ProductDetailScreen({ route, navigation }) {
  const { productId, initialProduct } = route.params || {};
  const { addToCart } = useCart();

  const [product, setProduct] = useState(initialProduct || null);
  const [isLoading, setIsLoading] = useState(!initialProduct);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Nếu chưa có initialProduct hoặc cần load dữ liệu mới nhất
    if (!product && productId) {
      const loadDetail = async () => {
        try {
          setIsLoading(true);
          const data = await productService.getProductById(productId);
          setProduct(data);
        } catch (err) {
          setError(err.message || 'Không thể tải chi tiết sản phẩm.');
        } finally {
          setIsLoading(false);
        }
      };
      loadDetail();
    }
  }, [productId]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Đang tải thông tin chi tiết...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
        <Text style={styles.errorTitle}>Lỗi tải sản phẩm</Text>
        <Text style={styles.errorDesc}>{error || 'Sản phẩm không tồn tại.'}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Quay lại danh sách</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    Alert.alert('Thành công', `Đã thêm "${product.title}" vào giỏ hàng!`);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Ảnh sản phẩm */}
        <Image source={{ uri: product.thumbnail }} style={styles.image} resizeMode="contain" />

        <View style={styles.infoCard}>
          {/* Tag danh mục & Thương hiệu */}
          <View style={styles.tagRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{product.category?.toUpperCase()}</Text>
            </View>
            {product.brand && (
              <Text style={styles.brandText}>Hãng: {product.brand}</Text>
            )}
          </View>

          {/* Tên sản phẩm */}
          <Text style={styles.title}>{product.title}</Text>

          {/* Giá và Đánh giá */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>${product.price}</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.ratingText}>{product.rating || '4.5'}</Text>
              <Text style={styles.ratingSub}>/ 5.0</Text>
            </View>
          </View>

          <Text style={styles.stockStatus}>
            Trạng thái:{' '}
            <Text style={{ color: product.stock > 0 ? '#10B981' : '#EF4444', fontWeight: '700' }}>
              {product.stock > 0 ? `Còn hàng (${product.stock} sản phẩm)` : 'Hết hàng'}
            </Text>
          </Text>

          {/* Mô tả chi tiết */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Thông tin bổ sung */}
          <View style={styles.specBox}>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Mã định danh (ID):</Text>
              <Text style={styles.specVal}>#{product.id}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Chính sách đổi trả:</Text>
              <Text style={styles.specVal}>{product.returnPolicy || 'Đổi trả miễn phí 30 ngày'}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Bảo hành:</Text>
              <Text style={styles.specVal}>{product.warrantyInformation || 'Bảo hành chính hãng 1 năm'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Add to Cart */}
      <View style={styles.bottomBar}>
        <View style={styles.totalPreview}>
          <Text style={styles.totalLabel}>Giá niêm yết:</Text>
          <Text style={styles.bottomPrice}>${product.price}</Text>
        </View>
        <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
          <Ionicons name="cart" size={18} color="#FFFFFF" />
          <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 90,
  },
  image: {
    width: '100%',
    height: 280,
    backgroundColor: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 6,
    elevation: 3,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    color: '#4F46E5',
    fontSize: 11,
    fontWeight: '700',
  },
  brandText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 26,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: '#DC2626',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    marginLeft: 4,
  },
  ratingSub: {
    fontSize: 11,
    color: '#B45309',
    marginLeft: 2,
  },
  stockStatus: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 16,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  aiButtonContent: {
    flex: 1,
    marginHorizontal: 10,
  },
  aiButtonTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  aiButtonSubtitle: {
    color: '#E9D5FF',
    fontSize: 11,
    marginTop: 2,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  specBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  specVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 74,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  totalPreview: {
    justifyContent: 'center',
  },
  totalLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  bottomPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#DC2626',
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 12,
  },
  errorDesc: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 8,
  },
  backBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

