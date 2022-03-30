// 用来做元素内容滚动或者添加展开、收回按钮的逻辑

import store from '@/store'
import clearTimer from './clearTimer.js'
import { nextTick } from 'vue'
function roll() {
  // 8、修改之前的bug，（之前在 bottomBox-Information 信息展示组件中的 onMounted 钩子中，判断数据是否超过父盒子，如果超过，则做往复动画），现在将逻辑放到点击事件中，修复一些bug
  nextTick(() => {
    // 关于元素滚动的逻辑
    clearTimer()
    store.commit('setTimerArray',[])
    store.commit('setTimer',null)
    let content = document.querySelectorAll('.scroll')
    let obj = []
    content.forEach((item) => {
      // 当前节点的宽度
      let currentNodeWidth = item.offsetWidth
      // 当前节点父元素的宽度
      let curentParentNdoeWidth = item.parentNode.offsetWidth
      // 子元素和父元素的差值
      let value = curentParentNdoeWidth - currentNodeWidth
      if(value < 0){
          const timer123 = setTimeout(() => {
              clearInterval(item.timer)
              let target = Math.floor(value)
              let leader = 0
              item.timer = setInterval(() => {
                console.log(22222222222)
                let step = 1
                if(Math.abs(leader - target) >= Math.abs(step)){
                    step = leader > target ? -step : step
                    leader = leader + step
                    item.style.left = leader + 'px'
                }else{
                    item.style.left = target + 'px'
                    target = leader === 0 ? value : 0
                }
              },200)
              obj.push(item)
          }, 1000)
          store.commit('setTimer', timer123)
          store.commit('setTimerArray',obj)
      }else{
          item.style.left = 0
      }
    })
    store.commit('setSpanElement',null)
    // 元素做展开、收回
    let el = document.querySelector('.over')
    if(!el) return
    if(el.scrollWidth > el.offsetWidth){
      // 如果内容的宽度比盒子的宽度大，则向最后添加一个展开按钮
      let span = document.createElement('span')
      span.innerHTML = '展开'
      span.style.float = 'right'
      span.style.marginTop = '2px'
      span.style.backgroundColor = '#f8f9fa'
      span.style.color = '#1b1b1d'
      span.style.borderRadius = '2px'
      span.style.padding = '0.0538rem'
      el.appendChild(span)
      span.addEventListener('click', show)
      store.commit('setSpanElement',el)
    }else{
      el.style.overflow = 'hidden'
    }
  })
}
function show(e){
  let value = e.target.innerHTML
  if(value === '展开'){
    el.style.whiteSpace = 'unset'
    e.target.innerHTML = '收起'
    el.style.overflow = 'auto'
  }else{
    el.style.whiteSpace = 'nowrap'
    e.target.innerHTML = '展开'
    el.style.overflow = 'hidden'
  }
}
export default roll