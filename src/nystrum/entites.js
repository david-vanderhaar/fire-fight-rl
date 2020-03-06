import uuid from 'uuid/v1';
import pipe from 'lodash/fp/pipe';
import * as Helper from '../helper';
import { destroyEntity } from './Entities/helper';
import * as Constant from './constants';
import * as Action from './actions';
import * as Engine from './engine';
import { cloneDeep, cloneDeepWith } from 'lodash';
import { MESSAGE_TYPE } from './message';

export class Entity {
  constructor({ game = null, passable = false, name = 'nameless'}) {
    let id = uuid();
    this.entityTypes = ['Entity']
    this.id = id;
    this.name = name;
    this.game = game;
    this.passable = passable;
    this.active = true;
  }
}

const Parent = superclass => class extends superclass {
  constructor({ children = [], engine = new Engine.CrankEngine({}), ...args }) {
    super({...args })
    this.entityTypes = this.entityTypes.concat('PARENT');
    this.children = children;
    this.engine = engine;
    this.isInitialized = false;
  }

  destroyChild(child) {
    child.energy = 0;
    let tile = this.game.map[Helper.coordsToString(child.pos)];
    this.game.map[Helper.coordsToString(child.pos)].entities = tile.entities.filter((e) => e.id !== child.id);
    this.engine.actors = this.engine.actors.filter((e) => e.id !== child.id);
    this.game.draw()
  }

  canAttack (entity) {
    const childIds = this.children.map((child) => child.id); 
    return !childIds.includes(entity.id)
  }
  
  initialize() {
    this.isInitialized = true;
    this.engine.game = this.game;
    this.engine.actors = this.children;
    this.engine.actors.forEach((actor) => {
      actor.game = this.game;
      actor.destroy = () => {this.destroyChild(actor)};
      actor.canAttack = this.canAttack.bind(this);
      // actor.canAttack = (entity) => {this.canAttack(entity)};
      this.game.placeActorOnMap(actor)
      this.engine.addActor(actor);
      this.game.draw();
    });
  }

  getAction(game) {
    // crank engine one turn
    if (!this.isInitialized) {
      this.initialize()
    }

    let result = new Action.CrankEngine({
      game,
      actor: this,
      engine: this.engine,
      energyCost: Constant.ENERGY_THRESHOLD,
      processDelay: 10
    });

    return result;
  }

}

const HasInnerGates = superclass => class extends superclass {
  constructor({ currentGate = null, gates = [], ...args }) {
    super({ ...args })
    this.entityTypes = this.entityTypes.concat('HAS_INNER_GATES');
    this.currentGate = currentGate;
    this.gates = [
      {
        name: 'Gate of Opening',
        damageBuff: 1,
        speedBuff: 100,
        durabilityDebuff: 1,
        character: '1'
      },
      {
        name: 'Gate of Healing',
        damageBuff: 1,
        speedBuff: 100,
        durabilityDebuff: 1,
        character: '2'
      },
      {
        name: 'Gate of Life',
        damageBuff: 1,
        speedBuff: 100,
        durabilityDebuff: 1,
        character: '3'
      },
      {
        name: 'Gate of Pain',
        damageBuff: 1,
        speedBuff: 100,
        durabilityDebuff: 1,
        character: '4'
      },
      {
        name: 'Gate of Limit',
        damageBuff: 1,
        speedBuff: 100,
        durabilityDebuff: 1,
        character: '5'
      },
    ];
  }

  setNextGate() {
    let currentGate = this.currentGate;
    let nextGate = null;
    if (!currentGate) {
      nextGate = this.gates[0];
      this.currentGate = { ...nextGate };
    } else {
      let nextGateIndex = this.gates.findIndex((gate) => currentGate.name === gate.name) + 1;
      if (this.gates.length > nextGateIndex) {
        nextGate = this.gates[nextGateIndex];
        this.currentGate = { ...nextGate };
      }
    }
    return nextGate;
  }

  getNextGate() {
    let currentGate = this.currentGate;
    let nextGate = null;
    if (!currentGate) {
      nextGate = this.gates[0];
    } else {
      let nextGateIndex = this.gates.findIndex((gate) => currentGate.name === gate.name) + 1;
      if (this.gates.length > nextGateIndex) {
        nextGate = this.gates[nextGateIndex];
      }
    }
    return nextGate;
  }
}

const UI = superclass => class extends superclass {
  constructor({ initiatedBy = null, range = null, ...args }) {
    super({...args })
    this.entityTypes = this.entityTypes.concat('UI');
    this.initiatedBy = initiatedBy;
    this.active = true;
    this.range = range;
  }

  hasEnoughEnergy() {
    return this.active;
  }
}

