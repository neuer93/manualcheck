$(function () {
    $('#container').highcharts({
        title: {
            text: 'Trend',
            x: -20 //center
        },
        subtitle: {
            text: 'Community - shop',
            x: -20
        },
        xAxis: {
            categories: categories,
            plotLines:[{
                color: '#50B432',            //线的颜色，定义为红色
                dashStyle:'longdashdot',//标示线的样式，默认是solid（实线），这里定义为长虚线
                value:beginTime-0.2,                //定义在哪个值上显示标示线，这里是在x轴上刻度为3的值处垂直化一条线
                width:2                 //标示线的宽度，2px
            },{
                color: '#50B432',            //线的颜色，定义为红色
                dashStyle:'longdashdot',//标示线的样式，默认是solid（实线），这里定义为长虚线
                value:endTime+0.2,                //定义在哪个值上显示标示线，这里是在x轴上刻度为3的值处垂直化一条线
                width:2                 //标示线的宽度，2px
            }]
        },
        yAxis: {
            title: {
                text: 'Count'
            },
            plotLines: [{
                value: 0,
                width: 4,
                color: '#808080'
            }]
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0,
            color : 'blue'
        },
        series: [{
            name: 'community-shop',
            data: dataList,
            zoneAxis : 'x',
            zones: [{
                value : beginTime,
                color : '#24CBE5',
                dashStyle : 'solid'
            },{
                value : endTime+0.1,
                dashStyle : 'solid',
                color : 'red'
            },{
                color : '#24CBE5',
                dashStyle : 'solid'
            }]
        }]
    });
});
