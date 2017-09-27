var chart;
	$(document).ready(function() {
	
		//Grafica circular
		chart = new Highcharts.Chart({
			chart: {
				renderTo: 'graficaCircular'
			},
			title: {
				text: 'Porcentaje de Visitas por Paises'
			},
			subtitle: {
				text: 'Jarroba.com'
			},
			plotArea: {
				shadow: null,
				borderWidth: null,
				backgroundColor: null
			},
			tooltip: {
				formatter: function() {
					return '<b>'+ this.point.name +'</b>: '+ this.y +' %';
				}
			},
			plotOptions: {
				pie: {
					allowPointSelect: true,
					cursor: 'pointer',
					dataLabels: {
						enabled: true,
						color: '#000000',
						connectorColor: '#000000',
						formatter: function() {
							return '<b>'+ this.point.name +'</b>: '+ this.y +' %';
						}
					}
				}
			},

			// Le pasamos los datos en JSON
		    series: [{
				type: 'pie',
				name: 'Browser share',
				data: 	[{
				            name: 'Microsoft Internet Explorer',
				            y: 56.33
				        	}, {
				            name: 'Chrome',
				            y: 24.03,
				            sliced: true,
				            selected: true
				        	}, {
				            name: 'Firefox',
				            y: 10.38
				        	}, {
				            name: 'Safari',
				            y: 4.77
				        	}, {
				            name: 'Opera',
				            y: 0.91
				        	}, {
				            name: 'Proprietary or Undetectable',
				            y: 0.2
						}]
			}]
		});	
	});	