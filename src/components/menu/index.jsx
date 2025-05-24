
import { Input, Select, Button } from "antd";
import "./index.scss";
import { useEffect, useState } from "react";
import Card from "../card";
// import api from "../../config/api";


function MenuForShop({ selectedMenu, setSelectedMenu, resetshirt }) {
  const [shirt, setShirt] = useState([]);
  const [filteredshirt, setFilteredshirt] = useState([]);
  const [visibleCount, setVisibleCount] = useState(8);
  const [sortOrder, setSortOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);

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

  // const fetchCategories = async () => {
  //   try {
  //     const response = await api.get("shirtTypes");
  //     const categoryList = [
  //       { value: "All shirt", label: "All shirt" },
  //       ...response.data.map(cat => ({
  //         value: cat.category.toLowerCase(),
  //         label: cat.category
  //       }))
  //     ];
  //     setCategories(categoryList);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  useEffect(() => {
    fetchShirt();
    // fetchCategories();
  }, []);

  useEffect(() => {
    if (resetshirt) {
      setFilteredshirt(shirt);
      setSelectedMenu("");
      setSortOrder(null);
    }
  }, [resetshirt, shirt, setSelectedMenu]);

  useEffect(() => {
    let results = [...shirt];

    if (selectedMenu && selectedMenu !== "All shirt") {
      results = results.filter(
        (item) => item.category.toLowerCase() === selectedMenu.toLowerCase()
      );
    }

    if (searchTerm) {
      results = results.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredshirt(results);
  }, [searchTerm, selectedMenu, shirt]);

  const sortOptions = [
    { value: "", label: "Default" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
  ];

  const handleCategoryChange = (value) => {
    let newFilteredshirt = [...shirt];

    if (value && value !== "all") {
      newFilteredshirt = shirt.filter(
        (item) => item.category.toLowerCase() === value.toLowerCase()
      );
    }

    setSelectedMenu(value);
    setFilteredshirt(newFilteredshirt);
    setVisibleCount(8);
  };

  const handleSortChange = (value) => {
    setSortOrder(value);
    let newFilteredshirt = [...filteredshirt];

    if (value) {
      newFilteredshirt.sort((a, b) => {
return value === "price_asc" ? a.price - b.price : b.price - a.price;
      });
    }

    setFilteredshirt(newFilteredshirt);
  };

  const showMore = () => {
    setVisibleCount((prevCount) => prevCount + 4);
  };

  return (
    <>
      <div className="containerMenuAndshirtList">
        <div className="filterSection">
          <Input.Search
            className="Input-Menu"
            placeholder="Search Your shirt"
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
          <div className="category-buttons">
            {categories.map((category) => (
              <Button
                key={category.value}
                className={`category-button ${
                  selectedMenu === category.value ? "active" : ""
                }`}
                onClick={() => handleCategoryChange(category.value)}
              >
                {category.label}
              </Button>
            ))}
          </div>
          <Select
            className="sort-select"
            placeholder="Sort by"
            onChange={handleSortChange}
            value={sortOrder}
            options={sortOptions}
          />
        </div>
        <div className="menushirt-Config">
          <div className="menushirt">
            {filteredshirt.slice(0, visibleCount).map((item) => (
              <Card key={item.id} shirt={item} />
            ))}
          </div>
          {visibleCount < filteredshirt.length && (
            <Button
              type="primary"
              onClick={showMore}
              size="large"
              className="showMoreButton"
            >
              Show More
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

export default MenuForShop;