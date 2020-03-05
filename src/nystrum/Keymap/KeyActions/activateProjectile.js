import * as Action from '../../actions';
import * as Item from '../../items';
import * as Constant from '../../constants';
import { UI_Actor } from '../../entites';
import { moveCursor } from './moveCursor';
import { createFourDirectionMoveOptions } from '../helper';

const trigger = (engine, actor, radius = 1) => {
  let cursor = engine.actors[engine.currentActor];

  actor.setNextAction(
    // new Action.Say({
    //   game: engine.game,
    //   actor,
    //   message: 'I\'ll crush you!',
    //   energyCost: Constant.ENERGY_THRESHOLD
    // })
    new Action.SprayWater({
      targetPos: { ...cursor.pos },
      radius,
      game: engine.game,
      actor,
      energyCost: Constant.ENERGY_THRESHOLD
    })
  )
}

const keymap = (engine, initiatedBy, previousKeymap, radius) => {
  const goToPreviousKeymap = () => {
    let cursor = engine.actors[engine.currentActor];
    cursor.active = false;
    engine.game.removeActor(cursor);
  };
  return {
    Escape: {
      activate: goToPreviousKeymap,
      label: 'Close',
    },
    ...createFourDirectionMoveOptions(moveCursor, engine),
    t: {
      activate: () => {
        trigger(engine, initiatedBy, radius);
        goToPreviousKeymap();
      },
      label: 'activate'
    },
  };
}

export const activateProjectile = (engine, radius) => {
  let currentActor = engine.actors[engine.currentActor]
  let game = engine.game;
  let pos = currentActor.pos;

  let cursor = new UI_Actor({
    initiatedBy: currentActor,
    range: 3,
    pos,
    renderer: {
      character: '█',
      color: 'white',
      background: '',
    },
    name: 'Cursor',
    game,
    keymap: keymap(engine, currentActor, { ...currentActor.keymap }, radius),
  })
  engine.addActorAsPrevious(cursor);
  game.placeActorOnMap(cursor)
  game.draw()
}