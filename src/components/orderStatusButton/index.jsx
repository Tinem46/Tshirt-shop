import { Button } from "antd";
import { toast } from "react-toastify";
import api from "../../config/api";
import Swal from "sweetalert2";

const OrderStatusButton = ({
  orderId,
  status,
  children,
  onSuccess,
  type = "primary",
  danger = false,
  style = {},
  ...props
}) => {
  const handleClick = async () => {
    const isBatch = Array.isArray(orderId);
    const ids = isBatch ? orderId : [orderId];

    const endpointMap = {
      9: "Orders/batch/process",
      10: "Orders/batch/mark-shipping",
      11: "Orders/batch/confirm-delivered",
      12: "Orders/batch/complete",
    };

    try {
      // ✅ Nếu là hủy đơn lẻ → dùng PATCH /Orders/{id}/cancel với lý do
      if (status === 6 && !isBatch) {
        const result = await Swal.fire({
          title: "Nhập lý do hủy đơn",
          input: "text",
          inputPlaceholder: "Nhập lý do tại đây...",
          showCancelButton: true,
          confirmButtonText: "Xác nhận",
          cancelButtonText: "Hủy",
          inputValidator: (value) => {
            if (!value || !value.trim()) {
              return "Bạn cần nhập lý do hủy đơn!";
            }
          },
        });

        if (!result.isConfirmed) return;

        const reason = result.value;
        await api.patch(`Orders/${orderId}/cancel`, { reason });
        toast.success("Hủy đơn thành công!");
        if (onSuccess) onSuccess();
        return;
      }

      // ✅ Nếu là batch + status 3-6 → dùng PUT
      if (isBatch && endpointMap[status]) {
        await api.put(endpointMap[status], ids);
      } else {
        // ✅ Fallback: PATCH đơn lẻ
        await api.patch(`Orders/${orderId}/status`, { status });
      }

      toast.success("Cập nhật trạng thái thành công!");
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Lỗi khi cập nhật trạng thái"
      );
    }
  };

  return (
    <Button
      onClick={handleClick}
      type={type}
      danger={danger}
      style={style}
      {...props}
    >
      {children || "Update Status"}
    </Button>
  );
};

export default OrderStatusButton;
