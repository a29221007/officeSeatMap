<template>
    <div class="container">
        <!-- 第一行 -->
        <div class="oneline">
            <!-- 第一列 -->
            <div class="col">
                <div class="title">姓名：</div>
                <div class="content"><span class="scroll">{{$store.state.activeInfo.name}}</span></div>
            </div>
            <!-- 第二列 -->
            <div class="col">
                <div class="title">工号：</div>
                <div class="content"><span class="scroll">{{$store.state.activeInfo.id}}</span></div>
            </div>
            <!-- 第三列 -->
            <div class="col">
                <div class="title">工位号：</div>
                <div class="content"><span class="scroll">{{$store.state.activeInfo.seat_id}}</span></div>
            </div>
        </div>
        <!-- 第二行 -->
        <div class="towline">
            <div class="title">部门：</div>
            <div class="content over">{{$store.state.activeInfo.depart}}</div>
        </div>
    </div>
</template>

<script>
import { onMounted } from 'vue'
export default {
    name:'personnel',
    setup() {
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
            el.style.transition = 'all 0.5s'
            let value = e.target.innerHTML
            if(value === '展开'){
                el.style.whiteSpace = 'unset'
                e.target.innerHTML = '收起'
            }else{
                el.style.whiteSpace = 'nowrap'
                e.target.innerHTML = '展开'
            }
        }
    }
}
</script>

<style lang="less" scoped>
.container{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .oneline{
        display: flex;
        height: .8602rem;
        align-items: center;
        justify-content: space-between;
        .col{
            flex: 1;
            white-space:nowrap;
            overflow: hidden;
            display: flex;
            align-items: baseline;
            .title{
                flex: 1;
                font-size: .3763rem;
                color: #f8f9fa;
            }
            .content{
                flex: 3;
                overflow: hidden;
                span{
                    position: relative;
                }
            }
            &:nth-child(2){
                margin: 0 .0538rem;
            }
        }
    }
    .towline{
        display: flex;
        align-items: baseline;
        .title{
            flex: 1;
            font-size: .3763rem;
            color: #f8f9fa;
            white-space:nowrap
        }
        .content{
            position: relative;
            flex: 7;
            white-space:nowrap;
            overflow: auto;
            text-overflow:ellipsis;
        }
    }
}
</style>