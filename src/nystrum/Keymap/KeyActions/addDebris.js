import * as Helper from '../../../helper';
import * as Constant from '../../constants';
import { Debris } from '../../entites';
import * as Item from '../../items';

export const addDebris = (game, name = 'box', character = '%', durability = 10) => {    
  let debrisPosArray = Object.keys(game.map).filter((key) => game.map[key].type === 'FLOOR')
  let debrisPos = Helper.getRandomInArray(debrisPosArray);
  let posXY = debrisPos.split(',')
  let box = new Debris({
    pos:{
      x: posXY[0],
      y: posXY[1]
    },
    renderer: {
      character,
      color: Constant.THEMES.SOLARIZED.base2,
      background: Constant.THEMES.SOLARIZED.base01,
    },
    name,
    game,
    durability,
  })
  game.placeActorOnMap(box)
  game.draw();
}