export const Attacking = superclass => class extends superclass {
  constructor({attackDamage = 1, ...args }) {
    super({ ...args })
    this.entityTypes = this.entityTypes.concat('ATTACKING')
    this.attackDamage = attackDamage;
  }

  getAttackDamage (additional = 0) {
    return this.attackDamage + additional;
  }

  canAttack (entity) {
    return true;
  }

  attack (targetPos, additional = 0) {
    let success = false;
    let tile = this.game.map[Helper.coordsToString(targetPos)]
    if (!tile) { return success }
    let targets = Helper.getDestructableEntities(tile.entities);
    if (targets.length > 0) {
      let target = targets[0];
      if (this.canAttack(target)) {
        let damage = this.getAttackDamage(additional);
        if (this.entityTypes.includes('EQUIPING')) {
          this.equipment.forEach((slot) => {
            if (slot.item) {
              if (slot.item.entityTypes.includes('ATTACKING')) {
                damage += slot.item.getAttackDamage();
              }
            }
          });
        }
        this.game.addMessage(`${this.name} does ${damage} to ${target.name}`, MESSAGE_TYPE.DANGER);
        target.decreaseDurability(damage);
        success = true;
      }
    }

    return success;
  }
}

export const Equipable = superclass => class extends superclass {
  constructor({name = 'nameless', equipmentType = Constant.EQUIPMENT_TYPES.HAND, ...args }) {
    super({ ...args })
    this.entityTypes = this.entityTypes.concat('EQUIPABLE')
    this.name = name;
    this.equipmentType = equipmentType;
  }
}

const Acting = superclass => class extends superclass {
  constructor({actions = [], speed = 100, energy = 0, ...args}) {
    super({...args})
    this.entityTypes = this.entityTypes.concat('ACTING')
    this.actions = actions;
    this.speed = speed;
    this.energy = speed;
  }

  getAction() {
    let action = Helper.getRandomInArray(this.actions)
    if (action) { return action }
  }

  gainEnergy(value = this.speed) {
    this.energy += value;
  }

  hasEnoughEnergy() {
    return this.energy > 0;
  }
}

const Rendering = superclass => class extends superclass {
  constructor({pos = {x: 0, y: 0}, renderer, ...args}) {
    super({...args})
    this.entityTypes = this.entityTypes.concat('RENDERING')
    this.pos = pos;
    this.renderer = {...renderer};
    this.currentFrame = 0;
  }

  getPosition () {
    return this.pos;
  }

  move (targetPos) {
    let success = false;
    if (this.game.canOccupyPosition(targetPos, this)) {
      let tile = this.game.map[Helper.coordsToString(this.pos)]
      this.game.map[Helper.coordsToString(this.pos)] = { ...tile, entities: tile.entities.filter((e) => e.id !== this.id) }
      this.pos = targetPos
      this.game.map[Helper.coordsToString(targetPos)].entities.push(this);
      success = true;
    }
    return success;
  }

  shove (targetPos, direction) {
    let success = false;
    let targetTile = this.game.map[Helper.coordsToString(targetPos)];
    if (targetTile) {
      targetTile.entities.map((entity) => { 
        if (!entity.passable) {
          let newX = entity.pos.x + direction[0];
          let newY = entity.pos.y + direction[1];
          let newPos = { x: newX, y: newY };
          entity.move(newPos);
        }
      });
    }
    success = this.move(targetPos);
    return success;
  }
}

export class ContainerSlot {
  constructor({ itemType, items }) {
    this.itemType = itemType;
    this.items = items;
  }
}

const Containing = superclass => class extends superclass {
  constructor({container = [], ...args}) {
    super({...args})
    this.entityTypes = this.entityTypes.concat('CONTAINING')
    this.container = container;
  }

  createSlot (item) {
    let slot = new ContainerSlot({
      itemType: item.name,
      items: [item],
    });
    this.container.push(slot)
  }

  contains (itemType) {
    let container = this.container;
    let slots = container.filter((slot) => slot.itemType === itemType);
    return slots.length > 0 ? slots[0].items[0] : false;
  }

  addToContainer (item) {
    const index = this.container.findIndex((slot) => slot.itemType === item.name);
    if (index >= 0) {
      this.container[index].items.push(item);
    } else {
      this.createSlot(item);
    }
  }
  
  removeFromContainer (item) {
    this.container.forEach((slot, index) => {
      slot.items = slot.items.filter((it) => it.id !== item.id);
      if (!slot.items.length) this.container.splice(index, 1);
    });
  }
}

