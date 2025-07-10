import { Input, Button, Switch, Form, message, Select } from "antd"
import { useEffect, useState } from "react";
import { createAddress, updateAddress } from "../../../utils/addressService";
import "./address-form.scss";
import { getDistrictsByProvince, getProvinces, getWardsByDistrict } from "../../../utils/vnLocationService";
import { toast } from "react-toastify";

const AddressFormPage = ({ mode, address, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(null);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    useEffect(() => {
        if (mode === "edit" && address) {
            form.setFieldsValue(address);
        }
    }, [mode, address])


    useEffect(() => {
        getProvinces().then(res => setProvinces(res.data));
    }, [])

    const onFinish = async (values) => {
        const { phone } = values;
        if (!phone?.trim()) {
            toast.error("Vui lòng nhập số điện thoại");
            return;
        }

        if (!/^(0|\+84)(3[2-9]|5[6-9]|7[0-9]|8[1-9]|9[0-9])[0-9]{7,8}$/.test(phone)) {
            toast.error("Số điện thoại không hợp lệ");
            return;
        }
        try {
            setLoading(true);
            if (mode === "edit") {
                await updateAddress(address.id, values);
                message.success("thêm địa chỉ thành công!");
            } else {
                await createAddress(values);
                message.success("Thêm địa chỉ thành công!");
            }
            onSuccess();
        } catch {
            message.error("Đã có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    }

    const handleProvinceChange = async (provinceName) => {
        const province = provinces.find(p => p.name === provinceName);
        if (!province) {
            return;
        }
        form.setFieldsValue({ district: null, ward: null });
        const res = await getDistrictsByProvince(province.code);
        console.log("District:" + res);

        setDistricts(res.data.districts);
        setWards([]);
    }

    const handleDistrictChange = async (districtName) => {
        const district = districts.find(d => d.name === districtName);
        if (!district) return;

        form.setFieldsValue({ ward: null });
        const res = await getWardsByDistrict(district.code);
        setWards(res.data.wards);
    };



    return (
        <div className="address-form-page">
            <h2>{mode === "edit" ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}</h2>
            <Form layout="vertical" form={form} onFinish={onFinish}>
                <div className="address-form-grid">
                    <Form.Item name="receiverName" label="Tên người nhận" rules={[{ required: true }]}>
                        <Input placeholder="VD: Nguyễn Văn A" />
                    </Form.Item>

                    <Form.Item name="phone" label="Số điện thoại" >
                        <Input placeholder="0964xxxxxx" />
                    </Form.Item>

                    <Form.Item name="detailAddress" label="Địa chỉ cụ thể" rules={[{ required: true }]}>
                        <Input placeholder="Số nhà, tên đường..." />
                    </Form.Item>

                    <Form.Item name="province" label="Tỉnh / Thành phố" rules={[{ required: true }]}>
                        <Select onChange={handleProvinceChange} placeholder="Chọn tỉnh">
                            {provinces.map(p => (
                                <Select.Option key={p.code} value={p.name}>{p.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="district" label="Quận / Huyện" rules={[{ required: true }]}>
                        <Select onChange={handleDistrictChange} placeholder="Chọn huyện" disabled={!districts.length}  >
                            {districts.map(d => (
                                <Select.Option key={d.code} value={d.name}>{d.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="ward" label="Phường / Xã" rules={[{ required: true }]}>
                        <Select placeholder="Chọn phường" disabled={!wards.length}>
                            {wards.map(w => (
                                <Select.Option key={w.code} value={w.name}>{w.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                </div>

                <Form.Item
                    name="isDefault"
                    label="Thiết lập làm địa chỉ mặc định"
                    valuePropName="checked"
                    className="address-form-default"
                >
                    <Switch />
                </Form.Item>

                <div className="address-form-actions">
                    <Button type="default" onClick={onCancel}>
                        Hủy
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        {mode === "edit" ? "Cập nhật" : "Thêm mới"}
                    </Button>
                </div>
            </Form>
        </div>
    )
}
export default AddressFormPage;