"use client"
import { useEffect, useState } from "react"
import { Button, Avatar, Rate, Spin, Pagination, Modal, Image } from "antd" // Added Modal and Image
import { LikeOutlined, MoreOutlined, UserOutlined } from "@ant-design/icons"
import "./index.scss"

const ProductReviews = ({ reviews = [], loading }) => {
  console.log("🔥🔥🔥 [ProductReviews] - Dữ liệu reviews từ props:", reviews)
  const [activeFilter, setActiveFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1) // State for current page [^1]
  const [previewVisible, setPreviewVisible] = useState(false) // State for image preview modal
  const [previewImage, setPreviewImage] = useState("") // State for current preview image
  const [previewImages, setPreviewImages] = useState([]) // State for all images in current review
  const [currentImageIndex, setCurrentImageIndex] = useState(0) // State for current image index
  const reviewsPerPage = 5 // Number of reviews to display per page

  useEffect(() => {
    console.log("🧪 [DEBUG] Reviews được nhận trong ProductReviews:", reviews)
  }, [reviews])

  // Reset current page to 1 whenever the filter changes [^2]
  useEffect(() => {
    setCurrentPage(1)
  }, [activeFilter])

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: 32 }}>
        <Spin size="large" />
      </div>
    )

  if (!Array.isArray(reviews)) return null

  const totalReviews = reviews.length
  const averageRating = totalReviews === 0 ? 0 : reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews

  const ratingStats = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  }

  const reviewsWithComments = reviews.filter((r) => r.content && r.content.trim() !== "").length
  const reviewsWithImages = reviews.filter((r) => r.images && r.images.length > 0).length

  const filterButtons = [
    { key: "all", label: "Tất Cả", count: totalReviews },
    { key: "5star", label: "5 Sao", count: ratingStats[5] },
    { key: "4star", label: "4 Sao", count: ratingStats[4] },
    { key: "3star", label: "3 Sao", count: ratingStats[3] },
    { key: "2star", label: "2 Sao", count: ratingStats[2] },
    { key: "1star", label: "1 Sao", count: ratingStats[1] },
    { key: "comments", label: "Có Bình Luận", count: reviewsWithComments },
    { key: "images", label: "Có Hình Ảnh / Video", count: reviewsWithImages },
  ]

  const filteredReviews = reviews.filter((review) => {
    switch (activeFilter) {
      case "5star":
        return review.rating === 5
      case "4star":
        return review.rating === 4
      case "3star":
        return review.rating === 3
      case "2star":
        return review.rating === 2
      case "1star":
        return review.rating === 1
      case "comments":
        return review.content && review.content.trim() !== ""
      case "images":
        return review.images && review.images.length > 0
      default:
        return true
    }
  })

  // Calculate reviews for the current page
  const indexOfLastReview = currentPage * reviewsPerPage
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage
  const currentReviews = filteredReviews.slice(indexOfFirstReview, indexOfLastReview)

  console.log("📋 Tất cả reviews sau lọc:", filteredReviews)
  console.log("📄 Reviews trang hiện tại:", currentReviews)
  console.table(
    currentReviews.map((r) => ({
      id: r.id,
      orderId: r.orderId,
      createdAt: r.createdAt,
      rating: r.rating,
      content: r.content,
    })),
  )

  const keys = new Set()
  currentReviews.forEach((r) => {
    const key = `${r.id}-${r.orderId}`
    if (keys.has(key)) {
      console.warn("❌ Trùng key:", key, r)
    } else {
      keys.add(key)
    }
  })

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleHelpful = (reviewId) => {
    console.log("Helpful clicked for review:", reviewId)
  }

  // Handle image click to show preview
  const handleImageClick = (images, clickedIndex) => {
    setPreviewImages(images)
    setCurrentImageIndex(clickedIndex)
    setPreviewImage(images[clickedIndex])
    setPreviewVisible(true)
  }

  // Handle modal close
  const handlePreviewCancel = () => {
    setPreviewVisible(false)
    setPreviewImage("")
    setPreviewImages([])
    setCurrentImageIndex(0)
  }

  // Handle navigation in modal
  const handlePrevImage = () => {
    const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : previewImages.length - 1
    setCurrentImageIndex(newIndex)
    setPreviewImage(previewImages[newIndex])
  }

  const handleNextImage = () => {
    const newIndex = currentImageIndex < previewImages.length - 1 ? currentImageIndex + 1 : 0
    setCurrentImageIndex(newIndex)
    setPreviewImage(previewImages[newIndex])
  }

  return (
    <div className="product-reviews">
      <div className="reviews-header">
        <h2>ĐÁNH GIÁ SẢN PHẨM</h2>
        <div className="rating-overview">
          <div className="rating-summary">
            <div className="average-rating">
              <span className="rating-number">{averageRating.toFixed(1)}</span>
              <span className="rating-text">trên 5</span>
            </div>
            <div className="stars-display">
              <Rate disabled value={averageRating} />
            </div>
          </div>
        </div>
        <div className="filter-buttons">
          {filterButtons.map((filter) => (
            <Button
              key={filter.key}
              type={activeFilter === filter.key ? "primary" : "default"}
              className={`filter-btn ${activeFilter === filter.key ? "active" : ""}`}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label} ({filter.count})
            </Button>
          ))}
        </div>
      </div>

      <div className="reviews-list">
        {currentReviews.map((review) => (
          <div key={`${review.id}-${review.orderId}`} className="review-item">
            <div className="review-header">
              <div className="user-info">
                <Avatar icon={<UserOutlined />} className="user-avatar" />
                <div className="user-details">
                  <div className="username">{review.userName || "Ẩn danh"}</div>
                  <div className="review-meta">
                    <Rate disabled value={review.rating} className="review-rating" />
                  </div>
                  <div className="review-date">
                    {new Date(review.createdAt).toLocaleString("vi-VN")} | Phân loại hàng: {review.variantInfo || ""}
                  </div>
                </div>
              </div>
              <Button type="text" icon={<MoreOutlined />} className="more-options" />
            </div>

            <div className="review-content">
              <p className="review-comment">{review.content}</p>
              {review.images && review.images.length > 0 && (
                <div className="review-images">
                  {review.images.map((image, index) => (
                    <div key={index} className="review-image">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Review image ${index + 1}`}
                        onClick={() => handleImageClick(review.images, index)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="review-actions">
              <Button
                type="text"
                icon={<LikeOutlined />}
                className="helpful-btn"
                onClick={() => handleHelpful(review.id)}
              >
                Hữu ích?
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="no-reviews">
          <p>Không có đánh giá nào phù hợp với bộ lọc đã chọn.</p>
        </div>
      )}

      {/* Pagination component */}
      {filteredReviews.length > reviewsPerPage && ( // Only show pagination if there are more reviews than reviewsPerPage
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Pagination
            current={currentPage}
            pageSize={reviewsPerPage}
            total={filteredReviews.length}
            onChange={handlePageChange}
            showSizeChanger={false} // Disable size changer as reviewsPerPage is fixed
          />
        </div>
      )}

      {/* Image Preview Modal */}
      <Modal
        open={previewVisible}
        title={`Hình ảnh đánh giá (${currentImageIndex + 1}/${previewImages.length})`}
        footer={null}
        onCancel={handlePreviewCancel}
        width="80%"
        style={{ maxWidth: "800px" }}
        centered
      >
        <div style={{ textAlign: "center", position: "relative" }}>
          <Image
            src={previewImage || "/placeholder.svg"}
            alt="Preview"
            style={{ maxWidth: "100%", maxHeight: "70vh" }}
            preview={false}
          />

          {previewImages.length > 1 && (
            <>
              <Button
                type="primary"
                shape="circle"
                onClick={handlePrevImage}
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1000,
                }}
              >
                ‹
              </Button>
              <Button
                type="primary"
                shape="circle"
                onClick={handleNextImage}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1000,
                }}
              >
                ›
              </Button>
            </>
          )}
        </div>

        {previewImages.length > 1 && (
          <div style={{ marginTop: "16px", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
              {previewImages.map((img, index) => (
                <div
                  key={index}
                  style={{
                    width: "60px",
                    height: "60px",
                    border: index === currentImageIndex ? "2px solid #1890ff" : "1px solid #d9d9d9",
                    borderRadius: "4px",
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setCurrentImageIndex(index)
                    setPreviewImage(img)
                  }}
                >
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`Thumbnail ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ProductReviews
