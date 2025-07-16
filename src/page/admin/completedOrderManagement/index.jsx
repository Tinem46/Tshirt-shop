import { useEffect, useState } from "react";
import { Button, Modal, Spin } from "antd";
import { toast } from "react-toastify";
import api from "../../../config/api";
import DashboardTemplate from "../../../components/dashboard-template";
import OrderDetails from "../../../components/orderDetails";
import OrderFilter from "../../../components/orderFilter";

function CompletedOrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // State filter
  const [filter, setFilter] = useState({
    startDate: null,
    endDate: null,
    sortOrder: "desc",
  });

  // Fetch only Completed orders (status = 2)
  const fetchCompletedOrders = async (customFilter = filter) => {
    setLoading(true);
    const MIN_LOADING_TIME = 1200; // ms (1.2s)
    const start = Date.now();
    try {
      const params = {
        Status: 2,
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
      toast.error("Failed to fetch completed orders");
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
    fetchCompletedOrders();
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
      render: () => "Completed",
    },
    {
      title: "Payment Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: () => "Completed",
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
  ];

  return (
    <div>
      <OrderFilter onFilter={handleFilter} loading={loading} />
      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <DashboardTemplate
          columns={columns}
          dataSource={orders}
          title="Completed Orders"
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

export default CompletedOrdersManagement;
