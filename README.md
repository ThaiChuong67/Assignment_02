# MMA301 - ASSIGNMENT 2: INTEGRATED E-COMMERCE MOBILE APP
> **Học phần:** MMA301 – Multiplatform Mobile App Development  
> **Nền tảng:** React Native 0.86 + Expo SDK 57 (JavaScript)  
> **Kiến trúc:** Layered Architecture (Screen - Hook/State - Service - Storage/Cloud)  
> **Tích hợp:** Remote API (DummyJSON) • Context API • AsyncStorage • Firebase Firestore • Local Notifications  

---

## 1. TỔNG QUAN DỰ ÁN & WORKFLOW CHÍNH

### 1.1 Luồng nghiệp vụ cốt lõi (Core Business Workflow)
1. **Startup (Khởi động):**
   - `CartProvider` tự động phục hồi trạng thái giỏ hàng từ bộ nhớ lưu trữ bền vững `AsyncStorage`.
   - `ProductListScreen` gọi `productService.getProducts()` lấy danh mục ban đầu (limit 10, skip 0).
2. **Browse / Search / Filter (Duyệt & Tìm kiếm):**
   - Hiển thị qua `FlatList` với phân trang vô hạn (**Infinite Scroll**).
   - Tích hợp thanh tìm kiếm thời gian thực (Debounced search), thanh lọc danh mục (Category chips) và kéo để làm mới (**Pull-to-refresh**).
   - Xử lý đủ 4 trạng thái giao diện: **Loading** (đang tải), **Data** (có hàng), **Empty** (không tìm thấy), **Error** (mất mạng + nút Thử lại).
3. **Product Detail (Chi tiết sản phẩm):**
   - Xem thông tin toàn diện: ảnh, thương hiệu, đánh giá sao, tồn kho, bảo hành, chính sách đổi trả.
   - Nút **Thêm vào giỏ hàng**.
4. **Cart & Derived State (Giỏ hàng & Tính toán):**
   - Quản lý qua React Context API (`useCart`). Thao tác Thêm, Tăng (+), Giảm (-), Xóa.
   - **Derived Totals:** Tổng số lượng sản phẩm (`totalCount`) và Tổng tiền thanh toán (`totalPrice`) được tính toán trực tiếp từ `cartItems` (Single Source of Truth), tự động đồng bộ xuống `AsyncStorage`.
5. **Firebase Cloud Persistence (Lưu trữ đơn hàng):**
   - Khi bấm **Xác nhận Đặt hàng**, `firebaseService.createOrder()` lưu bản ghi đơn hàng lên **Firebase Cloud Firestore** (collection `orders`).
   - Có cơ chế **Local Fallback Mode** tự động: nếu mất mạng, đơn hàng vẫn được lưu an toàn và hiển thị ở màn hình Lịch sử Đơn hàng mà **không bao giờ crash app**.
6. **Business Notification Workflow (Thông báo đơn hàng):**
   - Ngay sau khi đặt hàng thành công, kích hoạt `notificationService.sendOrderNotification()`.
   - Kiểm tra quyền (`granted`/`denied`) qua `expo-notifications`. Nếu bị từ chối quyền, app vẫn hoàn tất đơn hàng bình thường và thông báo rõ ràng trên giao diện.

---

## 2. BẢNG TRUY XUẤT YÊU CẦU (REQUIREMENT TRACEABILITY MATRIX - RTM)

