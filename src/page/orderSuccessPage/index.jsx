// pages/user/OrderSuccess.jsx
import { Result, Button, Descriptions, List, Spin } from "antd";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { SmileOutlined, HomeOutlined, FileDoneOutlined } from "@ant-design/icons";
import { useEffect, useState, useMemo } from "react";
import api from "../../config/api";
import FormatCost from "../../components/formatCost";
import "./index.scss";

function extractGuid(str) {
  // Chuẩn regex GUID
  const match =
    str &&
    str.match(
      /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
    );
  return match ? match[0] : null;
}

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();
  const [paymentId, setPaymentId] = useState(null);

  // Lấy query params
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const vnpStatus = queryParams.get("vnp_TransactionStatus");
  const vnpTxnRef = queryParams.get("vnp_TxnRef");
  4;
  const vnpResponseCode = queryParams.get("vnp_ResponseCode");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Xác định đúng GUID của order
  const realOrderId = useMemo(() => {
    // 1. Nếu params là GUID thật
    let guid = extractGuid(orderId);
    // 2. Nếu không, ưu tiên lấy từ vnp_TxnRef (VNPAY redirect)
    if (!guid) guid = extractGuid(vnpTxnRef);
    return guid;
  }, [orderId, vnpTxnRef]);

  // Gọi API lấy chi tiết đơn hàng
  const fetchOrder = async () => {
    try {
      let orderData = null;

      // Nếu đang xử lý VNPAY, lấy từ API payment
      if (vnpStatus !== null && realOrderId) {
        let paymentGuid = extractGuid(vnpTxnRef);
        if (paymentGuid) {
          setPaymentId(paymentGuid);
          const res = await api.get(`Payments/${paymentGuid}/order`);

          orderData = res.data.data;
          console.log("Order data from VNPAY:", orderData);
        }
      }

      // Nếu không phải VNPAY hoặc thất bại thì dùng API cũ
      if (!orderData && realOrderId) {
        const res = await api.get(`/Orders/${realOrderId}`);
        orderData = res.data;
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
    if (!realOrderId) {
      navigate("/");
      return;
    }
    setLoading(true);
    fetchOrder();
  }, [realOrderId, vnpStatus, vnpTxnRef, navigate]);

  // Hàm xác định cách hiển thị phương thức thanh toán
  const getPaymentDisplay = () => {
    if (vnpResponseCode) return "VNPAY";

    if (
      order.paymentType === "COD" ||
      !order.paymentType // null, undefined hoặc ""
    )
      return "Thanh toán khi nhận hàng (COD)";

    // Các loại khác nếu có
    return order.paymentType;
  };

  if (loading)
    return (
      <Spin tip="Đang tải chi tiết đơn hàng..." style={{ marginTop: 40 }} />
    );

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
                  {item.image && (
                    <img src={item.image} alt="" className="order-item-image" />
                  )}
                  <div className="order-item-info">
                    <div>
                      <b>{item.itemName}</b>
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
