// pages/user/Coupon/index.jsx
import { useEffect, useState } from "react";
import { Button, Card, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  addSavedCoupon,
  removeSavedCoupon,
  setSavedCoupons,
} from "../../../redux/features/couponSlice";
import api from "../../../config/api";
import "./index.scss";

const Coupon = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  // Lấy userId hiện tại từ localStorage (bạn nên đảm bảo luôn đúng khi login/logout)
  const userId = localStorage.getItem("userId");
  const LOCAL_KEY = userId ? `user_coupons_${userId}` : "user_coupons_guest";
  const saved = useSelector((state) => state.coupon.savedCoupons);

  // Khi userId đổi (login/logout), đồng bộ Redux với localStorage
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    dispatch(setSavedCoupons(data));
  }, [userId, dispatch]);

  // Fetch tất cả coupon từ API (danh sách để người dùng chọn lấy về)
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await api.get("/Coupons");
        setCoupons(res.data.data || []);
      } catch {
        message.error("Không thể tải danh sách coupon!");
      }
      setLoading(false);
    };
    fetchCoupons();
  }, []);

  // Lưu 1 coupon vào kho user
  const handleSave = (coupon) => {
    if (saved.find((c) => c.id === coupon.id)) {
      message.info("Bạn đã lưu mã này rồi.");
      return;
    }
    const updated = [...saved, coupon];
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
    dispatch(addSavedCoupon(coupon));
    message.success("Đã lưu mã giảm giá!");
  };

  // Xóa coupon khỏi kho user
  const handleRemove = (id) => {
    const updated = saved.filter((c) => c.id !== id);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
    dispatch(removeSavedCoupon(id));
    message.info("Đã xóa mã khỏi kho của bạn.");
  };

  return (
    <div className="coupon-list-page">
      <h2 style={{ fontWeight: 600, fontSize: 22, marginBottom: 6 }}>
        Ngân hàng mã giảm giá
      </h2>
      <p style={{ marginBottom: 26 }}>
        Chọn mã giảm giá để lưu vào kho của bạn, dùng khi thanh toán.
      </p>
      <div className="coupon-list">
        {loading ? "Đang tải..." : null}
        {coupons.map((coupon) => {
          const isSaved = saved.some((c) => c.id === coupon.id);
          return (
            <Card
              key={coupon.id}
              className={`coupon-card ${isSaved ? "coupon-card--saved" : ""}`}
              title={
                <span style={{ color: "#1677ff", fontWeight: 600 }}>
                  {coupon.code}
                </span>
              }
              extra={
                isSaved ? (
                  <Button danger onClick={() => handleRemove(coupon.id)}>
                    Xóa
                  </Button>
                ) : (
                  <Button type="primary" onClick={() => handleSave(coupon)}>
                    Lưu
                  </Button>
                )
              }
              style={{ marginBottom: 16 }}
            >
              <div>
                <b>{coupon.name}</b>
                <div style={{ color: "#666" }}>{coupon.description}</div>
                <div style={{ margin: "6px 0" }}>
                  <span>
                    Giá trị:{" "}
                    <span style={{ color: "#bf0909", fontWeight: 500 }}>
                      {coupon.type === 0
                        ? coupon.value + "%"
                        : coupon.value?.toLocaleString("vi-VN") + "đ"}
                    </span>
                  </span>
                  {coupon.minOrderAmount && (
                    <span style={{ marginLeft: 18 }}>
                      Đơn tối thiểu:{" "}
                      {coupon.minOrderAmount.toLocaleString("vi-VN")}đ
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "#888" }}>
                  {coupon.startDate
                    ? `Từ: ${new Date(coupon.startDate).toLocaleDateString()}`
                    : ""}
                  {coupon.endDate
                    ? ` - Đến: ${new Date(coupon.endDate).toLocaleDateString()}`
                    : ""}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <div style={{ marginTop: 24 }}>
        <h3>Mã của bạn ({saved.length}):</h3>
        {saved.length === 0 ? (
          <p>Bạn chưa lưu mã nào.</p>
        ) : (
          <div className="coupon-saved-list">
            {saved.map((c) => (
              <span className="coupon-saved-item" key={c.id}>
                <b>{c.code}</b> - {c.name}
                <Button
                  size="small"
                  type="link"
                  onClick={() => handleRemove(c.id)}
                  style={{ color: "#af0808" }}
                >
                  X
                </Button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Coupon;
