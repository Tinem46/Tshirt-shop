import { UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Form, Input, Radio, message } from "antd";
import React, { useEffect, useState } from "react";
import "./profile.scss";
import api from "../../../config/api";
import { toast } from "react-toastify"

const Profile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(null);

  // ✅ Tải user hiện tại
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

      console.log("✅ Dữ liệu user từ API:", userData);

      setInitialData(userData);


      if (userData) {
        form.setFieldsValue({
          fullName: [userData.firstName, userData.lastName]
            .filter(Boolean)
            .join(" "),
          firstName: userData.firstName ?? "",
          lastName: userData.lastName ?? "",
          gender: userData.gender?.toLowerCase() ?? "",
          email: userData.email ?? "",
        });

        console.log("✅ Form values sau khi set:", form.getFieldsValue());
      }
    } catch (error) {
      console.error("❌ Lỗi khi load user:", error);
      message.error("Không thể tải thông tin người dùng.");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // ✅ Submit cập nhật
  const onFinish = async (values) => {
    setLoading(true);
    console.log("🚀 Giá trị form submit:", values);

    try {
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        gender:
          values.gender === "male"
            ? 0
            : values.gender === "female"
              ? 1
              : 2,
      };

      console.log("📦 Payload gửi PUT /api/Auth/profile:", payload);

      const response = await api.put("/Auth/profile", payload);
      console.log("✅ Kết quả từ API:", response.data);

      toast.success("Cập nhật hồ sơ thành công!");
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật:", err);
      const msg =
        err.response?.data?.message || "Đã xảy ra lỗi khi cập nhật hồ sơ.";
      message.error(msg);
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

            <Form.Item
              label="Giới tính"
              name="gender"
              rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
            >
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
