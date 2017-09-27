
// var chart;
//    $(document).ready(function() {

function graficacolum2highcharts(ae,ane) {

// chart = new Highcharts.Chart({

// Highcharts.chart('container', {
    var chart= {
        renderTo: 'graficacolumn2',    // Le doy el nombre a la gráfica
        type: 'column',
        options3d: {
            enabled: true,
            alpha: 10,
            beta: 25,
            depth: 70
        }
    };
    var title= {
        text: '3D chart with null values'
    };
    var subtitle= {
        text: 'Notice the difference between a 0 value and a null point'
    };
    var plotOptions= {
        column: {
            depth: 25
        }
    };
    var xAxis= {
        categories: Highcharts.getOptions().lang.shortMonths
    };
    var yAxis= {
        title: {
            text: null
        }
    };
    var series= [{
        name: 'Sales',
        data: [2, 3, null, 4, 0, 5, 1, 4, 6, 3]
    }];
    
    var json= {};  
    json.chart = chart;
    json.title = title;
    json.subtitle = subtitle;
    json.plotOptions = plotOptions;
    json.xAxis = xAxis;
    json.yAxis = yAxis;
    json.series = series;
    $('#graficacolumn2').highcharts(json);  

}
