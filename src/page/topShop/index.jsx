import ShopList from "../../components/shopList";
import NavBar from "../../components/navBar";
const TopShop = () => {
  return (
    <div data-aos="fade-down">
      <NavBar standOn="Top" />
      <ShopList productType="Shirt" />;
    </div>
  );
};
export default TopShop;
