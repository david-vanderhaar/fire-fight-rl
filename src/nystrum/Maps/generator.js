import * as Helper from '../../helper';

export const generate = (map, offsetX, offsetY, buildingSize = 6, unitSize = 6, borderWidth = 1) => {
  let data = {};
  const floorPlan = createFloorPlan(buildingSize);
  let maxX = 0; 
  let minX = 0; 
  let maxY = 0; 
  let minY = 0; 
  floorPlan.forEach((pos) => {
    if (pos.x > maxX) maxX = pos.x;
    if (pos.x < minX) minX = pos.x;
    if (pos.y > maxY) maxY = pos.y;
    if (pos.y < minY) minY = pos.y;
  })
  const floorPlanWidth = Math.abs(maxX) + Math.abs(minX) + 1;
  const floorPlanHeight = Math.abs(maxY) + Math.abs(minY) + 1;
  console.log(floorPlanWidth);
  console.log(floorPlanHeight);
  
  floorPlan.forEach((unit, i) => {
    let offsetUnit = {
      x: unit.x + offsetX + (unitSize * unit.x),
      y: unit.y + offsetY + (unitSize * unit.y),
    }
    createUnit(map, offsetUnit, unitSize, 0)
  })
  removeInnerWalls(map);
  addInnerWalls(map);
  return data;
}

const createFloorPlan = (unitCount) => {
  // create origin
  let result = [{x: 0, y: 0}];
  // until result meets unit count 
  for (let i = 0; i < unitCount - 1; i++) {
    // randomly choose previously created unit
    let origin = Helper.getRandomInArray(result);
    // randomly choose neighboring point
    let newUnit = Helper.getRandomInArray(getNeighboringPoints(origin));
    let unitAlreadyExists = result.filter((unit) => unit.x === newUnit.x && unit.y === newUnit.y).length > 0;
    let kill = 100
    while (unitAlreadyExists) {
      newUnit = Helper.getRandomInArray(getNeighboringPoints(origin));
      unitAlreadyExists = result.filter((unit) => unit.x === newUnit.x && unit.y === newUnit.y).length > 0;
      kill -= 1;
      if (kill <= 0) unitAlreadyExists = false;
    }
    // add this point as a new unit
    result.push(newUnit);
  }
  return result
}

const getNeighboringPoints = (origin, eightWay = false) => {
  const neighbors = [
    {
      x: origin.x,
      y: origin.y + 1
    },
    {
      x: origin.x + 1,
      y: origin.y
    },
    {
      x: origin.x,
      y: origin.y - 1
    },
    {
      x: origin.x - 1,
      y: origin.y
    },
  ]

  if (eightWay) {
    neighbors = neighbors.concat([
      {
        x: origin.x + 1,
        y: origin.y + 1
      },
      {
        x: origin.x + 1,
        y: origin.y - 1
      },
      {
        x: origin.x - 1,
        y: origin.y - 1
      },
      {
        x: origin.x - 1,
        y: origin.y + 1
      },
    ])
  }
  return neighbors;
}

const createUnit = (map, position, size, border) => {
  // const length = size; // this will leave a border
  // const length = size + 1; // this will close the gap
  const length = size + 1 - border; // this will calculate using border

  for (let i = 0; i < length; i++) {
    for (let j = 0; j < length; j++) {
      const newPosition = {
        x: position.x + i,
        y: position.y + j,
      }
      let type = 'FLOOR';
      if (i === 0 || i === (length - 1)) type = 'WALL';
      if (j === 0 || j === (length - 1)) type = 'WALL';
      let tile = map[Helper.coordsToString(newPosition)];
      if (tile) tile.type = type;
    }
  }
}

const removeInnerWalls = (map) => {
  let walls = Object.keys(map).filter((key) => {
    return map[key].type === 'WALL';
  })

  let innerWalls = walls.filter((key) => {
    const coordArray = key.split(',').map((i) => parseInt(i));
    const coords = {
      x: coordArray[0],
      y: coordArray[1],
    }
    const neighbors = getNeighboringPoints(coords, false).filter((point) => {
      let t = map[Helper.coordsToString(point)];
      if (t) {
        if (['WALL', 'FLOOR'].includes(t.type)) {
          return true;
        }
      }
      return false
    });
    
    if (neighbors.length === 4) {
      return true;
    }
    return false;
  })

  innerWalls.forEach((key) => {
    map[key].type = 'FLOOR';
  })
}

const addInnerWalls = (map, count = 2) => {
  // Finding corners
  let corners = Object.keys(map).filter((key) => {
    const tile = map[key];
    if (tile.type !== 'WALL') return false;
    const coordArray = key.split(',').map((i) => parseInt(i));
    const coords = {
      x: coordArray[0],
      y: coordArray[1],
    }
    const neighbors = getNeighboringPoints(coords, false).filter((point) => {
      let t = map[Helper.coordsToString(point)];
      if (t) {
        if (['GROUND'].includes(t.type)) {
          return true;
        }
      }
      return false
    });
    if (neighbors.length === 2) return true;
    return false
  })

  // building walls
  let wallCount = 0;
  while (wallCount < count) {
  // for (let i = 0; i < count; i++) {
    const corner = Helper.getRandomInArray(corners);
    const coordArray = corner.split(',').map((i) => parseInt(i));
    const coords = {
      x: coordArray[0],
      y: coordArray[1],
    }
    const wallNeighbors = getNeighboringPoints(coords, false).filter((point) => {
      let t = map[Helper.coordsToString(point)];
      if (t) {
        if (['WALL'].includes(t.type)) {
          return true;
        }
      }
      return false
    });
    const selectedWallPos = Helper.getRandomInArray(wallNeighbors)
    if (!selectedWallPos) continue;
    const direction = {
      x: Math.sign(selectedWallPos.x - coords.x),
      y: Math.sign(selectedWallPos.y - coords.y)
    };

    let kill = 100;
    let build = true;
    let currentPosition = {...coords}
    let previousFloorPositions = [];
    while (build) {
      currentPosition.x += direction.x;
      currentPosition.y += direction.y;
      let tile = map[Helper.coordsToString(currentPosition)];
      if (!tile) break;
      if (tile.type === 'WALL') continue;
      if (tile.type === 'FLOOR') {
        tile.type = 'WALL';
        previousFloorPositions.push({...currentPosition})
      } else if (tile.type === 'GROUND') {
        // go back two and make FLOOR
        let prevPos = {
          x: currentPosition.x - (direction.x * 2),
          y: currentPosition.y - (direction.y * 2),
        }
        map[Helper.coordsToString(prevPos)].type = 'DOOR';
        // go back one more and make FLOOR
        prevPos = {
          x: currentPosition.x - (direction.x * 3),
          y: currentPosition.y - (direction.y * 3),
        }
        map[Helper.coordsToString(prevPos)].type = 'DOOR';
        if (previousFloorPositions.length <= 0) {
          //   // we need to create another wall, this one is bust
          if (count <= 100) count += 1
        }
        break;
      }
      kill -= 1;
      if (kill <= 0) build = false;
    }
    wallCount += 1;
  }
}