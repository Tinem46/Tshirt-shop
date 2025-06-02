import BlogPost from "../../components/blog";
import Carousel from "../../components/carousel";
import HomeList from "../../components/homeList";
import "aos/dist/aos.css";

const Home = () => {
  return (
    <div>
      <div data-aos="fade-up">
        <Carousel autoplay={true} numberOfItems={4} />
      </div>
      <div data-aos="fade-up" data-aos-delay="600">
        <HomeList />
      </div>
      <div data-aos="fade-up" data-aos-delay="800">
        <BlogPost />
      </div>
    </div>
  );
};

export default Home;
