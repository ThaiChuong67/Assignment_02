# BỘ CÂU HỎI VẤN ĐÁP & HƯỚNG DẪN TRẢ LỜI (MMA301 - ASSIGNMENT 2)
> Dành cho sinh viên ôn tập nhanh trong 5–10 phút trước buổi đánh giá với Giảng viên.

---

## PHẦN 1: CÂU HỎI TRỌNG TÂM THEO ĐỀ BÀI (MỤC 12 TRONG PDF)

### 1.1 Data / List / State
**❓ Câu hỏi 1: `onEndReached` của FlatList có thể bị gọi lặp vô tận khi nào? Khắc phục thế nào?**
> **Trả lời:**
> - **Khi nào bị lặp:** Khi người dùng cuộn đến đáy danh sách, sự kiện `onEndReached` liên tục kích hoạt nếu FlatList chưa kịp render dữ liệu mới hoặc nếu danh sách đã hết mà không có điều kiện dừng.
> - **Cách khắc phục:** Đặt **Loading Guard** trong hàm `handleLoadMore`:
>   ```javascript
>   if (isLoadingMore || isLoadingInitial || isRefreshing) return;
>   if (products.length >= total) return; // Đã hết sản phẩm thì dừng
>   ```

**❓ Câu hỏi 2: `Source data` và `Displayed data` khác nhau thế nào trong ứng dụng của bạn?**
> **Trả lời:**
> - `Source data` (`products`): Là dữ liệu thô nạp nguyên bản từ Remote API theo từng trang (`limit` & `skip`).
> - `Displayed data` (`displayedProducts`): Là dữ liệu được lọc hoặc sắp xếp trên client (ví dụ: Sắp xếp theo giá tăng/giảm, đánh giá sao) qua `useMemo` trước khi truyền vào prop `data` của FlatList. Việc này giúp giữ nguyên trạng thái gốc của dữ liệu từ máy chủ.

**❓ Câu hỏi 3: Tổng tiền giỏ hàng (`cartTotal`) nên lưu vào State riêng hay tính toán (Derive)? Vì sao?**
> **Trả lời:**
> - **Nên tính toán (Derive)** thông qua `useMemo` từ `cartItems`, **KHÔNG nên** lưu state riêng.
> - **Lý do:** Tuân thủ nguyên tắc **Single Source of Truth** (Nguồn chân lý duy nhất). Nếu lưu state riêng, khi có thao tác thêm/sửa/xóa số lượng món đồ, hai state rất dễ bị lệch đồng bộ (Out-of-sync) hoặc phát sinh lỗi làm tròn. Tính derived bằng `.reduce()` đảm bảo tổng tiền luôn luôn đúng 100% với số lượng từng món.

---

### 1.2 Firebase & Notification
**❓ Câu hỏi 4: Tính năng Firebase giải quyết bài toán nghiệp vụ (Business Problem) gì?**
> **Trả lời:**
> - Giải quyết nghiệp vụ **Lưu trữ & Đồng bộ Lịch sử Đơn hàng (Order History)** của khách hàng lên Cloud Firestore (`orders` collection) sau khi thanh toán giỏ hàng.
> - Giúp dữ liệu đơn hàng không bị mất khi đổi thiết bị và cung cấp bằng chứng mua hàng cho khách hàng trong tab "Lịch sử Đơn hàng".

**❓ Câu hỏi 5: Nếu người dùng từ chối (Deny) quyền thông báo thì workflow thay đổi ra sao? Ứng dụng có bị crash không?**
> **Trả lời:**
> - Ứng dụng **hoàn toàn không bị crash**.
> - Luồng xử lý: Trong `notificationService.js`, trước khi gửi thông báo, hàm kiểm tra `permission.granted`. Nếu bị từ chối (`denied`), hàm chỉ ghi nhận log và bỏ qua bước bắn thông báo; quy trình đặt hàng và lưu Firebase vẫn hoàn tất bình thường và giao diện thông báo bằng `Alert` trên màn hình.

**❓ Câu hỏi 6: Nếu Firebase bị mất mạng (Offline) hoặc chưa điền key thì UI thể hiện gì?**
> **Trả lời:**
> - Hệ thống tự động kích hoạt **Local Fallback Mode**: lưu đơn hàng vào `AsyncStorage` để bảo toàn dữ liệu người dùng.
> - Trên màn hình "Lịch sử Đơn hàng", banner hiển thị *"Chế độ an toàn Local Fallback"* và từng đơn hàng có huy hiệu màu vàng cam `Local Fallback` để phân biệt rõ ràng với đơn đã đồng bộ `Firebase Cloud`.

---

### 1.3 Debugging & Release
**❓ Câu hỏi 7: Quy trình 5 bước debug của bạn khi gặp lỗi là gì?**
> **Trả lời:**
> 1. Mô tả triệu chứng quan sát được.
> 2. Khoanh vùng màn hình, component và service chịu trách nhiệm.
> 3. Kiểm tra input props và giá trị state hiện tại.
> 4. Kiểm tra điểm biến đổi bất đồng bộ (Async/Promise).
> 5. Sửa nhỏ nhất, chạy lại test case và kiểm tra regression.

---

## PHẦN 2: THAO TÁC THAY ĐỔI YÊU CẦU TRỰC TIẾP (TRANSFER TASKS)

Nếu Giảng viên yêu cầu thay đổi tính năng tại chỗ:
1. **Yêu cầu: "Thêm sắp xếp theo giá / đánh giá":**
   - *Đã được tích hợp sẵn:* Mở `ProductListScreen.js`, chỉ vào thanh nút Sắp xếp: Mặc định, Giá: Thấp $\rightarrow$ Cao, Giá: Cao $\rightarrow$ Thấp, Đánh giá ★.
2. **Yêu cầu: "Thêm nút Thử lại (Retry) khi mất mạng":**
   - *Đã được tích hợp sẵn:* Mở `ProductListScreen.js` dòng 230-245, giải thích khối `errorMessage ? <RetryBtn>` khi API lỗi.
3. **Yêu cầu: "Chạy test tự động kiểm chứng toàn bộ hệ thống":**
   - Mở terminal chạy lệnh:
     ```bash
     npm test
     ```
   - Hệ thống sẽ chạy 8 test cases tự động (Giỏ hàng, Derived totals, Gemini validation, DummyJSON API, Firebase Schema) và hiển thị kết quả `8 PASSED, 0 FAILED`.

