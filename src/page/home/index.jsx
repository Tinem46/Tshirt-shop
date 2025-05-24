import BlogPost from "../../components/blog";
import Carousel from "../../components/carousel";
import MenuForShop from "../../components/menu";
import ShopList from "../../components/shopList";

const Home=()=> {
    const ListTitleStyle = {
        marginBottom: "50px",
        textAlign: "center",
        fontSize: "40px", 
        marginTop: "50px",
        color: "black", 
        // textShadow: "1px 1px 2px #000"
        gap:"10px"
    };

    return (
      <div>
        <Carousel autoplay={true} />
        {/* <KoiIntroduction />
        <Carousel numberOfSlides={3} />
        <BlogPost /> */}
        <Carousel numberOfSlides={3} />
        <h1 style={ListTitleStyle}>Tất cả sản phẩm</h1> 
        
        <ShopList />
        <BlogPost/>
        
        {/* <KoiNews />  */}
      </div>
    );
}

export default Home;