const Equiping = superclass => class extends superclass {
  constructor({equipment = Constant.EQUIPMENT_LAYOUTS.human(), ...args}) {
    super({...args})
    this.entityTypes = this.entityTypes.concat('EQUIPING')
    this.equipment = equipment;
  }

  hasItemNameEquipped (itemName) {
    const equipment = this.equipment.filter((slot) => {
      if (slot.item) {
        if (slot.item.name === itemName) {
          return true;
        }
      }
      return false;
    })

    return equipment.length > 0;

  }

  getItemInSlot (slotName) {
    let openSlots = this.equipment.filter((slot) => {
      return (slot.item === null && slot.type === slotName)
    })
    if (openSlots.length > 0) { return false; }
    let slot = this.equipment.find((slot) => slot.type === slotName);
    if (!slot) { return false; }
    if (!slot.item) { return false; }
    return slot.item;
  }

  equip (slotName, item) {
    let foundSlot = false;
    this.equipment = this.equipment.map((slot) => {
      if (!foundSlot && slot.type === slotName && slot.item === null) {
        slot.item = item;
        foundSlot = true;
      }
      return slot;
    })
    return foundSlot;
  }
  
  unequip (item) {
    this.equipment = this.equipment.map((slot) => {
      if (slot.item) {
        if (slot.item.id === item.id) {
          slot.item = null;
        }
      }
      return slot;
    })
  }
}

const Charging = superclass => class extends superclass {
  constructor({charge = 10, ...args}) {
    super({...args})
    this.entityTypes = this.entityTypes.concat('CHARGING')
    this.charge = charge;
    this.chargeMax = charge;
  }

  decreaseCharge(value) {
    this.charge = Math.max(0, this.charge - value);
  }
  
  increaseCharge(value) {
    this.charge = Math.min(this.chargeMax, this.charge + value);
  }
}

const Signing = superclass => class extends superclass {
  constructor({...args}) {
    super({...args})
    this.entityTypes = this.entityTypes.concat('SIGNING')
    this.signHistory = [];
  }

  addSign(sign) {
    if (this.signHistory.length >= 4) {
      this.signHistory.shift();
    }
    this.signHistory.push(sign);
  }
  
  clearSigns() {
    this.signHistory = [];
  }
}

const Playing = superclass => class extends superclass {
  constructor({keymap = {}, ...args}) {
    super({...args})
    this.entityTypes = this.entityTypes.concat('PLAYING')
    this.nextAction = null;
    this.keymap = keymap;
  }

    setNextAction(action) {
      this.nextAction = action;
    }

    getAction() {
      let action = this.nextAction;
      this.nextAction = null;
      return action;
    }
}

const Cloning = superclass => class extends superclass {
  constructor({cloneLimit = 1, ...args}) {
    super({...args})
    this.entityTypes = this.entityTypes.concat('CLONING')
    this.cloneLimit = cloneLimit;
    this.clones = [];
  }
  
  // perhaps clones should have a status effect that leeches parent actor's energy or chakra
  
  // status effects should be removed from engine when owner is removed.
  
  destroy() {
    // add function to override self destroy funtion 
    // if this actor dies, clones should be destroyed as well
    if (this.clones) {
      this.clones.map((clone) => {
        destroyEntity(clone)
      });
    }
    destroyEntity(this);
  }

  destroyClone (id) {
  // overrides clone destroy function
  // when clone is destroyed, clone count will change accordingly
    const index = this.clones.findIndex((c) => c.id == id);
    if (index >= 0) {
      this.clones[index].super__destroy();
      this.clones.splice(index, 1);
    }
  }

  createClone (cloneArgs) {
    if (this.clones.length < this.cloneLimit) {
      let clone = cloneDeep(this);
      clone.name = `Clone`
      clone.game = this.game;
      clone.id = uuid();
      delete clone.clones;
      clone['super__destroy'] = clone.destroy;
      clone.destroy = () => { this.destroyClone(clone.id) };
      cloneArgs.forEach((arg) => {
        clone[arg.attribute] = arg.value
      });
      if (this.game.placeActorOnMap(clone)) {
        this.game.engine.addActorAsNext(clone);
        this.game.draw();
        this.clones.push(clone);
        return true;
      };
    }
    return false;
  }
}

