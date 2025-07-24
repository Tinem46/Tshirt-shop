import { useEffect, useRef, useState } from "react";
import { Button, Spin, Badge, InputNumber } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  ShoppingCartOutlined,
  ThunderboltOutlined,
  EnvironmentOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import ImageModal from "../../components/imageModal";
import Carousel from "../../components/carousel";
import "./detailPage.scss";
import api from "../../config/api";
import { useNavigate, useParams } from "react-router-dom";
import ProductReviews from "../../components/review/index";
import "../../components/review/index.scss";

import { getReviewByProductId } from "../../utils/reviewService";

import { toast } from "react-toastify";

// ENUMS mapping
const SIZE_ENUMS = ["XS", "S", "M", "L", "XL", "XXL"];
const COLOR_ENUMS = [
  "Black",
  "White",
  "Gray",
  "Red",
  "Blue",
  "Navy",
  "Green",
  "Yellow",
  "Orange",
  "Purple",
  "Pink",
  "Brown",
  "Beige",
];

const COLOR_NAME_MAP = {
  Black: "Đen",
  White: "Trắng",
  Gray: "Xám",
  Red: "Đỏ",
  Blue: "Xanh dương",
  Navy: "Xanh navy",
  Green: "Xanh lá",
  Yellow: "Vàng",
  Orange: "Cam",
  Purple: "Tím",
  Pink: "Hồng",
  Brown: "Nâu",
  Beige: "Beige",
};

const MATERIAL_NAME_MAP = {
  Cotton100: "Cotton 100%",
  CottonPolyester: "Cotton Polyester",
  Polyester: "Polyester",
  OrganicCotton: "Cotton Organic",
  Modal: "Modal",
  Bamboo: "Bamboo",
  CottonSpandex: "Cotton Spandex",
  Jersey: "Jersey",
  Canvas: "Canvas",
};
const SEASON_NAME_MAP = {
  Spring: "Xuân",
  Summer: "Hè",
  Autumn: "Thu",
  Winter: "Đông",
  AllSeason: "Tất cả mùa",
};
const COLOR_CSS_MAP = {
  Black: "black",
  White: "white",
  Gray: "gray",
  Red: "red",
  Blue: "blue",
  Navy: "#001f3f",
  Green: "green",
  Yellow: "yellow",
  Orange: "orange",
  Purple: "purple",
  Pink: "pink",
  Brown: "brown",
  Beige: "#f5f5dc",
};
const SIZE_ORDER = SIZE_ENUMS; // Giữ nguyên thứ tự BE

// Helpers
const getSizeName = (size) =>
  typeof size === "number" ? SIZE_ENUMS[size] : size;
const getColorKey = (color) =>
  typeof color === "number" ? COLOR_ENUMS[color] : color;
const getColorName = (color) =>
  COLOR_NAME_MAP[getColorKey(color)] || getColorKey(color);
const getColorCss = (color) => COLOR_CSS_MAP[getColorKey(color)] || "#eee";
const getMaterialName = (material) =>
  typeof material === "number"
    ? MATERIAL_NAME_MAP[Object.keys(MATERIAL_NAME_MAP)[material]] || material
    : MATERIAL_NAME_MAP[material] || material;
const getSeasonName = (season) =>
  typeof season === "number"
    ? SEASON_NAME_MAP[Object.keys(SEASON_NAME_MAP)[season]] || season
    : SEASON_NAME_MAP[season] || season;

