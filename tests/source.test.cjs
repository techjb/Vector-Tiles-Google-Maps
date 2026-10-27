const { test } = require('node:test');
const assert = require('node:assert/strict');
const { harness, tick, deferred } = require('./helpers.cjs');

function setup({ header = { tileType: 1, minZoom: 0, maxZoom: 14 }, getTile = async () => ({ data: new ArrayBuffer(0) }), options = {} } = {}) {
    const calls = [];
    const archives = [];
    const pmtiles = {
        TileType: { Mvt: 1 },
        FetchSource: class { constructor(url, headers) { this.url = url; this.headers = headers; } },
        PMTiles: class {
            constructor(source) { this.source = source; archives.push(this); }
            getHeader() { return Promise.resolve(header); }
            getZxy(z, x, y) { calls.push([z, x, y]); return getTile(z, x, y, this.source.url); }
        }
    };
    const env = harness({ pmtiles });
    const errors = [];
    const source = new env.Source(env.map, { url: 'https://example.com/data.pmtiles', onTileError: error => errors.push(error), ...options });
    return { ...env, source, calls, archives, errors };
}

test('detects PMTiles including signed URLs; forwards custom headers', async () => {
    const env = setup({ options: { url: 'https://example.com/data.pmtiles?token=test', xhrHeaders: { Authorization: 'Bearer test' } } });
    env.source.getTile({ x: 15, y: 12 }, 5, env.document);
    await env.source.tileLoaded();
    assert.equal(env.source._sourceType, 'pmtiles');
    assert.equal(env.archives[0].source.headers.get('Authorization'), 'Bearer test');
    assert.deepEqual(env.calls, [[5, 15, 12]]);
    assert.equal(env.source.loadedTilesLen, 1);
    assert.ok(env.source._visibleTiles['5:15:12'].vectorTile);
});

test('waits for the header, derives overzoom and shares concurrent parent requests', async () => {
    const pendingHeader = deferred();
    const env = setup({ header: pendingHeader.promise });
    env.map.zoom = 16;
    env.source.getTile({ x: 32768, y: 24576 }, 16, env.document);
    env.source.getTile({ x: 32769, y: 24576 }, 16, env.document);
    assert.equal(env.calls.length, 0);
    pendingHeader.resolve({ tileType: 1, minZoom: 0, maxZoom: 14 });
    await env.source.tileLoaded();
    assert.deepEqual(env.calls, [[14, 8192, 6144]]);
    assert.equal(env.source._visibleTiles['16:32769:24576'].parentId, '14:8192:6144');
    assert.equal(env.source.loadedTilesLen, 2);
});

test('handles missing tiles, minZoom, wrapping and invalid y', async () => {
    const env = setup({ header: { tileType: 1, minZoom: 2, maxZoom: 14 }, getTile: async () => undefined });
    env.source.getTile({ x: -1, y: 10 }, 5, env.document);
    env.source.getTile({ x: 2, y: 32 }, 5, env.document);
    await env.source.tileLoaded();
    assert.deepEqual(env.calls, [[5, 31, 10]]);
    assert.equal(env.source.loadedTilesLen, 2);
    assert.equal(env.errors.length, 0);
    env.map.zoom = 1;
    env.source._zoomChanged();
    env.source.getTile({ x: 0, y: 0 }, 1, env.document);
    await env.source.tileLoaded();
    assert.equal(env.calls.length, 1);
});

test('reports unsupported archive types and settles the loading state', async () => {
    const env = setup({ header: { tileType: 2, minZoom: 0, maxZoom: 14 } });
    env.source.getTile({ x: 1, y: 1 }, 5, env.document);
    await env.source.tileLoaded();
    assert.match(env.errors[0].message, /MVT/);
    assert.equal(env.calls.length, 0);
});

test('network errors settle loading and do not enter the rendered tile cache', async () => {
    const env = setup({ getTile: async () => { throw new Error('offline'); }, options: { cache: true } });
    env.source.getTile({ x: 1, y: 1 }, 5, env.document);
    await env.source.tileLoaded();
    assert.equal(env.errors[0].message, 'offline');
    assert.equal(Object.keys(env.source._tilesDrawn).length, 0);
});

test('setUrl reloads the same canvas and ignores the previous pending response', async () => {
    const old = deferred();
    const env = setup({ getTile: async (z, x, y, url) => url.includes('new') ? { data: new ArrayBuffer(0) } : old.promise });
    const canvas = env.source.getTile({ x: 1, y: 1 }, 5, env.document);
    await tick();
    env.source.setUrl('https://example.com/new.pmtiles');
    await env.source.tileLoaded();
    assert.equal(env.source._visibleTiles['5:1:1'].canvas, canvas);
    const vectorTile = env.source._visibleTiles['5:1:1'].vectorTile;
    old.resolve({ data: new Uint8Array([255]).buffer });
    await tick();
    assert.equal(env.errors.length, 0);
    assert.equal(env.source._visibleTiles['5:1:1'].vectorTile, vectorTile);
    assert.equal(env.archives.length, 2);
});

