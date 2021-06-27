// Mapa Leaflet
var mapa1 = L.map('mapid').setView([9.7, -84.25], 8);

// Definición de capas base de tesela
var capa_osm = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?', 
  {
    maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
).addTo(mapa1);	

// Otra capa base de tesela
var CartoDB_Voyager = L.tileLayer(
	'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
	{
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
		subdomains: 'abcd',
		maxZoom: 19
	}
).addTo(mapa1);


// Conjunto de capas base
var capas_base = {
  "OSM": capa_osm,
  "CartoDB Voyager": CartoDB_Voyager
};	    
	    
		
// Ícono personalizado para daños

var iconoDano = new L.Icon({
  iconUrl: 'img/marker-icon-green.png',
  shadowUrl: 'img/marker-shadow.png',
  iconSize: [12, 20],
  iconAnchor: [6, 20],
  popupAnchor: [1, -34],
  shadowSize: [20, 20]
});
	
// Control de capas
control_capas = L.control.layers(capas_base).addTo(mapa1);	

// Control de escala
L.control.scale({position: "topright", imperial: false}).addTo(mapa1);



// Capas vectoriales en formato GeoJSON

// Capa de la red vial nacional

$.getJSON("https://raw.githubusercontent.com/ggaltar/danos_red_vial/main/capas/red_vial_nacional_wgs84.geojson", function(geodata) {
  var capa_rvn = L.geoJson(geodata, {
    style: function(feature) {
	  return {'color': "#C6250F", 'weight': 2, 'fillOpacity': 0.0}
    },
    onEachFeature: function(feature, layer) {
      var popupText = "<strong>Ruta</strong>: " + feature.properties.ruta + "<br>"
	  + "<strong>Sección de control</strong>: " + feature.properties.seccion + "<br>"
	  + "<strong>Tramo</strong>: " + feature.properties.descrip + "<br>"
	  + "<strong>Clase</strong>: " + feature.properties.clase;
      layer.bindPopup(popupText);
    }
  }).addTo(mapa1);

  control_capas.addOverlay(capa_rvn, 'Red Vial Nacional');
});

// Capas de daños

$.getJSON("https://raw.githubusercontent.com/ggaltar/danos_red_vial/main/capas/danos_wgs84.geojson", function(geodata) {
  var capa_danos = L.geoJson(geodata, {
    style: function(feature) {
	  return {'color': "green", 'weight': 2.5, 'fillOpacity': 1.0}
    },
    onEachFeature: function(feature, layer) {
      var popupText = "<strong>Estructura</strong>: " + feature.properties.estructura + "<br>"
	  + "<strong>Elemento</strong>: " + feature.properties.elemento + "<br>"
	  + "<strong>Tipo de daño</strong>: " + feature.properties.tipo + "<br>"
	  + "<strong>Descripción del daño</strong>: " + feature.properties.descripcio + "<br>"
	  + "<strong>Fecha del daño</strong>: " + feature.properties.fecha_dano + "<br>"
	  + "<strong>Severidad</strong>: " + feature.properties.severidad
      layer.bindPopup(popupText);
    },
    pointToLayer: function(getJsonPoint, latlng) {
        return L.marker(latlng, {icon: iconoDano});
    }
  })
  
  control_capas.addOverlay(capa_danos, 'Daños reportados');
  // Capa de calor (heatmap)

  coordenadas = geodata.features.map(feat => feat.geometry.coordinates.reverse());
  var capa_danos_calor = L.heatLayer(coordenadas, {radius: 18, blur: 8, minOpacity: 0.2, maxZoom: 20});

  // Se añade la capa al mapa y al control de capas

  capa_danos_calor.addTo(mapa1);
    control_capas.addOverlay(capa_danos_calor, 'Mapa de calor');
});

// Capa WMS

var capa_cantones = L.tileLayer.wms('https://geos.snitcr.go.cr/be/IGN_5/wms?', {
	  layers: 'limitecantonal_5k',
	  format: 'image/png',
	  //transparent: true
	  opacity: 0.4
}).addTo(mapa1);

control_capas.addOverlay(capa_cantones, 'Cantones');