const Projecting = superclass => class extends superclass {
  constructor({path = false, targetPos = null ,...args}) {
    super({...args})
    this.entityTypes = this.entityTypes.concat('PROJECTING')
    this.path = path;
    this.targetPos = targetPos;
  }

  createPath (game) {
    let path = Helper.calculatePath(game, this.targetPos, this.pos, 8);
    this.path = path;
  }

  getAction(game) {
    if (!this.path) {
      this.createPath(game);
    }
    let targetPos = this.path.length > 0 ? this.path[0] : this.pos;
    let result = new Action.Move({
      targetPos, 
      game, 
      actor: this, 
      energyCost: Constant.ENERGY_THRESHOLD
    });
    if (this.game.canOccupyPosition(targetPos, this)) {
      this.path.shift();
    }
    return result;
  }
}

const DestructiveProjecting = superclass => class extends superclass {
  constructor({path = false, targetPos = null, attackDamage = 1, range = 3, ...args}) {
    super({...args})
    this.entityTypes = this.entityTypes.concat('DESTRUCTIVE_PROJECTING')
    this.path = path;
    this.targetPos = targetPos;
    this.attackDamage = attackDamage;
    this.range = range;
  }

  createPath (game) {
    let path = Helper.calculatePathWithRange(game, this.targetPos, this.pos, 8, this.range);
    this.path = path;
  }

  getAction (game) {
    if (!this.path) {
      this.createPath(game);
    }

    let targetPos = this.path.length > 0 ? this.path[0] : this.pos;
    
    let result = new Action.ThrowProjectile({
      targetPos, 
      game, 
      actor: this, 
      energyCost: Constant.ENERGY_THRESHOLD
    });

    return result;
  }
}

const DirectionalProjecting = superclass => class extends superclass {
  constructor({path = false, direction = {x: 0, y: 0}, attackDamage = 1, range = 3, ...args}) {
    super({...args})
    this.entityTypes = this.entityTypes.concat('DIRECTIONAL_PROJECTING')
    this.path = path;
    this.direction = direction;
    this.attackDamage = attackDamage;
    this.range = range;
  }

  createPath(game) {
    let path = [];
    for (let i = 1; i < this.range + 1; i++) {
      path.push({
        x: this.pos.x + (this.direction[0] * i),
        y: this.pos.y + (this.direction[1] * i)
      })
    }
    this.path = path;
  }

  getAction (game) {
    let result = null;
    let newX = this.pos.x + this.direction[0];
    let newY = this.pos.y + this.direction[1];
    let targetPos = { x: newX, y: newY };
    this.passable = false
    
    if (this.range > 0) {
      result = new Action.ProjectileMove({
        targetPos: targetPos,
        game: game,
        actor: this,
        energyCost: Constant.ENERGY_THRESHOLD,
        damageToSelf: 1,
        onSuccess: () => this.range -= 1,
        onAfter: () => {
          if (this.energy <= 100) {
            game.engine.setActorToPrevious();
          }
        }
      })
    } else {
      result = new Action.DestroySelf({
        game: game,
        actor: this,
        energyCost: 0
      })
    }

    return result;
  }
}

const DirectionalPushing = superclass => class extends superclass {
  constructor({path = false, direction = {x: 0, y: 0}, range = 3, ...args}) {
    super({...args})
    this.entityTypes = this.entityTypes.concat('DIRECTIONAL_PUSHING')
    this.path = path;
    this.direction = direction;
    this.range = range;
  }

  getAction (game) {
    let result = null;
    let newX = this.pos.x + this.direction[0];
    let newY = this.pos.y + this.direction[1];
    let targetPos = { x: newX, y: newY };
    this.passable = false
    
    if (this.range > 0) {
      result = new Action.Shove({
        targetPos: targetPos,
        direction: this.direction,
        game: game,
        actor: this,
        energyCost: Constant.ENERGY_THRESHOLD,
        onSuccess: () => this.range -= 1,
      })
    } else {
      result = new Action.DestroySelf({
        game: game,
        actor: this,
        energyCost: 0
      })
    }

    return result;
  }
}

