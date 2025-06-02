// import { useState } from "react";
import { Outlet } from "react-router-dom";
// import { useSelector } from "react-redux";
import "./index.scss";
import Footer from "../footer";
import Header from "../header";
import { useEffect } from "react";
import Aos from "aos";

function Layout() {
  // const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  // const compareItems = useSelector((state) => state.compare.items);
  useEffect(() => {
    Aos.init({
      duration: 800,
      once: true,
      offset: 120,
      easing: "ease-in-out",
    });
  }, []);

  return (
    <div className="layout" style={{ paddingTop: "110px" }}>
      <Header />
      <Outlet />
      {/* <div className="layout__container">
        <Outlet />
        {compareItems.length > 0 && (
          <div className="layout__compare-button-container">
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="layout__compare-button"
            >
              Compare ({compareItems.length})
            </button>
          </div>
        )}
      </div> */}
      <Footer style={{}} />
      {/* <CompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
      /> */}
    </div>
  );
}

export default Layout;
