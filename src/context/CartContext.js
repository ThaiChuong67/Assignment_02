import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_STORAGE_KEY = '@assignment2_cart_storage';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoadingStorage, setIsLoadingStorage] = useState(true);

  // 1. Phục hồi giỏ hàng từ AsyncStorage khi ứng dụng khởi động
  useEffect(() => {
    const restoreCart = async () => {
      try {
        const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
          const parsed = JSON.parse(storedCart);
          if (Array.isArray(parsed)) {
            setCartItems(parsed);
          }
        }
      } catch (error) {
        console.error('[CartContext] Lỗi phục hồi giỏ hàng:', error);
      } finally {
        setIsLoadingStorage(false);
      }
    };

    restoreCart();
  }, []);

  // 2. Tự động lưu giỏ hàng vào AsyncStorage mỗi khi cartItems thay đổi
  const saveCartToStorage = async (items) => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('[CartContext] Lỗi lưu giỏ hàng vào storage:', error);
    }
  };

  /**
   * Thêm sản phẩm vào giỏ hàng (nếu đã có thì tăng số lượng)
   */
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === product.id);
      let updated;
      if (existingIndex > -1) {
        updated = prevItems.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updated = [...prevItems, { ...product, quantity: 1 }];
      }
      saveCartToStorage(updated);
      return updated;
    });
  };

  /**
   * Cập nhật số lượng sản phẩm (+1 hoặc -1). Nếu số lượng <= 0 thì tự xóa.
   */
  const updateQuantity = (productId, delta) => {
    setCartItems((prevItems) => {
      const updated = prevItems
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);

      saveCartToStorage(updated);
      return updated;
    });
  };

  /**
   * Xóa hẳn sản phẩm khỏi giỏ hàng
   */
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => {
      const updated = prevItems.filter((item) => item.id !== productId);
      saveCartToStorage(updated);
      return updated;
    });
  };

  /**
   * Xóa sạch giỏ hàng (sau khi Checkout thành công)
   */
  const clearCart = async () => {
    setCartItems([]);
    await AsyncStorage.removeItem(CART_STORAGE_KEY);
  };

  /**
   * DERIVED TOTALS:
   * Tính toán trực tiếp từ cartItems (Derived state), KHÔNG lưu state rời rạc
   * để đảm bảo dữ liệu luôn nhất quán (Single Source of Truth).
   */
  const totalCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  }, [cartItems]);

  const totalPrice = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + (Number(item.price) || 0) * (item.quantity || 1),
      0
    );
  }, [cartItems]);

  const value = {
    cartItems,
    isLoadingStorage,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalCount,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart phải được sử dụng bên trong CartProvider');
  }
  return context;
};

