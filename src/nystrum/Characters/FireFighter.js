// import deps
import * as Item from '../items';
import * as Entity from '../entites';
import * as Constant from '../constants';
import * as Keymap from '../Keymap';
import { createEightDirectionMoveOptions, createFourDirectionMoveOptions } from '../Keymap/helper';

export default function (engine) {
  // define keymap
  const keymap = (engine) => {
    return {
      ...createFourDirectionMoveOptions(Keymap.push, engine),
      s: {
        activate: () => Keymap.none(engine),
        label: 'stay',
      },
    };
  }
  // instantiate class
  let actor = new Entity.Player({
    pos: { x: 23, y: 7 },
    renderer: {
      character: 'F',
      color: 'red',
      background: 'yellow',
    },
    name: 'Fire Fighter',
    actions: [],
    speed: 400,
    durability: 20,
    keymap: keymap(engine),
  })
  return actor;
}