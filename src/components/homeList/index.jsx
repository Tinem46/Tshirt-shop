import { useEffect, useState } from "react";
import Card from "../card";
import "./index.scss";
import { useNavigate } from "react-router-dom";
import api from "../../config/api";

const HomeList = ({ Type }) => {
  const navigate = useNavigate();
  const [shirt, setShirt] = useState([]);

  const fetchShirt = async () => {
    try {
      const response = await api.get("Product", {
        params: { PageSize: 12 }
      });
      let data = response.data?.data?.data || [];
      let total = response.data?.data?.totalCount || 0;
      setShirt(data);
      console.log("Fetched products:", data);
      console.log("Total products:", total);
    } catch (error) {
      setShirt([]);
      console.error("Lỗi khi fetch sản phẩm:", error);
    } finally {
      console.log("Fetch completed");
    }
  };
  useEffect(() => {
    fetchShirt();
  }, []);

  return (
    <>
      <div className="category-banners">
        <div className="category-item" onClick={() => navigate("/topShop")}>
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
        {shirt.map((item) => (
          <Card key={Type ? item.type : item.id} shirt={item} />
        ))}
      </div>
    </>
  );
};
export default HomeList;
