import * as Constant from '../constants';
import * as Helper from '../../helper';
import * as Item from '../items';
import * as MapHelper from '../Maps/helper';
import { generate as generateBuilding } from '../Maps/generator';
import { FireSpread, Speaker, Debris } from '../entites';
import { MESSAGE_TYPE } from '../message';
import { Mode } from './default';

export class Play extends Mode {
  constructor({ ...args }) {
    super({ ...args });
  }

  initialize () {
    super.initialize();
    const offsetX = Math.floor(this.game.mapWidth / 2)
    const offsetY = Math.floor(this.game.mapHeight / 2)
    generateBuilding(this.game.map, offsetX, offsetY);
    MapHelper.addTileZone(
      { x: 0, y: 0 },
      3,
      'SAFE',
      this.game.map,
      this.game.mapHeight,
      this.game.mapWidth,
    );
    this.placeInitialItems();
    this.placePlayersInSafeZone();

    let array = Object.keys(this.game.map).filter((key) => this.game.map[key].type === 'FLOOR')
    for (let index = 0; index < this.data.debrisCount; index++) {
      let pos = Helper.getRandomInArray(array);
      let posXY = pos.split(',').map((coord) => parseInt(coord));
      this.addDebris({ x: posXY[0], y: posXY[1] });
    }
    for (let index = 0; index < this.data.mediumDebrisCount; index++) {
      let pos = Helper.getRandomInArray(array);
      let posXY = pos.split(',').map((coord) => parseInt(coord));
      this.addDebris({ x: posXY[0], y: posXY[1] }, 'Medium Sized Debris', 'm', 10, 0);
    }
    for (let index = 0; index < this.data.mediumDebrisCount; index++) {
      let pos = Helper.getRandomInArray(array);
      let posXY = pos.split(',').map((coord) => parseInt(coord));
      this.addDebris({ x: posXY[0], y: posXY[1] }, 'Heavy Sized Debris', 'm', 10, 0);
    }
    for (let index = 0; index < this.data.smallGasCanCount; index++) {
      let pos = Helper.getRandomInArray(array);
      let posXY = pos.split(',').map((coord) => parseInt(coord));
      this.addDebris({ x: posXY[0], y: posXY[1] }, 'gas can', 'Xs', 1, 1, Constant.THEMES.SOLARIZED.orange);
    }
    for (let index = 0; index < this.data.gasCanCount; index++) {
      let pos = Helper.getRandomInArray(array);
      let posXY = pos.split(',').map((coord) => parseInt(coord));
      this.addDebris({ x: posXY[0], y: posXY[1] }, 'gas can', 'X', 1, 3, Constant.THEMES.SOLARIZED.orange);
    }
    for (let index = 0; index < this.data.largeGasCanCount; index++) {
      let pos = Helper.getRandomInArray(array);
      let posXY = pos.split(',').map((coord) => parseInt(coord));
      this.addDebris({ x: posXY[0], y: posXY[1] }, 'gas can', 'XL', 1, 10, Constant.THEMES.SOLARIZED.orange);
    }
    for (let index = 0; index < this.data.fireIntensity; index++) {
      let pos = Helper.getRandomInArray(array);
      let posXY = pos.split(',').map((coord) => parseInt(coord));
      this.addFire({ x: posXY[0], y: posXY[1] });
    }
    for (let index = 0; index < this.data.npcCount; index++) {
      let pos = Helper.getRandomInArray(array);
      let posXY = pos.split(',').map((coord) => parseInt(coord));
      this.addNPC({ x: posXY[0], y: posXY[1] });
    }
  }

  update () {
    super.update();
    this.propogateFire();
    this.burnEntities();

    if (this.hasLost()) {
      this.reset();
      this.game.initializeGameData();
    }
    // triggerd once all npcs are saved
    if (this.hasWon()) {
      this.nextLevel();
      this.increaseIntensity()
      this.game.initializeGameData();
    }
  }
  
  //Extras

  setLevel (level) {
    this.data.level = level;
  }

  nextLevel () {
    this.setLevel(this.data.level + 1);
  }

  reset () {
    this.resetIntensity();
    this.setLevel(1);
    this.initialize();
  }

  increaseIntensity () {
    switch (this.data.level) {
      case 1:
        this.data.fireIntensity = 1;
        this.data.npcCount = 1;
        this.data.debrisCount = 4;
        this.data.gasCanCount = 0;
        break;
      case 2:
        this.data.fireIntensity = 2;
        this.data.npcCount = 1;
        this.data.debrisCount = 4;
        this.data.gasCanCount = 1;
        break;
      case 3:
        this.data.fireIntensity = 3;
        this.data.npcCount = 2;
        this.data.debrisCount = 50;
        this.data.gasCanCount = 1;
        break;
      case 4:
        this.data.fireIntensity = 4;
        this.data.npcCount = 2;
        this.data.debrisCount = 6;
        this.data.gasCanCount = 3;
        break;
      case 5:
        this.data.fireIntensity = 5;
        this.data.npcCount = 3;
        this.data.debrisCount = 6;
        this.data.gasCanCount = 3;
        break;
      case 6:
        this.data.fireIntensity = 4;
        this.data.npcCount = 3;
        this.data.debrisCount = 10;
        this.data.gasCanCount = 3;
        break;
      case 7:
        this.data.fireIntensity = 1;
        this.data.npcCount = 3;
        this.data.debrisCount = 80;
        this.data.gasCanCount = 25;
        break;
      case 8:
        this.data.fireIntensity = 3;
        this.data.npcCount = 3;
        this.data.debrisCount = 20;
        this.data.gasCanCount = 6;
        break;
      default:
        this.data.fireIntensity = 3;
        this.data.npcCount = 3;
        this.data.debrisCount = 20;
        this.data.gasCanCount = 5;
        break;
    }
  }