const GaseousDestructiveProjecting = superclass => class extends superclass {
  constructor({owner_id = null, path = false, targetPos = null, attackDamage = 1, range = 3, ...args}) {
    super({...args})
    this.entityTypes = this.entityTypes.concat('GASEOUS_DESTRUCTIVE_PROJECTING')
    this.path = path;
    this.targetPos = targetPos;
    this.attackDamage = attackDamage;
    this.range = range;
    this.owner_id = owner_id;
  }

  canAttack (entity) {
    let success = super.canAttack();
    if (success) {
      success = this.owner_id === null || (entity.owner_id !== this.owner_id);
    }
    return success
  }

  createPath (game) {
    let path = Helper.calculatePathWithRange(game, this.targetPos, this.pos, 8, this.range);
    this.path = path;
  }

  getAction (game) {
    if (!this.path) {
      this.createPath(game);
    }
    let targetPos = this.path.length > 0 ? this.path[0] : this.pos;
    
    let result = new Action.ThrowProjectileGas({
      targetPos, 
      game, 
      actor: this, 
      energyCost: Constant.ENERGY_THRESHOLD
    });

    return result;
  }
}

const Gaseous = superclass => class extends superclass {
  constructor({
    isClone = false,
    cloneCount = 0,
    clonePattern = Constant.CLONE_PATTERNS.square,
    ...args
  }) {
    super({...args})
    this.entityTypes = this.entityTypes.concat('GASEOUS')
    this.isClone = isClone;
    this.cloneCount = cloneCount;
    this.clonePattern = cloneDeep(clonePattern);
  }

  getAction (game) {
    let offset = this.clonePattern.positions.find((pos) => !pos.taken);
    if (!this.isClone && offset) {
      offset.taken = true
      let clone = cloneDeepWith(this, (value, key) => {
        switch (key) {
          case 'id':
          case 'game':
          case 'engine':
          case 'clones':
            return null
            break;
          default:
            return undefined
            break;
        }
      });
      clone.game = game;
      clone.id = uuid();
      if (this.hasOwnProperty('pos')) {
        let referencePos = this.pos
        clone.pos = {
          x: referencePos.x + offset.x,
          y: referencePos.y + offset.y
        }
      }
      if (clone.hasOwnProperty('path')) {
        clone.path = clone.path.map((pos) => {
          return {
            x: pos.x + offset.x,
            y: pos.y + offset.y
          }
        })
      }
      clone.isClone = true
      this.cloneCount += 1
      game.placeActorOnMap(clone)
      game.engine.addActor(clone);
      game.draw();
    }

    let result = super.getAction(game);
    return result;
  }
}

const Chasing = superclass => class extends superclass {
  constructor({targetEntity = null ,...args}) {
    super({...args})
    this.entityTypes = this.entityTypes.concat('CHASING')
    this.targetEntity = targetEntity;
  }

  getAction(game) {
    let path = Helper.calculatePath(game, this.targetEntity.pos, this.pos);
    let targetPos = path.length > 0 ? path[0] : this.pos;

    let result = new Action.Move({
      targetPos, 
      game, 
      actor: this, 
      energyCost: Constant.ENERGY_THRESHOLD
    });
    return result;
  }
}

const RangedChasing = superclass => class extends superclass {
  constructor({ targetEntity = null, getProjectile = () => null, ...args }) {
    super({ ...args })
    this.entityTypes = this.entityTypes.concat('RANGED_CHASING')
    this.targetEntity = targetEntity;
    this.getProjectile = getProjectile;
  }

  targetInPath (pathToCheck, targetPos) {
    let inPath = false;
    pathToCheck.forEach((pos) => {
      if (pos.x === targetPos.x && pos.y === targetPos.y) {
        inPath = true;
      }
    })
    return inPath;
  }

  getAction(game) {
    let throwDirection = {
      x: Math.sign(this.targetEntity.pos.x - this.pos.x),
      y: Math.sign(this.targetEntity.pos.y - this.pos.y),
    }

    // projectile.initialize()
    let projectile = this.getProjectile({
      pos: {
        x: this.pos.x,
        y: this.pos.y,
      },
      targetPos: { ...this.targetEntity.pos },
      direction: [throwDirection.x, throwDirection.y],
      range: 10,
    });

    // projectile.getPath()
    projectile.createPath(game);
    // is target in path
    const inPath = this.targetInPath(projectile.path, this.targetEntity.pos);

    if (inPath) {
      // throw
      if (game.canOccupyPosition(projectile.pos, projectile)) {
        return new Action.PlaceActor({
          targetPos: { ...projectile.pos },
          entity: projectile,
          game,
          actor: this,
          energyCost: Constant.ENERGY_THRESHOLD
        })
      }
      return new Action.Say({
        message: `I'll get you with this kunai!`,
        game,
        actor: this,
        energyCost: Constant.ENERGY_THRESHOLD
      })
    }
    // if not, select target tile in range of enemy and move
    let movePath = Helper.calculatePath(game, this.targetEntity.pos, this.pos);
    let targetPos = movePath.length > 0 ? movePath[0] : this.pos;
    
    return new Action.Move({
      targetPos,
      game,
      actor: this,
      energyCost: Constant.ENERGY_THRESHOLD
    });

  }
}

