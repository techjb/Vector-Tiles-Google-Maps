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
    }
}
