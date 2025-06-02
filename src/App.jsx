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
        {
          path: "/search",
          element: <SearchPage />,
        },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
