import { Button, Input, Select, Card, Radio, Spin } from "antd";
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

  // Địa chỉ đã lưu
  const [addressList, setAddressList] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dữ liệu form nhập mới
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

  // Lấy địa chỉ đã lưu và mặc định
  useEffect(() => {
    fetchUserProfile();
    fetchCartSummary();
    fetchAddresses();
    // eslint-disable-next-line
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await getUserAddress();
      const addresses = res.data.data || [];
      setAddressList(addresses);
      // Set mặc định là địa chỉ default
      const defaultAddress = addresses.find((a) => a.isDefault);
      if (defaultAddress) setSelectedAddressId(defaultAddress.id);
      // Optionally điền luôn form userDetails bằng địa chỉ mặc định (nếu muốn)
    } catch (err) {
      toast.error("Không thể tải danh sách địa chỉ");
    } finally {
      setLoading(false);
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
        phone: user?.phoneNumber || "",
        email: user?.email || "",
        gender: user?.gender || "",
      }));
    } catch {
      toast.error("Không thể tải thông tin người dùng");
    }
  };

  const fetchCartSummary = async () => {
    try {
      if (!cartItemIds.length) return;
      const res = await api.post("Cart/calculate-total", cartItemIds, {
        headers: { "Content-Type": "application/json" },
      });
      setCartSummary(res.data);
    } catch {
      toast.error("Không thể tính tổng đơn hàng");
    }
  };

  // Xử lý input form nhập mới
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (value) => {
    setUserDetails((prev) => ({ ...prev, gender: value }));
  };

  // Chọn địa chỉ cũ hay nhập mới
  const handleRadioChange = (e) => {
    const value = e.target.value;
    if (value === "new") {
      setIsNewAddress(true);
      setSelectedAddressId(null);
    } else {
      setIsNewAddress(false);
      setSelectedAddressId(value);
    }
  };

  // Tiếp tục sang payment, truyền đúng payload
  const handleGoToPayment = () => {
    // Validate
    if (isNewAddress) {
      if (
        !userDetails.fullname ||
        !userDetails.detailAddress ||
        !userDetails.city ||
        !userDetails.district ||
        !userDetails.ward ||
        !userDetails.phone
      ) {
        toast.error("Vui lòng nhập đủ thông tin giao hàng!");
        return;
      }
    } else {
      if (!selectedAddressId) {
        toast.error("Bạn chưa chọn địa chỉ giao hàng!");
        return;
      }
    }

    // Truyền đúng theo lựa chọn:
    navigate("/payment", {
      state: {
        cart,
        cartSummary,
        cartId,
        // Nếu dùng địa chỉ mới thì chỉ gửi newAddress, ngược lại gửi userAddressId
        userAddressId: isNewAddress ? null : selectedAddressId,
        newAddress: isNewAddress
          ? {
              receiverName: userDetails.fullname,
              phone: userDetails.phone,
              detailAddress: userDetails.detailAddress,
              ward: userDetails.ward,
              district: userDetails.district,
              province: userDetails.city,
              isDefault: false,
            }
          : null,
        // Có thể truyền thêm userDetails nếu muốn show lại ở PaymentPage
        userDetails,
      },
    });
  };

  // ---------- Render -------------
  return (
    <div className="checkout-container">
      <div className="checkout">
        <div className="billing-details">
          <h2>Chọn địa chỉ giao hàng</h2>
          {loading ? (
            <Spin />
          ) : (
            <Radio.Group
              onChange={handleRadioChange}
              value={isNewAddress ? "new" : selectedAddressId}
              style={{ width: "100%" }}
            >
              {addressList.map((addr) => (
                <Card
                  key={addr.id}
                  style={{
                    marginBottom: 12,
                    borderColor: addr.isDefault ? "#52c41a" : "#d9d9d9",
                  }}
                >
                  <Radio value={addr.id} style={{ width: "100%" }}>
                    <b>{addr.receiverName}</b> | {addr.phone}
                    <br />
                    {addr.detailAddress}, {addr.ward}, {addr.district},{" "}
                    {addr.province}
                    {addr.isDefault && (
                      <span style={{ color: "#52c41a", marginLeft: 8 }}>
                        (Mặc định)
                      </span>
                    )}
                  </Radio>
                </Card>
              ))}
              <Card style={{ marginBottom: 12 }}>
                <Radio value="new" style={{ width: "100%" }}>
                  <b>Nhập địa chỉ mới</b>
                </Radio>
              </Card>
            </Radio.Group>
          )}

          {/* Nếu nhập mới thì show form */}
          {isNewAddress && (
            <div style={{ marginTop: 16 }}>
              <Input
                name="fullname"
                placeholder="Họ và tên"
                value={userDetails.fullname}
                onChange={handleInputChange}
                style={{ marginBottom: 8 }}
              />
              <Select
                name="gender"
                value={userDetails.gender || undefined}
                onChange={handleGenderChange}
                style={{ width: "100%", marginBottom: 40 }}
                placeholder="Giới tính"
              >
                <Option value="Male">Nam</Option>
                <Option value="Female">Nữ</Option>
                <Option value="other">Khác</Option>
              </Select>
              <Input
                name="detailAddress"
                placeholder="Địa chỉ chi tiết (số nhà, tên đường)"
                value={userDetails.detailAddress}
                onChange={handleInputChange}
                style={{ marginBottom: 8 }}
              />
              <Input
                name="city"
                placeholder="Tỉnh / Thành phố"
                value={userDetails.city}
                onChange={handleInputChange}
                style={{ marginBottom: 8 }}
              />
              <Input
                name="district"
                placeholder="Quận / Huyện"
                value={userDetails.district}
                onChange={handleInputChange}
                style={{ marginBottom: 8 }}
              />
              <Input
                name="ward"
                placeholder="Phường / Xã"
                value={userDetails.ward}
                onChange={handleInputChange}
                style={{ marginBottom: 8 }}
              />
              <Input
                name="phone"
                placeholder="Số điện thoại"
                value={userDetails.phone}
                onChange={handleInputChange}
                style={{ marginBottom: 8 }}
              />
              <Input
                name="email"
                placeholder="Địa chỉ email"
                value={userDetails.email}
                onChange={handleInputChange}
                style={{ marginBottom: 8 }}
              />
              <TextArea
                name="additionalInfo"
                placeholder="Ghi chú thêm (tuỳ chọn)"
                value={userDetails.additionalInfo}
                onChange={handleInputChange}
                rows={3}
                style={{ marginBottom: 8 }}
              />
            </div>
          )}
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
