MERCATOR = {
    fromLatLngToPoint: function (latLng) {
        var siny = Math.min(Math.max(Math.sin(latLng.lat() * (Math.PI / 180)),
            -.9999),
            .9999);
        return {
            x: 128 + latLng.lng() * (256 / 360),
            y: 128 + 0.5 * Math.log((1 + siny) / (1 - siny)) * -(256 / (2 * Math.PI))
        };
    },

    fromPointToLatLng: function (point) {
        return {
            lat: (2 * Math.atan(Math.exp((point.y - 128) / -(256 / (2 * Math.PI)))) -
                Math.PI / 2) / (Math.PI / 180),
            lng: (point.x - 128) / (256 / 360)
        };

    },

    getTileAtLatLng: function (latLng, zoom) {
        var t = Math.pow(2, zoom),
            s = 256 / t,
            p = this.fromLatLngToPoint(latLng);        
        return {
            x: Math.floor(p.x / s),
            y: Math.floor(p.y / s),
            z: zoom
        };
    },

    getTileBounds: function (tile) {
        tile = this.normalizeTile(tile);
        var t = Math.pow(2, tile.z),
            s = 256 / t,
            sw = {
                x: tile.x * s,
                y: (tile.y * s) + s
            },
            ne = {
                x: tile.x * s + s,
                y: (tile.y * s)
            };
        return {
            sw: this.fromPointToLatLng(sw),
            ne: this.fromPointToLatLng(ne)
        }
    },

    normalizeTile: function (tile) {
        var t = Math.pow(2, tile.z);
        tile.x = ((tile.x % t) + t) % t;
        tile.y = ((tile.y % t) + t) % t;
        return tile;
    },

    fromLatLngToPixels: function (map, latLng) {
        var bounds = map.getBounds();
        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();
        var topRight = map.getProjection().fromLatLngToPoint(ne);
        var bottomLeft = map.getProjection().fromLatLngToPoint(sw);
        var scale = Math.pow(2, map.getZoom());
        var worldPoint = map.getProjection().fromLatLngToPoint(latLng);
        return new google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
    },

    fromLatLngToTilePoint: function (map, evt, zoom) {
        var tile = this.getTileAtLatLng(evt.latLng, zoom);
        var tileBounds = this.getTileBounds(tile);
        var tileSwLatLng = new google.maps.LatLng(tileBounds.sw);
        var tileNeLatLng = new google.maps.LatLng(tileBounds.ne);
        var tileSwPixels = this.fromLatLngToPixels(map, tileSwLatLng);        
        var tileNePixels = this.fromLatLngToPixels(map, tileNeLatLng);         
        return {
            x: evt.pixel.x - tileSwPixels.x,
            y: evt.pixel.y - tileNePixels.y
        }
    },

    // todo: sometimes it does not work properly
    isPointInPolygon(point, polygon) {
        if (polygon && polygon.length) {
            for (var c = false, i = -1, l = polygon.length, j = l - 1; ++i < l; j = i) {
                ((polygon[i].y <= point.y && point.y < polygon[j].y) || (polygon[j].y <= point.y && point.y < polygon[i].y))
                    && (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x)
                    && (c = !c);
            }
            return c;
        }
    },

    in_circle(center_x, center_y, radius, x, y) {
        var square_dist = Math.pow((center_x - x), 2) + Math.pow((center_y - y), 2);
        return square_dist <= Math.pow(radius, 2);
    },

    // TODO: not tested
    getDistanceFromLine(point, line) {
        var min = Number.POSITIVE_INFINITY;
        if (line && line.length > 1) {
            point = L.point(point.x, point.y);
            for (var i = 0, l = line.length - 1; i < l; i++) {
                var test = this.projectPointOnLineSegment(point, line[i], line[i + 1]);
                if (test.distance <= min) {
                    min = test.distance;
                }
            }
        }
        return min;
    },

    projectPointOnLineSegment(point, r0, r1) {
        var lineLength = r0.distanceTo(r1);
        if (lineLength < 1) {
            return { distance: point.distanceTo(r0), coordinate: r0 };
        }
        var u = ((point.x - r0.x) * (r1.x - r0.x) + (point.y - r0.y) * (r1.y - r0.y)) / Math.pow(lineLength, 2);
        if (u < 0.0000001) {
            return { distance: point.distanceTo(r0), coordinate: r0 };
        }
        if (u > 0.9999999) {
            return { distance: point.distanceTo(r1), coordinate: r1 };
        }
        var a = L.point(r0.x + u * (r1.x - r0.x), r0.y + u * (r1.y - r0.y));
        return { distance: point.distanceTo(a), point: a };
    },


    get_centroid(points) {
        var first = points[0], last = points[points.length - 1];
        if (first.x != last.x || first.y != last.y) points.push(first);
        var twicearea = 0,
            x = 0, y = 0,
            nPts = points.length,
            p1, p2, f;
        for (var i = 0, j = nPts - 1; i < nPts; j = i++) {
            p1 = points[i]; p2 = points[j];
            f = p1.x * p2.y - p2.x * p1.y;
            twicearea += f;
            x += (p1.x + p2.x) * f;
            y += (p1.y + p2.y) * f;
        }
        f = twicearea * 3;
        return { x: x / f, y: y / f };
    }
    //get_centroid(pts) {
    //    var first = pts[0], last = pts[pts.length - 1];
    //    if (first.x != last.x || first.y != last.y) pts.push(first);
    //    var twicearea = 0,
    //        x = 0, y = 0,
    //        nPts = pts.length,
    //        p1, p2, f;
    //    for (var i = 0, j = nPts - 1; i < nPts; j = i++) {
    //        p1 = pts[i]; p2 = pts[j];
    //        f = p1.x * p2.y - p2.x * p1.y;
    //        twicearea += f;
    //        x += (p1.x + p2.x) * f;
    //        y += (p1.y + p2.y) * f;
    //    }
    //    f = twicearea * 3;
    //    return { x: x / f, y: y / f };
    //}
}
