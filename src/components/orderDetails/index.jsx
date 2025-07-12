import { Descriptions, Table, Button, Tag } from "antd";

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
const PAYMENT_STATUS_LABELS_EN = [
  "Unpaid", // 0
  "Processing", // 1
  "Completed", // 2
  "Partially Paid", // 3
  "Refunded", // 4
  "Partially Refunded", // 5
  "Failed", // 6
];
function getOrderStatusLabel(status) {
  return ORDER_STATUS_LABELS_EN[status] || `Unknown (${status})`;
}
function getPaymentStatusLabel(status) {
  return PAYMENT_STATUS_LABELS_EN[status] || `Unknown (${status})`;
}
function formatVND(amount) {
  return amount == null ? "" : `${parseFloat(amount).toLocaleString("vi-VN")}đ`;
}

function OrderDetails({ selectedOrder, onClose }) {
  if (!selectedOrder) return null;

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
    orderItems = [],
  } = selectedOrder;

  const detailColumns = [
    {
      title: "Item Name",
      render: (_, record) =>
        record.productName ||
        record.customDesignName ||
        record.variantName ||
        record.itemName ||
        "N/A",
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
      render: (text) => formatVND(text),
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (text) => formatVND(text),
    },
    // Add more columns if needed
  ];

  return (
    <div className="order-details" style={{ maxWidth: 800, margin: "0 auto" }}>
      <div
        className="order-details-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      ></div>

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
          {receiverName} ({receiverPhone})
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
      </Descriptions>

      <h3>Order Items</h3>
      <Table
        dataSource={orderItems}
        columns={detailColumns}
        rowKey="id"
        pagination={false}
        size="small"
      />
    </div>
  );
}

export default OrderDetails;
