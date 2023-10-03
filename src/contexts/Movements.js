//Movements.js
 
export const applyForce = (entity, target, forceAmount) => {
    const distanceX = target.x - entity.x;
    const distanceY = target.y - entity.y;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
  
    const forceX = (distanceX / distance) * forceAmount;
    const forceY = (distanceY / distance) * forceAmount;
  
    entity.acceleration.x += forceX;
    entity.acceleration.y += forceY;
};

export const cohesionForce = (entity, neighbors, maxX, maxY, cohesionFactor) => {
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

export const alignForce = (entity, neighbors, maxX, maxY, alignmentFactor) => {
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

export const separationForce = (agent, agents, separationDistance) => {
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

export const randomForce = (entity, randomFactor) => {
  if(Math.random() > 0.999){
    entity.velocity.x += ((Math.random() * 2) - 1)
    entity.velocity.y += ((Math.random() * 2) - 1)
  }
};

export const endforce = (entity, maxX, maxY) => {
  const distanceX = maxX - entity.x;
  const distanceY = maxY - entity.y;
  if(distanceX < 20 || entity.x < 20 || distanceY < 20 || entity.y < 20 ){
    const target = {
      x: maxX/2,
      y: maxY/2
    };
    applyForce(entity, target, 0.02);
  }
};

export const findClosest = (entity, targets) => {
    let closest = null;
    let closestDistance = Infinity;
  
    targets.forEach((target) => {
      if (target.id === entity.id) return;
  
      const distanceX = target.x - entity.x;
      const distanceY = target.y - entity.y;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
  
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = target;
      }
    });
  
    return [closest, closestDistance];
};

export const updatePosition = (entity, maxX, maxY) => {
    entity.velocity.x += entity.acceleration.x;
    entity.velocity.y += entity.acceleration.y;
  
    entity.x += entity.velocity.x;
    entity.y += entity.velocity.y;
  
    // Boundary check
    if (entity.x < 0) {
      entity.x = 0;
      entity.velocity.x *= -1;
    } else if (entity.x > maxX) {
      entity.x = maxX;
      entity.velocity.x *= -1;
    }
  
    if (entity.y < 0) {
      entity.y = 0;
      entity.velocity.y *= -1;
    } else if (entity.y > maxY) {
      entity.y = maxY;
      entity.velocity.y *= -1;
    }
  
    entity.acceleration.x = 0;
    entity.acceleration.y = 0;
};

export const distanceBetween = (entity1, entity2) => {
    const distanceX = entity2.x - entity1.x;
    const distanceY = entity2.y - entity1.y;
    return Math.sqrt(distanceX * distanceX + distanceY * distanceY);
};
  
export const limitVelocity = (entity, maxSpeed) => {
    const speed = Math.sqrt(
      entity.velocity.x * entity.velocity.x +
        entity.velocity.y * entity.velocity.y
    );
  
    if (speed > maxSpeed) {
      entity.velocity.x = (entity.velocity.x / speed) * maxSpeed;
      entity.velocity.y = (entity.velocity.y / speed) * maxSpeed;
    }
};