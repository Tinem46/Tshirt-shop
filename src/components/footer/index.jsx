import React from "react";
import "./index.scss";
import { IoSendSharp } from "react-icons/io5";

const Footer = ({
  style,
  ...rest
}) => {
  return (
    <footer className="footer" style={style} {...rest}>
      <div className="footerContent">
        <div className="map-container">
          <iframe
            className="AboutUsPage__map"
            title="map"
            src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d111712.0863672117!2d106.72314450848583!3d10.848130864058845!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1zbmjDoCB0aHXhu5FjIGxvbmcgY2jDonU!5e0!3m2!1svi!2s!4v1727451316132!5m2!1svi!2s"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>

        <div className="footerColumns">
          {/* Brand & Subscribe */}
          <div className="footerColumn brandSection">
            <h2 className="logoText">Exclusive</h2>
            <h3 className="subscribeTitle">Subscribe</h3>
            <p className="offerText">Get 10% off your first order</p>
            <form className="emailForm" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="emailInput"
                required
              />
              <button
                type="submit"
                className="submitIcon"
                aria-label="Subscribe"
              >
                <IoSendSharp />
              </button>
            </form>
          </div>

          {/* Support */}
          <div className="footerColumn">
            <h3 className="columnTitle">Support</h3>
            <ul className="columnList">
              <li className="columnItem">111 Bijoy sarani, Dhaka,</li>
              <li className="columnItem">DH 1515, Bangladesh.</li>
              <li className="columnItem">exclusive@gmail.com</li>
              <li className="columnItem">+88015-88888-9999</li>
            </ul>
          </div>

          {/* Account */}
          <div className="footerColumn">
            <h3 className="columnTitle">Account</h3>
            <ul className="columnList">
              <li className="columnItem">My Account</li>
              <li className="columnItem">Login / Register</li>
              <li className="columnItem">Cart</li>
              <li className="columnItem">Wishlist</li>
              <li className="columnItem">Shop</li>
            </ul>
          </div>

          {/* Quick Link */}
          <div className="footerColumn">
            <h3 className="columnTitle">Quick Link</h3>
            <ul className="columnList">
              <li className="columnItem">Privacy Policy</li>
              <li className="columnItem">Terms Of Use</li>
              <li className="columnItem">FAQ</li>
              <li className="columnItem">Contact</li>
            </ul>
          </div>
        </div>

        {/* Social Icons placeholder */}
        <div className="socialIcons">
          {/* Bạn có thể thêm icon mạng xã hội ở đây */}
        </div>
      </div>

      {/* Copyright */}
      <div className="copyright">
        <span className="copyrightIcon">&copy;</span>
        <span className="copyrightText">
          Copyright Rimel 2024. All rights reserved
        </span>
      </div>
    </footer>
  );
};

export default Footer;
