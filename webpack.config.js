const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
    mode: 'none',
    target: "node",
    output: {
        filename: "[name].webpack.js",
        libraryTarget: "commonjs2"
    },
    resolve: {
        symlinks: false,
        extensions: [".js", ".json"]
    },
    externals: [/^aws-sdk/],
    plugins: [
        new UglifyJsPlugin({
            uglifyOptions: {
                output: {
                    comments: false,
                    semicolons: false,
                },
                keep_classnames: true,
                keep_fnames: true,
            },
            parallel: true,
            cache: true
        })
    ]
};
