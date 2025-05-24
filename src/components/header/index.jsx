import "./index.scss";
import { UserOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
// import logo from "../../assets/image/LogoHome1.png";
// import { useDispatch, useSelector } from "react-redux";
// import { logout } from "../../redux/features/userSlice";
// import { Dropdown} from "antd";
import { Wallet as WalletIcon } from "@mui/icons-material";
import { toast } from "react-toastify";

const Header=()=> {
  const navigate = useNavigate();
  // const dispatch = useDispatch();
  // const user = useSelector((state) => state.user);
  // const isLoggedIn = user ? user.isLoggedIn : false;
  // const cart = useSelector((store) => store.cart.products) || [];
  // const cartItemCount = Array.isArray(cart) ? cart.length : 0;

  // const userMenu = (
  //   <ul className="header__dropdown-menu">
  //     {isLoggedIn && <li onClick={handleProfile}>Profile</li>}
  //     {isLoggedIn && <li onClick={() => navigate("/history")}>History</li>}
  //     {isLoggedIn ? (
  //       <li onClick={handleLogout}>Logout</li>
  //     ) : (
  //       <li onClick={() => navigate("/login")}>Login</li>
  //     )}
  //   </ul>
  // );

  // function handleProfile() {
  //   const token = localStorage.getItem("token");
  //   if (token) {
  //     navigate(`/profile`);
  //   } else {
  //     navigate(`/login`);
  //   }
  // }

  // function handleLogout() {
  //   localStorage.removeItem("token");
  //   dispatch(logout());
  //   navigate("/login");
  // }

  // useEffect(() => {
  //   const handleScroll = () => {
  //     const header = document.querySelector('.header');
  //     if (window.scrollY > 0) {
  //       header.classList.add('scrolled');
  //     } else {
  //       header.classList.remove('scrolled');
  //     }
  //   };

  //   window.addEventListener('scroll', handleScroll);
  //   return () => {
  //     window.removeEventListener('scroll', handleScroll);
  //   };
  // }, []);

  return (
    <header className="header">
      <div className="header__logo" onClick={() => navigate("/")}>
        {/* <img src={logo} alt="logo" /> */}
        <img src="https://keedo.vn/wp-content/uploads/2020/08/logo-keedo.png"/>
      </div>
      <nav className="header__nav">
        <div className="header__nav-center">
          <ul>
            <li onClick={() => navigate("/")} className="header__home-link">
              Home
            </li>
            <li onClick={() => navigate("/FishShop")}>Shop</li>

            
            <li onClick={() => navigate("/aboutUs")}>About Us</li>
            <li onClick={() => navigate("/feedback")}>Feedback</li>
          </ul>
        </div>
        <div className="header__nav-right">
          <ul>
            {/* {isLoggedIn && ( */}
            <li>
              <WalletIcon
                onClick={() => navigate("/wallet")}
                style={{ color: "black", cursor: "pointer", fontSize: "35px" }}
              />
            </li>
            {/* )} */}
            <li>
              {/* <Dropdown overlay={userMenu} trigger={['hover']}> */}
                <UserOutlined style={{ cursor: 'pointer' }} />
              {/* </Dropdown> */}
            </li>
            <li>
              <ShoppingCartOutlined
                style={{ cursor: "pointer" }}
                onClick={() => {
                  const token = localStorage.getItem("token");
                  if (!token) {
                    navigate("/login");
                    toast.error("Please login to view cart");
                  } else {
                    navigate("/cart");
                  }
                }}
              />
              {/* <span className="cart-count">{cartItemCount}</span> */}
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}

export default Header;
