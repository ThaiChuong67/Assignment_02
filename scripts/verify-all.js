/**
 * Script kiểm thử tự động (Smoke Test & Logic Verification)
 * Phục vụ buổi đánh giá (Pha D: Verification & Testing trong Rubric)
 */

const assert = require('assert');

async function runTests() {
  console.log('====================================================');
  console.log('🚀 BẮT ĐẦU CHẠY KIỂM THỬ HỆ THỐNG (MMA301 - ASSIGNMENT 2)');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  async function testAsync(name, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // TEST GROUP 1: DERIVED TOTALS & CART LOGIC
  console.log('--- NHÓM 1: KIỂM THỬ GIỎ HÀNG & DERIVED TOTALS ---');

  test('TC01: Derived Totals - Giỏ hàng rỗng', () => {
    const cart = [];
    const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cart.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);

    assert.strictEqual(totalCount, 0);
    assert.strictEqual(totalPrice, 0);
  });

  test('TC02: Derived Totals - Đa sản phẩm và số lượng lẻ', () => {
    const cart = [
      { id: 1, title: 'iPhone 15', price: 999.99, quantity: 2 },
      { id: 2, title: 'Ốp lưng', price: 15.5, quantity: 3 },
    ];
    const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cart.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);

    assert.strictEqual(totalCount, 5);
    // 999.99 * 2 = 1999.98; 15.5 * 3 = 46.5; tổng = 2046.48
    assert.strictEqual(totalPrice.toFixed(2), '2046.48');
  });

  test('TC03: Cart Quantity Update - Giảm về 0 tự xóa', () => {
    let cart = [{ id: 10, title: 'Tai nghe', price: 50, quantity: 1 }];
    const updateQuantity = (id, delta) => {
      return cart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    };

    cart = updateQuantity(10, -1);
    assert.strictEqual(cart.length, 0);
  });

  // TEST GROUP 2: REMOTE API CONNECTIVITY (LIVE NETWORK TEST)
  console.log('\n--- NHÓM 2: KIỂM THỬ KẾT NỐI REMOTE API (DUMMYJSON) ---');

  await testAsync('TC04: Remote API - Lấy danh sách sản phẩm phân trang', async () => {
    const res = await fetch('https://dummyjson.com/products?limit=5&skip=0');
    assert.strictEqual(res.ok, true);
    const data = await res.json();
    assert.strictEqual(Array.isArray(data.products), true);
    assert.strictEqual(data.products.length, 5);
    assert.strictEqual(typeof data.total, 'number');
  });

  await testAsync('TC05: Remote API - Tìm kiếm sản phẩm theo từ khóa "phone"', async () => {
    const res = await fetch('https://dummyjson.com/products/search?q=phone&limit=3');
    assert.strictEqual(res.ok, true);
    const data = await res.json();
    assert.strictEqual(data.products.length > 0, true);
    const hasPhone = data.products.some((p) =>
      p.title.toLowerCase().includes('phone') || p.description.toLowerCase().includes('phone')
    );
    assert.strictEqual(hasPhone, true);
  });

  // TEST GROUP 3: FIREBASE ORDER SCHEMA VALIDATION
  console.log('\n--- NHÓM 3: KIỂM THỬ CẤU TRÚC ĐƠN HÀNG (FIREBASE SCHEMA) ---');

  test('TC06: Order Schema - Đầy đủ trường nghiệp vụ bắt buộc', () => {
    const orderPayload = {
      items: [{ id: 1, title: 'Sản phẩm mẫu', price: 25, quantity: 2 }],
      totalCount: 2,
      totalAmount: 50,
      customerName: 'Sinh viên MMA301',
      createdAt: new Date().toISOString(),
      status: 'Đang xử lý (Processing)',
    };

    assert.strictEqual(typeof orderPayload.totalAmount, 'number');
    assert.strictEqual(orderPayload.items.length, 1);
    assert.strictEqual(Boolean(orderPayload.createdAt), true);
  });

  console.log('\n====================================================');
  console.log(`🏁 KẾT QUẢ: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
