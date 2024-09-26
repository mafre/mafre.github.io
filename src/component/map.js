import PF from 'pathfinding';

class Map {
  constructor(tileSize, width, height) {
    this.tileSize = tileSize;
    this.width = width;
    this.height = height;

    this.finder = new PF.AStarFinder({
      allowDiagonal: true,
      dontCrossCorners: true,
    });

    this.grid = new PF.Grid(this.width, this.height);
  }

  findPath = (from, to) => {
    const grid = this.grid.clone();
    const path = this.finder.findPath(from.x, from.y, to.x, to.y, grid);

    return path;
  };

  add = (item, x, y) => {
    item.x = x * this.tileSize;
    item.y = y * this.tileSize;
  };

  setWalkableAt = (x, y, isWalkable) => {
    this.grid.setWalkableAt(x, y, isWalkable);
  };

  getTilePosition = (x, y) => {
    return {
      x: x * this.tileSize,
      y: y * this.tileSize,
    };
  };

  getTileCenter = (x, y) => {
    return {
      x: x * this.tileSize + this.tileSize / 2,
      y: y * this.tileSize + this.tileSize / 2,
    };
  };

  getTileAt = (x, y) => {
    return {
      x: Math.floor(x / this.tileSize),
      y: Math.floor(y / this.tileSize),
    };
  };
}

export default Map;
