import BlogPost from "../../components/blog";
import Carousel from "../../components/carousel";
import HomeList from "../../components/homeList";
import ShopList from "../../components/shopList";

const Home = () => {
  
  return (
    <div>
      <Carousel autoplay={true} numberOfItems={4} />
      {/* <KoiIntroduction />
        <Carousel numberOfSlides={3} />
        <BlogPost /> */}
      {/* <Carousel numberOfSlides={3} /> */}
      <HomeList />
      <BlogPost />

      {/* <KoiNews />  */}
    </div>
  );
};

export default Home;
