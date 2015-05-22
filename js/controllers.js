angular.module('starter.controllers', [])

.controller('AppCtrl', function($state, $scope, $ionicModal, $timeout) {
  $scope.goLearn = function () {
    console.log('learn Function');
            $timeout(function () {
              $state.go('app.learn');
            },1000);
  }
})
.controller('PlaceCtrl', function($rootScope, $scope, $state, $timeout, $ionicPopup, $http,$ionicLoading, $ionicModal, geo, place, searchResults) {
  // This works for realsies
  $scope.place = place;
  $scope.places = searchResults;
  // console.log('** Single Place **');
  //console.log(JSON.stringify($scope.place));
  // $timeout(function () {
  //   for (var i=0; i<$scope.places.length; i++) {
  //   //console.log(JSON.stringify($scope.places[i]));
  //   // if ($scope.place.place_id == $scope.places.place_id) {
  //   //   console.log('found one');
  //   //   console.log('***************************************************************')
  //   //   console.log('***************************************************************')
  //   //   searchResults[i].rating = $scope.place.rating;
  //   //   searchResults[i].commments = $scope.place.commments
  //   // }
  //   }
  // }, 2000);

  //For Testing!
  //$scope.place = [{"points": 25, "message": "Got a drink in 5 minutes on a Saturday night. These bartenders are rock stars!"}]
  // For the ionic list
  $scope.shouldShowDelete = false;
  $scope.shouldShowReorder = false;
  $scope.listCanSwipe = true;

  $scope.showAlert = function(title, body) {
   var alertPopup = $ionicPopup.alert({
    title: title,
     template: body
   });
   alertPopup.then(function(res) {
     console.log('Thank you for not eating my delicious ice cream cone');
   });
  };

  // modal data, initialize to 33
  // console.log('***************************************************************')
  // console.log( $scope.place.name,
  // $scope.place.address,
  // $scope.place.icon,
  // $scope.place.id,
  // $scope.place.rating,
  // $scope.place.latLng );

  var resetFunction = function () {
    //$scope.messageArray = [];
    $scope.getMessage();
    //console.log('resetFunction');
    $timeout(function(){
      if ($rootScope.imHere && $scope.place.allowChat) {
         resetFunction();
      }
    },5000);
  }

  $timeout(function(){
    resetFunction();
  },5000);

  $scope.getMessage = function () {
    //console.log('get messages!');
    //console.log('get all Messages: ', $scope.place._id);
    $http({
          method: "post",
          url: 'http://hoppscotch.co/messages/',
          headers: {'Content-Type': 'application/json'},
          data: {
            place_id: $scope.place.place_id
          }
      })
     .success(function(data,status,header,config){
        $scope.messageArray = [];
         //console.log('***express***');
         //console.log(data, status, header, config);
         //console.log(JSON.stringify(data));
        angular.forEach(data, function(value, key){
             this.push({'message': value.message, '_id': value._id, 'points': value.points, 'created': value.created});
         }, $scope.messageArray)

        $ionicLoading.hide();
     })
     .error(function(data,status,headers,config){
         //console.log('*** Get Message Error ***');
         //console.log(JSON.stringify(data));
         //console.log(JSON.stringify(status));
         //console.log(JSON.stringify(headers));
         //console.log(JSON.stringify(config));
         //console.log('*** Get Message Error ***');
         $ionicLoading.hide();
         $state.go('app.places');
     });
  }
  $scope.getMessage();
  $scope.postMessage = function () {
      var message = document.getElementById('message').value;
      var safeMessage = message.replace(/[^a-zA-Z0-9\!\?\#\s\&\.\,\+\-\@\$\'\*]/g, '');
      // make the api call.
      if (message.length > 144) {
        $scope.showAlert("Sorry, you're message is too long.", "144 character max. Sound familiar?");
     } else {
        //console.log('post Message id: ', $scope.place._id);
        $http({
              method: "post",
              url: "http://hoppscotch.co/messages/newMessage",
              headers: {'Content-Type': 'application/json'},
              data: {
                place_id: $scope.place.place_id,
                message: safeMessage
              }
          })
            .success(function(data,status,header,config) {
               //console.log('***Meteor***');
               //console.log(data, status, header, config);
               //console.log(JSON.stringify(data));
               //console.log('***Meteor***');

               if ($scope.$$phase) { // most of the time it is "$digest"
                   $scope.getMessage();
               } else {
                   $scope.$apply($scope.getMessage());
               }

           })
           .error(function(data,status,headers,config){
               //console.log('***Meteor error***');
               //console.log(JSON.stringify(status));
               //console.log(JSON.stringify(data));
               //console.log(JSON.stringify(headers));
               //console.log(JSON.stringify(config));
               //console.log('***Meteor error***');
           });
      }
      document.getElementById('message').value = null;
  }
  $scope.up = function(message) {
    //console.log(JSON.stringify(message));
    //alert('Edit Item: ' + message.points);
    ///:lat/:long/:message/:points/:id'
    //$http.post('http://nogo.meteor.com/api/messages', {"id": message.id, "points": message.points, "inc": true})
    $http({
      method: "post",
      url: "http://hoppscotch.co/messages/vote",
      headers: {'Content-Type': 'application/json'},
      data: {
        _id: message._id,
        vote: 1
      }
    })
    .success(function(data,status,header,config) {
      //console.log('***post success***');
      //console.log(data, status, header, config);
      //console.log('***post success***');

      $ionicLoading.hide();
        //resetFunction();
        if ($scope.$$phase) { // most of the time it is "$digest"
          $scope.getMessage();
      } else {
        $scope.$apply($scope.getMessage);
      }

    })
    .error(function(data,status,header,config){
      //console.log('***post error***');
      //console.log(data, status, header, config);
      $ionicLoading.hide();
      //alert('There was an error: ' + status);
      //console.log('***post error***');
    });
  };
  $scope.down = function(message) {
    //console.log(JSON.stringify(message));
    //alert('Edit Item: ' + message.points);
    ///:lat/:long/:message/:points/:id'
    //$http.post('http://nogo.meteor.com/api/messages', {"id": message.id, "points": message.points, "inc": true})
    $http({
        method: "post",
        url: "http://hoppscotch.co/messages/vote",
        headers: {'Content-Type': 'application/json'},
        data: {
          _id: message._id,
          vote: -1
        }
    })
    .success(function(data,status,header,config) {
      //console.log('***post success***');
      //console.log(data, status, header, config);
      //console.log('***post success***');

      $ionicLoading.hide();
      //resetFunction();
      if ($scope.$$phase) { // most of the time it is "$digest"
          $scope.getMessage();
      } else {
          $scope.$apply($scope.getMessage);
      }
    })
    .error(function(data,status,header,config){
      //console.log('***post error***');
      //console.log(data, status, header, config);
      $ionicLoading.hide();
      //alert('There was an error: ' + status);
      //console.log('***post error***');
    });
  };
})
.controller('PlacesCtrl', function($rootScope, $scope, $state, $timeout, $ionicPopup, $ionicModal,$http, $ionicLoading, searchResults, place, geo) {

  //for testing - DELETE
  //$scope.places = [{"name":"Anchor Brewing Company", "color":"#19B5FE", "rating": 5, "address":"1705 Mariposa Street, San Francisco","icon":"http://maps.gstatic.com/mapfiles/place_api/icons/bar-71.png","place_id":"ChIJS5fZqsx_j4ARsnlQbCfuapc","latLng":{"lat":37.763222,"long":-122.40094599999998},"comments":0,"rating":"5","checkins":0},{"name":"Whole Foods Market","address":"450 Rhode Island Street, San Francisco","icon":"http://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png","place_id":"ChIJnwZ_QDN-j4ARZgoZ-NAkywY","latLng":{"lat":37.764425,"long":-122.40283},"comments":0,"rating":"0","checkins":0},{"name":"Thee Parkside","address":"1600 17th Street, San Francisco","icon":"http://maps.gstatic.com/mapfiles/place_api/icons/bar-71.png","place_id":"ChIJ8SXJ6sx_j4ARHRrwH9Z3R5k","latLng":{"lat":37.765222,"long":-122.39991099999997},"comments":0,"rating":"3","checkins":0},{"name":"Project One","address":"251 Rhode Island Street, San Francisco","icon":"http://maps.gstatic.com/mapfiles/place_api/icons/bar-71.png","place_id":"ChIJe6JAvjJ-j4ARaIknahTj6iA","latLng":{"lat":37.766781,"long":-122.402513},"comments":0,"rating":"0","checkins":0},{"name":"Market & Rye","address":"300 De Haro Street, San Francisco","icon":"http://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png","place_id":"ChIJC0wx1zJ-j4AR1AzNusqvmvI","latLng":{"lat":37.765813,"long":-122.402016},"comments":0,"rating":"?","checkins":0},{"name":"Live Sushi Bar","address":"2001 17th Street, San Francisco","icon":"http://maps.gstatic.com/mapfiles/place_api/icons/bar-71.png","place_id":"ChIJtSa-BDN-j4ARVOuKy9mDdhw","latLng":{"lat":37.764534,"long":-122.40372100000002},"comments":0,"rating":"?","checkins":0},{"name":"Dos Pinas","address":"251 Rhode Island Street #102, San Francisco","icon":"http://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png","place_id":"ChIJe6JAvjJ-j4ARe84LQ9gSGH8","latLng":{"lat":37.766718,"long":-122.40238399999998},"comments":0,"rating":"?","checkins":0},{"name":"Sally's Restaurant","address":"300 De Haro Street Ste 332, San Francisco","icon":"http://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png","place_id":"ChIJ95TkKTN-j4AREOCDCTBAH8w","latLng":{"lat":37.765906,"long":-122.40222399999999},"comments":0,"rating":"?","checkins":0},{"name":"Wolfe's Lunch","address":"1220 16th Street, San Francisco","icon":"http://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png","place_id":"ChIJ-77XHc1_j4ARXHQgLF2Tad8","latLng":{"lat":37.76638,"long":-122.39966200000003},"comments":0,"rating":"?","checkins":0},{"name":"Pastel Brazzuca","address":"290 De Haro Street, San Francisco","icon":"http://maps.gstatic.com/mapfiles/place_api/icons/cafe-71.png","place_id":"ChIJwybjzTJ-j4ART2mGozaeg4k","latLng":{"lat":37.766318,"long":-122.40207499999997},"comments":0,"rating":"?","checkins":0},{"name":"What's Up Dog?","address":"300 De Haro Street, San Francisco","icon":"http://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png","place_id":"ChIJn6Rb1jJ-j4ARUanVdC5NLhU","latLng":{"lat":37.765785,"long":-122.40208899999999},"comments":0,"rating":"?","checkins":0},{"name":"Sally's After Dark","address":"300 De Haro Street # 332, San Francisco","icon":"http://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png","place_id":"ChIJNfTjKTN-j4ARyByv87W5XnU","latLng":{"lat":37.765575,"long":-122.40179899999998},"comments":0,"rating":"?","checkins":0},{"name":"Tavares Restaurant","address":"300 De Haro Street, San Francisco","icon":"http://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png","place_id":"ChIJnQN11zJ-j4ARgw0oVoWHRiY","latLng":{"lat":37.765684,"long":-122.40204799999998},"comments":0,"rating":"?","checkins":0}]

  // for real
  $scope.places = searchResults;

  $scope.place = place;
  $scope.geo = geo;

  $scope.showAlert = function(title, body) {
   var alertPopup = $ionicPopup.alert({
    title: title,
     template: body
   });
   alertPopup.then(function(res) {
     console.log('Thank you for not eating my delicious ice cream cone');
   });
  };


  //console.log('** search Results on Places Page**');

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    if (fromState.name == 'app.place' && toState.name == 'app.places') {
      $rootScope.imHere = false;
      $rootScope.refreshPlaces = true;
      //console.log(JSON.stringify($scope.place));
      //console.log('im here  = false andre refresh places = true');
    }
    if (toState.name == 'app.place' && fromState.name == 'app.places') {
      $rootScope.imHere = true;
      $rootScope.refreshPlaces = false;

      //console.log('im here  = true  and refresh places = false');
    }
    if (toState.name == 'app.map' && fromState.name == 'app.places') {
      $rootScope.onMap = true;
      //console.log('onMap  = true ');
      $ionicLoading.show();

      $timeout(function () {
        $rootScope.resetMap();
        $ionicLoading.hide();
      },500);
    }
    if (toState.name == 'app.places' && fromState.name == 'app.map') {
      $rootScope.onMap = false;
      //console.log('onMap  = false ');
    }
    //console.log('fromState: ', JSON.stringify(fromState));
    //console.log('toState : ', JSON.stringify(toState));
    // transitionTo() promise will be rejected with
    // a 'transition prevented' error
  })

  var clearPlace = function () {
    //console.log('***before***')
    //console.log($scope.place);
    $scope.place.length = 0;
    //console.log('cleared');
    //console.log('***after***')
    //console.log($scope.place);
  }

  //modal
  //for modal
  $scope.place.data= { 'rating': 33 };

  $ionicModal.fromTemplateUrl('templates/rate.html', {
      scope: $scope,
      animation: 'slide-in-up'
  }).then(function(modal) {
      $scope.modal = modal;
  });

  $scope.openModal = function() {
      //console.log('click open')
      $scope.modal.show();
  };
  $scope.closeModal = function() {
    //console.log('click close');

    // post the rating and get back an updated rating
    $http({
          method: "post",
          url: "http://hoppscotch.co/places/updateRating",
          headers: {'Content-Type': 'application/json'},
          data: {
            _id:    $scope.place._id,
            rating: $scope.place.rating,
            lat:    $scope.place.latLng.lat,
            long:   $scope.place.latLng.long
          }
    })
    .success(function(data,status,header,config) {
      //console.log('***Meteor***');
      //console.log(data, status, header, config);
      console.log(data);
      //console.log('***Meteor***');

      //set response data for rating to place rating.
      $scope.place.rating = data.rating;
      $scope.place.checkins = data.checkins;
      $scope.place.comments = data.comments;
      for (var i=0; i<$scope.places.length; i++) {
          if ($scope.place.place_id == $scope.places[i].place_id) {
            //console.log('found one');
            //console.log('***************************************************************')
            //console.log('***************************************************************')
            //console.log($scope.places[i].rating);
            //console.log($scope.place.rating);
            $scope.places[i].rating = $scope.place.rating;
            $scope.places[i].commments = $scope.place.commments;
            $scope.places[i].checkins = $scope.place.checkins;
            //console.log($scope.places[i].rating);
            //console.log('***************************************************************')
            //console.log($scope.place.rating);
            //console.log('***************************************************************')
          }
        }
      $timeout(function () {
        $state.go('app.place')
      },100);

    })
    .error(function(data,status,headers,config){
       // console.log('***Meteor error***');
       // console.log(JSON.stringify(status));
       // console.log(JSON.stringify(data));
       // console.log(JSON.stringify(headers));
       // console.log(JSON.stringify(config));
       // console.log('***Meteor error***');

       $state.go('app.places');
    });

   //console.log($scope.place.rating);
   $scope.modal.hide();
  };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      //console.log('destroyed');
      $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
      // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
      // Execute action
    });

    // for( var i=0; i<$scope.places.length; i++) {
    //   // console.log($scope.places[i].name)
    //   // console.log($scope.places[i].place_id)
    //   // console.log($scope.places[i].icon)
    //   // console.log($scope.places[i].latLng.lat)
    //   // console.log($scope.places[i].latLng.long)
    // }
    //console.log('user location:')
    //console.log($scope.geo.latitude)
    //console.log($scope.geo.longitude);

  $scope.goToPlace = function (place) {
    $ionicLoading.show();

    //console.log(JSON.stringify(place));
    clearPlace();
    var radius = 0.0473485; // 250 feet radius
    //var radius = 800;
    // I dont kow a better way to do this but I'm setting up a square arond the users address
    var latRight = Number($rootScope.actualLat) + ((1/68.68) * Number(radius)*.5);
    var latLeft = Number($rootScope.actualLat) - ((1/68.68) * Number(radius)*.5);
    var longTop = $rootScope.actualLong + ((1/(69.17*Math.cos(Number($rootScope.actualLat)))) * Number(radius)*.25);
    var longBottom = $rootScope.actualLong - ((1/(69.17*Math.cos(Number($rootScope.actualLat)))) * Number(radius)*.25);

    console.log(place.name);

    $scope.place.name = place.name;
    $scope.place.address = place.address;
    $scope.place.icon = place.icon;
    $scope.place.place_id = place.place_id;
    $scope.place.latLng = place.latLng;
    $scope.place._id =  place._id || null;

    //console.log("*** Place ID ****");
    //console.log($scope.place._id);
    //console.log("*** Place ID ****");
    //console.log($scope.place._id);
    // console.log("*** Lats ****");
    // console.log($rootScope.initialGeo.coords.latitude);
    // console.log($rootScope.initialGeo.coords.longitude);
    // console.log(latRight);
    // console.log(latLeft);
    // console.log(longTop);
    // console.log(longBottom);
    /* From server on place
    * $scope.place._id
    * $scope.place.checkins
    * $scope.place.rating
    * $scope.place.commment
    */
    // console.log($scope.place._id);
    // console.log('simulator:');
    // console.log(($rootScope.initialGeo.coords.latitude >= latLeft) && ($rootScope.initialGeo.coords.latitude <= latRight) && ($rootScope.initialGeo.coords.longitude >= longBottom) && ($rootScope.initialGeo.coords.longitude <= longTop)); // if for simulator
    // console.log('real phone: ');
    // console.log(($rootScope.initialGeo.coords.latitude >= latLeft && $rootScope.initialGeo.coords.latitude <= latRight && $scope.geo.longitude <= longBottom && $scope.geo.longitude >= longTop));
    //
    // console.log('scope geo latitude')
    // console.log($scope.geo.latitude);
    // console.log('scope place geo')
    // console.log($scope.place.latLng.lat);

    /* From server on place
    * $scope.place._id
    * $scope.place.checkins
    * $scope.place.rating
    * $scope.place.commment
    */
  if ($scope.place.latLng.lat >= latLeft && $scope.place.latLng.lat <= latRight && $scope.place.latLng.long <= longBottom && $scope.place.latLng.long >= longTop) { // real phone
  //  if ($scope.place.latLng.lat >= latLeft && $scope.place.latLng.lat <= latRight && $scope.place.latLng.long >= longBottom && $scope.place.latLng.long <= longTop) { // simulator
  //  if (1) { // allow to checkin from anywhere for map testing.
      //they're close enought, allow them to check in.
      // show modal and allow them to rate the place.
      if (!$scope.place._id) {
          console.log('There is no room and we are here!');
            // create the place
        $http({
            method: "post",
            url: "http://hoppscotch.co/places/newPlace",
            headers: {'Content-Type': 'application/json'},
            data: {
              place: $scope.place.place_id
            }
        })
        .success(function(data,status,header,config) {
           //console.log('***Meteor***');
           //console.log(data, status, header, config);
           //console.log(JSON.stringify(data));
           //console.log('***Meteor***');

           console.log(JSON.stringify(data));
           $scope.place.allowChat = true;


            $scope.place._id = data._id;
            $scope.place.checkins = data.checkins;
            $scope.place.rating = data.rating;
            $scope.place.commments = data.comments;

            //console.log($scope.place._id);

           // update newly created place data from search results
            for (var i=0; i<$scope.places.length; i++) {

              if ($scope.place.place_id == $scope.places[i].place_id) {
                //console.log('found one');
                //console.log('***************************************************************')
                //console.log('***************************************************************')
                $scope.places[i]._id = $scope.place._id;
                $scope.places[i].checkins = 1;
                $scope.places[i].rating = $scope.place.rating;
                $scope.places[i].commments = $scope.place.commments
              }
            }

            $scope.openModal();

            //console.log('allowChat');

            $ionicLoading.hide();
         })
         .error(function(data,status,headers,config){
             //console.log('***Meteor error***');
             //console.log(JSON.stringify(status));
             //console.log(JSON.stringify(data));
             //console.log(JSON.stringify(headers));
             //console.log(JSON.stringify(config));
             //console.log('***Meteor error***');

             $ionicLoading.hide();
         });
      } else {
        // there is a room and they are there.
        console.log('theres a room and Im here, let me in!');
        $http({
            method: "post",
            url: "http://hoppscotch.co/places/checkin",
            headers: {'Content-Type': 'application/json'},
            data: {
              place: $scope.place.place_id
            }
        })
          .success(function(data,status,header,config) {
             //console.log('***Meteor***');
             //console.log(data, status, header, config);
             //console.log(JSON.stringify(data));
             //console.log('***Meteor***');

             //console.log(JSON.stringify(data));
             $scope.place.allowChat = true;
             var newPlace = data;

              $scope.place._id = data._id;
              $scope.place.checkins = data.checkins;
              $scope.place.rating = data.rating;
              $scope.place.commments = data.comments;

              $scope.openModal();

              //$state.go('app.place');
              //console.log('allowChat');

              $ionicLoading.hide();
         })
         .error(function(data,status,headers,config){
             //console.log('***Meteor error***');
             //console.log(JSON.stringify(status));
             //console.log(JSON.stringify(data));
             //console.log(JSON.stringify(headers));
             //console.log(JSON.stringify(config));
             //console.log('***Meteor error***');

             $ionicLoading.hide();
         });
        $ionicLoading.hide();
      }
    } else {
      // they're not here, and no room
      if (!$scope.place._id) {
        console.log('they\'re not here, and no room ');
        //alert('Sorry, nobody is there yet and neither are you!');
        $scope.showAlert('Sorry, we don\'t know anyone there.','Check back later or take a chance! <br> You can easily tell where we have ratings by looking for red and blue points on the map.');
        $ionicLoading.hide();
      } else {
        // they're not here but they can view
        console.log('they\'re not here, but can view');
        $scope.place.allowChat = false;
        //console.log('viewOnly')
        $http({
            method: "post",
            url: "http://hoppscotch.co/places/checkin",
            headers: {'Content-Type': 'application/json'},
            data: {
              place: $scope.place.place_id
            }
        })
          .success(function(data,status,header,config) {
             //console.log('***Meteor***');
             //console.log(data, status, header, config);
             //console.log(JSON.stringify(data));
             //console.log('***Meteor***');

             //console.log(JSON.stringify(data));
             $scope.place.allowChat = false;
             var newPlace = data;

              $scope.place._id = data._id;
              $scope.place.checkins = data.checkins;
              $scope.place.rating = data.rating;
              $scope.place.commments = data.comments;

              //$scope.openModal();

              $state.go('app.place');
              //console.log('allowChat');

              $ionicLoading.hide();
         })
         .error(function(data,status,headers,config){
             //console.log('***Meteor error***');
             //console.log(JSON.stringify(status));
             //console.log(JSON.stringify(data));
             //console.log(JSON.stringify(headers));
             //console.log(JSON.stringify(config));
             //console.log('***Meteor error***');

             $ionicLoading.hide();
         });

      }

    }
  }
})
.controller('MapCtrl', function($rootScope,$q, initialGeo, $state, $ionicPopup, $scope, $stateParams, $timeout, searchResults,$http, geo, $cordovaGeolocation, $ionicLoading) {
  var map;

  console.log("Geo" + JSON.stringify(geo));
  $scope.searchResults = searchResults;
  $scope.geo = geo;
  $rootScope.onMap = true;
  $scope.mapDelay = false;
  $ionicLoading.show();

  console.log("Initial vars: \n"
              + "Root Scope Initial Load: " + $rootScope.initialLoad
              + "\nRoot Scope Clicked Somewhere: " + $rootScope.clickedSomewhere
              )

  var posOptions = {timeout: 10000, enableHighAccuracy: false};
  if (!$rootScope.initialLoad) {
    console.log('initial load is false, lets get some geo');
    $cordovaGeolocation
      .getCurrentPosition(posOptions)
      .then(function (position) {
        console.log(JSON.stringify(position));
        $rootScope.initialGeo = position;

        $scope.geo.lat = $rootScope.initialGeo.coords.latitude;
        $scope.geo.long = $rootScope.initialGeo.coords.longitude;

        $rootScope.actualLat = $rootScope.initialGeo.coords.latitude;
        $rootScope.actualLong = $rootScope.initialGeo.coords.longitude;

        //test delete
        // $rootScope.initialGeo = {"coords":{"latitude":33.46329724031262,"longitude":-117.59753555059433,"accuracy":65,"altitude":185.0321350097656,"heading":-1,"speed":-1,"altitudeAccuracy":10},"timestamp":"2015-04-20T02:25:00.453Z"}
        // $rootScope.initialGeo.coords.latitude = 33.46329724031262;
        // $rootScope.initialGeo.coords.longitude = -117.59753555059433;
        //
        // $scope.geo.lat = 33.46329724031262;
        // $scope.geo.long = -117.59753555059433;
        //
        // $rootScope.actualLat = 33.46329724031262;
        // $rootScope.actualLong = -117.59753555059433;

        //test delete

        console.log('from before clicked somewhere' + JSON.stringify($scope.geo));
        $rootScope.initialLoad = true;



      }, function(err) {
        // error
      });
  }

  $timeout(function () {
    //console.log("Initial Geo is : ", JSON.stringify($rootScope.initialGeo));
    $scope.mapDelay = true;
  }, 200);
  // for fast phones
  $timeout(function () {
    map.panTo(new google.maps.LatLng($scope.geo.lat,$scope.geo.long))
    $rootScope.resetMap();
    $ionicLoading.hide();
  }, 520);
  // for slow phones
  $timeout(function () {
    map.panTo(new google.maps.LatLng($scope.geo.lat,$scope.geo.long))
    $rootScope.resetMap();
  }, 920);

  //map marker
  $timeout(function () {
    var initialLatLng =  new google.maps.LatLng($rootScope.initialGeo.coords.latitude, $rootScope.initialGeo.coords.longitude);
    var markerImage = 'img/marker_sm.png';

     $scope.marker = new google.maps.Marker({
          position: initialLatLng,
          map: map,
          icon: markerImage,
          animation: google.maps.Animation.DROP
      });

    // while (!map.getBounds().contains(initialLocation.getPosition())) {
    //   console.log('setting marker');
    //   var initialLocation = new google.maps.Marker({
    //         position: initialLatLng,
    //         map: map,
    //         icon: markerImage,
    //         animation: google.maps.Animation.DROP
    //     });
    // }
  },1500)

  /**************************** Are They New ***************************************/
  $scope.newHerePopup = function () {
    $ionicPopup.show({
      template: '<input type="password" ng-model="data.wifi">',
      title: 'Looks like you\'re new here!',
      template: 'Want to learn how to use HoppScotch?',
      scope: $scope,
      buttons: [
        { text: 'No',
          onTap: function (e) {
            map.panTo(new google.maps.LatLng($scope.geo.lat,$scope.geo.long));
            var initialLatLng =  new google.maps.LatLng($rootScope.initialGeo.coords.latitude, $rootScope.initialGeo.coords.longitude);
            var markerImage = 'img/marker_sm.png';

            $scope.marker = new google.maps.Marker({
                  position: initialLatLng,
                  map: map,
                  icon: markerImage,
                  animation: google.maps.Animation.DROP
              });
          }
        },
        {
          text: '<b>Yes</b>',
          type: 'button-positive',
          onTap: function(e) {
            $http({
                method: "post",
                url: "http://hoppscotch.co/person/notNew",
                headers: {'Content-Type': 'application/json'},
                data: {
                  uuid: $rootScope.uuid
                }
            })
            .success(function(data,status,header,config) {
               console.log('***MEAN***');
               //console.log(data, status, header, config);
               console.log(JSON.stringify(data));
               console.log('***MEAN***');
               // set data on each place, I'm matching by place_id, do i need this?
            })
            .error(function(data,status,headers,config){
               //console.log('***Meteor error***');
               //console.log(JSON.stringify(status));
               console.log(JSON.stringify(data));
               //console.log(JSON.stringify(headers));
               //console.log(JSON.stringify(config));
               //console.log('***Meteor error***');
            });
            $state.go('app.learn');
          }
        }
      ]
    });
  }
  $scope.areTheyNew = function () {
    $http({
        method: "post",
        url: "http://hoppscotch.co/person",
        headers: {'Content-Type': 'application/json'},
        data: {
          uuid: $rootScope.uuid
        }
    })
    .success(function(data,status,header,config) {
       //console.log('***MEAN***');
       //console.log(data, status, header, config);
       //console.log(JSON.stringify(data));
       //console.log('***MEAN***');

       if (data) {
        $scope.newHerePopup();
       }

       // set data on each place, I'm matching by place_id, do i need this?
    })
    .error(function(data,status,headers,config){
       //console.log('***Meteor error***');
       //console.log(JSON.stringify(status));
       //console.log(JSON.stringify(data));
       //console.log(JSON.stringify(headers));
       //console.log(JSON.stringify(config));
       //console.log('***Meteor error***');
    });
  }
  $timeout(function () {
    //console.log('are they new?');
    $scope.areTheyNew();
  }, 1000);

  //console.log($scope.geo.lat=="");
  $scope.$on('$routeChangeSuccess', function(next, current) {
       //console.log('Change Successful');
       //console.log(JSON.stringify(next));
       //console.log(JSON.stringify(current));
       $scope.init();
  });
  $scope.showAlert = function(title, body) {
   var alertPopup = $ionicPopup.alert({
    title: title,
     template: body
   });
  };

  $rootScope.resetMap = function() {
    google.maps.event.trigger(map, 'resize');
  };

  var clearSearchResults = function () {
    //console.log('***before***')
    //console.log($scope.searchResults.length);
    //console.log(searchResults);
    $scope.searchResults.length = 0;
    searchResults.length = 0;
    //console.log('cleared');
    //console.log('***after***')
    //console.log($scope.searchResults.length);
    //console.log(searchResults);
  };

  if (!$scope.geo.lat) {
    $scope.geo.lat = 37.766781;
    $scope.geo.long = -122.402016;

    $scope.centerCoords = new google.maps.LatLng($scope.geo.lat, $scope.geo.long);
  } else  {
    $scope.centerCoords = new google.maps.LatLng($scope.geo.lat, $scope.geo.long);
  }


  $scope.init = function (){
    var mapOptions = {
      center: $scope.centerCoords,
      zoom: 16,
      mapTypeControl: false,
      streetViewControl: false,
      navigationControl: false,
      scrollwheel: false,
      mapTypeControl: false,
      zoomControl: false,
      panControl: false,
      navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      options: {
        styles: [
          {
            "featureType": "all",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "saturation": 36
              },
              {
                "color": "#000000"
              },
              {
                "lightness": 40
              }
            ]
          },
          {
            "featureType": "all",
            "elementType": "labels.text.stroke",
            "stylers": [
              {
                "visibility": "on"
              },
              {
                "color": "#000000"
              },
              {
                "lightness": 16
              }
            ]
          },
          {
            "featureType": "all",
            "elementType": "labels.icon",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "administrative",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#000000"
              },
              {
                "lightness": 20
              }
            ]
          },
          {
            "featureType": "administrative",
            "elementType": "geometry.stroke",
            "stylers": [
              {
                "color": "#000000"
              },
              {
                "lightness": 17
              },
              {
                "weight": 1.2
              }
            ]
          },
          {
            "featureType": "landscape",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#000000"
              },
              {
                "lightness": 20
              }
            ]
          },
          {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#000000"
              },
              {
                "lightness": 21
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#000000"
              },
              {
                "lightness": 17
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [
              {
                "color": "#000000"
              },
              {
                "lightness": 29
              },
              {
                "weight": 0.2
              }
            ]
          },
          {
            "featureType": "road.arterial",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#000000"
              },
              {
                "lightness": 18
              }
            ]
          },
          {
            "featureType": "road.local",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#000000"
              },
              {
                "lightness": 16
              }
            ]
          },
          {
            "featureType": "transit",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#000000"
              },
              {
                "lightness": 19
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#000000"
              },
              {
                "lightness": 17
              }
            ]
          }
        ]
      }
    };
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    //add custom buttons for the zoom-in/zoom-out on the map
    function CustomZoomControl(controlDiv, map) {
      //grap the zoom elements from the DOM and insert them in the map
      var controlUIzoomIn= document.getElementById('cd-zoom-in'),
      controlUIzoomOut= document.getElementById('cd-zoom-out');
      controlDiv.appendChild(controlUIzoomIn);
      controlDiv.appendChild(controlUIzoomOut);

      // Setup the click event listeners and zoom-in or out according to the clicked element
      google.maps.event.addDomListener(controlUIzoomIn, 'click', function() {
        map.setZoom(map.getZoom()+1)
      });
      google.maps.event.addDomListener(controlUIzoomOut, 'click', function() {
        map.setZoom(map.getZoom()-1)
      });
    }

    var zoomControlDiv = document.createElement('div');
    var zoomControl = new CustomZoomControl(zoomControlDiv, map);

    //insert the zoom div on the top left of the map
    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(zoomControlDiv);

    // // Map Maker
    // var initialLatLng =  new google.maps.LatLng($scope.geo.lat, $scope.geo.long);
    // var markerImage = '../img/marker.png';
    //
    // var initialLocation = new google.maps.Marker({
    //       position: initialLatLng,
    //       map: map,
    //       icon: markerImage,
    //       animation: google.maps.Animation.DROP
    //   });


    // Heat Map
    $scope.setHeatMap = function() {
      //console.log('setting heat map');
      $scope.taxiData = [];
      $http({
        method: "get",
        url: "http://hoppscotch.co/places/getPoints",
        headers: {'Content-Type': 'application/json'}
      })
      .success(function(data,status,header,config) {
        //console.log('***Meteor***');
        //console.log(data, status, header, config);
        ////console.log(JSON.stringify(data));
        //console.log('***Meteor***');

        //set response data for rating to place rating.
        for (var i=0; i<data.length;i++) {
          //console.log(data[i].lat);
          $scope.taxiData.push(new google.maps.LatLng(data[i].lat, data[i].long));
        }

        // setTimeout(function () {console.log($scope.taxiData)},5000)

      })
      .error(function(data,status,headers,config){
        //console.log('***Meteor error***');
      });

      var pointArray = new google.maps.MVCArray($scope.taxiData);
      heatmap = new google.maps.visualization.HeatmapLayer({
        data: pointArray,
        gradient: [
          'rgba(0, 255, 255, 0)',
          'rgba(0, 255, 255, 1)',
          'rgba(0, 191, 255, 1)',
          'rgba(0, 127, 255, 1)',
          'rgba(0, 63, 255, 1)',
          'rgba(0, 0, 255, 1)',
          'rgba(0, 0, 223, 1)',
          'rgba(0, 0, 191, 1)',
          'rgba(0, 0, 159, 1)',
          'rgba(0, 0, 127, 1)',
          'rgba(63, 0, 91, 1)',
          'rgba(127, 0, 63, 1)',
          'rgba(191, 0, 31, 1)',
          'rgba(255, 0, 0, 1)'
        ]
      });
      heatmap.setMap(null);
      $timeout(function () {
        heatmap.setMap(map);
      },500);

      // refresh marker and geolocation
      //refresh geolocation
      // if ($rootScope.initialLoad) {
      //   $cordovaGeolocation
      //     .getCurrentPosition(posOptions)
      //     .then(function (position) {
      //       //console.log(position);
      //       $rootScope.initialGeo = position;
      //
      //       $scope.geo.lat = $rootScope.initialGeo.coords.latitude;
      //       $scope.geo.long = $rootScope.initialGeo.coords.longitude;
      //
      //       $rootScope.actualLat = $rootScope.initialGeo.coords.latitude;
      //       $rootScope.actualLong = $rootScope.initialGeo.coords.longitude;
      //       console.log('from before clicked somewhere' + JSON.stringify($scope.geo));
      //       $rootScope.initialLoad = true;
      //
      //     }, function(err) {
      //       // error
      //       console.log(err);
      //     });
      //   //refresh marker
      //   $scope.marker.setMap(map);
      //   var initialLatLng =  new google.maps.LatLng($rootScope.initialGeo.coords.latitude, $rootScope.initialGeo.coords.longitude);
      //   var markerImage = 'img/marker_sm.png';
      //
      //   $scope.marker = new google.maps.Marker({
      //         position: initialLatLng,
      //         map: map,
      //         icon: markerImage,
      //         animation: google.maps.Animation.DROP
      //     });
      //     $scope.marker.setMap(map);
      // }
    }
    $scope.refreshMap = function () {
      $scope.setHeatMap();
      //get geolocation
      if ($rootScope.initialLoad) {
        $cordovaGeolocation
          .getCurrentPosition(posOptions)
          .then(function (position) {
            console.log(position);
            $rootScope.initialGeo = position;

            $scope.geo.lat = $rootScope.initialGeo.coords.latitude;
            $scope.geo.long = $rootScope.initialGeo.coords.longitude;

            $rootScope.actualLat = $rootScope.initialGeo.coords.latitude;
            $rootScope.actualLong = $rootScope.initialGeo.coords.longitude;
            console.log('from before clicked somewhere' + JSON.stringify($scope.geo));
            $rootScope.initialLoad = true;

          }, function(err) {
            // error
            console.log(err);
          });
        //refresh marker
        $scope.marker.setMap(null);
        var initialLatLng =  new google.maps.LatLng($rootScope.initialGeo.coords.latitude, $rootScope.initialGeo.coords.longitude);
        var markerImage = 'img/marker_sm.png';

        $scope.marker = new google.maps.Marker({
              position: initialLatLng,
              map: map,
              icon: markerImage,
              animation: google.maps.Animation.DROP
          });
          $scope.marker.setMap(map);
      }
      // reset center
      // set new marker
    }
    $scope.setHeatMap();

    google.maps.event.addListener(map, 'idle', function () {
      console.log('resizing while map is idle');

      google.maps.event.trigger(map, 'resize');

    });

    google.maps.event.addListener(map, 'click', function (event) {
      google.maps.event.trigger(map, 'resize');
      $scope.clickedLat = event.latLng.lat();
      $scope.clickedLng = event.latLng.lng();
      console.log('clicked lat' + $scope.clickedLat + ' long ' + $scope.clickedLng );

      var bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng($scope.clickedLat, $scope.clickedLng),
        new google.maps.LatLng(37.744546, -122.433523));
        $scope.geo.lat = null;
        $scope.geo.long = null;
        $scope.geo.lat = $scope.clickedLat;
        $scope.geo.long = $scope.clickedLng;
        $rootScope.clickedSomewhere = true;
        console.log("Setting Root Scope Clicked Somewhere :" + JSON.stringify($scope.geo));
        $scope.centerCoords = new google.maps.LatLng($scope.clickedLat,$scope.clickedLng)

        // console.log(JSON.stringify($scope.centerCoords));
        // console.log($scope.geo.lat);
        // console.log($scope.geo.long);
        // console.log(JSON.stringify(geo));
        map.panTo(new google.maps.LatLng($scope.clickedLat,$scope.clickedLng))
        //map.setCenter(new google.maps.LatLng($scope.clickedLat,$scope.clickedLng));
        //$scope.init();

        $scope.centerCoords = new google.maps.LatLng($scope.clickedLat,$scope.clickedLng);
        map.setCenter(new google.maps.LatLng($scope.geo.lat,$scope.geo.long));

        // google.maps.panTo(new google.maps.LatLng($scope.clickedLat, $scope.clickedLng));

        var pyrmont = new google.maps.LatLng($scope.clickedLat, $scope.clickedLng);
        var request = {
          location: pyrmont,
          radius: 250,
          types: ['night_club', 'bar','restaurant']
        };
        function callback(results, status) {
          clearSearchResults();
          //console.log(results.length);
          $ionicLoading.show();

          if (results.length == 0) {
            //alert('no places there!');
            console.log('no places')
            $scope.showAlert('There\'s nothing there!', 'Try tapping somewhere else.');
            //console.log('no places')
            $ionicLoading.hide();
          }

          $timeout(function () {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
              if (results.length == 0) {
                //alert('no places there!');
                console.log('no places')
                $scope.showAlert('There\'s nothing there!', 'Try tapping somewhere else.');
                $ionicLoading.hide();
              } else {

                for (var i = 0; i < results.length; i++) {
                  $scope.searchResults.push({
                    'name': results[i].name,
                    'address': results[i].vicinity,
                    'icon': results[i].icon,
                    'place_id': results[i].place_id,
                    'latLng': {
                      'lat': results[i].geometry.location.k,
                      'long': results[i].geometry.location.D
                    },
                    'comments': 0,
                    'rating':   0,
                    'checkins': 0,
                  })
                }

                var place_ids = [];
                for (var i=0; i<$scope.searchResults.length; i++) {
                  place_ids.push({"place_id": $scope.searchResults[i].place_id, "name": $scope.searchResults[i].name})
                }

                $http({
                  method: "post",
                  url: "http://hoppscotch.co/places",
                  headers: {'Content-Type': 'application/json'},
                  data: {
                    places: place_ids
                  }
                })
                .success(function(data,status,header,config) {
                  //console.log('***Meteor***');
                  //console.log(data, status, header, config);
                  //console.log(JSON.stringify(data));
                  //console.log('***Meteor***');

                  // set data on each place, I'm matching by place_id, do i need this?
                  for (var i=0; i<$scope.searchResults.length; i++) {
                    for (var j=0; j<data.length; j++) {
                      if ($scope.searchResults[i].place_id == data[j].place_id) {
                        //console.log(JSON.stringify(data[j].place_id));
                        //console.log("*** Data Match ***");

                        $scope.searchResults[i].checkins = data[j].checkins;
                        $scope.searchResults[i].comments = data[j].comments;
                        $scope.searchResults[i].rating   = data[j].rating;
                        $scope.searchResults[i]._id      = data[j]._id;

                      }
                    }
                  }
                })
                .error(function(data,status,headers,config){
                  //console.log('***Meteor error***');
                  //console.log(JSON.stringify(status));
                  //console.log(JSON.stringify(data));
                  //console.log(JSON.stringify(headers));
                  //console.log(JSON.stringify(config));
                  //console.log('***Meteor error***');
                });
                $timeout(function() {
                  $ionicLoading.hide();
                  $state.go('app.places');
                },500);
              }
            }
          },100);

        }
        infowindow = new google.maps.InfoWindow();
        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, callback);
      });
    };

  function getGeoLocation(){
      var success = function(position) {
          map.panTo(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
      }
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(success, null);
      }
  };

  var pointarray, heatmap;

  // get points and push them to taxi Data
  var getPoints = function () {

    $http({
      method: "get",
      url: "http://hoppscotch.co/places/getPoints",
      headers: {'Content-Type': 'application/json'}
    })
    .success(function(data,status,header,config) {
     //console.log('***Meteor***');
     //console.log(data, status, header, config);
     ////console.log(JSON.stringify(data));
     //console.log('***Meteor***');

     //set response data for rating to place rating.
     for (var i=0; i<data.length;i++) {
       //console.log(data[i].lat);
       $scope.taxiData.push(new google.maps.LatLng(data[i].lat, data[i].long));
     }
    })
    .error(function(data,status,headers,config){
     //console.log('***Meteor error***');
     //console.log(JSON.stringify(status));
     //console.log(JSON.stringify(data));
     //console.log(JSON.stringify(headers));
     //console.log(JSON.stringify(config));
     //console.log('***Meteor error***');
   });
  }

})
.controller('LearnCtrl', function($scope, $state, $timeout, geo, $ionicLoading) {
  console.log('learning!');
});
