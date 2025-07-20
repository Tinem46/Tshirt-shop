import { useEffect, useState } from "react";
import "./index.scss";
import Card from "../card";
import FilterBar from "../filter/filterBar";
import api, { MATERIAL_OPTIONS, SEASON_OPTIONS } from "../../config/api";
import { Spin } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

const ShopList = ({ searchKeyword = "", categories, setSelectedMenu }) => {
  const [shirt, setShirt] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const productType = queryParams.get("categoryId") || "";
  const navigate = useNavigate();

  // Lưu bộ lọc hiện tại
  const defaultFilters = {
    price: "",
    type: productType || "",
    size: "",
    color: "",
    order: "",
    material: "",
    season: "",
  };

  useEffect(() => {
    // Chỉ khi categories đã có data, mới xử lý
    if (!categories.length) return;

    if (!productType) {
      setSelectedMenu("All Shirt");
    } else {
      const cat = categories.find((c) => c.id === productType);
      setSelectedMenu(cat?.name || "Category");
    }
  }, [productType, categories, setSelectedMenu]);

  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    setFilters({
      price: "",
      type: productType || "",
      size: "",
      color: "",
      order: "",
      material: "",
      season: "",
    });
  }, [productType]);

  // Xây dựng params gửi lên API dựa trên filter và search
  const buildParams = () => {
    let params = {
      PageNumber: currentPage,
      PageSize: itemsPerPage,
      SortDirection: filters.order || "",
    };
    if (
      filters.material !== null &&
      filters.material !== undefined &&
      filters.material !== ""
    ) {
      params.Material = filters.material; // value phải là số (int)
    }
    if (
      filters.season !== null &&
      filters.season !== undefined &&
      filters.season !== ""
    ) {
      params.Season = filters.season; // value phải là số (int)
    }

    if (searchKeyword && searchKeyword.trim())
      params.Name = searchKeyword.trim();
    if (filters.type) params.CategoryId = filters.type;
    if (filters.size) params.Size = filters.size;
    if (filters.color) params.Color = filters.color;
    if (productType) params.CategoryId = productType;
    console.log("Params gửi lên API:", params);

    // Lọc giá
    if (filters.price) {
      switch (filters.price) {
        case "Giá dưới 100.000đ":
          params.MaxPrice = 100000;
          break;
        case "100.000đ - 200.000đ":
          params.MinPrice = 100000;
          params.MaxPrice = 200000;
          break;
        case "200.000đ - 300.000đ":
          params.MinPrice = 200000;
          params.MaxPrice = 300000;
          break;
        case "300.000đ - 500.000đ":
          params.MinPrice = 300000;
          params.MaxPrice = 500000;
          break;
        case "Giá trên 500.000đ":
          params.MinPrice = 500000;
          break;
        default:
          break;
      }
    }
    return params;
  };

  // Hàm sleep để giả lập độ trễ
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Gọi API lấy dữ liệu trang hiện tại
  const fetchShirt = async () => {
    try {
      setLoading(true);
      const response = await api.get("Product", {
        params: buildParams(),
      });

      await sleep(500); // Giả lập độ trễ để thấy loading
      let data = response.data?.data?.data || [];
      let total = response.data?.data?.totalCount || 0;
      setShirt(data);
      setTotalItems(total);
      console.log("Fetched shirt data:", data);
    } catch (error) {
      setShirt([]);
      setTotalItems(0);
      console.error("Lỗi khi fetch sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  // Khi filter, trang, search đổi thì gọi lại API
  useEffect(() => {
    setCurrentPage(1); // Reset về trang 1 nếu searchKeyword hoặc productType thay đổi
  }, [searchKeyword, productType]);

  useEffect(() => {
    fetchShirt();
    // eslint-disable-next-line
  }, [currentPage, filters, searchKeyword, productType]);

  // Khi filter bar đổi filter thì gọi hàm này
  const handleFilterChange = (key, value) => {
    // Nếu chọn reset
    if (key === "reset") {
      setFilters(defaultFilters);
      navigate("/shop");
      return;
    }

    // Nếu chọn "Loại"
    if (key === "Loại") {
      // Nếu chọn Tất cả ("" hoặc null) thì trở về /shop
      if (!value) {
        navigate("/shop");
        setFilters((prev) => ({
          ...prev,
          type: "",
        }));
      } else {
        // Ngược lại, set CategoryId lên URL (và đồng bộ filter)
        navigate(`/shop?categoryId=${value}`);
        setFilters((prev) => ({
          ...prev,
          type: value,
        }));
      }
      return;
    }

    // Xử lý các filter khác
    setFilters((prev) => ({
      ...prev,
      [key === "Lọc giá"
        ? "price"
        : key === "Loại"
        ? "type"
        : key === "Kích thước"
        ? "size"
        : key === "Màu sắc"
        ? "color"
        : key === "Thứ tự"
        ? "order"
        : key === "Chất liệu"
        ? "material"
        : key === "Mùa"
        ? "season"
        : key]: value,
    }));
    setCurrentPage(1);
  };

  // Tính tổng số trang
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Xử lý chuyển trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Render nút phân trang
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={currentPage === i ? "active" : ""}
          >
            {i}
          </button>
        );
      }
    } else {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={currentPage === 1 ? "active" : ""}
        >
          1
        </button>
      );
      if (currentPage > 3)
        pages.push(
          <span key="start-dots" className="dots">
            ...
          </span>
        );
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(
            <button
              key={i}
              onClick={() => handlePageChange(i)}
              className={currentPage === i ? "active" : ""}
            >
              {i}
            </button>
          );
        }
      }
      if (currentPage < totalPages - 2)
        pages.push(
          <span key="end-dots" className="dots">
            ...
          </span>
        );
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={currentPage === totalPages ? "active" : ""}
        >
          {totalPages}
        </button>
      );
    }
    return <div className="pagination">{pages}</div>;
  };

  return (
    <div className="shop-list-wrapper">
      {/* Loading Overlay - che toàn bộ trang */}
      {loading && (
        <div className="loading-fullscreen">
          <Spin size="large" tip="Đang tải..." />
        </div>
      )}

      {/* Nội dung trang */}
      <FilterBar
        onFilterChange={handleFilterChange}
        categories={categories}
        materialOptions={MATERIAL_OPTIONS}
        seasonOptions={SEASON_OPTIONS}
        filters={filters} // <-- BẮT BUỘC PHẢI THÊM DÒNG NÀY!
      />
      <div
        style={{
          height: "2px",
          width: "100%",
          maxWidth: "1117px",
          backgroundColor: "black",
          margin: "0 auto 50px auto",
        }}
      ></div>
      {shirt.length === 0 && !loading ? (
        <div className="empty-search">
          <img
            src="data:image/jpeg;base64,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"
            alt="Empty Cart"
          />
          <p style={{ textAlign: "center", fontSize: "1.2rem", color: "#888" }}>
            Không tìm thấy sản phẩm ...
          </p>
        </div>
      ) : (
        <>
          <div className="shop-list">
            {shirt.map((item) => (
              <Card key={item.id} shirt={item} />
            ))}
          </div>
          <div className="line"></div>
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default ShopList;
