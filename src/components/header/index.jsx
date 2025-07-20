import "./index.scss";
import {
  UserOutlined,
  ShoppingCartOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Wallet as WalletIcon } from "@mui/icons-material";
import { Dropdown, Menu } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/features/userSlice";
import { toast } from "react-toastify";

import { MdAutoAwesome } from "react-icons/md";
import api from "../../config/api";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [searchValue, setSearchValue] = useState("");

  const user = useSelector((state) => state.user);
  const isLoggedIn = user?.isLoggedIn;
  const cart = useSelector((store) => store.cart.products) || [];
  const cartItemCount = cart.length;
  const [categories, setCategories] = useState([]);

  // Lấy danh mục từ API
  useEffect(() => {
    api
      .get("Category")
      .then((res) => {
        // Kiểm tra kỹ đường dẫn data
        let cats = res.data?.data.data || res.data || res;
        // Đảm bảo là mảng
        if (!Array.isArray(cats)) cats = [];
        setCategories(cats);
        console.log("Fetched categories:", cats);
      })
      .catch((err) => {
        setCategories([]); // Lỗi cũng set mảng rỗng
        console.error("Lỗi lấy danh mục:", err);
      });
  }, []);

  const shopMenuItems = categories.map((cat) => ({
    key: cat.id?.toString() || cat.Id?.toString() || cat.slug || cat.name,
    label: (
      <div
        style={{ color: "white" }}
        onClick={() => navigate(`/shop?categoryId=${cat.id}`)}
      >
        {cat.name || cat.Name}
      </div>
    ),
  }));

  function handleProfile() {
    const token = localStorage.getItem("token");
    token ? navigate("/userLayout") : navigate("/login");
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
            <li
              className="ai-menu-item"
              onClick={() => navigate("/custom-design")}
            >
              AI
              <span className="ai-sparkle">
                <MdAutoAwesome size={20} color="#927d05ff" />
              </span>
            </li>
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
                <UserOutlined
                  style={{ cursor: "pointer", fontSize: "24px" }}
                  onClick={handleProfile}
                />
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
