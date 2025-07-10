import { Form, Input, Button, Spin } from "antd";
import { toast } from "react-toastify";
import { useState } from "react";
import api from "../../config/api";
import AuthLayout from "../../components/auth-layout";

function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false); // Thêm state này

  const handleSubmit = async (values) => {
    setLoading(true);
    const { email } = values;
    try {
      const response = await api.post(`Auth/forgot-password`, { email });
      const token = response.data.token;
      localStorage.setItem("resetToken", token);
      console.log(response.data);
      toast.success("Email sent successfully. Please check your inbox.");
      setSent(true); // Khóa nút lại sau khi gửi thành công
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error sending email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AuthLayout>
        <Form layout="vertical" onFinish={handleSubmit} className="login-form" data-aos ="fade-down">
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Please enter your email" }]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>
          <Button
            type="default"
            htmlType="submit"
            block
            disabled={loading || sent}
            style={{
              background: "#fff",
              color: "#111",
              border: "1px solid #111",
              fontWeight: 600,
              transition: "all .2s",
            }}
          >
            {loading ? <Spin size="small" /> : "Send by Email"}
          </Button>
        </Form>
      </AuthLayout>
    </div>
  );
}

export default ForgotPassword;
