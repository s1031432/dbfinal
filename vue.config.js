module.exports = {
    devServer: {
        proxy: {
            '/data':{
                target: 'https://min-api.cryptocompare.com/data/',
                pathRewrite: {'^/data': ''},
                changeOrigin: true,
                ws: true
            },
            '/api': {
                target: 'http://140.119.164.151:3000/api/',
                pathRewrite: {'^/api': ''},
                changeOrigin: true,
                ws: true
            }
        }
    },

    transpileDependencies: [
        'vuetify'
    ]
}
