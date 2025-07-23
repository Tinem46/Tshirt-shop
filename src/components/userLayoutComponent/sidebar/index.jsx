import React, { useEffect, useState } from "react";
import "./index.scss";
import { FaUserCircle, FaPen } from "react-icons/fa";
import {
  ShoppingOutlined,
  UserOutlined,
  DownOutlined,
  UpOutlined,
  UserAddOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import api from "../../../config/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { logout } from "../../../redux/features/userSlice";
import Swal from "sweetalert2";

function Sidebar({ activeTab, setActiveTab }) {
  const [isAccountOpen, setIsAccountOpen] = useState(true); // Mặc định mở
  const [isPaymentOpen, setIsPaymentOpen] = useState(true); // Nếu muốn thanh toán cũng có toggle
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleTabChange = (tabKey) => {
    // Nếu đang có status trong URL, bỏ nó đi khi sang tab khác
    const newSearch = `?tab=${tabKey}`;
    navigate(`/userLayout${newSearch}`);
    setActiveTab(tabKey); // Giữ lại để state react update nhanh, nhưng navigate là chính
  };

  const isActive = (tab) => activeTab === tab;
  const fetchUser = async () => {
    try {
      const response = await api.get("Account/account");
      const user = response.data;
      console.log("Fetched user data:", user);
      setUser(user);
    } catch (error) {
      console.error("Failed to load user", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Xác nhận đăng xuất",
      text: "Bạn có chắc chắn muốn đăng xuất không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Huỷ",
    });

    if (result.isConfirmed) {
      // Lấy refreshToken từ localStorage
      const refreshToken = localStorage.getItem("refreshToken");

      // Gửi request logout lên backend nếu có refreshToken
      if (refreshToken) {
        api.post("Auth/logout", { refreshToken }).catch((err) => {
          // Nếu fail vẫn tiếp tục logout ở FE, không cần báo lỗi cho người dùng
          console.error("Logout backend failed:", err);
        });
      }

      // Xoá toàn bộ thông tin trên localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      // Redux logout (nếu có), điều hướng về trang login, show toast
      dispatch(logout());
      navigate("/login");
      toast.success("Đã đăng xuất");
    }
  };
  return (
    <div className="sidebar">
      {/* Thông tin người dùng */}
      <div className="profile-section">
        <FaUserCircle size={48} color="#ccc" />
        <div className="profile-info">
          <strong className="username">{user?.fullName}</strong>
          <div className="edit-profile">
            <FaPen size={12} style={{ marginRight: 4 }} />
            <span onClick={() => setActiveTab("profile")}>Sửa Hồ Sơ</span>
          </div>
        </div>
      </div>
      <div className="line"></div>

      {/* Tài Khoản Của Tôi */}
      <h3
        className="section-title"
        onClick={() => setIsAccountOpen(!isAccountOpen)}
        style={{
          cursor: "pointer",
          userSelect: "none",
          marginBottom: isAccountOpen ? "0" : "10px",
        }}
      >
        <UserOutlined
          style={{ marginRight: 6, color: "red", fontSize: "20px" }}
        />
        Tài Khoản Của Tôi
      </h3>

      {isAccountOpen && (
        <ul className="tab-list">
          <li
            className={isActive("profile") ? "tab-item active" : "tab-item"}
            onClick={() => handleTabChange("profile")}
          >
            Hồ Sơ
          </li>
          <li
            className={isActive("address") ? "tab-item active" : "tab-item"}
            onClick={() => handleTabChange("address")}
          >
            Địa Chỉ
          </li>
          <li
            className={
              isActive("changePassword") ? "tab-item active" : "tab-item"
            }
            onClick={() => handleTabChange("changePassword")}
          >
            Đổi Mật Khẩu
          </li>
        </ul>
      )}
      <div style={{ marginBottom: "10px" }}></div>
      {/* Thanh toán */}
      <h3
        className="section-title"
        onClick={() => setIsPaymentOpen(!isPaymentOpen)}
        style={{
          cursor: "pointer",
          userSelect: "none",
          marginBottom: isPaymentOpen ? "0" : "10px",
        }}
      >
        <ShoppingOutlined
          style={{ marginRight: 6, color: "red", fontSize: "20px" }}
        />
        Thanh toán
      </h3>

      {isPaymentOpen && (
        <ul className="tab-list">
          <li
            className={isActive("orders") ? "tab-item active" : "tab-item"}
            onClick={() => handleTabChange("orders")}
          >
            Đơn Mua
          </li>
          <li
            className={isActive("coupon") ? "tab-item active" : "tab-item"}
            onClick={() => handleTabChange("coupon")}
          >
            Mã giảm giá
          </li>
          <li
            className={
              isActive("customDesign") ? "tab-item active" : "tab-item"
            }
            onClick={() => handleTabChange("customDesign")}
          >
            Thiết Kế Tùy Chỉnh
          </li>
        </ul>
      )}
      <div style={{ marginBottom: "10px" }}></div>

      <div className="logout-section">
        <button className="logout-button" onClick={handleLogout}>
          <LogoutOutlined style={{ marginRight: 10 }} /> Đăng Xuất
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
