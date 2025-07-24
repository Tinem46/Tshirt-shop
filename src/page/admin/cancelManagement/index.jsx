import { useEffect, useState } from "react";
import { Button, Modal, Spin } from "antd";
import { toast } from "react-toastify";
import api from "../../../config/api";
import DashboardTemplate from "../../../components/dashboard-template";
import OrderDetails from "../../../components/orderDetails";
import OrderFilter from "../../../components/orderFilter";
import Swal from "sweetalert2";

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
    const MIN_LOADING_TIME = 1200;
    const start = Date.now();
    try {
      const baseParams = {
        PageSize: 100,
        ...(customFilter.startDate && { FromDate: customFilter.startDate }),
        ...(customFilter.endDate && { ToDate: customFilter.endDate }),
        SortBy: "createdDate",
        SortDescending: customFilter.sortOrder === "desc",
      };

      const [res6, res8] = await Promise.all([
        api.get("Orders", { params: { ...baseParams, Status: 6 } }),
        api.get("Orders", { params: { ...baseParams, Status: 8 } }),
      ]);
      // Gộp kết quả, loại bỏ trùng lặp (nếu có)
      const data6 = Array.isArray(res6.data)
        ? res6.data
        : res6.data?.data || [];
      const data8 = Array.isArray(res8.data)
        ? res8.data
        : res8.data?.data || [];
      const merged = [...data6, ...data8].filter(
        (order, idx, arr) => arr.findIndex((o) => o.id === order.id) === idx
      );
      setOrders(merged);
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

  const handleProcessCancelRequest = async (
    orderId,
    newCancelStatus,
    actionText
  ) => {
    const result = await Swal.fire({
      title: `Nhập lý do ${actionText} yêu cầu hủy đơn`,
      input: "text",
      inputPlaceholder: "Nhập lý do tại đây...",
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return "Bạn cần nhập lý do!";
        }
      },
    });

    if (!result.isConfirmed) return;
    const adminNotes = result.value;

    try {
      await api.patch(`Orders/${orderId}/process-cancellation-request`, {
        cancellationRequestStatus: newCancelStatus, // 2 = Approved, 3 = Rejected
        adminNotes,
      });
      toast.success(
        `${
          actionText.charAt(0).toUpperCase() + actionText.slice(1)
        } yêu cầu hủy thành công!`
      );
      // Refresh lại data
      fetchCancelledOrders();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || `Lỗi khi ${actionText} yêu cầu hủy!`
      );
      console.error("Error processing cancellation request:", err);
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
      case 7:
        return "Paid";
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
      case 8:
        return "CancellationRequested";
      default:
        return status;
    }
  };
  const getCancellationRequestStatus = (status) => {
    switch (status) {
      case 0:
        return "None";
      case 1:
        return "Pending";
      case 2:
        return "Approved";
      case 3:
        return "Rejected";

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
      title: "Cancellation Request Status",
      dataIndex: "cancellationRequestStatus",
      key: "cancellationRequestStatus",
      render: (status) => getCancellationRequestStatus(status),
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
      render: (text, record) =>
        record.status === 8 && record.cancellationRequestStatus === 1 ? (
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              type="primary"
              style={{ backgroundColor: "#27ae60", color: "#fff" }}
              onClick={
                () => handleProcessCancelRequest(record.id, 2, "chấp nhận") // 2: Approved
              }
            >
              Accept
            </Button>
            <Button
              type="primary"
              danger
              onClick={
                () => handleProcessCancelRequest(record.id, 3, "từ chối") // 3: Rejected
              }
            >
              Reject
            </Button>
          </div>
        ) : null,
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
