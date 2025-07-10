import { Result, Button, Descriptions, List, Spin } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { SmileOutlined, HomeOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import api from "../../config/api";
import FormatCost from "../../components/formatCost";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy chi tiết đơn hàng
  useEffect(() => {
    if (!orderId) {
      navigate("/");
      return;
    }
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.get(`Orders/${orderId}`);
        console.log("API trả về:", res.data);
        setOrder(res.data);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  // Đặt log ở đây
  useEffect(() => {
    if (order) {
      console.log("order đã có dữ liệu:", order);
    }
  }, [order]);

  const handleGoHome = () => navigate("/");
  const handleViewOrders = () => navigate("/my-orders");

  if (loading)
    return (
      <Spin tip="Đang tải chi tiết đơn hàng..." style={{ marginTop: 40 }} />
    );

  // destructure đúng các field từ response thật của backend
  const {
    id,
    orderNumber,
    createdAt,
    receiverName,
    receiverPhone,
    shippingAddress,
    orderItems,
    totalAmount,
    subtotalAmount,
    shippingFee,
    taxAmount,
    paymentType,
    shippingMethodName,
  } = order || {};

  return (
    <div
      className="order-success-page"
      style={{
        minHeight: 540,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ maxWidth: 750, width: "100%" }}>
        <Result
          status="success"
          icon={<SmileOutlined />}
          title="Đặt hàng thành công!"
          subTitle={
            <div>
              <b>Mã đơn hàng:</b>{" "}
              <span style={{ color: "#52c41a" }}>{orderNumber || id}</span>
              <br />
              <span>
                Ngày đặt:{" "}
                {createdAt ? new Date(createdAt).toLocaleString() : ""}
              </span>
            </div>
          }
          extra={[
            <Button key="home" icon={<HomeOutlined />} onClick={handleGoHome}>
              Về trang chủ
            </Button>,
            <Button key="orders" onClick={handleViewOrders}>
              Xem đơn hàng của tôi
            </Button>,
          ]}
        />

        <div style={{ margin: "16px 0" }}>
          <Descriptions
            title="Thông tin giao hàng"
            bordered
            size="middle"
            column={1}
            style={{ marginBottom: 16 }}
          >
            <Descriptions.Item label="Người nhận">
              {receiverName}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {receiverPhone}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {shippingAddress}
            </Descriptions.Item>
            <Descriptions.Item label="Hình thức giao hàng">
              {shippingMethodName}
            </Descriptions.Item>
          </Descriptions>
        </div>

        <div>
          <h3 style ={{marginBottom:"20px", marginTop:"24px"}}>Thông tin đơn hàng</h3>
          <List
            bordered
            dataSource={orderItems}
            renderItem={(item) => (
              <List.Item>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  {/* Nếu backend trả ra image thì dùng, không thì bỏ */}
                  {item.image && (
                    <img
                      src={item.image}
                      alt=""
                      style={{
                        width: 52,
                        marginRight: 14,
                        borderRadius: 6,
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div>
                      <b>{item.itemName}</b>
                    </div>
                    <div style={{ color: "#666" }}>
                      {item.selectedColor && (
                        <span>Màu: {item.selectedColor} </span>
                      )}
                      {item.selectedSize && (
                        <span>Size: {item.selectedSize}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    SL: <b>{item.quantity}</b> &nbsp;|&nbsp;
                    <FormatCost value={item.unitPrice * item.quantity} />
                  </div>
                </div>
              </List.Item>
            )}
          />
        </div>

        <div style={{ marginTop: 30, textAlign: "right",  }}>
          <div style={{ marginBottom: 8 }}>
            Phí vận chuyển:{" "}
            <b>
              <FormatCost value={shippingFee} />
            </b>
          </div>
          <div style={{ marginBottom: 8 }}>
            Thuế:{" "}
            <b>
              <FormatCost value={taxAmount} />
            </b>
          </div>
          <div style={{ marginBottom: 20 }}>
            Tổng tiền hàng:{" "}
            <b>
              <FormatCost value={subtotalAmount} />
            </b>
          </div>
          <div style={{ fontSize: 20, marginTop: 8 }}>
            Tổng thanh toán:{" "}
            <span style={{ color: "#e02828", fontWeight: 700 }}>
              <FormatCost value={totalAmount} />
            </span>
          </div>
        </div>

        <div style={{ marginTop: 24, textAlign: "center", color: "#888" }}>
          <b>Phương thức thanh toán:</b>{" "}
          {paymentType === "COD"
            ? "Thanh toán khi nhận hàng"
            : paymentType || ""}
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
