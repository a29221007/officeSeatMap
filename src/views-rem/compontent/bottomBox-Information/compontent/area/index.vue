<template>
    <!-- 第一行 -->
    <div class="line">
        <!-- 标题 -->
        <span class="title">区域名称：</span>
        <!-- 内容 -->
        <span class="content">{{$store.state.activeInfo.name + $store.state.activeInfo.subtitle.replace("︵","（").replace('︶','）').replace(/\s/g,"")}}</span>
    </div>
    <!-- 第二行 -->
    <div class="line">
        <!-- 标题 -->
        <span class="title">区域编号：</span>
        <!-- 内容 -->
        <span class="content">{{$store.state.activeInfo.code}}</span>
    </div>
    <!-- 第三行 -->
    <div class="line">
        <!-- 标题 -->
        <span class="title">区域背景色：</span>
        <!-- 内容 -->
        <span class="content">{{$store.state.activeInfo.backgroundcolor}}</span>
    </div>
</template>

<script>
export default {
    name:'region'
}
</script>

<style lang="less" scoped>
.line{
    padding: .1075rem 0;
    height: 0.8rem;
    display: flex;
    align-items: center;
    .title{
        display: inline-block;
        font-size: .3763rem;
        min-width: 2.3656rem;
        text-align: end;
    }
}
</style>