import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Layout from "./components/layout";
import Home from "./page/home";


function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "",
          element: <Home />,
        },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
