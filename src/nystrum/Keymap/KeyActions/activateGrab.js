import * as Action from '../../actions';
import * as Constant from '../../constants';
import { coordsToString } from '../../../helper';
import * as Item from '../../items';
import { UI_Actor } from '../../entites';
import { createFourDirectionMoveOptions } from '../helper';

const grabDirection = (direction, engine, actor) => {
  const pos = {
    x: actor.pos.x + direction[0],
    y: actor.pos.y + direction[1],
  };
  actor.setNextAction(
    new Action.GrabDirection({
      targetPos: pos,
      game: engine.game,
      actor,
      energyCost: Constant.ENERGY_THRESHOLD,
    })
  )
}

const keymapCursorToGrabEntity = (engine, initiatedBy, initialKeymap) => {
  return {
    ...createFourDirectionMoveOptions(
      (direction, engine) => {
        grabDirection(direction, engine, initiatedBy);
        initiatedBy.keymap = initialKeymap;
      },
      engine,
      'grab',
    )
  }
}

export const activateGrab = (engine) => {
  let game = engine.game;
  let currentActor = engine.actors[game.engine.currentActor]
  let initialKeymap = currentActor.keymap;
  currentActor.keymap = keymapCursorToGrabEntity(engine, currentActor, initialKeymap);
}

export const releaseGrab = (engine) => {
  let actor = engine.actors[engine.currentActor];
  actor.setNextAction(new Action.ReleaseGrab({
    game: engine.game,
    actor,
    energyCost: Constant.ENERGY_THRESHOLD
  }))
}