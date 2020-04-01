import React from 'react';
import * as ROT from 'rot-js';
import * as Constant from './constants';
import * as Helper from '../helper';
import * as Message from './message';
import { Display } from './Display/konvaCustom';
import * as Mode from './Modes/index';

// const MAP_DATA = require('./Maps/building.json');
// const MAP_DATA = require('./Maps/building_w_floor.json');
// const MAP_DATA = require('./Maps/building_w_ambo.json');
// const SOLANGE = require('./Data/solange.json');

const MAP_WIDTH = 50;
const MAP_HEIGHT = 25;
const TILE_WIDTH = 30;
const TILE_HEIGHT = 30;
const TILE_OFFSET = 5;

export class Game {
  constructor({
    engine = null,
    map = {},
    mapInitialized = false,
    tileMap = {},
    mapWidth = MAP_WIDTH,
    mapHeight = MAP_HEIGHT,
    getSelectedCharacter = () => false,
    display = new Display({
      containerId: 'display',
      width: (MAP_WIDTH * TILE_WIDTH) + TILE_OFFSET,
      height: (MAP_HEIGHT * TILE_HEIGHT) + TILE_OFFSET,
      tileWidth: TILE_WIDTH,
      tileHeight: TILE_HEIGHT,
      tileOffset: TILE_OFFSET,
    }),
    tileKey = Constant.TILE_KEY,
    mode = new Mode.Play({
      game: this,
      data: {
        level: 1,
        highestLevel: null,
        fireIntensity: 1, // increase this number to increase fire spread
        npcCount: 1,
        debrisCount: 4,
        mediumDebrisCount: 3,
        heavyDebrisCount: 4,
        smallGasCanCount: 30,
        mediumGasCanCount: 0,
        largeGasCanCount: 1,
      },
    }),
    messages = [],
  }) {
    this.engine = engine;
    this.map = map;
    this.mapInitialized = mapInitialized;
    this.tileMap = tileMap;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.display = display;
    this.tileKey = tileKey;
    this.mode = mode;
    this.messages = messages;
    this.getSelectedCharacter = getSelectedCharacter;
  }

  initializeMode () {
    this.mode.initialize();
  }
  
  updateMode () { // this is run every game turn
    this.mode.update();
  }

  randomlyPlaceActorOnMap(actor) {
    let kill = 0;
    let placed = false;
    while (!placed) {
      let pos = Helper.getRandomPos(this.map).coordinates
      if (this.canOccupyPosition(pos, actor)) {
        let tile = this.map[Helper.coordsToString(pos)]
        actor.pos = { ...pos }
        tile.entities.push(actor);
        placed = true;
      }
      kill += 1;
      if (kill >= 100) {
        placed = true;
      }
    }
    return placed;
  }

  randomlyPlaceAllActorsOnMap() {
    this.engine.actors.forEach((actor) => {
      this.randomlyPlaceActorOnMap(actor);
    })
  }

  placeActorsOnMap() {
    this.engine.actors.forEach((actor) => {
      let tile = this.map[Helper.coordsToString(actor.pos)]
      if (tile) {
        tile.entities.push(actor);
      } else {
        console.log(`could not place ${actor.id}: ${actor.name} on map`);
      }
    })
  }

  placeActorOnMap(actor) {
    let tile = this.map[Helper.coordsToString(actor.pos)]
    if (tile) {
      tile.entities.push(actor);
      return true
    } else {
      console.log(`could not place ${actor.id}: ${actor.name} on map`);
      return false
    }
  }

  removeActorFromMap (actor) {
    let tile = this.map[Helper.coordsToString(actor.pos)]
    if (!tile) return false;
    this.map[Helper.coordsToString(actor.pos)].entities = tile.entities.filter((ac) => ac.id !== actor.id);
    return true;
  }

  createLevel () {
    let digger = new ROT.Map.Arena(this.mapWidth, this.mapHeight);
    // let digger = new ROT.Map.Rogue();
    // let digger = new ROT.Map.DividedMaze();
    // let digger = new ROT.Map.EllerMaze();
    // let digger = new ROT.Map.Cellular();
    // let digger = new ROT.Map.Digger(this.mapWidth, this.mapHeight);
    // let digger = new ROT.Map.IceyMaze();
    // let digger = new ROT.Map.Uniform();
    let freeCells = [];
    let digCallback = function (x, y, value) {      
      let key = x + "," + y;
      let type = 'GROUND';
      let currentFrame = 0;
      if (value) { 
        type = 'WALL';
        // type = 'WATER';
      }

      if (Constant.TILE_KEY[type].animation) {
        currentFrame = Helper.getRandomInt(0, Constant.TILE_KEY[type].animation.length)
      }

      this.map[key] = {
        type,
        currentFrame,
        entities: [],
      };
      freeCells.push(key);
    }
    digger.create(digCallback.bind(this));
    this.randomlyPlaceAllActorsOnMap()
  }

  createEmptyLevel () {
    for (let i = 0; i < this.mapHeight; i ++) {
      for (let j = 0; j < this.mapWidth; j ++) {
        const key = `${j},${i}`
        let type = 'GROUND';
        let currentFrame = 0;

        if (Constant.TILE_KEY[type].animation) {
          currentFrame = Helper.getRandomInt(0, Constant.TILE_KEY[type].animation.length)
        }

        this.map[key] = {
          type,
          currentFrame,
          entities: [],
        };
      }
    }
  }

