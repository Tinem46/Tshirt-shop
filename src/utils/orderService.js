import api from "../config/api";

export const getMyOrders = () => api.get("orders/my-orders");

export const cancelOrder = (orderId) => api.patch(`/orders/${orderId}/cancel`,{reason: "khách hàng hủy"});

export const cancelOrderAPI = (orderId) => api.patch(`/orders/${orderId}/status`,{status: 6, reason: "khách hàng hủy"})

export const confirmDelivered = (orderId) => api.put("/orders/batch/confirm-delivered",[orderId]);