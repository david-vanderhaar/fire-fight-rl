import React from 'react';
import * as ROT from 'rot-js';
import * as Constant from './constants';
import * as Helper from '../helper';
import { addActor as addWaveEnemy } from './Keymap/KeyActions/addActor';
import { addDebris  } from './Keymap/KeyActions/addDebris';
import * as Message from './message';
import { Display } from './Display/konvaCustom';
import { FireSpread, Speaker, Debris } from './entites';
import { MESSAGE_TYPE } from './message';

// const MAP_DATA = require('./Maps/building.json');
// const MAP_DATA = require('./Maps/building_w_floor.json');
const MAP_DATA = require('./Maps/building_w_ambo.json');
const SOLANGE = require('./Data/solange.json');

const GAME_MODE_TYPES = {
  WAVE: 0,
  TEST: 1,
  PLAY: 2,
};
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
    mode = {
      type: GAME_MODE_TYPES.PLAY,
      data: {
        level: 1,
        highestLevel: null,
        fireIntensity: 1, // increase this number to increase fire spread
        npcCount: 1,
        debrisCount: 4,
      }
    },
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
    if (this.mode.type === GAME_MODE_TYPES.WAVE) {
      let highestLevel = localStorage.getItem('hidden_leaf_rl__highestLevel');
      if (!highestLevel) { 
        highestLevel = this.mode.data.level;
      } else { 
        highestLevel = Math.max(highestLevel , this.mode.data.level);
      }
      localStorage.setItem('hidden_leaf_rl__highestLevel', highestLevel);
      this.mode.data.highestLevel = highestLevel
      for (let i = 0; i < Math.pow(this.mode.data.level, 2); i++) {
        addWaveEnemy(this);
      }
    } 
    
    if (this.mode.type === GAME_MODE_TYPES.PLAY) {
      let array = Object.keys(this.map).filter((key) => this.map[key].type === 'FLOOR')
      for (let index = 0; index < this.mode.data.debrisCount; index++) {
        let pos = Helper.getRandomInArray(array);
        let posXY = pos.split(',').map((coord) => parseInt(coord));
        this.addDebris({ x: posXY[0], y: posXY[1] });
      }
      for (let index = 0; index < this.mode.data.fireIntensity; index++) {
        let pos = Helper.getRandomInArray(array);
        let posXY = pos.split(',').map((coord) => parseInt(coord));
        this.addFire({x: posXY[0], y: posXY[1]});
      }
      for (let index = 0; index < this.mode.data.npcCount; index++) {
        let pos = Helper.getRandomInArray(array);
        let posXY = pos.split(',').map((coord) => parseInt(coord));
        this.addNPC({x: posXY[0], y: posXY[1]});
      }
        
    }
  }
  
  updateMode () { // this is run every game turn
    if (this.mode.type === GAME_MODE_TYPES.WAVE) {
      const nonPlayerCharacters = this.engine.actors.filter((actor) => !actor.entityTypes.includes('PLAYING'));
      if (!nonPlayerCharacters.length) {
        this.nextModeLevel();
        this.initializeMode();
      }
    }

    if (this.mode.type === GAME_MODE_TYPES.PLAY) {
      this.propogateFire();
      this.burnEntities();

      if (this.hasLost()) {
        return;
        // this.resetMode();
        // this.initializeGameData();
      }
      // triggerd once all npcs are saved
      if (this.hasWon()) { 
        this.nextModeLevel();
        this.increaseIntensity()
        this.initializeGameData();
      }
    }

  }

  setModeLevel (level) {
    this.mode.data.level = level;
  }

  nextModeLevel () {
    this.setModeLevel(this.mode.data.level + 1);
  }
  
  resetMode () {
    if (this.mode.type === GAME_MODE_TYPES.PLAY) {
      this.resetIntensity();
    }
    this.setModeLevel(1);
    this.initializeMode();
  }

  // Fire Fight Specific

  increaseIntensity () {

    switch (this.mode.data.level){
      case 1:
        this.mode.data.fireIntensity = 1;
        this.mode.data.npcCount = 1;
        this.mode.data.debrisCount = 4;
        break;
      case 2:
        this.mode.data.fireIntensity = 2;
        this.mode.data.npcCount = 1;
        this.mode.data.debrisCount = 4;
        break;
      case 3:
        this.mode.data.fireIntensity = 3;
        this.mode.data.npcCount = 2;
        this.mode.data.debrisCount = 6;
        break;
      case 4:
        this.mode.data.fireIntensity = 4;
        this.mode.data.npcCount = 3;
        this.mode.data.debrisCount = 6;
        break;
      case 5:
        this.mode.data.fireIntensity = 5;
        this.mode.data.npcCount = 3;
        this.mode.data.debrisCount = 6;
        break;
      case 6:
        this.mode.data.fireIntensity = 4;
        this.mode.data.npcCount = 3;
        this.mode.data.debrisCount = 10;
        break;
      default:
        this.mode.data.fireIntensity = 4;
        this.mode.data.npcCount = 3;
        this.mode.data.debrisCount = 10;
        break;
    }
  }

  resetIntensity () {
    this.mode.data.fireIntensity = 1;
    this.mode.data.npcCount = 1;
    this.mode.data.debrisCount = 4;
  }

  countNpcSafe () {
    const helpless = this.engine.actors.filter((actor) => {
      if (actor.entityTypes.includes('HELPLESS')) {
        const tile = this.map[Helper.coordsToString(actor.pos)];
        if (tile.type === 'SAFE') {
          return true;
        }
      }
      return false
    });
    return helpless.length;
  }

  hasWon () {
    let allSaved = true;
    const helpless = this.engine.actors.filter((actor) => actor.entityTypes.includes('HELPLESS'));

    helpless.forEach((actor) => {
      const tile = this.map[Helper.coordsToString(actor.pos)];
      if (tile.type !== 'SAFE') {
        allSaved = false;
      }
    })

    return allSaved;
  }

  hasLost () {
    const helpless = this.engine.actors.filter((actor) => actor.entityTypes.includes('HELPLESS'));
    if (helpless.length < this.mode.data.npcCount) {
      const players = this.engine.actors.filter((actor) => actor.entityTypes.includes('PLAYING'));
      if (players.length) players[0].destroy();
      return true
    }
    return false;
  }

  addDebris (pos, name = 'box', character = '%', durability = 1) {
    let box = new Debris({
      pos,
      renderer: {
        character,
        color: Constant.THEMES.SOLARIZED.base2,
        background: Constant.THEMES.SOLARIZED.base01,
      },
      name,
      game: this,
      durability,
    })

    this.placeActorOnMap(box)
    this.draw();
  }

  addNPC (pos) {
    // create new entity and place
    let entity = new Speaker({
      name: 'Tobi Lou',
      messages: SOLANGE.lyrics,
      messageType: MESSAGE_TYPE.STATUS_EFFECT,
      pos,
      game: this,
      renderer: {
        character: 'T',
        color: Constant.THEMES.SOLARIZED.base3,
        background: Constant.THEMES.SOLARIZED.violet,
      },
      durability: 2,
    })

    if (this.placeActorOnMap(entity)) {
      this.engine.addActor(entity);
      this.draw();
    };
  }

  addFire (pos) {
    // create new fire actor and place
    let fire = new FireSpread({
      name: 'Pyro',
      pos,
      game: this,
      renderer: {
        character: '*',
        color: Constant.THEMES.SOLARIZED.base3,
        background: Constant.THEMES.SOLARIZED.red,
      },
      timeToSpread: 1,
      spreadCount: 1,
      durability: 1,
      attackDamage: 1,
      speed: 100,
    })

    if (this.placeActorOnMap(fire)) {
      this.engine.addActor(fire);
      this.draw();
    };
  }

  propogateFire () {
    const fires = this.engine.actors.filter((actor) => actor.name === 'Pyro')
    if (fires.length < this.mode.data.fireIntensity) {
      // find burnt tile
      const keys = Object.keys(this.map).filter((key) => this.map[key].type == 'BURNT');
      const key = Helper.getRandomInArray(keys);
      if (key) {
        const position = {
          x: parseInt(key.split(',')[0]),
          y: parseInt(key.split(',')[1]),
        }
        this.addFire(position)
      }
    }
  }

  burnEntities () {
    // burn all entiies on burning tiles
    const coordinates = Object.keys(this.map).filter((key) => this.map[key].type === 'BURNT');
    const entities = coordinates.reduce((acc, curr) => acc.concat(this.map[curr].entities), []);
    entities.forEach((ent) => {
      if (ent.entityTypes.includes('BURNABLE')) {
        const burned = ent.burn();
        if (burned) this.addMessage(`${ent.name} is burned.`, MESSAGE_TYPE.DANGER);
      }
    })
  }

  // End

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
    // this.createLevel();
    this.createCustomLevel(MAP_DATA);
    this.initializeMap();
    this.draw();
    // this.randomlyPlaceAllActorsOnMap()
    this.placeActorsOnMap()
    this.initializeMode();
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
