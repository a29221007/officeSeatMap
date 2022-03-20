import { onMounted, onBeforeUnmount } from 'vue'
function animate() {
    let obj = []
    let timer = null
    onMounted(() => {
        let content = document.querySelectorAll('.scroll')
        timer = setTimeout(() => {
            content.forEach((item) => {
                item.style.overflow = 'unset'
                // 当前节点的宽度
                let currentNodeWidth = item.clientWidth
                // 当前节点父元素的宽度
                let curentParentNdoeWidth = item.parentNode.clientWidth
                // 子元素和父元素的差值
                let value = curentParentNdoeWidth - currentNodeWidth
                if(value < 0){
                    let target = value
                    item.timer = setInterval(() => {
                        let leader = item.offsetLeft
                        let step = 1
                        if(Math.abs(leader - target) >= Math.abs(step)){
                            step = leader > target ? -step : step
                            leader = leader + step
                            item.style.left = leader + 'px'
                        }else{
                            item.style.left = target + 'px'
                            target = item.offsetLeft === 0 ? value : 0
                        }
                    },200)
                    obj.push(item)
                }
            })
        },1000)
    })
    // 卸载阶段，将动画的所有定时器清除
    onBeforeUnmount(() => {
        obj.forEach(item => {
            clearInterval(item.timer)
        })
        clearTimeout(timer)
    })
}

export default animate