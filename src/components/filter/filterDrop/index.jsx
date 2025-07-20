import { useRef, useEffect, useState } from "react";
import { DownOutlined } from "@ant-design/icons";
import "./index.scss";

const FilterDropdown = ({ title, options = [], onSelect, selectedValue }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Bắt sự kiện click ra ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Helper để lấy value/label
  const getValue = (option) =>
    typeof option === "object" ? option.value : option;
  const getLabel = (option) =>
    typeof option === "object" ? option.label : option;

  const handleSelect = (option) => {
    onSelect(getValue(option));
    setOpen(false);
  };

  return (
    <div className="filter-dropdown" ref={ref}>
      <button onClick={() => setOpen(!open)} className="filter-button">
        {title} <DownOutlined className="icon" />
      </button>
      {open && (
        <div className="dropdown-menu">
          <label className="dropdown-option">
            <input
              type="radio"
              name={title}
              value=""
              checked={selectedValue === null || selectedValue === ""}
              onChange={() => handleSelect("")}
            />
            Tất cả
          </label>
          {options.map((option, index) => (
            <label key={index} className="dropdown-option">
              <input
                type="radio"
                name={title}
                value={getValue(option)}
                checked={selectedValue === getValue(option)}
                onChange={() => handleSelect(option)}
              />
              {getLabel(option)}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
