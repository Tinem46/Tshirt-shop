import {
  DatePicker,
  Form,
  Input,
  InputNumber,
  Checkbox,
  Select,
  Button,
  Drawer,
  Descriptions,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useState } from "react";
import DashboardTemplate from "../../../components/dashboard-template";

const COUPON_TYPE_OPTIONS = [
  { label: "Phần trăm (%)", value: 0 },
  { label: "Tiền mặt (VNĐ)", value: 1 },
];

const ManageCoupon = () => {
  const [drawerRecord, setDrawerRecord] = useState(null);

  // Table chỉ các cột chính, KHÔNG có cột Actions
  const columns = [
    { title: "Code", dataIndex: "code", key: "code" },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (v) => COUPON_TYPE_OPTIONS.find((x) => x.value === v)?.label,
    },
    { title: "Value", dataIndex: "value", key: "value" },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (value) => dayjs(value).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      render: (value) => dayjs(value).format("DD/MM/YYYY HH:mm"),
    },
    // Không cần "Actions" ở đây, DashboardTemplate sẽ tự sinh
  ];

  // Chỉ show nút Xem chi tiết (và các nút mặc định Edit, Delete nếu bạn muốn)

  const customActions = [
    {
      label: <EyeOutlined />,
      condition: () => true,
      action: (_id, record) => {
        // Thêm console.log ở đây để chắc chắn có record!
        console.log("CLICK DETAIL:", _id, record);
        setDrawerRecord(record);
      },
    },
  ];

  // Form tạo/sửa coupon (bạn có thể thêm validate cho chuẩn)
  const formItems = (
    <>
      <Form.Item name="code" label="Code" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="name" label="Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Input.TextArea />
      </Form.Item>
      <Form.Item name="type" label="Type" rules={[{ required: true }]}>
        <Select options={COUPON_TYPE_OPTIONS} placeholder="Chọn loại" />
      </Form.Item>
      <Form.Item
        name="value"
        label="Value"
        rules={[{ required: true, type: "number", min: 0.01 }]}
      >
        <InputNumber min={0.01} step={0.01} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="minOrderAmount" label="Min Order Amount">
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="maxDiscountAmount" label="Max Discount Amount">
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="usageLimit" label="Usage Limit">
        <InputNumber min={1} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="usageLimitPerUser" label="Usage Limit/User">
        <InputNumber min={1} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item
        name="startDate"
        label="Start Date"
        getValueProps={(i) => ({ value: i ? dayjs(i) : null })}
        rules={[{ required: true }]}
      >
        <DatePicker showTime style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item
        name="endDate"
        label="End Date"
        getValueProps={(i) => ({ value: i ? dayjs(i) : null })}
        rules={[{ required: true }]}
      >
        <DatePicker showTime style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item
        name="isFirstTimeUserOnly"
        label="First Time User Only"
        valuePropName="checked"
      >
        <Checkbox />
      </Form.Item>
    </>
  );

  return (
    <>
      <DashboardTemplate
        columns={columns}
        apiURI="Coupons"
        formItems={formItems}
        title="Coupon"
        customActions={customActions}
        // Bạn có thể truyền thêm props nếu muốn show/hide Edit, Delete...
      />
      <Drawer
        title={`Chi tiết Coupon: ${drawerRecord?.name || ""}`}
        open={!!drawerRecord}
        width={480}
        onClose={() => setDrawerRecord(null)}
      >
        {drawerRecord && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">{drawerRecord.id}</Descriptions.Item>
            <Descriptions.Item label="Code">
              {drawerRecord.code}
            </Descriptions.Item>
            <Descriptions.Item label="Name">
              {drawerRecord.name}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {drawerRecord.description}
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              {
                COUPON_TYPE_OPTIONS.find((x) => x.value === drawerRecord.type)
                  ?.label
              }
            </Descriptions.Item>
            <Descriptions.Item label="Value">
              {drawerRecord.value}
            </Descriptions.Item>
            <Descriptions.Item label="Min Order Amount">
              {drawerRecord.minOrderAmount}
            </Descriptions.Item>
            <Descriptions.Item label="Max Discount Amount">
              {drawerRecord.maxDiscountAmount}
            </Descriptions.Item>
            <Descriptions.Item label="Usage Limit">
              {drawerRecord.usageLimit}
            </Descriptions.Item>
            <Descriptions.Item label="Usage Limit Per User">
              {drawerRecord.usageLimitPerUser}
            </Descriptions.Item>
            <Descriptions.Item label="Start Date">
              {dayjs(drawerRecord.startDate).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="End Date">
              {dayjs(drawerRecord.endDate).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="First Time Only">
              {drawerRecord.isFirstTimeUserOnly ? "Yes" : "No"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </>
  );
};

export default ManageCoupon;
