//the search Results
var searchResults = [];
//selected place
var place = [];
//current location of user
//TODO: Maybe this should just be a user object
// that has geo, places checked in, chat messages, auth, etc?
var geo = {lat: '', long: ''};

angular.module('starter', ['ionic', 'starter.controllers', ])
.run(function($ionicPlatform, $rootScope, $cordovaGeolocation, $q, $timeout) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    // get the uuid of the device
    $rootScope.uuid = device.uuid;
    //console.log($rootScope.uuid);

  });
})
.constant('$ionicLoadingConfig', {
        template: '<ion-spinner class="spinner-positive" style="background-color:none;" icon="ripple"></ion-spinner>'
})
.config(function($httpProvider){
  // resolve cors issue?
  delete $httpProvider.defaults.headers.post['Content-Type'];
})
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })

  .state('app.learn', {
    url: "/learn",
    views: {
      'menuContent': {
        templateUrl: "templates/learn.html",
        controller: 'LearnCtrl'
      }
    }
  })

  .state('app.map', {
    url: "/map",
    views: {
      'menuContent': {
        templateUrl: "templates/map.html",
        controller: 'MapCtrl'
      }
    },
    resolve : {
      initialGeo: function ( $timeout) {
      //     var posOptions = {timeout: 1000, enableHighAccuracy: true};
      //     return $cordovaGeolocation.getCurrentPosition(posOptions);
      return  $timeout(function () {
          return 1;
        }, 100);
      }
    }
  })
  .state('app.place', {
    url: "/place",
    views: {
      'menuContent': {
        templateUrl: "templates/place.html",
        controller: 'PlaceCtrl'
      }
    }
  })

  .state('app.places', {
    url: "/places/:placesName",
    views: {
      'menuContent': {
        templateUrl: "templates/places.html",
        controller: 'PlacesCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/map');
})
.factory('searchResults',function(){
  return searchResults;
})
.factory('place',function(){
  return place;
})
.factory('geo', function () {
  return geo;
})
.factory('myGeo', function () {
  return myGeo;
})
.factory('$cordovaGeolocation', ['$q', 'geo', function ($q) {

    return {
        getCurrentPosition: function (options) {
            var q = $q.defer();

            navigator.geolocation.getCurrentPosition(function (result) {
                q.resolve(result);
                console.log(JSON.stringify(q.resolve(result)));
            }, function (err) {
                q.reject(err);
            }, options);

            return q.promise;
        },

        watchPosition: function (options) {
            var q = $q.defer();

            var watchID = navigator.geolocation.watchPosition(function (result) {
                q.notify(result);
            }, function (err) {
                q.reject(err);
            }, options);

            q.promise.cancel = function () {
                navigator.geolocation.clearWatch(watchID);
            };

            q.promise.clearWatch = function (id) {
                navigator.geolocation.clearWatch(id || watchID);
            };

            q.promise.watchID = watchID;

            return q.promise;
        },

        clearWatch: function (watchID) {
            return navigator.geolocation.clearWatch(watchID);
        }
    };
}])
