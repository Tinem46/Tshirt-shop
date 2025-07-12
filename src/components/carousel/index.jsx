import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import "swiper/css";
import "swiper/css/pagination";
import "./index.scss"; // Bạn có thể thêm CSS cụ thể trong đây nếu muốn
import { useNavigate } from "react-router-dom";

const Carousel = ({
  numberOfSlides = 1,
  autoplay = false,
  numberOfItems = 1,
  imgs = [],
  //   name="name 1"
}) => {
  const [shirt, setShirt] = useState([]);
  const navigate = useNavigate();

  const fetchShirt = async () => {
    try {
      const response = await fetch(
        "https://682f2e5b746f8ca4a4803faf.mockapi.io/product"
      );
      const data = await response.json();
      console.log("DATA:", data);

      if (Array.isArray(data)) {
        setShirt(data);
      } else {
        console.error("API trả về dữ liệu không phải là mảng:", data);
      }
    } catch (error) {
      console.error("Lỗi khi fetch sản phẩm:", error);
    }
  };

  useEffect(() => {
    fetchShirt();
  }, []);

  // Filter shirts by name before rendering
  //   const filteredShirts = shirt.filter(item => item.name === name);
  console.log("Slides to render:", shirt.slice(0, numberOfItems).length);
  console.log(
    "Số chấm pagination dự kiến:",
    Math.ceil(numberOfItems / numberOfSlides)
  );
  return (
    <Swiper
      slidesPerView={numberOfSlides}
      autoplay={
        autoplay
          ? {
              delay: 3000,
              disableOnInteraction: false,
            }
          : false
      }
      pagination={{ clickable: true }}
      loop={false} // Ngăn Swiper tự clone slides
      watchOverflow={true} // Ngăn tạo pagination nếu slides không đủ
      modules={autoplay ? [Pagination, Autoplay] : [Pagination]}
      className={`carousel ${numberOfSlides > 2 ? "multi-item" : ""}`}
    >
      {imgs.slice(0, numberOfItems).map((img, idx) => (
        <SwiperSlide
          key={idx}
          onClick={() => {
            navigate("/shop");
          }}
        >
          <img src={img} alt={`slide-${idx}`} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

Carousel.propTypes = {
  numberOfSlides: PropTypes.number,
  autoplay: PropTypes.bool,
};
export default Carousel;
