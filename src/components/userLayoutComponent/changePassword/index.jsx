import { Button, Form, Input, Spin } from "antd";
import { useState } from "react";
import "./index.scss";
import api from "../../../config/api";
import { toast } from "react-toastify";

const ChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const changePassword = async (values) => {
    // ✅ Check mật khẩu mới có trùng mật khẩu cũ không
    if (values.oldPassword === values.newPassword) {
      toast.error("Mật khẩu mới không được trùng với mật khẩu cũ!");
      return;
    }

    setLoading(true);
    const apiData = {
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
      confirmPassword: values.confirmPassword,
    };
    try {
      const res = await api.post("Auth/change-password", apiData);
      console.log("Change password response:", res);
      if (res.data?.isSuccess) {
        toast.success(res.data?.data || "Đổi mật khẩu thành công!");
        console.log("RESET FORM");
        form.resetFields();
        console.log("AFTER RESET", form.getFieldsValue()); // log sau
      } else {
        toast.error(res.data?.message || "Đổi mật khẩu thất bại!");
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
      <div className="form-container1 ">
        <Form
          form={form}
          layout="vertical"
          name="changePasswordForm"
          onFinish={changePassword}
          className="register1-form"
          autoComplete="off" // Có thể giúp thêm nhưng không đủ, vẫn cần input ẩn
        >
          {/* Các input ẩn để chặn Chrome autofill */}
          <input
            type="text"
            name="fakeusernameremembered"
            style={{ display: "none" }}
          />
          <input
            type="password"
            name="fakepasswordremembered"
            style={{ display: "none" }}
          />

          <Form.Item
            name="oldPassword"
            label="Mật khẩu cũ"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ!" }]}
            hasFeedback
          >
            <Input.Password
              placeholder="Nhập mật khẩu cũ"
              autoComplete="new-password"
            />
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
            <Input.Password
              placeholder="Nhập mật khẩu mới"
              autoComplete="new-password"
            />
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
            <Input.Password
              placeholder="Xác nhận mật khẩu mới"
              autoComplete="new-password"
            />
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
