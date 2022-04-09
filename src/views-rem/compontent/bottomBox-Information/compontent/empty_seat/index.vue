<template>
    <div class="container">
        <!-- 第一行 -->
        <div class="line">
            <!-- 第一列 -->
            <div class="col">
                <div class="title">工位号：</div>
                <div class="content"><span class="scroll">{{$store.state.activeInfo.seat_id}}</span></div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name:'EmptySeat',
}
</script>

<style lang="less" scoped>
.container{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .line{
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
                text-align: end;
            }
            .content{
                flex: 5;
                overflow: hidden;
                span{
                    position: relative;
                }
            }
        }
    }
}
</style>