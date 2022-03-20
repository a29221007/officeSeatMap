<template>
    <el-form label-width="auto">
        <el-form-item label="区域名称：">{{$store.state.activeInfo.name + $store.state.activeInfo.subtitle.replace("︵","（").replace('︶','）').replace(/\s/g,"")}}</el-form-item>
        <el-form-item label="区域编号：">{{$store.state.activeInfo.code}}</el-form-item>
        <el-form-item label="区域背景色：">{{$store.state.activeInfo.backgroundcolor}}</el-form-item>
    </el-form>
</template>

<script>
export default {
    name:'region',
}
</script>

<style lang="less" scoped>
.el-form{
    width: 100%;
    .el-form-item{
        --font-size: unset;
        margin-bottom: 0;
        height: .8602rem;
        /deep/.el-form-item__label-wrap{
            align-items: center;
            .el-form-item__label{
                font-size: .3763rem;
                color: #f8f9fa;
                padding: 0;
                line-height: unset;
            }
        }
        /deep/.el-form-item__content{
            line-height: unset;
        }
    }
}
</style>