import { useEffect, useState } from "react"
import {
  Modal,
  Rate,
  Input,
  Upload,
  Button,
  Image,
  Space,
  Typography,
  Row,
  Col,
  message,
  Divider,
} from "antd"
import { CameraOutlined, DeleteOutlined } from "@ant-design/icons"

const { TextArea } = Input
const { Text, Title } = Typography

const ProductReviewModal = ({ visible, onCancel, productList = [], onSubmit, mode = ' create' }) => {
  const ratingTexts = {
    1: "Rất Tệ",
    2: "Tệ",
    3: "Bình Thường",
    4: "Tốt",
    5: "Tuyệt Vời",
  }

  const [reviews, setReviews] = useState([])

  useEffect(() => {
    if (visible && productList.length > 0) {
      setReviews(
        productList.map((product) => ({
          rating: product.rating || 5,
          content: product.content || "",
          images: product.images || [],
          fileList: (product.images || []).map((img, idx) => ({
            uid: String(idx),
            name: `image-${idx}`,
            status: "done",
            url: img,
          })),
          reviewId: product.reviewId || null,
        }))
      )
    }
    // Không cần else setReviews([]), đã reset lúc mở/đóng modal rồi!
  }, [visible, productList])


  useEffect(() => {
    if (!visible) setReviews([]);
  }, [visible]);


  useEffect(() => {
    if (visible) {
      console.log('[DEBUG] productList truyền vào modal:', productList);
    }
  }, [visible, productList]);

  const handleChange = (index, key, value) => {
    const updated = [...reviews]
    updated[index][key] = value
    setReviews(updated)
  }

  const handleUploadChange = (index, { fileList: newFileList }) => {
    const newImages = newFileList
      .map((file) =>
        file.originFileObj ? URL.createObjectURL(file.originFileObj) : file.url || ""
      )
      .filter(Boolean)

    handleChange(index, "fileList", newFileList)
    handleChange(index, "images", newImages)
  }

  const handleRemoveImage = (productIndex, imageIndex) => {
    const updatedFiles = reviews[productIndex].fileList.filter((_, i) => i !== imageIndex)
    const updatedPreviews = reviews[productIndex].images.filter((_, i) => i !== imageIndex)
    handleChange(productIndex, "fileList", updatedFiles)
    handleChange(productIndex, "images", updatedPreviews)
  }

  const handleSubmit = () => {
    for (let i = 0; i < reviews.length; i++) {
      const review = reviews[i]
      if (!review.rating) {
        return message.warning(`Vui lòng chọn số sao cho sản phẩm thứ ${i + 1}`)
      }
      if (!review.content.trim()) {
        return message.warning(`Vui lòng nhập nội dung đánh giá cho sản phẩm thứ ${i + 1}`)
      }
    }

    const reviewDataList = productList.map((p, i) => ({
      productVariantId: p.productVariantId,
      orderId: p.orderId,
      rating: reviews[i].rating,
      content: reviews[i].content.trim(),
      images: reviews[i].images,
      reviewId: reviews[i].reviewId,
    }))

    onSubmit(reviewDataList, mode)
    setReviews([])
    onCancel()
  }

  return (
    <Modal
      title={<Title level={4} style={{ margin: 0 }}>Đánh giá sản phẩm</Title>}
      open={visible}
      onCancel={onCancel}
      width={700}
      styles={{
        body: {
          maxHeight: "70vh",
          overflowY: "auto",
          paddingRight: 16,
        },
      }}
      footer={
        <div style={{ textAlign: "right" }}>
          <Space>
            <Button onClick={onCancel}>Hủy</Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              style={{ backgroundColor: "#ff4d4f", borderColor: "#ff4d4f" }}
            >
              Hoàn Thành
            </Button>
          </Space>
        </div>
      }
    >
      {productList.map((product, index) => {
        const review = reviews[index] || {}
        console.log("Review for product:", product.productVariantId, review);

        return (
          <div key={product.productVariantId} style={{ marginBottom: 32 }}>
            <Row gutter={16} style={{ marginBottom: 12 }}>
              <Col span={4}>
                <Image
                  src={product.image || "/placeholder.svg"}
                  width={80}
                  height={80}
                  style={{ objectFit: "cover", borderRadius: 6 }}
                />
              </Col>
              <Col span={20}>
                <Text strong>{product.name}</Text><br />
                <Text type="secondary">Phân loại: {product.category}</Text>
              </Col>
            </Row>

            <div style={{ marginBottom: 16 }}>
              <Text strong>Chất lượng sản phẩm</Text><br />
              <Space align="center">
                <Rate
                  value={review.rating}
                  onChange={(value) => handleChange(index, "rating", value)}
                />
                <Text style={{ color: "#faad14" }}>{ratingTexts[review.rating]}</Text>
              </Space>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong>Nội dung đánh giá</Text>
              <TextArea
                rows={3}
                maxLength={500}
                showCount
                value={review.content}
                onChange={(e) => handleChange(index, "content", e.target.value)}
                placeholder="Hãy chia sẻ trải nghiệm của bạn về sản phẩm này..."
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <Upload
                multiple
                accept="image/*"
                beforeUpload={() => false}
                fileList={review.fileList}
                showUploadList={false}
                onChange={(info) => handleUploadChange(index, info)}
              >
                <Button
                  icon={<CameraOutlined />}
                  style={{ color: "#ff4d4f", borderColor: "#ff4d4f" }}
                >
                  Thêm Hình ảnh
                </Button>
              </Upload>
            </div>

            {review.images?.length > 0 && (
              <Row gutter={[8, 8]}>
                {review.images.map((img, imgIdx) => (
                  <Col span={6} key={imgIdx}>
                    <div style={{ position: "relative" }}>
                      <Image
                        src={img}
                        width="100%"
                        height={80}
                        style={{ objectFit: "cover", borderRadius: 4 }}
                      />
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveImage(index, imgIdx)}
                        style={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          borderRadius: "50%",
                          padding: 0,
                          width: 24,
                          height: 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      />
                    </div>
                  </Col>
                ))}
              </Row>
            )}

            {index !== productList.length - 1 && <Divider />}
          </div>
        )
      })}
    </Modal>
  )
}

export default ProductReviewModal
