import { Breadcrumb } from "antd";
import "./index.scss";
import { useNavigate } from "react-router-dom";

function Navigation({
  mainName = "Shop",
  selectedMenu = "",
  triggerReset = () => {},
  shopLink = "/shop",
  img = "https://img.ws.mms.shopee.vn/vn-11134210-7r98o-lodhuspkwjqrac",
}) {
  const navigate = useNavigate();

  return (
    <div className="navigation">
      <img className="pictureOutline" src={img} alt="background" />

      {/* Gradient Overlays */}
      <div className="gradient-overlay"></div>
      <div className="blur-overlay"></div>

      <div className="container">
        <h1 className="shopTitle">{mainName}</h1>
        <div className="breadcrumbBar">
          <Breadcrumb separator={<span className="separator">•</span>}>
            {/* Home breadcrumb */}
            <Breadcrumb.Item>
              <span onClick={() => navigate("/")} className="breadcrumb-link">
                Home
              </span>
            </Breadcrumb.Item>

            {/* Shop breadcrumb */}
            <Breadcrumb.Item>
              <span
                onClick={() => {
                  triggerReset();
                  navigate(shopLink);
                }}
                className={`breadcrumb-link ${!selectedMenu ? "active" : ""}`}
              >
                {mainName}
              </span>
            </Breadcrumb.Item>

            {/* Selected menu/category breadcrumb */}
            {selectedMenu && (
              <Breadcrumb.Item>
                <span className="breadcrumb-link active">
                  {selectedMenu.charAt(0).toUpperCase() + selectedMenu.slice(1)}
                </span>
              </Breadcrumb.Item>
            )}
          </Breadcrumb>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="decorative-elements">
        <div className="floating-element element-1"></div>
        <div className="floating-element element-2"></div>
        <div className="floating-element element-3"></div>
        <div className="floating-element element-4"></div>
      </div>

      {/* Bottom Border Accent */}
      <div className="bottom-accent"></div>
    </div>
  );
}

export default Navigation;
