/**
 * 对会议室预定记录的数据按时间顺序排序，以及对时间是否做隐藏进行判断
 * 参数为，会议室预定记录数据集合
 * 返回值，为处理好的数据集合
*/

function sortMeetingList(array){
    array.sort(function(a,b){
        return (a.MDate + ' ' + a.STARTTIME) < (b.MDate + ' ' + b.STARTTIME) ? -1 : 1
    })
    let timer = ''
    // 将同一天的最早那一个时间留下，同一天剩余的去除时间
    array.forEach((item, index) => {
        // 将时间的 年-月-日 分开
        const data = new Date(item.MDate)
        item['year'] = data.getFullYear() + '年'
        item['month_day'] = (data.getMonth() + 1) + '月' + (data.getDate()) + '日'
        item['is_hidden'] = false
        if(index === 0){
            timer = item.MDate
        }else{
            if(item.MDate === timer){
                // 如果相同，则将时间去除掉,渲染时，也是根据这个字段是否为空，来判断
                item['is_hidden']  = true
            }
            timer = item.MDate
        }
    })

    return array
}

export default sortMeetingList