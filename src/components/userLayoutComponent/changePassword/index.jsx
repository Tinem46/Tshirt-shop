import { Button, Flex, Form, Input, Row } from "antd";
import { useState } from "react";
import "./index.scss"; // Ensure you have the correct path to your CSS file

const ChangePassword = () => {
  const [loading, setLoading] = useState(false);
  return (
    <div className="register1-form">
      <div className="password-header">
        <h2>Thêm mật khẩu</h2>
        <p>Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu</p>
      </div>
      <div className="line3"></div>
      <div className="form-container">
        <Form
          layout="vertical"
          name="userForm"
          onFinish={() => alert("Register")}
          className="register1-form"
        >
          <Form.Item
            name="password"
            label="Password"
            rules={[
              {
                required: true,
                message: "Please input your password!",
              },
              {
                min: 6,
                message: "Password must be at least 6 characters long!",
              },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Enter your Password" />
          </Form.Item>

          <Form.Item
            name="confirm_password"
            label="Confirm Password"
            dependencies={["password"]}
            hasFeedback
            rules={[
              {
                required: true,
                message: "Please confirm your password!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match!"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm your Password" />
          </Form.Item>

          <Form.Item>
            <button
              className="button"
              type="primary"
              htmlType="submit"
              block
              disabled={loading}
            >
              {loading ? <Spin size="small" /> : "Đổi mật khẩu"}{" "}
            </button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ChangePassword;
