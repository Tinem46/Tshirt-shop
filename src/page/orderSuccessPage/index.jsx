// pages/user/OrderSuccess.jsx
import { Result, Button, Descriptions, List, Spin } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  SmileOutlined,
  HomeOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import { useEffect, useState, useMemo } from "react";
import api from "../../config/api";
import FormatCost from "../../components/formatCost";
import "./index.scss";

// Hàm regex lấy GUID
function extractGuid(str) {
  const match =
    str &&
    str.match(
      /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
    );
  return match ? match[0] : null;
}

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy query params
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const paymentId = queryParams.get("paymentId");
  const vnpTxnRef = queryParams.get("vnp_TxnRef");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Xác định đúng orderId dạng GUID (nếu có)
  const realOrderId = useMemo(() => {
    let guid = extractGuid(paymentId);
    if (!guid) guid = extractGuid(vnpTxnRef);
    return guid;
  }, [paymentId, vnpTxnRef]);

  // API lấy thông tin đơn hàng
  const fetchOrder = async () => {
    try {
      let orderData = null;

      if (paymentId) {
        const res = await api.get(`Payments/${realOrderId}/order`);
        orderData = res.data.data;
        console.log("Order data from paymentId:", orderData);
      } else if (realOrderId) {
        const res = await api.get(`Orders/${realOrderId}`);
        orderData = res.data;
        console.log("Order data from Orders API:", orderData);
      }

      setOrder(orderData);
    } catch (error) {
      setOrder(null);
      console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!paymentId && !realOrderId) {
      navigate("/");
      return;
    }
    setLoading(true);
    fetchOrder();
    // eslint-disable-next-line
  }, [paymentId, realOrderId, vnpTxnRef, navigate]);

  // Hàm xác định hiển thị phương thức thanh toán từ field paymentMethod
  const getPaymentDisplay = () => {
    if (order?.paymentMethod === 0) return "VNPAY (ATM/QR)";
    if (order?.paymentMethod === 1) return "Thanh toán khi nhận hàng (COD)";
    // Fallback cho case cũ
    if (
      order?.paymentType === "COD" ||
      !order?.paymentType // null, undefined hoặc ""
    )
      return "Thanh toán khi nhận hàng (COD)";
    return order?.paymentType || "Không xác định";
  };

  if (loading)
    return (
      <Spin tip="Đang tải chi tiết đơn hàng..." style={{ marginTop: 40 }} />
    );

  if (!order) {
    return (
      <Result
        status="warning"
        title="Không tìm thấy đơn hàng"
        subTitle="Có thể đơn hàng này đã bị huỷ hoặc sai mã đơn hàng."
        extra={
          <Button type="primary" onClick={() => navigate("/")}>
            Về trang chủ
          </Button>
        }
      />
    );
  }

  // destructure các field từ order
  const {
    orderNumber,
    createdAt,
    receiverName,
    receiverPhone,
    shippingAddress,
    orderItems,
    totalAmount,
    subtotalAmount,
    shippingFee,
    shippingMethodName,
    discountedAmount,
  } = order || {};

  return (
    <div className="order-success-page">
      <div className="order-success-container">
        <Result
          status="success"
          icon={<SmileOutlined />}
          title="Đặt hàng thành công!"
          subTitle={
            <div>
              <b>Mã đơn hàng:</b>{" "}
              <span className="order-success-code">{orderNumber}</span>
              <br />
              <span>
                Ngày đặt:{" "}
                {createdAt ? new Date(createdAt).toLocaleString() : ""}
              </span>
            </div>
          }
          extra={[
            <Button
              key="home"
              icon={<HomeOutlined />}
              onClick={() => navigate("/")}
            >
              Về trang chủ
            </Button>,
            <Button
              key="orders"
              onClick={() => navigate("/userLayout?tab=orders")}
              icon={<FileDoneOutlined />}
            >
              Xem đơn hàng của tôi
            </Button>,
          ]}
        />

        <div className="shipping-info">
          <Descriptions
            title="Thông tin giao hàng"
            bordered
            size="middle"
            column={1}
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

        <div className="order-items-section">
          <h3>Thông tin đơn hàng</h3>
          <List
            bordered
            dataSource={orderItems}
            renderItem={(item) => (
              <List.Item>
                <div className="order-item">
                  <img
                    src={
                      item.imageUrl ||
                      "https://down-vn.img.susercontent.com/file/8bd57cda68fc7a4a2076feaae894b3fe"
                    }
                    alt=""
                    className="order-item-image"
                  />
                  <div className="order-item-info">
                    <div>
                      <b>{item.variantName}</b>
                    </div>
                    <div className="order-item-options">
                      {item.selectedColor && (
                        <span>Màu: {item.selectedColor} </span>
                      )}
                      {item.selectedSize && (
                        <span>Size: {item.selectedSize}</span>
                      )}
                    </div>
                  </div>
                  <div className="order-item-price">
                    SL: <b>{item.quantity}</b> &nbsp;|&nbsp;
                    <FormatCost value={item.unitPrice * item.quantity} />
                  </div>
                </div>
              </List.Item>
            )}
          />
        </div>

        <div className="order-summary1">
          <div>
            Phí vận chuyển:{" "}
            <b>
              <FormatCost value={shippingFee} />
            </b>
          </div>
          <div>
            Tổng tiền hàng:{" "}
            <b>
              <FormatCost value={subtotalAmount} />
            </b>
          </div>
          <div>
            Giảm giá:{" "}
            <b>
              <FormatCost value={discountedAmount || 0} />
            </b>
          </div>
          <div className="order-total">
            Tổng thanh toán:
            <span>
              <FormatCost value={totalAmount} />
            </span>
          </div>
        </div>

        <div className="payment-method">
          <b>Phương thức thanh toán:</b> {getPaymentDisplay()}
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
