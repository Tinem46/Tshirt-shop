
import { useEffect, useRef, useState } from "react"
import { Button, Spin, Badge, Tag } from "antd"
import {
  LeftOutlined,
  RightOutlined,
  ShoppingCartOutlined,
  ThunderboltOutlined,
  EnvironmentOutlined,
  CheckOutlined,
} from "@ant-design/icons"
import ImageModal from "../../components/imageModal"
import Carousel from "../../components/carousel"
import "./detailPage.scss"
import api from "../../config/api"
import { useNavigate, useParams } from "react-router-dom"
import ProductReviews from "../../components/review/index"
import "../../components/review/index.scss"
import { getReviewByProductId } from "../../utils/reviewService"
import { toast } from "react-toastify"
// Enum mappings (keeping original)
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
}

const SIZE_NAME_MAP = {
  XS: "XS",
  S: "S",
  M: "M",
  L: "L",
  XL: "XL",
  XXL: "XXL",
  XXXL: "XXXL",
}

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
}

const SEASON_NAME_MAP = {
  Spring: "Xuân",
  Summer: "Hè",
  Autumn: "Thu",
  Winter: "Đông",
  AllSeason: "Tất cả mùa",
}

const COLOR_CSS_MAP = {
  Black: "#000000ff",
  White: "#e0e5eaff",
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
}

function getSizeName(size) {
  const key = typeof size === "number" ? Object.keys(SIZE_NAME_MAP)[size] : size
  return SIZE_NAME_MAP[key] || size
}


function getColorName(color) {
  const key = typeof color === "number" ? Object.keys(COLOR_NAME_MAP)[color] : color
  return COLOR_NAME_MAP[key] || key || "Không rõ"
}

function getColorCssValue(color) {
  const key = typeof color === "number" ? Object.keys(COLOR_NAME_MAP)[color] : color
  return COLOR_CSS_MAP[key]
}


function getMaterialName(material) {
  const key = typeof material === "number" ? Object.keys(MATERIAL_NAME_MAP)[material] : material
  return MATERIAL_NAME_MAP[key] || material
}

function getSeasonName(season) {
  const key = typeof season === "number" ? Object.keys(SEASON_NAME_MAP)[season] : season
  return SEASON_NAME_MAP[key] || season
}

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]

