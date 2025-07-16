import { Modal, Descriptions, Spin, Empty } from "antd";

const ReviewStatsModal = ({ open, onClose, variant, reviewStats, loading }) => {
  return (
    <Modal
      title={`Đánh giá cho biến thể: ${variant?.variantSku || "—"}`}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      {loading ? (
        <Spin />
      ) : reviewStats ? (
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Tổng số đánh giá">
            {reviewStats.totalReviews}
          </Descriptions.Item>
          <Descriptions.Item label="Điểm trung bình">
            {reviewStats.averageRating?.toFixed(1)}
          </Descriptions.Item>
          {[5, 4, 3, 2, 1].map((star) => (
            <Descriptions.Item label={`Số sao ${star}`}>
              {reviewStats[`rating${star}`] || 0}
            </Descriptions.Item>
          ))}
        </Descriptions>
      ) : (
        <Empty description="Không có dữ liệu đánh giá" />
      )}
    </Modal>
  );
};

export default ReviewStatsModal;
