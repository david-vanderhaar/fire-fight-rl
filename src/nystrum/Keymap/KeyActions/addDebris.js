import * as Helper from '../../../helper';
import { Debris } from '../../entites';
import * as Constant from '../../constants';
import * as Item from '../../items';

export const addDebris = (game) => {
  var boxArray = []
  var stickArray = []
  let pos = Helper.getRandomPos(game.map).coordinates

  for (var i = 20; i > 0; i--){
    var box = new Debris({
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
    game.randomlyPlaceActorOnMap(box)
  }
  
  for (var i = 20; i > 0; i--){
    var stick = new Debris({
      pos,
      renderer: {
        character: '/',
        color: Constant.THEMES.SOLARIZED.base1,
        background: '',
      },
      name: 'stick',
      game,
      durability: 5,
    })
    game.randomlyPlaceActorOnMap(stick)
  }
game.draw();
}
