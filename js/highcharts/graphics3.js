var chart;

// $(document).ready(function() {
function graficapiehighcharts(ae,ane) {

        // Forma 1 enviando el JSON
        var chart = {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
        };

        var title= {
            text: 'Alertas Efectivas y No Efectivas'
        };
        var tooltip= {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        };
        var plotOptions= {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                }
            }
        };

        var series = [{
               type: 'pie',
               name: 'Alertas SSP',
               data:[
                        {
                            name: 'Alertas Efectivas',
                            y: ae,
                            sliced: false,
                            selected: true,
                        },{
                            name: 'Alertas No Efectivas',
                            y: ane,
                            sliced: false,
                            selected: false,
                        }
                    ]
        }];
        // Radialize the colors        
        if (!Highcharts.charts.length) {
            Highcharts.getOptions().colors = Highcharts.map(
                Highcharts.getOptions().colors, function(color) {
                    return {
                        radialGradient: { cx: 0.5, cy: 0.3, r: 0.7 },
                        stops: [
                            [0, color],
                            [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
                        ]
                    };
                }
            );
        }

        // se crea el json 
        var json = {};   
        json.chart = chart; 
        json.title = title;     
        json.tooltip = tooltip;  
        json.series = series;
        json.plotOptions = plotOptions;
        $('#graficaCircular').highcharts(json);  
}
