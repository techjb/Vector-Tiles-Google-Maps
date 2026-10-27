// Live, read-only integration check against the public example archive.
const assert = require('node:assert/strict');
const { harness } = require('./helpers.cjs');

const url = 'https://vector-tiles-google-maps.s3.eu-west-3.amazonaws.com/Spanish-Census.pmtiles';
function coordinate(lat, lng, z) {
    const width = 2 ** z;
    const radians = lat * Math.PI / 180;
    return {
        x: Math.floor((lng + 180) / 360 * width),
        y: Math.floor((1 - Math.asinh(Math.tan(radians)) / Math.PI) / 2 * width)
    };
}

async function check(bundle) {
    const requests = [];
    const errors = [];
    const env = harness({ fetch: async (input, init) => {
        const headers = new Headers(init?.headers);
        headers.set('Origin', 'https://localhost:44390');
        const response = await fetch(input, { ...init, headers, signal: AbortSignal.timeout(30000) });
        assert.equal(response.status, 206);
        assert.equal(response.headers.get('access-control-allow-origin'), 'https://localhost:44390');
        assert.ok(headers.get('range'));
        requests.push({ range: headers.get('range'), bytes: Number(response.headers.get('content-length')) });
        return response;
    } }, bundle);
    const source = new env.Source(env.map, {
        url, cache: true, visibleLayers: ['provinces'], selectedFeatures: ['29', '39', '38'],
        getIDForLayerFeature: feature => feature.properties.Id,
        onTileError: error => errors.push(error)
    });
    const header = await source._sourceReady;
    assert.equal(header.specVersion, 3);
    assert.equal(header.tileType, 1);
    assert.equal(header.maxZoom, 14);
    const metadata = await source._pmtiles.getMetadata();
    for (const zoom of [5, 14, 16]) {
        env.map.zoom = zoom;
        source._zoomChanged();
        const coord = coordinate(40.4168, -3.7038, zoom);
        source.getTile(coord, zoom, env.document);
        await Promise.race([
            source.tileLoaded(),
            new Promise((_, reject) => { const timeout = setTimeout(() => reject(new Error('Tile load timeout')), 35000); timeout.unref(); })
        ]);
        assert.equal(errors.length, 0, errors.map(e => e.stack).join('\n'));
        const tile = source._visibleTiles[source.getTileId(zoom, coord.x, coord.y)];
        assert.ok(tile.vectorTile, 'Decoded tile missing at zoom ' + zoom);
        assert.ok(Object.keys(tile.vectorTile.layers).length > 0);
        if (zoom === 16) assert.match(tile.parentId, /^14:/);
        const layerName = 'provinces';
        const features = tile.vectorTile.layers[layerName].parsedFeatures;
        assert.ok(features.length > 0);
        const layer = source.mVTLayers[layerName];
        const feature = Object.values(layer._mVTFeatures)[0];
        feature.select();
        assert.equal(feature.selected, true);
        feature.deselect();
        assert.equal(feature.selected, false);
        source.setStyle({ fillStyle: 'rgba(0,0,255,0.2)', strokeStyle: 'blue', lineWidth: 1 });
        console.log(JSON.stringify({ bundle, zoom, layer: layerName, features: features.length, parent: tile.parentId }));
    }
    assert.ok(requests.reduce((sum, request) => sum + request.bytes, 0) < 57581439 / 10,
        'The test must retrieve ranges, not download the whole archive');
    console.log(JSON.stringify({ bundle, metadataLayers: metadata.vector_layers?.map(layer => layer.id), requests: requests.length, bytes: requests.reduce((sum, request) => sum + request.bytes, 0) }));
}

(async () => {
    await check('dist/vector-tiles-google-maps.js');
    await check('dist/vector-tiles-google-maps.min.js');
})().catch(error => { console.error(error); process.exitCode = 1; });