const Dragging = superclass => class extends superclass {
  constructor({ draggedEntity = null, ...args }) {
    super({ ...args })
    this.entityTypes = this.entityTypes.concat('DRAGGING')
    this.draggedEntity = draggedEntity;
  }

  grab (pos) {
    const tile = this.game.map[Helper.coordsToString(pos)];
    if (!tile) return false;
    if (tile.entities.length > 0) {
      const entity = tile.entities[0];
      if (!this.draggedEntity && entity.entityTypes.includes('DRAGGABLE')) {
        this.draggedEntity = entity;
        return true;
      }
    }
    return false;
  }

  release () {
    if (!this.draggedEntity) return false;
    this.draggedEntity = null;
    return true;
  }

  drag (lastPos) {
    // update entity position
    const pos = this.draggedEntity.pos;
    // get tile of draged entity
    let tile = this.game.map[Helper.coordsToString(pos)]
    // remove dragged entity from that tile
    this.game.map[Helper.coordsToString(pos)] = { ...tile, entities: tile.entities.filter((e) => e.id !== this.draggedEntity.id) }
    // update dragged ent to player's position
    this.draggedEntity.pos = lastPos
    // add dragged ent to new tile
    this.game.map[Helper.coordsToString(lastPos)].entities.push(this.draggedEntity);
  }

  move (targetPos) {
    const lastPos = {...this.pos}
    if (this.draggedEntity) {
      const moveSuccess = super.move(targetPos);
      if (moveSuccess) {
        this.drag(lastPos);
        return true;
      }
      return moveSuccess;
    }
    return super.move(targetPos);
  }
}

const Draggable = superclass => class extends superclass {
  constructor({ ...args }) {
    super({ ...args })
    this.entityTypes = this.entityTypes.concat('DRAGGABLE')
  }
}

const Spreading = superclass => class extends superclass {
  constructor({ timeToSpread = 5, spreadCount = 1, ...args }) {
    super({ ...args })
    this.entityTypes = this.entityTypes.concat('SPREADING')
    this.timeToSpreadMax = timeToSpread;
    this.timeToSpread = timeToSpread;
    this.spreadCountMax = spreadCount;
    this.spreadCount = spreadCount;
  }

  getAction (game) {
    // if no more spreads, then destroy
    if (this.spreadCount <= 0) {
      return new Action.DestroySelf({
        game: game,
        actor: this,
        energyCost: Constant.ENERGY_THRESHOLD,
        processDelay: 0,
        onAfter: () => {
          game.map[Helper.coordsToString(this.pos)].type = 'BURNT';
        },
      });
    }

    // if its time to expand again, create a new fire spread and placeActor
    if (this.timeToSpread <= 0) {
      // find adjacent spot to spread to
      let adjacentPositions = [
        {
          x: this.pos.x + 1,
          y: this.pos.y + 0,
        },
        {
          x: this.pos.x + -1,
          y: this.pos.y + 0,
        },
        {
          x: this.pos.x + 0,
          y: this.pos.y + 1,
        },
        {
          x: this.pos.x + 0,
          y: this.pos.y + -1,
        },
      ];
      let adjacentPos = null;
      let kill = 100;
      while (kill > 0) {
        let newPos = Helper.getRandomInArray(adjacentPositions);
        let newTile = this.game.map[Helper.coordsToString(newPos)];
        let tileExists = Boolean(newTile);
        let notBurnt = true;
        let canBurn = false;
        if (newTile) {
          notBurnt = newTile.type !== 'BURNT';
          canBurn = ['WALL', 'FLOOR'].includes(newTile.type)
        }
        if (tileExists && notBurnt && canBurn) {
          adjacentPos = newPos;
          break;
        }
        kill -= 1;
      }
      
      if (adjacentPos) {
        // create new fire actor and place
        let fire = new FireSpread({
          name: 'Pyro',
          pos: {x: 0, y: 0},
          game,
          renderer: {
            character: '*',
            color: Constant.THEMES.SOLARIZED.base3,
            background: Constant.THEMES.SOLARIZED.red,
          },
          timeToSpread: this.timeToSpreadMax,
          spreadCount: this.spreadCountMax,
          durability: this.durability,
          attackDamage: this.attackDamage,
          speed: this.speed,
        })

        this.timeToSpread = this.timeToSpreadMax
        this.spreadCount -= 1
        
        return new Action.PlaceActor({
          targetPos: adjacentPos,
          entity: fire,
          game,
          actor: this,
          interrupt: false,
          energyCost: Constant.ENERGY_THRESHOLD,
          processDelay: 0,
          forcePlacement: true,
        })
      }
      this.timeToSpread = this.timeToSpreadMax
      this.spreadCount -= 1
    }

    this.timeToSpread -= 1;
    
    return new Action.Say({
      message: 'burning',
      game,
      actor: this,
      processDelay: 0,
    })
  }
}

  const Pushing = superclass => class extends superclass {
  constructor({ path = false, targetPos = null, ...args }) {
    super({ ...args })
    this.entityTypes = this.entityTypes.concat('PUSHING')
    this.path = path;
    this.targetPos = targetPos;
  }

  createPath(game) {
    let path = Helper.calculatePath(game, this.targetPos, this.pos, 8);
    this.path = path;
  }

  getAction(game) {
    if (!this.path) {
      this.createPath(game);
    }
    let targetPos = this.path.length > 0 ? this.path[0] : this.pos;
    let direction = [
      targetPos.x - this.pos.x ,
      targetPos.y - this.pos.y ,
    ]
    if (direction[0] === 0 && direction[1] === 0) {
      return new Action.DestroySelf({
        game: game,
        actor: this,
        energyCost: Constant.ENERGY_THRESHOLD,
        processDelay: 0,
      });
    }
    let result = new Action.Shove({
      targetPos,
      direction,
      game,
      actor: this,
      energyCost: Constant.ENERGY_THRESHOLD
    });
    this.path.shift();

    return result;
  }
}