  resetIntensity () {
    this.data.fireIntensity = 1;
    this.data.npcCount = 1;
    this.data.debrisCount = 4;
  }

  countNpcSafe () {
    const helpless = this.game.engine.actors.filter((actor) => {
      if (actor.entityTypes.includes('HELPLESS')) {
        const tile = this.game.map[Helper.coordsToString(actor.pos)];
        if (tile.type === 'SAFE') {
          return true;
        }
      }
      return false
    });

    return helpless.length;
  }

  getSaveCountRequirement () {
    const minimum = Math.ceil(this.data.npcCount * 0.66);
    return Math.max(1, minimum);
  }

  hasWon () {
    return this.countNpcSafe() >= this.getSaveCountRequirement();
  }

  hasLost () {
    const helpless = this.game.engine.actors.filter((actor) => actor.entityTypes.includes('HELPLESS'));
    if (helpless.length < this.getSaveCountRequirement()) {
      return true;
    }
    return false;
  }

  addDebris (pos, name = 'box', character = '%', durability = 5, explosivity = 0, background = Constant.THEMES.SOLARIZED.base01) {
    let box = new Debris({
      pos,
      renderer: {
        character,
        color: Constant.THEMES.SOLARIZED.base2,
        background,
      },
      name,
      game: this.game,
      durability,
      explosivity,
      flammability: 0,
    })

    this.game.placeActorOnMap(box)
    this.game.draw();
  }

  addNPC (pos) {
    // create new entity and place
    let entity = new Speaker({
      name: 'Helpless Citizen',
      // messages: SOLANGE.lyrics,
      messages: ['help!', 'ahh!', 'It\'s getting hot in hurr.'],
      messageType: MESSAGE_TYPE.ACTION,
      pos,
      game: this.game,
      renderer: {
        character: 'C',
        color: Constant.THEMES.SOLARIZED.base3,
        background: Constant.THEMES.SOLARIZED.violet,
      },
      durability: 2,
    })

    if (this.game.placeActorOnMap(entity)) {
      this.game.engine.addActor(entity);
      this.game.draw();
    };
  }

  addFire (pos) {
    // create new fire actor and place
    let fire = new FireSpread({
      name: 'Pyro',
      pos,
      game: this.game,
      renderer: {
        character: '*',
        color: Constant.THEMES.SOLARIZED.base3,
        background: Constant.THEMES.SOLARIZED.red,
      },
      timeToSpread: 1,
      spreadCount: 1,
      durability: 1,
      attackDamage: 2,
      speed: 100,
    })

    if (this.game.placeActorOnMap(fire)) {
      this.game.engine.addActor(fire);
      this.game.draw();
    };
  }

  propogateFire () {
    const fires = this.game.engine.actors.filter((actor) => actor.name === 'Pyro')
    if (fires.length < this.data.fireIntensity) {
      // find burnt tile
      const keys = Object.keys(this.game.map).filter((key) => this.game.map[key].type == 'BURNT');
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
    const coordinates = Object.keys(this.game.map).filter((key) => this.game.map[key].type === 'BURNT');
    const entities = coordinates.reduce((acc, curr) => acc.concat(this.game.map[curr].entities), []);
    entities.forEach((ent) => {
      if (ent.entityTypes.includes('BURNABLE')) {
        const burned = ent.burn();
        if (burned) this.game.addMessage(`${ent.name} is burned.`, MESSAGE_TYPE.DANGER);
        if (ent.willResetCanBurn) ent.resetCanBurn();
      }
    })
  }

  placeInitialItems () {
    let objects = [
      Item.axe(this.game.engine),
      Item.waterGun(this.game.engine),
      Item.fireJacket(this.game.engine),
    ];

    const keys = Object.keys(this.game.map).filter((key) => this.game.map[key].type == 'SAFE');

    objects.forEach((item) => {
      const key = keys.pop();
      if (key) {
        const position = {
          x: parseInt(key.split(',')[0]),
          y: parseInt(key.split(',')[1]),
        }
        item.pos = position;
        let tile = this.game.map[key];
        if (tile) {
          tile.entities.push(item);
        }
      }
    })
  }

  placePlayersInSafeZone () {
    let players = this.game.engine.actors.filter((actor) => actor.entityTypes.includes('PLAYING'))
    const keys = Object.keys(this.game.map).filter((key) => this.game.map[key].type == 'SAFE');
    players.forEach((player) => {
      const key = keys.shift();
      if (key) {
        const position = {
          x: parseInt(key.split(',')[0]),
          y: parseInt(key.split(',')[1]),
        }
        player.pos = position;
        let tile = this.game.map[key];
        if (tile) {
          tile.entities.push(player);
        }
      }
    })
  }

}
