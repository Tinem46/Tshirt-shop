import { useState, useEffect } from "react";
import {
  ShoppingCartOutlined,
  StopOutlined,
  BarChartOutlined,
  CarOutlined,
  AppstoreAddOutlined,
  TagsOutlined,
  GiftOutlined,
  CommentOutlined,
  TeamOutlined,
  UserOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Button, Layout, Menu, theme } from "antd";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Wallet as WalletIcon } from "@mui/icons-material";
import LogoutIcon from "@mui/icons-material/Logout";
import "./index.scss";
import { logout } from "../../redux/features/userSlice";
import { useDispatch } from "react-redux";

const { Header, Content, Footer, Sider } = Layout;

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState(["group1", "group2", "group3"]);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const role = localStorage.getItem("role") || "";

  // Menu Items
  const items =
    role === ""
      ? [
          {
            key: "group1",
            icon: <DashboardOutlined />,
            label: "Quản lý",
            children: [
              {
                key: "orderManagement",
                icon: <ShoppingCartOutlined />,
                label: (
                  <Link to="/dashboard/orderManagement">Order Management</Link>
                ),
              },
              {
                key: "cancelManagement",
                icon: <StopOutlined />,
                label: (
                  <Link to="/dashboard/cancelManagement">
                    Cancel Management
                  </Link>
                ),
              },
            ],
          },
          {
            key: "group2",
            icon: <AppstoreAddOutlined />,
            label: "Thêm sản phẩm",
            children: [
              {
                key: "product",
                icon: <AppstoreAddOutlined />,
                label: <Link to="/dashboard/product">Product</Link>,
              },
            ],
          },
          {
            key: "group3",
            icon: <CommentOutlined />,
            label: "Khác",
            children: [
              {
                key: "feedback",
                icon: <CommentOutlined />,
                label: <Link to="/dashboard/feedback">Feedback</Link>,
              },
              {
                key: "customerAccount",
                icon: <UserOutlined />,
                label: (
                  <Link to="/dashboard/customerAccount">Customer Account</Link>
                ),
              },
            ],
          },
        ]
      : [
          {
            key: "group1",
            icon: <DashboardOutlined />,
            label: "Quản lý",
            children: [
              {
                key: "orderManagement",
                icon: <ShoppingCartOutlined />,
                label: (
                  <Link to="/dashboard/orderManagement">Order Management</Link>
                ),
              },
              {
                key: "cancelManagement",
                icon: <StopOutlined />,
                label: (
                  <Link to="/dashboard/cancelManagement">
                    Cancel Management
                  </Link>
                ),
              },
              {
                key: "revenueManagement",
                icon: <BarChartOutlined />,
                label: (
                  <Link to="/dashboard/revenueManagement">
                    Revenue Management
                  </Link>
                ),
              },
              {
                key: "shippingManagement",
                icon: <CarOutlined />,
                label: (
                  <Link to="/dashboard/shippingManagement">
                    Shipping Management
                  </Link>
                ),
              },
              {
                key: "completedManagement",
                icon: <GiftOutlined />, // Đổi icon cho đơn hàng đã hoàn thành
                label: (
                  <Link to="/dashboard/completedManagement">
                    Completed Management
                  </Link>
                ),
              },
            ],
          },
          {
            key: "group2",
            icon: <AppstoreAddOutlined />,
            label: "Thêm sản phẩm",
            children: [
              {
                key: "product",
                icon: <AppstoreAddOutlined />,
                label: <Link to="/dashboard/product">Product</Link>,
              },
              {
                key: "category",
                icon: <TagsOutlined />,
                label: <Link to="/dashboard/category">Category</Link>,
              },
              {
                key: "voucher",
                icon: <GiftOutlined />,
                label: <Link to="/dashboard/coupon">Coupon</Link>,
              },
            ],
          },
          {
            key: "group3",
            icon: <TeamOutlined />,
            label: "Khác",
            children: [
              {
                key: "staff",
                icon: <TeamOutlined />,
                label: <Link to="/dashboard/staff">Staff</Link>,
              },
              {
                key: "feedback",
                icon: <CommentOutlined />,
                label: <Link to="/dashboard/feedback">Feedback</Link>,
              },
              {
                key: "accountManagement",
                icon: <UserOutlined />,
                label: <Link to="/dashboard/accountManagement">Account</Link>,
              },
            ],
          },
        ];

  // Responsive: tự động collapse sidebar trên màn hình nhỏ
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992 && !collapsed) setCollapsed(true);
      if (window.innerWidth >= 992 && collapsed) setCollapsed(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [collapsed]);

  const onOpenChange = (keys) => setOpenKeys(keys);

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(logout());
    navigate("/login");
  };

  return (
    <Layout className="dashboard-layout">
      {/* SIDEBAR */}
      <Sider
        width={250}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        className="dashboard-sider"
      >
        <div className="sider-logo">
          <div className="sider-logo-inner">
            <div className="sider-logo-icon">S</div>
            {!collapsed && (
              <span className="sider-logo-text">
                <DashboardOutlined />
                DASHBOARD
              </span>
            )}
          </div>
        </div>
        <div className="sider-menu-wrapper">
          <Menu
            theme="dark"
            mode="inline"
            items={items}
            openKeys={collapsed ? [] : openKeys}
            onOpenChange={onOpenChange}
          />
        </div>
        <div className="sider-trigger-wrapper">
          <Button
            className="custom-trigger"
            onClick={() => setCollapsed(!collapsed)}
            type="primary"
            size="small"
          >
            {collapsed ? ">" : "<"}
          </Button>
        </div>
      </Sider>

      {/* MAIN */}
      <Layout className={`dashboard-main ${collapsed ? "collapsed" : ""}`}>
        <Header className="dashboard-header">
          <h1>{role === "MANAGER" ? "Manager" : "Staff"}</h1>
          <WalletIcon
            onClick={() => navigate("/dashboard/walletManager")}
            className="header-wallet"
          />
          <Button onClick={handleLogout} className="header-logout">
            <LogoutIcon />
          </Button>
        </Header>
        <Content className="dashboard-content">
          <Breadcrumb className="dashboard-breadcrumb">
            <Breadcrumb.Item>User</Breadcrumb.Item>
            <Breadcrumb.Item>Bill</Breadcrumb.Item>
          </Breadcrumb>
          <div
            className="dashboard-content-inner"
            style={{
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {/* Table hoặc quản lý CRUD hiển thị ở đây qua Outlet */}
            <div className="dashboard-table-wrapper">
              <Outlet />
            </div>
          </div>
        </Content>
        <Footer className="dashboard-footer">
          Shirt Store ©{new Date().getFullYear()} Created by Team number 1
        </Footer>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
