import { useEffect, useState } from "react";
import Card from "../card";
import "./index.scss";
import { useNavigate } from "react-router-dom";

const HomeList = ({ Type }) => {
  const navigate = useNavigate();
  const [shirt, setShirt] = useState([]);
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

  return (
    <>
      <div className="category-banners">
        <div className="category-item">
          <img
            src="https://theme.hstatic.net/1000306633/1001194548/14/block_home_category1_new.png?v=360"
            alt="Top"
          />
        </div>
        <div className="category-item">
          <img
            src="https://theme.hstatic.net/1000306633/1001194548/14/block_home_category2_new.png?v=360"
            alt="Bottom"
          />
        </div>
        <div className="category-item">
          <img
            src="https://theme.hstatic.net/1000306633/1001194548/14/block_home_category3_new.png?v=360"
            alt="Outerwear"
          />
        </div>
      </div>

      <div className="home-image" onClick={() => navigate("/shop")}>
        <img src="https://theme.hstatic.net/1000306633/1001194548/14/show_block_home_category_image_3_new.png?v=360" />
      </div>
      <div className="scrolling-text">
        <div className="text-track">
          {Array(10)
            .fill("NEW ARRIVALS")
            .map((text, index) => (
              <span key={index}>{text}</span>
            ))}
        </div>
      </div>

      <div className="shirt-list">
        {shirt.slice(0, 12).map((item) => (
          <Card key={Type ? item.type : item.id} shirt={item} />
        ))}
      </div>
    </>
  );
};
export default HomeList;
