import React, { useEffect, useState } from "react";
import { Button, message, Popconfirm } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import "./address.scss";
import { useNavigate } from "react-router-dom";
import { deleteAddress, getUserAddress, setDefaultAddress } from "../../../utils/addressService";
import AddressFormPage from "./AddressFormPage";

const Address = () => {
  const [addresses, setAddresses] = useState([]);
  const [mode, setMode] = useState("list");
  const [editingAddress, setEditingAddress] = useState(null);

  const getAddresses = async () => {
    try {
      const res = await getUserAddress();
      console.log(res);
      setAddresses(res.data.data)
    } catch {
      message.error("Lỗi khi tải địa chỉ");
    }
  }

  useEffect(() => {
    getAddresses();
  }, [])

  const handleEdit = (id) => {
   const found = addresses.find((address) => address.id === id);
   if (found) {
    setEditingAddress(found);
    setMode("edit");
   }
  }

  const handleAdd = () => {
    setMode("create");
    setEditingAddress(null)
  }

  const handleDelete = async (id) => {
    try {
      await deleteAddress(id);
      message.success("xóa địa chỉ thành công");
      getAddresses();
    } catch {
      message.error("Xoá thất bại");
    }
  }

  const handleBack = () => {
    setMode("list");
    setEditingAddress(null);
  }

  const handleRefresh = () => {
    getAddresses();
    handleBack();
  }

  const handleSetDefault = async (id) => {
  try {
    const res = await setDefaultAddress(id);
    console.log("✅ setDefaultAddress response:", res);
    message.success("Đã đặt làm mặc định");
    getAddresses();
  } catch (err) {
    console.error("❌ Lỗi khi đặt mặc định:", err);
    message.error("Không thể đặt mặc định");
  }
};


  return (
    <div className="address-container">
      {mode === "list" ? (
        <>

      <div className="address-header">
        <h2>Địa chỉ của tôi</h2>
        <Button type="primary" icon={<PlusOutlined />} className="add-btn" onClick={handleAdd}>
          Thêm địa chỉ mới
        </Button>
      </div>

      <div className="address-list">
        {addresses.map((address) => (
          <div key={address.id} className="address-item">
            <div className="address-info">
              <div className="name-phone">
                <span className="name">{address.receiverName}</span>
                <span className="phone">{address.phone}</span>
              </div>
              <div className="address-detail">
                <p>{address.detailAddress}</p>
                <p>
                  {address.ward}, {address.district}, {address.province}
                </p>
              </div>
              {address.isDefault && (
                <span className="default-tag">Mặc định</span>
              )}
            </div>
            <div className="address-actions">
              <Button type="link" className="action-btn" onClick={() => handleEdit(address.id)}>
                Cập nhật
              </Button>
              {!address.isDefault && (
                <>
                  <Button type="link" className="action-btn" onClick={() => handleSetDefault(address.id)}>
                    Thiết lập mặc định
                  </Button>

                  <Popconfirm
                    title="Bạn chắc chắn muốn xoá địa chỉ này?"
                    onConfirm={() => handleDelete(address.id)}
                    okText="Xoá"
                    cancelText="Huỷ"
                  >
                    <Button type="link" className="action-btn delete">
                      Xóa
                    </Button>
                  </Popconfirm>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
        </>
      ) : (
        <AddressFormPage
        mode= {mode}
        address={editingAddress}
        onCancel={handleBack}
        onSuccess = {handleRefresh}
        />
      )}

    </div>
  );
};

export default Address;
