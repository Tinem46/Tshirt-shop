import { DatePicker, Select, Button, Space } from "antd";
import { useState } from "react";
const { RangePicker } = DatePicker;

const OrderFilter = ({ onFilter, loading }) => {
  const [dates, setDates] = useState([]);
  const [sort, setSort] = useState("desc");

  const handleFilter = () => {
    onFilter({
      startDate: dates[0] ? dates[0].startOf("day").toISOString() : null,
      endDate: dates[1] ? dates[1].endOf("day").toISOString() : null,
      sortOrder: sort,
    });
  };

  return (
    <Space style={{ marginBottom: 16 }}>
      <RangePicker
        value={dates}
        onChange={setDates}
        format="YYYY-MM-DD"
        allowClear
      />
      <Select value={sort} onChange={setSort} style={{ width: 140 }}>
        <Select.Option value="desc">Mới nhất</Select.Option>
        <Select.Option value="asc">Cũ nhất</Select.Option>
      </Select>
      <Button type="primary" onClick={handleFilter} loading={loading}>
        Lọc
      </Button>
    </Space>
  );
};

export default OrderFilter;