  createCustomLevel (data) {
    Object.keys(data.tiles).forEach((key, i) => {
      const tile = data.tiles[key];
      let type = JSON.parse(tile.data);
      let currentFrame = 0;
      if (!type) {
        type = 'GROUND';
      }

      if (Constant.TILE_KEY[type].animation) {
        currentFrame = Helper.getRandomInt(0, Constant.TILE_KEY[type].animation.length)
      }

    
      this.map[key] = {
        type,
        currentFrame,
        entities: [],
      };
    })

    this.placeInitialEntities();
  }

  canOccupyPosition (pos, entity = {passable: false}) {
    let result = false;
    let targetTile = this.map[Helper.coordsToString(pos)];
    if (targetTile) {
      let hasImpassableEntity = targetTile.entities.filter((entity) => !entity.passable).length > 0;
      if (!hasImpassableEntity || entity.passable) {
        let tile = this.map[Helper.coordsToString(pos)];
        if (this.tileKey[tile.type].passable) {
          result = true;
        }
      }
    }

    return result;
  }

  cursorCanOccupyPosition(pos) {
    let result = false;
    let targetTile = this.map[Helper.coordsToString(pos)];
    if (targetTile) {
      result = true;
    }

    return result;
  }

  show (document) {
    this.display.initialize(document)
  }

  processTileMap (callback) {
    for (let key in this.map) {
      let parts = key.split(",");
      let x = parseInt(parts[0]);
      let y = parseInt(parts[1]);
      let tile = this.map[key];
      let { character, foreground, background } = this.tileKey[tile.type]

      // Proto code to handle tile animations
      let tileRenderer = this.tileKey[tile.type]
      let nextFrame = this.animateTile(tile, tileRenderer);
      character = nextFrame.character;
      foreground = nextFrame.foreground;
      background = nextFrame.background;

      if (tile.entities.length > 0) {
        let entity = tile.entities[tile.entities.length - 1]
        nextFrame = this.animateEntity(entity);
        
        character = nextFrame.character
        foreground = nextFrame.foreground
        if (nextFrame.background) {
          background = nextFrame.background
        }
      }
      callback(key, x, y, character, foreground, background);
    }
  }

  initializeMap () {
    if (this.mapInitialized) return false;
    this.mapInitialized = true;
    this.processTileMap((tileKey, x, y, character, foreground, background) => {
      let node = this.display.createTile(x, y, character, foreground, background);
      this.tileMap[tileKey] = node;
    });
    this.display.draw();
  }
  
  draw () {
    this.processTileMap((tileKey, x, y, character, foreground, background) => {
      this.display.updateTile(this.tileMap[tileKey], character, foreground, background);
    });
    this.display.draw();
  }
  
  animateEntity (entity) {
    let renderer = entity.renderer;
    let {character, color, background} = {...renderer}
    if (renderer.animation) {
      let frame = renderer.animation[entity.currentFrame];

      character = frame.character;
      color = frame.foreground;
      background = frame.background;
      entity.currentFrame = (entity.currentFrame + 1) % renderer.animation.length;
    }
    return {character, foreground: color, background}
  }

  animateTile (tile, renderer) {
    let {character, foreground, background} = {...renderer}
    if (renderer.animation) {
      let frame = renderer.animation[tile.currentFrame];
      character = frame.character;
      foreground = frame.foreground;
      background = frame.background;
      tile.currentFrame = (tile.currentFrame + 1) % renderer.animation.length;
    }
    return {character, foreground, background}
  }

  addActor (actor, engine = this.engine) {
    let isPlaced = this.placeActorOnMap(actor); // replace with placeActorOnMap
    if (!isPlaced) { return false }
    engine.actors.push(actor);
    this.draw();
    return true
  }

  placeAndDrawActor (actor) {
    this.placeActorsOnMap(); // replace with placeActorOnMap
    this.draw();
  }

  removeActor (actor) {
    this.engine.actors = this.engine.actors.filter((ac) => ac.id !== actor.id);
    // this.engine.currentActor = this.engine.actors.length - 1; // should remove need for this line
    // this.engine.currentActor = (this.engine.currentActor) % this.engine.actors.length;
    // this.engine.currentActor = (this.engine.currentActor + 1) % this.engine.actors.length;
    this.removeActorFromMap(actor);
    this.draw();
  }

  initializeUI (presserRef, document) {
    this.show(document);
    presserRef.current.focus();
  }

  initializeGameData () {
    this.engine.game = this;
    const selectedCharacter = this.getSelectedCharacter();
    this.engine.actors = [selectedCharacter];
    this.engine.actors.forEach((actor) => {
      actor.game = this;
    });
    this.createEmptyLevel();
    // this.createLevel();
    // this.createCustomLevel(MAP_DATA);
    this.initializeMap();
    this.draw();
    // this.randomlyPlaceAllActorsOnMap()
    // this.placeActorsOnMap()
    // this.initializeMode();
    this.mode.initialize();
  }

  initialize (presserRef, document) {
    this.initializeUI(presserRef, document);
    this.initializeGameData();
  }

  addMessage (text, type) {
    const message = new Message.Message({text, type})
    this.messages.push(message);
  }
}


/************************** UI ********************************/
export const handleKeyPress = (event, engine) => {
  if (!engine.isRunning) {
    let actor = engine.actors[engine.currentActor];
    let keymap = actor.keymap;
    let code = event.key;
    if (!(code in keymap)) { return; }
    keymap[code]['activate']();
    engine.start()
  }
  return;
}

export const DisplayElement = (presserRef, handleKeyPress, engine) => {
  return (
    <div
      id='display'
      ref={presserRef}
      onKeyDown={(event) => handleKeyPress(event, engine)}
      // onKeyUp={(event) => handleKeyPress(event, engine)}
      tabIndex='0'
    />
  )
}
/************************** UI ********************************/
