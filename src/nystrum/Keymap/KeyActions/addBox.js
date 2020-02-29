import * as Helper from '../../../helper';
import { Box } from '../../entites';
import * as Item from '../../items';

export const addBox = (game) => {

  let pos = Helper.getRandomPos(game.map).coordinates

  let actor = new Box({
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
  if (game.randomlyPlaceActorOnMap(actor)) {
    game.draw();
  };
}
