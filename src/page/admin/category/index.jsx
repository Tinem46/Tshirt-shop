import { useState } from "react";
import { Form, Input, Switch, DatePicker } from "antd";
import dayjs from "dayjs"; // nhớ cài nếu chưa có: npm install dayjs
import DashboardTemplate from "../../../components/dashboard-template";

const ManageCategory = () => {
  const [fileList, setFileList] = useState([]);
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (val) => (val ? "Yes" : "No"),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val) => val && dayjs(val).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (val) => val && dayjs(val).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Deleted",
      dataIndex: "isDeleted",
      key: "isDeleted",
      render: (val) => (val ? "Yes" : "No"),
    },
  ];

  const formItems = (
    <>
      <Form.Item
        name="name"
        label="Name"
        rules={[{ required: true, message: "Please enter name" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Input.TextArea />
      </Form.Item>
      <Form.Item
        name="isActive"
        label="Active"
        valuePropName="checked"
        initialValue={true}
      >
        <Switch />
      </Form.Item>
      {/* createdAt, updatedAt, isDeleted: thường không cho user nhập, chỉ hiện thị */}
    </>
  );

  return (
    <DashboardTemplate
      columns={columns}
      apiURI="Category"
      formItems={formItems}
      title="Category"
      resetImage={() => setFileList([])}
      showEditDelete={true}
    />
  );
};

export default ManageCategory;
