import { Button, Input, Select } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./index.scss";
import { toast } from "react-toastify";
import api from "../../config/api";
import FormatCost from "../../components/formatCost";
import { getUserAddress } from "../../utils/addressService";

const { TextArea } = Input;
const { Option } = Select;

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart = [] } = location.state || {};
  const { cartId, variantIds = [], cartItemIds = [] } = location.state || {};

  const [userDetails, setUserDetails] = useState({
    fullname: "",
    detailAddress: "",
    city: "",
    district: "",
    ward: "",
    phone: "",
    email: "",
    gender: "",
    additionalInfo: "",
  });

  const [cartSummary, setCartSummary] = useState({
    subtotal: 0,
    estimatedShipping: 0,
    estimatedTotal: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    fetchUserProfile();
    fetchCartSummary();
    fetchDefaultAddress();
    // eslint-disable-next-line
  }, []);

  const fetchDefaultAddress = async () => {
    try {
      const res = await getUserAddress();
      const addresses = res.data.data;
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setUserDetails((prev) => ({
          ...prev,
          fullname: defaultAddress.receiverName || prev.fullname,
          phone: defaultAddress.phone || "",
          detailAddress: defaultAddress.detailAddress || "",
          city: defaultAddress.province || "",
          district: defaultAddress.district || "",
          ward: defaultAddress.ward || "",
        }));
      }
      console.log("Địa chỉ mặc định:", defaultAddress);
      console.log("Tất cả địa chỉ:", userDetails);
    } catch (err) {
      console.error("❌ Lỗi khi lấy địa chỉ:", err);
      toast.error("Không thể tải địa chỉ mặc định");
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vui lòng đăng nhập để đặt hàng");
        navigate("/login");
        return;
      }
      const response = await api.get("Auth/current-user");
      const user = response.data.data;
      setUserDetails((prev) => ({
        ...prev,
        fullname:
          (user?.firstName ? user.firstName + " " : "") +
          (user?.lastName || ""),
        country: "",
        phone_number: user?.phoneNumber || "",
        email: user?.email || "",
        gender: user?.gender || "",
      }));
    } catch {
      toast.error("Không thể tải thông tin người dùng");
    }
  };
  const fetchCartSummary = async () => {
    try {
      // Gọi API calculate-total với variantIds
      if (!cartItemIds.length) return;
      const res = await api.post("Cart/calculate-total", cartItemIds, {
        headers: { "Content-Type": "application/json" },
      });
      setCartSummary(res.data);
    } catch {
      toast.error("Không thể tính tổng đơn hàng");
    }
  };
  // Xử lý input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (value) => {
    setUserDetails((prev) => ({ ...prev, gender: value }));
  };

  // Sang trang payment
  const handleGoToPayment = () => {
    // if (
    //   !userDetails.fullname ||
    //   !userDetails.specific_Address ||
    //   !userDetails.phone_number
    // ) {
    //   toast.error("Vui lòng điền đầy đủ thông tin nhận hàng!");
    //   return;
    // }
    navigate("/payment", {
      state: {
        cart,
        userDetails,
        cartSummary,
        cartId,
      },
    });
  };
  return (
    <div className="checkout-container">
      <div className="checkout">
        {/* Billing Details */}
        <div className="billing-details">
          <h2>Thông tin giao hàng</h2>

          <Input
            name="fullname"
            placeholder="Họ và tên"
            value={userDetails.fullname}
            onChange={handleInputChange}
          />

          <Select
            name="gender"
            value={userDetails.gender || undefined}
            onChange={handleGenderChange}
            style={{ width: "100%" }}
            placeholder="Giới tính"
          >
            <Option value="Male">Nam</Option>
            <Option value="Female">Nữ</Option>
            <Option value="other">Khác</Option>
          </Select>

          <Input
            name="specific_Address"
            placeholder="Địa chỉ chi tiết (số nhà, tên đường)"
            value={userDetails.detailAddress}
            onChange={handleInputChange}
          />

          <Input
            name="city"
            placeholder="Tỉnh / Thành phố"
            value={userDetails.city}
            onChange={handleInputChange}
          />

          <Input
            name="district"
            placeholder="Quận / Huyện"
            value={userDetails.district}
            onChange={handleInputChange}
          />

          <Input
            name="ward"
            placeholder="Phường / Xã"
            value={userDetails.ward}
            onChange={handleInputChange}
          />

          <Input
            name="phone"
            placeholder="Số điện thoại"
            value={userDetails.phone}
            onChange={handleInputChange}
          />

          <Input
            name="email"
            placeholder="Địa chỉ email"
            value={userDetails.email}
            onChange={handleInputChange}
          />

          <TextArea
            name="additionalInfo"
            placeholder="Ghi chú thêm (tuỳ chọn)"
            value={userDetails.additionalInfo}
            onChange={handleInputChange}
            rows={4}
          />
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h2>Đơn hàng của bạn</h2>
          <ul>
            {cart.map((item) => (
              <li key={item.id}>
                <div className="item-info">
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: 50, marginRight: 8 }}
                  />
                  <span className="item-name">{item.name}</span>
                </div>
                <div className="item-details">
                  <span>Số lượng: {item.quantity}</span>
                  <span>
                    Giá: <FormatCost value={item.unitPrice * item.quantity} />
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="cart-totals">
            <h3>
              Tổng cộng: <FormatCost value={cartSummary?.totalAmount || 0} />
            </h3>
          </div>

          <Button
            type="primary"
            onClick={handleGoToPayment}
            style={{
              width: "200px",
              backgroundColor: "black",
              height: "50px",
              fontSize: "18px",
              marginTop: "20px",
            }}
          >
            Tiếp tục thanh toán
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
