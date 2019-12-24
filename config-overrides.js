module.exports = function override(config, env) {
    //do stuff with the webpack config...
    config.output.publicPath = './';
    return config;
}