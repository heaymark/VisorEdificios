var cartolayer, layer, sltfeature, lyrs, mkrInicial, lyrRadio, maps, objlayerBase, highlight, dehighlight, select, layerbase, paramlayerbase, parammapbase, viz, vizparam, el, layers, user, api_key;
var geomTools;
var drawControl;
//Se  obtiene de viz en carto
var layerbase = 'https://{s}.base.maps.api.here.com/maptile/2.1/maptile/newest/normal.day.grey/{z}/{x}/{y}/256/png8?lg=eng&token=A7tBPacePg9Mj_zghvKt9Q&app_id=KuYppsdXZznpffJsKT24';
var paramlayerbase = {
	minZoom: 0,
	maxZoom: 20,
	subdomains:"1234",
	attribution: "&copy;2017 HERE <a href='http://here.net/services/terms' target='_blank'>Terms of use</a>"
};
 
var parammapbase = {
    center: new L.LatLng(19.33123050921937,-99.09942626953125),
	zoom : 10,
	minZoom: 0,
	maxZoom: 20,
	attribution: "CARTO",
}
var mapdiv =  'maps';

var param = {
    user:"develop",
};
var viz = "https://finanzasdf.carto.com/u/develop/api/v2/viz/d2dc6eb1-1dd4-4eb8-8aa9-d629bba144d9/viz.json";

$(function(){

	objlayerBase = L.tileLayer(layerbase,paramlayerbase);
	maps = new L.Map(mapdiv, parammapbase), maps.addLayer(objlayerBase); //aqui se genera el mapa base
	cartodb.createLayer(maps,viz) //aqui se jala el mapa que esta en el visor, objeto del mapa y variable viz
		.addTo(maps)
		.on('done', function(layer){//evento que se dispara cuando kla peticion a carto
			lyrs = layer;
            // When the layers inputs change fire this
            $("input[name='layer']").change(function(){
				// Clear the sublayers
				layer.getSubLayers().forEach(function(sublayer){sublayer.remove()});
				// For every check activated, add a sublayer
				$.each($("input[name='layer']:checked"), function(){
					layer.createSubLayer(jsonlayers[$(this).attr("id")]);
              	});
            });


		}).error(function (err) {
			console.log(err);
		});

    	// maps.on("zoomlevelschange",mapGrafica);
    	// maps.on("moveend",mapGrafica);

    	maps.on("zoomlevelschange",mapGraficalinea);
    	maps.on("moveend",mapGraficalinea);  

		maps.on("zoomlevelschange",mapGraficacolum);
    	maps.on("moveend",mapGraficacolum);  
    	  	
		maps.on("zoomlevelschange",mapGraficacolum2);
    	maps.on("moveend",mapGraficacolum2);  

		objsql = new cartodb.SQL({user:"develop",});//Fin objsql = new cartodb.SQL({
		objsql.execute("SELECT name, layer FROM select_layer_copy")
	
	        .on("done",function(data){
	        	   	for(idx in data.rows){
	        	   		var name = data.rows[idx].name;
	        	   		var name2 =  String(name);
							
					    // Layers definition
					    var jsonlayers = {
					    	'nombre': {
					        	sql: 'SELECT * FROM '+data.rows[idx].layer,
            					cartocss: "#countries['mapnik::geometry_type'=3] { polygon-fill: #fff; } 2 line 1  punto"
					    	}
					    }
					    // var layers2 = layers+layers;
					    console.log(jsonlayers);
						select_layerts(data.rows[idx].name, data.rows[idx].layers, jsonlayers);

	            	}//Fin for(idx in data.rows){

	    	});//Fin .on("done",function(data){

});

function select_layerts(name,layers,jsonlayers){

	// $('<li>', { 'class': 'layer'}).appendTo('#list-layer').fadeIn('slow');
	// $('<input />', { type: 'checkbox', id: name, value: name }).appendTo('#list-layer').fadeIn('slow');
	// $('<label />', { 'for': 'cb', text: name }).appendTo('#list-layer').fadeIn('slow');

	$('<li>', {
		'class': 'layer'
	    }).append(
	    	$('<input/>',{
	      		type: 'checkbox', 
	      		id: layers, 
	      		name: 'layer',
	      	}),
		    $('<label>',{
		    	text:name
		    })
	).hide().appendTo('#list-layer').fadeIn('slow');	

        cartodb.createLayer(maps,{
            user_name: 'develop',
            type: 'cartodb',
            sublayers: []
          })
          .addTo(maps)
          .done(function(layer){
            // When the layers inputs change fire this
            $("input[name='layer']").change(function(){
              // Clear the sublayers
              layer.getSubLayers().forEach(function(sublayer){sublayer.remove()});
              // For every check activated, add a sublayer
              $.each($("input[name='layer']:checked"), function(){
                  layer.createSubLayer(jsonlayers[$(this).attr("id")]);
              });
            });
        });
}

