// pages/user/Payment/index.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button, Select, Radio } from "antd";
import api from "../../config/api";
import FormatCost from "../../components/formatCost";
import { toast } from "react-toastify";
import "./index.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  setSavedCoupons,
  selectCoupon,
} from "../../redux/features/couponSlice";

const { Option } = Select;

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, userDetails, cartSummary, userAddressId, newAddress } =
    location.state || {};

  // Lấy userId từ localStorage để đọc đúng coupon
  const userId = localStorage.getItem("userId");
  const LOCAL_KEY = userId ? `user_coupons_${userId}` : "user_coupons_guest";
  const dispatch = useDispatch();

  // Đồng bộ lại Redux khi userId đổi (hoặc reload page)
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    dispatch(setSavedCoupons(data));
  }, [userId, dispatch]);

  // Lấy coupon từ Redux (đã đồng bộ từ localStorage)
  const userCoupons = useSelector((state) => state.coupon.savedCoupons);
  const selectedCoupon = useSelector((state) => state.coupon.selectedCoupon);

  // Shipping/payment method
  const [shippingMethods, setShippingMethods] = useState([]);
  const [shippingMethodId, setShippingMethodId] = useState(null);
  const [paymentType, setPaymentType] = useState("COD");

  useEffect(() => {
    const fetchShippingMethods = async () => {
      try {
        const res = await api.get("/admin/shipping-methods");
        setShippingMethods(res.data.data || []);
      } catch {
        toast.error("Không thể tải phương thức vận chuyển");
      }
    };
    fetchShippingMethods();
  }, []);

  // Tạo order
  const handlePlaceOrder = async () => {
    if (!shippingMethodId) {
      toast.error("Vui lòng chọn phương thức vận chuyển!");
      return;
    }
    if (!paymentType) {
      toast.error("Vui lòng chọn phương thức thanh toán!");
      return;
    }
    console.log("Cart gửi sang order:", cart);
    const payload = {
      userAddressId: userAddressId || null, // Nếu là null sẽ bỏ qua field này
      newAddress: newAddress || null, // Nếu là null sẽ bỏ qua field này
      customerNotes: userDetails?.additionalInfo || "",
      couponId: selectedCoupon?.id || null,
      shippingMethodId,
      orderItems: cart.map((item) => ({
        cartItemId: item.id,
        productId: item.productId ?? item.detail?.productId ?? null,
        customDesignId: item.customDesignId ?? null,
        productVariantId: item.productVariantId ?? item.detail?.id ?? null,
        itemName: item.itemName ?? item.name ?? item.detail?.productName ?? "",
        selectedColor: item.selectedColor ?? item.detail?.color ?? "",
        selectedSize: item.selectedSize ?? item.detail?.size ?? "",
        image: item.image ?? item.detail?.imageUrl ?? "",
        quantity: item.quantity,
        unitPrice: item.unitPrice ?? item.detail?.price ?? 0,
      })),
      paymentMethod: paymentType === "COD" ? 0 : 1, // 0: COD, 1: VNPAY
    };

    console.log("OrderItems gửi đi:", payload.orderItems);
    console.log("Payload gửi đi:", payload);

    try {
      const res = await api.post("Orders", payload);
      const orderId = res.data.order.id;

      if (paymentType === "VNPAY") {
        const paymentRes = await api.post("Payments/create", {
          orderId,
          paymentMethod: 0, // VNPAY
          description: "Thanh toán qua VNPay",
        });

        const paymentUrl = paymentRes.data?.paymentUrl || paymentRes.data?.url;
        if (paymentUrl) {
          window.location.href = paymentUrl;
          return; // <-- PHẢI return để không chạy xuống else
        } else {
          toast.error("Không lấy được link thanh toán VNPay!");
          return; // <-- PHẢI return nếu không lấy được link!
        }
      } else if (paymentType === "COD") {
        // Nếu là COD, không cần làm gì thêm, chỉ cần thông báo thành công
        toast.success("Đặt hàng thành công!");
        navigate(`/order-success/${orderId}`);
      } else {
        toast.error("Phương thức thanh toán không hợp lệ!");
        return; // <-- PHẢI return nếu phương thức không hợp lệ
      }
    } catch (error) {
      toast.error("Đặt hàng thất bại! Vui lòng thử lại.");
      console.error("Error placing order:", error);
    }
  };

  // Tính lại fee và tổng tiền
  const shippingFee =
    shippingMethods.find((x) => x.id === shippingMethodId)?.fee ??
    cartSummary?.estimatedShipping ??
    0;
  // const estimatedTotal =
  //   (cartSummary?.totalAmount || 0) +
  //   shippingFee -
  //   (cartSummary?.estimatedShipping || 0);

  const handleApplyCoupon = async (couponId) => {
    const coupon = userCoupons.find((c) => c.id === couponId);
    if (!coupon) {
      dispatch(selectCoupon(null));
      return;
    }
    try {
      const res = await api.post("Coupons/apply", {
        code: coupon.code,
        orderAmount: cartSummary?.totalAmount || 0,
        userId: userId || null,
      });

      const data = res.data?.data;
      if (!data.isValid) {
        dispatch(selectCoupon(null));
        toast.error(
          data.message ||
            "Mã giảm giá không hợp lệ hoặc không đáp ứng điều kiện!"
        );
        return;
      }

      dispatch(
        selectCoupon({
          ...coupon,
          discountAmount: data.discountAmount,
        })
      );
      toast.success("Áp dụng mã thành công!");
      console.log("Coupon áp dụng:", res.data);
    } catch (err) {
      dispatch(selectCoupon(null));
      toast.error(
        err?.response?.data?.message ||
          "Mã giảm giá không hợp lệ hoặc không đáp ứng điều kiện!"
      );
    }
  };

  return (
    <div className="payment-page-root">
      <div className="payment-row">
        {/* Cột chọn phương thức */}
        <div className="payment-main">
          <div className="payment-section">
            <h2>Chọn phương thức vận chuyển</h2>
            <Select
              style={{ width: "100%" }}
              placeholder="Chọn phương thức giao hàng"
              value={shippingMethodId}
              onChange={setShippingMethodId}
            >
              {shippingMethods.map((m) => (
                <Option value={m.id} key={m.id}>
                  {m.name} ({m.description}) -{" "}
                  {m.fee ? <FormatCost value={m.fee} /> : "Miễn phí"}
                </Option>
              ))}
            </Select>
          </div>

          <div className="payment-section">
            <h2>Chọn phương thức thanh toán</h2>
            <Radio.Group
              onChange={(e) => setPaymentType(e.target.value)}
              value={paymentType}
            >
              <Radio value="COD">Thanh toán khi nhận hàng (COD)</Radio>
              <Radio value="VNPAY">VNPay (ATM/QR)</Radio>
            </Radio.Group>
          </div>

          <div className="payment-section">
            <h2>Mã giảm giá</h2>
            <Select
              style={{ width: "100%" }}
              placeholder="Chọn mã giảm giá"
              value={selectedCoupon?.id}
              onChange={handleApplyCoupon} // Gọi hàm kiểm tra & áp dụng khi chọn
              allowClear
            >
              {userCoupons.map((c) => (
                <Select.Option value={c.id} key={c.id}>
                  {c.code} - {c.name}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div className="payment-section" style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              onClick={handlePlaceOrder}
              style={{
                width: "100%",
                marginTop: 20,
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                color: "#fff",
              }}
            >
              Đặt hàng
            </Button>
          </div>
        </div>

        {/* Cột chi tiết đơn hàng */}
        <div className="payment-summary">
          <h2 style={{ color: "white" }}>Chi tiết đơn hàng</h2>
          <ul>
            {cart?.map((item) => (
              <li key={item.id}>
                <img src={item.image} className="item-img" alt="" />
                <div className="item-detail">
                  <span className="item-name">{item.name}</span>
                  <span className="item-qty">x {item.quantity}</span>
                  {item.selectedColor && (
                    <span
                      style={{ fontSize: 12, marginLeft: 5, color: "#666" }}
                    >
                      {item.selectedColor}
                    </span>
                  )}
                  {item.selectedSize && (
                    <span
                      style={{ fontSize: 12, marginLeft: 5, color: "#666" }}
                    >
                      {item.selectedSize}
                    </span>
                  )}
                </div>
                <div
                  style={{ minWidth: 68, textAlign: "right", fontWeight: 500 }}
                >
                  <FormatCost value={item.unitPrice * item.quantity} />
                </div>
              </li>
            ))}
          </ul>
          <div className="totals">
            <p>
              Subtotal: <FormatCost value={cartSummary?.totalAmount || 0} />
            </p>
            <p>
              Shipping: <FormatCost value={shippingFee} />
            </p>

            {selectedCoupon?.discountAmount > 0 && (
              <p style={{ color: "#0ab308" }}>
                Giảm giá: -<FormatCost value={selectedCoupon.discountAmount} />
              </p>
            )}
            <h3>
              Total:{" "}
              <FormatCost
                value={
                  (cartSummary?.totalAmount || 0) +
                  shippingFee -
                  (cartSummary?.estimatedShipping || 0) -
                  (selectedCoupon?.discountAmount || 0)
                }
              />
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
