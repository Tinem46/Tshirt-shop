import "./index.scss";
import { Col, Row, Divider } from "antd";

// import backgroundImage from '../assets/image/background.jpg'; // Thêm ảnh nền của bạn vào thư mục assets

function AuthLayout({ children }) {
  return (
    <div
      className="auth-layout"
      style={{
        backgroundImage: `url("https://cdn2.fptshop.com.vn/unsafe/Uploads/images/tin-tuc/176898/Originals/anh-bia-thoi-trang%20(15).jpg")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        height: "120vh",
        width: "100%",
      }}
    >
      <div
        className="content-overlay"
        style={{ backdropFilter: "blur(2px)", height: "100%" }}
      >
        <Row
          justify="center"
          align="middle"
          gutter={[48, 0]}
          style={{ height: "100%" }}
        >
          <Col
            xs={24}
            sm={24}
            md={10}
            lg={8}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <img
              src={"https://keedo.vn/wp-content/uploads/2020/08/logo-keedo.png"}
              alt="logo"
              style={{ width: "60%", height: "auto" }}
            />
          </Col>
          <Divider
            type="vertical"
            style={{
              height: "350px",
              borderColor: "black",
              borderWidth: "1px",
              marginLeft: "-80px",
              marginTop: "40px",
            }}
          />
          <Col xs={24} sm={24} md={10} lg={8}>
            {children}
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default AuthLayout;
