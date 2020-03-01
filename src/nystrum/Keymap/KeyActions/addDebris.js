import * as Helper from '../../../helper';
import * as Constant from '../../constants';
import { Debris } from '../../entites';
import * as Item from '../../items';

export const addDebris = (game) => {
  
  let pos = null

  for (var i = 20; i > 0; i--) {
    var box = new Debris({
      pos,
      renderer: {
        character: '%',
        color: Constant.THEMES.SOLARIZED.base2,
        background: Constant.THEMES.SOLARIZED.base01,
      },
      name: 'Box',
      game,
      durability: 10,
    })
    game.randomlyPlaceActorOnMap(box)
  }

  for (var i = 20; i > 0; i--) {
    var stick = new Debris({
      pos,
      renderer: {
        character: 'L',
        color: Constant.THEMES.SOLARIZED.base2,
        background: Constant.THEMES.SOLARIZED.base01,
      },
      name: 'stick',
      game,
      durability: 5,
    })
    game.randomlyPlaceActorOnMap(stick)
  }
  game.draw();
}
