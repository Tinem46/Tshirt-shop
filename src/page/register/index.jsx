import {Button, Form, Input, Spin} from 'antd'

// import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom'; // Add Link to the import
// import api from '../../config/api';
import { Row, Col } from 'antd'; // Make sure this import is present
import { useState } from 'react';
import AuthLayout from '../../components/auth-layout';

function Register() {
    // const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    // const handleRegister = async (values) => {
    //     setLoading(true);
    //     try {

    //         const apiData = {
    //             username: values.username,
    //             fullName: values.fullname, // Note the change from fullname to fullName
    //             password: values.password,
    //             email: values.email,
    //             phone_number: values.phone_number
    //         };
    //         const apiResponse = await api.post("account/register", apiData);

    //         console.log("Response:", apiResponse);
    //         toast.success("Register successful");
    //         navigate("/login");
    //     } catch (err) {
    //         console.error("Error details:", err);

    //         if (err.response) {
    //             console.error("Response data:", err.response.data);
    //             console.error("Response status:", err.response.status);
    //             console.error("Response headers:", err.response.headers);
    //             toast.error(err.response.data?.message || "Register failed");
    //         } else if (err.request) {
    //             console.error("Request:", err.request);
    //             toast.error("No response received from server");
    //         } else {
    //             console.error("Error message:", err.message);
    //             toast.error("An unexpected error occurred");
    //         }

    //         toast.error("Registration failed. Please try again.");

    //     } finally {
    //         setLoading(false);
    //     }
    // }
  return (
    <AuthLayout>
        <div className="login-form">
            <Form
                layout="vertical"
                name="userForm"
                onFinish={()=>alert("Register")}
                className="register-form"
            >
                <Row gutter={[64, 16]}> 
                    <Col xs={24} md={12}>
                       

                        <Form.Item
                            name="username"
                            label="Username"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your Username!',
                                },
                            ]}
                        >
                            <Input placeholder="Enter your Username" />
                        </Form.Item>

                        <Form.Item
                            name="fullname"
                            label="Full Name"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your Full Name!',
                                },
                                {
                                    transform: (value) => value.trim(),
                                    message: 'Full Name cannot be empty!',
                                },
                            ]}
                        >
                            <Input placeholder="Enter your Full Name" />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your Email!',
                                },
                                {
                                    type: 'email',
                                    message: 'Invalid email format!',
                                },
                            ]}
                        >
                            <Input placeholder="Enter your Email" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="phone_number"
                            label="Phone Number"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your Phone number!',
                                },
                                {
                                    pattern: /^(\+84|0)([1-9]{1}[0-9]{8})$/,
                                    message:
                                        'Invalid phone number format! Please use +84 or 0 prefix followed by 9 digits!',
                                },
                            ]}
                        >
                            <Input placeholder="Enter your Phone Number" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your password!',
                                },
                                {
                                    min: 6,
                                    message: 'Password must be at least 6 characters long!',
                                },
                            ]}
                            hasFeedback
                        >
                            <Input.Password placeholder="Enter your Password" />
                        </Form.Item>

                        <Form.Item
                            name="confirm_password"
                            label="Confirm Password"
                            dependencies={['password']}
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: 'Please confirm your password!',
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Passwords do not match!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password placeholder="Confirm your Password" />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item>
                    <Button type="primary" htmlType="submit" block disabled={loading}>{loading ? <Spin size="small" /> : "Register"} </Button>
                </Form.Item>
                <div className="login-link" style={{marginTop: "10px", fontSize: "16px", color: "white",textAlign: "center"}}>
                    Already have an account? <Link to="/login">Log in</Link>
                </div>
            </Form>
        </div>
    </AuthLayout>
  )
}
export default Register
