import { useEffect, useState } from "react";
import { Button, Modal, Spin } from "antd";
import { toast } from "react-toastify";
import api from "../../../config/api";
import DashboardTemplate from "../../../components/dashboard-template";
import OrderStatusButton from "../../../components/orderStatusButton";
import OrderDetails from "../../../components/orderDetails";
import OrderFilter from "../../../components/orderFilter";

function ShippingManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({
    startDate: null,
    endDate: null,
    sortOrder: "desc",
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Fetch orders có status = 2, 3, 4 (Completed, Processing, Shipping) theo filter
  const fetchOrders = async (customFilter = filter) => {
    setLoading(true);
    try {
      // API chỉ filter được 1 status/lần, nên Promise.all
      const [res3, res4, res2, res5] = await Promise.all([
        api.get("Orders", {
          params: {
            Status: 3,
            PageSize: 100,
            ...(customFilter.startDate && { FromDate: customFilter.startDate }),
            ...(customFilter.endDate && { ToDate: customFilter.endDate }),
            SortBy: "createdDate",
            SortDescending: customFilter.sortOrder === "desc",
          },
        }),
        api.get("Orders", {
          params: {
            Status: 4,
            PageSize: 100,
            ...(customFilter.startDate && { FromDate: customFilter.startDate }),
            ...(customFilter.endDate && { ToDate: customFilter.endDate }),
            SortBy: "createdDate",
            SortDescending: customFilter.sortOrder === "desc",
          },
        }),
        api.get("Orders", {
          params: {
            Status: 2,
            PageSize: 100,
            ...(customFilter.startDate && { FromDate: customFilter.startDate }),
            ...(customFilter.endDate && { ToDate: customFilter.endDate }),
            SortBy: "createdDate",
            SortDescending: customFilter.sortOrder === "desc",
          },
        }),
        api.get("Orders", {
          params: {
            Status: 5,
            PageSize: 100,
            ...(customFilter.startDate && { FromDate: customFilter.startDate }),
            ...(customFilter.endDate && { ToDate: customFilter.endDate }),
            SortBy: "createdDate",
            SortDescending: customFilter.sortOrder === "desc",
          },
        }),
      ]);
      const data3 = Array.isArray(res3.data)
        ? res3.data
        : res3.data?.data || [];
      const data4 = Array.isArray(res4.data)
        ? res4.data
        : res4.data?.data || [];
      const data2 = Array.isArray(res2.data)
        ? res2.data
        : res2.data?.data || [];
      const data5 = Array.isArray(res5.data)
        ? res5.data
        : res5.data?.data || [];
      setOrders([...data3, ...data4, ...data2, ...data5]);
    } catch (err) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [filter]);

  const handleFilter = (newFilter) => setFilter(newFilter);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };
  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setIsDetailsOpen(false);
  };

  const getOrderStatusLabel = (status) => {
    switch (status) {
      case 2:
        return "Completed";
      case 3:
        return "Processing";
      case 4:
        return "Shipping";
      case 5:
        return "Delivered";
      default:
        return status;
    }
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Customer",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (text) => `${parseFloat(text).toLocaleString("vi-VN")}đ`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getOrderStatusLabel(status),
    },
    {
      title: "View Details",
      key: "viewDetails",
      render: (text, record) => (
        <Button
          onClick={() => handleViewDetails(record)}
          style={{
            backgroundColor: "#1890ff",
            color: "#fff",
          }}
        >
          View Details
        </Button>
      ),
    },
    {
      title: "Shipping Action",
      key: "shippingAction",
      render: (text, record) =>
        record.status === 3 ? (
          <OrderStatusButton
            orderId={record.id}
            status={4}
            type="primary"
            style={{ backgroundColor: "#52c41a", color: "#fff" }}
            onSuccess={fetchOrders}
          >
            Chuyển sang Shipping
          </OrderStatusButton>
        ) : record.status === 4 ? (
          <Button disabled style={{ background: "#d9d9d9", color: "#888" }}>
            Đã Shipping
          </Button>
        ) : null,
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          {/* Nếu status là Delivered thì show nút chuyển sang Completed */}
          {record.status === 5 && (
            <OrderStatusButton
              orderId={record.id}
              status={2}
              type="primary"
              style={{ backgroundColor: "#52c41a", color: "#fff" }}
              onSuccess={fetchOrders}
            >
              Hoàn thành đơn
            </OrderStatusButton>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <OrderFilter onFilter={handleFilter} loading={loading} />
      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <DashboardTemplate
          columns={columns}
          dataSource={orders}
          title="Shipping Management"
          loading={loading}
          disableCreate={true}
          showEditDelete={false}
        />
      </Spin>
      <Modal
        open={isDetailsOpen}
        onCancel={handleCloseDetails}
        footer={null}
        width={900}
        title="Order Details"
        destroyOnClose
      >
        {selectedOrder && (
          <OrderDetails
            selectedOrder={selectedOrder}
            onClose={handleCloseDetails}
            onPreview={(image) => console.log("Preview image:", image)}
            isCareManagement={false}
          />
        )}
      </Modal>
    </div>
  );
}

export default ShippingManagement;