const DetailPage = () => {
  const [product, setProduct] = useState(null)
  const [variants, setVariants] = useState([])
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const containerRef = useRef(null)
  const token = localStorage.getItem("token")
  const { id } = useParams()
  const navigate = useNavigate()
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [displayImages, setDisplayImages] = useState([]);


  // Lấy thông tin sản phẩm & biến thể
  useEffect(() => {
    const safeJsonParse = (value, fallback = []) => {
      try {
        return typeof value === "string" ? JSON.parse(value) : value || fallback
      } catch {
        return fallback
      }
    }

    const fetchProduct = async () => {
      setLoading(true)
      try {
        // 1. Lấy sản phẩm
        const res = await api.get(`Product/${id}`)
        const data = res.data?.data

        // 2. Lấy biến thể sản phẩm
        const resVariant = await api.get(`ProductVariant/product/${id}`)
        const variantData = Array.isArray(resVariant.data?.data) ? resVariant.data.data : []

        if (data) {
          const firstColorInVariants = variantData[0]?.color;
          const imagesForFirstColor = variantData
            .filter(v => v.color === firstColorInVariants)
            .map(v => v.imageUrl)
            .filter(Boolean);

          // Gọi setProduct chỉ 1 lần
          setProduct({
            ...data,
            images: imagesForFirstColor.length > 0 ? imagesForFirstColor : safeJsonParse(data.images),
          });
          setDisplayImages(imagesForFirstColor.length > 0 ? imagesForFirstColor : safeJsonParse(data.images));

          setVariants(variantData);
          setSelectedColor(firstColorInVariants);

          fetchReviewsForVariant(data.id);
        } else {
          setProduct(null)
        }

      } catch (err) {
        setProduct(null)
        setVariants([])
      } finally {
        setLoading(false)
      }
    }


    fetchProduct()
  }, [id])

  const updateImageFromColor = (colorValue) => {
    setSelectedIndex(0); // Reset ảnh về đầu tiên

    const images = variants
      .filter(v => v.color === colorValue)
      .map(v => v.imageUrl)
      .filter(Boolean);

    if (images.length > 0) {
      setDisplayImages(images);
    } else {
      // Nếu không có ảnh theo màu, fallback sang ảnh gốc (nếu muốn)
      setDisplayImages(product.images || []);
    }
  };



  useEffect(() => {
    if (product && variants.length > 0) {
      const firstColorInVariants = variants[0].color;
      setSelectedColor(firstColorInVariants)
      updateImageFromColor(firstColorInVariants)
    }
  }, [product, variants])

  const fetchReviewsForVariant = async (productId) => {
    setLoadingReviews(true);
    try {
      const res = await getReviewByProductId(productId);

      const reviewList = Array.isArray(res.data?.data) ? res.data.data : []
      console.log("📦 Review trả về:", reviewList)
      setReviews(reviewList)

    } catch (err) {
      console.error("Lỗi khi lấy đánh giá:", err);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }


  const uniqueColors = [...new Set(variants.map((v) => v.color))]
  const uniqueSizes = [...new Set(variants.map((v) => v.size))]

  const filteredColors = selectedSize
    ? [...new Set(variants.filter((v) => v.size === selectedSize).map((v) => v.color))]
    : uniqueColors

  const filteredSizes = selectedColor
    ? [...new Set(variants.filter((v) => v.color === selectedColor).map((v) => v.size))]
    : uniqueSizes

  // Chọn index ảnh
  const scrollThumbnails = (direction) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: direction === "left" ? -100 : 100,
        behavior: "smooth",
      })
    }
  }

  const handleChangeImage = (direction) => {
    if (!displayImages || displayImages.length === 0) return;
    const max = displayImages.length;
    setSelectedIndex((prev) =>
      direction === "left"
        ? (prev > 0 ? prev - 1 : max - 1)
        : (prev + 1) % max
    );
  };

  // Handle thêm vào giỏ hàng
  const handleAddtoCart = async () => {
    if (filteredSizes.length > 0 && !selectedSize) {
      alert("Vui lòng chọn kích thước!")
      return
    }
    if (filteredColors.length > 0 && (selectedColor === null || selectedColor === undefined)) {
      alert("Vui lòng chọn màu sắc!")
      return
    }
    if (!token) {
      alert("Vui lòng đăng nhập trước khi thêm vào giỏ hàng.")
      return
    }
    if (!product?.id) {
      alert("Không xác định được sản phẩm để lấy giá")
      return
    }

    // Tìm đúng variantId theo lựa chọn
    let productVariantId = null
    if (variants.length > 0) {
      const matched = variants.find((v) => v.size === selectedSize && v.color === selectedColor)
      if (matched) productVariantId = matched.id
      else {
        alert("Không tìm thấy biến thể phù hợp!")
        return
      }
    }

    const cartItemPayload = [
      {
        productVariantId: productVariantId || null,
        customDesignId: null,
        quantity: 1,
      },
    ]

    console.log("Thêm vào giỏ hàng:", cartItemPayload)
    setLoading(true)
    try {

      const res = await api.post("Cart", cartItemPayload);
      console.log("Thêm vào giỏ hàng:", res);
      toast.success("Thêm vào giỏ hàng thành công!");
      navigate("/cart");

    } catch (error) {
      alert(error?.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  //--- Buy now
  const handleBuyNow = () => {
    if (filteredSizes.length > 0 && !selectedSize) {
      alert("Vui lòng chọn kích thước!")
      return
    }
    if (filteredColors.length > 0 && (selectedColor === null || selectedColor === undefined)) {
      alert("Vui lòng chọn màu sắc!")
      return
    }
    if (!token) {
      alert("Vui lòng đăng nhập trước khi mua hàng.")
      return
    }
    if (!product?.id) {
      alert("Không xác định được sản phẩm để mua")
      return
    }

    // Tìm đúng variant
    let productVariantId = null
    if (variants.length > 0) {
      const matched = variants.find((v) => v.size === selectedSize && v.color === selectedColor)
      if (matched) productVariantId = matched.id
      else {
        alert("Không tìm thấy biến thể phù hợp!")
        return
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
    }

    // Sang checkout, truyền item qua route state
    navigate("/checkout", {
      state: { cart: [checkoutItem], cartId: null }, // cartId null vì không qua giỏ hàng
    })
  }

  // --- UI ---
  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    )
  }


  const getSelectedVariant = () => {
    return variants.find(v => v.size === selectedSize && v.color === selectedColor);
  }


  if (!product) {
    return <div className="error-message">Không tìm thấy sản phẩm.</div>
  }



  return (
    <>
      <div className="detail-container">
        <div className="product-display">
          <div className="product-image">
            <div className="main-image-wrapper">
              <div className="main-image" onClick={() => setIsModalOpen(true)}>
                <img src={displayImages[selectedIndex]} alt="product" />


                {/* Image Navigation Arrows */}
                <Button
                  className="nav-arrow nav-arrow-left"
                  icon={<LeftOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleChangeImage("left")
                  }}
                />
                <Button
                  className="nav-arrow nav-arrow-right"
                  icon={<RightOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleChangeImage("right")
                  }}
                />
              </div>
            </div>

            <div className="thumbnail-section">
              <Button className="nav-button left" icon={<LeftOutlined />} onClick={() => scrollThumbnails("left")} />
              <div ref={containerRef} className="thumbnail-container">
                {displayImages.map((img, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${selectedIndex === index ? "active" : ""}`}
                    onClick={() => setSelectedIndex(index)}
                  >
                    <img src={img || "/placeholder.svg"} alt={`thumbnail ${index + 1}`} />
                  </div>
                ))}
              </div>
              <Button className="nav-button right" icon={<RightOutlined />} onClick={() => scrollThumbnails("right")} />
            </div>

            <ImageModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              images={displayImages}
              selectedIndex={selectedIndex}
              onChangeImage={handleChangeImage}
            />
          </div>

          <div className="product-info">
            <div className="product-header">
              <h1>{product.name}</h1>
              <div className="price">{(product.price || 0).toLocaleString()}đ</div>
            </div>

            {/* Chọn Size */}
            {filteredSizes.length > 0 && (
              <div className="size-selection">
                <h3>Chọn kích thước:</h3>
                <div className="size-options">
                  {filteredSizes
                    .sort((a, b) => {
                      const aKey = typeof a === "number" ? Object.keys(SIZE_NAME_MAP)[a] : a
                      const bKey = typeof b === "number" ? Object.keys(SIZE_NAME_MAP)[b] : b
                      return SIZE_ORDER.indexOf(aKey) - SIZE_ORDER.indexOf(bKey)
                    })
                    .map((size, idx) => (
                      <Button
                        key={size + idx}
                        type={selectedSize === size ? "primary" : "default"}
                        className={`size-button ${selectedSize === size ? "selected" : ""}`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {getSizeName(size)}
                        {selectedSize === size && (
                          <div className="check-indicator">
                            <CheckOutlined />
                          </div>
                        )}
                      </Button>
                    ))}
                </div>
              </div>
            )}
            {/* Chọn Màu */}
            {filteredColors.length > 0 && (
              <div className="color-selection">
                <h3>Chọn màu sắc:</h3>
                <div className="color-options">
                  {filteredColors.map((color, idx) => {
                    const colorName = getColorName(color)
                    const cssColor = getColorCssValue(color)
                    return (
                      <div
                        key={color + idx}
                        className={`color-circle ${selectedColor === color ? "active" : ""}`}
                        style={{ backgroundColor: cssColor }}
                        title={colorName}
                        onClick={() => {
                          console.log("🟢 Màu được chọn từ UI:", color)
                          setSelectedColor(color)
                          updateImageFromColor(color)
                        }
                        }

                      >
                        {selectedColor === color && <CheckOutlined className="color-check" />}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="action-buttons">
              <Button className="buy-now-btn" icon={<ThunderboltOutlined />} onClick={handleBuyNow} loading={loading}>
                Mua Ngay
              </Button>
              <Button
                className="add-to-cart-btn"
                icon={<ShoppingCartOutlined />}
                onClick={handleAddtoCart}
                loading={loading}
              >
                Thêm Vào Giỏ
              </Button>
              {
                (() => {
                  const selectedVariant = getSelectedVariant()
                  return selectedVariant ? (
                    <Tag
                      color={selectedVariant.quantity === 0 ? "red" : "green"}
                      style={{
                        marginTop: 12,
                        padding: "6px 14px",
                        fontSize: 20,
                        fontWeight: 600,
                        borderRadius: "999px",
                        backgroundColor: selectedVariant.quantity === 0 ? "#ffecec" : "#f6ffed",
                        color: selectedVariant.quantity === 0 ? "#cf1322" : "#389e0d",
                        border: `1px solid ${selectedVariant.quantity === 0 ? "#ffa39e" : "#b7eb8f"}`,
                        display: "inline-block",
                        width: "fit-content",
                      }}
                    >
                      {selectedVariant.quantity === 0
                        ? "Hết hàng"
                        : `Còn lại: ${selectedVariant.quantity}`}
                    </Tag>
                  ) : null
                })()
              }
            </div>

            <div className="delivery-area">
              <div className="area-header">
                <div className="area-title">
                  <EnvironmentOutlined />
                  <span>Khu Vực Giao Hàng</span>
                </div>
                <div className="area-subtitle">Giao tại Hồ Chí Minh - Chọn lại</div>
              </div>
              <div className="store-list">
                <div className="store-item">
                  <span className="store-address">Quận 10: 561 Sư Vạn Hạnh, Phường 13</span>
                  <Badge status="warning" text="Còn hàng" />
                </div>
                <div className="store-item">
                  <span className="store-address">Quận 1: The New Playground 26 Lý Tự Trọng</span>
                  <Badge status="warning" text="Còn hàng" />
                </div>
              </div>
            </div>

            <div className="product-details">
              <h3>Chi tiết sản phẩm</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="label">Chất liệu:</span>
                  <span className="value">{getMaterialName(product.material)}</span>
                </div>
                {/* <div className="detail-item">
                  <span className="label">Kích thước:</span>
                  <span className="value">
                    {[...uniqueSizes]
                      .filter(Boolean)
                      .sort((a, b) => {
                        const aKey = typeof a === "number" ? Object.keys(SIZE_NAME_MAP)[a] : a
                        const bKey = typeof b === "number" ? Object.keys(SIZE_NAME_MAP)[b] : b
                        return SIZE_ORDER.indexOf(aKey) - SIZE_ORDER.indexOf(bKey)
                      })
                      .map(getSizeName)
                      .join(" - ")}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Màu sắc:</span>
                  <span className="value">{uniqueColors.filter(Boolean).map(getColorName).join(" - ")}</span>
                </div> */}
                <div className="detail-item">
                  <span className="label">Mùa:</span>
                  <span className="value">{getSeasonName(product.season) || "Tất cả mùa"}</span>
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
      </div >
      <Carousel numberOfSlides={6} numberOfItems={12} img={displayImages?.[0]} />
    </>
  )
}

export default DetailPage
