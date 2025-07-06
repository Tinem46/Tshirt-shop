import { useEffect, useState } from "react";
import { Form, Input, Select, Button, Popconfirm } from "antd";
import {
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import DashboardTemplate from "../../../components/dashboard-template";
import api from "../../../config/api";
import { toast } from "react-toastify";

function AccountManagement() {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Lấy danh sách user ban đầu
  const fetchUsers = async () => {
    const res = await api.get("User");
    if (Array.isArray(res.data)) {
      setUsers(res.data);s
    } else if (Array.isArray(res.data.data)) {
      setUsers(res.data.data);
    } else if (res.data.data && Array.isArray(res.data.data.data)) {
      setUsers(res.data.data.data);
    } else {
      setUsers([]);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  // Các cột Table
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Full Name", dataIndex: "fullName", key: "fullName" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone_number", key: "phone_number" },
    {
      title: "Created Date",
      dataIndex: "createAt",
      key: "createAt",
      render: (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      },
    },
    {
      title: "Address",
      key: "address",
      render: (record) => (
        <span>
          {[record.specific_Address, record.city, record.state, record.country]
            .filter(Boolean)
            .join(", ") || "N/A"}
        </span>
      ),
    },
    {
      title: "Role",
      dataIndex: "roles",
      key: "roles",
      render: (roles) =>
        Array.isArray(roles) ? roles.join(", ") : roles || "N/A",
    },
    {
      title: "Status",
      dataIndex: "isLocked",
      key: "isLocked",
      render: (locked) =>
        locked ? (
          <span style={{ color: "red" }}>
            <LockOutlined /> Locked
          </span>
        ) : (
          <span style={{ color: "green" }}>
            <UnlockOutlined /> Active
          </span>
        ),
    },
  ];

  // Các trường nhập form
  const formItems = (
    <>
      <Form.Item
        name="firstName"
        label="First Name"
        rules={[{ required: true, message: "Please enter first name" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="lastName"
        label="Last Name"
        rules={[{ required: true, message: "Please enter last name" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: "Please enter email" },
          { type: "email", message: "Email is not valid" },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, message: "Please enter password" }]}
        hasFeedback
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        name="passwordConfirm"
        label="Password Confirm"
        dependencies={["password"]}
        hasFeedback
        rules={[
          { required: true, message: "Please confirm password" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error("The two passwords do not match!")
              );
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        name="gender"
        label="Gender"
        rules={[{ required: true, message: "Please select gender" }]}
      >
        <Select placeholder="Select gender">
          <Select.Option value="Male">Male</Select.Option>
          <Select.Option value="Female">Female</Select.Option>
          <Select.Option value="Other">Other</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="roles"
        label="Roles"
        rules={[{ required: true, message: "Please select role(s)" }]}
      >
        <Select mode="multiple" placeholder="Select roles">
          <Select.Option value="Admin">Admin</Select.Option>
          <Select.Option value="Staff">Staff</Select.Option>
          <Select.Option value="Customer">Customer</Select.Option>
        </Select>
      </Form.Item>
    </>
  );

  // Lock/Unlock
  const lockAccount = async (id) => {
    try {
      await api.put(`/User/lock?id=${id}`);
      toast.success("Account locked!");
      fetchUsers(); // Refresh user list
    } catch {
      toast.error("Lock failed!");
    }
  };

  const unlockAccount = async (id) => {
    try {
      await api.put(`/User/unlock?id=${id}`);
      toast.success("Account unlocked!");
      setUsers((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, isLocked: false } : user
        )
      );
    } catch {
      toast.error("Unlock failed!");
    }
  };

  // Xóa từng user

  // Xóa nhiều user (bulk)
  const deleteAccountsBulk = async (ids) => {
    if (!ids || ids.length === 0) {
      toast.warning("Please select at least one account to delete.");
      return;
    }
    try {
      await api.delete(`/User/bulk`, { params: { ids } });
      toast.success("Selected accounts deleted!");
      setUsers((prev) => prev.filter((user) => !ids.includes(user.id)));
      setSelectedRowKeys([]);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Delete failed! Some accounts may not exist."
      );
    }
  };

  // Custom actions Table
  const customActions = [
    {
      label: (
        <span>
          <LockOutlined /> Lock
        </span>
      ),
      condition: (record) => !record.isLocked,
      action: async (id) => {
        await lockAccount(id);
      },
      color: "#faad14",
    },
    {
      label: (
        <span>
          <UnlockOutlined /> Unlock
        </span>
      ),
      condition: (record) => record.isLocked,
      action: async (id) => {
        await unlockAccount(id);
      },
      color: "#52c41a",
    },
  ];

  // Chọn nhiều row
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <div>
      {/* Nút xóa nhiều */}
      <Popconfirm
        title="Are you sure you want to delete the selected accounts?"
        onConfirm={() => deleteAccountsBulk(selectedRowKeys)}
        okText="Yes"
        cancelText="No"
        disabled={selectedRowKeys.length === 0}
      >
        <Button
          type="primary"
          danger
          style={{ marginBottom: 10 }}
          disabled={selectedRowKeys.length === 0}
        >
          <DeleteOutlined /> Delete Selected ({selectedRowKeys.length})
        </Button>
      </Popconfirm>

      <DashboardTemplate
        columns={columns}
        formItems={formItems}
        apiURI={"User"}
        title="Accounts"
        customActions={customActions}
        showEditDelete={false}
        dataSource={users}
        form={form}
        resetImage={() => setFileList([])}
        rowSelection={rowSelection}
      />
    </div>
  );
}

export default AccountManagement;
