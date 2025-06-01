import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Layout from "./components/layout";
import Home from "./page/home";
import Cart from "./page/cart";
import Login from "./page/login";
import Register from "./page/register";
import AboutUs from "./page/aboutUs";
import UserLayout from "./page/userLayout";
import DetailPage from "./page/detailPage/DetailPage";
import Shop from "./page/shop";
import ScrollToTop from "./components/ScrollToTop";

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
      ],
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
