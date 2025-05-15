import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import "../css/cardstyles.css"
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
function CardItem(props) {
  const addCartItem = async () => {
    if (JSON.parse(localStorage.getItem('user'))==null){
      alert("Please Login to Add item to cart")
    }
   const item={
    c_id:JSON.parse(localStorage.getItem('user'))['ID'],
    p_id:props.id,
    name:props.name,
    type:props.type,
    price:props.price
   }
    try {
      const res = await axios.post("http://localhost:5000/addcartitem", item);
      if (res.status === 200 || res.status === 201) {
        alert("Item added to the cart")
      }
    } catch (err) {
      console.error("Error adding item:", err);
    }
  };
  const type = props.type?.toLowerCase();
  let imageSrc = "";

  if (type === "punjabi") imageSrc = "./images/panner.jpg";
  else if (type === "chinese") imageSrc = "./images/chinese.jpg";
  else if (type === "cold drinks") imageSrc = "./images/fanta.jpg";
  else imageSrc = "./images/default.jpg"; // optional fallback image
  return <>
    <div class="card">
  <img src={imageSrc} class="card-img-top" alt="..."/>
      <div className="starMenu">
        <div className="card-left">
          <div className="name">{props.name}</div>
          <div >Rs. {props.price}</div>
        </div>
        <div className='book'>
          <button type="button" className="btn btn-success" onClick={addCartItem}>
            +Cart
          </button>
        </div>
      </div>
</div>
</>
}

export default CardItem;

