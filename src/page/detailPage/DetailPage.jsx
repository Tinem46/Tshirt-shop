import React, { useEffect, useRef, useState } from "react";
import { Button, Spin } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import ImageModal from "../../components/imageModal";
import Carousel from "../../components/carousel";
import "./detailPage.scss";
import api from "../../config/api";
import { useNavigate, useParams } from "react-router-dom";

// Enum mapping
const COLOR_ENUM_MAP = { 0: "Black", 1: "Red", 2: "Blue", 3: "Green" };
const SIZE_ENUM_MAP = { 1: "S", 2: "M", 3: "L", 4: "XL", 5: "XXL" };

function getColorName(color) {
  if (typeof color === "string") return color;
  if (COLOR_ENUM_MAP[color] !== undefined) return COLOR_ENUM_MAP[color];
  return color?.toString() || "";
}
function getSizeName(size) {
  if (typeof size === "string") return size;
  if (SIZE_ENUM_MAP[size] !== undefined) return SIZE_ENUM_MAP[size];
  return size?.toString() || "";
}

const DetailPage = () => {
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const token = localStorage.getItem("token");
  const { id } = useParams();
  const navigate = useNavigate();

  // Lấy thông tin sản phẩm & biến thể
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
      setLoading(true);
      try {
        // 1. Lấy sản phẩm
        const res = await api.get(`Product/${id}`);
        const data = res.data?.data;
        // 2. Lấy biến thể sản phẩm
        const resVariant = await api.get(`ProductVariant/product/${id}`);
        const variantData = Array.isArray(resVariant.data?.data)
          ? resVariant.data.data
          : [];

        if (data) {
          setProduct({
            ...data,
            images: safeJsonParse(data.images),
          });
          setVariants(variantData);
        } else {
          setProduct(null);
        }
      } catch (err) {
        setProduct(null);
        setVariants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const uniqueColors = [...new Set(variants.map((v) => v.color))];
  const uniqueSizes = [...new Set(variants.map((v) => v.size))];

  const filteredColors = selectedSize
    ? [
        ...new Set(
          variants.filter((v) => v.size === selectedSize).map((v) => v.color)
        ),
      ]
    : uniqueColors;

  const filteredSizes = selectedColor
    ? [
        ...new Set(
          variants.filter((v) => v.color === selectedColor).map((v) => v.size)
        ),
      ]
    : uniqueSizes;

  // Chọn index ảnh
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

  // Handle thêm vào giỏ hàng
  const handleAddtoCart = async () => {
    if (filteredSizes.length > 0 && !selectedSize) {
      alert("Vui lòng chọn kích thước!");
      return;
    }
    if (
      filteredColors.length > 0 &&
      (selectedColor === null || selectedColor === undefined)
    ) {
      alert("Vui lòng chọn màu sắc!");
      return;
    }
    if (!token) {
      alert("Vui lòng đăng nhập trước khi thêm vào giỏ hàng.");
      return;
    }
    if (!product?.id) {
      alert("Không xác định được sản phẩm để lấy giá");
      return;
    }
    // Tìm đúng variantId theo lựa chọn
    let productVariantId = null;
    if (variants.length > 0) {
      const matched = variants.find(
        (v) => v.size === selectedSize && v.color === selectedColor
      );
      if (matched) productVariantId = matched.id;
      else {
        alert("Không tìm thấy biến thể phù hợp!");
        return;
      }
    }
    const cartItemPayload = [
      {
        // productId: product.id,
        productVariantId: productVariantId || null,
        customDesignId: null,
        quantity: 1,
      },
    ];
    console.log("Thêm vào giỏ hàng:", cartItemPayload);
    setLoading(true);
    try {
      const res = await api.post("Cart", cartItemPayload);
      console.log("Thêm vào giỏ hàng:", res);
      alert("Thêm vào giỏ hàng thành công!");
      navigate("/cart");
    } catch (error) {
      alert(
        error?.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  //--- Buy now
  const handleBuyNow = () => {
    if (filteredSizes.length > 0 && !selectedSize) {
      alert("Vui lòng chọn kích thước!");
      return;
    }
    if (
      filteredColors.length > 0 &&
      (selectedColor === null || selectedColor === undefined)
    ) {
      alert("Vui lòng chọn màu sắc!");
      return;
    }
    if (!token) {
      alert("Vui lòng đăng nhập trước khi mua hàng.");
      return;
    }
    if (!product?.id) {
      alert("Không xác định được sản phẩm để mua");
      return;
    }
    // Tìm đúng variant
    let productVariantId = null;
    if (variants.length > 0) {
      const matched = variants.find(
        (v) => v.size === selectedSize && v.color === selectedColor
      );
      if (matched) productVariantId = matched.id;
      else {
        alert("Không tìm thấy biến thể phù hợp!");
        return;
      }
    }

    // Tạo object item theo đúng format Checkout page cần
    const checkoutItem = {
      id: product.id, // product id
      productVariantId: productVariantId,
      name: product.name,
      image: product.images?.[selectedIndex] || "", // ảnh
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
      unitPrice: product.price, // hoặc matched.price nếu mỗi variant có giá khác nhau
    };

    // Sang checkout, truyền item qua route state
    navigate("/checkout", {
      state: { cart: [checkoutItem], cartId: null }, // cartId null vì không qua giỏ hàng
    });
  };

  // --- UI ---
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

  return (
    <>
      <div className="detail-container">
        <div className="product-display">
          <div className="product-image">
            <div className="main-image" onClick={() => setIsModalOpen(true)}>
              <img
                src={
                  product.images?.[selectedIndex] ||
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
                {Array.isArray(product.images) &&
                  product.images.map((img, index) => (
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
            <div className="price">
              {(product.price || 0).toLocaleString()}đ
            </div>

            {/* Chọn Size */}
            {filteredSizes.length > 0 && (
              <div className="size-selection">
                <p>Chọn size:</p>
                <div className="size-options">
                  {filteredSizes.map((size, idx) => (
                    <Button
                      key={size + idx}
                      type={selectedSize === size ? "primary" : "default"}
                      onClick={() => setSelectedSize(size)}
                    >
                      {getSizeName(size)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Chọn Màu */}
            {filteredColors.length > 0 && (
              <div className="color-selection">
                <p>Chọn màu:</p>
                <div className="color-options">
                  {filteredColors.map((color, idx) => {
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
              <Button className="buy-now" onClick={handleBuyNow}>
                Mua Ngay
              </Button>
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
                <li>Kích thước: {uniqueSizes.map(getSizeName).join(" - ")}</li>
                <li>Màu: {uniqueColors.map(getColorName).join(" - ")}</li>
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
