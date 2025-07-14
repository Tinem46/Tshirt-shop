import { Navigate } from "react-router-dom";
import "./index.scss";
// import { addToCart } from '../redux/features/cartSlice';
// import { useDispatch } from 'react-redux';
// import api from "../config/api";
// import { setSelectedshirt } from "../redux/features/shirtSlice";
import { useNavigate } from "react-router-dom";
// import { addToCompare } from '../redux/features/compareSlice';
// import { toast } from "react-toastify";

function Card({ shirt }) {
  // const dispatch = useDispatch();
  const navigate = useNavigate();

  // const handleAddToCart = async () => {
  //   if (shirt.status.toLowerCase() === "SOLD OUT") {
  //     toast.error("This shirt is sold out!");
  //     return;
  //   }

  //   const token = localStorage.getItem("token");
  //   if (!token) {
  //     navigate("/login");
  //     toast.error("Please login to add to cart");
  //     return;
  //   }

  //   try {
  //     const response = await api.post(`Cart/${shirt.id}`);
  //     console.log(response.data);
  //     dispatch(addToCart(shirt));
  //   } catch (err) {
  //     console.error(err.response.data);
  //   }
  // };

  // const handleCardClick = () => {
  //   dispatch(setSelectedshirt(shirt));
  //   navigate(`/product-details/${shirt.id}`);
  // };

  // const handleCompareClick = (e) => {
  //   e.stopPropagation();
  //   dispatch(addToCompare(shirt));
  // };
  const handleOnClick = () => {
    window.scrollTo(0, 0);
    navigate(`/detail/${shirt.id}`, {
      state: {
        shirtId: { id: shirt.id },
      },
    });
  };
  let imageUrl = "https://isto.pt/cdn/shop/files/Heavyweight_Black_ef459afb-ff7a-4f9a-b278-9e9621335444.webp?v=1747408912";

  // Nếu shirt.images là mảng object hoặc json string
  if (shirt.images) {
    let images =
      typeof shirt.images === "string"
        ? JSON.parse(shirt.images)
        : shirt.images;

    if (Array.isArray(images) && images.length > 0) {
      const imgObj = images.find((img) => img.isPrimary) || images[0];
      imageUrl = typeof imgObj === "string" ? imgObj : imgObj.url;
    }
  } else if (shirt.image) {
    // Trường hợp chỉ có 1 trường image (url)
    imageUrl = shirt.image;
  }
  return (
    <div className="shirt-card" onClick={handleOnClick}>
      <img src={imageUrl} alt={shirt.name} />
      <div className="shirt-card__actions">
        {/* <button className="action-button" onClick={() => alert("hello")}>
          <span className="icon">⇄</span> Compare
        </button> */}
      </div>
      <div className="shirt-card__content">
        <div className="shirt-card__info">
          <div className="name">{shirt.name}</div>
          <div className="price">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(shirt.price)}
          </div>
          {/* <div className="category">Category: {shirt.name}</div> */}
          {/* <div className="status" title={shirt.status.toLowerCase() === "sold out" ? "×" : ""}>
            Status: {shirt.status}
          </div> */}
        </div>
        {/* <button 
  className={`button ${shirt.status?.toLowerCase() === "sold out" ? "disabled" : ""}`} 
  onClick={() => alert("hello")}
  disabled={shirt.status?.toLowerCase() === "sold out"}
>
  {shirt.status?.toLowerCase() === "sold out" ? "Sold Out" : "Add to Cart"}
</button> */}
      </div>
    </div>
  );
}

export default Card;
