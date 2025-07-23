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
  Alert,
} from "antd";
import {
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { getMyOrders, confirmDelivered, getCancelledOrders } from "../../../utils/orderService";
import "./index.scss";
import { toast } from "react-toastify";
import CancelOrderModal from "./CancelOrderModal";
import { createReview, getUserReviewsByUserID, updateReview } from "../../../utils/reviewService";
import ProductReviewModal from "./ProductReviewModal";
import RequestCancelOrderModal from "./RequestCancelOrderModal";
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
  cancellationRequested: 8,
};

const STATUS_LABEL = {
  [STATUS.pending]: "Chờ thanh toán",
  [STATUS.paid]: "Đã thanh toán",
  [STATUS.processing]: "Đang xử lý",
  [STATUS.shipping]: "Đang vận chuyển",
  [STATUS.delivered]: "Đã giao hàng",
  [STATUS.completed]: "Đã hoàn thành",
  [STATUS.cancelled]: "Đã huỷ",
  [STATUS.cancellationRequested]: "Yêu cầu hủy/trả đang chờ duyệt",
};

const STATUS_COLORS = {
  [STATUS.pending]: "orange",
  [STATUS.paid]: "blue",
  [STATUS.processing]: "cyan",
  [STATUS.shipping]: "purple",
  [STATUS.delivered]: "green",
  [STATUS.completed]: "success",
  [STATUS.cancelled]: "red",
  [STATUS.cancellationRequested]: "gold",
};