| ID | Yêu cầu | Thành phần UI / Code chịu trách nhiệm | Test Case & Kiểm chứng tối thiểu |
| :--- | :--- | :--- | :--- |
| **R01** | Remote product data | `src/services/productService.js` | Tải dữ liệu DummyJSON thành công; ngắt mạng hiện thông báo lỗi. |
| **R02** | FlatList + pagination | `src/screens/ProductListScreen.js` | Cuộn đến cuối danh sách gọi trang tiếp theo; hết dữ liệu hiện footer kết thúc. |
| **R03** | Search/filter + refresh | `ProductListScreen.js` | Gõ từ khóa lọc đúng; chọn category chip lọc đúng; vuốt kéo refresh nạp lại. |
| **R04** | Product detail | `src/screens/ProductDetailScreen.js` | Mở đúng ID sản phẩm; kiểm tra fallback khi ID không hợp lệ. |
| **R05** | Cart state | `src/context/CartContext.js` | Thêm mới, tăng số lượng, giảm về 0 tự xóa, xóa hẳn món đồ. |
| **R06** | Derived totals | `CartContext.js` (`useMemo`) | Tổng số món và tổng tiền luôn khớp chính xác theo từng thay đổi số lượng. |
| **R07** | Persistence | `@react-native-async-storage/async-storage` | Thoát ứng dụng hoàn toàn / reload, mở lại giỏ hàng vẫn còn nguyên. |
| **R08** | Firebase use case | `src/services/firebaseService.js` | Ghi đơn hàng mới vào Firestore; đọc hiển thị tại `OrdersScreen.js`. |
| **R09** | Notification flow | `src/services/notificationService.js` | Xin quyền thông báo; gửi local notification khi checkout; xử lý khi bị từ chối. |
| **R10** | Gemini AI integration | `src/services/aiService.js`, `AIAssistantScreen.js` | Gửi prompt có catalog context; validate ID gợi ý; fallback khi mất mạng/thiếu key. |
| **R11** | Debug evidence | `README.md` (Mục 7) | Ghi nhận 2 lỗi thực tế: vòng lặp onEndReached & parse số tiền giỏ hàng. |
| **R12** | Release build | `app.json`, `eas.json` | Cấu hình Android Package, Permissions và quy trình build APK độc lập. |

---

## 3. THIẾT KẾ KIẾN TRÚC & QUYẾT ĐỊNH KỸ THUẬT (DESIGN DECISION RECORD)

### 3.1 Cấu trúc phân lớp (Separation of Concerns)
```
Assignment_02/
├── App.js                         # Root component, bọc Navigation, Safe Area, CartProvider
├── app.json                       # Cấu hình Expo, Android package, Permissions, Notification plugins
├── eas.json                       # Cấu hình EAS Build tạo Android APK Release
├── package.json                   # Dependencies chuẩn Expo SDK 57 (React Native 0.86, React 19)
└── src/
    ├── config/
    │   ├── env.js                 # Cấu hình API endpoints & Firebase configuration
    │   └── ignoreWarnings.js      # Bộ lọc cảnh báo LogBox cho Expo Go
    ├── context/
    │   └── CartContext.js         # Quản lý State giỏ hàng, Derived Totals & AsyncStorage
    ├── services/
    │   ├── productService.js      # Giao tiếp Remote API DummyJSON (Fetch, Search, Category)
    │   ├── firebaseService.js     # Giao tiếp Firebase Firestore Cloud & Local Fallback Cache
    │   └── notificationService.js # Quản lý quyền và gửi Local Push Notifications
    ├── screens/
    │   ├── ProductListScreen.js   # Danh mục, FlatList phân trang, Tìm kiếm, Lọc, Pull-refresh, Sort
    │   ├── ProductDetailScreen.js # Chi tiết sản phẩm, nút thêm giỏ
    │   ├── CartScreen.js          # Giỏ hàng, nút tăng/giảm số lượng, thanh toán & đặt hàng
    │   ├── OrdersScreen.js        # Lịch sử đơn hàng đồng bộ từ Firebase Cloud / Local Cache
    │   └── SettingsScreen.js      # Kiểm tra & xin quyền thông báo, gửi test notification
    └── navigation/
        └── AppNavigator.js        # Bottom Tabs (4 Tabs) kết hợp Native Stack Navigator
```

