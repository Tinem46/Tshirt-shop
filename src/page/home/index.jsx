import BlogPost from "../../components/blog";
import Carousel from "../../components/carousel";
import HomeList from "../../components/homeList";
import "aos/dist/aos.css";

const Home = () => {
  return (
    <div>
      <div data-aos="fade-up">
        <Carousel
          autoplay={true}
          numberOfItems={4}
          imgs={[
            "https://theme.hstatic.net/1000306633/1001194548/14/slideshow_3.jpg?v=391",
            "https://file.hstatic.net/1000351433/file/artboard_3.jpg",
            "https://theme.hstatic.net/1000306633/1001194548/14/slideshow_2.jpg?v=391",
          ]}
        />
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
