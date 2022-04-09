<template>
    <div class="container">
        <!-- 第一行 -->
        <div class="line">
            <div class="title">会议设备：</div>
            <div class="content"><span class="scroll">{{$store.state.activeInfo.setting}}</span></div>
        </div>
        <!-- 第二行 -->
        <div class="line">
            <div class="title">当前预定：</div>
            <div class="content"><span class="scroll">{{$store.state.activeInfo.depart}}</span></div>
        </div>
        <!-- 第三行 -->
        <div class="line">
            <div class="title">预定时间：</div>
            <div class="content"><span class="button">查看</span></div>
        </div>
        <!-- 第四行 -->
        <div class="line">
            <div class="title">预约记录：</div>
            <div class="content"><span class="button">查看</span></div>
        </div>
    </div>
</template>

<script>
export default {
    name:'MeetingRoom',
}
</script>

<style lang="less" scoped>
.container{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .line{
        display: flex;
        padding: .0538rem 0;
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
            flex: 4.5;
            overflow: hidden;
            span{
                position: relative;
            }
        }
        // 查看按钮
        .button{
            color: #0493d3;
        }
    }
}
</style>