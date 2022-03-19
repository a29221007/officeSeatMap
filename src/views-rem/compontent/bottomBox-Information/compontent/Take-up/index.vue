<template>
    <van-row align='center'>
        <van-col span="12">
            <span class="title">固资名称：</span>
            <span class="content">{{$store.state.activeInfo.name}}</span>
        </van-col>
        <van-col span="12">
            <span class="title">固资编号：</span>
            <span class="content">11</span>
        </van-col>
    </van-row>
    <van-row align='center'>
        <van-col span="12">
            <span class="title">位置：</span>
            <span class="content">11</span>
        </van-col>
        <van-col span="12">
            <span class="title">工位号：</span>
            <span class="content">{{$store.state.activeInfo.seat_id}}</span>
        </van-col>
    </van-row>
</template>

<script>
export default {
    name:'takeUp'
}
</script>

<style lang="less" scoped>
.van-row{
    padding: .1075rem 0;
    height: 0.8rem;
    .van-col{
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
    }
    .title{
        display: inline-block;
        font-size: .3763rem;
    }
}
</style>