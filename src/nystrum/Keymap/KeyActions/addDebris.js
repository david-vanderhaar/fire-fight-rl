import * as Helper from '../../../helper';
import { Debris } from '../../entites';
import * as Item from '../../items';

export const addDebris = (game) => {
  

  let pos = Helper.getRandomPos(game.map).coordinates

  let box = new Debris({
    pos,
    renderer: {
      character: 'B',
      color: 'brown',
      background: 'brown',
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
