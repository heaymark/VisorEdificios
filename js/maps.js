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

$(document).ready(function(){

    objlayerBase = L.tileLayer(layerbase,paramlayerbase);
    maps = new L.Map(mapdiv, parammapbase), maps.addLayer(objlayerBase); //aqui se genera el mapa base
    cartodb.createLayer(maps,viz) //aqui se jala el mapa que esta en el visor, objeto del mapa y variable viz
        .addTo(maps)
        .on('done', function(layer) {

        lyrs = layer;
        // console.log(layer.layers);
        // console.log(layer.layers[0].options.layer_name);//nombre de la capas
        // console.log(layer.layers.length);//cantidad de capas
        for (var i = 0; i < layer.layers.length; i++) {
            console.log("Num capa " +i+" "+ layer.layers[i].options.layer_name);//nombre de la capas
        }

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
                        // console.log(jsonlayers);
                        select_layerts(data.rows[idx].name, data.rows[idx].layer, jsonlayers);

                    }//Fin for(idx in data.rows){
            });//Fin .on("done",function(data){

        }).error(function (err) {
		 	console.log(err);
		});

    	maps.on("zoomlevelschange",mapGraficalinea);
    	maps.on("moveend",mapGraficalinea);  

		maps.on("zoomlevelschange",mapGraficacolum);
    	maps.on("moveend",mapGraficacolum);  
    	  	
		maps.on("zoomlevelschange",mapGraficacolum2);
    	maps.on("moveend",mapGraficacolum2);  

});

function select_layerts(nombrecapa,capa,jsonlayers){
console.log(capa);
	$('<li>', {
		'class': 'layer'
	    }).append(
	    	$('<input/>',{
	      		type: 'checkbox',
                data_layer: nombrecapa,
	      		id: capa, 
	      		name: 'layer',
	      	}),
		    $('<label>',{
		    	text:nombrecapa
		    })
	).hide().appendTo('#list-layer').fadeIn('slow');	

    // alert($('#delegaciones_df_1:checked').val());

    if ($('#'+capa).is(':checked') ) {
        console.log("Checkbox seleccionado"+capa);
    }
}

function layers(capa){
    switch(capa){
        case 'PEA':
            idxvisible = 3;
            // lyrs.getSubLayer(3).toggle();
            if(map.hasLayer(sltfeature)){
                map.removeLayer(sltfeature);
            };
        break;
        case 'PHM18':
            idxvisible = 2;
            // lyrs.getSubLayer(2).toggle();

            if(map.hasLayer(sltfeature)){
                map.removeLayer(sltfeature);
            };
        break;
        case 'PMM18':
            idxvisible = 1;
            // lyrs.getSubLayer(1).toggle();

            if(map.hasLayer(sltfeature)){
                map.removeLayer(sltfeature);
            };
        break;
        case 'PT':
            //obtiene una subcapa creada (getSubLayer)
            //alterna la vista de la subcapa devuelte boolean (toggle)
                
            if(map.hasLayer(sltfeature)){
                map.removeLayer(sltfeature);
            };

        break;
    }

    var idx = 0;
    for(idx=0;idx<=7;idx++){
        if (idxvisible == idx){
            lyrs.getSubLayer(idx).toggle();
        } else {
            lyrs.getSubLayer(idx).hide();
        }   

    }
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