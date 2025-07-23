import api from "../config/api";

export const getMyOrders = () => api.get("orders/my-orders");

export const confirmDelivered = (orderId) => api.put("/orders/batch/confirm-delivered",[orderId]);

export const cancelOrderAPI = (orderId, reason) =>
  api.patch(`/orders/${orderId}/cancel`, { reason });

export const requestCancellationAPI = (orderId, reason, imageUrls = []) =>
  api.patch(`/orders/${orderId}/request-cancellation`, {
    reason,
    imageUrls,
  });

export const getCancelledOrders = () => api.get("orders/cancelled");