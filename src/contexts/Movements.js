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