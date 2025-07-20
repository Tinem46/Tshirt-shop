import { Select } from "antd";
import FilterDropdown from "../filterDrop";
import "./index.scss";
const { Option } = Select;

const FilterBar = ({
  onFilterChange,
  categories = [],
  materialOptions = [],
  seasonOptions = [],
  filters = {},
}) => {
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
          selectedValue={filters.price} // <-- DÒNG NÀY PHẢI CÓ
          onSelect={(v) => handleFilterChange("Lọc giá", v)}
        />

        {/* Tạo options từ categories */}
        <FilterDropdown
          title="Loại"
          options={categories.map((cat) => ({
            value: cat.id,
            label: cat.name,
          }))}
          selectedValue={filters.type} // Truyền value chọn
          onSelect={(v) => handleFilterChange("Loại", v)}
        />

        <FilterDropdown
          title="Chất liệu"
          options={materialOptions}
          selectedValue={filters.material}
          onSelect={(v) => handleFilterChange("Chất liệu", v)}
        />
        <FilterDropdown
          title="Mùa"
          options={seasonOptions}
          selectedValue={filters.season}
          onSelect={(v) => handleFilterChange("Mùa", v)}
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
