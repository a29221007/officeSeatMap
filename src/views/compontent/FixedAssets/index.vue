<template>
    <el-dialog custom-class='FixedAssets_dialog' v-model="FixedAssets_dialog" :title=" FixedAssetsUserName + ' - 固定资产信息' " :close-on-click-modal='false' draggable width="55%" top='8vh'>
        <el-table :data="FixedAssetsList_pagination" border>
            <el-table-column prop="FixedCode" align='center' label="固定资产编号" />
            <el-table-column prop="FixedName" align='center' label="固定资产名称" />
        </el-table>
        <template #footer>
            <el-pagination v-model:currentPage="currentPage" v-model:page-size="pageSize" :page-sizes="[20,40,60]" :small="true" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </template>
    </el-dialog>
</template>

<script>
import { computed, reactive, ref, toRefs } from 'vue'
export default {
    name:'FixedAssets',
    props:{
        FixedAssetsUserName:{
            type:String,
            required:true
        },
        FixedAssetsList:{
            type:Array,
            required:true
        }
    },
    setup(prop) {
        const FixedAssets_dialog = ref(false)
        // 修改 FixedAssets_dialog 的值
        function setFixedAssets_dialog(value){
            FixedAssets_dialog.value = value
        }
        // 分页器管理 FixedAssetsList 数据
        let FixedAssetsList_pagination = computed(() => {
            return prop.FixedAssetsList.slice((pagination.currentPage-1)*pagination.pageSize,pagination.currentPage*pagination.pageSize)
        })
        // 分页器组件数据
        const pagination = reactive({
            // 当前的页数
            currentPage:1,
            // 一页显示多少条
            pageSize:20,
            // 当前表格的总数
            total:computed(() => {
                return prop.FixedAssetsList.length
            }),
            // pageSize 发生变化触发的函数
            handleSizeChange(value){
                pagination.pageSize = value
            },
            // currentPage 发生变化触发的函数
            handleCurrentChange(value){
                pagination.currentPage = value
            }
        })
        return {
            FixedAssets_dialog,
            setFixedAssets_dialog,
            ...toRefs(pagination),
            FixedAssetsList_pagination
        }
    }
}
</script>

<style lang="less" scoped>

</style>