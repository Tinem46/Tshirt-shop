import { useLocation } from "react-router-dom";
import ShopList from "../../components/shopList";

const useQuery = () => new URLSearchParams(useLocation().search);

const SearchPage = () => {
  const query = useQuery();
  const keyword = query.get("q") || "";

  return (
    <div data-aos="fade-up">
      <h2
        style={{ padding: "2rem 2rem", fontSize: "1.2rem", color: "#484848" }}
      >
        Kết quả tìm kiếm cho: "{keyword}"
      </h2>
      <ShopList searchKeyword={keyword} />
    </div>
  );
};

export default SearchPage;
