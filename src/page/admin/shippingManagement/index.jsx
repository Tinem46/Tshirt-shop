import {
  Form,
  Input,
  InputNumber,
  Checkbox,
  Button,
  Drawer,
  Descriptions,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useState } from "react";
import DashboardTemplate from "../../../components/dashboard-template";

const SHIPPING_API = "/admin/shipping-methods";

const ShippingManagement = () => {
  const [drawerRecord, setDrawerRecord] = useState(null);

  // Các cột chính
  const columns = [
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    {
      title: "Phí",
      dataIndex: "fee",
      key: "fee",
      render: (v) => `${Number(v).toLocaleString("vi-VN")}đ`,
    },
    {
      title: "Ngưỡng Free Ship",
      dataIndex: "freeShippingThreshold",
      key: "freeShippingThreshold",
      render: (v) => (v ? `${Number(v).toLocaleString("vi-VN")}đ` : "-"),
    },
    {
      title: "Ngày giao dự kiến",
      dataIndex: "estimatedDays",
      key: "estimatedDays",
      render: (v) => (v ? `${v} ngày` : "-"),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (v) => (v ? "Hoạt động" : "Tạm dừng"),
    },
  ];

  // Nút "Xem chi tiết"
  const customActions = [
    {
      label: <EyeOutlined />,
      condition: () => true,
      action: (_id, record) => setDrawerRecord(record),
    },
  ];

  // Form tạo/sửa shipping method
  const formItems = (
    <>
      <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Mô tả">
        <Input.TextArea />
      </Form.Item>
      <Form.Item
        name="fee"
        label="Phí vận chuyển (VNĐ)"
        rules={[{ required: true, type: "number", min: 0 }]}
      >
        <InputNumber min={0} step={1000} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item
        name="freeShippingThreshold"
        label="Ngưỡng miễn phí vận chuyển (VNĐ)"
      >
        <InputNumber min={0} step={1000} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item
        name="estimatedDays"
        label="Ngày giao dự kiến"
        rules={[{ required: true, type: "number", min: 1 }]}
      >
        <InputNumber min={1} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="minDeliveryDays" label="Số ngày giao tối thiểu">
        <InputNumber min={1} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="maxDeliveryDays" label="Số ngày giao tối đa">
        <InputNumber min={1} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item
        name="isActive"
        label="Kích hoạt"
        valuePropName="checked"
        initialValue={true}
      >
        <Checkbox />
      </Form.Item>
      <Form.Item name="sortOrder" label="Thứ tự ưu tiên">
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>
    </>
  );

  return (
    <>
      <DashboardTemplate
        columns={columns}
        apiURI={SHIPPING_API}
        formItems={formItems}
        title="Shipping Method"
        customActions={customActions}
      />
      <Drawer
        title={`Chi tiết phương thức vận chuyển`}
        open={!!drawerRecord}
        width={520}
        onClose={() => setDrawerRecord(null)}
      >
        {drawerRecord && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">{drawerRecord.id}</Descriptions.Item>
            <Descriptions.Item label="Tên">
              {drawerRecord.name}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {drawerRecord.description}
            </Descriptions.Item>
            <Descriptions.Item label="Phí vận chuyển">
              {Number(drawerRecord.fee).toLocaleString("vi-VN")}đ
            </Descriptions.Item>
            <Descriptions.Item label="Ngưỡng free ship">
              {drawerRecord.freeShippingThreshold
                ? `${Number(drawerRecord.freeShippingThreshold).toLocaleString(
                    "vi-VN"
                  )}đ`
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày giao dự kiến">
              {drawerRecord.estimatedDays} ngày
            </Descriptions.Item>
            <Descriptions.Item label="Giao nhanh nhất">
              {drawerRecord.minDeliveryDays} ngày
            </Descriptions.Item>
            <Descriptions.Item label="Giao chậm nhất">
              {drawerRecord.maxDeliveryDays} ngày
            </Descriptions.Item>
            <Descriptions.Item label="Thứ tự ưu tiên">
              {drawerRecord.sortOrder}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {drawerRecord.isActive ? "Hoạt động" : "Tạm dừng"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {drawerRecord.createdAt}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sửa">
              {drawerRecord.updatedAt}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </>
  );
};

export default ShippingManagement;
