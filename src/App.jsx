import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/layout";
import Home from "./page/home";
import Cart from "./page/cart";
import UserLayout from "./page/userLayout";
import DetailPage from "./page/detailPage/DetailPage";
import Shop from "./page/shop";
import ScrollToTop from "./components/ScrollToTop";
import SearchPage from "./page/searchPage";
import Login from "./page/loginPage";
import Register from "./page/registerPage";
import AboutUs from "./page/aboutUsPage";
import Dashboard from "./components/dashboard";
import ManagementProducts from "./page/admin/product";
import ManageCategory from "./page/admin/category";
import Checkout from "./page/checkout";
import ConfirmEmail from "./page/confirmEmailPage";
import ManageCoupon from "./page/admin/couponManage";
import AccountManagement from "./page/admin/accountManagement";
import ShippingManagement from "./page/admin/shippingManagement";
import PaymentPage from "./page/PaymentPage";
import OrderSuccess from "./page/orderSuccessPage";
import ForgotPassword from "./page/forgotPasswordPage";
import ResetPassword from "./page/resetPasswordPage";
import OrderManagement from "./page/admin/orderManagement";
import CompletedOrdersManagement from "./page/admin/completedOrderManagement";
import CancelledOrdersManagement from "./page/admin/cancelManagement";

import CustomDesignManagement from "./page/admin/customDesignManagement";
import CustomDesign from "./page/customDesignPage";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <>
          <ScrollToTop />
          <Layout />
        </>
      ),
      children: [
        {
          path: "",
          element: <Home />,
        },
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/register",
          element: <Register />,
        },
        {
          path: "/confirm-email",
          element: <ConfirmEmail />,
        },
        {
          path: "/forgot-password",
          element: <ForgotPassword />,
        },
        {
          path: "/reset-password",
          element: <ResetPassword />,
        },
        {
          path: "/aboutUs",
          element: <AboutUs />,
        },
        {
          path: "/cart",
          element: <Cart />,
        },
        {
          path: "/userLayout",
          element: <UserLayout />,
        },
        {
          path: "detail/:id",
          element: <DetailPage />,
        },
        {
          path: "/shop",
          element: <Shop />,
        },
        {
          path: "/search",
          element: <SearchPage />,
        },
        {
          path: "/checkout",
          element: <Checkout />,
        },
        {
          path: "/payment",
          element: <PaymentPage />,
        },
        {
          path: "/order-success/:orderId",
          element: <OrderSuccess />,
        },
        {
          path: "/payment-success",
          element: <OrderSuccess />,
        },
        {
          path: "/custom-design",
          element: <CustomDesign />,
        },
      ],
    },

    {
      path: "/dashboard",
      element: <Dashboard />,
      children: [
        {
          path: "product",
          element: <ManagementProducts />,
        },
        {
          path: "category",
          element: <ManageCategory />,
        },
        {
          path: "coupon",
          element: <ManageCoupon />,
        },
        {
          path: "accountManagement",
          element: <AccountManagement />,
        },
        {
          path: "shippingManagement",
          element: <ShippingManagement />,
        },
        {
          path: "orderManagement", // Remove the leading slash
          element: <OrderManagement />,
        },
        {
          path: "completedManagement", // Remove the leading slash
          element: <CompletedOrdersManagement />,
        },
        {
          path: "cancelManagement", // Remove the leading slash
          element: <CancelledOrdersManagement />,
        },
        {
          path: "customDesignManagement",
          element: <CustomDesignManagement />,
        },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
