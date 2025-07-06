import { Button, Flex, Form, Input, Row, Spin } from "antd";
import { useState } from "react";
import "./index.scss"; // Ensure you have the correct path to your CSS file
import api from "../../../config/api";
import { toast } from "react-toastify";

const ChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const changePassword = async (values) => {
    setLoading(true);
    const apiData = {
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
      confirmPassword: values.confirmPassword,
    };
    try {
      const res = await api.post("Auth/change-password", apiData);
      console.log("Response:", res);
      if (res.status === 200) {
        toast.success("Đổi mật khẩu thành công!");
      } else {
        const data = await res.json();
        toast.error(data.message || "Đổi mật khẩu thất bại!");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    }
    setLoading(false);
  };
  return (
    <div className="register1-form">
      <div className="password-header">
        <h2>Đổi mật khẩu</h2>
        <p>Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu</p>
      </div>
      <div className="line3"></div>
      <div className="form-container">
        <Form
          layout="vertical"
          name="changePasswordForm"
          onFinish={changePassword}
          className="register1-form"
        >
          <Form.Item
            name="oldPassword"
            label="Mật khẩu cũ"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ!" }]}
            hasFeedback
          >
            <Input.Password placeholder="Nhập mật khẩu cũ" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={["newPassword"]}
            hasFeedback
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp!")
                  );
                },
              }),
            ]}
          >
            <Input.Password placeholder="Xác nhận mật khẩu mới" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block disabled={loading}>
              {loading ? <Spin size="small" /> : "Đổi mật khẩu"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ChangePassword;
