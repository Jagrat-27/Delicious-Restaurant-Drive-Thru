import React from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "../css/navstyles.css";
import {useNavigate} from 'react-router-dom';

function Navbar() {
    const navigate=useNavigate()
    function nextLogin(){
        navigate("/registeration");
    }
  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        <div id="cname">
          Delicious<span className="cspan">Food</span>
        </div>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className="nav-link active" aria-current="page" href="/">
                Home
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="reservation">
                Reservation
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/staffRegisteration">
                Staff
              </a>
            </li>
            
             <button class="nav-item button" type="submit" onClick={nextLogin}>Login</button>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
