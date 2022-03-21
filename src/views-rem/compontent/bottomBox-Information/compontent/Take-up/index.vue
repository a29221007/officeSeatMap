<template>
    <!-- <el-form label-width="auto">
        <div class="inline">
            <el-form-item label="固资名称："><span class="scroll">{{$store.state.activeInfo.name}}</span></el-form-item>
            <el-form-item label="固资编号："><span class="scroll">123345667555</span></el-form-item>
        </div>
        <div class="inline">
            <el-form-item label="位置："><span class="scroll">平台技术部平台技术部</span></el-form-item>
            <el-form-item label="工位号："><span class="scroll">{{$store.state.activeInfo.seat_id}}</span></el-form-item>
        </div>
    </el-form> -->
</template>

<script>
export default {
    name:'takeUp',
}
</script>

<style lang="less" scoped>
.el-form{
    width: 100%;
    .inline{
        display: flex;
        flex-wrap: nowrap;
        justify-content: space-between;
        align-items: center;
        .el-form-item{
            flex: 1;
        }
    }
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
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
            .scroll{
                position: relative;
                padding: 0 .0538rem;
                white-space:nowrap;
                overflow:hidden;
                text-overflow:ellipsis;
            }
        }
    }
}
</style>