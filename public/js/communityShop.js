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
                color: '#50B432',            //�ߵ���ɫ������Ϊ��ɫ
                dashStyle:'longdashdot',//��ʾ�ߵ���ʽ��Ĭ����solid��ʵ�ߣ������ﶨ��Ϊ������
                value:beginTime-0.2,                //�������ĸ�ֵ����ʾ��ʾ�ߣ���������x���Ͽ̶�Ϊ3��ֵ����ֱ��һ����
                width:2                 //��ʾ�ߵĿ�ȣ�2px
            },{
                color: '#50B432',            //�ߵ���ɫ������Ϊ��ɫ
                dashStyle:'longdashdot',//��ʾ�ߵ���ʽ��Ĭ����solid��ʵ�ߣ������ﶨ��Ϊ������
                value:endTime+0.2,                //�������ĸ�ֵ����ʾ��ʾ�ߣ���������x���Ͽ̶�Ϊ3��ֵ����ֱ��һ����
                width:2                 //��ʾ�ߵĿ�ȣ�2px
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
