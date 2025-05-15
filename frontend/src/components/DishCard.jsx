import React from "react";

const DishCard = (props) => {
  return (
    <div className="card border rounded-lg shadow-lg overflow-hidden max-w-xs">
      <div className="image-container h-40 bg-gray-200"><img src={props.img} alt="" /></div>
      <div className="card-content p-4">
        <h3 className="dish-name text-lg font-semibold">{props.name}</h3>
        <div className="card-info flex justify-between items-center mt-2">
          <div className="rating text-yellow-500">
            {[...Array(4)].map((_, i) => (
              <i key={i} className="fa fa-star"></i>
            ))}
          </div>
          <div className="time flex items-center text-gray-600">
            <i className="fa fa-clock mr-1"></i>
            <span>10 Mins</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DishCard;