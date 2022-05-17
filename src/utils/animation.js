// 首先封装计算后的获取属性兼容函数
function getStyle(obj,attr){
  if(window.getComputedStyle){
      return window.getComputedStyle(obj,null)[attr]
  }else{
      return obj.currentStyle[attr]
  }
}
// 下面封装可以让多个属性值变化的
/**
* 参数el:指定了元素
* 参数styleObj,指定需要变化的多个属性和属性值的对象集合
*/
// 存在问题，只要有一个属性到了目标值，就会清除定时器，其他的属性值不管
function newAnimate(el,styleObj){
  clearInterval(el.timer)
  el.timer = setInterval(() => {
      // 加上flag为了解决到不了目标值
      var flag = true
      for(var k in styleObj){
          var leader = parseInt(getStyle(el,k)) || 0
          var step = (styleObj[k] - leader) / 10
          step = step > 0 ? Math.ceil(step) : Math.floor(step)
          leader = leader + step
          el.style[k] = leader + 'px'
          if(leader !== styleObj[k]) {
              flag = false
          }
      }
      if(flag){
          clearInterval(el.timer)
      }
  },15)
}

export default newAnimate
