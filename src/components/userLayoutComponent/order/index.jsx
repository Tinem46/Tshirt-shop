import { useEffect, useState } from "react";
import {
  Layout,
  Tabs,
  Button,
  Input,
  Spin,
  Empty,
  Modal,
  message,
  Tag,
  Space,
} from "antd";
import {
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { getMyOrders, confirmDelivered } from "../../../utils/orderService";
import "./index.scss";
import { toast } from "react-toastify";
import CancelOrderModal from "./CancelOrderModal";
import {
  createReview,
  getUserReviewsByUserID,
  updateReview,
} from "../../../utils/reviewService";
import ProductReviewModal from "./ProductReviewModal";
const { Header, Content } = Layout;
const { TabPane } = Tabs;
const { Search } = Input;

const STATUS = {
  all: -1,
  pending: 0,
  paid: 1,
  processing: 3,
  shipping: 4,
  delivered: 5,
  completed: 2,
  cancelled: 6,
  returned: 7,
};

const STATUS_LABEL = {
  [STATUS.pending]: "Chờ thanh toán",
  [STATUS.paid]: "Đã thanh toán",
  [STATUS.processing]: "Đang xử lý",
  [STATUS.shipping]: "Đang vận chuyển",
  [STATUS.delivered]: "Đã giao hàng",
  [STATUS.completed]: "Đã hoàn thành",
  [STATUS.cancelled]: "Đã huỷ",
  [STATUS.returned]: "Đã trả hàng/Hoàn tiền",
};

const STATUS_COLORS = {
  [STATUS.pending]: "orange",
  [STATUS.paid]: "blue",
  [STATUS.processing]: "cyan",
  [STATUS.shipping]: "purple",
  [STATUS.delivered]: "green",
  [STATUS.completed]: "success",
  [STATUS.cancelled]: "red",
  [STATUS.returned]: "magenta",
};

const Orders = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProductList, setSelectedProductList] = useState([]);
  const [reviewMode, setReviewMode] = useState("create");
  const [userReviews, setUserReviews] = useState([]);

  function isOrderListStatusChanged(oldOrders, newOrders) {
    if (oldOrders.length !== newOrders.length) return true;
    // Map theo id để tránh phụ thuộc thứ tự
    const oldMap = new Map(oldOrders.map((o) => [o.id, o.status]));
    for (let i = 0; i < newOrders.length; i++) {
      const newOrder = newOrders[i];
      if (!oldMap.has(newOrder.id)) return true; // order mới
      if (oldMap.get(newOrder.id) !== newOrder.status) return true; // status đổi
    }
    return false;
  }
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getMyOrders();
      const newOrders = res.data || [];
      console.log("Fetched orders:", newOrders);
      if (isOrderListStatusChanged(orders, newOrders)) {
        setOrders(newOrders);
        // toast.success("Đơn hàng đã được cập nhật!");
      }
    } catch (err) {
      console.error("Error loading orders", err);
      message.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(); // Lần đầu load
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await getUserReviewsByUserID(userId);
      setUserReviews(res.data?.data || []);
      console.log("Dữ liệu review được lọc theo UserId:", res.data?.data);
    } catch (error) {
      setUserReviews([]);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesTab =
      activeTab === "all" ? true : o.status === STATUS[activeTab];
    const matchesSearch =
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.receiverName?.toLowerCase().includes(search.toLowerCase()) ||
      o.orderItems?.some((it) =>
        it.productName?.toLowerCase().includes(search.toLowerCase())
      );
    return matchesTab && matchesSearch;
  });

  const handleConfirmReceived = async (id) => {
    try {
      await confirmDelivered(id);
      toast.success("bạn đã xác nhận đã nhận hàng thành công!");
      await fetchOrders();
    } catch (error) {
      console.error("❌ Lỗi xác nhận:", error);
      toast.error("Xác nhận thất bại. Vui lòng thử lại sau.");
    }
  };
  const openCancelModal = (id) => {
    setSelectedOrderId(id);
    setCancelModalOpen(true);
  };

  const handleSubmitReview = async (reviewList, mode) => {
    try {
      const results = await Promise.all(
        reviewList.map((review) => {
          if (mode === "update" && review.reviewId) {
            return updateReview(review.reviewId, {
              rating: review.rating,
              content: review.content,
              images: review.images,
            });
          } else {
            console.log("[DEBUG] Create review - data:", review);
            return createReview({
              productVariantId: review.productVariantId,
              orderId: review.orderId,
              rating: review.rating,
              content: review.content,
              images: review.images,
            });
          }
        })
      );
      console.log("[DEBUG] Review API results:", results);
      toast.success(
        mode === "update"
          ? "Cập nhật đánh giá thành công!"
          : "Gửi đánh giá thành công!"
      );
      setReviewModalOpen(false);
      fetchOrders();
      fetchReviews();
    } catch (error) {
      console.error("❌ Lỗi khi gửi đánh giá:", error, error?.response);
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Gửi đánh giá thất bại. Vui lòng thử lại sau.");
      }
    }
  };

  function findReviewOfItem(item, orderId) {
    return userReviews.find(
      (r) =>
        r.productVariantId === item.productVariantId && r.orderId === orderId
    );
  }

  const handleOpenReviewModal = (order, mode = "create") => {
    const productList = order.orderItems.map((item) => {
      const oldReview = findReviewOfItem(item, order.id);
      return {
        productId: item.productId,
        productVariantId: item.productVariantId,
        orderId: order.id,
        name: item.productName,
        image: item.productImage || "/placeholder.svg",
        category: item.variantName || "Không có phân loại",
        reviewId: oldReview?.id || null,
        rating: oldReview?.rating || 5,
        content: oldReview?.content || "",
        images: oldReview?.images || [],
      };
    });
    setSelectedProductList(productList);
    setReviewMode(mode);
    setReviewModalOpen(true);
  };

  const renderOrderActions = (order) => {
    const actions = [];
    switch (order.status) {
      case STATUS.pending:
      case STATUS.paid:
        actions.push(
          <Button
            key="cancel"
            danger
            onClick={() => openCancelModal(order.id)}
            icon={<CloseCircleOutlined />}
          >
            Hủy đơn hàng
          </Button>
        );
        break;
      case STATUS.shipping:
        actions.push(
          <Button
            key="confirm"
            type="primary"
            onClick={() => handleConfirmReceived(order.id)}
            icon={<CheckCircleOutlined />}
          >
            Đã nhận được hàng
          </Button>
        );
        break;
      case STATUS.delivered:{
        const allReviewed = order.orderItems.every((item) =>
          findReviewOfItem(item, order.id)
        );
        const noneReviewed = order.orderItems.every(
          (item) => !findReviewOfItem(item, order.id)
        );

        if (noneReviewed) {
          actions.push(
            <Button
              key="review"
              type="primary"
              onClick={() => handleOpenReviewModal(order, "create")}
              icon={<CheckCircleOutlined />}
            >
              Đánh giá
            </Button>
          );
        } else if (allReviewed) {
          actions.push(
            <Button
              key="review-again"
              type="primary"
              onClick={() => handleOpenReviewModal(order, "update")}
              icon={<CheckCircleOutlined />}
            >
              Đánh giá lại
            </Button>
          );
        }
      }

      break;
    }
    return actions;
  };

  const formatVND = (n) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(n);
  const formatDate = (d) =>
    new Date(d).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <>
      <Layout className="orders-page-layout">
        <Header className="orders-header-section">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="orders-status-tabs"
          >
            <TabPane tab="Tất cả" key="all" />
            <TabPane tab="Chờ Thanh Toán" key="pending" />
            <TabPane tab="Đã Thanh Toán" key="paid" />
            <TabPane tab="Đang Xử Lý" key="processing" />
            <TabPane tab="Đang Vận Chuyển" key="shipping" />
            <TabPane tab="Đã Giao Hàng" key="delivered" />
            <TabPane tab="Đã Hoàn Thành" key="completed" />
            <TabPane tab="Đã Hủy" key="cancelled" />
            <TabPane tab="Đã Hoàn Tiền" key="returned" />
          </Tabs>
        </Header>
        <div className="orders-search-bar-container">
          {" "}
          {/* New container for search bar */}
          <Search
            placeholder="Tìm kiếm..."
            allowClear
            prefix={<SearchOutlined />}
            size="large"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Content className="orders-content-section">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <Empty
              description="Chưa có đơn hàng nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <div className="orders-list">
              {filteredOrders.map((order) => (
                <div key={order.id} className="order-item-block">
                  <div className="order-card-header">
                    <div className="order-info">
                      <span className="order-number">#{order.orderNumber}</span>
                      <span className="order-date">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <Tag
                      color={STATUS_COLORS[order.status]}
                      className="order-status-tag"
                    >
                      {STATUS_LABEL[order.status]}
                    </Tag>
                  </div>
                  <div className="order-card-items">
                    {order.orderItems.map((item, idx) => (
                      <div key={idx} className="order-item-row">
                        <div className="item-image-wrapper">
                          <img
                            src={item.productImage || "/placeholder.svg"}
                            alt={item.productName}
                            className="item-image"
                          />
                        </div>
                        <div className="item-details">
                          <div className="item-name">{item.productName}</div>
                          {item.variantName && (
                            <div className="item-variant">
                              Phân loại: {item.variantName}
                            </div>
                          )}
                          <div className="item-quantity">x{item.quantity}</div>
                        </div>
                        <div className="item-price">
                          {formatVND(item.unitPrice)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="order-card-summary">
                    <div className="shipping-info">
                      <p>
                        <strong>Người nhận:</strong> {order.receiverName}
                      </p>
                      <p>
                        <strong>Điện thoại:</strong> {order.receiverPhone}
                      </p>
                      <p>
                        <strong>Địa chỉ:</strong> {order.shippingAddress}
                      </p>
                      {order.trackingNumber && (
                        <p>
                          <strong>Mã vận đơn:</strong> {order.trackingNumber}
                        </p>
                      )}
                    </div>
                    <div className="price-summary">
                      <div className="price-row">
                        <span>Tạm tính:</span>
                        <span>{formatVND(order.subtotalAmount)}</span>
                      </div>
                      <div className="price-row">
                        <span>Phí vận chuyển:</span>
                        <span>{formatVND(order.shippingFee)}</span>
                      </div>
                      {order.discountAmount > 0 && (
                        <div className="price-row discount">
                          <span>Giảm giá:</span>
                          <span>-{formatVND(order.discountAmount)}</span>
                        </div>
                      )}
                      <div className="price-row total">
                        <span>Thành tiền:</span>
                        <span className="total-amount">
                          {formatVND(order.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="order-card-actions">
                    <Space>{renderOrderActions(order)}</Space>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Content>
      </Layout>
      <CancelOrderModal
        visible={cancelModalOpen}
        orderId={selectedOrderId}
        onClose={() => setCancelModalOpen(false)}
        onSuccess={fetchOrders}
      />

      <ProductReviewModal
        visible={reviewModalOpen}
        onCancel={() => setReviewModalOpen(false)}
        productList={selectedProductList}
        onSubmit={handleSubmitReview}
        mode={reviewMode}
      />
    </>
  );
};

export default Orders;
