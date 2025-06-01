import { Select } from "antd";
import FilterDropdown from "../filterDrop";
import "./index.scss";
const { Option } = Select;

const FilterBar = ({ onFilterChange }) => {
  const handleFilterChange = (key, value) => {
    onFilterChange(key, value);
  };

  return (
    <div className="filter-bar">
      <div className="filter-left">
        <FilterDropdown
          title="Lọc giá"
          options={[
            "Giá dưới 100.000đ",
            "100.000đ - 200.000đ",
            "200.000đ - 300.000đ",
            "300.000đ - 500.000đ",
            "Giá trên 500.000đ",
          ]}
          onSelect={(v) => handleFilterChange("Lọc giá", v)}
        />
        <FilterDropdown
          title="Loại"
          options={["Áo thun", "Áo sơ mi", "Áo khoác", "Áo hoodie"]}
          onSelect={(v) => handleFilterChange("Loại", v)}
        />
        <FilterDropdown
          title="Kích thước"
          options={["S", "M", "L", "XL"]}
          onSelect={(v) => handleFilterChange("Kích thước", v)}
        />
        <FilterDropdown
          title="Màu sắc"
          options={["Đen", "Trắng", "Xanh", "Đỏ", "Vàng"]}
          onSelect={(v) => handleFilterChange("Màu sắc", v)}
        />
      </div>
      <div className="filter-right">
        <Select
          className="filter-select"
          defaultValue=""
          onChange={(value) => handleFilterChange("Thứ tự", value)}
        >
          <Option value="">Thứ tự</Option>
          <Option value="asc">Giá tăng dần</Option>
          <Option value="desc">Giá giảm dần</Option>
        </Select>
      </div>
    </div>
  );
};

export default FilterBar;
