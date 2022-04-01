// 座位缩放的函数
// 参数为当前选中的 DOM 元素
function seatZoom(seat){
    // 首先将当前座位的缩放设置为1transform:scale(3);
    seat.style.transform = 'scale(1)'
    // 初始化缩放变量
    let scaleNum = 1
    let b = true
    clearInterval(seat.timer)
    seat.timer = setInterval(() => {
        console.log(scaleNum)
        if(scaleNum > 3){
            scaleNum = 3
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
        seat.style.transform = `scale(${scaleNum})`
    },15)
}

export default seatZoom