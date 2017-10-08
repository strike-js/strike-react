const {FuseBox, EnvPlugin, CSSPlugin, UglifyJSPlugin, TypeScriptHelpers} = require("fuse-box");

const production = false;
const fuse = FuseBox.init({
    homeDir: "src",
    output: "dist/$name.js",
    hash: production,
    cache: !production,
    tsConfig: "tsconfig.json",
    useTypescriptCompiler: true,
    plugins: [
        // TypeScriptHelpers(),
        EnvPlugin({ NODE_ENV: production ? "production" : "development" }),
        CSSPlugin(), production && UglifyJSPlugin()
    ]
});
fuse.bundle("app")
    .instructions(`> ./examples/Basic.tsx`)
    // .hmr()
    .watch()
    .hmr();
    // .watch();
fuse.dev({
    root:'./dist'
}); 

fuse.run();