import { useState } from "react";
import {
  Modal,
  Input,
  Upload,
  Button,
  message,
  Space,
  Typography,
  Row,
  Col,
  Form,
  Divider,
} from "antd";
import { CameraOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import uploadFile from "../../../utils/upload";
import { requestCancellationAPI } from "../../../utils/orderService";

const { Text, Title } = Typography;

const RequestCancelOrderModal = ({ visible, onClose, orderId, onSuccess }) => {
  const [reason, setReason] = useState("");
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);

  const validateImage = (file) => {
    const isAccepted = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    if (!isAccepted) {
      message.error("Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.");
      return Upload.LIST_IGNORE;
    }
    const isLt5MB = file.size / 1024 / 1024 < 5;
    if (!isLt5MB) {
      message.error("Ảnh phải nhỏ hơn 5MB.");
      return Upload.LIST_IGNORE;
    }
    if (fileList.length >= 5) {
      message.warning("Chỉ cho phép tối đa 5 ảnh");
      toast.error("Chỉ cho phép tối đa 5 ảnh");
      return Upload.LIST_IGNORE;
    }
    return false;
  };



  const handleImageChange = (newFileList, setFileList) => {
    if (newFileList.length > 10) {
      toast.error("Chỉ cho phép up 10 ảnh")
      newFileList = newFileList.slice(0, 10);
    }
    setFileList(newFileList);
  }

  const handleSubmit = async () => {
    if (!reason.trim()) {
      return message.warning("Vui lòng nhập lý do hủy đơn hàng.");
    }

    setLoading(true);
    try {
      const imageUrls = await Promise.all(
        fileList.map(async (file) => {
          if (file.originFileObj) {
            return await uploadFile(file.originFileObj);
          } else {
            return file.url || "";
          }
        })
      );

      await requestCancellationAPI(orderId, reason, imageUrls);
      toast.success("Yêu cầu hủy đơn đã được gửi!");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("❌ Lỗi yêu cầu hủy:", error);
      toast.error("Không thể gửi yêu cầu hủy đơn.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      width={600}
      styles={{
        body: { maxHeight: "70vh", overflowY: "auto", paddingRight: 16 },
      }}
      title={
        <Title level={4} style={{ margin: 0 }}>
          Yêu cầu hủy đơn hàng
        </Title>
      }
      footer={
        <div style={{ textAlign: "right" }}>
          <Space>
            <Button onClick={onClose}>Hủy</Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              style={{ backgroundColor: "#ff4d4f", borderColor: "#ff4d4f" }}
              loading={loading}
            >
              Gửi yêu cầu
            </Button>
          </Space>
        </div>
      }
    >
      <Row gutter={16} style={{ marginBottom: 8 }}>
        <Col span={24}>
          <Text type="secondary">
            Vui lòng nhập lý do hủy đơn hàng và thêm ảnh liên quan (nếu có) để hỗ trợ xử lý nhanh hơn.
          </Text>
        </Col>
      </Row>

      <Form layout="vertical">
        <Form.Item
          label={<Text strong>Lý do hủy đơn hàng</Text>}
          required
          validateStatus={!reason.trim() ? "error" : ""}
          help={!reason.trim() ? "Vui lòng nhập lý do!" : null}
        >
          <Input.TextArea
            rows={3}
            value={reason}
            maxLength={500}
            showCount
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do hủy đơn hàng..."
          />
        </Form.Item>

        <Form.Item label={<Text strong>Ảnh minh họa</Text>}>
          <Upload
            multiple
            accept="image/*"
            fileList={fileList}
            listType="picture-card"
            beforeUpload={validateImage}
            onChange={({ fileList: newFileList }) => handleImageChange(newFileList, setFileList)}
            onRemove={(file) => {
              setFileList(fileList.filter((f) => f.uid !== file.uid));
              return false;
            }}
            showUploadList={{ showPreviewIcon: false }}
            customRequest={({ onSuccess }) => setTimeout(() => onSuccess("ok"), 0)}
          >
            {fileList.length < 10 && (
              <div>
                <CameraOutlined style={{ fontSize: 20 }} />
                <div style={{ marginTop: 8 }}>Thêm ảnh</div>
              </div>
            )}
          </Upload>
        </Form.Item>
      </Form>

      <Divider />
      <Text type="secondary" style={{ fontSize: 13 }}>
        Lưu ý: Sau khi gửi yêu cầu, chúng tôi sẽ xác nhận lại với bạn trước khi hủy đơn.
      </Text>
    </Modal>
  );
};

export default RequestCancelOrderModal;
