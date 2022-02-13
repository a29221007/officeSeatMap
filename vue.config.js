// module.exports = {
//     devServer: {
//         proxy: {
//             '/api': {
//                 target: 'http://172.16.200.152:8091/api/', //接口域名
//                 changeOrigin: true,             //是否跨域
//                 secure: true,                   //是否https接口
//                 pathRewrite: {                  //路径重置
//                     '^/api': ''
//                 }
//             }
//         }
//     }
// }