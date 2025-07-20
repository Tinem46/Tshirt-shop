import { Button } from "antd";
import { toast } from "react-toastify";

import Swal from "sweetalert2";
import api from "../../config/api";

/**
 * props:
 *   - designId: string (bắt buộc)
 *   - status: số trạng thái muốn cập nhật (CustomDesignStatus enum)
 *   - children: label nút
 *   - onSuccess: callback reload
 *   - type, danger, style: custom của Antd
 */
const DesignStatusButton = ({
  designId,
  status,
  children,
  onSuccess,
  type = "primary",
  danger = false,
  style = {},
  ...props
}) => {
  const handleClick = async () => {
    try {
      // Nếu là chuyển về Rejected hoặc Draft thì xác nhận với user
      if (status === 0 || status === 8) {
        const result = await Swal.fire({
          title:
            status === 8
              ? "Xác nhận từ chối thiết kế này?"
              : "Chuyển về bản nháp?",
          text:
            status === 8
              ? "Bạn chắc chắn muốn từ chối thiết kế này?"
              : "Thiết kế sẽ trở về bản nháp (Draft)",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Xác nhận",
          cancelButtonText: "Huỷ",
        });
        if (!result.isConfirmed) return;
      }

      await api.patch(`CustomDesign/${designId}/status`, { status });
      toast.success("Cập nhật trạng thái thành công!");
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Có lỗi khi cập nhật trạng thái!"
      );
      console.error("Error updating design status:", err);
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
      {children}
    </Button>
  );
};

export default DesignStatusButton;
