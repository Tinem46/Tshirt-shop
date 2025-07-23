
import { Modal, Input } from "antd"
import { useState } from "react"
import { toast } from "react-toastify"
import { cancelOrderAPI } from "../../../utils/orderService"

const CancelOrderModal = ({ visible, onClose, orderId, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState("") 

  const handleCancel = async () => {
    setLoading(true)
    try {
      
      if(!reason.trim()){
        toast.error("Hãy nhập lý do!");
        setLoading(false);
        return;
      }

      await cancelOrderAPI(orderId, reason)
      toast.success("Huỷ đơn hàng thành công!")
      onSuccess?.()
      onClose()
    } catch (error) {
      console.log("lỗi hủy đơn", error)
      toast.error("không thể hủy đơn hàng")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      centered
      title="Xác nhận hủy đơn hàng"
      open={visible}
      onOk={handleCancel}
      onCancel={onClose}
      okText="Hủy đơn hàng"
      cancelText="Không"
      okButtonProps={{ danger: true, loading }}
    >
      <p>Bạn có chắc chắn muốn huỷ đơn hàng này không?</p>
      <div style={{ marginTop: "16px" }}>
        <Input.TextArea
          rows={4}
          placeholder="Nhập lý do hủy đơn hàng..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
    </Modal>
  )
}

export default CancelOrderModal
