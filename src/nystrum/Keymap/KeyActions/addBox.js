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
  // game.placeActorOnMap(actor)
  if (game.randomlyPlaceActorOnMap(actor)) {
    // game.engine.addActor(actor);
    game.draw();
  };
}

  // renderer: {
  // character: 'R',
  // color: '#e6e6e6',
  // background: '#36635b',