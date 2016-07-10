$(function () {
    console.log(categories);
    $('#container').highcharts({
        title: {
            text: 'Trend of reviews in this community',
            x: -20 //center
        },
        global : {
            useUTC : false
        },
        //subtitle: {
        //    text: 'Community',
        //    x: -20
        //},
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                second: '%Y:%e.%y:%e.%b:'
            },
            categories: categories, //['2014-06-13', '2014-06-20', '2014-06-30'],
            text: 'date'
        },
        yAxis: {
            title: {
                text: 'number of reviews'
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
            name: 'reviews',
            data: dataList//[1,2,3]
        }]
    });
});