const DetailPage = () => {
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null); // always string!
  const [selectedColor, setSelectedColor] = useState(null); // always string!
  const [selectedThumb, setSelectedThumb] = useState(null); // {type, ...}
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const containerRef = useRef(null);
  const token = localStorage.getItem("token");
  const { id } = useParams();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => setBuyQuantity(1), [selectedSize, selectedColor]);

  // Fetch product & variants
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
        const res = await api.get(`Product/${id}`);
        const data = res.data?.data;
        const resVariant = await api.get(`ProductVariant/product/${id}`);
        const variantData = Array.isArray(resVariant.data?.data)
          ? resVariant.data.data
          : [];
        if (data) {
          setProduct({ ...data, images: safeJsonParse(data.images) });
          setVariants(variantData);
        } else setProduct(null);
      } catch {
        setProduct(null);
        setVariants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchReviewsForVariant = async (productId) => {
      setLoadingReviews(true);
      try {
        const res = await getReviewByProductId(productId);
        setReviews(res.data || []);
      } catch {
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };
    if (product?.id) {
      fetchReviewsForVariant(product.id);
    }
  }, [product?.id]);

  // --- FILTER/UNIQUE ---
  const uniqueColors = [...new Set(variants.map((v) => getColorKey(v.color)))];
  const uniqueSizes = [...new Set(variants.map((v) => getSizeName(v.size)))];
  const filteredColors = selectedSize
    ? [
        ...new Set(
          variants
            .filter((v) => getSizeName(v.size) === selectedSize)
            .map((v) => getColorKey(v.color))
        ),
      ]
    : uniqueColors;
  const filteredSizes = selectedColor
    ? [
        ...new Set(
          variants
            .filter((v) => getColorKey(v.color) === selectedColor)
            .map((v) => getSizeName(v.size))
        ),
      ]
    : uniqueSizes;
  // --- Unified Images Array, remove duplicate URL ---
  const productImages = (Array.isArray(product?.images) ? product.images : [])
    .filter((img) => !!img)
    .map((img, idx) => ({
      url: img,
      type: "product",
      index: idx,
    }));
  const variantImages = variants
    .filter((v) => v.imageUrl)
    .map((v) => ({
      url: v.imageUrl,
      type: "variant",
      color: getColorKey(v.color),
      size: getSizeName(v.size),
      variantId: v.id,
    }));
  // Remove duplicates by url, keep first occurrence
  const unifiedImages = [...productImages, ...variantImages].filter(
    (img, idx, arr) => arr.findIndex((x) => x.url === img.url) === idx
  );

  // Main image logic
  let mainImage = "/placeholder.svg";
  let thumb = selectedThumb;
  // default to first image
  if (!selectedThumb && unifiedImages.length > 0) thumb = unifiedImages[0];
  if (thumb) {
    mainImage = thumb.url;
  }
  // Modal images: show all
  const modalImages = unifiedImages.map((img) => img.url);
  const modalIndex = thumb
    ? unifiedImages.findIndex(
        (img) =>
          img.url === thumb.url &&
          (img.type !== "variant" ||
            (thumb.type === "variant" &&
              img.variantId === thumb.variantId &&
              img.color === thumb.color &&
              img.size === thumb.size))
      )
    : 0;

  // Chọn variant (dựa vào selectedSize + selectedColor)
  const selectedVariant =
    (thumb && thumb.type === "variant"
      ? variants.find(
          (v) =>
            v.id === thumb.variantId &&
            getColorKey(v.color) === thumb.color &&
            getSizeName(v.size) === thumb.size
        )
      : null) ||
    variants.find(
      (v) =>
        getSizeName(v.size) === selectedSize &&
        getColorKey(v.color) === selectedColor
    );

  // Click thumbnail
  const handleThumbnailClick = (img) => {
    setSelectedThumb(img);
    // Nếu là variant thì auto select màu/size (đã là string)
    if (img.type === "variant") {
      setSelectedColor(img.color);
      setSelectedSize(img.size);
    }
  };

  // Khi chọn màu/size, nếu variant có ảnh thì tự động chọn thumbnail đó
  useEffect(() => {
    if (!selectedColor || !selectedSize) return;
    const variant = variants.find(
      (v) =>
        getColorKey(v.color) === selectedColor &&
        getSizeName(v.size) === selectedSize
    );
    if (variant && variant.imageUrl) {
      setSelectedThumb({
        type: "variant",
        color: getColorKey(variant.color),
        size: getSizeName(variant.size),
        variantId: variant.id,
        url: variant.imageUrl,
      });
    }
    // Nếu chọn lại màu/size mà ko có ảnh variant thì giữ nguyên thumbnail
  }, [selectedColor, selectedSize, variants]);

  // --- Thao tác giỏ hàng & mua ngay ---
  const handleAddtoCart = async () => {
    // validate đã chọn size/màu
    if (
      filteredSizes.length > 0 &&
      (!selectedSize || !filteredSizes.includes(selectedSize))
    ) {
      toast.error("Vui lòng chọn kích thước!");
      return;
    }
    if (
      filteredColors.length > 0 &&
      (!selectedColor || !filteredColors.includes(selectedColor))
    ) {
      toast.error("Vui lòng chọn màu sắc!");
      return;
    }
    if (!token) {
      toast.error("Vui lòng đăng nhập trước khi thêm vào giỏ hàng.");
      return;
    }
    if (!product?.id) {
      toast.error("Không xác định được sản phẩm để lấy giá");
      return;
    }
    if (!selectedVariant || selectedVariant.quantity === 0) {
      toast.error("Biến thể này đã hết hàng!");
      return;
    }
    if (buyQuantity > selectedVariant.quantity) {
      toast.error(
        `Bạn chỉ có thể mua tối đa ${selectedVariant.quantity} sản phẩm này.`
      );
      setBuyQuantity(selectedVariant.quantity);
      return;
    }

    const cartItemPayload = [
      {
        productVariantId: selectedVariant.id,
        customDesignId: null,
        quantity: buyQuantity,
      },
    ];
    setLoading(true);
    try {
      await api.post("Cart", cartItemPayload);
      toast.success("Thêm vào giỏ hàng thành công!");
      navigate("/cart");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };
  const handleBuyNow = () => {
    if (
      filteredSizes.length > 0 &&
      (!selectedSize || !filteredSizes.includes(selectedSize))
    ) {
      toast.error("Vui lòng chọn kích thước!");
      return;
    }
    if (
      filteredColors.length > 0 &&
      (!selectedColor || !filteredColors.includes(selectedColor))
    ) {
      toast.error("Vui lòng chọn màu sắc!");
      return;
    }
    if (!token) {
      toast.error("Vui lòng đăng nhập trước khi mua hàng.");
      return;
    }
    if (!product?.id) {
      toast.error("Không xác định được sản phẩm để mua");
      return;
    }
    if (!selectedVariant || selectedVariant.quantity === 0) {
      toast.error("Biến thể này đã hết hàng!");
      return;
    }
    if (buyQuantity > selectedVariant.quantity) {
      toast.error(
        `Bạn chỉ có thể mua tối đa ${selectedVariant.quantity} sản phẩm này.`
      );
      setBuyQuantity(selectedVariant.quantity);
      return;
    }
    const checkoutItem = {
      productVariantId: selectedVariant.id,
      name: product.name,
      image: mainImage,
      size: selectedSize,
      color: selectedColor,
      quantity: buyQuantity,
      unitPrice: product.price,
    };
    navigate("/checkout", {
      state: { cart: [checkoutItem], cartItemId: null },
    });
  };

  // --- UI render ---
  if (loading)
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  if (!product)
    return <div className="error-message">Không tìm thấy sản phẩm.</div>;

  return (
    <>
      <div className="detail-container">
        <div className="product-display">
          <div className="product-image">
            <div className="main-image-wrapper">
              <div className="main-image" onClick={() => setIsModalOpen(true)}>
                <img
                  src={mainImage}
                  alt="product"
                  style={{
                    objectFit: "cover",
                    width: "100%",
                    height: "auto",
                  }}
                />
              </div>
            </div>
            <div className="thumbnail-section">
              <Button
                className="nav-button left"
                icon={<LeftOutlined />}
                onClick={() =>
                  containerRef.current?.scrollBy({
                    left: -100,
                    behavior: "smooth",
                  })
                }
              />
              <div ref={containerRef} className="thumbnail-container">
                {unifiedImages.map((img) => {
                  const isActive =
                    thumb &&
                    img.url === thumb.url &&
                    (img.type !== "variant" ||
                      (thumb.type === "variant" &&
                        img.variantId === thumb.variantId &&
                        img.color === thumb.color &&
                        img.size === thumb.size));
                  return (
                    <div
                      key={img.type + "-" + (img.index ?? img.variantId)}
                      className={`thumbnail ${isActive ? "active" : ""}`}
                      onClick={() => handleThumbnailClick(img)}
                      style={{ position: "relative" }}
                    >
                      <img src={img.url || "/placeholder.svg"} alt="thumb" />
                      {img.type === "variant" && (
                        <div
                          style={{
                            position: "absolute",
                            right: 2,
                            bottom: 2,
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            background: getColorCss(img.color),
                            border: "2px solid #fff",
                            outline: "1.5px solid #888",
                          }}
                          title={getColorName(img.color)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <Button
                className="nav-button right"
                icon={<RightOutlined />}
                onClick={() =>
                  containerRef.current?.scrollBy({
                    left: 100,
                    behavior: "smooth",
                  })
                }
              />
            </div>
            <ImageModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              images={modalImages}
              selectedIndex={modalIndex >= 0 ? modalIndex : 0}
              onChangeImage={(dir) => {
                let next;
                if (dir === "left")
                  next =
                    modalIndex > 0 ? modalIndex - 1 : modalImages.length - 1;
                else next = (modalIndex + 1) % modalImages.length;
                setSelectedThumb(unifiedImages[next]);
              }}
            />
          </div>
          {/* --- Thông tin, chọn size/color/quantity... --- */}
          <div className="product-info">
            <div className="product-header">
              <h1>{product.name}</h1>
              <div className="price">
                {(product.price || 0).toLocaleString()}đ
              </div>
            </div>
            {/* Chọn Size */}
            {filteredSizes.length > 0 && (
              <div className="size-selection">
                <h3>Chọn kích thước:</h3>
                <div className="size-options">
                  {filteredSizes
                    .sort(
                      (a, b) => SIZE_ENUMS.indexOf(a) - SIZE_ENUMS.indexOf(b)
                    )
                    .map((size, idx) => {
                      const qty = selectedColor
                        ? variants.find(
                            (v) =>
                              getSizeName(v.size) === size &&
                              getColorKey(v.color) === selectedColor
                          )?.quantity ?? 0
                        : variants
                            .filter((v) => getSizeName(v.size) === size)
                            .reduce(
                              (sum, v) =>
                                sum +
                                (v.quantity !== undefined ? v.quantity : 0),
                              0
                            );

                      return (
                        <Button
                          key={size + idx}
                          type={selectedSize === size ? "primary" : "default"}
                          className={`size-button ${
                            selectedSize === size ? "selected" : ""
                          }`}
                          onClick={() => setSelectedSize(size)}
                          disabled={qty === 0}
                        >
                          {size}{" "}
                          <span
                            style={{
                              color: qty === 0 ? "#ccc" : "#888",
                              fontSize: "12px",
                            }}
                          >
                            ({qty})
                          </span>
                          {selectedSize === size && (
                            <div className="check-indicator">
                              <CheckOutlined />
                            </div>
                          )}
                        </Button>
                      );
                    })}
                </div>
              </div>
            )}
            {/* Chọn Màu */}
            {filteredColors.length > 0 && (
              <div className="color-selection">
                <h3>Chọn màu sắc:</h3>
                <div className="color-options">
                  {filteredColors.map((color, idx) => {
                    const qty = selectedSize
                      ? variants.find(
                          (v) =>
                            getColorKey(v.color) === color &&
                            getSizeName(v.size) === selectedSize
                        )?.quantity ?? 0
                      : variants
                          .filter((v) => getColorKey(v.color) === color)
                          .reduce(
                            (sum, v) =>
                              sum + (v.quantity !== undefined ? v.quantity : 0),
                            0
                          );

                    const colorName = getColorName(color);
                    return (
                      <div
                        key={color + idx}
                        className={`color-circle ${
                          selectedColor === color ? "active" : ""
                        }`}
                        style={{
                          backgroundColor: getColorCss(color),
                          opacity: qty === 0 ? 0.3 : 1,
                          position: "relative",
                          cursor: qty === 0 ? "not-allowed" : "pointer",
                        }}
                        title={colorName + " (" + qty + ")"}
                        onClick={() => qty > 0 && setSelectedColor(color)}
                      >
                        {selectedColor === color && (
                          <CheckOutlined className="color-check" />
                        )}
                        <span
                          style={{
                            position: "absolute",
                            bottom: 2,
                            right: 4,
                            fontSize: 10,
                            color: "#fff",
                            background: "rgba(0,0,0,0.3)",
                            borderRadius: 8,
                            padding: "1px 4px",
                          }}
                        >
                          {qty}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Chọn số lượng */}
            {selectedVariant && (
              <div className="quantity-selection" style={{ margin: "16px 0" }}>
                <span style={{ fontWeight: 500 }}>Số lượng:</span>
                <InputNumber
                  min={1}
                  max={selectedVariant?.quantity || 1}
                  value={buyQuantity}
                  onChange={(value) => {
                    if (value > (selectedVariant?.quantity || 1)) {
                      setBuyQuantity(selectedVariant?.quantity || 1);
                      toast.warning(
                        `Chỉ còn ${
                          selectedVariant?.quantity || 1
                        } sản phẩm trong kho!`
                      );
                    } else if (value < 1) {
                      setBuyQuantity(1);
                    } else {
                      setBuyQuantity(value);
                    }
                  }}
                  disabled={selectedVariant.quantity === 0}
                  style={{ marginLeft: 12, width: 70 }}
                />
                <span style={{ marginLeft: 12, color: "#888", fontSize: 13 }}>
                  (Còn lại: {selectedVariant.quantity})
                </span>
              </div>
            )}
            {/* Quantity của variant đã chọn */}
            {selectedSize &&
              selectedColor &&
              selectedVariant &&
              typeof selectedVariant.quantity === "number" && (
                <div
                  style={{
                    margin: "8px 0 0 0",
                    fontSize: "15px",
                    color: selectedVariant.quantity === 0 ? "#d00" : "#222",
                  }}
                  className="variant-quantity"
                >
                  Số lượng còn lại:&nbsp;<b>{selectedVariant.quantity}</b>
                </div>
              )}
            <div className="action-buttons">
              <Button
                className="buy-now-btn"
                icon={<ThunderboltOutlined />}
                onClick={handleBuyNow}
                loading={loading}
                disabled={selectedVariant && selectedVariant.quantity === 0}
              >
                Mua Ngay
              </Button>
              <Button
                className="add-to-cart-btn"
                icon={<ShoppingCartOutlined />}
                onClick={handleAddtoCart}
                loading={loading}
                disabled={selectedVariant && selectedVariant.quantity === 0}
              >
                Thêm Vào Giỏ
              </Button>
            </div>
            <div className="delivery-area">
              <div className="area-header">
                <div className="area-title">
                  <EnvironmentOutlined />
                  <span>Khu Vực Giao Hàng</span>
                </div>
                <div className="area-subtitle">
                  Giao tại Hồ Chí Minh - Chọn lại
                </div>
              </div>
              <div className="store-list">
                <div className="store-item">
                  <span className="store-address">
                    Quận 10: 561 Sư Vạn Hạnh, Phường 13
                  </span>
                  <Badge status="warning" text="Còn hàng" />
                </div>
                <div className="store-item">
                  <span className="store-address">
                    Quận 1: The New Playground 26 Lý Tự Trọng
                  </span>
                  <Badge status="warning" text="Còn hàng" />
                </div>
              </div>
            </div>
            <div className="product-details">
              <h3>Chi tiết sản phẩm</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="label">Chất liệu:</span>
                  <span className="value">
                    {getMaterialName(product.material)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Kích thước:</span>
                  <span className="value">
                    {[...uniqueSizes]
                      .filter(Boolean)
                      .sort(
                        (a, b) => SIZE_ENUMS.indexOf(a) - SIZE_ENUMS.indexOf(b)
                      )
                      .join(" - ")}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Màu sắc:</span>
                  <span className="value">
                    {uniqueColors.filter(Boolean).map(getColorName).join(" - ")}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Mùa:</span>
                  <span className="value">
                    {getSeasonName(product.season) || "Tất cả mùa"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">SKU:</span>
                  <span className="value">{product.sku}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="product-review-section">
          <ProductReviews
            productId={id}
            reviews={reviews}
            loading={loadingReviews}
          />
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
