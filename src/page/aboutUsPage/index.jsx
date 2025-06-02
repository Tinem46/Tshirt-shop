import "./index.scss";

import { motion } from "framer-motion";
import { FaStore, FaUsers, FaHistory, FaBuilding } from "react-icons/fa";

function AboutUs() {
  return (
    <div className="aboutUs" data-aos="fade-up">
      {/* Hero Section */}
      <div
        className="aboutUs__hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <img
          src={
            "https://cdn2.fptshop.com.vn/unsafe/Uploads/images/tin-tuc/176898/Originals/anh-bia-thoi-trang%20(15).jpg"
          }
          alt="Stylish T-shirts"
          className="aboutUs__heroImage"
        />
        <div className="aboutUs__heroContent">
          <h1 style={{ color: "white" }}>Welcome to T-Shirt Shop</h1>
          <p>Your ultimate destination for premium quality T-shirts</p>
        </div>
      </div>

      {/* Mission Statement */}
      <div
        className="aboutUs__mission"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <h2>Our Mission</h2>
        <p>
          At TeeStyle Shop, we aim to bring you the latest trends in T-shirt
          fashion, combining comfort, style, and sustainability. Our curated
          collection features unique designs crafted with high-quality materials
          to ensure durability and a perfect fit. We believe in eco-friendly
          production processes and strive to reduce our environmental footprint.
        </p>
      </div>

      {/* Store's Founding History */}
      <div className="aboutUs__storeHistory">
        <h2>
          <FaBuilding /> Our Store's History
        </h2>
        <p>
          Founded in 2010 by fashion enthusiast Anna Lee, TeeStyle Shop started
          as a small boutique in downtown Portland. With a passion for graphic
          design and streetwear culture, Anna created a brand that resonates
          with people who want to express themselves through their clothing.
        </p>
        <p>
          Over the years, TeeStyle has grown into a trusted name in casual
          fashion, expanding our range to include eco-conscious fabrics and
          limited-edition artist collaborations. Our commitment to quality and
          customer satisfaction has been the cornerstone of our success.
        </p>
        <p>
          Today, we serve customers worldwide via our online platform and
          physical stores in Portland, Seattle, and San Francisco, continuing to
          inspire creativity and confidence through fashion.
        </p>
      </div>

      {/* History of T-shirts */}
      <div className="aboutUs__history" id="aboutUs__history">
        <h2>
          <FaHistory /> The History of T-shirts
        </h2>
        <div className="aboutUs__historyContent">
          <img
            src={
              "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1350&q=80"
            }
            alt="History of T-shirts"
            className="aboutUs__historyImage"
          />
          <div>
            <p>
              The humble T-shirt originated in the early 20th century as an
              undergarment worn by workers and soldiers. Its simple design and
              comfort quickly made it a popular piece of casual clothing
              worldwide.
            </p>
            <p>
              In the 1950s and 60s, T-shirts became a canvas for self-expression
              through printed slogans, band logos, and artwork, turning them
              into an iconic symbol of youth culture and rebellion.
            </p>
            <p>
              Today, T-shirts are a staple in fashion, embraced by all ages and
              styles. They continue to evolve with new materials, fits, and
              designs, reflecting personal and cultural identities across the
              globe.
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div
        className="aboutUs__whyChooseUs"
        id="aboutUs__whyChooseUs"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <h2>Why Choose Us?</h2>
        <div className="aboutUs__reasons">
          <div className="aboutUs__reason">
            <h3>Premium Quality Materials</h3>
            <p>
              Our T-shirts are made from soft, breathable fabrics that last wash
              after wash.
            </p>
          </div>
          <div className="aboutUs__reason">
            <h3>Unique Designs</h3>
            <p>
              Collaborations with talented artists bring exclusive prints and
              styles just for you.
            </p>
          </div>
          <div className="aboutUs__reason">
            <h3>Eco-Friendly Practices</h3>
            <p>
              We prioritize sustainable manufacturing and packaging to protect
              our planet.
            </p>
          </div>
        </div>
      </div>

      {/* T-shirt Varieties Gallery */}
      <div
        className="aboutUs__gallery"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <h2>Explore Our T-shirt Collection</h2>
        <div className="aboutUs__galleryContent">
          <img
            src={
              "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1350&q=80"
            }
            alt="T-shirt Collection"
            className="aboutUs__varietyImage"
          />
          <p>
            From classic crew necks to trendy graphic tees, explore our wide
            range of styles and colors perfect for every occasion.
          </p>
        </div>
      </div>

      {/* Our Team Section */}
      <div
        className="aboutUs__team"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <h2>
          <FaUsers /> Our Team
        </h2>
        <p>
          Meet our passionate team of fashion designers, marketers, and customer
          service experts who strive to bring you the best T-shirt shopping
          experience possible.
        </p>
      </div>

      {/* Store Locations Section */}
      <div
        className="aboutUs__locations"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        <h2>
          <FaStore /> Our Store Locations
        </h2>
        <ul>
          <li>
            Portland, OR: Our flagship store featuring the full TeeStyle
            collection.
          </li>
          <li>Seattle, WA: A trendy spot for exclusive releases and events.</li>
          <li>
            San Francisco, CA: Our boutique store in the heart of the city’s
            fashion district.
          </li>
        </ul>
      </div>
    </div>
  );
}

export default AboutUs;
