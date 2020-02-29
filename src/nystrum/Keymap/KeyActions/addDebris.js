import * as Helper from '../../../helper';
import { Debris } from '../../entites';
import * as Constant from '../../constants';
import * as Item from '../../items';

export const addDebris = (game) => {
  

  let pos = Helper.getRandomPos(game.map).coordinates

  let box = new Debris({
    pos,
    renderer: {
      character: '▄',
      color: Constant.THEMES.SOLARIZED.base1,
      background: '',
    },
    name: 'Box',
    game,
    durability: 10,
  })

  let stick = new Debris({
    pos,
    renderer: {
      character: '/',
      color: 'black',
      background: '',
    },
    name: 'stick',
    game,
    durability: 5,
  })

  if (game.randomlyPlaceActorOnMap(box) && game.randomlyPlaceActorOnMap(stick)) {
    game.draw();
  };
}
