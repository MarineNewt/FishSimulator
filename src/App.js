import React, { useContext } from "react";
import "./App.css";
import { OceanProvider, OceanContext } from "./contexts/Ocean";

const Fish = ({ x, y, energy, velocity, traits }) => {
  const angle = 45 + Math.atan2(velocity.y, velocity.x) * (180 / Math.PI);
  //#4DB6AC
  let color = "#bf7b37";
  if(traits.species === 1){color = "#FA932D"}
  if(traits.species === 2){color = "#C75220"}
  return (
    <div
      className="fish"
      style={{
        left: x,
        top: y,
        opacity: Math.max(0.3, energy / 100),
        transform: `rotate(${angle}deg)`
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 50 80"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M25 0C11.2 0 0 11.2 0 25c0 14.8 25 55 25 55s25-40.2 25-55c0-13.8-11.2-25-25-25zm0 38c-6.6 0-12-5.4-12-12s5.4-12 12-12 12 5.4 12 12-5.4 12-12 12z"
          fill = {color}
          transform="rotate(45 25 25)"
        />
      </svg>
    </div>
  );
};

const Shark = ({ x, y, energy, velocity }) => {
  const angle = 45 + Math.atan2(velocity.y, velocity.x) * (180 / Math.PI);

  return (
    <div
      className="shark"
      style={{
        left: x,
        top: y,
        opacity: Math.max(0.3, energy / 100),
        transform: `rotate(${angle}deg)`
      }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 50 80"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M25 0C11.2 0 0 11.2 0 25c0 14.8 25 55 25 55s25-40.2 25-55c0-13.8-11.2-25-25-25zm0 38c-6.6 0-12-5.4-12-12s5.4-12 12-12 12 5.4 12 12-5.4 12-12 12z"
          fill="darkblue"
          transform="rotate(45 25 25)"
        />
      </svg>
    </div>
  );
};

const Food = ({ x, y }) => (
  <div
    className="food"
    style={{
      left: x,
      top: y
    }}
  ></div>
);

const Ocean = () => {
  const { fishes, sharks, food } = useContext(OceanContext);

  return (
    <div className="ocean">
      {fishes.map((fish) => (
        <Fish key={fish.id} {...fish} />
      ))}
      {sharks.map((shark) => (
        <Shark key={shark.id} {...shark} />
      ))}
      {food.map((f) => (
        <Food key={f.id} x={f.x} y={f.y} />
      ))}
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <OceanProvider>
        <Ocean />
      </OceanProvider>
    </div>
  );
}

export default App;
