const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function harness(overrides = {}, bundle) {
    const sandbox = {
        console, setTimeout, clearTimeout, Headers, Response, Request, AbortController,
        TextDecoder, TextEncoder, DecompressionStream, Uint8Array, ArrayBuffer,
        fetch: global.fetch,
        google: { maps: { Size: function (width, height) { this.width = width; this.height = height; } } },
        Path2D: class { moveTo() {} lineTo() {} addPath() {} arc() {} closePath() {} },
        ...overrides
    };
    vm.createContext(sandbox);
    const files = bundle ? [bundle] : JSON.parse(fs.readFileSync(path.join(__dirname, '../bundleconfig.json'), 'utf8'))[0].inputFiles.filter(f => !f.startsWith('lib/pmtiles/'));
    for (const file of files) {
        vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), sandbox, { filename: file });
    }
    const Source = vm.runInContext('MVTSource', sandbox);
    const context2d = new Proxy({}, { get(target, key) {
        if (!(key in target)) target[key] = () => {};
        return target[key];
    } });
    const document = { createElement: () => ({ getContext: () => context2d }) };
    const map = { zoom: 5, getZoom() { return this.zoom; }, addListener(event, callback) { this[event] = callback; } };
    return { Source, sandbox, document, map, context2d };
}

const tick = () => new Promise(resolve => setImmediate(resolve));
const deferred = () => {
    let resolve, reject;
    const promise = new Promise((a, b) => { resolve = a; reject = b; });
    return { promise, resolve, reject };
};

module.exports = { harness, tick, deferred };