const PAYMENT_STATUS_LABEL = {
  0: "Chưa thanh toán",
  1: "Đang xử lý",
  2: "Đã thanh toán",
  3: "Thanh toán một phần",
  4: "Hoàn tiền",
  5: "Hoàn tiền một phần",
  6: "Thất bại",
  7: "Đã thanh toán",
};
const PAYMENT_STATUS_COLOR = {
  4: "magenta",
  5: "magenta",
  2: "success",
  7: "success",
  1: "orange",
  0: "default",
  6: "red",
  3: "blue"
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
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnOrderId, setReturnOrderId] = useState(null);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [loadingCancelled, setLoadingCancelled] = useState(false);


  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getMyOrders();
      const newOrders = res.data || [];
      console.log("Fetched orders:", newOrders);
      setOrders(newOrders);
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

  useEffect(() => {
    if (activeTab === "cancelled") {
      fetchCancelledOrders();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "cancelled") {
      fetchOrders();
    }
  }, [activeTab]);


  const fetchReviews = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await getUserReviewsByUserID(userId);
      setUserReviews(res.data?.data || []);
      console.log("Dữ liệu review được lọc theo UserId:", res.data?.data);
    } catch (error) {
      setUserReviews([]);
    }
  }

  const fetchCancelledOrders = async () => {
    setLoadingCancelled(true);
    try {
      const res = await getCancelledOrders();
      // Nếu response trả về dạng data: {..., items: [...]}
      // thì cần lấy res.data.items
      setCancelledOrders(res.data.items || res.data || []);
    } catch (err) {
      setCancelledOrders([]);
      message.error("Không thể tải danh sách đơn đã hủy");
    } finally {
      setLoadingCancelled(false);
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

  const filteredCancelledOrders = cancelledOrders.filter(order =>
    order.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
    order.cancellationReason?.toLowerCase().includes(search.toLowerCase()) ||
    (order.items || []).some(item =>
      item.productName?.toLowerCase().includes(search.toLowerCase())
    )
  );


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
        reviewList.map(review => {

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
      toast.success(mode === "update" ? "Cập nhật đánh giá thành công!" : "Gửi đánh giá thành công!");
      await fetchOrders();
      await fetchReviews();
      setReviewModalOpen(false);

      // ✅ Nếu muốn mở lại modal ngay sau khi create:
      if (mode === "create") {
        const reviewedOrder = orders.find(o => o.id === reviewList[0].orderId);
        if (reviewedOrder) {
          await handleOpenReviewModal(reviewedOrder, "update");
        }
      }

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
      r =>
        r.productVariantId === item.productVariantId &&
        r.orderId === orderId
    );
  }

  const handleOpenReviewModal = async (order, mode = "create") => {
    await fetchReviews();
    const productList = order.orderItems.map(item => {
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
      case STATUS.paid:
        actions.push(
          <Button
            key="cancel-after-paid"
            danger
            onClick={() => {
              setReturnOrderId(order.id)
              setReturnModalOpen(true)
            }
            }
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
      case STATUS.delivered:

        const allReviewed = order.orderItems.every(item => findReviewOfItem(item, order.id));
        const noneReviewed = order.orderItems.every(item => !findReviewOfItem(item, order.id));

        if (noneReviewed) {
          actions.push(
            <Button
              key="review"
              type="primary"
              onClick={async () => await handleOpenReviewModal(order, 'create')}
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
              onClick={() => handleOpenReviewModal(order, 'update')}
              icon={<CheckCircleOutlined />}
            >
              Đánh giá lại
            </Button>
          );
        };
        actions.push(
          <Button
            key="cancel-after-delivered"
            danger
            onClick={() => {
              setReturnOrderId(order.id)
              setReturnModalOpen(true)
            }}
            icon={<CloseCircleOutlined />}
          >
            Trả hàng
          </Button>
        );
        break;
      case STATUS.completed:
        if (isWithin3Days(order.deliveredAt)) {
          actions.push(
            <Button
              key="cancel-after-completed"
              danger
              onClick={() => {
                setReturnOrderId(order.id)
                setReturnModalOpen(true)
              }}
              icon={<CloseCircleOutlined />}
            >
              Trả hàng
            </Button>
          );
        }
        break;
      default:
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

  const isWithin3Days = (deliveredDateStr) => {
    if (!deliveredDateStr || deliveredDateStr.startsWith("0001")) return false;

    const deliveredAt = new Date(deliveredDateStr);
    const now = new Date();
    const diffTime = now - deliveredAt;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 3;
  };


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
            <TabPane tab="Yêu Cầu Hủy/Trả" key="cancellationRequested" />
            <TabPane tab="Đã Hủy" key="cancelled" />
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
          {activeTab === "cancelled" ? (
            loadingCancelled ? (
              <div className="loading-container">
                <Spin size="large" />
              </div>
            ) : filteredCancelledOrders.length === 0 ? (
              <Empty
                description="Chưa có đơn hàng đã hủy"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <div className="orders-list">
                {filteredCancelledOrders.map(order => (
                  <div key={order.orderId} className="order-item-block">
                    {/* Header */}
                    <div className="order-card-header">
                      <div className="order-info">
                        <span className="order-number">#{order.orderNumber}</span>
                        <span className="order-date">{formatDate(order.dateCancelled)}</span>
                        {/* Tag paymentStatus nằm dưới đây */}
                        {order.paymentStatus !== undefined && (
                          <Tag
                            color={PAYMENT_STATUS_COLOR[order.paymentStatus]}
                            style={{
                              marginTop: 6,
                              fontSize: 13,
                              height: 22,
                              lineHeight: "20px",
                              padding: "0 10px",
                              borderRadius: 8,
                              fontWeight: 500,
                              display: "inline-block",
                              width: 120,
                            }}
                          >
                            {PAYMENT_STATUS_LABEL[order.paymentStatus]}
                          </Tag>
                        )}
                      </div>
                      <Tag
                        color={STATUS_COLORS[STATUS.cancelled]}
                        className="order-status-tag"
                        style={{
                          fontSize: 15,
                          height: 28,
                          lineHeight: "28px",
                          padding: "0 18px",
                          borderRadius: 16,
                          fontWeight: 600,
                        }}
                      >
                        {STATUS_LABEL[STATUS.cancelled]}
                      </Tag>
                    </div>


                    {/* Items */}
                    <div className="order-card-items">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="order-item-row">
                          <div className="item-image-wrapper">
                            <img
                              src={item.imageUrl || "/placeholder.svg"}
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

                    {/* Thông tin người nhận & giá */}
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

                    {/* Lý do hủy và note hoàn tiền */}
                    {order.cancellationReason && (
                      <Alert
                        message={`Lý do hủy: ${order.cancellationReason}`}
                        type="error"
                        showIcon
                        className="cancellation-alert"
                        style={{ marginBottom: 8 }}
                      />
                    )}

                    {/* Nếu trạng thái là Refunded (4) hoặc PartiallyRefunded (5) thì show note cho khách */}
                    {(order.paymentStatus === 4 || order.paymentStatus === 5) && (
                      <Alert
                        message="Đơn hàng đã được hoàn tiền. Vui lòng kiểm tra tài khoản hoặc liên hệ CSKH nếu chưa nhận được tiền."
                        type="success"
                        showIcon
                      />
                    )}

                    {/* Nếu adminReviewNotes có, show luôn */}
                    {order.adminReviewNotes && (
                      <Alert
                        message={`Ghi chú admin: ${order.adminReviewNotes}`}
                        type="info"
                        showIcon
                        style={{ marginTop: 8 }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            loading ? (
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
                              src={item.imageUrl || "/placeholder.svg"}
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
                      {order.status === STATUS.cancelled && order.cancellationReason && (
                        <Alert
                          message={`Lý do hủy: ${order.cancellationReason}`}
                          type="error"
                          showIcon
                          className="cancellation-alert"
                        />
                      )}

                      {order.status === STATUS.cancellationRequested && (
                        <Alert
                          message={"Yêu cầu hủy/trả của bạn đang được xem xét. Vui lòng đợi nhân viên xử lý."}
                          type="info"
                          showIcon
                          className="cancellation-alert"
                        />
                      )}

                      {order.status === STATUS.completed && isWithin3Days(order.deliveredAt) && (
                        <Alert
                          message={`Lưu ý: Bạn chỉ có thể yêu cầu trả hàng **trước ngày ${new Date(
                            new Date(order.deliveredAt).getTime() + 3 * 24 * 60 * 60 * 1000
                          ).toLocaleDateString('vi-VN')}**. Sau thời gian này, cửa hàng sẽ từ chối mọi yêu cầu trả hàng.`}
                          type="warning"
                          showIcon
                          className="cancellation-alert"
                          style={{ marginBottom: 8 }}
                        />
                      )}

                      <Space>{renderOrderActions(order)}</Space>
                    </div>
                  </div>
                ))}
              </div>
            )
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

      <RequestCancelOrderModal
        visible={returnModalOpen}
        orderId={returnOrderId}
        onClose={() => setReturnModalOpen(false)}
        onSuccess={fetchOrders}
      />
    </>
  );
};

export default Orders;
