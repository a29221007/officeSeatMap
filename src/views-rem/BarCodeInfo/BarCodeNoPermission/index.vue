<template>
    <div class="BarCodeNoPermission-container" v-on:click="$router.back()">
        <i class="iconfont oamap-unlock"></i>
        <span>您当前无权限查看（点击任意处返回）</span>
    </div>
</template>

<script>
export default {
    name:'BarCodeNoPermission',
    setup() {
        return {

        }
    }
}
</script>

<style lang="less" scoped>
.BarCodeNoPermission-container{
    width: 100%;
    height: 100%;
    background-color: #f2f2f2;
    padding: .2688rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .oamap-unlock{
        font-size: 1.0753rem;
        color: orange;
        margin-bottom: .2151rem;
    }
}
</style>