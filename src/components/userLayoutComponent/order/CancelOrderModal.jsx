import { Modal } from "antd"
import { useState } from "react"
import {  cancelOrderAPI } from "../../../utils/orderService"
import { toast } from "react-toastify"

const CancelOrderModal = ({ visible, onClose, orderId, onSuccess }) => {
    const [loading, setLoading] = useState(false);

    const handleCancel = async () => {
        setLoading(true)
        try {
            await cancelOrderAPI(orderId)
            toast.success("Huỷ đơn hàng thành công!")
            onSuccess?.()
            onClose()
        } catch (error) {
            console.log("lỗi hủy đơn", error);
            toast.error("không thể hủy đơn hàng");
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
            cancelText="không"
            okButtonProps={{ danger: true, loading }}
        >
            <p>Bạn có chắc chắn muốn huỷ đơn hàng này không?</p>
        </Modal>
    )
}
export default CancelOrderModal