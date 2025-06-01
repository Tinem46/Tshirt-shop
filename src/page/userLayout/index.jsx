import { useState } from "react";
import Profile from "../../components/userLayoutComponent/profile";
import Address from "../../components/userLayoutComponent/address";
import Bank from "../../components/userLayoutComponent/bank";
import ChangePassword from "../../components/userLayoutComponent/changePassword";
import Orders from "../../components/userLayoutComponent/order";
import Sidebar from "../../components/userLayoutComponent/sidebar";

const UserLayout = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <Profile />;
      case "address":
        return <Address />;
      case "bank":
        return <Bank />;
      case "changePassword":
        return <ChangePassword />;
      case "orders":
        return <Orders />;
      default:
        return <Profile />;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "#f4f4f4",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div
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
