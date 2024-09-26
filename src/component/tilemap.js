import Tilemap from 'openfl/display/Tilemap';
import Tileset from 'openfl/display/Tileset';
import Rectangle from 'openfl/geom/Rectangle';
import Sprite from 'openfl/display/Sprite';

class TileMapComponent extends Sprite {
  constructor(bitmapData, framesX, framesY, width, height) {
    super();

    this.tiles = [];
    this.tileset = new Tileset(bitmapData);
    this.tileWidth = Math.round(bitmapData.width / framesX);
    this.tileHeight = Math.round(bitmapData.height / framesY);

    for (let x = 0; x < framesX; x += 1) {
      for (let y = 0; y < framesY; y += 1) {
        this.tileset.addRect(
          new Rectangle(
            x * this.tileWidth,
            y * this.tileHeight,
            this.tileWidth,
            this.tileHeight,
          ),
        );
      }
    }

    this.tilemap = new Tilemap(width, height, this.tileset);
    this.tilemap.tileAlphaEnabled = false;
    this.tilemap.tileColorTransformEnabled = false;
    this.addChild(this.tilemap);
  }

  add = (tile) => {
    this.tilemap.addTile(tile);

    this.tiles.push(tile);
  };

  clear = () => {
    this.tiles.forEach((tile) => {
      this.tilemap.removeTile(tile);
    });

    this.tiles = [];
  };

  getTileAt = (index) => {
    return this.tilemap.getTileAt(index);
  };
}

export default TileMapComponent;
