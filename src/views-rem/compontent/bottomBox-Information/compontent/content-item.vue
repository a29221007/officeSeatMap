<template>
    <div class="item">
        <div class="title">{{lable}}:</div>
        <div class="content"><slot></slot></div>
    </div>
</template>

<script>
export default {
    name:'contentItem',
    props:{
        lable:{
            type:String,
            required:true
        }
    },
    setup() {
        
    }
}
</script>

<style lang="less" scoped>
.item{
    display: flex;
    height: .8rem;
    line-height: .8rem;
    .title{
        font-size: .3763rem;
        margin-right: .1613rem;
    }
}
</style>