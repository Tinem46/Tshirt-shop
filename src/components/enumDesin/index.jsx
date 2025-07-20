// Enum trạng thái cho dễ dùng
export const DESIGN_STATUS = {
  draft: 0,
  liked: 1,
  accepted: 2,
  request: 3,
  order: 4,
  shipping: 5,
  delivered: 6,
  done: 7,
  rejected: 8,
};

export const DESIGN_LABEL = {
  [DESIGN_STATUS.draft]: "Nháp",
  [DESIGN_STATUS.liked]: "Đã thích",
  [DESIGN_STATUS.accepted]: "Được duyệt",
  [DESIGN_STATUS.request]: "Yêu cầu đặt hàng",
  [DESIGN_STATUS.order]: "Chờ đặt hàng",
  [DESIGN_STATUS.shipping]: "Đang vận chuyển",
  [DESIGN_STATUS.delivered]: "Đã giao",
  [DESIGN_STATUS.done]: "Hoàn thành",
  [DESIGN_STATUS.rejected]: "Bị từ chối",
};

export const DESIGN_COLOR = {
  [DESIGN_STATUS.draft]: "default",
  [DESIGN_STATUS.liked]: "magenta",
  [DESIGN_STATUS.accepted]: "blue",
  [DESIGN_STATUS.request]: "orange",
  [DESIGN_STATUS.order]: "cyan",
  [DESIGN_STATUS.shipping]: "purple",
  [DESIGN_STATUS.delivered]: "green",
  [DESIGN_STATUS.done]: "success",
  [DESIGN_STATUS.rejected]: "red",
};
