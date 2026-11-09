import { ENV } from '../config/env';

/**
 * Service quản lý gọi dữ liệu sản phẩm từ Remote API (DummyJSON)
 * Hỗ trợ: Phân trang (Pagination/Limit/Skip), Tìm kiếm (Search), Lọc danh mục (Category)
 */

export const productService = {
  /**
   * Lấy danh sách sản phẩm có phân trang và tìm kiếm
   * @param {Object} params
   * @param {number} params.limit Số lượng sản phẩm mỗi trang (mặc định 10)
   * @param {number} params.skip Vị trí bắt đầu lấy (mặc định 0)
   * @param {string} params.search Từ khóa tìm kiếm
   * @param {string} params.category Danh mục lọc
   * @returns {Promise<{ products: Array, total: number, skip: number, limit: number }>}
   */
  async getProducts({ limit = 10, skip = 0, search = '', category = '' } = {}) {
    try {
      let url = '';

      if (search && search.trim() !== '') {
        // API tìm kiếm theo từ khóa
        url = `${ENV.PRODUCT_API_BASE_URL}/search?q=${encodeURIComponent(
          search.trim()
        )}&limit=${limit}&skip=${skip}`;
      } else if (category && category !== 'all') {
        // API lọc theo danh mục
        url = `${ENV.PRODUCT_API_BASE_URL}/category/${encodeURIComponent(
          category
        )}?limit=${limit}&skip=${skip}`;
      } else {
        // API lấy danh sách thông thường có phân trang
        url = `${ENV.PRODUCT_API_BASE_URL}?limit=${limit}&skip=${skip}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Lỗi máy chủ: HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        products: data.products || [],
        total: data.total || 0,
        skip: data.skip || 0,
        limit: data.limit || limit,
      };
    } catch (error) {
      console.error('[productService.getProducts] Lỗi kết nối:', error.message);
      throw new Error('Không thể tải dữ liệu sản phẩm. Vui lòng kiểm tra kết nối mạng!');
    }
  },

  /**
   * Lấy danh sách danh mục sản phẩm để hiển thị thanh filter
   * @returns {Promise<Array<string>>}
   */
  async getCategories() {
    try {
      const response = await fetch(`${ENV.PRODUCT_API_BASE_URL}/category-list`);
      if (!response.ok) {
        return ['all', 'beauty', 'fragrances', 'furniture', 'groceries'];
      }
      const data = await response.json();
      // DummyJSON trả về mảng danh mục dạng chuỗi
      return ['all', ...(Array.isArray(data) ? data.slice(0, 8) : [])];
    } catch (error) {
      console.log('[productService.getCategories] Dùng fallback danh mục:', error.message);
      return ['all', 'beauty', 'fragrances', 'furniture', 'groceries'];
    }
  },

  /**
   * Lấy chi tiết một sản phẩm theo ID
   * @param {number|string} id
   */
  async getProductById(id) {
    try {
      const response = await fetch(`${ENV.PRODUCT_API_BASE_URL}/${id}`);
      if (!response.ok) {
        throw new Error(`Không tìm thấy sản phẩm có ID: ${id}`);
      }
      return await response.json();
    } catch (error) {
      console.error('[productService.getProductById] Lỗi:', error.message);
      throw error;
    }
  },
};

