import { Button, Form, Input, Spin, Select } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { Row, Col } from "antd";
import { useState } from "react";
import AuthLayout from "../../components/auth-layout";
import "./index.scss";
import { toast } from "react-toastify";
import api from "../../config/api";

const { Option } = Select;

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      const apiData = {
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        gender: Number(values.gender),
      };

      const apiResponse = await api.post("Auth/register", apiData);

      toast.success("Đăng ký thành công. Vui lòng xác nhận email.");
      navigate("/confirm-email", {
        state: {
          email: values.email,
          userId: apiResponse.data.userId, // <-- giả sử backend trả về userId
        },
      });
    } catch (err) {
      console.error("Error details:", err);
      toast.error(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Form
        layout="vertical"
        name="register-form"
        onFinish={handleRegister}
        className="register-form"
        data-aos="fade-down"
      >
        <Row gutter={[64, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[
                { required: true, message: "Please input your First Name!" },
              ]}
            >
              <Input placeholder="Enter your First Name" />
            </Form.Item>

            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[
                { required: true, message: "Please input your Last Name!" },
              ]}
            >
              <Input placeholder="Enter your Last Name" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please input your Email!" },
                { type: "email", message: "Invalid email format!" },
              ]}
            >
              <Input placeholder="Enter your Email" />
            </Form.Item>

            <Form.Item
              name="gender"
              label="Gender"
              rules={[
                { required: true, message: "Please select your Gender!" },
              ]}
            >
              <Select placeholder="Select Gender">
                <Option value="0">Male</Option>
                <Option value="1">Female</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please input your password!" },
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
                { required: true, message: "Please confirm your password!" },
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
          </Col>
        </Row>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            disabled={loading}
            className="register-btn"
          >
            {loading ? <Spin size="small" /> : "Register"}
          </Button>
        </Form.Item>

        <Form.Item
          className="signin-link"
          style={{
            marginTop: "10px",
            fontSize: "16px",
            color: "white",
            textAlign: "center",
          }}
        >
          Already have an account? <Link to="/login">Log in</Link>
        </Form.Item>
      </Form>
    </AuthLayout>
  );
}

export default Register;
