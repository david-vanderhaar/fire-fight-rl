import * as Helper from '../../helper';

export const generate = (map, offsetX, offsetY, buildingSize = 6, unitSize = 6, borderWidth = 1) => {
  let data = {};
  const floorPlan = createFloorPlan(buildingSize);
  floorPlan.forEach((unit, i) => {
    let offsetUnit = {
      x: unit.x + offsetX + (unitSize * unit.x),
      y: unit.y + offsetY + (unitSize * unit.y),
    }
    createUnit(map, offsetUnit, unitSize, 0)
  })
  removeInnerWalls(map);
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
    const tile = map[key];
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