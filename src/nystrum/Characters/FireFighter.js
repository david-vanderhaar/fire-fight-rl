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
      i: {
        activate: () => Keymap.activateInventory(engine),
        label: 'Open Inventory',
      },
      b: {
        activate: () => Keymap.addDebris(engine.game),
        label: 'Add Debris',
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

  // default items to container
  const axe = Array(2).fill('').map(() => Item.axe(engine));
  actor.container = [
    new Entity.ContainerSlot({
      itemType: axe[0].name,
      items: axe,
    }),
  ]
  return actor;
}