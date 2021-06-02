// Mapa Leaflet
var mapa = L.map('mapid').setView([9.8, -84.25], 8.5);

// Definición de capas base
var capa_osm = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?', 
  {
    maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
).addTo(mapa);	

// Otra capa base
var CartoDB_Voyager = L.tileLayer(
	'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
	{
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
		subdomains: 'abcd',
		maxZoom: 19
	}
).addTo(mapa);


// Conjunto de capas base
var capas_base = {
  "OSM": capa_osm,
  "CartoDB Voyager": CartoDB_Voyager
};	    
	    
// Control de capas
control_capas = L.control.layers(capas_base).addTo(mapa);	

// Control de escala
L.control.scale({position: "topright", imperial: false}).addTo(mapa);

// Capas vectoriales en formato GeoJSON
$.getJSON("https://raw.githubusercontent.com/ggaltar/danos_red_vial/main/capas/zonas_conservacion_wgs84.geojson", function(geodata) {
  var capa_zcv = L.geoJson(geodata, {
    style: function(feature) {
	  return {'color': "#013220", 'weight': 2.5, 'fillOpacity': 0.0}
    },
    onEachFeature: function(feature, layer) {
      var popupText = "<strong>Zona de conservación vial</strong>: " + feature.properties.Zona2 + "<br>" + "<strong>Nombre de la zona</strong>: " + feature.properties.Nombre + "<br>" + "<strong>Contacto</strong>: " + feature.properties.Contacto;
      layer.bindPopup(popupText);
    }			
  }).addTo(mapa);

  control_capas.addOverlay(capa_zcv, 'Zonas de conservación');
});

$.getJSON("https://raw.githubusercontent.com/ggaltar/danos_red_vial/main/capas/red_vial_nacional_wgs84.geojson", function(geodata) {
  var capa_rvn = L.geoJson(geodata, {
    style: function(feature) {
	  return {'color': "red", 'weight': 2, 'fillOpacity': 0.0}
    },
    onEachFeature: function(feature, layer) {
      var popupText = "<strong>Ruta</strong>: " + feature.properties.RUTA + "<br>" + "<strong>Sección de control</strong>: " + feature.properties.SECCION;
      layer.bindPopup(popupText);
    }			
  }).addTo(mapa);

  control_capas.addOverlay(capa_rvn, 'Red Vial Nacional');
});

$.getJSON("https://raw.githubusercontent.com/ggaltar/danos_red_vial/main/capas/danos_wgs84.geojson", function(geodata) {
  var capa_danos = L.geoJson(geodata, {
    style: function(feature) {
	  return {'color': "green", 'weight': 2.5, 'fillOpacity': 0.0}
    },
    onEachFeature: function(feature, layer) {
      var popupText = "<strong>Severidad</strong>: " + feature.properties.SEVERIDAD;
      layer.bindPopup(popupText);
    }			
  }).addTo(mapa);

  control_capas.addOverlay(capa_danos, 'Daños reportados');
});