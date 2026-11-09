import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';

import ProductListScreen from '../screens/ProductListScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/OrdersScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Stack Danh mục sản phẩm (List -> Detail)
function CatalogStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#1F2937',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{ title: 'Cửa hàng trực tuyến' }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Chi tiết sản phẩm' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { totalCount } = useCart();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'CatalogTab') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          } else if (route.name === 'CartTab') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'OrdersTab') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'SettingsTab') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTitleStyle: { fontWeight: '700' },
      })}
    >
      <Tab.Screen
        name="CatalogTab"
        component={CatalogStack}
        options={{ headerShown: false, tabBarLabel: 'Sản phẩm' }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          title: 'Giỏ hàng của bạn',
          tabBarLabel: 'Giỏ hàng',
          tabBarBadge: totalCount > 0 ? totalCount : undefined,
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersScreen}
        options={{
          title: 'Lịch sử Đơn hàng (Firebase)',
          tabBarLabel: 'Đơn hàng',
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          title: 'Cài đặt & Thông báo',
          tabBarLabel: 'Cài đặt',
        }}
      />
    </Tab.Navigator>
  );
}
