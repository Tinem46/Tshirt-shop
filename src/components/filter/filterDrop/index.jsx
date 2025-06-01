import { useState } from "react";
import { DownOutlined } from "@ant-design/icons";
import "./index.scss";

const FilterDropdown = ({ title, options, onSelect }) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleSelect = (option) => {
    setSelected(option);
    onSelect(option);
    setOpen(false);
  };

  return (
    <div className="filter-dropdown">
      <button onClick={() => setOpen(!open)} className="filter-button">
        {title} <DownOutlined className="icon" />
      </button>

      {open && (
        <div className="dropdown-menu">
          {options.map((option, index) => (
            <label key={index} className="dropdown-option">
              <input
                type="radio"
                name={title}
                value={option}
                checked={selected === option}
                onChange={() => handleSelect(option)}
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
