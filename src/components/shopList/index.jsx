import { useEffect, useState } from "react";
import "./index.scss";
import Card from "../card";
import FilterBar from "../filter/filterBar";

const ShopList = () => {
  const [shirt, setShirt] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  const [filters, setFilters] = useState({
    price: null,
    type: null,
    size: null,
    color: null,
    order: "",
  });

  const fetchShirt = async () => {
    try {
      const response = await fetch(
        "https://682f2e5b746f8ca4a4803faf.mockapi.io/product"
      );
      const data = await response.json();
      if (Array.isArray(data)) setShirt(data);
    } catch (error) {
      console.error("Lỗi khi fetch sản phẩm:", error);
    }
  };

  useEffect(() => {
    fetchShirt();
  }, []);

  const handleFilterChange = (key, value) => {
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
        : key]: value,
    }));
    setCurrentPage(1);
  };

  const applyFilters = () => {
    return shirt
      .filter((item) => {
        if (filters.price) {
          const price = parseInt(item.price);
          switch (filters.price) {
            case "Giá dưới 100.000đ":
              return price < 100000;
            case "100.000đ - 200.000đ":
              return price >= 100000 && price <= 200000;
            case "200.000đ - 300.000đ":
              return price >= 200000 && price <= 300000;
            case "300.000đ - 500.000đ":
              return price >= 300000 && price <= 500000;
            case "Giá trên 500.000đ":
              return price > 500000;
            default:
              return true;
          }
        }
        return true;
      })
      .filter((item) => !filters.type || item.type === filters.type)
      .filter((item) => !filters.size || item.size === filters.size)
      .filter((item) => !filters.color || item.color === filters.color)
      .sort((a, b) => {
        if (filters.order === "asc") return a.price - b.price;
        if (filters.order === "desc") return b.price - a.price;
        return 0;
      });
  };

  const filteredItems = applyFilters();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPagination = () => {
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
    <>
      <FilterBar onFilterChange={handleFilterChange} />

      <div className="shop-list-wrapper">
        <div
          style={{
            height: "2px",
            width: "100%",
            maxWidth: "1117px",
            backgroundColor: "black",
            margin: "0 auto 50px auto",
          }}
        ></div>
        <div className="shop-list">
          {currentItems.map((item) => (
            <Card key={item.id} shirt={item} />
          ))}
        </div>
        <div className="line"></div>
        {renderPagination()}
      </div>
    </>
  );
};

export default ShopList;
