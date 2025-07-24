import { useState, useEffect, useRef } from "react";
import {
  Shirt,
  Sparkles,
  Download,
  Loader2,
  AlertCircle,
  Heart,
} from "lucide-react";
import "./index.scss";
import api from "../../config/api";
import FormatCost from "../../components/formatCost";
import { Button, Modal } from "antd";
import { useNavigate } from "react-router-dom";

const SHIRT_TYPES = [
  { value: 1, label: "T-Shirt" },
  { value: 2, label: "Polo Shirt" },
  { value: 3, label: "Long Sleeve" },
  { value: 4, label: "Tank Top" },
  { value: 5, label: "Hoodie" },
];

const BASE_COLORS = [
  { value: 1, label: "White", color: "#FFFFFF" },
  { value: 2, label: "Black", color: "#000000" },
  { value: 3, label: "Gray", color: "#808080" },
  { value: 4, label: "Navy", color: "#000080" },
  { value: 5, label: "Red", color: "#FF0000" },
  { value: 6, label: "Blue", color: "#0000FF" },
];

const SIZES = [
  { value: 1, label: "XS" },
  { value: 2, label: "S" },
  { value: 3, label: "M" },
  { value: 4, label: "L" },
  { value: 5, label: "XL" },
  { value: 6, label: "XXL" },
];