test('releaseTile discards pending drawing and completed cached tiles can be reused', async () => {
    const pending = deferred();
    const env = setup({ getTile: () => pending.promise, options: { cache: true } });
    const canvas = env.source.getTile({ x: 1, y: 1 }, 5, env.document);
    await tick();
    env.source.releaseTile(canvas);
    pending.resolve({ data: new ArrayBuffer(0) });
    await tick();
    assert.equal(Object.keys(env.source._tilesDrawn).length, 0);
    env.source.getTile({ x: 1, y: 1 }, 5, env.document);
    await env.source.tileLoaded();
    const cached = env.source._visibleTiles['5:1:1'].canvas;
    env.source.releaseTile(cached);
    assert.equal(env.source.getTile({ x: 1, y: 1 }, 5, env.document), cached);
});

test('supports maxZoom zero and clamps configured maxZoom to the archive', async () => {
    const env = setup({ header: { tileType: 1, minZoom: 0, maxZoom: 0 } });
    env.source.getTile({ x: 15, y: 12 }, 5, env.document);
    await env.source.tileLoaded();
    assert.deepEqual(env.calls, [[0, 0, 0]]);
    const clamped = setup({ options: { sourceMaxZoom: 18 } });
    await clamped.source._sourceReady;
    assert.equal(clamped.source._sourceMaxZoom, 14);
});

test('legacy PBF URLs still use XMLHttpRequest and support reloads', async () => {
    const requests = [];
    const env = harness({ XMLHttpRequest: class {
        constructor() { requests.push(this); }
        open(method, url) { this.url = url; }
        setRequestHeader() {}
        send() { this.status = 200; this.response = new ArrayBuffer(0); this.onload(); }
    } });
    const source = new env.Source(env.map, { url: '/tiles/{z}/{x}/{y}.pbf' });
    source.getTile({ x: 1, y: 2 }, 5, env.document);
    await source.tileLoaded();
    assert.equal(requests[0].url, '/tiles/5/1/2.pbf');
    source.setUrl('/other/{z}/{x}/{y}.pbf');
    assert.equal(requests[1].url, '/other/5/1/2.pbf');
});

test('deferred source changes load the new data on redrawAllTiles', async () => {
    const env = setup();
    env.source.getTile({ x: 1, y: 1 }, 5, env.document);
    await env.source.tileLoaded();
    env.source.setUrl('https://example.com/next.pmtiles', false);
    assert.equal(env.source._visibleTiles['5:1:1'].vectorTile, null);
    env.source.redrawAllTiles();
    await env.source.tileLoaded();
    assert.equal(env.calls.length, 2);
    assert.ok(env.source._visibleTiles['5:1:1'].vectorTile);
});

test('style changes during a pending load do not restart the request', async () => {
    const pending = deferred();
    const env = setup({ getTile: () => pending.promise });
    env.source.getTile({ x: 1, y: 1 }, 5, env.document);
    await tick();
    env.source.setStyle({ fillStyle: 'blue' });
    pending.resolve({ data: new ArrayBuffer(0) });
    await env.source.tileLoaded();
    assert.equal(env.calls.length, 1);
    assert.ok(env.source._visibleTiles['5:1:1'].vectorTile);
});

test('all example scripts parse and census demos use S3 without Mapbox dependencies', () => {
    const fs = require('node:fs');
    const path = require('node:path');
    const vm = require('node:vm');
    const directory = path.join(__dirname, '../examples');
    let censusExamples = 0;
    for (const name of fs.readdirSync(directory).filter(file => file.endsWith('.html'))) {
        const html = fs.readFileSync(path.join(directory, name), 'utf8');
        for (const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
            new vm.Script(script[2], { filename: name });
            const src = /src="([^"]+)"/.exec(script[1])?.[1];
            if (src && !src.startsWith('https://')) assert.ok(fs.existsSync(path.join(directory, src)), src);
        }
        assert.doesNotMatch(html, /api\.mapbox\.com|getMapboxToken|mapbox-token/);
        if (html.includes('Spanish-Census.pmtiles')) {
            censusExamples++;
            assert.match(html, /sourceType: "pmtiles"/);
        }
    }
    assert.equal(censusExamples, 10);
});
