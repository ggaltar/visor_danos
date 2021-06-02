// Mapa Leaflet
var mapa = L.map('mapid').setView([9.8, -84.25], 8.5);

// Definición de capas base de tesela
var capa_osm = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?', 
  {
    maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
).addTo(mapa);	

// Otra capa base de tesela
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
	  return {'color': "green", 'weight': 2.5, 'fillOpacity': 1.0}
    },
    onEachFeature: function(feature, layer) {
      var popupText = "<strong>Estructura</strong>: " + feature.properties.estructura + "<br>" + "<strong>Elemento</strong>: " + feature.properties.elemento + "<br>" + "<strong>Tipo de daño</strong>: " + feature.properties.tipo + "<br>" + "<strong>Severidad</strong>: " + feature.properties.severidad;
      layer.bindPopup(popupText);
    }			
  }).addTo(mapa);

  control_capas.addOverlay(capa_danos, 'Daños reportados');
});

// Capa WMS
var capa_cantones = L.tileLayer.wms('https://geos.snitcr.go.cr/be/IGN_5/wms?', {
	  layers: 'limitecantonal_5k',
	  format: 'image/png',
	  //transparent: true
	  opacity: 0.4
}).addTo(mapa);

control_capas.addOverlay(capa_cantones, 'Cantones');

// Capa de coropletas de cantidad de daños reportados por zona de conservación
$.getJSON('https://raw.githubusercontent.com/ggaltar/danos_red_vial/main/capas/zonas_conservacion_wgs84.geojson', function (geojson) {
  var capa_zonas_coropletas = L.choropleth(geojson, {
	  valueProperty: 'cantidad',
	  scale: ['yellow', 'brown'],
	  steps: 5,
	  mode: 'q',
	  style: {
	    color: '#fff',
	    weight: 2,
	    fillOpacity: 0.7
	  },
	  onEachFeature: function (feature, layer) {
	    layer.bindPopup('Zona de conservación: ' + feature.properties.Zona2 + '<br>' + 'Cantidad de daños: ' + feature.properties.cantidad.toLocaleString())
	  }
  }).addTo(mapa);
  control_capas.addOverlay(capa_zonas_coropletas, 'Cantidad de daños reportados por zona de conservación');	

  // Leyenda de la capa de coropletas
  var leyenda = L.control({ position: 'bottomleft' })
  leyenda.onAdd = function (mapa) {
    var div = L.DomUtil.create('div', 'info legend')
    var limits = capa_zonas_coropletas.options.limits
    var colors = capa_zonas_coropletas.options.colors
    var labels = []

    // Add min & max
    div.innerHTML = '<div class="labels"><div class="min">' + limits[0] + '</div> \
			<div class="max">' + limits[limits.length - 1] + '</div></div>'

    limits.forEach(function (limit, index) {
      labels.push('<li style="background-color: ' + colors[index] + '"></li>')
    })

    div.innerHTML += '<ul>' + labels.join('') + '</ul>'
    return div
  }
  leyenda.addTo(mapa)
});

// Capa raster de precipitación del periodo más frío
var capa_precipitacion = L.imageOverlay("capas/bio19_cr.png", 
	[[5.5002762949999999, -87.1003465999999946], 
	[11.2181154430000003, -82.5547031640000029]], 
	{opacity:0.5}
).addTo(mapa);
control_capas.addOverlay(capa_precipitacion, 'Precipitación del periodo más frío');

// Función de control de opacidad
function updateOpacityPrec() {
  document.getElementById("span-opacity-prec").innerHTML = document.getElementById("sld-opacity-prec").value;
  capa_precipitacion.setOpacity(document.getElementById("sld-opacity-prec").value);
}
