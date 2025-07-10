import { Button, Input, Select } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./index.scss";
import { toast } from "react-toastify";
import api from "../../config/api";
import FormatCost from "../../components/formatCost";

const { TextArea } = Input;
const { Option } = Select;

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart = [] } = location.state || {};
  const { cartId, variantIds = [], cartItemIds = [] } = location.state || {};

  const [userDetails, setUserDetails] = useState({
    fullname: "",
    country: "",
    specific_Address: "",
    city: "",
    district: "",
    ward: "",
    phone_number: "",
    email: "",
    gender: "",
    additionalInfo: "",
  });

  const [cartSummary, setCartSummary] = useState({
    subtotal: 0,
    estimatedShipping: 0,
    estimatedTotal: 0,
    estimatedTax: 0,
  });

  useEffect(() => {
    fetchUserProfile();
    fetchCartSummary();
    // eslint-disable-next-line
  }, []);

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
        specific_Address: user?.address || "",
        city: user?.city || "",
        phone_number: user?.phoneNumber || "",
        email: user?.email || "",
        gender:
          user?.gender === 0
            ? "male"
            : user?.gender === 1
            ? "female"
            : user?.gender === 2
            ? "other"
            : "",
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

  const handleSelectChange = (value) => {
    setUserDetails((prev) => ({ ...prev, country: value }));
  };

  const handleGenderChange = (value) => {
    setUserDetails((prev) => ({ ...prev, gender: value }));
  };

  // Sang trang payment
  const handleGoToPayment = () => {
    if (
      !userDetails.fullname ||
      !userDetails.specific_Address ||
      !userDetails.phone_number
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin nhận hàng!");
      return;
    }
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
          <h2>Billing Details</h2>
          <Input
            name="fullname"
            placeholder="Full Name"
            value={userDetails.fullname}
            onChange={handleInputChange}
          />
          <Select
            name="country"
            value={userDetails.country || undefined}
            onChange={handleSelectChange}
            style={{ width: "100%" }}
          >
            <Option value="">Country / Region</Option>
            <Option value="Vietnam">Vietnam</Option>
            <Option value="Laos">Laos</Option>
            <Option value="Cambodia">Cambodia</Option>
            <Option value="Thailand">Thailand</Option>
          </Select>
          <Select
            name="gender"
            value={userDetails.gender || undefined}
            onChange={handleGenderChange}
            style={{ width: "100%" }}
            placeholder="Gender"
          >
            <Option value="">Gender</Option>
            <Option value="male">Male</Option>
            <Option value="female">Female</Option>
            <Option value="other">Other</Option>
          </Select>
          <Input
            name="specific_Address"
            placeholder="Street Address"
            value={userDetails.specific_Address}
            onChange={handleInputChange}
          />
          <Input
            name="city"
            placeholder="Town / City"
            value={userDetails.city}
            onChange={handleInputChange}
          />

          <Input
            name="district"
            placeholder="District (Quận/Huyện)"
            value={userDetails.district}
            onChange={handleInputChange}
          />
          <Input
            name="ward"
            placeholder="Ward (Phường/Xã)"
            value={userDetails.ward}
            onChange={handleInputChange}
          />

          <Input
            name="phone_number"
            placeholder="Phone"
            value={userDetails.phone_number}
            onChange={handleInputChange}
          />
          <Input
            name="email"
            placeholder="Email Address"
            value={userDetails.email}
            onChange={handleInputChange}
          />
          <TextArea
            name="additionalInfo"
            placeholder="Additional Information"
            value={userDetails.additionalInfo}
            onChange={handleInputChange}
            rows={4}
          />
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h2>Order Summary</h2>
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
                  <span>Quantity: {item.quantity}</span>
                  <span>
                    Price: <FormatCost value={item.unitPrice * item.quantity} />
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="cart-totals">
           
            <h3>
              Total: <FormatCost value={cartSummary?.totalAmount || 0} />
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
