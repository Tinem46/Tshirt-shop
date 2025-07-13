import { useState } from "react";
import { toast } from "react-toastify";
import { deleteAddress } from "../../../utils/addressService";
import { Modal } from "antd/lib";

const DeleteAddressModal = ({ visible, onClose, addressId, onSuccess }) => {
    const [loading, setLoading] = useState(false);

    const handleDelte = async () => {
        try {
            await deleteAddress(addressId);
            toast.success("Xóa địa chỉ thành công!");
            onSuccess?.()
            onClose();
        } catch (error) {
            console.log();
            console.error("Lỗi xóa địa chỉ:", error);
            toast.error("Không thể xóa địa chỉ.");
        } finally {
            setLoading(false);
        }
    }
    return (
        <Modal
            centered
            title="Xác nhận xóa địa chỉ"
            open={visible}
            onOk={handleDelte}
            onCancel={onClose}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true, loading }}
        >
            <p>Bạn có chắc chắn muốn xoá địa chỉ này không?</p>
        </Modal>
    )
}
export default DeleteAddressModal;