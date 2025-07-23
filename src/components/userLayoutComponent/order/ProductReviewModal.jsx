import { useEffect, useState } from "react";
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
  Form,
} from "antd";
import { CameraOutlined } from "@ant-design/icons";
import uploadFile from "../../../utils/upload";
import { toast } from "react-toastify";


const { TextArea } = Input;
const { Text, Title } = Typography;

const ProductReviewModal = ({ visible, onCancel, productList = [], onSubmit, mode = "create" }) => {
  const ratingTexts = {
    1: "Rất Tệ",
    2: "Tệ",
    3: "Bình Thường",
    4: "Tốt",
    5: "Tuyệt Vời",
  };

  const [reviews, setReviews] = useState([]);

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
      );
    }
  }, [visible, productList]);

  useEffect(() => {
    if (!visible) setReviews([]);
  }, [visible]);

  const handleChange = (index, key, value) => {
    const updated = [...reviews];
    updated[index][key] = value;
    setReviews(updated);
  };

  const handleUploadChange = (index, { fileList: newFileList }) => {

    const newImages = newFileList
      .map((file) =>
        file.originFileObj ? URL.createObjectURL(file.originFileObj) : file.url || ""
      )
      .filter(Boolean);

    console.log(`[UploadChange] Product ${index} - Preview URLs:`, newImages);

    handleChange(index, "fileList", newFileList);
    handleChange(index, "images", newImages);
  };

  const handleRemoveImage = (productIndex, imageIndex) => {
    const updatedFiles = reviews[productIndex].fileList.filter((_, i) => i !== imageIndex);
    const updatedPreviews = reviews[productIndex].images.filter((_, i) => i !== imageIndex);
    handleChange(productIndex, "fileList", updatedFiles);
    handleChange(productIndex, "images", updatedPreviews);
  };

  const validateImage = (file) => {

    const isAcceptedType = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    if (!isAcceptedType) {
      message.error("Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.");
      return Upload.LIST_IGNORE;
    }
    const isLt5MB = file.size / 1024 / 1024 < 5;
    if (!isLt5MB) {
      message.error("Kích thước ảnh phải nhỏ hơn 5MB.");
      return Upload.LIST_IGNORE;
    }
    return false;
  };

 
  const handleSubmit = async () => {
    for (let i = 0; i < reviews.length; i++) {
      const review = reviews[i];
      if (!review.rating) {
        return message.warning(`Vui lòng chọn số sao cho sản phẩm thứ ${i + 1}`);
      }
      if (!review.content.trim()) {
        return message.warning(`Vui lòng nhập nội dung đánh giá cho sản phẩm thứ ${i + 1}`);
      }
    }

    message.loading({ content: "Đang tải ảnh...", key: "uploading", duration: 0 });

    try {
      const uploadedReviews = await Promise.all(
        reviews.map(async (r, i) => {
          console.log(`[Upload] Product ${i} - Starting upload with fileList:`, r.fileList);

          const uploadedURLs = await Promise.all(
            r.fileList.map(async (file, j) => {
              if (file.originFileObj) {
                const url = await uploadFile(file.originFileObj);
                console.log(`[Upload] Product ${i}, Image ${j} uploaded to:`, url);
                return url;
              } else {
                console.log(`[Upload] Product ${i}, Image ${j} reused existing:`, file.url);
                return file.url || "";
              }
            })
          );

          return { ...r, images: uploadedURLs };
        })
      );

      console.log("[Submit] Uploaded review data:", uploadedReviews);

      const reviewDataList = productList.map((p, i) => {
        const r = uploadedReviews[i];
        const result = mode === "create"
          ? {
            productVariantId: p.productVariantId,
            orderId: p.orderId,
            rating: r.rating,
            content: r.content.trim(),
            images: r.images,
          }
          : {
            rating: r.rating,
            content: r.content.trim(),
            images: r.images,
            reviewId: r.reviewId,
          };
        console.log(`[Submit] Final review object for product ${i}:`, result);
        return result;
      });

      message.success({ content: "Gửi đánh giá thành công!", key: "uploading" });
      onSubmit(reviewDataList, mode);
      setReviews([]);
      onCancel();
    } catch (err) {
      console.error("[Submit] Upload error:", err);
      message.error({ content: "Lỗi khi upload ảnh!", key: "uploading" });
    }
  };

  return (
    <Modal
      title={<Title level={4} style={{ margin: 0 }}>Đánh giá sản phẩm</Title>}
      open={visible}
      onCancel={onCancel}
      width={700}
      styles={{ body: { maxHeight: "70vh", overflowY: "auto", paddingRight: 16 } }}
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
        const review = reviews[index] || {};

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

            <Form layout="vertical">
              <Form.Item
                label={<Text strong>Chất lượng sản phẩm</Text>}
                required
                validateStatus={!review.rating ? "error" : ""}
                help={!review.rating ? "Vui lòng chọn số sao!" : null}
              >
                <Space align="center">
                  <Rate
                    value={review.rating}
                    onChange={(value) => handleChange(index, "rating", value)}
                  />
                  <Text style={{ color: "#faad14" }}>{ratingTexts[review.rating]}</Text>
                </Space>
              </Form.Item>

              <Form.Item
                label={<Text strong>Nội dung đánh giá</Text>}
                required
                validateStatus={!review.content?.trim() ? "error" : ""}
                help={!review.content?.trim() ? "Vui lòng nhập nội dung đánh giá!" : null}
              >
                <Input.TextArea
                  rows={3}
                  maxLength={500}
                  showCount
                  placeholder="Hãy chia sẻ trải nghiệm của bạn..."
                  value={review.content}
                  onChange={(e) => handleChange(index, "content", e.target.value)}
                />
              </Form.Item>

              <Upload
                multiple
                accept="image/*"
                fileList={review.fileList || []}
                beforeUpload={(file) => {
                  return validateImage(file, (review.fileList ?? []).length);
                }}
                onChange={(info) => {
                  handleUploadChange(index, info);
                }}
                listType="picture-card"

                showUploadList={{
                  showPreviewIcon: false,
                  showRemoveIcon: true,
                }}
                onRemove={(file) => {
                  const imgIndex = review.fileList.findIndex(f => f.uid === file.uid);
                  handleRemoveImage(index, imgIndex);
                  return false;
                }}
              >
                {(review.fileList?.length ?? 0) < 10 && (
                  <div>
                    <CameraOutlined style={{ fontSize: 20 }} />
                    <div style={{ marginTop: 8 }}>Thêm ảnh</div>
                  </div>
                )}
              </Upload>

            </Form>

            {index !== productList.length - 1 && <Divider />}
          </div>
        );
      })}
    </Modal >
  );
};

export default ProductReviewModal;

// if (newFileList.length > 5) {
    //   toast.error("Chỉ cho phép tải tối đa 5 ảnh.");
    //   newFileList = newFileList.slice(0, 5);
    // }