const CustomDesign = () => {
  const [formData, setFormData] = useState({
    designName: "",
    promptText: "",
    shirtType: 1,
    baseColor: 1,
    size: 3,
    specialRequirements: "",
    quantity: 1,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [currentDesign, setCurrentDesign] = useState(null);
  const [showhistory, setShowhistory] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const navigate = useNavigate();
  const historySectionRef = useRef(null);

  const handlePreview = (imgUrl) => {
    setPreviewImage(imgUrl);
    setPreviewVisible(true);
  };

  // Chỉ load history khi mở history, không ảnh hưởng preview
  useEffect(() => {
    if (showhistory && historySectionRef.current) {
      // Scroll mượt tới section
      historySectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [showhistory]);

  // --- DEBUG: log ở mỗi lần render ---
  console.log("currentDesign (render):", currentDesign);

  // Lấy sản phẩm mới nhất cho preview (PageSize=1)
  const fetchNewestDesign = async () => {
    try {
      const res = await api.get(
        "CustomDesign/filter-user?PageSize=1&SortBy=CreatedAt&SortDescending=true"
      );
      // --- CHẮC CHẮN lấy items đúng ---
      const items = res.data?.items || res.items || [];
      console.log("fetchNewestDesign items:", items);

      if (items.length > 0) {
        setCurrentDesign(items[0]);
        console.log("Set currentDesign:", items[0]);
      } else {
        setCurrentDesign(null);
        console.log("No design found, set currentDesign to null");
      }
    } catch (err) {
      setCurrentDesign(null);
      console.log(
        "Error fetching newest design, set currentDesign to null",
        err
      );
    }
  };

  // Lấy lịch sử design cho history (PageSize=20)
  const loadHistoryDesigns = async () => {
    try {
      const res = await api.get("CustomDesign/filter-user?PageSize=20");
      setDesigns(res.data?.items || []);
      console.log("History designs loaded:", res.data?.items);
    } catch (err) {
      setDesigns([]);
      console.log("Error loading history designs", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "quantity" ||
        name === "shirtType" ||
        name === "baseColor" ||
        name === "size"
          ? parseInt(value)
          : value,
    }));
  };

  // Chỉ fetch newest sau khi submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const postRes = await api.post("CustomDesign", formData);
      console.log("POST response:", postRes);
      await fetchNewestDesign(); // Preview sản phẩm vừa tạo
      if (showhistory) {
        await loadHistoryDesigns(); // Nếu đang mở history thì load lại list
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create design");
      console.log("POST error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      designName: "",
      promptText: "",
      shirtType: 1,
      baseColor: 1,
      size: 3,
      specialRequirements: "",
      quantity: 1,
    });
    // KHÔNG reset preview!
    setError(null);
  };

  const getColorStyle = (colorValue) => {
    const color = BASE_COLORS.find((c) => c.value === colorValue);
    return color
      ? { backgroundColor: color.color }
      : { backgroundColor: "#FFFFFF" };
  };

  const handleHistoryItemClick = (design) => {
    setCurrentDesign(design);
    console.log("Set currentDesign from history:", design);
  };

  const handleToggleLikeDesign = async (design) => {
    const newStatus = design.status === 1 ? 0 : 1;
    try {
      await api.patch(`CustomDesign/${design.id}/status`, {
        status: newStatus,
      });
      // Sau khi PATCH thành công, reload lại history để cập nhật UI!
      await loadHistoryDesigns();
    } catch (err) {
      alert("Có lỗi khi cập nhật trạng thái sản phẩm!");
      console.error("Like/Unlike error:", err);
    }
  };

  return (
    <div className="shirt-designer">
      <div className="container">
        <header className="header-designer" data-aos="fade-down">
          <div className="header-content">
            <div className="logo">
              <Shirt className="logo-icon" />
              <h1>AI Shirt Designer</h1>
            </div>
            <button
              className="history-design-btn"
              onClick={() => setShowhistory(!showhistory)}
            >
              History Design
            </button>
          </div>
        </header>

        <div className="main-content">
          <div className="design-section">
            <div className="form-container" data-aos="fade-right">
              <h2>Create Your Design</h2>
              {error && (
                <div className="error-message">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="design-form">
                {/* ... Các input ... */}
                <div className="form-group">
                  <label htmlFor="designName">Design Name</label>
                  <input
                    type="text"
                    id="designName"
                    name="designName"
                    value={formData.designName}
                    onChange={handleInputChange}
                    placeholder="Enter design name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="promptText">Design Prompt</label>
                  <textarea
                    id="promptText"
                    name="promptText"
                    value={formData.promptText}
                    onChange={handleInputChange}
                    placeholder="Describe your design idea..."
                    rows={4}
                    required
                  />
                </div>
                {/* ... ShirtType, BaseColor, Size, SpecialRequirements, Quantity ... */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="shirtType">Shirt Type</label>
                    <select
                      id="shirtType"
                      name="shirtType"
                      value={formData.shirtType}
                      onChange={handleInputChange}
                    >
                      {SHIRT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="baseColor">Base Color</label>
                    <div className="color-selector">
                      <select
                        id="baseColor"
                        name="baseColor"
                        value={formData.baseColor}
                        onChange={handleInputChange}
                      >
                        {BASE_COLORS.map((color) => (
                          <option key={color.value} value={color.value}>
                            {color.label}
                          </option>
                        ))}
                      </select>
                      <div
                        className="color-preview"
                        style={getColorStyle(formData.baseColor)}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="size">Size</label>
                    <select
                      id="size"
                      name="size"
                      value={formData.size}
                      onChange={handleInputChange}
                    >
                      {SIZES.map((size) => (
                        <option key={size.value} value={size.value}>
                          {size.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="specialRequirements">
                    Special Requirements
                  </label>
                  <textarea
                    id="specialRequirements"
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleInputChange}
                    placeholder="Any special requirements..."
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="quantity">Quantity</label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                    max="10000"
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="spinning" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Generate Design
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="preview-container" data-aos="fade-left">
              <h2>Preview</h2>
              <div className="preview-area">
                {currentDesign && currentDesign.designImageUrl ? (
                  <div className="design-result">
                    <div className="design-image">
                      <img
                        src={currentDesign.designImageUrl}
                        alt={currentDesign.designName || "Shirt Design"}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          cursor: "zoom-in",
                        }}
                        onClick={() =>
                          handlePreview(currentDesign.designImageUrl)
                        }
                      />
                    </div>
                    <div className="design-info">
                      <h3>{currentDesign.designName}</h3>
                      <p style={{ color: "#000000" }}>
                        {currentDesign.promptText}
                      </p>
                      {/* ...Thêm các detail khác nếu muốn... */}
                    </div>
                  </div>
                ) : (
                  <div className="preview-placeholder">
                    <Shirt size={80} />
                    <p>Your design will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {showhistory && (
            <div className="history-design-section" ref={historySectionRef}>
              <h2>Design History</h2>
              <div className="history-design-grid">
                {designs.map((design) => (
                  <div
                    key={design.id}
                    className="history-design-item"
                    onClick={() => handleHistoryItemClick(design)}
                  >
                    <div className="history-design-image">
                      <img
                        src={
                          design.designImageUrl
                            ? design.designImageUrl
                            : "https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=200"
                        }
                        alt={design.designName}
                        onError={(e) => {
                          e.target.src =
                            "https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=200";
                        }}
                        style={{ cursor: "zoom-in" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreview(design.designImageUrl);
                        }}
                      />
                    </div>
                    <div className="history-design-info">
                      <h4>{design.designName}</h4>

                      <p>
                        <FormatCost value={design.totalPrice} />
                      </p>
                      <span className="date">
                        {new Date(design.createdAt).toLocaleDateString()}
                      </span>
                      <div className="like-btn-container">
                        <button
                          className="like-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleLikeDesign(design);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                          title={
                            design.status === 1
                              ? "Đã thích - Bấm để bỏ thích"
                              : "Bấm để thích sản phẩm"
                          }
                        >
                          <Heart
                            size={22}
                            color={design.status === 1 ? "#e63946" : "#999"}
                            fill={design.status === 1 ? "#e63946" : "none"}
                            strokeWidth={2.2}
                            style={{
                              transition: "color 0.2s",
                              cursor: "pointer",
                            }}
                          />
                        </button>
                      </div>
                      {design.status === 1 && (
                        <Button
                          onClick={() =>
                            navigate(
                              `/userLayout?tab=customDesign&status=liked`
                            )
                          }
                          style={{
                            background: "#020202ff",
                            color: "#fff",
                            width: "100%",
                            marginTop: "8px",
                            height: "40px",
                          }}
                          className="liked"
                        >
                          Your Design
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={600}
        centered
      >
        <img
          src={previewImage}
          alt="Preview"
          style={{
            width: "100%",
            maxHeight: "80vh",
            objectFit: "contain",
            background: "#222",
            borderRadius: "8px",
            cursor: "pointer",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
            transition: "transform 0.2s",
          }}
        />
      </Modal>
      ;
    </div>
  );
};

export default CustomDesign;
