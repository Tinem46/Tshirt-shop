import { Button, Table } from "antd";

function OrderInformation({ orderInfo, onClose }) {
  const infoColumns = [
    {
      title: "Field",
      dataIndex: "field",
      key: "field",
      width: "30%",
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
    },
  ];

  const transformOrderInfoToTableData = (info) => {
    return [
      { key: "1", field: "Full Name", value: info.fullName },
      { key: "2", field: "Email", value: info.email },
      { key: "3", field: "Phone", value: info.phone },
      { key: "4", field: "Address", value: info.address },
      { key: "5", field: "City", value: info.city },
      { key: "6", field: "Country", value: info.country },
    ];
  };

  return (
    <div
      style={{ marginTop: "20px", padding: "16px", backgroundColor: "#fff" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <h3>Order Information</h3>
        <Button onClick={onClose}>Close</Button>
      </div>
      <Table
        columns={infoColumns}
        dataSource={transformOrderInfoToTableData(orderInfo)}
        pagination={false}
        size="middle"
      />
    </div>
  );
}

export default OrderInformation;
