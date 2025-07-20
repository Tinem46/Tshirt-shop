import "./index.scss";
import { FaStore, FaUsers, FaHistory, FaBuilding } from "react-icons/fa";

const AboutUs = () => {
  return (
    <div className="aboutUs" data-aos="fade-up">
      {/* Hero Section */}
      <div className="aboutUs__hero">
        <img
          src="https://cdn2.fptshop.com.vn/unsafe/Uploads/images/tin-tuc/176898/Originals/anh-bia-thoi-trang%20(15).jpg"
          alt="Áo thun thời trang"
          className="aboutUs__heroImage"
        />
        <div className="aboutUs__heroContent">
          <h1 style={{ color: "white" }}>Chào mừng đến với T-Shirt Shop</h1>
          <p>Điểm đến lý tưởng cho những chiếc áo thun chất lượng cao</p>
        </div>
      </div>

      {/* Sứ mệnh */}
      <div className="aboutUs__mission">
        <h2>Sứ mệnh của chúng tôi</h2>
        <p>
          Tại TeeStyle Shop, chúng tôi mang đến những xu hướng áo thun mới nhất,
          kết hợp giữa sự thoải mái, phong cách và tính bền vững. Bộ sưu tập được tuyển chọn kỹ lưỡng với các thiết kế độc đáo, chất liệu cao cấp, đảm bảo độ bền và vừa vặn hoàn hảo. Chúng tôi cam kết quy trình sản xuất thân thiện môi trường và không ngừng nỗ lực giảm thiểu tác động đến thiên nhiên.
        </p>
      </div>

      {/* Lịch sử cửa hàng */}
      <div className="aboutUs__storeHistory">
        <h2>
          <FaBuilding /> Lịch sử cửa hàng
        </h2>
        <p>
          Thành lập năm 2010 bởi Anna Lee – một người đam mê thời trang, TeeStyle Shop khởi đầu là một boutique nhỏ ở trung tâm Portland. Với niềm yêu thích thiết kế đồ họa và văn hóa streetwear, Anna đã tạo nên thương hiệu giúp mọi người thể hiện cá tính qua trang phục.
        </p>
        <p>
          Qua nhiều năm, TeeStyle đã phát triển thành tên tuổi uy tín trong làng thời trang thường ngày, mở rộng từ các loại vải thân thiện môi trường đến những bộ sưu tập hợp tác với nghệ sĩ nổi tiếng. Cam kết chất lượng và sự hài lòng của khách luôn là giá trị cốt lõi của chúng tôi.
        </p>
        <p>
          Ngày nay, TeeStyle phục vụ khách hàng trên toàn thế giới qua nền tảng online và các cửa hàng tại Portland, Seattle, San Francisco – tiếp tục truyền cảm hứng sáng tạo và tự tin qua thời trang.
        </p>
      </div>

      {/* Lịch sử áo thun */}
      <div className="aboutUs__history" id="aboutUs__history">
        <h2>
          <FaHistory /> Lịch sử áo thun
        </h2>
        <div className="aboutUs__historyContent">
          <img
            src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1350&q=80"
            alt="Lịch sử áo thun"
            className="aboutUs__historyImage"
          />
          <div>
            <p>
              Áo thun xuất hiện từ đầu thế kỷ 20 như một loại đồ lót cho công nhân, quân nhân. Nhờ thiết kế đơn giản, thoải mái, áo thun nhanh chóng trở thành trang phục thường ngày trên toàn thế giới.
            </p>
            <p>
              Thập niên 50-60, áo thun trở thành “tấm toan” sáng tạo: in slogan, hình ban nhạc, nghệ thuật,... biến áo thun thành biểu tượng cá tính, tuổi trẻ và sự nổi loạn.
            </p>
            <p>
              Ngày nay, áo thun là món đồ không thể thiếu với mọi phong cách, độ tuổi. Chúng liên tục đổi mới về chất liệu, form dáng, thiết kế, giúp mỗi người tự do thể hiện cá tính và văn hóa riêng.
            </p>
          </div>
        </div>
      </div>

      {/* Lý do chọn chúng tôi */}
      <div className="aboutUs__whyChooseUs" id="aboutUs__whyChooseUs">
        <h2>Vì sao nên chọn chúng tôi?</h2>
        <div className="aboutUs__reasons">
          <div className="aboutUs__reason">
            <h3>Chất liệu cao cấp</h3>
            <p>
              Áo thun được may từ vải mềm, thoáng mát, giữ form bền đẹp qua nhiều lần giặt.
            </p>
          </div>
          <div className="aboutUs__reason">
            <h3>Thiết kế độc quyền</h3>
            <p>
              Hợp tác cùng các nghệ sĩ tài năng để cho ra đời những mẫu áo riêng biệt, chỉ có tại TeeStyle.
            </p>
          </div>
          <div className="aboutUs__reason">
            <h3>Cam kết xanh</h3>
            <p>
              Ưu tiên quy trình sản xuất bền vững, sử dụng bao bì thân thiện môi trường.
            </p>
          </div>
        </div>
      </div>

      {/* Bộ sưu tập áo thun */}
      <div className="aboutUs__gallery">
        <h2>Khám phá bộ sưu tập áo thun</h2>
        <div className="aboutUs__galleryContent">
          <img
            src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1350&q=80"
            alt="Bộ sưu tập áo thun"
            className="aboutUs__varietyImage"
          />
          <p>
            Từ áo cổ tròn kinh điển đến áo thun in hình hiện đại, khám phá đa dạng phong cách và màu sắc phù hợp mọi dịp.
          </p>
        </div>
      </div>

      {/* Đội ngũ của chúng tôi */}
      <div className="aboutUs__team">
        <h2>
          <FaUsers /> Đội ngũ của chúng tôi
        </h2>
        <p>
          Đội ngũ TeeStyle gồm những nhà thiết kế, marketer và chuyên viên CSKH giàu kinh nghiệm, tận tâm mang đến trải nghiệm mua sắm tuyệt vời nhất cho bạn.
        </p>
      </div>

      {/* Địa chỉ cửa hàng */}
      <div className="aboutUs__locations">
        <h2>
          <FaStore /> Hệ thống cửa hàng
        </h2>
        <ul>
          <li>
            Portland, OR: Cửa hàng flagship với đầy đủ các mẫu TeeStyle.
          </li>
          <li>
            Seattle, WA: Địa chỉ dành cho những bộ sưu tập và sự kiện độc quyền.
          </li>
          <li>
            San Francisco, CA: Boutique giữa trung tâm thời trang của thành phố.
          </li>
        </ul>
      </div>
    </div>
  );
}

export default AboutUs;
