// import deps
import * as Item from '../items';
import * as Entity from '../entites';
import * as Constant from '../constants';
import * as Keymap from '../Keymap';
import { createEightDirectionMoveOptions } from '../Keymap/helper';

export default function (engine) {
  // define keymap
  const keymap = (engine) => {
    return {
      ...createEightDirectionMoveOptions(Keymap.walk, engine),
      s: {
        activate: () => Keymap.none(engine),
        label: 'stay',
      },
      f: {
          activate: () => Keymap.push(Constant.DIRECTIONS.E, engine),
          label: 'shove'
      }
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

  // add default items to container
  const kunais = Array(100).fill('').map(() => Item.directionalKunai(engine, { ...actor.pos }, null, 10));
  const swords = Array(2).fill('').map(() => Item.sword(engine));
  actor.container = [
    new Entity.ContainerSlot({
      itemType: kunais[0].name,
      items: kunais,
    }),
    new Entity.ContainerSlot({
      itemType: swords[0].name,
      items: swords,
    }),
  ]

  return actor;
}