// 不同环境下的接口根地址
var baseUrl= ""
// 不同环境下分享的项目地址
var shareUrl = ''
// 不同环境下预约会议室跳转OA的根路径
var OAUrl = ''
switch (process.env.NODE_ENV) {
    case 'development':
        // 本地环境
        baseUrl = "http://maptest.longtubas.com:8091/api/"
        shareUrl = 'http://maptest.longtubas.com?openMode=share&qr_code='
        OAUrl = 'https://oabak.longtubas.com/'
        break
    case 'develop':
        // 测试环境
        baseUrl = "http://maptest.longtubas.com:8091/api/"
        shareUrl = 'http://maptest.longtubas.com?openMode=share&qr_code='
        OAUrl = 'https://oabak.longtubas.com/'
        break
    case 'production':
        // 正式环境
        baseUrl = "https://map.longtubas.com/api/"
        shareUrl = 'https://map.longtubas.com?openMode=share&qr_code='
        OAUrl = 'https://oa.longtubas.com/'
        break
}
export default { baseUrl, shareUrl, OAUrl }