// 导入微信jdk
import wx from "weixin-js-sdk"
// 导入获取配置项的api
import { getQrConfig } from '@/api/jumpWX.js'

// 首先要获取当前页面的url
const url = window.location.href
getQrConfig(url).then(res => {
    const { appId, timestamp, nonceStr, signature } = res.data
    wx.config({beta: true, debug: false, appId, timestamp, nonceStr, signature, jsApiList: ['scanQRCode', 'invoke'] })
})

export default wx