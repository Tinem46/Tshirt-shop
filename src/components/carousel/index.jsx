import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import "swiper/css";
import "swiper/css/pagination";
import "./index.scss"; // Bạn có thể thêm CSS cụ thể trong đây nếu muốn

const Carousel=({
  numberOfSlides = 1,
  autoplay = false,
//   name="name 1"
})=> {
  const [shirt, setShirt] = useState([]);

  const fetchShirt = async () => {
    try {
      const response = await fetch("https://682f2e5b746f8ca4a4803faf.mockapi.io/product");
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
      modules={autoplay ? [Pagination, Autoplay] : [Pagination]}
      className={`carousel ${numberOfSlides > 2 ? "multi-item" : ""}`}

    >
      {shirt.map((item) => (
        <SwiperSlide key={item.id}>
          <img
            src={"https://th.bing.com/th/id/OIP.sr2nojqKTA26FoACKi32wgHaE8?cb=iwp2&rs=1&pid=ImgDetMain"}
            alt={item.name || "T-Shirt"}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

Carousel.propTypes = {
  numberOfSlides: PropTypes.number,
  autoplay: PropTypes.bool,
};
export default Carousel;