// src/components/OrderStatusButton.jsx
import { Button } from "antd";
import { toast } from "react-toastify";
import api from "../../config/api";

const OrderStatusButton = ({
  orderId,
  status,
  children,
  onSuccess,
  type = "primary", // Mặc định màu xanh
  danger = false,
  style = {},
  ...props
}) => {
  const handleClick = async () => {
    try {
      await api.patch(`Orders/${orderId}/status`, { status });
      console.log(`Order ${orderId} status updated to ${status}`);
      toast.success("Order status updated successfully!");
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update order status"
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
