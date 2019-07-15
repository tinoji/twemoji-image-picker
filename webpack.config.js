const path = require('path');
const fs = require('fs');

// https://github.com/lovell/sharp/issues/794
const nodeModules = {};
fs.readdirSync('node_modules')
    .filter(item => ['.bin'].indexOf(item) === -1)  // exclude the .bin folder
    .forEach((mod) => {
        nodeModules[mod] = 'commonjs ' + mod;
    });

var main = {
    mode: 'development',
    target: 'electron-main',
    entry: path.join(__dirname, 'src', 'main', 'index'),
    externals: nodeModules,
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'build')
    },
    node: {
        __dirname: false,
        __filename: false
    },
    module: {
        rules: [{
            test: /.ts?$/,
            include: [
                path.resolve(__dirname, 'src'),
            ],
            exclude: [
                path.resolve(__dirname, 'node_modules'),
            ],
            loader: 'ts-loader',
        }]
    },
    resolve: {
        extensions: ['.js', '.ts']
    },
};

var renderer = {
    mode: 'development',
    target: 'electron-renderer',
    entry: path.join(__dirname, 'src', 'renderer', 'index'),
    externals: nodeModules,
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'build', 'renderer'),
        library: 'RendererLib' // call like following: window.RendererLib.foo()
    },
    resolve: {
        extensions: ['.json', '.js', '.jsx', '.css', '.ts', '.tsx']
    },
    module: {
        rules: [{
            test: /\.(tsx|ts)$/,
            use: [
                'ts-loader'
            ],
            include: [
                path.resolve(__dirname, 'src'),
                path.resolve(__dirname, 'node_modules'),
            ],
        }]
    },
};

module.exports = [
    main, renderer
];