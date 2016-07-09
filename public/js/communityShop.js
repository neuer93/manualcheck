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
            categories: categories
        },
        yAxis: {
            title: {
                text: 'Count'
            },
            plotLines: [{
                value: 0,
                width: 1,
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
            data: dataList
        }]
    });
});
