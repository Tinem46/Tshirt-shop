import { useState } from "react";
import ShopList from "../../components/shopList";
import NavBar from "../../components/navBar";
import FilterBar from "../../components/filter/filterBar";

const Shop = () => {
  const [selectedMenu, setSelectedMenu] = useState("All Shirt");

  return (
    <>
      <NavBar
        standOn="Shop"
        selectedMenu={selectedMenu}
        className="Navigation"
      />
     
      <ShopList />
    </>
  );
};
export default Shop;
