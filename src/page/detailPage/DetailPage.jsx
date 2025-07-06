import React, { useEffect, useRef, useState } from "react";
import { Button, Spin } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import ImageModal from "../../components/imageModal";
import Carousel from "../../components/carousel";
import "./detailPage.scss";
import api from "../../config/api";
import { useNavigate } from "react-router-dom";

// Enum mapping: số → tên tiếng Anh cho label
const COLOR_ENUM_MAP = {
  1: "Red",
  2: "Blue",
  3: "Green",
  // Thêm các màu khác nếu có
};
const SIZE_ENUM_MAP = {
  1: "S",
  2: "M",
  3: "L",
  4: "XL",
  // Thêm size khác nếu có
};

// Helper
function getColorName(color) {
  if (typeof color === "string") return color;
  if (COLOR_ENUM_MAP[color]) return COLOR_ENUM_MAP[color];
  return color?.toString() || "";
}
function getSizeName(size) {
  if (typeof size === "string") return size;
  if (SIZE_ENUM_MAP[size]) return SIZE_ENUM_MAP[size];
  return size?.toString() || "";
}

const DetailPage = () => {
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch sản phẩm
  useEffect(() => {
    const safeJsonParse = (value, fallback = []) => {
      try {
        return typeof value === "string"
          ? JSON.parse(value)
          : value || fallback;
      } catch {
        return fallback;
      }
    };
    const fetchProduct = async () => {
      try {
        const res = await api.get("Product");
        const data = res.data?.data?.data;
        if (Array.isArray(data) && data.length > 0) {
          const item = data[0];
          item.images = safeJsonParse(item.images);
          item.availableSizes = safeJsonParse(item.availableSizes);
          item.availableColors = safeJsonParse(item.availableColors);
          item.productVariants = safeJsonParse(item.productVariants);
          setProduct(item);
        }
      } catch (err) {
        console.error("Lỗi khi fetch sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, []);

  const handleSizeChange = (size) => setSelectedSize(size);

  const scrollThumbnails = (direction) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: direction === "left" ? -100 : 100,
        behavior: "smooth",
      });
    }
  };

  const handleChangeImage = (direction) => {
    if (!product) return;
    const max = product.images.length;
    setSelectedIndex((prev) =>
      direction === "left" ? (prev > 0 ? prev - 1 : max - 1) : (prev + 1) % max
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }
  if (!product) {
    return <div style={{ padding: 20 }}>Không tìm thấy sản phẩm.</div>;
  }

  const handleAddtoCart = async () => {
    // Nếu có size/màu phải chọn đủ
    if (product.availableSizes?.length > 0 && !selectedSize) {
      alert("Vui lòng chọn kích thước!");
      return;
    }
    if (product.availableColors?.length > 0 && !selectedColor) {
      alert("Vui lòng chọn màu sắc!");
      return;
    }

    if (!token) {
      alert("Vui lòng đăng nhập trước khi thêm vào giỏ hàng.");
      return;
    }

    // Nếu không có biến thể thì gửi null, có thì tìm đúng variant
    let productVariantId = null;
    if (
      product.productVariants &&
      Array.isArray(product.productVariants) &&
      product.productVariants.length > 0
    ) {
      const matched = product.productVariants.find(
        (v) =>
          getColorName(v.color).toLowerCase() ===
            getColorName(selectedColor).toLowerCase() &&
          getSizeName(v.size).toLowerCase() ===
            getSizeName(selectedSize).toLowerCase()
      );
      if (matched) productVariantId = matched.id;
    }

    const cartItemPayload = {
      productId: product.id,
      customDesignId: product.customDesignId || null,
      productVariantId: productVariantId, // null nếu không có variant
      selectedColor: selectedColor ?? null,
      selectedSize: selectedSize ?? null,
      quantity: 1,
    };

    setLoading(true);
    try {
      await api.post("Cart", cartItemPayload);
      alert("Thêm vào giỏ hàng thành công!");
      navigate("/cart", { state: { addedProductName: product.name } });
    } catch (error) {
      console.error("❌ Lỗi khi thêm vào giỏ hàng:", error);
      alert(
        error?.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="detail-container">
        <div className="product-display">
          <div className="product-image">
            <div className="main-image" onClick={() => setIsModalOpen(true)}>
              <img
                src={
                  product.images[selectedIndex] ||
                  "https://dosi-in.com/images/detailed/42/CDL10_1.jpg"
                }
                alt="product"
              />
            </div>
            <div className="thumbnail-section">
              <Button
                className="nav-button left"
                icon={<LeftOutlined />}
                onClick={() => scrollThumbnails("left")}
              />
              <div ref={containerRef} className="thumbnail-container">
                {product.images.map((img, index) => (
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
                images={product.images}
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
            <h1>{product.name}</h1>
            <div className="price">{product.price.toLocaleString()}đ</div>

            {product.availableSizes?.length > 0 && (
              <div className="size-selection">
                {product.availableSizes.map((size, idx) => (
                  <Button
                    key={size + idx}
                    type={selectedSize === size ? "primary" : "default"}
                    onClick={() => handleSizeChange(size)}
                  >
                    {getSizeName(size)}
                  </Button>
                ))}
              </div>
            )}

            {product.availableColors?.length > 0 && (
              <div className="color-selection">
                <p>Chọn màu:</p>
                <div className="color-options">
                  {product.availableColors.map((color, idx) => {
                    const colorName = getColorName(color);
                    return (
                      <div
                        key={color + idx}
                        className={`color-circle ${
                          selectedColor === color ? "active" : ""
                        }`}
                        style={{ backgroundColor: colorName.toLowerCase() }}
                        title={colorName}
                        onClick={() => setSelectedColor(color)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            <div className="buttons">
              <Button className="add-to-cart" onClick={handleAddtoCart}>
                Thêm Vào Giỏ
              </Button>
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
                        Quận 1: The New Playground 26 Lý Tự Trọng
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
                <li>Chất liệu: {product.material}</li>
                <li>
                  Kích thước:{" "}
                  {product.availableSizes?.map(getSizeName).join(" - ")}
                </li>
                <li>
                  Màu: {product.availableColors?.map(getColorName).join(" - ")}
                </li>
                <li>Season: {product.season}</li>
                <li>SKU: {product.sku}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Carousel
        numberOfSlides={6}
        numberOfItems={12}
        img={product.images?.[0]}
      />
    </>
  );
};

export default DetailPage;
