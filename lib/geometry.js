/**
 * @typedef {Object} TileLocation
 * @property {Number} x
 * @property {Number} y
 * @property {Number} z
 */

/**
 * @param {number} zoom
 * @param {number} x
 * @param {number} y
 * @return {string}
 */
const getTileString = (zoom, x, y) => [zoom, x, y].join(':');

/**
 * @param {string} id Tile id in format 'zoom:x:y'
 * @return {TileLocation}
 */
const getTileFromString = (id) => {
  try {
    const [zoom, x, y] = id.split(':');
    return {
      zoom: Number(zoom),
      x: Number(x),
      y: Number(y),
    };
  } catch (e) {
    console.error('Error parsing tile id', id);
    return {zoom: 0, x: 0, y: 0};
  }
};

/**
 * @param {google.maps.Point} point
 * @param {TileContext} tileContext
 * @return {google.maps.Point}
 */
const getOverZoomedPoint = (point, tileContext) => {
  const parentTile = getTileFromString(tileContext.parentId);
  const currentTile = getTileFromString(tileContext.id);
  const zoomDistance = currentTile.zoom - parentTile.zoom;

  const scale = Math.pow(2, zoomDistance);

  const xScale = point.x * scale;
  const yScale = point.y * scale;

  const xTileOffset = currentTile.x % scale;
  const yTileOffset = currentTile.y % scale;

  const newPoint = new window.google.maps.Point(
      xScale - (xTileOffset * tileContext.tileSize),
      yScale - (yTileOffset * tileContext.tileSize),
  );

  return newPoint;
};

/**
 * Scales a point to the current tile
 * @param {google.maps.Point} coords
 * @param {TileContext} tileContext
 * @param {Number} [divisor=1]
 * @return {google.maps.Point}
 */
const getPoint = (coords, tileContext, divisor = 1) => {
  const point = new window.google.maps.Point(coords.x / divisor, coords.y / divisor);

  if (tileContext.parentId) {
    return getOverZoomedPoint(point, tileContext);
  }
  return point;
};

export {
  getPoint,
  getTileFromString,
  getTileString,
};