//Funcion para acercar al mapa 
function bounry(user,table,sqlfilter,layer,map) {
	var sqlExtent = new cartodb.SQL(user);
    //regresa la coordenada maxima de mi extend de la geometria
	var sql = "select max(xmax) as xmax,min(xmin) as xmin,max(ymax) as ymax,min(ymin) as ymin from (select ST_Xmax(ST_Extent(the_geom)) as xmax,ST_Xmin(ST_Extent(the_geom)) as xmin,ST_Ymax(ST_Extent(the_geom)) as ymax,ST_Ymin(ST_Extent(the_geom)) as ymin from " + table + " where " + sqlfilter + ") as ext"

	sqlExtent.execute(sql).done(function(data) {
		if (data.rows[0].ymax != '' && data.rows[0].ymin != '' && data.rows[0].xmax && data.rows[0].xmin != '') {
            var southWest = L.latLng(data.rows[0].ymax, data.rows[0].xmin),
            northEast = L.latLng(data.rows[0].ymin, data.rows[0].xmax),
            bounds = L.latLngBounds(southWest, northEast);
            map.fitBounds(bounds);
            // this.selectFeature(table,sqlfilter,layer);
            selectFeature(table,sqlfilter,layer);
        } else {
            console.log("errors: en la ejecucion del sql en cartodb");
        }
	}).error(function(errors) {
		console.log("errors:" + errors);
	});
}

// Funcion para actualizar el mapa conforme se mueve el mapa
function mapGraficalinea(e) {
    var dataGraph = [];
    var elArray = new Array();
    var dataCfg;
    var totalAE = 0; 
    var totalANE = 0;
    // console.log("layer loaded");

    Ymax = maps.getBounds().getNorth();
    Ymin = maps.getBounds().getSouth();
    Xmax = maps.getBounds().getEast();
    Xmin = maps.getBounds().getWest();

    var sql =  new cartodb.SQL({
        user:"develop"
    }); 

    sql.execute("SELECT cartodb_id, alerta_alto_bajo_i, asociacion, cadena, detalleopc, detenidos FROM alertas_alto_bajo_impacto_union WHERE ST_Contains(ST_MakeEnvelope("+Xmin+","+Ymin+","+Xmax+","+Ymax+",4326),the_geom) ORDER BY cartodb_id")

        .done(function(data){

            for (idx in data.rows){
                
                if (data.rows[idx].alerta_alto_bajo_i == 1) {
                	totalAE = parseInt(totalAE) + parseInt(1);
                } else {
                	totalANE = parseInt(totalANE) + 1;
                }

            }

            dataCfg = 
                [
                    {
                    	name:"Alertas Efectivas",
                        y:totalAE,
                    },{
                    	
                        name:"Alertas No Efectivas",
                        y:totalANE,
                    }
                ];

            // console.log(dataCfg);
            
            graficalinehighcharts("",""); //Graphics3 code

    });//Fin .done(function(data){
}//Fin Function

// Funcion para actualizar el mapa conforme se mueve el mapa
function mapGraficacolum(e) {
    var dataGraph = [];
    var elArray = new Array();
    var dataCfg;
    var totalAE = 0; 
    var totalANE = 0;
    // console.log("layer loaded");

    Ymax = maps.getBounds().getNorth();
    Ymin = maps.getBounds().getSouth();
    Xmax = maps.getBounds().getEast();
    Xmin = maps.getBounds().getWest();

    var sql =  new cartodb.SQL({
        user:"develop"
    }); 

    sql.execute("SELECT cartodb_id, alerta_alto_bajo_i, asociacion, cadena, detalleopc, detenidos FROM alertas_alto_bajo_impacto_union WHERE ST_Contains(ST_MakeEnvelope("+Xmin+","+Ymin+","+Xmax+","+Ymax+",4326),the_geom) ORDER BY cartodb_id")

        .done(function(data){

            for (idx in data.rows){
                
                if (data.rows[idx].alerta_alto_bajo_i == 1) {
                	totalAE = parseInt(totalAE) + parseInt(1);
                } else {
                	totalANE = parseInt(totalANE) + 1;
                }

            }

            dataCfg = 
                [
                    {
                    	name:"Alertas Efectivas",
                        y:totalAE,
                    },{
                    	
                        name:"Alertas No Efectivas",
                        y:totalANE,
                    }
                ];

            // console.log(dataCfg);
            
            graficacolumhighcharts("",""); //Graphics3 code

    });//Fin .done(function(data){
}//Fin Function

// Funcion para actualizar el mapa conforme se mueve el mapa
function mapGraficacolum2(e) {
    var dataGraph = [];
    var elArray = new Array();
    var dataCfg;
    var totalAE = 0; 
    var totalANE = 0;
    // console.log("layer loaded");

    Ymax = maps.getBounds().getNorth();
    Ymin = maps.getBounds().getSouth();
    Xmax = maps.getBounds().getEast();
    Xmin = maps.getBounds().getWest();

    var sql =  new cartodb.SQL({
        user:"develop"
    }); 

    sql.execute("SELECT cartodb_id, alerta_alto_bajo_i, asociacion, cadena, detalleopc, detenidos FROM alertas_alto_bajo_impacto_union WHERE ST_Contains(ST_MakeEnvelope("+Xmin+","+Ymin+","+Xmax+","+Ymax+",4326),the_geom) ORDER BY cartodb_id")

        .done(function(data){

            for (idx in data.rows){
                
                if (data.rows[idx].alerta_alto_bajo_i == 1) {
                	totalAE = parseInt(totalAE) + parseInt(1);
                } else {
                	totalANE = parseInt(totalANE) + 1;
                }

            }

            dataCfg = 
                [
                    {
                    	name:"Alertas Efectivas",
                        y:totalAE,
                    },{
                    	
                        name:"Alertas No Efectivas",
                        y:totalANE,
                    }
                ];

            // console.log(dataCfg);
            
            graficacolum2highcharts("",""); //Graphics3 code

    });//Fin .done(function(data){
}//Fin Function