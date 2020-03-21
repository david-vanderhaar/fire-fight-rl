import uuid from 'uuid/v1';

export class Mode {
  constructor({
    game = null,
    data = {},
  }) {
    let id = uuid();
    this.id = id;
    this.game = game;
    this.data = data;
    // this.type = type;
  }

  initialize() {
    console.log('initializing mode');
  }

  update() {
    console.log('updating mode');
  }

}