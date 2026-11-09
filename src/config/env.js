/**
 * Cấu hình môi trường cho ứng dụng E-Commerce
 */

export const ENV = {
  // Remote Product API (DummyJSON: miễn phí, ổn định, hỗ trợ pagination & search)
  PRODUCT_API_BASE_URL: 'https://dummyjson.com/products',

  // Firebase Configuration
  FIREBASE_CONFIG: {
    apiKey: 'AIzaSyCTEzjnv4X_MsiGfR6r-vo7rs2k9xnWdBY',
    authDomain: 'assignment2-ecommerce.firebaseapp.com',
    projectId: 'assignment2-ecommerce',
    storageBucket: 'assignment2-ecommerce.firebasestorage.app',
    messagingSenderId: '245145649285',
    appId: '1:245145649285:web:6e53eea65dfebac9a569ec',
    measurementId: 'G-CEQFW8Z5N9',
  },
};
