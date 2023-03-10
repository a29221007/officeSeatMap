// 座位缩放的函数
// 参数为当前选中的 DOM 元素
import setTransform from './newSeatTransform.js'
function seatZoom(seat){
    if(!seat) return alert('座位坐标异常')
    // 首先将当前座位的缩放设置为1
    seat.style.transform = setTransform(seat,1)
    // 初始化缩放变量
    let scaleNum = 1
    let b = true
    clearInterval(seat.timer)
    seat.timer = setInterval(() => {
        if(scaleNum > 1.6){
            scaleNum = 1.6
            b = false
        }else if(scaleNum < 0.5){
            scaleNum = 0.5
            b = true
        }
        if(b){
            // 加
            scaleNum = scaleNum + 0.05
        }else {
            // 减
            scaleNum = scaleNum - 0.05
        }
        seat.style.transform = setTransform(seat,scaleNum)
    },15)
}

export default seatZoom
