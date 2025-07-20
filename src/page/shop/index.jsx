import { useState, useEffect } from "react";
import ShopList from "../../components/shopList";
import Navigation from "../../components/navBar";
import api from "../../config/api";

const Shop = () => {
  const [selectedMenu, setSelectedMenu] = useState("All Shirt");
  const [categories, setCategories] = useState([]);

  // Lấy category từ API 1 lần khi load Shop
  useEffect(() => {
    api
      .get("Category")
      .then((res) => {
        const cats = res.data?.data?.data || [];
        setCategories(cats);
      })
      .catch(() => setCategories([]));
  }, []);

  return (
    <>
      <div data-aos="fade-down">
        <Navigation
          mainName="Shop"
          selectedMenu={selectedMenu}
          shopLink="/shop"
          triggerReset={() => setSelectedMenu("All Shirt")}
        />
      </div>
      <div data-aos="fade-up">
        <ShopList setSelectedMenu={setSelectedMenu} categories={categories} />
      </div>
    </>
  );
};

export default Shop;
