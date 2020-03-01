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
      g: {
        activate: () => Keymap.activateGrab(engine),
        label: 'grab',
      },
      r: {
        activate: () => Keymap.releaseGrab(engine),
        label: 'release',
      },
      i: {
        activate: () => Keymap.activateInventory(engine),
        label: 'Open Inventory',
      },
      b: {
        activate: () => Keymap.addDebris(engine.game),
        label: 'Add Debris',
      },
      y: {
        activate: () => Keymap.addActor(engine.game),
        label: 'Add Actor',
      },
      f: {
        activate: () => Keymap.chop(engine),
        label: 'chop',
      },
    };
  }
  // instantiate class
  let actor = new Entity.Player({
    pos: { x: 19, y: 23 },
    renderer: {
      character: 'F',
      color: Constant.THEMES.SOLARIZED.base3,
      background: Constant.THEMES.SOLARIZED.yellow,
    },
    name: 'Fire Fighter',
    actions: [],
    speed: 100,
    durability: 4,
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