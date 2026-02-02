MERCATOR = (function () {
    // Pre-calculate constants
    const DEG_TO_RAD = Math.PI / 180;
    const RAD_TO_DEG = 180 / Math.PI;
    const LNG_SCALE = 256 / 360;
    const LAT_SCALE = 256 / (2 * Math.PI);
    const WORLD_SIZE = 256;
    const HALF_WORLD = 128;
    const SINY_CLAMP = 0.9999;

    return {
        fromLatLngToPoint: function (latLng) {
            const lat = latLng.lat() * DEG_TO_RAD;
            const siny = Math.min(Math.max(Math.sin(lat), -SINY_CLAMP), SINY_CLAMP);
            return {
                x: HALF_WORLD + latLng.lng() * LNG_SCALE,
                y: HALF_WORLD + 0.5 * Math.log((1 + siny) / (1 - siny)) * -LAT_SCALE
            };
        },

        fromPointToLatLng: function (point) {
            return {
                lat: (2 * Math.atan(Math.exp((point.y - HALF_WORLD) / -LAT_SCALE)) - Math.PI / 2) * RAD_TO_DEG,
                lng: (point.x - HALF_WORLD) / LNG_SCALE
            };
        },

        getTileAtLatLng: function (latLng, zoom) {
            const t = 1 << zoom; // Bit shift instead of Math.pow(2, zoom)
            const s = WORLD_SIZE / t;
            const p = this.fromLatLngToPoint(latLng);
            return {
                x: Math.floor(p.x / s),
                y: Math.floor(p.y / s),
                z: zoom
            };
        },

        getTileBounds: function (tile) {
            tile = this.normalizeTile(tile);
            const t = 1 << tile.z;
            const s = WORLD_SIZE / t;
            const x1 = tile.x * s;
            const y1 = tile.y * s;

            return {
                sw: this.fromPointToLatLng({ x: x1, y: y1 + s }),
                ne: this.fromPointToLatLng({ x: x1 + s, y: y1 })
            };
        },

        normalizeTile: function (tile) {
            const t = 1 << tile.z;
            tile.x = ((tile.x % t) + t) % t;
            tile.y = ((tile.y % t) + t) % t;
            return tile;
        },

        fromLatLngToPixels: function (map, latLng) {
            const bounds = map.getBounds();
            const projection = map.getProjection();
            const scale = 1 << map.getZoom(); // Bit shift for power of 2

            const topRight = projection.fromLatLngToPoint(bounds.getNorthEast());
            const bottomLeft = projection.fromLatLngToPoint(bounds.getSouthWest());
            const worldPoint = projection.fromLatLngToPoint(latLng);

            return {
                x: (worldPoint.x - bottomLeft.x) * scale,
                y: (worldPoint.y - topRight.y) * scale
            };
        },

        fromLatLngToTilePoint: function (map, evt) {
            const zoom = map.getZoom();
            const tile = this.getTileAtLatLng(evt.latLng, zoom);
            const tileBounds = this.getTileBounds(tile);
            const tileSwLatLng = new google.maps.LatLng(tileBounds.sw);
            const tileNeLatLng = new google.maps.LatLng(tileBounds.ne);
            const tileSwPixels = this.fromLatLngToPixels(map, tileSwLatLng);
            const tileNePixels = this.fromLatLngToPixels(map, tileNeLatLng);

            return {
                x: evt.pixel.x - tileSwPixels.x,
                y: evt.pixel.y - tileNePixels.y
            };
        },

        isPointInPolygon: function (point, polygon) {
            if (!polygon || !polygon.length) return false;

            let inside = false;
            const px = point.x;
            const py = point.y;

            for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                const xi = polygon[i].x, yi = polygon[i].y;
                const xj = polygon[j].x, yj = polygon[j].y;

                const intersect = ((yi > py) !== (yj > py)) &&
                    (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }
            return inside;
        },

        in_circle: function (center_x, center_y, radius, x, y) {
            const dx = center_x - x;
            const dy = center_y - y;
            return (dx * dx + dy * dy) <= radius * radius;
        },

        getDistanceFromLine: function (point, line) {
            if (!line || line.length < 2) return Number.POSITIVE_INFINITY;

            let minDistance = Number.POSITIVE_INFINITY;
            const px = point.x;
            const py = point.y;

            for (let i = 0, l = line.length - 1; i < l; i++) {
                const distance = this.projectPointOnLineSegment(px, py, line[i], line[i + 1]);
                if (distance < minDistance) {
                    minDistance = distance;
                }
            }
            return minDistance;
        },

        projectPointOnLineSegment: function (px, py, r0, r1) {
            const x1 = r0.x;
            const y1 = r0.y;
            const x2 = r1.x;
            const y2 = r1.y;

            const A = px - x1;
            const B = py - y1;
            const C = x2 - x1;
            const D = y2 - y1;

            const dot = A * C + B * D;
            const len_sq = C * C + D * D;

            let xx, yy;

            if (len_sq === 0) { // Zero length line
                xx = x1;
                yy = y1;
            } else {
                const param = dot / len_sq;

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
            }

            const dx = px - xx;
            const dy = py - yy;
            return Math.sqrt(dx * dx + dy * dy);
        }
    };
})();