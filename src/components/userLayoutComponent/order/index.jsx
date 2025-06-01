import { useState } from "react";
import { Tabs } from "antd";
import "./index.scss";

const { TabPane } = Tabs;

const Orders = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [selectedMenu, setSelectedMenu] = useState("Tất cả");

  // Mảng đơn hàng (giả lập, bạn thay bằng data thực tế)
  const orders = [];

  const handleTabChange = (key) => {
    setActiveTab(key);
    const menuMap = {
      1: "Tất cả",
      2: "Chờ Thanh Toán",
      3: "Vận chuyển",
      4: "Chờ giao hàng",
      5: "Hoàn thành",
      6: "Đã hủy",
      7: "Đã hoàn tiền",
    };
    setSelectedMenu(menuMap[key]);
  };

  return (
    <div className="history-container">
      <div className="history-content">
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          className="history-tabs"
        >
          <TabPane tab="Tất cả" key="1" />
          <TabPane tab="Chờ Thanh Toán" key="2" />
          <TabPane tab="Vận chuyển" key="3" />
          <TabPane tab="Chờ giao hàng" key="4" />
          <TabPane tab="Hoàn thành" key="5" />
          <TabPane tab="Đã hủy" key="6" />
          <TabPane tab="Đã hoàn tiền" key="7" />
        </Tabs>

        {orders.length === 0 && (
          <div className="empty-order">
            <img
              src={
                "https://png.pngtree.com/png-clipart/20230418/original/pngtree-order-confirm-line-icon-png-image_9065104.png"
              }
              alt="Chưa có đơn hàng"
            />
            <p>Chưa có đơn hàng</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
