<template>
    <van-row align='center'>
        <van-col span="8">
            <span class="title">姓名：</span>
            <span class="content">{{$store.state.activeInfo.name}}</span>
        </van-col>
        <van-col span="8">
            <span class="title">工号：</span>
            <span class="content">{{$store.state.activeInfo.id}}</span>
        </van-col>
        <van-col span="8">
            <span class="title">工位号：</span>
            <span class="content">{{$store.state.activeInfo.seat_id}}</span>
        </van-col>
    </van-row>
    <van-row align='center'>
        <van-col span="24">
            <span class="title">部门：</span>
            <span class="content">{{$store.state.activeInfo.depart}}</span>
        </van-col>
    </van-row>
</template>

<script>
import { onMounted } from 'vue'
export default {
    name:'personnel',
    setup() {
        onMounted(() => {
            let content = document.querySelectorAll('.content')
            console.log(content)
        })
    }
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