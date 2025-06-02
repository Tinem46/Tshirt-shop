
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Form, Input, Radio, Select } from 'antd';
import './profile.scss';

const Profile = () => {
  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Hồ Sơ Của Tôi</h2>
        <p>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
      </div>

      
      <div className="profile-content">
        <Form  className="profile-form">
          <div className="form-main">
            <Form.Item label="Tên đăng nhập">
              <Input value="nghiatin360" disabled />
              <div className="note-text">Tên Đăng nhập chỉ có thể thay đổi một lần.</div>
            </Form.Item>

            <Form.Item label="Tên">
              <Input />
            </Form.Item>

            <Form.Item label="Email" className="change-group">
             <div className="display-row">
                <span className="masked-text">tr******@gmail.com</span>
                <Button type="link" className="change-btn">Thay Đổi</Button>
              </div>
            </Form.Item>

            <Form.Item label="Số điện thoại" className="change-group">
              <div className="display-row">
                <span className="masked-text">********65</span>
                <Button type="link" className="change-btn">Thay Đổi</Button>
              </div>
            </Form.Item>


            <Form.Item label="Giới tính" className="gender-group">
              <Radio.Group>
                <Radio value="male">Nam</Radio>
                <Radio value="female">Nữ</Radio>
                <Radio value="other">Khác</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item label="Ngày sinh" className="birthday-group">
              <div className="select-group">
                <Select placeholder="Ngày">
                  {Array.from({ length: 31 }, (_, i) => (
                    <Select.Option key={i + 1} value={i + 1}>{i + 1}</Select.Option>
                  ))}
                </Select>
                <Select placeholder="Tháng">
                  {Array.from({ length: 12 }, (_, i) => (
                    <Select.Option key={i + 1} value={i + 1}>{i + 1}</Select.Option>
                  ))}
                </Select>
                <Select placeholder="Năm">
                  {Array.from({ length: 100 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return <Select.Option key={year} value={year}>{year}</Select.Option>;
                  })}
                </Select>
              </div>
            </Form.Item>

            <Form.Item>
              <Button type="primary" className="save-btn">Lưu</Button>
            </Form.Item>
          </div>

          <div className="avatar-section">
            <Avatar size={100} icon={<UserOutlined />} />
            <Button type="default" className="select-img-btn">Chọn Ảnh</Button>
            <div className="avatar-hint">
              <p>Dung lượng file tối đa 1 MB</p>
              <p>Định dạng: .JPEG, .PNG</p>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Profile;
