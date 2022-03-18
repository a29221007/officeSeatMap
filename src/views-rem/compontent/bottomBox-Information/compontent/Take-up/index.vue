<template>
    <div class="line">
        <ContentItem :lable="'固资名称'">HP打印机</ContentItem>
        <ContentItem :lable="'固名称'">HP打印机</ContentItem>
    </div>
    <div class="line">
        <ContentItem :lable="'固资名'">HP打印机</ContentItem>
        <ContentItem :lable="'固资名称'">HP打印机</ContentItem>
    </div>
</template>

<script>
export default {
    name:'takeUp',
    setup() {

        return {

        }
    }
}
</script>

<style lang="less" scoped>
.line{
    padding: .1075rem 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
</style>