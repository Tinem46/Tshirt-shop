import { Tag, Button, Select, Image, Popconfirm, Space } from "antd";
import { useState } from "react";
import DesignStatusButton from "../../../components/designStatusButton";
import DashboardTemplate from "../../../components/dashboard-template";
import FormatCost from "../../../components/formatCost";
import { toast } from "react-toastify";
import api from "../../../config/api";
import { DeleteOutlined } from "@ant-design/icons";

// Enum mapping
const DESIGN_STATUS = {
  0: { label: "Draft", color: "default" },
  1: { label: "Liked", color: "pink" },
  2: { label: "Accepted", color: "blue" },
  3: { label: "Request", color: "gold" },
  4: { label: "Order", color: "cyan" },
  5: { label: "Shipping", color: "purple" },
  6: { label: "Delivered", color: "green" },
  7: { label: "Done", color: "success" },
  8: { label: "Rejected", color: "red" },
};

export default function CustomDesignManagement() {
  const [statusFilter, setStatusFilter] = useState();
  const [refreshKey, setRefreshKey] = useState(0); // Dùng để ép DashboardTemplate re-fetch

  // Xóa thiết kế (chỉ với trạng thái Done/Rejected)
  const handleDeleteDesign = async (id) => {
    try {
      await api.delete(`CustomDesign/${id}`);
      toast.success("Đã xóa thiết kế thành công!");
      setRefreshKey((k) => k + 1); // ép refetch lại data
    } catch (err) {
      toast.error("Xóa thất bại!");
    }
  };

  // Cột Table
  const columns = [
    {
      title: "Ảnh",
      dataIndex: "designImageUrl",
      render: (url) =>
        url ? (
          <Image
            src={url}
            width={56}
            height={56}
            style={{ objectFit: "cover", borderRadius: 8 }}
          />
        ) : (
          <span>—</span>
        ),
      width: 100,
      align: "center",
    },
    {
      title: "Tên Thiết Kế",
      dataIndex: "designName",
      width: 200,
      ellipsis: true,
      align: "center",
    },
    {
      title: "Prompt",
      dataIndex: "promptText",
      width: 300,
      ellipsis: true,
      align: "center",
    },
    {
      title: "Giá",
      dataIndex: "totalPrice",
      render: (v) => <FormatCost value={v} />,
      width: 120,
      align: "center",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      render: (val) => new Date(val).toLocaleString("vi-VN"),
      width: 140,
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => (
        <Tag color={DESIGN_STATUS[status]?.color}>
          {DESIGN_STATUS[status]?.label}
        </Tag>
      ),
      filters: Object.entries(DESIGN_STATUS).map(([k, v]) => ({
        text: v.label,
        value: Number(k),
      })),
      onFilter: (v, r) => r.status === v,
      width: 120,
      align: "center",
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 240,
      render: (_, record) => (
        <Space>
          {/* Duyệt: chỉ cho status = 1 */}
          {[1].includes(record.status) && (
            <DesignStatusButton
              designId={record.id}
              status={2}
              onSuccess={() => {
                toast.success("Đã duyệt thiết kế!");
                setRefreshKey((k) => k + 1);
              }}
            >
              Duyệt
            </DesignStatusButton>
          )}
          {/* Request: chỉ cho status = 2 */}
          {[2].includes(record.status) && (
            <DesignStatusButton
              designId={record.id}
              status={3}
              onSuccess={() => {
                toast.success("Vui lòng kiểm tra email để xác nhận đơn!");
                setRefreshKey((k) => k + 1);
              }}
            >
              Đặt hàng
            </DesignStatusButton>
          )}
          {/* Order: chỉ cho status = 3 */}
          {[3].includes(record.status) && (
            <DesignStatusButton
              designId={record.id}
              status={4}
              onSuccess={() => {
                toast.success("Đã chuyển sang trạng thái Order!");
                setRefreshKey((k) => k + 1);
              }}
            >
              Order
            </DesignStatusButton>
          )}
          {/* Shipping: chỉ cho status = 4 */}
          {[4].includes(record.status) && (
            <DesignStatusButton
              designId={record.id}
              status={5}
              onSuccess={() => {
                toast.success("Đã chuyển sang trạng thái Shipping!");
                setRefreshKey((k) => k + 1);
              }}
            >
              Shipping
            </DesignStatusButton>
          )}
          {/* Delivered: chỉ cho status = 5 */}
          {[5].includes(record.status) && (
            <DesignStatusButton
              designId={record.id}
              status={6}
              onSuccess={() => {
                toast.success("Đã chuyển sang trạng thái Delivered!");
                setRefreshKey((k) => k + 1);
              }}
            >
              Delivered
            </DesignStatusButton>
          )}
          {/* Done: chỉ cho status = 6 */}
          {[6].includes(record.status) && (
            <DesignStatusButton
              designId={record.id}
              status={7}
              onSuccess={() => {
                toast.success("Đã chuyển sang trạng thái Done!");
                setRefreshKey((k) => k + 1);
              }}
            >
              Done
            </DesignStatusButton>
          )}
          {/* Từ chối: chỉ cho status < 6 */}
          {[0, 1, 2, 3, 4, 5].includes(record.status) && (
            <DesignStatusButton
              designId={record.id}
              status={8}
              danger
              onSuccess={() => {
                toast.success("Đã từ chối thiết kế!");
                setRefreshKey((k) => k + 1);
              }}
            >
              Từ chối
            </DesignStatusButton>
          )}
        </Space>
      ),
    },
    {
      title: "Xóa",
      key: "delete",
      align: "center",
      width: 80,
      render: (_, record) =>
        [7, 8].includes(record.status) && (
          <Popconfirm
            title="Bạn chắc chắn muốn xóa thiết kế này?"
            onConfirm={() => handleDeleteDesign(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              danger
              icon={<DeleteOutlined style={{ fontSize: 16, color: "red" }} />}
            />
          </Popconfirm>
        ),
    },
  ];

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 24, display: "flex", gap: 16 }}>
        <Select
          placeholder="Lọc theo trạng thái"
          allowClear
          style={{ minWidth: 200 }}
          value={statusFilter}
          onChange={setStatusFilter}
          options={Object.entries(DESIGN_STATUS).map(([k, v]) => ({
            label: v.label,
            value: Number(k),
          }))}
        />
      </div>
      <DashboardTemplate
        key={refreshKey + "-" + (statusFilter ?? "all")}
        title="Custom Design"
        columns={columns}
        apiURI={
          statusFilter !== undefined
            ? (method) => `CustomDesign/filter?Status=${statusFilter}`
            : "CustomDesign/filter"
        }
        disableCreate
        showEditDelete={false}
        enableBulk={false}
        // Các props khác...
      />
    </div>
  );
}
