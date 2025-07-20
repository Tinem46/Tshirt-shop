import { useEffect, useState } from "react";
import { Button, Card, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  Gift,
  Percent,
  Calendar,
  ShoppingCart,
  Star,
  Trash2,
} from "lucide-react";
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
  const userId = localStorage.getItem("userId");
  const LOCAL_KEY = userId ? `user_coupons_${userId}` : "user_coupons_guest";
  const saved = useSelector((state) => state.coupon.savedCoupons);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    dispatch(setSavedCoupons(data));
  }, [userId, dispatch]);

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

  const handleRemove = (id) => {
    const updated = saved.filter((c) => c.id !== id);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
    dispatch(removeSavedCoupon(id));
    message.info("Đã xóa mã khỏi kho của bạn.");
  };

  const formatValue = (coupon) => {
    if (coupon.type === 0) {
      return `${coupon.value}%`;
    }
    return `${coupon.value?.toLocaleString("vi-VN")}đ`;
  };

  return (
    <div className="coupon-page">
      <div className="coupon-page__container">
        <div className="coupon-page__header">
          <div className="header-content">
            <div className="header-icon">
              <Gift className="icon" />
            </div>
            <div className="header-text">
              <h1 className="header-title">Ưu đãi dành cho bạn</h1>
              <p className="header-subtitle">
                Chọn mã giảm giá để lưu vào kho của bạn, dùng khi thanh toán.
              </p>
            </div>
          </div>
        </div>

        <div className="coupon-section">
          <div className="section-header">
            <h2 className="section-title">Mã giảm giá có sẵn</h2>
            <div className="section-divider"></div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Đang tải danh sách mã giảm giá...</p>
            </div>
          ) : (
            <div className="coupon-grid">
              {coupons.map((coupon) => {
                const isSaved = saved.some((c) => c.id === coupon.id);
                return (
                  <div
                    key={coupon.id}
                    className={`coupon-card ${
                      isSaved ? "coupon-card--saved" : ""
                    }`}
                  >
                    <div className="coupon-card__header">
                      <div className="coupon-code">
                        <Percent className="code-icon" />
                        <span className="code-text">{coupon.code}</span>
                      </div>
                      {isSaved && (
                        <div className="saved-badge">
                          <Star className="star-icon" />
                          Đã lưu
                        </div>
                      )}
                    </div>

                    <div className="coupon-card__body">
                      <h3 className="coupon-name">{coupon.name}</h3>
                      <p className="coupon-description">{coupon.description}</p>

                      <div className="coupon-details">
                        <div className="detail-item">
                          <span className="detail-label">Giá trị:</span>
                          <span className="detail-value detail-value--primary">
                            {formatValue(coupon)}
                          </span>
                        </div>

                        {coupon.minOrderAmount && (
                          <div className="detail-item">
                            <ShoppingCart className="detail-icon" />
                            <span className="detail-label">Đơn tối thiểu:</span>
                            <span className="detail-value">
                              {coupon.minOrderAmount.toLocaleString("vi-VN")}đ
                            </span>
                          </div>
                        )}
                      </div>

                      {(coupon.startDate || coupon.endDate) && (
                        <div className="coupon-validity">
                          <Calendar className="validity-icon" />
                          <span className="validity-text">
                            {coupon.startDate &&
                              `Từ: ${new Date(
                                coupon.startDate
                              ).toLocaleDateString()}`}
                            {coupon.startDate && coupon.endDate && " - "}
                            {coupon.endDate &&
                              `Đến: ${new Date(
                                coupon.endDate
                              ).toLocaleDateString()}`}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="coupon-card__footer">
                      {isSaved ? (
                        <Button
                          danger
                          className="remove-btn"
                          onClick={() => handleRemove(coupon.id)}
                          icon={<Trash2 size={16} />}
                        >
                          Xóa khỏi kho
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          className="save-btn"
                          onClick={() => handleSave(coupon)}
                        >
                          Lưu vào kho
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="saved-section">
          <div className="section-header">
            <h2 className="section-title">
              Kho mã của bạn
              <span className="count-badge">({saved.length})</span>
            </h2>
            <div className="section-divider"></div>
          </div>

          {saved.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Gift size={48} />
              </div>
              <h3 className="empty-title">Chưa có mã nào được lưu</h3>
              <p className="empty-description">
                Hãy chọn những mã giảm giá ưa thích ở trên để lưu vào kho của
                bạn
              </p>
            </div>
          ) : (
            <div className="saved-coupons">
              {saved.map((coupon) => (
                <div key={coupon.id} className="saved-coupon-item">
                  <div className="saved-coupon-content">
                    <div className="saved-coupon-code">{coupon.code}</div>
                    <div className="saved-coupon-name">{coupon.name}</div>
                    <div className="saved-coupon-value">
                      {formatValue(coupon)}
                    </div>
                  </div>
                  <Button
                    type="text"
                    danger
                    className="saved-coupon-remove"
                    onClick={() => handleRemove(coupon.id)}
                    icon={<Trash2 size={14} />}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Coupon;
