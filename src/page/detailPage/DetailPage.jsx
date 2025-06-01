import React, { useRef, useState } from "react";
import { Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import ImageModal from "../../components/imageModal";

import "./detailPage.scss";
import Carousel from "../../components/carousel";
const DetailPage = () => {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef(null);
  const handleSizeChange = (size) => {
    setSelectedSize(size);
  };

  const images = [
    "https://dosi-in.com/images/detailed/42/CDL10_1.jpg",
    "https://dosi-in.com/images/detailed/42/CDL10_2.jpg",
    "https://dosi-in.com/images/detailed/42/CDL10_3.jpg",
    // Thêm các ảnh khác
  ];
  const scrollThumbnails = (direction) => {
    if (containerRef.current) {
      const scrollAmount = 100;
      containerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };
  const handleChangeImage = (direction) => {
    if (direction === "left") {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    } else {
      setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }
  };
  return (
    <>
      <div className="detail-container">
        <div className="product-display">
          <div className="product-image">
            <div className="main-image" onClick={() => setIsModalOpen(true)}>
              <img src={images[selectedIndex]} alt="product" />
            </div>

            <div className="thumbnail-section">
              <Button
                className="nav-button left"
                icon={<LeftOutlined />}
                onClick={() => scrollThumbnails("left")}
              />

              <div ref={containerRef} className="thumbnail-container">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${
                      selectedIndex === index ? "active" : ""
                    }`}
                    onClick={() => setSelectedIndex(index)}
                  >
                    <img src={img} alt={`thumbnail ${index + 1}`} />
                  </div>
                ))}
              </div>

              <ImageModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                images={images}
                selectedIndex={selectedIndex}
                onChangeImage={handleChangeImage}
              />

              <Button
                className="nav-button right"
                icon={<RightOutlined />}
                onClick={() => scrollThumbnails("right")}
              />
            </div>
          </div>
          <div className="product-info">
            <h1>Dico Jr Variation T-Shirt Black</h1>
            <div className="price">395.000đ</div>
            <div className="size-selection">
              {["XS", "S", "M", "L", "XL"].map((size) => (
                <Button
                  key={size}
                  type={selectedSize === size ? "primary" : "default"}
                  onClick={() => handleSizeChange(size)}
                >
                  {size}
                </Button>
              ))}
            </div>
            <div className="buttons">
              <Button className="add-to-cart">Thêm Vào Giỏ</Button>
              <Button className="buy-now">Mua Ngay</Button>
            </div>

            <div className="delivery-area">
              <div className="area-title">
                <p>Khu Vực Giao hàng</p>
                <div className="area-title-address">
                  Giao tại Hồ Chí Minh - Chọn lại
                </div>
              </div>

              <div className="area-selector">
                <div className="area-group">
                  <div className="store-list">
                    <div className="store-item">
                      <span className="store-address">
                        Quận 10: 561 Sư Vạn Hạnh, Phường 13
                      </span>
                      <span className="status">Còn hàng</span>
                    </div>
                    <div className="store-item">
                      <span className="store-address">
                        Quận 1: The New Playground 26 Lý Tự Trọng, Phường Bến
                        Nghé
                      </span>
                      <span className="status">Còn hàng</span>
                    </div>
                    <div className="store-item">
                      <span className="store-address">
                        Quận 1: 160 Nguyễn Cư Trinh, Phường Nguyễn Cư Trinh
                      </span>
                      <span className="status">Còn hàng</span>
                    </div>
                    <div className="store-item">
                      <span className="store-address">
                        Quận Gò Vấp: 326 Quang Trung, Phường 10
                      </span>
                      <span className="status">Còn hàng</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="product-details">
              <h3>Chi tiết sản phẩm:</h3>
              <ul>
                <li>Kích thước: XS - S - M - L - XL</li>
                <li>Chất liệu: Cotton</li>
                <li>Regular fit</li>
                <li>Artwork được in dạng kỹ thuật in game</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Carousel
        numberOfSlides={6}
        numberOfItems={12}
        img="https://dosi-in.com/images/detailed/42/CDL10_1.jpg"
      />
    </>
  );
};

export default DetailPage;
