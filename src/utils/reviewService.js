import api from "../config/api" // axios instance có token, baseURL...

/**
 * Tạo đánh giá mới cho sản phẩm.
 * Dành cho user đã đăng nhập và đã mua hàng.
 * @param {Object} data - Dữ liệu đánh giá (CreateReviewDto)
 */
export const createReview = (data) => api.post("reviews", data)

/**
 * Lấy danh sách đánh giá của một sản phẩm.
 * Dùng để hiển thị ở trang chi tiết sản phẩm (Product Detail).
 * @param {string} productId
 */
export const getProductReviews = (productId) =>
  api.get(`reviews/product/${productId}`)

/**
 * Lấy thống kê đánh giá của sản phẩm:
 * trung bình sao, tổng số đánh giá, phân phối sao.
 * Dùng để hiển thị biểu đồ/summary ở trang sản phẩm.
 * @param {string} productId
 */
export const getProductReviewSummary = (productId) =>
  api.get(`reviews/product/${productId}/summary`)

/**
 * Kiểm tra user có thể đánh giá sản phẩm không.
 * Chỉ được đánh giá khi đã mua và chưa từng review sản phẩm đó.
 * @param {string} userId
 * @param {string} productId
 */
export const canUserReviewProduct = (userId, productId) =>
  api.get(`reviews/can-review/${userId}/${productId}`)

/**
 * Đánh dấu đánh giá là hữu ích hoặc không hữu ích.
 * Dùng ở dưới mỗi review trong list.
 * @param {string} reviewId
 * @param {boolean} isHelpful - true = hữu ích, false = không hữu ích
 */
export const markReviewHelpful = (reviewId, isHelpful) =>
  api.post(`reviews/${reviewId}/helpful`, isHelpful)

/**
 * Lấy danh sách các đánh giá của người dùng hiện tại.
 * Dùng cho trang “Đánh giá của tôi” (My Reviews)
 * @param {string} userId
 */
export const getUserReviews = (userId) =>
  api.get(`reviews/user/${userId}`)
