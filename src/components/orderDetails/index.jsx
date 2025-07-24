import { Descriptions, Table, Tag } from "antd";

const ORDER_STATUS_LABELS_EN = [
  "Pending", // 0
  "Paid (awaiting confirmation)", // 1
  "Completed", // 2
  "Processing", // 3
  "Shipping", // 4
  "Delivered", // 5
  "Cancelled", // 6
  "Returned", // 7
  "Cancellation Requested", // 8
];
const PAYMENT_STATUS_LABELS_EN = [
  "Unpaid", // 0
  "Processing", // 1
  "Completed", // 2
  "Partially Paid", // 3
  "Refunded", // 4
  "Partially Refunded", // 5
  "Failed", // 6
  "Paid", // 7 (bổ sung nếu có)
];

function getOrderStatusLabel(status) {
  return ORDER_STATUS_LABELS_EN[status] || `${status}`;
}
function getPaymentStatusLabel(status) {
  return PAYMENT_STATUS_LABELS_EN[status] || `Unknown (${status})`;
}
function formatVND(amount) {
  return amount == null ? "" : `${parseFloat(amount).toLocaleString("vi-VN")}đ`;
}

function OrderDetails({ selectedOrder, onClose }) {
  if (!selectedOrder) return null;

  // Đảm bảo nhận đúng danh sách sản phẩm từ BE dù là items hay orderItems
  const orderItems =
    Array.isArray(selectedOrder.orderItems) && selectedOrder.orderItems.length
      ? selectedOrder.orderItems
      : Array.isArray(selectedOrder.items)
      ? selectedOrder.items
      : [];

  const {
    orderNumber,
    status,
    paymentStatus,
    createdAt,
    receiverName,
    receiverPhone,
    shippingAddress,
    shippingMethodName,
    subtotalAmount,
    shippingFee,
    discountAmount,
    refundAmount,
    totalAmount,
    finalTotal,
    customerNotes,
    cancellationReason,
    adminReviewNotes,
  } = selectedOrder;

  const detailColumns = [
    {
      title: "Item Image",
      dataIndex: "productImage",
      key: "productImage",
      render: (text, record) => (
        <img
          src={record.imageUrl || record.customDesignImage || ""}
          alt={record.imageUrl || record.customDesignName || "N/A"}
          style={{ width: 100, height: 100, objectFit: "cover" }}
        />
      ),
    },

    {
      title: "Item Name",
      dataIndex: "productName",
      key: "productName",
      render: (text, record) =>
        // record.productName ||
        // record.customDesignName ||
        // record.variantName ||
        record.itemName || record.productName || "N/A",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (text) =>
        text == null ? "" : `${parseFloat(text).toLocaleString("vi-VN")}đ`,
    },
    {
      title: "Total Price",
      key: "totalPrice",
      render: (_, record) =>
        record.quantity && record.unitPrice
          ? `${(record.quantity * record.unitPrice).toLocaleString("vi-VN")}đ`
          : "",
    },
    // Nếu muốn hiển thị thêm ảnh hoặc variantName thì bổ sung column ở đây
  ];

  return (
    <div className="order-details" style={{ maxWidth: 800, margin: "0 auto" }}>
      <Descriptions
        bordered
        column={1}
        size="small"
        style={{ marginBottom: 24, background: "#fff" }}
      >
        <Descriptions.Item label="Order Number">
          {orderNumber}
        </Descriptions.Item>
        <Descriptions.Item label="Created At">
          {createdAt && new Date(createdAt).toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="Receiver">
          {receiverName}
          {receiverPhone && ` (${receiverPhone})`}
        </Descriptions.Item>
        <Descriptions.Item label="Shipping Address">
          {shippingAddress}
        </Descriptions.Item>
        <Descriptions.Item label="Shipping Method">
          {shippingMethodName}
        </Descriptions.Item>
        <Descriptions.Item label="Order Status">
          <Tag color="blue">{getOrderStatusLabel(status)}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Payment Status">
          <Tag color="gold">{getPaymentStatusLabel(paymentStatus)}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Subtotal">
          {formatVND(subtotalAmount)}
        </Descriptions.Item>
        <Descriptions.Item label="Shipping Fee">
          {formatVND(shippingFee)}
        </Descriptions.Item>
        <Descriptions.Item label="Discount">
          {formatVND(discountAmount)}
        </Descriptions.Item>
        <Descriptions.Item label="Refund Amount">
          {formatVND(refundAmount)}
        </Descriptions.Item>
        <Descriptions.Item label="Total Amount">
          <b style={{ color: "#d4380d", fontSize: 16 }}>
            {formatVND(finalTotal ?? totalAmount)}
          </b>
        </Descriptions.Item>
        {customerNotes && (
          <Descriptions.Item label="Customer Notes">
            {customerNotes}
          </Descriptions.Item>
        )}
        {cancellationReason && (
          <Descriptions.Item label="Cancellation Reason">
            {cancellationReason}
          </Descriptions.Item>
        )}
        {adminReviewNotes && (
          <Descriptions.Item label="Admin Review Notes">
            {adminReviewNotes}
          </Descriptions.Item>
        )}
      </Descriptions>

      <h3>Order Items</h3>
      <Table
        dataSource={orderItems}
        columns={detailColumns}
        rowKey={(record, idx) =>
          record.id || record.productName + (record.variantName || "") + idx
        }
        pagination={false}
        size="small"
        locale={{ emptyText: "No data" }}
      />
    </div>
  );
}

export default OrderDetails;
