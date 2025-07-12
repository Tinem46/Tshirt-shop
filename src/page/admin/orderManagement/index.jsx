import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import OrderDetails from "../../../components/orderDetails";
import { Button, Modal, Input, Spin } from "antd";
import api from "../../../config/api";
import DashboardTemplate from "../../../components/dashboard-template";
import OrderStatusButton from "../../../components/orderStatusButton";
import OrderFilter from "../../../components/orderFilter";

function OrderManagement() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({
    startDate: null,
    endDate: null,
    sortOrder: "desc",
  });

  // Fetch orders theo filter
  const fetchOrders = async (customFilter = filter) => {
    setLoading(true);
    try {
      const params = {
        PageSize: 100,
        ...(customFilter.startDate && { FromDate: customFilter.startDate }),
        ...(customFilter.endDate && { ToDate: customFilter.endDate }),
        SortBy: "createdDate", // hoặc "createdAt", đúng field backend
        SortDescending: customFilter.sortOrder === "desc",
      };
      const res = await api.get("Orders", { params });
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setOrders(data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [filter]);

  const handleFilter = (newFilter) => setFilter(newFilter);

  const ORDER_STATUS_LABELS_EN = [
    "Pending", // 0
    "Paid (awaiting confirmation)", // 1
    "Completed", // 2
    "Processing", // 3
    "Shipping", // 4
    "Delivered", // 5
    "Cancelled", // 6
    "Returned", // 7
  ];
  function getOrderStatusLabel(status) {
    return ORDER_STATUS_LABELS_EN[status] || `Unknown (${status})`;
  }
  const PAYMENT_STATUS_LABELS_EN = [
    "Unpaid", // 0
    "Processing", // 1
    "Completed", // 2
    "Partially Paid", // 3
    "Refunded", // 4
    "Partially Refunded", // 5
    "Failed", // 6
  ];
  function getPaymentStatusLabel(status) {
    return PAYMENT_STATUS_LABELS_EN[status] || `Unknown (${status})`;
  }

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await api.get(`Orders/${orderId}`);
      setSelectedOrder(response.data);
    } catch (error) {
      toast.error("Failed to fetch order details");
    }
  };

  const handleViewDetails = (order) => {
    fetchOrderDetails(order.id);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setIsDetailsOpen(false);
  };

  const handleRefund = async (orderId) => {
    await api.post(
      `transactions/refund`,
      {},
      {
        params: {
          koiOrderId: Number(orderId),
        },
      }
    );
    toast.success("Order refunded successfully");
    fetchOrders();
  };

  const handleCreateShipping = async (
    orderId,
    tempShippingCode,
    tempDeliveryDate,
    tempDeliveredDate
  ) => {
    Modal.confirm({
      title: "Create Shipping",
      content: (
        <div>
          <Input
            placeholder="Enter shipping code"
            onChange={(e) => {
              tempShippingCode = e.target.value;
            }}
            style={{ marginBottom: "10px" }}
          />
          <Input
            type="date"
            placeholder="Delivery Date"
            onChange={(e) => {
              tempDeliveryDate = e.target.value;
            }}
            style={{ marginBottom: "10px" }}
          />
          <Input
            type="date"
            placeholder="Delivered Date"
            onChange={(e) => {
              tempDeliveredDate = e.target.value;
            }}
          />
        </div>
      ),
      onOk: async () => {
        if (!tempShippingCode?.trim()) {
          toast.error("Please enter a shipping code");
          return;
        }
        try {
          await api.post(`shipping/create/${orderId}`, {
            shippingCode: tempShippingCode,
            deliveryDate: tempDeliveryDate,
            deliveredDate: tempDeliveredDate,
          });
          toast.success("Shipping created successfully");
          fetchOrders();
        } catch (error) {
          toast.error("Failed to create shipping");
        }
      },
      onCancel: () => {},
    });
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
          {[0, 1].includes(record.status) && (
            <OrderStatusButton
              orderId={record.id}
              status={3}
              type="primary"
              style={{ backgroundColor: "#1677ff", color: "#fff" }}
              onSuccess={fetchOrders}
            >
              Đang xử lý
            </OrderStatusButton>
          )}
          {![6].includes(record.status) && (
            <OrderStatusButton
              orderId={record.id}
              status={6}
              type="primary"
              style={{ backgroundColor: "red", color: "#fff" }}
              onSuccess={fetchOrders}
            >
              Hủy đơn
            </OrderStatusButton>
          )}
          {[6].includes(record.status) && (
            <OrderStatusButton
              orderId={record.id}
              status={3}
              type="primary"
              style={{ backgroundColor: "red", color: "#fff" }}
              onSuccess={fetchOrders}
            >
              Reset đơn
            </OrderStatusButton>
          )}
          {[6].includes(record.status) && (
            <Button
              type="default"
              onClick={() => handleRefund(record.id)}
              style={{ backgroundColor: "#faad14", color: "#fff" }}
            >
              Refund
            </Button>
          )}
          {record.orderStatus === "CONFIRMED" && !record.hasShipping && (
            <Button
              type="primary"
              onClick={() => handleCreateShipping(record.id)}
            >
              Tạo vận chuyển
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
          title="Order Management"
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
export default OrderManagement;
