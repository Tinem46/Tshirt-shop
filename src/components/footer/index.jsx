import React from "react";
import "./index.scss";

const Footer = () => {
  return (<>
   <div className="scroll-text">
        <div className="text-track">
          {Array(4)
            .fill("STREETWEAR BRAND LIMITED")
            .map((text, index) => (
              <span key={index}>{text}</span>
            ))}
        </div>
      </div>
    <footer className="footer">
        
      <div className="footerContent">
        <div className="footerColumns">
          {/* Cột 1: Hệ thống cửa hàng */}
          <div className="footerColumn">
            <h3 className="columnTitle">HỆ THỐNG CỬA HÀNG HADES</h3>
            <ul className="columnList">
              <li className="columnItem">
                STUDIO Store 1: 26 LY TU TRONG STREET, DISTRICT 1,
                HOCHIMINH (THE NEW PLAYGROUND).
              </li>
              <li className="columnItem">
                Store 2: 140 NGUYEN HY QUANG, DONG DA DISTRICT, HANOI.
              </li>
              <li className="columnItem">
                Store 3: Floor B1 VINCOM LY TU TRONG, DISTRICT 1, HOCHIMINH.
              </li>
              <li className="columnItem">Store 4: Tầng 4, GIGA MALL, HCM</li>
              <li className="columnItem">
                Store 5: 152 TRAN QUANG DIEU, WARD 14, DISTRICT 3, HCM
              </li>
            </ul>
          </div>

          {/* Cột 2: Chính sách */}
          <div className="footerColumn">
            <h3 className="columnTitle">CHÍNH SÁCH</h3>
            <ul className="columnList">
              <li className="columnItem">Chính sách sử dụng website</li>
              <li className="columnItem">Phương thức thanh toán</li>
              <li className="columnItem">Chính sách đổi trả</li>
              <li className="columnItem">Chính sách giao nhận - vận chuyển</li>
              <li className="columnItem">Điều khoản dịch vụ</li>
              <li className="columnItem">Hướng dẫn mua hàng</li>
              <li className="columnItem">Chính sách bảo mật</li>
            </ul>
          </div>

          {/* Cột 3: Thông tin liên hệ */}
          <div className="footerColumn">
            <h3 className="columnTitle">THÔNG TIN LIÊN HỆ</h3>
            <ul className="columnList">
              <li className="columnItem">CÔNG TY TNHH HADES</li>
              <li className="columnItem">SỐ CSKH: 02873011021 (10h -18h)</li>
              <li className="columnItem">Ngày cấp: 20/07/2020</li>
              <li className="columnItem">Tuyển dụng: hr@hades.vn</li>
              <li className="columnItem">Website: hades.vn</li>
              <li className="columnItem">For business: contact@hades.vn</li>
            </ul>
          </div>

          {/* Cột 4: Social media */}
          <div className="footerColumn socialIcons">
            <h3 className="columnTitle">FOLLOW US ON SOCIAL MEDIA</h3>
            <div className="socialIconsRow">
              <img
                src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
                alt="Facebook"
              />
              <img
                src="https://cdn-icons-png.flaticon.com/512/733/733558.png"
                alt="Instagram"
              />
            </div>
           
          </div>
        </div>
      </div>

      <div className="copyright">
        <span className="copyrightIcon">&copy;</span>
        <span className="copyrightText">
          Copyright  2024. All rights reserved
        </span>
      </div>
    </footer>
    </>
  );
};

export default Footer;
