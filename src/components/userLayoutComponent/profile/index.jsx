import { UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Form, Input, Radio, message } from "antd";
import React, { useEffect, useState } from "react";
import "./profile.scss";
import api from "../../../config/api";

const Profile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(null);

  // Lấy dữ liệu từ API GET /account
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("Bạn cần đăng nhập để truy cập hồ sơ.");
        return;
      }
      const response = await api.get("Auth/current-user");
      const userApiResponse = response.data;
      const userData = userApiResponse.data;
      setInitialData(userData);

      // Lưu userId nếu muốn
      if (userData?.id) {
        localStorage.setItem("userid", userData.id);
      }

      if (userData) {
        form.setFieldsValue({
          fullName: [userData.firstName, userData.lastName]
            .filter(Boolean)
            .join(" "),
          firstName: userData.firstName ?? "",
          lastName: userData.lastName ?? "",
          gender: userData.gender?.toLowerCase() ?? "",
          email: userData.email ?? "",
          phoneNumber: userData.phoneNumber ?? "",
          Address: userData.address ?? "",
        });

        console.log("✅ Form values after set:", form.getFieldsValue());
      }
    } catch (error) {
      console.error("❌ Failed to load user", error);
      message.error("Không thể tải thông tin người dùng.");
    }
  };

  // Gọi khi component mount
  useEffect(() => {
    fetchUser();
  }, []);

  // Gọi API PUT để cập nhật
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: initialData.email,
        phoneNumber: initialData.phoneNumber,
        gender:
          values.gender === "male" ? 0 : values.gender === "female" ? 1 : 2,
        defaultAddress: values.Address ?? "",
      };

      await api.put("Account/account", payload);
      message.success("Cập nhật thông tin thành công!");
    } catch (err) {
      console.error("❌ Update failed:", err);
      message.error("Lỗi khi cập nhật hồ sơ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Hồ Sơ Của Tôi</h2>
        <p>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
      </div>

      <div className="profile-content">
        <Form
          className="profile-form"
          form={form}
          onFinish={onFinish}
          layout="vertical"
        >
          <div className="form-main">
            <Form.Item label="Full Name" name="fullName">
              <Input disabled />
            </Form.Item>

            <Form.Item
              label="Tên"
              name="firstName"
              rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Họ"
              name="lastName"
              rules={[{ required: true, message: "Vui lòng nhập họ!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item label="Email" name="email">
              <Input disabled />
            </Form.Item>

            <Form.Item label="Giới tính" name="gender">
              <Radio.Group>
                <Radio value="male">Nam</Radio>
                <Radio value="female">Nữ</Radio>
                <Radio value="other">Khác</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="save-btn"
              >
                Lưu
              </Button>
            </Form.Item>
          </div>

        
        </Form>
      </div>
    </div>
  );
};

export default Profile;
