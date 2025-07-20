import { useEffect, useState } from "react";
import Profile from "../../components/userLayoutComponent/profile";
import Address from "../../components/userLayoutComponent/address";
import ChangePassword from "../../components/userLayoutComponent/changePassword";
import Orders from "../../components/userLayoutComponent/order";
import Sidebar from "../../components/userLayoutComponent/sidebar";
import Coupon from "../../components/userLayoutComponent/coupon";
import { useLocation } from "react-router-dom";
import CustomDesign from "../../components/userLayoutComponent/customDesign";


const UserLayout = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "profile";

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabFromUrl = new URLSearchParams(location.search).get("tab");
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [location.search]);

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <Profile />;
      case "address":
        return <Address />;
      case "coupon":
        return <Coupon />;
      case "changePassword":
        return <ChangePassword />;
      case "orders":
        return <Orders />;
      case "customDesign":
        return <CustomDesign />;
      default:
        return <Profile />;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        backgroundColor: " rgba(233, 229, 229, 1)",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div data-aos="fade-up">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <div
        data-aos="fade-down"
        style={{
          flex: 0.9,
          backgroundColor: "#fff",
          padding: "20px",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default UserLayout;
