import Konva from 'konva';

export class Display {
  constructor({
    containerId = null,
    width = 100,
    height = 100,
    tileWidth = 10,
    tileHeight = 10,
    tileGutter = 0,
    tileOffset = 10,
    cameraFollow = false,
  }) {
    this.containerId = containerId;
    this.width = width;
    this.height = height;
    this.tilesWide = this.getTilesWide(width, tileOffset, tileWidth);
    this.tilesHigh = this.getTilesHigh(height, tileOffset, tileHeight);
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.tileGutter = tileGutter;
    this.tileOffset = tileOffset;
    this.cameraFollow = cameraFollow;
    this.stage = null;
    this.layer = null;
  }

  initialize (document) {
    let d = document.getElementById(this.containerId)
    let displayContainer = document.createElement('div');
    d.appendChild(displayContainer);

    this.stage = new Konva.Stage({
      container: 'display',   // id of container <div>
      width: this.width,
      height: this.height
    });

    this.layer = new Konva.Layer({
      hitGraphEnabled: false,
    });
    this.stage.add(this.layer);
  }

  updateTile(tile, character, foreground, background) {
    // child[0] is the rectangle
    // child[1] is the text
    tile.children[0].fill(background);
    tile.children[1].fill(foreground);
    tile.children[1].text(character);
  }

  createTile(x, y, character, foreground, background) {
    let node = new Konva.Group({
      id: `${x},${y}`,
      x: (this.tileWidth * x) + (this.tileOffset + this.tileGutter),
      y: (this.tileHeight * y) + (this.tileOffset + this.tileGutter),
      width: this.tileWidth,
      height: this.tileHeight,
      transformsEnabled: 'position',
      perfectDrawEnabled: false,
      listening: false,
      shadowForStrokeEnabled: false,
    });

    let rect = new Konva.Rect({
      name: 'rect',
      width: this.tileWidth,
      height: this.tileHeight,
      fill: background,
      strokeEnabled: false,
      // for optimization
      transformsEnabled: 'position',
      perfectDrawEnabled: false,
      listening: false,
      shadowForStrokeEnabled: false,
    });

    let text = new Konva.Text({
      name: 'text',
      text: character,
      width: this.tileWidth,
      height: this.tileHeight,
      fontSize: 18,
      fill: foreground,
      align: 'center',
      verticalAlign: 'middle',
      // for optimization
      transformsEnabled: 'position',
      perfectDrawEnabled: false,
      listening: false,
      shadowForStrokeEnabled: false,
    });

    node.add(rect);
    node.add(text);
    this.layer.add(node);
    return node;
  }

  getAbsoultueX(x) {
    return (this.tileWidth * x) + (this.tileOffset + this.tileGutter)
  }

  getAbsoultueY(y) {
    return (this.tileWidth * y) + (this.tileOffset + this.tileGutter)
  }

  getTilesWide (width, tileOffset, tileWidth) {
    return Math.floor((width - tileOffset) / tileWidth)
  }
  
  getTilesHigh(height, tileOffset, tileHeight) {
    return Math.floor((height - tileOffset) / tileHeight)
  }

  draw (playerPos) {
    if (this.cameraFollow && playerPos) {
      const tilesWide = this.tilesWide;
      const tilesHigh = this.tilesHigh;
      console.log(tilesWide);
      console.log(tilesHigh);
      
      const tilesAcrossOnScreen = Math.floor(this.width / this.tileWidth)
      const tilesDownOnScreen = Math.floor(this.height / this.tileHeight)
      
      const bufferX = Math.ceil(tilesWide - (tilesAcrossOnScreen / 2));
      const bufferY = Math.ceil(tilesHigh - (tilesDownOnScreen / 2));
      let newX = 0;
      let newY = 0;
      if (playerPos.x > tilesWide - bufferX) {
        newX = tilesWide - bufferX - playerPos.x
      }
      if (playerPos.y > tilesHigh - bufferY) {
        newY = tilesHigh - bufferY - playerPos.y;
      }
      this.layer.x(this.getAbsoultueX(newX))
      this.layer.y(this.getAbsoultueY(newY))
    }
    this.layer.batchDraw();
    // this.layer.draw();
  }
}
