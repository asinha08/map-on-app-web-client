'use strict';

let isMapOnAppResourcesLoaded = false;

/**
 * MapOnAppWebClient
 *
 * @since 1.0.0
 * @category Map
 * @param {string} container in which map will be loaded.
 * @param {string} token is used to consume map api from MapOnApp (visit https://maponapp.com). Get the api token from your account.
 * @param {boolean} checkBrowserLocation is to get geo location of user's browser. using browser's geolocation api.
 * @param {string} baseURL is optional parameter. If you want to connect some other host to get map data.
 * @returns {null} Returns the rounded up number.
 * @example
 *
 * var myMap = new MapOnAppWebClient('map', 'YOUR_API_TOKEN', false, 'https://maponapp.com/')
 * // => null
 *
 * var myMap = new MapOnAppWebClient('map', 'YOUR_API_TOKEN', true, 'https://maponapp.com/')
 * // => null
 *
 */

function MapOnAppWebClient(container, token, checkBrowserLocation, baseURL) {
	this.Error = "MapOnApp ERROR: ";
	if (!container) {
		console.log(this.Error + "container is required");
	}
	if (!token) {
		console.log(this.Error + "ERROR: token is required");
	}
	if (checkBrowserLocation === undefined) {
		console.warn()
	}
	this.checkBrowserLocation = checkBrowserLocation || false;
	this.baseURL = baseURL || "https://maponapp.com/";
	this.token = token;
	this.contains = container;
	this.counter = 0;
	this.layers = {};
	this.layerData = {};
	if (!isMapOnAppResourcesLoaded) {
		this.setUp();
	} else {
		this.loadMap();
	}
}
MapOnAppWebClient.prototype.pushCoordinatesToLineLayer = function (coordinates, layerId) {
	if(!Array.isArray(coordinates)) {
		console.error(this.Error + "coordinates is not a valid array");
		return;
	}
	layerId = layerId || 'layer_' + (++this.counter);
	if (!this.layers[layerId]) {
		this.createLineLayer(null, layerId);
	}
	let source = this.map.getSource(layerId);
	this.layers[layerId].push(coordinates);
	source.setData({
		geometry: {
			coordinates: this.layers[layerId],
			type: "LineString"
		},
		type: "Feature"
	});
	//console.log(layer);
};

MapOnAppWebClient.prototype.createLineLayer = function (params, layerId) {
	layerId = layerId || 'layer_' + (++this.counter);
	if (this.layers[layerId]) {
		console.error(this.Error + layerId + ", layer was already added on map");
		return;
	}
	if (!params) {
		params = {};
	}
	var coordinates = params.coordinates,
		lineJoin = params.lineJoin || "round",
		lineColor = params.lineColor || "#ff0000",
		lineWidth = params.lineWidth || 2,
		lineCap = params.lineCap || "round";
	if (coordinates && !Array.isArray(coordinates)) {
		console.error("ERROR: coordinates is not an array");
	}
	coordinates = coordinates || [];
	this.map.addLayer({
		"id": layerId,
		"type": "line",
		"source": {
			"type": "geojson",
			"data": {
				"type": "Feature",
				"properties": {},
				"geometry": {
					"type": "LineString",
					"coordinates": coordinates
				}
			}
		},
		"layout": {
			"line-join": lineJoin,
			"line-cap": lineCap
		},
		"paint": {
			"line-color": lineColor,
			"line-width": lineWidth
		}
	});
	this.layers[layerId] = coordinates;
	//this.layerData[layerData] = coordinates;
	return layerId;
};

MapOnAppWebClient.prototype.getBrowserLocation = function () {
	if (this.checkBrowserLocation && navigator.geolocation) {
		var that = this;
		navigator.geolocation.getCurrentPosition(function (position) {
			that.setMapCenter(position.coords.longitude, position.coords.latitude);
		});
	}
};

MapOnAppWebClient.prototype.setMapCenter = function (lng, lat) {
	this.map.setCenter([lng, lat]);
};

MapOnAppWebClient.prototype.loadMap = function () {
	if (!isMapOnAppResourcesLoaded) {
		mapboxgl.setRTLTextPlugin(this.baseURL + 'js/mapbox-gl-rtl-text.js');
	}
	this.map = new mapboxgl.Map({
		container: this.contains,
		style: this.baseURL + "map-api/dark/" + this.token + "/style",
		hash: true,
		zoom: 9,
		center: [-121.8778, 37.8869]
	});
	this.map.addControl(new mapboxgl.NavigationControl());
	this.getBrowserLocation();
	/*var adminLayers = ['admin-0-boundary', 'admin-1-boundary', 'admin-0-boundary-disputed',
		'admin-1-boundary-bg', 'admin-0-boundary-bg'];
	adminLayers.forEach((adminLayer) => {
		this.map.setFilter(adminLayer, ["match", ["get", "worldview"], ["all", "IN"], true, false]);
	});*/
};

MapOnAppWebClient.prototype.setUp = function () {
	var that = this,
		mapResource = [
			{type: "link", rel: "stylesheet", href: this.baseURL + "style/mapbox-gl.css"},
			{type: "link", rel: "stylesheet", href: this.baseURL + "style/mapbox.css"},
			{type: "script", src: this.baseURL + "js/mapbox-gl.js"},
			{type: "script", src: this.baseURL + "js/mapbox.js"},
			{type: "script", src: this.baseURL + "js/leaflet-hash.js"}

		],
		counter = 0;

	function whenResourcesIsLoaded() {
		counter++;
		if (counter === mapResource.length) {
			that.loadMap();
			isMapOnAppResourcesLoaded = true;
		}
	}

	var head = document.getElementsByTagName("body")[0];
	for (var i in mapResource) {
		if (mapResource.hasOwnProperty(i)) {
			var resource = mapResource[i],
				res = document.createElement(resource.type);
			for (var key in resource) {
				if (resource.hasOwnProperty(key) && key !== "type") {
					res[key] = resource[key];
				}
			}
			res.onload = whenResourcesIsLoaded;
			head.append(res);
		}
	}
};

module.exports = MapOnAppWebClient;