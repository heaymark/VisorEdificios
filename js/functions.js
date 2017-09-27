function cmb(evt){
    // evt.preventDefault();
    // evt.stopPropagation();

    // alert(evt.target.value);
    // alert(evt.target.id);
 
    switch(evt.target.value){
        case "alertaaltoimpacto":
            lyrs.getSubLayer(8).show();
            lyrs.getSubLayer(7).hide();
            // evt.target.id.attr('checked', true);
            break;
        case "alertabajoimpacto":
            lyrs.getSubLayer(7).show();
            lyrs.getSubLayer(8).hide();
            break;
        case "todaslasalertas":
            lyrs.getSubLayer(7).show();
            lyrs.getSubLayer(8).show();
            break;
    }
}
