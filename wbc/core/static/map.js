var app = angular.module('map',['duScroll']);

app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
}]);

app.factory('MapService',['$http',function($http) {

    var map = new L.Map("map", {
        'zoomControl': true,
        'scrollWheelZoom': true
    });

    var defaultLocation = new L.LatLng(_default_view.lat,_default_view.lon);
    var defaultZoom = _default_view.zoom;

    map.addLayer(new L.TileLayer(_tiles_url + '/{z}/{x}/{y}.png',_tiles_opt));
    map.setView(defaultLocation,defaultZoom);

    var markerLayer = L.layerGroup().addTo(map);
    var icons = {};

        // create icon for old projects
        icons.old = {
            icon: L.icon({
                iconUrl: _static_url + 'img/icons/grau.png',
                iconSize:     [26, 45],
                iconAnchor:   [13, 45],
                popupAnchor:  [0, -46]
            })
        };

        var setViewOptions = {
          pan: {
            animate: true,
            duration: 3
          },
          zoom: {
            animate: true
          }
        };

    return {

        map: map,

        focusLocation: function(point) {

            map.setView(point, 15, setViewOptions);
        },

        resetToDefaults: function() {
            map.setView(defaultLocation, defaultZoom,  setViewOptions);
        }
    };
}]);


app.controller('StartpageController', ['$scope', '$document', '$http', '$window', 'MapService',
    function($scope, $document, $http, $window, MapService) {

    $scope.data = {
        results: [],
        search: '',
        searchEmpty: true,
        currentPoly: null,
        currentIdx: -1
    };

    $scope.focusLocation = function(location) {
        MapService.focusLocation(location);
    };

    $scope.resetLocation = MapService.resetToDefaults;

    $scope.loadResultDetails = function(result) {
        if(result.type === 'project') {
            $http({
                method: 'GET',
            // TODO: fixme
            url: '/project/projects/' + result.pk,
            params: {
                geometry: 'polygon'
            }
            }).success(function(response) {

                if($scope.data.currentPoly !== null) {
                    MapService.map.removeLayer($scope.data.currentPoly);
                }

                // var osmb = new OSMBuildings(MapService.map).loadData();

                var polygonOptions = {
                    weight: 3,
                    color: '#de6a00',
                    opacity: 1,
                    fill: true,
                    fillColor: '#de6a00',
                    fillOpacity: 0.05
                };

                if(response.geometry.coordinates && response.geometry.coordinates.length > 2) {
                    $scope.data.currentPoly = L.multiPolygon(response.geometry.coordinates)
                    .setStyle(polygonOptions)
                    .addTo(MapService.map);
                }

            }).error(function(e) {
                console.log('could not load result details', e);
            });
        }
    };

    $scope.onKeyDown = function(evt) {
        if($scope.data.results.length > 0) {
            if (evt.keyCode == '38') {
                    // up arrow
                $scope.data.currentIdx += 1;

            } else if (evt.keyCode == '40') {
                    // down arrow
                $scope.data.currentIdx -= 1;
            }

            console.log($scope.data.currentIdx)
        }


    };

    $scope.onSearchChanged = function() {

        $scope.data.searchEmpty = $scope.data.search === '';
        if($scope.data.searchEmpty) {
            MapService.resetToDefaults();
            return;
        }

        $http({
            method: 'GET',
            url:  '/autocomplete',
            params: {
                q: $scope.data.search
            }
        }).success(function(response) {
            $scope.data.results = response.results;
            $scope.data.currentIdx = 0;
        });
    };

}]);

app.controller('MapController',['$scope','$document','$window','$timeout','$location','$anchorScroll','MapService',function($scope,$document,$window,$timeout,$location,$anchorScroll,MapService) {

    $scope.map = true;
    $scope.locked = false;

    $scope.showInfo = function() {
        $timeout(function() {
            $scope.locked = false;
            $scope.map = false;

            // enable mouse scroll on map
            MapService.map.scrollWheelZoom.disable();

            angular.element('html').removeClass('locked');
            angular.element('body').removeClass('locked');

            if ($window.innerWidth >= 768) {
                $document.scrollToElement(angular.element('#info'),0, 1000);
            }
        });
    };

    $scope.showMap = function() {
        if ($scope.locked === false) {
            $timeout(function() {
                $scope.locked = true;
                $scope.map = true;

                if ($window.innerWidth >= 768) {
                    // scroll to top
                    $document.scrollToElement(angular.element('#map'),0, 1000).then(function(){
                        // enable mouse scroll on map
                        MapService.map.scrollWheelZoom.enable();

                        // hide scrollbar
                        angular.element('html').addClass('locked');
                        angular.element('body').addClass('locked');

                        // stop video in iframe
                        var frame = $('iframe#vimeo-iframe');
                        var vidsrc = frame.attr('src');
                        frame.attr('src','');
                        frame.attr('src', vidsrc);
                    });
                }
            });
        }
    };

    $scope.zoomIn = function(event) {
        $scope.showMap();
        MapService.map.zoomIn();
    };

    $scope.zoomOut = function(event) {
        $scope.showMap();
        MapService.map.zoomOut();
    };

    MapService.map.on('focus', function() {
        $scope.showMap();
    });

}]);