### 3.2 Bảng các quyết định thiết kế then chốt (Design Decisions)
| Quyết định | Lựa chọn kỹ thuật | Lý do lựa chọn | Tác động nếu đổi yêu cầu |
| :--- | :--- | :--- | :--- |
| **1. State Management** | React Context API | Đơn giản, nhẹ, đủ đáp ứng toàn diện giỏ hàng mà không cần cài thêm Redux nặng nề. | Nếu app mở rộng đa luồng phức tạp (user session, chat) có thể nâng lên Redux Toolkit mà không sửa tầng UI. |
| **2. API / Service Layer** | Module độc lập (`productService.js`) | Phân tách logic fetch ra khỏi UI; UI chỉ nhận data hoặc bắt lỗi hiển thị nút Retry. | Dễ dàng đổi endpoint từ DummyJSON sang backend tự host của giảng viên chỉ bằng 1 dòng URL. |
| **3. Pagination Strategy** | `limit` & `skip` trên API DummyJSON | Chuẩn RESTful, kiểm soát chính xác vị trí phân trang và tổng số lượng (`total`). | Nếu đổi sang Cursor-based chỉ cần sửa hàm fetch trong `productService.js`. |
| **4. Persistence** | `AsyncStorage` | Thư viện lưu trữ chuẩn mực, bất đồng bộ, bảo toàn giỏ hàng qua các phiên mở app. | Nếu cần truy vấn dữ liệu quan hệ phức tạp có thể thay bằng SQLite. |
| **5. Firebase Use Case** | Cloud Firestore (`orders` collection) | Quản lý lịch sử đặt hàng của khách hàng sau khi thanh toán giỏ hàng; có fallback local. | Có thể bổ sung thêm use case `wishlist` mà vẫn tái sử dụng chung `firebaseService`. |

---

## 4. HƯỚNG DẪN CÀI ĐẶT & CHẠY ỨNG DỤNG (SETUP GUIDE)

### 4.1 Yêu cầu môi trường
- **Node.js:** v18 trở lên (Khuyến nghị Node LTS hoặc v20+; dự án tương thích Node v26).
- **Trình quản lý gói:** `npm` hoặc `npx`.
- **Thiết bị chạy:** Ứng dụng **Expo Go** trên điện thoại Android/iOS, hoặc máy ảo Android Emulator.

### 4.2 Các bước chạy dự án
```bash
# 1. Di chuyển vào thư mục Assignment_02
cd d:\Studylesson\ki7\MMA\Assignment_02

# 2. Cài đặt các gói phụ thuộc (nếu chưa cài)
npm install

# 3. Khởi chạy Expo Server
npx expo start
```
- Quét mã QR bằng ứng dụng **Expo Go** trên điện thoại Android hoặc mở trên máy ảo bằng phím `a`.

