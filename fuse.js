const { FuseBox, SassPlugin, CSSPlugin, TypeScriptHelpers, UglifyJSPlugin,JSONPlugin, HTMLPlugin } = require('fuse-box');
const path = require("path");

const fuseBox = FuseBox.init({
    homeDir: "src",
    
    sourcemaps: true,
    // serverBundle: true,
    outFile: `./lib/examples/Basic.js`,
    plugins: [
        JSONPlugin(),
        [TypeScriptHelpers()/*,UglifyJSPlugin()*/]
    ]
});

fuseBox.devServer('>examples/Basic.tsx',{
    // httpServer:false,
    port:3232
});

// fuseBox.bundle('>index.tsx');

module.exports = fuseBox;