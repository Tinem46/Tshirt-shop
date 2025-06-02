
import React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './address.scss';

const Address = () => {
  const addresses = [
    {
      id: 1,
      name: 'Tín nghĩa',
      phone: '(+84) 964 889 265',
      address: '15/9 Hẻm 33 Nguyễn Xiển',
      ward: 'Phường Long Thạnh Mỹ',
      district: 'Thành Phố Thủ Đức',
      city: 'TP. Hồ Chí Minh',
      isDefault: true
    },
    {
      id: 2,
      name: 'Đoàn Tín Nghĩa',
      phone: '(+84) 964 889 265',
      address: 'Hẻm 86, Ấp 2',
      ward: 'Xã An Phước',
      district: 'Huyện Long Thành',
      city: 'Đồng Nai',
      isDefault: false
    }
  ];

  return (
    <div className="address-container">
      <div className="address-header">
        <h2>Địa chỉ của tôi</h2>
        <Button type="primary" icon={<PlusOutlined />} className="add-btn">
          Thêm địa chỉ mới
        </Button>
      </div>

      <div className="address-list">
        {addresses.map(address => (
          <div key={address.id} className="address-item">
            <div className="address-info">
              <div className="name-phone">
                <span className="name">{address.name}</span>
                <span className="phone">{address.phone}</span>
              </div>
              <div className="address-detail">
                <p>{address.address}</p>
                <p>{address.ward}, {address.district}, {address.city}</p>
              </div>
              {address.isDefault && <span className="default-tag">Mặc định</span>}
            </div>
            <div className="address-actions">
              <Button type="link" className="action-btn">Cập nhật</Button>
              {!address.isDefault && (
                <>
                  <Button type="link" className="action-btn">Thiết lập mặc định</Button>
                  <Button type="link" className="action-btn delete">Xóa</Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Address;
