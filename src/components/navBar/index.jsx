import { Breadcrumb } from "antd";
import "./index.scss";
import { useNavigate } from "react-router-dom";

function Navigation({
  mainName = "Shop",
  selectedMenu = "",
  triggerReset = () => {},
  shopLink = "/shop",
}) {
  const navigate = useNavigate();

  return (
    <div className="navigation">
      <img
        className="pictureOutline"
        src="https://down-vn.img.susercontent.com/file/8bd57cda68fc7a4a2076feaae894b3fe"
        alt="background"
      />
      <div className="container">
        <h1 className="shopTitle">{mainName}</h1>
        <div className="breadcrumbBar">
          <Breadcrumb>
            {/* Home breadcrumb */}
            <Breadcrumb.Item>
              <span
                onClick={() => navigate("/")}
                style={{ cursor: "pointer", fontWeight: "normal" }}
              >
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
                style={{
                  cursor: "pointer",
                  fontWeight: !selectedMenu ? "bold" : "normal",
                }}
              >
                {mainName}
              </span>
            </Breadcrumb.Item>

            {/* Selected menu/category breadcrumb */}
            {selectedMenu && (
              <Breadcrumb.Item style={{ fontWeight: "bold" }}>
                {selectedMenu.charAt(0).toUpperCase() + selectedMenu.slice(1)}
              </Breadcrumb.Item>
            )}
          </Breadcrumb>
        </div>
      </div>
    </div>
  );
}

export default Navigation;
