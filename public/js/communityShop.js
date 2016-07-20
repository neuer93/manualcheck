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
                color:'red',            //�ߵ���ɫ������Ϊ��ɫ
                dashStyle:'longdashdot',//��ʾ�ߵ���ʽ��Ĭ����solid��ʵ�ߣ������ﶨ��Ϊ������
                value:beginTime,                //�������ĸ�ֵ����ʾ��ʾ�ߣ���������x���Ͽ̶�Ϊ3��ֵ����ֱ��һ����
                width:4                 //��ʾ�ߵĿ�ȣ�2px
            },{
                color:'red',            //�ߵ���ɫ������Ϊ��ɫ
                dashStyle:'longdashdot',//��ʾ�ߵ���ʽ��Ĭ����solid��ʵ�ߣ������ﶨ��Ϊ������
                value:endTime-1,                //�������ĸ�ֵ����ʾ��ʾ�ߣ���������x���Ͽ̶�Ϊ3��ֵ����ֱ��һ����
                width:4                 //��ʾ�ߵĿ�ȣ�2px
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
            borderWidth: 0
        },
        series: [{
            name: 'community-shop',
            data: dataList,
            zoneAxis : 'x',
            zones: [{
                value : beginTime,
                color : 'blue',
                dashStyle : 'solid'
            },{
                value : endTime,
                dashStyle : 'solid',
                color : 'red'
            },{
                color : 'blue',
                dashStyle : 'solid'
            }]
        }]
    });
});
