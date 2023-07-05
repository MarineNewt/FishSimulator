import { createContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import useAnimationFrame from "../hooks/useAnimationFrame";
import {findClosest, applyForce, updatePosition, distanceBetween, limitVelocity} from "./Movements";

export const OceanContext = createContext();

const generateStats = (count, type, maxX, maxY) => {
  const positions = [];
  let mxspeedbuff = 0;
  let forcebuff = 0;
  if(type === "shark"){mxspeedbuff = 0.6; forcebuff = 0.008}
  if(type === "fish"){mxspeedbuff = 0.4; forcebuff = 0.002}
  for (let i = 0; i < count; i++) {
    const position = {
      id: uuidv4(),
      x: Math.random() * maxX,
      y: Math.random() * maxY,
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      energy: 300,
      traits: {
        maxSpeed: Math.random() * 1 + mxspeedbuff,  //max velocity
        force: Math.random() * 0.02 + forcebuff,  //force towards fish, food
        species: Math.floor(Math.random() * 2)    // 0 or 1 species
      }
    };
    positions.push(position);
  }

  return positions;
};

export const OceanProvider = ({ children }) => {
  const [fishes, setFishes] = useState([]);
  const [sharks, setSharks] = useState([]);
  const [food, setFood] = useState([]);

  const maxX = window.innerWidth;
  const maxY = window.innerHeight;

  useState(() => {
    setFishes(generateStats(50, "fish", maxX, maxY));
    setSharks(generateStats(2, "shark",maxX, maxY));
    setFood(generateStats(100, "food", maxX, maxY));
  }, []);

  const alignForce = (entity, neighbors, maxX, maxY, alignmentFactor) => {
    let totalX = 0;
    let totalY = 0;
    let count = 0;

    neighbors.forEach((neighbor) => {
      const distanceX = neighbor.x - entity.x;
      const distanceY = neighbor.y - entity.y;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      if (distance > 0 && distance < 50) {
        totalX += neighbor.velocity.x;
        totalY += neighbor.velocity.y;
        count++;
      }
    });

    if (count > 0) {
      totalX /= count;
      totalY /= count;

      const desiredVelocity = {
        x: (totalX - entity.velocity.x) * alignmentFactor,
        y: (totalY - entity.velocity.y) * alignmentFactor
      };

      entity.acceleration.x += desiredVelocity.x;
      entity.acceleration.y += desiredVelocity.y;
    }
  };

  const cohesionForce = (entity, neighbors, maxX, maxY, cohesionFactor) => {
    let totalX = 0;
    let totalY = 0;
    let count = 0;

    neighbors.forEach((neighbor) => {
      const distanceX = neighbor.x - entity.x;
      const distanceY = neighbor.y - entity.y;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      if (distance > 0 && distance < 50) {
        totalX += neighbor.x;
        totalY += neighbor.y;
        count++;
      }
    });

    if (count > 0) {
      totalX /= count;
      totalY /= count;

      const target = {
        x: totalX,
        y: totalY
      };

      applyForce(entity, target, cohesionFactor);
    }
  };

  const separationForce = (agent, agents, separationDistance) => {
    let forceX = 0;
    let forceY = 0;
    let count = 0;

    agents.forEach((other) => {
      if (other.id === agent.id) {
        return;
      }

      const distanceX = other.x - agent.x;
      const distanceY = other.y - agent.y;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      if (distance < separationDistance) {
        forceX -= distanceX;
        forceY -= distanceY;
        count++;
      }
    });

    if (count > 0) {
      forceX /= count;
      forceY /= count;

      const forceMagnitude = Math.sqrt(forceX * forceX + forceY * forceY);
      if (forceMagnitude > 0) {
        forceX = (forceX / forceMagnitude) * 0.03;
        forceY = (forceY / forceMagnitude) * 0.03;
      }
    }

    agent.acceleration.x += forceX;
    agent.acceleration.y += forceY;
  };

  const randomForce = (entity, randomFactor) => {
    entity.acceleration.x += (Math.random() * 2 - 1) * randomFactor;
    entity.acceleration.y += (Math.random() * 2 - 1) * randomFactor;
  };

  const endforce = (entity, maxX, maxY) => {
    const distanceX = maxX - entity.x;
    const distanceY = maxY - entity.y;
    if(distanceX < 15 || entity.x < 15 || distanceY < 15 || entity.y < 15 ){
      const target = {
        x: maxX/2,
        y: maxY/2
      };
      applyForce(entity, target, 0.02);
    }
  };

  const respawnFood = (index) => {
    setFood((prevFood) => {
      const newFood = [...prevFood];
      newFood.splice(index, 1, {
        id: uuidv4(),
        x: Math.random() * maxX,
        y: Math.random() * maxY,
        rotation: Math.random() * 360,
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 }
      });
      return newFood;
    });
  };

  const removeFish = (fishId) => {
    setFishes((prevFishes) => {
      return prevFishes.filter((fish) => fish.id !== fishId);
    });
  };

  const removeShark = (sharkId) => {
    setSharks((prevSharks) => {
      return prevSharks.filter((shark) => shark.id !== sharkId);
    });
  };

  const calculateEnergyCost = (entity) => {
    const speedCost =
      (Math.abs(entity.velocity.x) + Math.abs(entity.velocity.y)) * 0.1;
    const forceCost =
      (Math.abs(entity.acceleration.x) + Math.abs(entity.acceleration.y)) * 1;
    return speedCost + forceCost;
  };

  const updateFish = (fish, index) => {
    // Fish behavior and movement code
    const closestFood = findClosest(fish, food)[0];
    const closestShark = findClosest(fish, sharks)[0];
    const [closestFish, fishDistance] = findClosest(fish, fishes);

    fish.energy -= calculateEnergyCost(fish);

    if (closestFood) applyForce(fish, closestFood, fish.traits.force);

    randomForce(fish, 0.005);
    separationForce(fish, fishes, 20);
    alignForce(fish, fishes, maxX, maxY, 0.1);
    cohesionForce(fish, fishes, maxX, maxY, 0.01);
    endforce(fish, maxX, maxY);

    // Apply avoidance force if the shark is too close
    if (closestShark) {
      const distanceToShark = distanceBetween(fish, closestShark);
      if (distanceToShark < 100) {
        applyForce(fish, closestShark, (-0.3 * (100 - distanceToShark)) / 100);
      }
    }

    limitVelocity(fish, fish.traits.maxSpeed);
    updatePosition(fish, maxX, maxY);

    // Check if the fish can eat food
    food.forEach((foodParticle, foodIndex) => {
      const distanceX = foodParticle.x - fish.x;
      const distanceY = foodParticle.y - fish.y;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      if (distance < 10) {
        respawnFood(foodIndex);
        fish.energy += 50;
      }
    });

    if (fish.energy <= 0) {
      removeFish(fish.id);
      return;
    }

    let groupCenterX = 0;
    let groupCenterY = 0;
    let groupCount = 0;

    fishes.forEach((otherFish) => {
      const distance = distanceBetween(fish, otherFish);
      if (distance < 100 && distance > 0) {
        groupCenterX += otherFish.x;
        groupCenterY += otherFish.y;
        groupCount++;
      }
    });

    if (groupCount > 0) {
      groupCenterX /= groupCount;
      groupCenterY /= groupCount;

      const groupCenter = { x: groupCenterX, y: groupCenterY };
      applyForce(fish, groupCenter, 0.005);
    }
  };

  const updateShark = (shark) => {
    // Shark behavior and movement code
    const closestFish = findClosest(shark, fishes)[0];
    const [closestShark, sharkDistance] = findClosest(shark, sharks);
    if (closestFish) applyForce(shark, closestFish, shark.traits.force);
    updatePosition(shark, maxX, maxY);

    separationForce(shark, sharks, 30);

    limitVelocity(shark, shark.traits.maxSpeed);

    shark.energy -= calculateEnergyCost(shark);

    // Check if a shark can eat a fish
    fishes.forEach((fish, fishIndex) => {
      const distanceX = fish.x - shark.x;
      const distanceY = fish.y - shark.y;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      if (distance < 20) {
        const fishEnergy = fishes[fishIndex].energy;
        shark.energy += fishEnergy / 10;
        removeFish(fish.id);
      }
    });

    if (shark.energy <= 0) {
      removeShark(shark.id);
      return;
    }
  };

  useAnimationFrame(() => {
    setSharks((sharks) =>
      sharks.map((shark) => {
        updateShark(shark);
        return { ...shark };
      })
    );

    setFishes((fishes) =>
      fishes.map((fish) => {
        updateFish(fish);
        return { ...fish };
      })
    );

    if (Math.random() < 0.01)
      setFishes(fishes.concat(generateStats(1, "fish", maxX, maxY)));
    if (Math.random() < 0.0005)
      setSharks(sharks.concat(generateStats(1, "shark", maxX, maxY)));
  });

  return (
    <OceanContext.Provider value={{ fishes, sharks, food }}>
      {children}
    </OceanContext.Provider>
  );
};
