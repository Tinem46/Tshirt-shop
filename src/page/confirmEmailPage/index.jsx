import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button, Spin } from "antd";
import api from "../../config/api";
import { toast } from "react-toastify";
import "./index.scss";

function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [email, setEmail] = useState(state?.email || "");
  const [userId, setUserId] = useState(
    searchParams.get("userId") || state?.userId
  );
  const token = searchParams.get("token");

  useEffect(() => {
    const confirm = async () => {
      if (!userId || !token) return;
      try {
        const response = await api.get(`Auth/confirm-email`, {
          params: { userId, token },
        });
        console.log("Email confirmation response:", response.data);
        toast.success("Xác nhận email thành công!");
        setConfirmed(true);
        setTimeout(() => navigate("/login"), 2000);
      } catch (err) {
        toast.error("Xác nhận thất bại hoặc liên kết đã hết hạn.");
        console.error(err);
      }
    };

    confirm();
  }, [token, userId, navigate]);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error("Không tìm thấy email để gửi lại.");
      return;
    }
    setResending(true);
    try {
      await api.post("Auth/resend-confirmation", { email });
      toast.success("Đã gửi lại email xác nhận. Vui lòng kiểm tra hộp thư.");
    } catch (err) {
      toast.error("Gửi lại email thất bại.");
      console.error(err);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="confirm-container">
      {!confirmed && token && <Spin tip="Đang xác nhận email..." />}

      {!token && (
        <>
          <h3>Xác nhận email của bạn</h3>
          <p>Vui lòng kiểm tra email để xác nhận tài khoản.</p>
          <Button
            loading={resending}
            type="primary"
            onClick={handleResendEmail}
            className="resend-button"
          >
            Gửi lại email xác nhận
          </Button>
        </>
      )}
    </div>
  );
}

export default ConfirmEmail;
