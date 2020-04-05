import * as Action from '../../actions';
import * as Constant from '../../constants';
import { coordsToString } from '../../../helper';
import * as Item from '../../items';
import { UI_Actor } from '../../entites';
import { createFourDirectionMoveOptions } from '../helper';

const grabDirection = (direction, engine, actor, animation) => {
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

const keymapCursorToGrabEntity = (engine, initiatedBy, initialKeymap, animations) => {
  return {
    ...createFourDirectionMoveOptions(
      (direction, engine) => {
        grabDirection(direction, engine, initiatedBy);
        initiatedBy.keymap = initialKeymap;
        // animation code
        if (animations.length) {
          animations.forEach((animation) => engine.game.display.removeAnimation(animation.id))
        }
        // end
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

  // animation code: could be abstrated for easier use
  const directions = [
    Constant.DIRECTIONS.N,
    Constant.DIRECTIONS.E,
    Constant.DIRECTIONS.S,
    Constant.DIRECTIONS.W,
  ];

  let animations = [];

  directions.forEach((direction) => {
    let pos = {
      x: currentActor.pos.x + direction[0],
      y: currentActor.pos.y + direction[1],
    }
    const animation = engine.game.display.addAnimation(1, { x: pos.x, y: pos.y, color: Constant.THEMES.SOLARIZED.base3 })
    animations.push(animation);
  }) 
  // end

  currentActor.keymap = keymapCursorToGrabEntity(engine, currentActor, initialKeymap, animations);
}

export const releaseGrab = (engine) => {
  let actor = engine.actors[engine.currentActor];
  actor.setNextAction(new Action.ReleaseGrab({
    game: engine.game,
    actor,
    energyCost: Constant.ENERGY_THRESHOLD
  }))
}