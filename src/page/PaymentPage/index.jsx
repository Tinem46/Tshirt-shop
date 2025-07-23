// pages/user/Payment/index.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button, Select, Radio, Spin } from "antd";
import api from "../../config/api";
import FormatCost from "../../components/formatCost";
import { toast } from "react-toastify";
import "./index.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  setSavedCoupons,
  selectCoupon,
} from "../../redux/features/couponSlice";
import Swal from "sweetalert2";
import Navigation from "../../components/navBar";
import { ProductColorMap, ProductSizeMap } from "../../utils/enumMaps";

const { Option } = Select;

// Enum mapping: 0 = VNPAY, 1 = COD (theo BE)
const PaymentMethodEnum = {
  VNPAY: 0,
  COD: 1,
};

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
  const [paymentType, setPaymentType] = useState("COD"); // default COD
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    if (!shippingMethodId) {
      toast.error("Vui lòng chọn phương thức vận chuyển!");
      setLoading(false);
      return;
    }
    if (!paymentType) {
      toast.error("Vui lòng chọn phương thức thanh toán!");
      setLoading(false);
      return;
    }
    console.log("Placing order with shipping method:", shippingMethodId);
    console.log("paymentType:", paymentType);
    console.log("Mapped PaymentMethod:", PaymentMethodEnum[paymentType]);

    const payload = {
      UserAddressId: userAddressId || null,
      NewAddress: newAddress || null,
      CustomerNotes: userDetails?.additionalInfo || "",
      CouponId: selectedCoupon?.id || null,
      ShippingMethodId: shippingMethodId,
      OrderItems: cart.map((item) => ({
        CartItemId: item.id ?? null,
        ProductVariantId: item.productVariantId ?? item.detail?.id ?? null,
        Quantity: item.quantity,
      })),
      PaymentMethod: PaymentMethodEnum[paymentType], // <--- dùng mapping
    };
    console.log("Placing order with payload:", payload);

    try {
      const res = await api.post("Orders", payload);
      const orderId = res.data.order.id;

      if (paymentType === "VNPAY") {
        // Chỉ gọi create payment nếu chọn VNPAY
        const paymentRes = await api.post("Payments/create", {
          orderId,
          paymentMethod: PaymentMethodEnum.VNPAY, // 0
          description: "Thanh toán qua VNPay",
        });

        const paymentUrl = paymentRes.data?.paymentUrl || paymentRes.data?.url;
        if (paymentUrl) {
          window.location.href = paymentUrl;
          return;
        } else {
          toast.error("Không lấy được link thanh toán VNPay!");
          return;
        }
      } else if (paymentType === "COD") {
        // Nếu COD thì báo thành công, không gọi Payments/create
        await Swal.fire({
          title: "🎉 Đặt hàng thành công",
          text: "Đơn hàng sẽ đến tay bạn sớm nhất 🚚",
          icon: "success",
          timer: 3000,
          showConfirmButton: true,
          confirmButtonText: "OK",
        });
        navigate(`/order-success/${orderId}`);
      } else {
        toast.error("Phương thức thanh toán không hợp lệ!");
        return;
      }
    } catch (error) {
      toast.error("Đặt hàng thất bại! Vui lòng thử lại.");
      console.error("Error placing order:", error);
    } finally {
      setLoading(false);
    }
  };

  // Tính lại fee và tổng tiền
  const shippingFee =
    shippingMethods.find((x) => x.id === shippingMethodId)?.fee ??
    cartSummary?.estimatedShipping ??
    0;

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
    } catch (err) {
      dispatch(selectCoupon(null));
      toast.error(
        err?.response?.data?.message ||
          "Mã giảm giá không hợp lệ hoặc không đáp ứng điều kiện!"
      );
    }
  };

  return (
    <>
      <Navigation
        mainName="Payment"
        img="https://img.ws.mms.shopee.vn/vn-11134210-7r98o-lodhuspkwjqrac"
      />
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
                <Radio value="VNPAY">VNPay (ATM/QR)</Radio>
                <Radio value="COD">Thanh toán khi nhận hàng (COD)</Radio>
              </Radio.Group>
            </div>

            <div className="payment-section">
              <h2>Mã giảm giá</h2>
              <Select
                style={{ width: "100%" }}
                placeholder="Chọn mã giảm giá"
                value={selectedCoupon?.id}
                onChange={handleApplyCoupon}
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
                loading={loading}
                type="primary"
                onClick={handlePlaceOrder}
                disabled={loading}
                style={{
                  width: "100%",
                  marginTop: 20,
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                  color: "#fff",
                }}
              >
                {loading ? <Spin size="small" /> : "Đặt hàng"}
              </Button>
            </div>
          </div>

          {/* Cột chi tiết đơn hàng */}
          <div className="payment-summary">
            <h2 style={{ color: "white" }}>Chi tiết đơn hàng</h2>
            <ul>
              {cart?.map((item) => (
                <li key={item.id}>
                  <img
                    src={item?.detail?.imageUrl || item.image}
                    className="item-img"
                    alt=""
                  />
                  <div className="item-detail">
                    <span className="item-name">{item.productName}</span>
                    <span className="item-qty">x {item.quantity}</span>
                    {ProductColorMap[item?.detail?.color] ||
                      (item.color && (
                        <span
                          style={{
                            fontSize: 14,
                            marginLeft: 5,
                            color: "black",
                          }}
                        >
                          {ProductColorMap[item?.detail?.color] || item.color}
                        </span>
                      ))}
                    {ProductSizeMap[item?.detail?.size] ||
                      (item.size && (
                        <span
                          style={{ fontSize: 14, marginLeft: 5, color: "#666" }}
                        >
                          {ProductSizeMap[item?.detail?.size] || item.size}
                        </span>
                      ))}
                  </div>
                  <div
                    style={{
                      minWidth: 68,
                      textAlign: "right",
                      fontWeight: 500,
                    }}
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
                  Giảm giá: -
                  <FormatCost value={selectedCoupon.discountAmount} />
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
    </>
  );
};

export default PaymentPage;
