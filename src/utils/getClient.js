// window.addEventListener('resize',function(){
//     console.log(client().height)
//     console.log(client().width)
// })    
// 获取浏览器可视区的宽高
function client(){
    return {
        width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 0,
        height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0
    }
}

export default client