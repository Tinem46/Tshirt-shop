import React, { useEffect, useState } from "react";
import "./index.scss";
import { FaUserCircle, FaPen } from "react-icons/fa";
import {
  ShoppingOutlined,
  UserOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";
import api from "../../../config/api";

function Sidebar({ activeTab, setActiveTab }) {
  const [isAccountOpen, setIsAccountOpen] = useState(true); // Mặc định mở
  const [isPaymentOpen, setIsPaymentOpen] = useState(true); // Nếu muốn thanh toán cũng có toggle
  const [user, setUser] = useState(null);

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
            onClick={() => setActiveTab("profile")}
          >
            Hồ Sơ
          </li>
          <li
            className={isActive("address") ? "tab-item active" : "tab-item"}
            onClick={() => setActiveTab("address")}
          >
            Địa Chỉ
          </li>
          <li
            className={
              isActive("changePassword") ? "tab-item active" : "tab-item"
            }
            onClick={() => setActiveTab("changePassword")}
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
            onClick={() => setActiveTab("orders")}
          >
            Đơn Mua
          </li>
          <li
            className={isActive("coupon") ? "tab-item active" : "tab-item"}
            onClick={() => setActiveTab("coupon")}
          >
            Mã giảm giá
          </li>
        </ul>
      )}
    </div>
  );
}

export default Sidebar;
