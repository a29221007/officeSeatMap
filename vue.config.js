module.exports = {
    devServer: {
        proxy: {
            '/api': {
                target: 'https://qyapi.weixin.qq.com', //接口域名
                changeOrigin: true,             //是否跨域
                secure: true,                   //是否https接口
                pathRewrite:{           //表示需要rewrite重写的
                    '^/api':'',
                }
            }
        }
    }
}