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
export default {
    name:'personnel'
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
            max-height: 1.3441rem;
            position: relative;
            flex: 7;
            white-space:nowrap;
            overflow: hidden;
            text-overflow:ellipsis;
        }
    }
}
</style>