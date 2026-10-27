const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');

async function build() {
    const root = path.resolve(__dirname, '..');
    const vendor = await esbuild.build({
        stdin: { contents: 'export * from "pmtiles";', resolveDir: root },
        bundle: true,
        format: 'iife',
        globalName: 'pmtiles',
        target: 'es2017',
        minify: true,
        write: false,
        legalComments: 'inline'
    });
    fs.mkdirSync(path.join(root, 'lib/pmtiles'), { recursive: true });
    fs.copyFileSync(path.join(root, 'node_modules/fflate/LICENSE'), path.join(root, 'lib/pmtiles/fflate-LICENSE.txt'));
    const licenses = 'PMTiles 4.5.0\n' + fs.readFileSync(path.join(root, 'lib/pmtiles/LICENSE.txt'), 'utf8') +
        '\nfflate\n' + fs.readFileSync(path.join(root, 'lib/pmtiles/fflate-LICENSE.txt'), 'utf8');
    fs.writeFileSync(path.join(root, 'lib/pmtiles/pmtiles.js'),
        '/*!\n' + licenses + '\n*/\n' + vendor.outputFiles[0].text);
    const config = JSON.parse(fs.readFileSync(path.join(root, 'bundleconfig.json'), 'utf8'))[0];
    const source = config.inputFiles.map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('\n;\n');
    fs.writeFileSync(path.join(root, config.outputFileName), source);
    const minified = await esbuild.transform(source, { minify: true, target: 'es2017', legalComments: 'inline' });
    fs.writeFileSync(path.join(root, config.outputFileName.replace(/\.js$/, '.min.js')), minified.code);
}

build().catch(error => { console.error(error); process.exitCode = 1; });
