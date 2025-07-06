import "./index.scss";
import {
  UserOutlined,
  ShoppingCartOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Wallet as WalletIcon } from "@mui/icons-material";
import { Dropdown, Menu } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/features/userSlice";
import { toast } from "react-toastify";
import api from "../../config/api";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [searchValue, setSearchValue] = useState("");

  const user = useSelector((state) => state.user);
  const isLoggedIn = user?.isLoggedIn;
  const cart = useSelector((store) => store.cart.products) || [];
  const cartItemCount = cart.length;

  const shopMenuItems = [
    {
      key: "1",
      label: (
        <div style={{ color: "white" }} onClick={() => navigate("/topShop")}>
          TOPS
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div
          style={{ color: "white" }}
          onClick={() => navigate("/shop/bottoms")}
        >
          BOTTOMS
        </div>
      ),
    },
    {
      key: "3",
      label: (
        <div
          style={{ color: "white" }}
          onClick={() => navigate("/shop/accessories")}
        >
          OUTTERWEAR
        </div>
      ),
    },
  ];

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" onClick={handleProfile}>
        Profile
      </Menu.Item>

      <Menu.Item key="logout" onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  function handleProfile() {
    const token = localStorage.getItem("token");
    token ? navigate("/userLayout") : navigate("/login");
  }

  function handleLogout() {
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
  const handleSearch = () => {
    if (!searchValue.trim()) {
      alert("Vui lòng nhập từ khóa tìm kiếm");
      return;
    }
    navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    setSearchValue("");
  };

  return (
    <header className="header">
      <div className="header__logo" onClick={() => navigate("/")}>
        <img
          src="https://keedo.vn/wp-content/uploads/2020/08/logo-keedo.png"
          alt="logo"
        />
      </div>

      <nav className="header__nav">
        <div className="header__nav-center">
          <ul>
            <li onClick={() => navigate("/")} className="header__home-link">
              Home
            </li>
            <Dropdown
              menu={{ items: shopMenuItems }}
              trigger={["hover"]}
              overlayClassName="custom-dropdown-menu"
            >
              <span
                onClick={() => navigate("/shop")}
                style={{
                  cursor: "pointer",
                  userSelect: "none",
                  fontWeight: "bold",
                  fontSize: "28px",
                  color: "#484848",
                }}
              >
                Shop
              </span>
            </Dropdown>
            <li onClick={() => navigate("/aboutUs")}>About Us</li>
          </ul>
        </div>

        <div className="header__nav-right">
          <ul>
            {/* {isLoggedIn && (
              <li>
                <WalletIcon
                  onClick={() => navigate("/wallet")}
                  style={{
                    color: "black",
                    cursor: "pointer",
                    fontSize: "35px",
                  }}
                />
              </li>
            )} */}
            <li className="search-container">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="search-input"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button className="search-button" onClick={handleSearch}>
                <SearchOutlined />
              </button>
            </li>

            <li>
              {isLoggedIn ? (
                <Dropdown overlay={userMenu} trigger={["hover"]}>
                  <UserOutlined
                    style={{ cursor: "pointer", fontSize: "24px" }}
                  />
                </Dropdown>
              ) : (
                <UserOutlined
                  style={{ cursor: "pointer", fontSize: "24px" }}
                  onClick={() => navigate("/login")}
                />
              )}
            </li>

            <li>
              <ShoppingCartOutlined
                style={{ cursor: "pointer", fontSize: "24px" }}
                onClick={() => {
                  const token = localStorage.getItem("token");
                  if (!token) {
                    toast.error("Vui lòng đăng nhập để xem giỏ hàng");
                    navigate("/login");
                  } else {
                    navigate("/cart");
                  }
                }}
              />
              {cartItemCount > 0 && (
                <span className="cart-count">{cartItemCount}</span>
              )}
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