const Destructable = superclass => class extends superclass {
  constructor({durability = 1, defense = 0 ,onDestroy = () => null, ...args }) {
    super({ ...args })
    this.entityTypes = this.entityTypes.concat('DESTRUCTABLE')
    this.durability = durability;
    this.defense = defense;
    this.onDestroy = onDestroy;
  }

  getDefense () {
    let defense = this.defense;
    // add in reducer to get defense stats of all equpiment
    if (this.entityTypes.includes('EQUIPING')) {
      this.equipment.forEach((slot) => {
        if (slot.item) {
          if (slot.item.entityTypes.includes('DESTRUCTABLE')) {
            defense += slot.item.getDefense();
          }
        }
      });
    }
    
    return defense;
  }

  decreaseDurabilityWithoutDefense (value) {
    this.durability -= value;
    if (this.durability <= 0) {
      this.destroy();
    }
  }

  decreaseDurability (value) {
    const current = this.durability;
    const newDurability = current - (value - this.getDefense());
    this.durability = Math.min(current, newDurability);
    this.renderer.character = this.durability;
    this.game.draw()
    if (this.durability <= 0) {
      this.destroy();
    }
  }

  increaseDurability (value) {
    this.durability += value
  }

  destroy () {
    this.onDestroy();
    destroyEntity(this);
  }
}

const IsParticle = superclass => class extends superclass {
  constructor({
    pos = { x: 1, y: 1 },
    direction = { x: 0, y: 0 },
    life = 1,
    speed = 1,
    type = Constant.PARTICLE_TYPE.directional,
    path = null,
    ...args
  }) {
    super({ ...args })
    this.pos = pos;
    this.direction = direction;
    this.life = life;
    this.speed = speed;
    this.type = type;
    this.path = path;
    this.entityTypes = this.entityTypes.concat('PARTICLE')
  }

  getNextPos(step) {
    switch (this.type) {
      case Constant.PARTICLE_TYPE.directional:
        return {
          x: this.pos.x + (this.direction.x * this.speed) * step,
          y: this.pos.y + (this.direction.y * this.speed) * step,
        }
      case Constant.PARTICLE_TYPE.path:
        const nextPos = this.path.shift();
        return nextPos ? {...nextPos} : {...this.pos}
    }
  }

  update(step) {
    this.life -= step;
    if (this.life > 0) {
      this.pos = this.getNextPos(step);
    }
  }
}

const Speaking = superclass => class extends superclass {
  constructor({ messages = ['I have nothing to say.'], messageType, ...args }) {
    super({ ...args })
    this.entityTypes = this.entityTypes.concat('SPEAKING')
    this.messages = messages;
    this.messageType = messageType
  }

  getAction (game) {
    const message = this.messages.shift();
    this.messages.push(message);
    return new Action.Say({
      actor: this,
      game,
      message: message,
      messageType: this.messageType,
      processDelay: 0,
    });
  }
}

