import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';

const PAGE_SIZE = 10;

export default function ProductListScreen({ navigation }) {
  const { addToCart } = useCart();

  // State quản lý danh sách và phân trang
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default'); // 'default', 'price_asc', 'price_desc', 'rating'
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);

  // Trạng thái tải & lỗi
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Search debounce ref
  const searchTimeoutRef = useRef(null);

  // 1. Tải danh mục khi khởi tạo
  useEffect(() => {
    const loadCategories = async () => {
      const cats = await productService.getCategories();
      setCategories(cats);
    };
    loadCategories();
  }, []);

  // 2. Hàm gọi API lấy sản phẩm
  const fetchProducts = useCallback(
    async ({ newSkip = 0, append = false, search = searchQuery, cat = selectedCategory } = {}) => {
      try {
        setErrorMessage(null);
        if (!append) {
          setIsLoadingInitial(true);
        } else {
          setIsLoadingMore(true);
        }

        const data = await productService.getProducts({
          limit: PAGE_SIZE,
          skip: newSkip,
          search: search,
          category: cat,
        });

        if (append) {
          setProducts((prev) => [...prev, ...data.products]);
        } else {
          setProducts(data.products);
        }

        setSkip(newSkip + data.products.length);
        setTotal(data.total);
      } catch (err) {
        setErrorMessage(err.message || 'Không thể tải danh sách sản phẩm');
      } finally {
        setIsLoadingInitial(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [searchQuery, selectedCategory]
  );

  // 3. Khởi chạy fetch khi đổi category hoặc tìm kiếm
  useEffect(() => {
    fetchProducts({ newSkip: 0, append: false });
  }, [selectedCategory]);

  // Xử lý tìm kiếm có debounce (tránh gọi API liên tục khi đang gõ)
  const handleSearchChange = (text) => {
    setSearchQuery(text);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      fetchProducts({ newSkip: 0, append: false, search: text });
    }, 400);
  };

  // Pull-to-refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchProducts({ newSkip: 0, append: false });
  };

  // 4. Phân trang vô hạn (Infinite Scroll): CÓ GUARD CHỐNG GỌI LẶP
  const handleLoadMore = () => {
    // Guard quan trọng: Không load tiếp nếu đang tải, hoặc đã hết dữ liệu
    if (isLoadingMore || isLoadingInitial || isRefreshing) return;
    if (products.length >= total) return;

    fetchProducts({ newSkip: skip, append: true });
  };

  // Dữ liệu hiển thị (Displayed Data) sau khi Sort - Tách biệt với Source Data (products)
  const displayedProducts = useMemo(() => {
    if (sortBy === 'price_asc') {
      return [...products].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    }
    if (sortBy === 'price_desc') {
      return [...products].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    }
    if (sortBy === 'rating') {
      return [...products].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    }
    return products;
  }, [products, sortBy]);

  // Render Footer của FlatList
  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color="#2563EB" />
          <Text style={styles.footerText}>Đang tải thêm sản phẩm...</Text>
        </View>
      );
    }
    if (products.length > 0 && products.length >= total) {
      return (
        <View style={styles.footerLoader}>
          <Text style={styles.footerText}>✓ Bạn đã xem hết {total} sản phẩm</Text>
        </View>
      );
    }
    return null;
  };

  // Render từng sản phẩm
  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id, initialProduct: item })}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.cardImage} resizeMode="cover" />
      <View style={styles.cardInfo}>
        <Text style={styles.cardCategory}>{item.category?.toUpperCase()}</Text>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.ratingText}>{item.rating || '4.5'}</Text>
          <Text style={styles.stockText}>Kho: {item.stock}</Text>
        </View>
        <View style={styles.cardBottom}>
          <Text style={styles.price}>${item.price}</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              addToCart(item);
            }}
          >
            <Ionicons name="cart-outline" size={16} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Thêm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Thanh tìm kiếm */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm theo tên..."
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholderTextColor="#9CA3AF"
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              fetchProducts({ newSkip: 0, append: false, search: '' });
            }}
          >
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Danh mục lọc (Filter Chips) */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>
                {cat === 'all' ? 'Tất cả' : cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Thanh Sắp xếp (Sort Bar - Phục vụ Transfer Task) */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sắp xếp:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortScroll}>
          <TouchableOpacity
            style={[styles.sortChip, sortBy === 'default' && styles.sortChipActive]}
            onPress={() => setSortBy('default')}
          >
            <Text style={[styles.sortChipText, sortBy === 'default' && styles.sortChipTextActive]}>
              Mặc định
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortChip, sortBy === 'price_asc' && styles.sortChipActive]}
            onPress={() => setSortBy('price_asc')}
          >
            <Text style={[styles.sortChipText, sortBy === 'price_asc' && styles.sortChipTextActive]}>
              Giá: Thấp → Cao
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortChip, sortBy === 'price_desc' && styles.sortChipActive]}
            onPress={() => setSortBy('price_desc')}
          >
            <Text style={[styles.sortChipText, sortBy === 'price_desc' && styles.sortChipTextActive]}>
              Giá: Cao → Thấp
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortChip, sortBy === 'rating' && styles.sortChipActive]}
            onPress={() => setSortBy('rating')}
          >
            <Text style={[styles.sortChipText, sortBy === 'rating' && styles.sortChipTextActive]}>
              Đánh giá ★
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Xử lý Trạng thái: Lỗi kết nối -> Hiển thị nút Thử lại (Retry) */}
      {errorMessage ? (
        <View style={styles.centerContainer}>
          <Ionicons name="cloud-offline-outline" size={60} color="#EF4444" />
          <Text style={styles.errorTitle}>Lỗi kết nối</Text>
          <Text style={styles.errorDescription}>{errorMessage}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => fetchProducts({ newSkip: 0, append: false })}
          >
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : isLoadingInitial ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Đang tải sản phẩm từ máy chủ...</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="cube-outline" size={60} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>Không tìm thấy sản phẩm</Text>
          <Text style={styles.emptyDescription}>Vui lòng thử từ khóa khác hoặc chuyển danh mục.</Text>
        </View>
      ) : (
        /* Danh sách chính: FlatList */
        <FlatList
          data={displayedProducts}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProductItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={['#2563EB']} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFooter}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  categoryContainer: {
    marginBottom: 8,
  },
  categoryScroll: {
    paddingHorizontal: 14,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: '#2563EB',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  sortLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginRight: 6,
  },
  sortScroll: {
    gap: 6,
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sortChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  sortChipText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  sortChipTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 20,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  cardCategory: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 4,
  },
  stockText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 12,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 12,
  },
  errorDescription: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
  },
  emptyDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});

