

import { useEffect, useState } from "react"
import { Layout, Tabs, Button, Input, Spin, Empty, Modal, message, Tag, Space } from "antd"
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons"
import { getMyOrders, cancelOrder as cancelOrderAPI, confirmDelivered } from "../../../utils/orderService"
import "./index.scss"

const { Header, Content } = Layout
const { TabPane } = Tabs
const { Search } = Input

const STATUS = {
  all: -1,
  pending: 0,
  paid: 1,
  processing: 3,
  shipping: 4,
  delivered: 5,
  completed: 2,
  cancelled: 6,
  returned: 7,
}

const STATUS_LABEL = {
  [STATUS.pending]: "Chờ thanh toán",
  [STATUS.paid]: "Đã thanh toán",
  [STATUS.processing]: "Đang xử lý",
  [STATUS.shipping]: "Đang vận chuyển",
  [STATUS.delivered]: "Đã giao hàng",
  [STATUS.completed]: "Đã hoàn thành",
  [STATUS.cancelled]: "Đã huỷ",
  [STATUS.returned]: "Đã trả hàng/Hoàn tiền",
}

const STATUS_COLORS = {
  [STATUS.pending]: "orange",
  [STATUS.paid]: "blue",
  [STATUS.processing]: "cyan",
  [STATUS.shipping]: "purple",
  [STATUS.delivered]: "green",
  [STATUS.completed]: "success",
  [STATUS.cancelled]: "red",
  [STATUS.returned]: "magenta",
}

const Orders = () => {
  const [activeTab, setActiveTab] = useState("all")
  const [search, setSearch] = useState("")
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchOrders = async () => {
    setLoading(true)
    try {

      const res = await getMyOrders()

      console.log("Fetched orders:", res.data);

      setOrders(res.data)
    } catch (err) {
      console.error("Error loading orders", err)
      message.error("Không thể tải danh sách đơn hàng")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const filteredOrders = orders.filter((o) => {
    const matchesTab = activeTab === "all" ? true : o.status === STATUS[activeTab]
    const matchesSearch =
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.receiverName?.toLowerCase().includes(search.toLowerCase()) ||
      o.orderItems?.some((it) => it.productName?.toLowerCase().includes(search.toLowerCase()))
    return matchesTab && matchesSearch
  })

  const handleCancel = (id) => {
    Modal.confirm({
      title: "Xác nhận hủy đơn hàng",
      content: "Bạn có chắc chắn muốn hủy đơn hàng này?",
      okText: "Hủy đơn hàng",
      cancelText: "Không",
      okType: "danger",
      async onOk() {
        try {
          await cancelOrderAPI(id)
          message.success("Hủy đơn hàng thành công")
          fetchOrders()
        } catch (err) {
          console.error("Cancel failed", err)
          message.error("Không thể hủy đơn hàng")
        }
      },
    })
  }

  const handleConfirmReceived = (id) => {
    Modal.confirm({
      title: "Xác nhận đã nhận được hàng?",
      content: "Bạn có chắc chắn đã nhận được đơn hàng này?",
      okText: "Xác nhận",
      cancelText: "Huỷ",
      async onOk() {
        try {
          await confirmDelivered(id)
          message.success("Xác nhận thành công")
          fetchOrders()
        } catch (err) {
          console.error("Confirm failed", err)
          message.error("Không thể xác nhận")
        }
      },
    })
  }

  const renderOrderActions = (order) => {
    const actions = []
    switch (order.status) {
      case STATUS.pending:
      case STATUS.paid:
        actions.push(
          <Button key="cancel" danger onClick={() => handleCancel(order.id)} icon={<CloseCircleOutlined />}>
            Hủy đơn hàng
          </Button>,
        )
        break
      case STATUS.shipping:
        actions.push(
          <Button
            key="confirm"
            type="primary"
            onClick={() => handleConfirmReceived(order.id)}
            icon={<CheckCircleOutlined />}
          >
            Đã nhận được hàng
          </Button>,
        )
        break
      default:
        break
    }
    return actions
  }

  const formatVND = (n) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n)
  const formatDate = (d) =>
    new Date(d).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })

  return (
    <Layout className="orders-page-layout">
      <Header className="orders-header-section">
        <Tabs activeKey={activeTab} onChange={setActiveTab} className="orders-status-tabs">
          <TabPane tab="Tất cả" key="all" />
          <TabPane tab="Chờ Thanh Toán" key="pending" />
          <TabPane tab="Đã Thanh Toán" key="paid" />
          <TabPane tab="Đang Xử Lý" key="processing" />
          <TabPane tab="Đang Vận Chuyển" key="shipping" />
          <TabPane tab="Đã Giao Hàng" key="delivered" />
          <TabPane tab="Đã Hoàn Thành" key="completed" />
          <TabPane tab="Đã Hủy" key="cancelled" />
          <TabPane tab="Đã Hoàn Tiền" key="returned" />
        </Tabs>
      </Header>
      <div className="orders-search-bar-container">
        {" "}
        {/* New container for search bar */}
        <Search
          placeholder="Tìm kiếm..."
          allowClear
          prefix={<SearchOutlined />} 
          size="large"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Content className="orders-content-section">
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <Empty description="Chưa có đơn hàng nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order.id} className="order-item-block">
                <div className="order-card-header">
                  <div className="order-info">
                    <span className="order-number">#{order.orderNumber}</span>
                    <span className="order-date">{formatDate(order.createdAt)}</span>
                  </div>
                  <Tag color={STATUS_COLORS[order.status]} className="order-status-tag">
                    {STATUS_LABEL[order.status]}
                  </Tag>
                </div>
                <div className="order-card-items">
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} className="order-item-row">
                      <div className="item-image-wrapper">
                        <img
                          src={item.productImage || "/placeholder.svg"}
                          alt={item.productName}
                          className="item-image"
                        />
                      </div>
                      <div className="item-details">
                        <div className="item-name">{item.productName}</div>
                        {item.variantName && <div className="item-variant">Phân loại: {item.variantName}</div>}
                        <div className="item-quantity">x{item.quantity}</div>
                      </div>
                      <div className="item-price">{formatVND(item.unitPrice)}</div>
                    </div>
                  ))}
                </div>
                <div className="order-card-summary">
                  <div className="shipping-info">
                    <p>
                      <strong>Người nhận:</strong> {order.receiverName}
                    </p>
                    <p>
                      <strong>Điện thoại:</strong> {order.receiverPhone}
                    </p>
                    <p>
                      <strong>Địa chỉ:</strong> {order.shippingAddress}
                    </p>
                    {order.trackingNumber && (
                      <p>
                        <strong>Mã vận đơn:</strong> {order.trackingNumber}
                      </p>
                    )}
                  </div>
                  <div className="price-summary">
                    <div className="price-row">
                      <span>Tạm tính:</span>
                      <span>{formatVND(order.subtotalAmount)}</span>
                    </div>
                    <div className="price-row">
                      <span>Phí vận chuyển:</span>
                      <span>{formatVND(order.shippingFee)}</span>
                    </div>
                    {order.discountAmount > 0 && (
                      <div className="price-row discount">
                        <span>Giảm giá:</span>
                        <span>-{formatVND(order.discountAmount)}</span>
                      </div>
                    )}
                    <div className="price-row total">
                      <span>Thành tiền:</span>
                      <span className="total-amount">{formatVND(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>
                <div className="order-card-actions">
                  <Space>{renderOrderActions(order)}</Space>
                </div>
              </div>
            ))}
          </div>
        )}
      </Content>
    </Layout>
  )
}

export default Orders
