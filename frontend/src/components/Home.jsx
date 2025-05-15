import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import Navbar from "./Navbar";
import Navbar2 from './Navbar2';
import CardItem from "./CardItem";
import DishCard from "./DishCard";
import "../css/home.css"; // Import custom CSS
import "../css/dishcard.css";

function Home() {
  const navigate=useNavigate();
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]); // Store original menu data

  useEffect(() => {
    axios.get("http://localhost:5000/menu")
      .then(res => {
        setData(res.data);
        setOriginalData(res.data); // Keep original data for filtering
        console.log("Menu data:", res.data);
      })
      .catch(err => {
        console.error("Error fetching menu:", err);
      });
  }, []); // Fetch data only once

  function punjabi() {
    const punjabiDishes = originalData.filter(item => item.DISHTYPE.toLowerCase() === "punjabi");
    setData(punjabiDishes);
  }

  function showAll() {
    setData(originalData); // Reset to full menu
  }

  function chinese() {
    const chineseDishes = originalData.filter(item => item.DISHTYPE.toLowerCase() === "chinese");
    setData(chineseDishes);
  }

  function coldDrinks() {
    const colddrinks = originalData.filter(item => item.DISHTYPE.toLowerCase() === "cold drinks");
    setData(colddrinks);
  }

  function book(){
    navigate('/reservation');
  }
  return (
    <>
      {localStorage.getItem('user')!=undefined? <Navbar2/> : <Navbar/>}

      {/* Carousel Section */}


      {/* Home Section */}
      <div className="container home-container">
        <div className="left">
          <div id="indian">i n d i a n</div>
          <div id="chataka">Chataka</div>
          <div id="desc">Enjoy delicious, freshly prepared meals made with the finest ingredients. We bring you a variety of mouthwatering dishes, delivered hot and fast to your doorstep. Easy ordering, secure payment, and great taste—all in one place! Order now and treat yourself to a flavorful experience.</div>
          <button id="ourmenu"><a href="#menu">Our Menu</a></button>
        </div>
        <div className="right">
          <div id="carouselExampleFade" className="right slide carousel-fade" data-bs-ride="carousel">
            <div className="carousel-inner">
              <div className="carousel-item active">
                <img src="./images/panner.jpg" className="carousel-img" alt="Delicious Indian Food" />
              </div>
              <div className="carousel-item">
                <img src="./images/chinese.jpg" className="carousel-img" alt="Spicy Food" />
              </div>
              <div className="carousel-item">
                <img src="./images/naan.jpg" className="carousel-img" alt="Tasty Curry Dish" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <div>
        <span className="popular">Popular Dishes:</span>
        <div className="item-container1">
          <DishCard name="Panner Masala" img="/images/panner.jpg"></DishCard>
          <DishCard name="Chinese Noodles" img="/images/chinese.jpg"></DishCard>
          <DishCard name="Naan" img="/images/naan.jpg"></DishCard>
          <DishCard name="Panner Masala" img="/images/panner.jpg"></DishCard>
        </div>
      </div>
      

      {/* About Us Section */}
      <div className="aboutUs">
        <div className="leftAbout">
          <div className="semi"></div>
          <div className="circle"><img src="/images/about.jpeg" alt="" /></div>
        </div>
        <div className="rightAbout">
          <span className="span">About Us</span>
          <p>Welcome to Delicious, your ultimate destination for delicious and high-quality food. We are passionate about serving fresh, flavorful, and carefully prepared dishes that bring joy to every bite. Our menu is crafted with love, using the finest ingredients to ensure a memorable dining experience. Whether you’re craving a hearty meal, a light snack, or a sweet treat, we have something for everyone.
            </p><div>At Delicious, customer satisfaction is our top priority. We believe that great food should be accessible, convenient, and enjoyable. That’s why we offer a seamless ordering process, secure payments, and fast delivery to bring your favorite dishes straight to your doorstep. Join us on this journey of taste and quality, and let us make every meal special for you!
</div>
          <button className="btn1"><a href="#menu">Our Menu</a></button>
        </div>
      </div>


      {/* Menu section */}
      <div className="menu" id="menu">
        <span>
          <li className="all" onClick={showAll}>Menu</li>
          <li onClick={punjabi}>Punjabi</li>
          <li onClick={chinese}>Chinese</li>
          <li onClick={coldDrinks}>Cold Drinks</li>
        </span>
      </div>
      <div className="displayCard">
        {data.length > 0 ? (
          <div className="gridContainer">
            {data.map((item, index) => (
              <div className="displayMenu" key={index}>
                <CardItem id={item.ID} type={item.DISHTYPE} name={item.DISHNAME} price={item.PRICE} />
              </div>
            ))}
          </div>
        ) : (
          <p>Loading menu...</p>
        )}
      </div>

      {/* Book a table */}
      <div className="bookTable">
        <div className="bookLeft">
          <div className="span">Discover The True Meaning Of Taste</div>
          <div className="bookContent">Good food is more than just taste—it’s an experience! We bring you a mix of flavors, made with care to make every bite special. Come and enjoy delicious food with us! Every dish is made with fresh ingredients and lots of love. Whether you love spicy, sweet, or savory, we have something for you. Let’s make every meal a tasty memory!
            From quick snacks to full meals, we offer a wide range of options to satisfy your cravings. Our chefs work hard to bring you meals that not only taste great but also make you feel at home. We believe in good food, great service, and happy moments. So sit back, relax, and let us serve you something truly delicious—because you deserve the best on every plate!</div>
          <button className="btn1" onClick={book}>Book Table</button>
        </div>
        <div className="bookRight">
          <div className="bookRight1"><img src="/images/reservation.jpg" alt="" /></div>
          <div className="bookRight2"></div>
        </div>
      </div>


      {/* How to Order */}
      {/* <div className="howToOrder">
        <div className="span title">How to order</div>
        <div className="orderContainer">
          <div className="orderItem">
            <div className="icon"></div>
            <div className="orderName">Select dish</div>
            <div className="orderContent">Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime laudantium sunt commodi a architecto laborum facere dolorum eligendi, provident magni molestias quod doloribus nisi eos modi? Culpa possimus sequi dicta in exercitationem? Dicta, delectus.
            </div>
          </div>
          <div className="orderItem">
            <div className="icon"></div>
            <div className="orderName">Select dish</div>
            <div className="orderContent">Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime laudantium sunt commodi a architecto laborum facere dolorum eligendi, provident magni molestias quod doloribus nisi eos modi? Culpa possimus sequi dicta in exercitationem? Dicta, delectus.
            </div>
          </div>
          <div className="orderItem">
            <div className="icon"></div>
            <div className="orderName">Select dish</div>
            <div className="orderContent">Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime laudantium sunt commodi a architecto laborum facere dolorum eligendi, provident magni molestias quod doloribus nisi eos modi? Culpa possimus sequi dicta in exercitationem? Dicta, delectus.
            </div>
          </div>
        </div>
      </div> */}

      {/* customer review */}
      <div className="review">
        <div className="reviewName">What Customer Says</div>
        <div className='reviewDisplay'>
          <div className="reviewBox"></div>
          <div className="reviewBox"></div>
        </div>
        <div className="reviews">
          <div className="r ">"I had an amazing experience with this food service! The flavors were rich, and the ingredients were fresh. Every dish was perfectly cooked and beautifully presented. The delivery was quick, and everything arrived hot. I will definitely be ordering again!"</div>
          <div className="r ">"From the first bite, I knew this was going to be a fantastic meal! The portions were generous, and the taste was absolutely incredible. I appreciate the attention to quality and freshness. The packaging was neat, and the food stayed warm. Highly recommended!"</div>
        </div>
        <div className="reviewCircle">
          <div className="c"><img src="/images/jagrat.jpg" alt="" /></div>
          <div className="c"><img src="/images/jagrat.jpg" alt="" /></div>
        </div>
      </div>


      {/* Footer section */}
      <div className="footer">
        <div className="footerLeft">
          <div className='cname'>Delicious <span className='cspan'>Food</span></div>
          <div>Tasty food, happy moments! Enjoy a variety of delicious dishes made just for you. Delicious food made with love! Whether you love spicy, sweet, or savory, we have it all.  Follow us to stay updated on our latest flavors!</div>
          <div className='footerImg'>
            <img src="/images/instagram.jpeg" alt=""/>
            <img src="/images/facebook.jpeg" alt="" />
          </div>
        </div>
        <div className="footerRight">
          <div>Contact Us</div>
          <div>XYZ law street,Ahmedabad</div>
          <div>deliciousfood@gmail.com</div>
          <div>@Copyright Delicious</div>
        </div>
      </div>

      {/* <div>
        <img className='cartImg'src="/images/cart.jpeg" alt="" />
      </div> */}
    </>
  );
}

export default Home;
