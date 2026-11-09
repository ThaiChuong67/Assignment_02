const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  HeadingLevel,
  BorderStyle,
  AlignmentType,
  ShadingType,
} = require('docx');

// Helper styling constants
const COLOR_PRIMARY = '1E40AF'; // Deep Blue
const COLOR_SECONDARY = '0F766E'; // Teal
const COLOR_TEXT = '1F2937'; // Dark Gray
const COLOR_MUTED = '4B5563'; // Medium Gray
const COLOR_BG_LIGHT = 'F3F4F6'; // Light Gray Background
const COLOR_BORDER = 'D1D5DB';

const FONT_BODY = 'Calibri';
const FONT_CODE = 'Consolas';

function createHeading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 280, after: 140 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 32, // 16pt
        color: COLOR_PRIMARY,
        font: FONT_BODY,
      }),
    ],
  });
}

function createHeading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 26, // 13pt
        color: COLOR_SECONDARY,
        font: FONT_BODY,
      }),
    ],
  });
}

function createHeading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 160, after: 80 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 22, // 11pt
        color: COLOR_PRIMARY,
        font: FONT_BODY,
      }),
    ],
  });
}

function createParagraph(text, options = {}) {
  const { bold = false, italic = false, color = COLOR_TEXT, size = 22, spacingAfter = 100 } = options;
  return new Paragraph({
    spacing: { after: spacingAfter, line: 276 },
    children: [
      new TextRun({
        text,
        bold,
        italic,
        color,
        size,
        font: FONT_BODY,
      }),
    ],
  });
}

function createBullet(text, boldPrefix = '', options = {}) {
  const children = [];
  if (boldPrefix) {
    children.push(
      new TextRun({
        text: boldPrefix + ' ',
        bold: true,
        color: COLOR_PRIMARY,
        size: 22,
        font: FONT_BODY,
      })
    );
  }
  children.push(
    new TextRun({
      text,
      color: COLOR_TEXT,
      size: 22,
      font: FONT_BODY,
      ...options,
    })
  );

  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 80, line: 260 },
    children,
  });
}

function createCodeBlock(lines) {
  return lines.map(
    (line) =>
      new Paragraph({
        spacing: { before: 20, after: 20, line: 240 },
        shading: {
          type: ShadingType.CLEAR,
          fill: COLOR_BG_LIGHT,
        },
        children: [
          new TextRun({
            text: line,
            font: FONT_CODE,
            size: 19, // 9.5pt
            color: '111827',
          }),
        ],
      })
  );
}

