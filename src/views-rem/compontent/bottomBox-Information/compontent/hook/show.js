import { onMounted, onBeforeUnmount } from 'vue'

function show() {
    let el = null
    onMounted(() => {
        el = document.querySelector('.over')
        if(el.scrollWidth > el.offsetWidth){
            // 如果内容的宽度比盒子的宽度大，则向最后添加一个展开按钮
            let span = document.createElement('span')
            span.innerHTML = '展开'
            span.style.float = 'right'
            span.style.marginTop = '2px'
            span.style.backgroundColor = '#f8f9fa'
            span.style.color = '#1b1b1d'
            span.style.borderRadius = '2px'
            el.appendChild(span)
            span.addEventListener('click',show)
        }
    })
    function show(e){
        let value = e.target.innerHTML
        if(value === '展开'){
            el.style.whiteSpace = 'unset'
            e.target.innerHTML = '收起'
        }else{
            el.style.whiteSpace = 'nowrap'
            e.target.innerHTML = '展开'
        }
    }
    onBeforeUnmount
}

export default show