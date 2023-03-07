import {getPoint} from './geometry';

/**
 * Accepts a canvas and optionally applies styles from a StyleOptions object before returning the context2d for
 * drawing.
 * @param {HTMLCanvasElement} canvas
 * @param {StyleOptions} [style={}]
 * @return {CanvasRenderingContext2D}
 */
const getContext2d = (canvas, style = {}) => {
  const context2d = canvas.getContext('2d');
  for (const key in style) {
    if (key === 'selected') continue;
    context2d[key] = style[key];
  }
  return context2d;
};

/**
 * Builds a line along all the paths in the geometry and adds each to the tile's paths2d without closing the path
 * or drawing the stroke
 * @param {TileContext} tileContext
 * @param {FeatureTile} tile
 * @return {Path2D}
 */
const drawGeometry = (tileContext, tile) => {
  const geometry = tile.vectorTileFeature.loadGeometry();
  geometry.forEach((path) => {
    const path2d = new Path2D();
    path.forEach((rawPoint, i) => {
      const p = getPoint(rawPoint, tileContext, tile.divisor);
      const operation = i === 0 ? 'moveTo' : 'lineTo'; // if this is the first point, move to it without drawing
      path2d[operation](p.x, p.y);
    });
    tile.paths2d.addPath(path2d);
  });
  return tile.paths2d;
};

/**
 * @param {TileContext} tileContext
 * @param {FeatureTile} tile
 * @param {StyleOptions} style
 */
const drawPoint = (tileContext, tile, style) => {
  const coordinates = tile.vectorTileFeature.loadGeometry()[0][0];
  const point = getPoint(coordinates, tileContext, tile.divisor);
  const radius = style.radius || 3;
  const context2d = getContext2d(tileContext.canvas, style);
  context2d.beginPath();
  context2d.arc(point.x, point.y, radius, 0, Math.PI * 2);
  context2d.closePath();
  context2d.fill();
  context2d.stroke();
};

/**
 * @param {TileContext} tileContext
 * @param {FeatureTile} tile
 * @param {StyleOptions} style
 */
const drawLineString = (tileContext, tile, style) => {
  const context2d = getContext2d(tileContext.canvas, style);
  context2d.stroke(drawGeometry(tileContext, tile));
};

/**
 * @param {TileContext} tileContext
 * @param {FeatureTile} tile
 * @param {StyleOptions} style
 */
const drawPolygon = (tileContext, tile, style) => {
  const paths = drawGeometry(tileContext, tile);
  paths.closePath();

  const context2d = getContext2d(tileContext.canvas, style);
  if (style.fillStyle) {
    context2d.fill(paths);
  }
  if (style.strokeStyle) {
    context2d.stroke(paths);
  }
};

export {
  getContext2d,
  drawGeometry,
  drawPoint,
  drawLineString,
  drawPolygon,
};
