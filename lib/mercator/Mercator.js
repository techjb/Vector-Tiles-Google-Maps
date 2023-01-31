export function fromLatLngToPoint(latLng) {
  const siny = Math.min(Math.max(Math.sin(latLng.lat() * (Math.PI / 180)),
      -.9999),
  .9999);
  return {
    x: 128 + latLng.lng() * (256 / 360),
    y: 128 + 0.5 * Math.log((1 + siny) / (1 - siny)) * -(256 / (2 * Math.PI)),
  };
}

export function fromPointToLatLng(point) {
  return {
    lat: (2 * Math.atan(Math.exp((point.y - 128) / -(256 / (2 * Math.PI)))) -
                Math.PI / 2) / (Math.PI / 180),
    lng: (point.x - 128) / (256 / 360),
  };
}

export function getTileAtLatLng(latLng, zoom) {
  const t = Math.pow(2, zoom);
  const s = 256 / t;
  const p = fromLatLngToPoint(latLng);
  return {
    x: Math.floor(p.x / s),
    y: Math.floor(p.y / s),
    z: zoom,
  };
}

export function getTileBounds(tile) {
  tile = normalizeTile(tile);
  const t = Math.pow(2, tile.z);
  const s = 256 / t;
  const sw = {
    x: tile.x * s,
    y: (tile.y * s) + s,
  };
  const ne = {
    x: tile.x * s + s,
    y: (tile.y * s),
  };
  return {
    sw: fromPointToLatLng(sw),
    ne: fromPointToLatLng(ne),
  };
}

export function normalizeTile(tile) {
  const t = Math.pow(2, tile.z);
  tile.x = ((tile.x % t) + t) % t;
  tile.y = ((tile.y % t) + t) % t;
  return tile;
}

export function fromLatLngToPixels(map, latLng) {
  const bounds = map.getBounds();
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  const topRight = map.getProjection().fromLatLngToPoint(ne);
  const bottomLeft = map.getProjection().fromLatLngToPoint(sw);
  const scale = Math.pow(2, map.getZoom());
  const worldPoint = map.getProjection().fromLatLngToPoint(latLng);
  return {
    x: (worldPoint.x - bottomLeft.x) * scale,
    y: (worldPoint.y - topRight.y) * scale,
  };
}

export function fromLatLngToTilePoint(map, evt) {
  const zoom = map.getZoom();
  const tile = getTileAtLatLng(evt.latLng, zoom);
  const tileBounds = getTileBounds(tile);
  const tileSwLatLng = new google.maps.LatLng(tileBounds.sw);
  const tileNeLatLng = new google.maps.LatLng(tileBounds.ne);
  const tileSwPixels = fromLatLngToPixels(map, tileSwLatLng);
  const tileNePixels = fromLatLngToPixels(map, tileNeLatLng);
  return {
    x: evt.pixel.x - tileSwPixels.x,
    y: evt.pixel.y - tileNePixels.y,
  };
}

// todo: sometimes it does not work properly
export function isPointInPolygon(point, polygon) {
  if (polygon && polygon.length) {
    // TODO refactor to use let instead of nasty var function scope to access c outside loop
    for (var c = false, i = -1, l = polygon.length, j = l - 1; ++i < l; j = i) {
      ((polygon[i].y <= point.y && point.y < polygon[j].y) || (polygon[j].y <= point.y && point.y < polygon[i].y)) &&
                    (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) /
                        (polygon[j].y - polygon[i].y) + polygon[i].x) &&
                    (c = !c);
    }
    return c;
  }
}

export function inCircle(centerX, centerY, radius, x, y) {
  const squareDist = Math.pow((centerX - x), 2) + Math.pow((centerY - y), 2);
  return squareDist <= Math.pow(radius, 2);
}

export function getDistanceFromLine(point, line) {
  let minDistance = Number.POSITIVE_INFINITY;
  if (line && line.length > 1) {
    for (let i = 0, l = line.length - 1; i < l; i++) {
      const distance = projectPointOnLineSegment(point, line[i], line[i + 1]);
      if (distance <= minDistance) {
        minDistance = distance;
      }
    }
  }
  return minDistance;
}

export function projectPointOnLineSegment(point, r0, r1) {
  const x = point.x;
  const y = point.y;
  const x1 = r0.x;
  const y1 = r0.y;
  const x2 = r1.x;
  const y2 = r1.y;

  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq != 0) // in case of 0 length line
  {
    param = dot / lenSq;
  }

  let xx; let yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = x - xx;
  const dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}