### 4.3 Cấu hình Secret / API Key (Bảo mật - Không commit key thật)
File cấu hình nằm tại `src/config/env.js`:
- **Gemini API:** Lấy key miễn phí tại [Google AI Studio](https://aistudio.google.com/). Dán vào `GEMINI_API_KEY`.  
  *(Lưu ý: Nếu để trống key, ứng dụng tự kích hoạt **Intelligent Fallback Mode**, vẫn hoạt động 100% mượt mà để chấm điểm mà không bị lỗi).*
- **Firebase:** Dán cấu hình từ Firebase Console vào `FIREBASE_CONFIG`.  
  *(Nếu để placeholder mặc định, app tự lưu vào **Local Fallback Cache** và hiển thị huy hiệu nhận diện rõ ràng).*

---

## 5. MA TRẬN KIỂM THỬ (TEST MATRIX - 15 CASES)

| # | Nhóm | Trường hợp kiểm thử | Thao tác thực hiện | Kết quả mong đợi | Kết quả thực tế |
| :-: | :--- | :--- | :--- | :--- | :-: |
| 1 | API | Catalog Success | Mở tab "Sản phẩm" khi có mạng | Hiển thị 10 sản phẩm đầu tiên kèm ảnh, giá, rating | ĐẠT (Pass) |
| 2 | API | Network Error | Tắt WiFi/Dữ liệu di động rồi mở app | Hiện biểu tượng mất mạng + mô tả lỗi + nút "Thử lại" | ĐẠT (Pass) |
| 3 | List | Empty State | Tìm kiếm từ khóa vô nghĩa (ví dụ `xyz123456`) | Hiển thị thông báo "Không tìm thấy sản phẩm" rõ ràng | ĐẠT (Pass) |
| 4 | Pagination | End of List | Cuộn FlatList xuống cuối trang nhiều lần | Tải thêm trang mới mượt mà; đến cuối hiện "✓ Bạn đã xem hết..." | ĐẠT (Pass) |
| 5 | Search | Realtime Filter | Gõ từ khóa "phone" vào ô tìm kiếm | Danh sách cập nhật sản phẩm liên quan; bấm (x) xóa tìm kiếm | ĐẠT (Pass) |
| 6 | Cart | Add Same Item | Nhấn "Thêm" cùng 1 sản phẩm 2 lần | Giỏ hàng chỉ có 1 dòng, số lượng là 2, tổng tiền nhân đôi | ĐẠT (Pass) |
| 7 | Cart | Quantity 0 / Remove | Bấm nút (-) khi sản phẩm có số lượng 1 | Sản phẩm tự động bị xóa khỏi giỏ hàng; tổng tiền cập nhật | ĐẠT (Pass) |
| 8 | Persistence | App Restart | Thêm đồ vào giỏ $\rightarrow$ đóng hẳn app $\rightarrow$ mở lại | Giỏ hàng được phục hồi chính xác từ AsyncStorage | ĐẠT (Pass) |
| 9 | Firebase | Create Order | Bấm "Xác nhận Đặt hàng" trong Cart | Đơn hàng được lưu; xuất hiện trong tab "Lịch sử Đơn hàng" | ĐẠT (Pass) |
| 10 | Firebase | Error / Fallback | Chưa điền Firebase key thật hoặc ngắt mạng | Đơn hàng lưu an toàn vào Local Fallback Cache, không crash | ĐẠT (Pass) |
| 11 | Notification | Deny Permission | Vào Cài đặt $\rightarrow$ Từ chối cấp quyền thông báo | App thông báo rõ ràng về trạng thái từ chối, không crash | ĐẠT (Pass) |
| 12 | Notification | Trigger Business Event | Đặt hàng thành công khi đã cấp quyền | Thanh thông báo điện thoại hiển thị thông báo mã đơn hàng | ĐẠT (Pass) |
| 13 | Gemini | Valid Response | Bấm "Hỏi trợ lý Gemini AI" từ trang chi tiết | Nhận lời tư vấn và danh sách sản phẩm gợi ý khớp catalog | ĐẠT (Pass) |
| 14 | Gemini | Timeout / Error | Gọi AI khi mất mạng hoặc không có key | Kích hoạt Fallback thông minh, hiển thị sản phẩm liên quan | ĐẠT (Pass) |
| 15 | Release | Production Build | Chạy lệnh xuất bản build Metro bundle | Bundle thành công 1006 modules cho cả Android & iOS | ĐẠT (Pass) |

---

## 6. HƯỚNG DẪN TRẢ LỜI PHỎNG VẤN VÀ MỞ SOURCE (CODE EXPLANATION)

### 6.1 Mở file trong $\le 30$ giây khi Giảng viên yêu cầu
- **Product service & fetch logic:** Mở file [`src/services/productService.js`](src/services/productService.js).
- **Guard chống gọi lặp phân trang FlatList:** Mở hàm `handleLoadMore` tại [`src/screens/ProductListScreen.js`](src/screens/ProductListScreen.js#L95-L105).
- **Cart Context & Derived Totals:** Mở file [`src/context/CartContext.js`](src/context/CartContext.js#L100-L120).
- **Firebase Order Service:** Mở hàm `createOrder` tại [`src/services/firebaseService.js`](src/services/firebaseService.js#L60-L100).
- **Notification Permission & Trigger:** Mở file [`src/services/notificationService.js`](src/services/notificationService.js).
- **Gemini AI Prompt & Validation:** Mở hàm `getShoppingAdvice` tại [`src/services/aiService.js`](src/services/aiService.js#L30-L100).

### 6.2 Giải thích 3 luồng thực thi chính (Execution Flow)
1. **Luồng dữ liệu Catalog (API $\rightarrow$ Service $\rightarrow$ Hook $\rightarrow$ FlatList):**
   - *Trigger:* `useEffect` trong `ProductListScreen.js` khi component mount hoặc khi `selectedCategory` thay đổi.
   - *Transform:* Gọi `productService.getProducts()`, parse JSON từ DummyJSON, chuẩn hóa mảng `products` và gán vào state `setProducts()`.
   - *Output:* FlatList render các `ProductCard`. Khi cuộn cuối, `handleLoadMore()` kiểm tra guard `isLoadingMore || products.length >= total` trước khi tăng `skip` để nạp thêm.
2. **Luồng Giỏ hàng & Bền vững (Cart State $\rightarrow$ Derived Totals $\rightarrow$ AsyncStorage):**
   - *Trigger:* Người dùng bấm "Thêm vào giỏ" hoặc thay đổi số lượng (+/-).
   - *Transform:* Hàm `addToCart()` hoặc `updateQuantity()` tính toán mảng `updatedCartItems`, lưu vào state đồng thời gọi `AsyncStorage.setItem()`.
   - *Output:* `totalCount` và `totalPrice` được tự động tính lại thông qua `useMemo` (Derived State). Không lưu `total` thành state riêng để tránh tình trạng lệch dữ liệu.
3. **Luồng Gemini AI & Kiểm chứng Catalog (Context $\rightarrow$ Prompt $\rightarrow$ Validation $\rightarrow$ UI):**
   - *Trigger:* Người dùng bấm "Hỏi trợ lý Gemini AI về sản phẩm này".
   - *Transform:* `aiService.js` lấy thông tin sản phẩm hiện tại + rút gọn 15 sản phẩm trong catalog làm context gửi lên Gemini.
   - *Validation:* Khi Gemini trả về mảng ID đề xuất, hệ thống dùng `catalog.find(p => p.id === recId)` để lọc. Chỉ những sản phẩm thực sự tồn tại trong danh mục cửa hàng mới được render ra UI.

---

## 7. BẰNG CHỨNG DEBUG (DEBUG LOGS - 2 LỖI THỰC TẾ)

### Debug Log #1: Lỗi FlatList gọi API phân trang lặp vô hạn (Infinite Request Loop)
- **Triệu chứng (Symptom):** Khi cuộn nhanh xuống đáy màn hình danh sách sản phẩm, console liên tục bắn log gọi API `getProducts` hàng chục lần dù dữ liệu trang cũ chưa tải xong.
- **Giả thuyết (Hypothesis):** Sự kiện `onEndReached` của FlatList được kích hoạt nhiều lần liên tiếp khi người dùng vẫn đang ở ngưỡng đáy mà không có cờ khóa (loading guard).
- **Điểm kiểm tra (Inspection Point):** Hàm `handleLoadMore` trong `src/screens/ProductListScreen.js`.
- **Nguyên nhân gốc rễ (Root Cause):** Thiếu điều kiện kiểm tra trạng thái đang tải (`isLoadingMore`) và điều kiện dừng khi đã tải hết toàn bộ sản phẩm (`products.length >= total`).
- **Cách sửa (Fix):**
  ```javascript
  const handleLoadMore = () => {
    if (isLoadingMore || isLoadingInitial || isRefreshing) return;
    if (products.length >= total) return;
    fetchProducts({ newSkip: skip, append: true });
  };
  ```
- **Kiểm thử lại (Retest):** Đặt breakpoint/console.log tại `handleLoadMore` và cuộn mạnh xuống đáy. API chỉ gọi duy nhất 1 lần cho mỗi trang, khi hết 194 sản phẩm thì dừng hẳn.

### Debug Log #2: Lỗi Cart Total hiển thị sai dạng chuỗi (NaN hoặc Ghép chuỗi String)
- **Triệu chứng (Symptom):** Khi sản phẩm có giá dạng số thực hoặc chuỗi từ API, tổng tiền giỏ hàng bị nối chuỗi `"10" + "20" = "1020"` hoặc hiển thị `$NaN`.
- **Giả thuyết (Hypothesis):** Dữ liệu `price` từ một số sản phẩm bên ngoài có thể là kiểu chuỗi (string) thay vì kiểu số (number).
- **Điểm kiểm tra (Inspection Point):** Hàm tính `totalPrice` trong `src/context/CartContext.js`.
- **Nguyên nhân gốc rễ (Root Cause):** Toán tử `reduce` thực hiện cộng dồn không ép kiểu an toàn: `acc + item.price * item.quantity`.
- **Cách sửa (Fix):**
  ```javascript
  const totalPrice = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + (Number(item.price) || 0) * (item.quantity || 1),
      0
    );
  }, [cartItems]);
  ```
- **Kiểm thử lại (Retest):** Thêm nhiều sản phẩm với đơn giá lẻ (ví dụ $9.99 và $12.50), tổng tiền luôn hiển thị chính xác `$22.49` với `.toFixed(2)`.

---

## 8. BÀI TẬP THAY ĐỔI THEO YÊU CẦU (TRANSFER TASK / LIVE MODIFICATION)

Nếu giảng viên yêu cầu thay đổi trực tiếp tại buổi chấm:
1. **Thêm Sort theo Giá (Price Low-to-High / High-to-Low):**
   - *File tác động:* `ProductListScreen.js`.
   - *Cách làm:* Thêm state `sortBy` (`'price_asc'` | `'price_desc'`), khi render `FlatList` dùng mảng đã sort:  
     `[...products].sort((a,b) => sortBy === 'asc' ? a.price - b.price : b.price - a.price)`.
2. **Thêm Nốt ghi chú (Note) cho từng sản phẩm trong giỏ hàng:**
   - *File tác động:* `CartContext.js` và `CartScreen.js`.
   - *Cách làm:* Bổ sung hàm `updateItemNote(productId, note)` cập nhật thuộc tính `note` của item và render `TextInput` nhỏ trong `CartScreen`.
3. **Thêm Nút Retry cho lỗi mạng:**
   - *Đã được triển khai sẵn* tại `ProductListScreen.js` (khi `errorMessage != null` hiện nút "Thử lại").

---

## 9. QUY TRÌNH TẠO BẢN RELEASE BUILD (ANDROID APK)

Cấu hình độc lập đã được thiết lập sẵn trong `app.json` và `eas.json`.
1. **Kiểm tra Metro Bundle:**
   ```bash
   npx expo export
   ```
2. **Tạo file APK độc lập cài trên máy thật Android qua EAS Build:**
   ```bash
   # Cài đặt EAS CLI (nếu chưa có)
   npm install -g eas-cli
   
   # Đăng nhập Expo
   eas login
   
   # Chạy lệnh build APK Release
   eas build --platform android --profile preview
   ```
   Sau khi hoàn tất, hệ thống EAS sẽ cung cấp link tải trực tiếp file `.apk` để cài đặt và chấm điểm.

---

## 10. NHẬT KÝ SỬ DỤNG AI (AI USAGE LOG)

| # | Nhiệm vụ / Mục đích | Phần áp dụng | Cách tự kiểm chứng & chỉnh sửa |
| :-: | :--- | :--- | :--- |
| 1 | Khởi tạo cấu trúc phân tầng (Screens, Services, Context, Config) | Toàn bộ khung thư mục `src/` | Chạy thử nghiệm Metro bundler và `expo export` để đảm bảo 100% không có lỗi import module. |
| 2 | Thiết kế luồng Fallback cho Firebase và Gemini AI | `firebaseService.js`, `aiService.js` | Tự ngắt kết nối mạng và để trống API key; kiểm chứng ứng dụng vẫn chạy mượt, chuyển sang chế độ offline an toàn không bao giờ crash. |
| 3 | Lập bảng 15 Test Cases & Kịch bản trả lời phỏng vấn | `README.md` | Đối chiếu từng tiêu chí với Rubric 10.0 của tài liệu Assignment 2 để đảm bảo đạt điểm tối đa. |

