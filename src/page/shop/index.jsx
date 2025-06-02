import { useState } from "react";
import ShopList from "../../components/shopList";
import NavBar from "../../components/navBar";
import FilterBar from "../../components/filter/filterBar";
import "aos/dist/aos.css";

const Shop = () => {
  const [selectedMenu, setSelectedMenu] = useState("All Shirt");

  return (
    <>
      <div data-aos="fade-down">
        <NavBar
          standOn="Shop"
          selectedMenu={selectedMenu}
          className="Navigation"
        />
      </div>
      <div data-aos="fade-up" data-aos-delay="400">
        <ShopList />
      </div>
    </>
  );
};

export default Shop;
