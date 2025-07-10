import { useState } from "react";
import { Button, Form, Input, Spin } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import AuthLayout from "../../components/auth-layout";
import api from "../../config/api";

function ResetPassword() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token") || localStorage.getItem("resetToken");
  const email = queryParams.get("email") || localStorage.getItem("resetEmail");
  console.log("Token from URL:", token);

  const handleResetPassword = async () => {
    setLoading(true);
    const data = {
      email: email,
      token: token,

      newPassword: password,
    };
    localStorage.setItem("token", token);
    console.log("Data:", data);
    try {
      const response = await api.post("Auth/reset-password", data);
      console.log(response.data);
      navigate("/login");
      toast.success(
        "Password reset successfully. Please log in with your new password."
      );
    } catch (error) {
      console.error("Error response:", error.response);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Form
        layout="vertical"
        onFinish={handleResetPassword}
        className="login-form"
        data-aos="fade-up"
      >
        <Form.Item
          name="password"
          rules={[
            { required: true, message: "Please enter your new password" },
          ]}
        >
          <Input.Password
            placeholder="New Password"
            visibilityToggle={{
              visible: passwordVisible,
              onVisibleChange: setPasswordVisible,
            }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Item>

        <Form.Item
          name="repeatPassword"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Please confirm your new password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("The two passwords do not match")
                );
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="Confirm Password"
            visibilityToggle={{
              visible: confirmPasswordVisible,
              onVisibleChange: setConfirmPasswordVisible,
            }}
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            disabled={loading}
            style={{
              background: "#fff",
              color: "#111",
              border: "1px solid #111",
              fontWeight: 600,
              transition: "all .2s",
            }}
          >
            {loading ? <Spin size="small" /> : "Reset Password"}
          </Button>
        </Form.Item>
      </Form>
    </AuthLayout>
  );
}

export default ResetPassword;
