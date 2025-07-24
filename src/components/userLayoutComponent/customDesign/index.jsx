import { useState, useEffect } from "react";
import { Heart, Loader2, Search, Calendar, DollarSign } from "lucide-react";
import { DESIGN_COLOR, DESIGN_LABEL, DESIGN_STATUS } from "../../enumDesin";
import api from "../../../config/api";
import FormatCost from "../../formatCost";
import "./index.scss";
import DesignStatusButton from "../../designStatusButton";
import { Button, Modal } from "antd";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

const tabList = [
  { key: "all", label: "Tất cả", status: -1 },
  { key: "draft", label: "Nháp", status: DESIGN_STATUS.draft },
  { key: "liked", label: "Đã thích", status: DESIGN_STATUS.liked },
  { key: "accepted", label: "Được duyệt", status: DESIGN_STATUS.accepted },
  { key: "request", label: "Yêu cầu ", status: DESIGN_STATUS.request },
  { key: "order", label: "Chờ đặt hàng", status: DESIGN_STATUS.order },
  { key: "shipping", label: "Đang vận chuyển", status: DESIGN_STATUS.shipping },
  { key: "delivered", label: "Đã giao", status: DESIGN_STATUS.delivered },
  { key: "done", label: "Hoàn thành", status: DESIGN_STATUS.done },
  { key: "rejected", label: "Bị từ chối", status: DESIGN_STATUS.rejected },
];

const DesignPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("status") || "all";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [designs, setDesigns] = useState([]);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [previewImg, setPreviewImg] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  // State cho modal đặt hàng
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [orderData, setOrderData] = useState({
    payerName: "",
    payerPhone: "",
    payerAddress: "",
    description: "",
  });
  const [orderLoading, setOrderLoading] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState(null);

  // Xử lý thay đổi input search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Lọc danh sách thiết kế theo từ khóa tìm kiếm
  const filteredDesigns = designs.filter(
    (design) =>
      (design.designName?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (design.promptText?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      )
  );

  useEffect(() => {
    const currentTab =
      new URLSearchParams(location.search).get("status") || "all";
    setActiveTab(currentTab);
  }, [location.search]);

  // Show notification
  const showNotification = (message, type = "error") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "error" }),
      3000
    );
  };

  // Lấy status theo tab
  const getStatus = () => {
    const found = tabList.find((t) => t.key === activeTab);
    return found ? found.status : -1;
  };

  // Fetch theo status
  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const params =
        getStatus() === -1
          ? "CustomDesign/filter-user?PageSize=40"
          : `CustomDesign/filter-user?PageSize=40&Status=${getStatus()}`;
      const res = await api.get(params);
      setDesigns(res.data?.items || []);
    } catch (e) {
      showNotification("Không tải được danh sách thiết kế!");
      setDesigns([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDesigns();
    // eslint-disable-next-line
  }, [activeTab]);

  // Toggle like (thay đổi trạng thái liked/draft)
  const handleToggleLike = async (design) => {
    const newStatus =
      design.status === DESIGN_STATUS.liked
        ? DESIGN_STATUS.draft
        : DESIGN_STATUS.liked;
    try {
      await api.patch(`CustomDesign/${design.id}/status`, {
        status: newStatus,
      });
      fetchDesigns();
    } catch {
      showNotification("Không cập nhật được trạng thái!");
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      [DESIGN_STATUS.draft]: "#6b7280",
      [DESIGN_STATUS.liked]: "#ef4444",
      [DESIGN_STATUS.accepted]: "#10b981",
      [DESIGN_STATUS.request]: "#f59e0b",
      [DESIGN_STATUS.order]: "#3b82f6",
      [DESIGN_STATUS.shipping]: "#8b5cf6",
      [DESIGN_STATUS.delivered]: "#06b6d4",
      [DESIGN_STATUS.done]: "#10b981",
      [DESIGN_STATUS.rejected]: "#ef4444",
    };
    return colors[status] || "#6b7280";
  };

  // Handler mở modal đặt hàng
  const openOrderModal = (design) => {
    setSelectedDesign(design);
    setOrderModalVisible(true);
    setOrderData({
      payerName: "",
      payerPhone: "",
      payerAddress: "",
      description: "",
    });
  };

  // Handler gửi đặt hàng VNPAY
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDesign) return;
    setOrderLoading(true);
    try {
      // Gọi API đặt hàng thanh toán VNPAY
      await api.post(`custom-design-payments/${selectedDesign.id}`, {
        customDesignId: selectedDesign.id,
        paymentMethod: 0, // 0 = VNPAY
        payerName: orderData.payerName,
        payerPhone: orderData.payerPhone,
        payerAddress: orderData.payerAddress,
        description: orderData.description,
      });
      toast.success(
        "Đặt hàng thành công! Vui lòng kiểm tra email hoặc thông báo để hoàn tất thanh toán VNPAY."
      );
      setOrderModalVisible(false);
      setSelectedDesign(null);
      fetchDesigns();
    } catch (err) {
      toast.error("Có lỗi khi đặt hàng. Vui lòng thử lại.");
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="design-page">
      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="design-header">
        <h1>Lịch sử thiết kế AI</h1>
        <div className="header-actions">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm thiết kế..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="design-tabs">
        {tabList.map((tab) => (
          <button
            key={tab.key}
            className={`tab-item ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="design-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner">
              <Loader2 size={32} className="spinning" />
            </div>
            <p>Đang tải thiết kế...</p>
          </div>
        ) : filteredDesigns.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Search size={64} />
            </div>
            <h3>Không có thiết kế nào</h3>
            <p>Không tìm thấy thiết kế nào trong mục này.</p>
          </div>
        ) : (
          <div className="design-grid">
            {filteredDesigns.map((design) => (
              <div className="design-card" key={design.id}>
                <div className="card-image">
                  <img
                    src={
                      design.designImageUrl ||
                      "https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=400"
                    }
                    alt={design.designName}
                  />
                  <div className="card-overlay">
                    {(design.status === DESIGN_STATUS.liked ||
                      design.status === DESIGN_STATUS.draft) && (
                      <button
                        className="like-button"
                        onClick={() => handleToggleLike(design)}
                      >
                        <Heart
                          size={24}
                          color={
                            design.status === DESIGN_STATUS.liked
                              ? "#ef4444"
                              : "#ffffff"
                          }
                          fill={
                            design.status === DESIGN_STATUS.liked
                              ? "#ef4444"
                              : "none"
                          }
                        />
                      </button>
                    )}
                    <button
                      className="preview-btn"
                      onClick={() => {
                        setPreviewImg(
                          design.designImageUrl ||
                            "https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=400"
                        );
                        setPreviewVisible(true);
                      }}
                      title="Xem lớn"
                    >
                      <Search size={30} color="#fff" />
                    </button>
                  </div>
                </div>

                <div className="card-content">
                  <h3 className="design-name">{design.designName}</h3>
                  <div className="design-info">
                    <div className="info-item">
                      <DollarSign size={16} />
                      <FormatCost value={design.totalPrice} />
                    </div>
                    <div className="info-item">
                      <Calendar size={16} />
                      {new Date(design.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                  <div
                    className="design-status"
                    style={{ backgroundColor: getStatusColor(design.status) }}
                  >
                    {DESIGN_LABEL[design.status]}
                  </div>

                  {/* Nút đặt hàng VNPAY (nếu hợp lệ) */}
                  {design.status === DESIGN_STATUS.accepted && (
                    <Button
                      onClick={() => openOrderModal(design)}
                      type="primary"
                      style={{
                        marginTop: 8,
                        width: "100%",
                        borderRadius: 8,
                        height: "40px",
                      }}
                    >
                      Đặt hàng & Thanh toán VNPAY
                    </Button>
                  )}

                  {/* Nút chuyển trạng thái nếu cần */}
                  {design.status === DESIGN_STATUS.shipping && (
                    <DesignStatusButton
                      designId={design.id}
                      status={DESIGN_STATUS.delivered}
                      type="primary"
                      style={{
                        marginTop: 8,
                        width: "100%",
                        borderRadius: 8,
                        height: "40px",
                      }}
                      onSuccess={() => {
                        fetchDesigns();
                        toast.success(
                          "Vui lòng kiểm tra email để xác nhận đơn đặt hàng!"
                        );
                      }}
                    >
                      Đã giao hàng
                    </DesignStatusButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal xem ảnh lớn */}
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        centered
        width={600}
      >
        <img
          src={previewImg}
          alt="Preview"
          style={{
            width: "100%",
            borderRadius: 12,
            maxHeight: "70vh",
          }}
        />
      </Modal>

      {/* Modal đặt hàng & thanh toán VNPAY */}
      <Modal
        open={orderModalVisible}
        footer={null}
        onCancel={() => setOrderModalVisible(false)}
        centered
        width={600}
        destroyOnClose
      >
        <h2>Đặt hàng & Thanh toán VNPAY</h2>
        {selectedDesign && (
          <>
            <div style={{ marginBottom: 12 }}>
              <b>Tên thiết kế:</b> {selectedDesign.designName}
            </div>
            <div style={{ marginBottom: 12 }}>
              <b>Giá trị thanh toán trước (50%): </b>
              <FormatCost value={selectedDesign.totalPrice * 0.5} />
            </div>
          </>
        )}
        <form
          onSubmit={handleOrderSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <input
            required
            placeholder="Tên người thanh toán"
            value={orderData.payerName}
            onChange={(e) =>
              setOrderData((data) => ({ ...data, payerName: e.target.value }))
            }
            style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd",height: 60 }}
          />
          <input
            required
            placeholder="Số điện thoại"
            value={orderData.payerPhone}
            onChange={(e) => {
              // Chỉ cho phép nhập số
              const value = e.target.value.replace(/\D/g, "");
              setOrderData((data) => ({ ...data, payerPhone: value }));
            }}
            pattern="^(0|\+84)[0-9]{9}$"
            title="Số điện thoại phải bắt đầu bằng 0 hoặc +84 và có 10 số"
            maxLength={11}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" ,height: 60 }}
          />
          <input
            required
            placeholder="Địa chỉ giao hàng"
            value={orderData.payerAddress}
            onChange={(e) =>
              setOrderData((data) => ({
                ...data,
                payerAddress: e.target.value,
              }))
            }
            style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd",height: 60  }}
          />
          <textarea
            placeholder="Ghi chú/ Mô tả đơn hàng"
            value={orderData.description}
            onChange={(e) =>
              setOrderData((data) => ({ ...data, description: e.target.value }))
            }
            rows={2}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd",height: 120  }}
          />
          <button
            type="submit"
            disabled={orderLoading}
            style={{
              background: "#10b981",
              color: "#fff",
              border: "none",
              padding: "10px 0",
              borderRadius: 6,
              fontWeight: "bold",
              marginTop: 8,
              cursor: "pointer",height: 60 
            }}
          >
            {orderLoading ? "Đang gửi yêu cầu..." : "Thanh toán VNPAY (50%)"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default DesignPage;
