import { Attack }from '../../actions'
import { getDirectionKey, DIRECTIONS, ENERGY_THRESHOLD } from '../../constants';


const keyMapChop = (engine, initiatedBy, previousKeymap) => {
  let actor = engine.actors[engine.currentActor];
  const goToPreviousKeymap = () => initiatedBy.keymap = previousKeymap;
  return {
    Escape: {
      activate: goToPreviousKeymap,
      label: 'Cancel Chop Action',
    },
    w: {
      activate: () => {
        let targetPos = {
            x: actor.pos.x + DIRECTIONS.N[0], //[0, -1]
            y: actor.pos.y + DIRECTIONS.N[1]
        }
        actor.setNextAction( new Attack({
            targetPos: targetPos,
            game: engine.game,
            actor: actor,
        }))
        goToPreviousKeymap();
      },
      label: 'activate N',
    },
    d: {
      activate: () => {
        let targetPos = {
            x: actor.pos.x + DIRECTIONS.E[0],
            y: actor.pos.y + DIRECTIONS.E[1]
        }
        actor.setNextAction( new Attack({
            targetPos: targetPos,
            game: engine.game,
            actor: actor,
        }))
        goToPreviousKeymap();
      },
      label: 'activate E',
    },
    s: {
      activate: () => {
        let targetPos = {
            x: actor.pos.x + DIRECTIONS.S[0],
            y: actor.pos.y + DIRECTIONS.S[1]
        }
        actor.setNextAction( new Attack({
            targetPos: targetPos,
            game: engine.game,
            actor: actor,
        }))
        goToPreviousKeymap();
      },
      label: 'activate S',
    },
    a: {
      activate: () => {
        let targetPos = {
            x: actor.pos.x + DIRECTIONS.W[0],
            y: actor.pos.y + DIRECTIONS.W[1]
        }
        actor.setNextAction( new Attack({
            targetPos: targetPos,
            game: engine.game,
            actor: actor,
        }))
        goToPreviousKeymap();
      },
      label: 'activate W',
    },
  };
}

export const chop = (engine) => {
  let currentActor = engine.actors[engine.currentActor]
  currentActor.keymap = keyMapChop(engine, currentActor, { ...currentActor.keymap });
}