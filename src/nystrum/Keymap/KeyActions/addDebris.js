import * as Helper from '../../../helper';
import * as Constant from '../../constants';
import { Debris } from '../../entites';
import * as Item from '../../items';

export const addDebris = (game) => {
  
  let pos = null

  for (let i = 5; i > 0; i--) {
    let box = new Debris({
      pos,
      renderer: {
        character: '%',
        color: Constant.THEMES.SOLARIZED.base2,
        background: Constant.THEMES.SOLARIZED.base01,
      },
      name: 'Box',
      game,
      durability: 3,
    })
    game.randomlyPlaceActorOnMap(box)
  }

  for (let i = 5; i > 0; i--) {
    let stick = new Debris({
      pos,
      renderer: {
        character: 'L',
        color: Constant.THEMES.SOLARIZED.base2,
        background: Constant.THEMES.SOLARIZED.base01,
      },
      name: 'Stick',
      game,
      durability: 3,
    })
    game.randomlyPlaceActorOnMap(stick)
  }
  game.draw();
}
