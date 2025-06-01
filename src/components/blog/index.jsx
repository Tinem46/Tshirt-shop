import "./index.scss";
import { useNavigate } from "react-router-dom";

const BlogPost = () => {
  const navigate = useNavigate();

  const handleSeeMore = (section) => {
    switch (section) {
      case "history":
        navigate("/aboutUs#aboutUs__history");
        break;
      case "guide":
        navigate("/aboutUs#aboutUs__whyChooseUs");
        break;
      default:
        navigate("/aboutUs");
    }
  };

  return (
    <>
      <div className="image-list">
        <div className="image-item" onClick={() => handleSeeMore("history")}>
          <img
            src="https://i.pinimg.com/originals/9b/b6/33/9bb633802347a8f26561c389203e0829.jpg"
            alt="History"
          />
          <div className="overlay-text">Best Seller</div>
        </div>
        <div className="image-item" onClick={() => handleSeeMore("guide")}>
          <img
            src="https://s3-ap-southeast-1.amazonaws.com/images.spiderum.com/sp-images/d6f7b9e08eb711ea8bad610c55978e95.jpg"
            alt="Guide"
          />
          <div className="overlay-text">Best Seller</div>
        </div>
      </div>
    </>
  );
};

export default BlogPost;
