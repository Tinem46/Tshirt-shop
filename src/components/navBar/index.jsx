import { Breadcrumb } from "antd";

import "./index.scss";
import { useNavigate } from "react-router-dom";

function Naviagtion({
  selectedMenu = "",
  triggerReset = () => {},
  standOn = "shop",
  link = "/",
}) {
  const navigate = useNavigate();
  return (
    <div className="navigation">
      <img
        className="pictureOutline"
        src={
          "https://down-vn.img.susercontent.com/file/8bd57cda68fc7a4a2076feaae894b3fe"
        }
        alt="background"
      />
      <div className="container">
        <h1 className="shopTitle">{standOn}</h1>
        <div className="breadcrumbBar">
          <Breadcrumb>
            {/* Home should navigate to / */}
            <Breadcrumb.Item>
              <span
                onClick={() => navigate("/")}
                style={{ cursor: "pointer", fontWeight: "normal" }}
              >
                Home
              </span>
            </Breadcrumb.Item>

            {/* Shop should be clickable and reset the fish list */}
            <Breadcrumb.Item>
              <span
                onClick={() => {
                  triggerReset(); // Trigger the reset function to reset the fish list
                  navigate({ link }); // Navigate to /FishShop
                }}
                style={{
                  cursor: "pointer",
                  fontWeight: !selectedMenu ? "bold" : "normal",
                }}
              >
                {name}
              </span>
            </Breadcrumb.Item>
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

export default Naviagtion;