function createScriptCallout(spokenText, cue = '') {
  return [
    new Paragraph({
      spacing: { before: 100, after: 40 },
      children: [
        new TextRun({
          text: `🎬 HÀNH ĐỘNG THAO TÁC TRÊN MÀN HÌNH: ${cue}`,
          bold: true,
          color: 'B45309', // Amber dark
          size: 21,
          font: FONT_BODY,
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 40, after: 120 },
      shading: {
        type: ShadingType.CLEAR,
        fill: 'FEF3C7', // Amber light
      },
      children: [
        new TextRun({
          text: `🗣️ LỜI THOẠI NÓI (THUYẾT MINH): "${spokenText}"`,
          italic: true,
          bold: true,
          color: '78350F',
          size: 21,
          font: FONT_BODY,
        }),
      ],
    }),
  ];
}

function createTableCell(text, options = {}) {
  const { bold = false, isHeader = false, widthPercent = 25 } = options;
  return new TableCell({
    width: { size: widthPercent * 50, type: WidthType.DXA },
    shading: isHeader
      ? { type: ShadingType.CLEAR, fill: 'DBEAFE' }
      : { type: ShadingType.CLEAR, fill: 'FFFFFF' },
    margins: { top: 120, bottom: 120, left: 140, right: 140 },
    children: [
      new Paragraph({
        alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
        children: [
          new TextRun({
            text,
            bold: bold || isHeader,
            color: isHeader ? COLOR_PRIMARY : COLOR_TEXT,
            font: FONT_BODY,
            size: isHeader ? 21 : 20,
          }),
        ],
      }),
    ],
  });
}

function generateDoc() {
  const doc = new Document({
    creator: 'MMA301 Student',
    title: 'BÁO CÁO GIẢI TRÌNH INTERVIEW (CHECKPOINT 1 & 2) - MMA301',
    description: 'Tài liệu hướng dẫn và nội dung thuyết minh video tự interview Assignment 2 môn MMA301',
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, // 1 inch = 1440 dxa
          },
        },
        children: [
          // Tiêu đề đầu trang
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 60 },
            children: [
              new TextRun({
                text: 'TRƯỜNG ĐẠI HỌC FPT - BỘ MÔN CÔNG NGHỆ THÔNG TIN',
                bold: true,
                size: 22,
                color: COLOR_MUTED,
                font: FONT_BODY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 160 },
            children: [
              new TextRun({
                text: 'MÔN HỌC: MMA301 - XÂY DỰNG ỨNG DỤNG DI ĐỘNG ĐA NỀN TẢNG',
                bold: true,
                size: 24,
                color: COLOR_PRIMARY,
                font: FONT_BODY,
              }),
            ],
          }),

          // Box thông tin đồ án
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 80 },
            children: [
              new TextRun({
                text: 'BÁO CÁO GIẢI TRÌNH INTERVIEW (CHECKPOINT 1 & 2)',
                bold: true,
                size: 36, // 18pt
                color: COLOR_PRIMARY,
                font: FONT_BODY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: 'ĐỀ TÀI: PHÁT TRIỂN ỨNG DỤNG E-COMMERCE MOBILE VỚI REACT NATIVE & FIREBASE',
                bold: true,
                size: 24,
                color: COLOR_SECONDARY,
                font: FONT_BODY,
              }),
            ],
          }),

          // Bảng thông tin sinh viên
          new Table({
            width: { size: 100 * 50, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createTableCell('Họ và tên sinh viên:', { bold: true, widthPercent: 30 }),
                  createTableCell('[ĐIỀN HỌ VÀ TÊN CỦA BẠN VÀO ĐÂY]', { widthPercent: 70 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('Mã số sinh viên (MSSV):', { bold: true, widthPercent: 30 }),
                  createTableCell('[ĐIỀN MSSV CỦA BẠN VÀO ĐÂY]', { widthPercent: 70 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('Lớp học phần:', { bold: true, widthPercent: 30 }),
                  createTableCell('MMA301', { widthPercent: 70 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('Repository GitHub:', { bold: true, widthPercent: 30 }),
                  createTableCell('https://github.com/ThaiChuong67/Assignment_02.git', { widthPercent: 70 }),
                ],
              }),
            ],
          }),

          createParagraph('', { spacingAfter: 200 }),

          // ==========================================
          // CÂU 1: HIỂU YÊU CẦU & PHƯƠNG PHÁP GIẢI QUYẾT
          // ==========================================
          createHeading1('1. CÂU 1: HIỂU YÊU CẦU & PHƯƠNG PHÁP GIẢI QUYẾT BÀI TOÁN'),
          createParagraph(
            'Mục đích của câu hỏi 1: Chứng minh sinh viên hiểu rõ yêu cầu bài toán được giao trong Assignment 2, xác định đúng phạm vi Use Case (UC) và lựa chọn phương pháp, giải pháp kỹ thuật phù hợp để hiện thực hóa sản phẩm.'
          ),

          createHeading2('1a. Phần Problem, Use Cases (UC) và bài toán do sinh viên đảm nhận'),
          createParagraph(
            'Bài toán đặt ra trong Assignment 2 là xây dựng một ứng dụng thương mại điện tử (E-Commerce) chạy trên nền tảng di động với trải nghiệm người dùng hiện đại, dữ liệu sản phẩm lấy từ Remote REST API, quản lý trạng thái giỏ hàng toàn cục bền vững, lưu trữ đơn hàng lên Cloud Firestore và thông báo đẩy khi thanh toán.'
          ),
          createParagraph('Bảng tổng hợp chi tiết các Use Cases (UC) do em đảm nhận hiện thực:'),

          // Table Use Cases
          new Table({
            width: { size: 100 * 50, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createTableCell('Mã UC', { isHeader: true, widthPercent: 12 }),
                  createTableCell('Tên Use Case', { isHeader: true, widthPercent: 25 }),
                  createTableCell('Mô tả nghiệp vụ', { isHeader: true, widthPercent: 38 }),
                  createTableCell('Điều kiện biên & Ngoại lệ', { isHeader: true, widthPercent: 25 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('UC01', { bold: true }),
                  createTableCell('Duyệt danh mục & Tìm kiếm sản phẩm'),
                  createTableCell('Lấy danh sách sản phẩm từ REST API DummyJSON, hiển thị phân trang dạng Infinite Scroll (10 item/lần), tìm kiếm theo từ khóa và lọc danh mục.'),
                  createTableCell('Debounce 400ms chống spam gọi API; Guard chặn tải trùng lặp khi đang tải hoặc đã hết danh sách.'),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('UC02', { bold: true }),
                  createTableCell('Quản lý giỏ hàng & Tính toán phái sinh'),
                  createTableCell('Thêm sản phẩm, tăng/giảm số lượng, xóa sản phẩm. Tự động tính tổng tiền và số lượng thông qua Derived State; lưu bền vững vào AsyncStorage.'),
                  createTableCell('Giảm số lượng về 0 tự động xóa sản phẩm khỏi giỏ; không dùng state rời rạc tránh lỗi lệch pha số liệu.'),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('UC03', { bold: true }),
                  createTableCell('Thanh toán & Lưu vết đơn hàng Cloud'),
                  createTableCell('Khách hàng bấm Thanh toán, ứng dụng đóng gói đơn hàng và ghi vào cơ sở dữ liệu Cloud Firestore (Collection "orders").'),
                  createTableCell('Graceful Degradation: Nếu mất mạng hoặc Firestore lỗi, tự động lưu vào AsyncStorage cục bộ (Fallback Mode).'),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('UC04', { bold: true }),
                  createTableCell('Thông báo đẩy nội bộ (Local Notifications)'),
                  createTableCell('Gửi thông báo cục bộ tới hệ điều hành ngay khi đơn hàng hoàn tất để phản hồi trạng thái cho khách hàng.'),
                  createTableCell('Xin quyền người dùng (Runtime Permission) chuẩn Android 13+; xử lý an toàn môi trường Expo Go.'),
                ],
              }),
            ],
          }),

          createParagraph('', { spacingAfter: 160 }),
          createHeading2('1b. Phương pháp và giải pháp kỹ thuật thực hiện'),
          createBullet(
            'Ứng dụng được chia thành 4 lớp độc lập: Presentation Layer (Screens), State Management Layer (CartContext), Service Layer (Product, Firebase, Notification) và Storage Layer (AsyncStorage, Cloud Firestore). Giúp mã nguồn dễ bảo trì, mở rộng và kiểm thử đơn vị.',
            'Kiến trúc phân tầng (Layered Architecture):'
          ),
          createBullet(
            'Kết hợp Bottom Tabs Navigator (4 Tab: Sản phẩm, Giỏ hàng, Đơn hàng, Cài đặt) với Native Stack Navigator (Chuyển trang mượt mà giữa Danh sách và Chi tiết sản phẩm). Có Tab Bar Badge đồng bộ số lượng theo thời gian thực.',
            'Điều hướng người dùng (Navigation Pattern):'
          ),
          createBullet(
            'Sử dụng React Context API kết hợp useMemo để tính toán Derived State (totalCount, totalPrice) trực tiếp từ cartItems. Nguyên lý Single Source of Truth đảm bảo giỏ hàng không bao giờ bị sai lệch số liệu.',
            'Quản lý trạng thái toàn cục (State Management):'
          ),
          createBullet(
            'Mọi tương tác ngoại vi (gọi mạng, ghi database, gửi thông báo) đều được bọc trong khối try/catch kèm Fallback an toàn. Ứng dụng không bao giờ bị văng (crash) ngay cả khi không có kết nối internet.',
            'Nguyên lý thiết kế phòng thủ (Graceful Degradation):'
          ),

          createParagraph('', { spacingAfter: 200 }),

          // ==========================================
          // CÂU 2: GIẢI THÍCH CHI TIẾT CODE & WORKFLOW
          // ==========================================
          createHeading1('2. CÂU 2: GIẢI THÍCH CHI TIẾT WORKFLOW & CODE CHÍNH'),
          createParagraph(
            'Mục đích của câu hỏi 2: Chứng minh sinh viên thực sự hiểu bản chất từng dòng code, nắm vững luồng thực thi (workflow) từ khi người dùng thao tác trên màn hình đến khi dữ liệu được xử lý và lưu trữ.'
          ),

          createHeading2('2.1. Bảng ánh xạ Use Case và các đoạn Code trọng tâm'),
          new Table({
            width: { size: 100 * 50, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createTableCell('Use Case', { isHeader: true, widthPercent: 20 }),
                  createTableCell('File nguồn', { isHeader: true, widthPercent: 30 }),
                  createTableCell('Dòng mã chính', { isHeader: true, widthPercent: 20 }),
                  createTableCell('Chức năng trọng tâm', { isHeader: true, widthPercent: 30 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('UC01 (Catalog & Search)'),
                  createTableCell('src/screens/ProductListScreen.js'),
                  createTableCell('Dòng 93-101\nDòng 110-116'),
                  createTableCell('Debounce 400ms và Infinite Scroll Guard'),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('UC02 (Cart & Totals)'),
                  createTableCell('src/context/CartContext.js'),
                  createTableCell('Dòng 64-79\nDòng 105-114'),
                  createTableCell('Giảm về 0 tự xóa và Derived Totals useMemo'),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('UC03 (Checkout Flow)'),
                  createTableCell('src/screens/CartScreen.js\nsrc/services/firebaseService.js'),
                  createTableCell('CartScreen: 22-76\nFirebase: 65-120'),
                  createTableCell('Quy trình Checkout 4 bước và Fallback Firestore'),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('UC04 (Notification)'),
                  createTableCell('src/services/notificationService.js'),
                  createTableCell('Dòng 10-17\nDòng 59-75'),
                  createTableCell('Foreground Handler và Xin quyền chuẩn Android 13+'),
                ],
              }),
            ],
          }),

          createParagraph('', { spacingAfter: 200 }),

          // TRẠM 1
          createHeading2('2.2. Hướng dẫn chi tiết từng Trạm Code (Kịch bản quay video)'),
          createHeading3('📍 TRẠM 1: Quản lý giỏ hàng & Tính toán Derived Totals (CartContext.js)'),
          createParagraph(
            'Vị trí file: src/context/CartContext.js. Đây là trái tim quản lý dữ liệu giỏ hàng toàn cục của ứng dụng.'
          ),
          createBullet(
            'Đoạn mã cập nhật số lượng (Dòng 64 - 79):',
            'Logic giảm về 0 tự xóa:'
          ),
          ...createCodeBlock([
            'const updateQuantity = (productId, delta) => {',
            '  setCartItems((prevItems) => {',
            '    const updated = prevItems',
            '      .map((item) => {',
            '        if (item.id === productId) {',
            '          const newQty = item.quantity + delta;',
            '          return newQty > 0 ? { ...item, quantity: newQty } : null;',
            '        }',
            '        return item;',
            '      })',
            '      .filter(Boolean); // Tự động loại bỏ item bị null (newQty <= 0)',
            '    saveCartToStorage(updated);',
            '    return updated;',
            '  });',
            '};',
          ]),
          ...createScriptCallout(
            'Thưa Thầy/Cô, tại hàm updateQuantity dòng 64-79, khi người dùng bấm giảm số lượng, nếu newQty <= 0, map sẽ trả về null và hàm .filter(Boolean) ở dòng 74 sẽ tự động loại bỏ sản phẩm ra khỏi giỏ hàng mà không cần pop-up hỏi xóa rườm rà.',
            'Mở file src/context/CartContext.js, bôi đen từ dòng 64 đến dòng 79.'
          ),

          createBullet(
            'Đoạn mã tính toán phái sinh (Dòng 105 - 114):',
            'Derived Totals với useMemo:'
          ),
          ...createCodeBlock([
            'const totalCount = useMemo(() => {',
            '  return cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);',
            '}, [cartItems]);',
            '',
            'const totalPrice = useMemo(() => {',
            '  return cartItems.reduce(',
            '    (acc, item) => acc + (Number(item.price) || 0) * (item.quantity || 1),',
            '    0',
            '  );',
            '}, [cartItems]);',
          ]),
          ...createScriptCallout(
            'Ở dòng 105 đến 114, em áp dụng kỹ thuật Derived State. Em không tạo thêm useState riêng cho tổng tiền mà dùng useMemo tính trực tiếp từ cartItems. Đây là nguyên lý Single Source of Truth giúp dữ liệu không bao giờ bị lệch pha.',
            'Bôi đen từ dòng 105 đến dòng 114 của CartContext.js.'
          ),

          // TRẠM 2
          createHeading3('📍 TRẠM 2: Phân trang mượt mà & Tìm kiếm Debounce (ProductListScreen.js)'),
          createParagraph(
            'Vị trí file: src/screens/ProductListScreen.js. Chịu trách nhiệm hiển thị sản phẩm, tìm kiếm và phân trang vô hạn.'
          ),
          createBullet(
            'Đoạn mã Debounce tìm kiếm (Dòng 93 - 101):',
            'Debounce Search Optimization:'
          ),
          ...createCodeBlock([
            'const handleSearchChange = (text) => {',
            '  setSearchQuery(text);',
            '  if (searchTimeoutRef.current) {',
            '    clearTimeout(searchTimeoutRef.current);',
            '  }',
            '  searchTimeoutRef.current = setTimeout(() => {',
            '    fetchProducts({ newSkip: 0, append: false, search: text });',
            '  }, 400); // Trì hoãn 400ms sau khi người dùng dừng gõ',
            '};',
          ]),
          ...createScriptCallout(
            'Tại dòng 93-101, em sử dụng kỹ thuật Debounce 400ms qua searchTimeoutRef. Mỗi khi người dùng gõ ký tự mới, timeout cũ bị hủy và chỉ khi người dùng ngừng gõ quá 400ms thì request tìm kiếm mới được gửi đi, giúp giảm tải tối đa cho server.',
            'Mở file src/screens/ProductListScreen.js, bôi đen dòng 93 đến 101.'
          ),

          createBullet(
            'Đoạn mã chốt chặn phân trang (Dòng 110 - 116):',
            'Infinite Scroll Guard:'
          ),
          ...createCodeBlock([
            'const handleLoadMore = () => {',
            '  // Guard quan trọng: Không load tiếp nếu đang tải, hoặc đã hết dữ liệu',
            '  if (isLoadingMore || isLoadingInitial || isRefreshing) return;',
            '  if (products.length >= total) return;',
            '',
            '  fetchProducts({ newSkip: skip, append: true });',
            '};',
          ]),
          ...createScriptCallout(
            'Ở dòng 110-116 là hàm handleLoadMore khi cuộn FlatList. Em đặt 2 guard chặn không tải tiếp nếu app đang loading hoặc số sản phẩm đã tải bằng tổng số sản phẩm trên server (products.length >= total).',
            'Bôi đen dòng 110 đến dòng 116 của ProductListScreen.js.'
          ),

          // TRẠM 3
          createHeading3('📍 TRẠM 3: Quy trình thanh toán hoàn chỉnh (CartScreen.js)'),
          createParagraph(
            'Vị trí file: src/screens/CartScreen.js. Thực hiện quy trình đặt hàng khép kín gồm 4 bước.'
          ),
          ...createCodeBlock([
            'const handleCheckout = async () => {',
            '  if (cartItems.length === 0) return;',
            '  try {',
            '    setIsSubmitting(true); // Khóa nút bấm chống double-click',
            '    // 1. Đóng gói orderPayload chuẩn',
            '    const orderPayload = { items: cartItems, totalCount, totalAmount: totalPrice, ... };',
            '    // 2. Lưu vào Firebase Firestore',
            '    const createdOrder = await firebaseService.createOrder(orderPayload);',
            '    // 3. Kích hoạt Local Notification',
            '    await notificationService.sendOrderNotification(createdOrder.id, totalPrice);',
            '    // 4. Xóa sạch giỏ hàng',
            '    await clearCart();',
            '  } finally {',
            '    setIsSubmitting(false);',
            '  }',
            '};',
          ]),
          ...createScriptCallout(
            'Tại CartScreen.js từ dòng 22 đến 76 là quy trình Checkout 4 bước: Đóng gói đơn hàng -> Lưu lên Firestore -> Bắn thông báo Local Notification -> Xóa sạch giỏ hàng. Cờ isSubmitting giúp khóa nút bấm, chống tạo đơn trùng lặp.',
            'Mở file src/screens/CartScreen.js, bôi đen hàm handleCheckout (dòng 22 - 76).'
          ),

          // TRẠM 4
          createHeading3('📍 TRẠM 4: Kết nối Cloud Firestore & Fallback Offline (firebaseService.js)'),
          createParagraph(
            'Vị trí file: src/services/firebaseService.js. Quản lý lưu trữ đơn hàng lên Cloud Firestore và cơ chế cứu cánh ngoại tuyến.'
          ),
          ...createCodeBlock([
            'async createOrder(orderData) {',
            '  // 1. Thử ghi trực tuyến lên Cloud Firestore',
            '  if (this.isOnline()) {',
            '    try {',
            '      const ordersRef = collection(db, "orders");',
            '      const docRef = await addDoc(ordersRef, { ...payload, serverTimestamp: serverTimestamp() });',
            '      return { id: docRef.id, source: "firebase", ...payload };',
            '    } catch (fbError) { /* Chuyển sang fallback */ }',
            '  }',
            '  // 2. Chế độ Fallback an toàn (Lưu cục bộ vào AsyncStorage khi mất mạng)',
            '  const existing = await AsyncStorage.getItem(LOCAL_ORDERS_KEY);',
            '  const orders = existing ? JSON.parse(existing) : [];',
            '  // Ghi đơn hàng vào mảng và lưu lại...',
            '}',
          ]),
          ...createScriptCallout(
            'Trong firebaseService.js ở dòng 65-120, đơn hàng được ưu tiên lưu lên Cloud Firestore với serverTimestamp(). Nếu mạng lỗi hoặc mất kết nối, khối catch sẽ kích hoạt Graceful Degradation tự động lưu vào AsyncStorage với cờ local_fallback, đảm bảo đơn hàng không bao giờ bị mất.',
            'Mở file src/services/firebaseService.js, bôi đen dòng 65 đến dòng 105.'
          ),

          // TRẠM 5
          createHeading3('📍 TRẠM 5: Xin quyền thông báo & Foreground Handler (notificationService.js)'),
          createParagraph(
            'Vị trí file: src/services/notificationService.js. Điều khiển việc cấp quyền và hiển thị thông báo cục bộ.'
          ),
          ...createCodeBlock([
            'Notifications.setNotificationHandler({',
            '  handleNotification: async () => ({',
            '    shouldShowBanner: true, // Hiển thị popup banner cả khi app đang mở',
            '    shouldShowList: true,',
            '    shouldPlaySound: true,',
            '  }),',
            '});',
          ]),
          ...createScriptCallout(
            'Tại notificationService.js dòng 10-17, em cấu hình setNotificationHandler với shouldShowBanner: true để thông báo vẫn hiện pop-up ngay cả khi người dùng đang ở trong ứng dụng. Hàm requestPermission ở dòng 59 kiểm tra quyền trước khi yêu cầu, hoàn toàn tuân thủ chuẩn Android 13+.',
            'Mở file src/services/notificationService.js, bôi đen dòng 10 đến 17.'
          ),

          createParagraph('', { spacingAfter: 200 }),

          // ==========================================
          // PHẦN 3: BẢNG KIỂM THỬ VÀ CÂU HỎI VẤN ĐÁP PHỤ
          // ==========================================
          createHeading1('3. BẢNG KIỂM THỬ HỆ THỐNG & CÂU HỎI VẤN ĐÁP PHÒNG THỦ'),
          createHeading2('3.1. Bảng kết quả kiểm thử tự động (scripts/verify-all.js)'),
          createParagraph(
            'Hệ thống đã được kiểm thử tự động bằng file script scripts/verify-all.js với lệnh npm test, đạt tỷ lệ vượt qua 100% (6/6 Test Cases).'
          ),

          new Table({
            width: { size: 100 * 50, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createTableCell('Mã Test', { isHeader: true, widthPercent: 15 }),
                  createTableCell('Tên trường hợp kiểm thử', { isHeader: true, widthPercent: 45 }),
                  createTableCell('Kết quả kiểm thử', { isHeader: true, widthPercent: 20 }),
                  createTableCell('Trạng thái', { isHeader: true, widthPercent: 20 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('TC01', { bold: true }),
                  createTableCell('Derived Totals: Tính toán giỏ hàng rỗng (totalCount=0, totalPrice=0)'),
                  createTableCell('Chính xác 0 và $0.00'),
                  createTableCell('✅ PASSED'),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('TC02', { bold: true }),
                  createTableCell('Derived Totals: Đa sản phẩm và số lượng lẻ phức tạp'),
                  createTableCell('Tổng tiền & số lượng khớp 100%'),
                  createTableCell('✅ PASSED'),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('TC03', { bold: true }),
                  createTableCell('Quantity Update: Giảm số lượng về 0 tự động xóa khỏi mảng'),
                  createTableCell('Item bị xóa sạch khỏi giỏ'),
                  createTableCell('✅ PASSED'),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('TC04', { bold: true }),
                  createTableCell('Remote API: Tải danh sách phân trang từ DummyJSON'),
                  createTableCell('Nhận đủ 10 items/trang'),
                  createTableCell('✅ PASSED'),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('TC05', { bold: true }),
                  createTableCell('Remote API: Tìm kiếm sản phẩm theo từ khóa "phone"'),
                  createTableCell('Lọc đúng từ khóa liên quan'),
                  createTableCell('✅ PASSED'),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell('TC06', { bold: true }),
                  createTableCell('Firebase Schema: Kiểm tra đầy đủ các trường đơn hàng bắt buộc'),
                  createTableCell('Đạt chuẩn items, total, status'),
                  createTableCell('✅ PASSED'),
                ],
              }),
            ],
          }),

          createParagraph('', { spacingAfter: 160 }),
          createHeading2('3.2. Bộ câu hỏi vấn đáp phụ hay gặp (Oral Defense Q&A)'),
          createBullet(
            'Dạ, vì totalPrice là dữ liệu phái sinh hoàn toàn phụ thuộc vào danh sách cartItems. Nếu lưu state riêng, mỗi lần thêm/sửa/xóa ta đều phải setState thủ công ở nhiều nơi, rất dễ bị lỗi lệch pha số liệu khi bất đồng bộ. Dùng useMemo giúp đảm bảo nguyên tắc Single Source of Truth, dữ liệu luôn đồng nhất tuyệt đối.',
            'Câu 1: "Tại sao em không lưu totalPrice vào useState mà lại dùng useMemo?"'
          ),
          createBullet(
            'Dạ, trong firebaseService.js em áp dụng kiến trúc Graceful Degradation. Khi mất mạng, hàm addDoc lên Firestore sẽ ném ngoại lệ; khối catch sẽ đón bắt và lưu đơn hàng trực tiếp vào AsyncStorage cục bộ với đánh dấu source: "local_fallback". Khi người dùng vào màn hình Đơn hàng, app vẫn hiển thị đầy đủ kèm huy hiệu Local Fallback, không hề bị crash.',
            'Câu 2: "Nếu người dùng tắt mạng hoặc Firebase bị lỗi khi bấm Đặt hàng thì sao?"'
          ),
          createBullet(
            'Dạ, khi người dùng gõ nhanh, nếu không có Debounce thì mỗi ký tự sẽ kích hoạt một cuộc gọi mạng (ví dụ gõ từ 8 chữ cái sẽ bắn 8 request liên tiếp). Debounce 400ms hoãn lại cuộc gọi mạng, chỉ gửi duy nhất 1 request khi người dùng ngừng gõ, giúp tiết kiệm băng thông và tối ưu hiệu năng.',
            'Câu 3: "Kỹ thuật Debounce ở ô tìm kiếm có tác dụng gì?"'
          ),
          createBullet(
            'Dạ, trên Android 13+ (API 33 trở lên), Google đã xếp quyền thông báo vào nhóm Runtime Permission nguy hiểm giống như quyền Camera hay Vị trí. Ứng dụng phải chủ động gọi requestPermissionsAsync() khi người dùng thao tác thì hệ điều hành mới cho phép hiển thị thông báo ra thanh trạng thái.',
            'Câu 4: "Tại sao cần phải xin quyền thông báo Notifications trên Android?"'
          ),

          createParagraph('', { spacingAfter: 200 }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: '--- HẾT BÁO CÁO GIẢI TRÌNH ---',
                bold: true,
                color: COLOR_MUTED,
                size: 22,
                font: FONT_BODY,
              }),
            ],
          }),
        ],
      },
    ],
  });

  return doc;
}

async function main() {
  const doc = generateDoc();
  const outputPath = path.join(__dirname, '..', 'BAO_CAO_GIAI_TRINH_INTERVIEW_MMA301.docx');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log('✅ Đã tạo thành công file Word:', outputPath);
}

main().catch((err) => {
  console.error('❌ Lỗi tạo file docx:', err);
  process.exit(1);
});
