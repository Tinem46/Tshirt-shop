import { useEffect, useState } from "react";
import "./index.scss";
import Card from "../card";

function ShopList({ Type }) {
  const [shirt, setShirt] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const fetchShirt = async () => {
    try {
      const response = await fetch("https://682f2e5b746f8ca4a4803faf.mockapi.io/product");
      const data = await response.json();
      console.log("DATA:", data);

      if (Array.isArray(data)) {
        setShirt(data);
      } else {
        console.error("API trả về dữ liệu không phải là mảng:", data);
      }
    } catch (error) {
      console.error("Lỗi khi fetch sản phẩm:", error);
    }
  };

  useEffect(() => {
    fetchShirt();
  }, []);

  // Tính toán sản phẩm để hiển thị ở trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = shirt.slice(indexOfFirstItem, indexOfLastItem);

  // Tính tổng số trang
  const totalPages = Math.ceil(shirt.length / itemsPerPage);

  // Hàm chuyển trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
    
    <div className="shop-list-wrapper">
      <div className="shop-list">
        {currentItems.map((item) => (
          <Card key={Type ? item.type : item.id} shirt={item} />
        ))}
      </div>
      <div className="line"></div>
      {/* Phân trang */}
      <div className="pagination">
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={currentPage === index + 1 ? "active" : ""}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div></>
  );
}

export default ShopList;