const Burnable = superclass => class extends superclass {
  constructor({ ...args }) {
    super({ ...args })
    this.entityTypes = this.entityTypes.concat('BURNABLE')
  }

  burn () {
    this.decreaseDurability(2)
    return true;
  }
}

const Exploding = superclass => class extends superclass {
  constructor({ flammability = 1, explosivity = 1, ...args }) {
    super({ ...args })
    this.entityTypes = this.entityTypes.concat('EXPLODING')
    this.flammability = flammability;
    this.explosivity = explosivity;
  }

  enflame () {
    // create num of fireSpreads
    const fires = Array(this.flammability).fill('').map((item) => {
      return new FireSpread({
        name: 'Pyro',
        pos: { ...this.pos },
        game: this.game,
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
    })

    fires.forEach((fire) => {
      // add them to map
      this.game.placeActorOnMap(fire);
      // add them to engine
      this.game.engine.addActor(fire)
    })
  }

  explode () {
    let structure = {
      x_offset: 0,
      y_offset: 0,
      positions: Array(this.explosivity).fill('').reduce((acc, curr, i) => {
        return acc.concat(...Helper.getPointsOnCircumference(0, 0, i + 1))
      }, [])
    };

    structure.positions.forEach((slot) => {
      let position = {
        x: this.pos.x + slot.x + structure.x_offset,
        y: this.pos.y + slot.y + structure.y_offset
      }
      const tile = this.game.map[Helper.coordsToString(position)];
      if (tile) tile.type = 'BURNT';
    });

    // this.game.draw(); //may not need draw here
  }

  destroy () {
    this.enflame();
    this.explode();
    super.destroy();
  }
}

const Helpless = superclass => class extends superclass {
  constructor({ ...args }) {
    super({ ...args })
    this.entityTypes = this.entityTypes.concat('HELPLESS')
  }
}

export const UI_Actor = pipe(
  Acting, 
  Rendering, 
  Playing, 
  UI
)(Entity);

export const Actor = pipe(
  Acting, 
  Rendering
)(Entity);

export const Speaker = pipe(
  Acting,
  Rendering,
  Destructable,
  Speaking,
  Draggable,
  Burnable,
  Helpless,
)(Entity);

export const Wall = pipe(
  Rendering,
  Destructable,
)(Entity);

export const Debris = pipe(
  Rendering,
  Containing,
  Draggable,
  Burnable,
  Destructable,
  Exploding,
)(Entity);

export const MovingWall = pipe(
  Acting,
  Rendering,
  // Pushing,
  DirectionalPushing,
  Destructable,
)(Entity);

export const Chaser = pipe(
  Acting, 
  Rendering, 
  Chasing, 
  Destructable
)(Entity);

export const Bandit = pipe(
  Acting, 
  Rendering, 
  Chasing, 
  Destructable,
  Attacking,
)(Entity);

export const RangedBandit = pipe(
  Acting, 
  Rendering, 
  RangedChasing, 
  Destructable,
  Attacking,
)(Entity);

export const Player = pipe(
  Acting,
  Rendering,
  Dragging,
  Charging, 
  Signing, 
  Containing, 
  Equiping, 
  Attacking, 
  HasInnerGates,
  Destructable, 
  Cloning,
  Playing,
  Burnable,
)(Entity);

export const Weapon = pipe(
  Rendering, 
  Equipable, 
  Attacking
)(Entity);

export const Armor = pipe(
  Rendering, 
  Equipable, 
  Destructable,
)(Entity);

export const DestructiveProjectile = pipe(
  Acting, 
  Rendering, 
  Attacking, 
  DestructiveProjecting, 
  Destructable
)(Entity);

export const DirectionalProjectile = pipe(
  Acting, 
  Rendering, 
  Attacking, 
  DirectionalProjecting, 
  Destructable
)(Entity);

export const DestructiveCloudProjectile = pipe(
  Acting, 
  Rendering, 
  Attacking, 
  GaseousDestructiveProjecting, 
  Destructable, 
  Gaseous
)(Entity);

export const DestructiveCloudProjectileV2 = pipe(
  Acting, 
  Destructable,
  Parent, 
)(Entity);

export const FireSpread = pipe (
  Acting,
  Rendering,
  Destructable,
  Attacking,
  Spreading,
)(Entity);

export const Particle = pipe(
  Acting,
  Rendering,
  IsParticle,
)(Entity);

export const ParticleEmitter = pipe(
  Acting, 
  Destructable,
  Parent, 
)(Entity);