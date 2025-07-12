import { useEffect, useState } from "react";
import { Button, Modal, Spin } from "antd";
import { toast } from "react-toastify";
import api from "../../../config/api";
import DashboardTemplate from "../../../components/dashboard-template";
import OrderDetails from "../../../components/orderDetails";
import OrderFilter from "../../../components/orderFilter";

function CancelledOrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Lưu filter để gọi lại khi lọc
  const [filter, setFilter] = useState({
    startDate: null,
    endDate: null,
    sortOrder: "desc",
  });

  // Fetch Cancelled Orders có filter ngày/sort
  const fetchCancelledOrders = async (customFilter = filter) => {
    setLoading(true);
    const MIN_LOADING_TIME = 1200; // Tăng độ trễ loading (ms)
    const start = Date.now();
    try {
      const params = {
        Status: 6,
        PageSize: 100,
        ...(customFilter.startDate && { FromDate: customFilter.startDate }),
        ...(customFilter.endDate && { ToDate: customFilter.endDate }),
        SortBy: "createdDate",
        SortDescending: customFilter.sortOrder === "desc",
      };
      const res = await api.get("Orders", { params });
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setOrders(data);
    } catch (err) {
      toast.error("Failed to fetch cancelled orders");
    } finally {
      const elapsed = Date.now() - start;
      if (elapsed < MIN_LOADING_TIME) {
        setTimeout(() => setLoading(false), MIN_LOADING_TIME - elapsed);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchCancelledOrders();
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

  const handleRefund = async (orderId) => {
    try {
      await api.post(
        `transactions/refund`,
        {},
        {
          params: {
            koiOrderId: Number(orderId),
          },
        }
      );
      toast.success("Order refunded successfully!");
      fetchCancelledOrders();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to refund order");
    }
  };

  const getPaymentStatusLabel = (status) => {
    switch (status) {
      case 0:
        return "Unpaid";
      case 1:
        return "Processing";
      case 2:
        return "Completed";
      case 3:
        return "Partially Paid";
      case 4:
        return "Refunded";
      case 5:
        return "Partially Refunded";
      case 6:
        return "Failed";
      default:
        return status;
    }
  };

  const getOrderStatusLabel = (status) => {
    switch (status) {
      case 0:
        return "Pending";
      case 1:
        return "Paid (awaiting confirmation)";
      case 2:
        return "Completed";
      case 3:
        return "Processing";
      case 4:
        return "Shipping";
      case 5:
        return "Delivered";
      case 6:
        return "Cancelled";
      case 7:
        return "Returned";
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
      title: "Payment Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status) => getPaymentStatusLabel(status),
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
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          {record.paymentStatus === 2 && (
            <Button
              type="primary"
              style={{ backgroundColor: "#faad14", color: "#fff" }}
              onClick={() => handleRefund(record.id)}
            >
              Refund
            </Button>
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
          title="Cancelled Orders"
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

export default CancelledOrdersManagement;
