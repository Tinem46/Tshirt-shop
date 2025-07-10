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
  const { cart, userDetails, cartSummary, cartId } = location.state || {};

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
    const payload = {
      userAddressId: null,
      newAddress: {
        receiverName: userDetails.fullname,
        phone: userDetails.phone_number,
        detailAddress: userDetails.specific_Address,
        ward: userDetails.ward,
        district: userDetails.district,
        province: userDetails.country,
        postalCode: "",
        isDefault: false,
      },
      customerNotes: userDetails.additionalInfo,
      couponId: selectedCoupon?.id || null,
      shippingMethodId,
      orderItems: cart.map((item) => ({
        cartItemId: item.id,
        productId: item.productId,
        customDesignId: item.customDesignId || null,
        productVariantId: item.productVariantId || null,
        itemName: item.name,
        selectedColor: item.selectedColor || null,
        selectedSize: item.selectedSize || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      paymentType,
    };

    try {
      const res = await api.post("Orders", payload);
      toast.success("Đặt hàng thành công!");
      // Xóa giỏ hàng sau khi đặt hàng thành công
      // await api.delete(`Cart/${cartId}`);
      // console.log(cartId);
      const orderId = res.data.id;
      navigate(`/order-success/${orderId}`);
    } catch {
      toast.error("Đặt hàng thất bại! Vui lòng thử lại.");
    }
  };

  // Tính lại fee và tổng tiền
  const shippingFee =
    shippingMethods.find((x) => x.id === shippingMethodId)?.fee ??
    cartSummary?.estimatedShipping ??
    0;
  const estimatedTotal =
    (cartSummary?.estimatedTotal || 0) +
    shippingFee -
    (cartSummary?.estimatedShipping || 0);

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
              onChange={(id) => {
                const coupon = userCoupons.find((c) => c.id === id);
                dispatch(selectCoupon(coupon));
              }}
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
            <Button type="primary" onClick={handlePlaceOrder}>
              Đặt hàng
            </Button>
          </div>
        </div>

        {/* Cột chi tiết đơn hàng */}
        <div className="payment-summary">
          <h2>Chi tiết đơn hàng</h2>
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
              Subtotal: <FormatCost value={cartSummary?.subtotal || 0} />
            </p>
            <p>
              Shipping: <FormatCost value={shippingFee} />
            </p>
            <p>
              Tax: <FormatCost value={cartSummary?.estimatedTax || 0} />
            </p>
            <h3>
              Total: <FormatCost value={estimatedTotal} />
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
