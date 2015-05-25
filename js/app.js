var app = angular.module('indexApp',['ui.router']);

app.config(function($stateProvider,$urlRouterProvider){
  $urlRouterProvider.otherwise("/");
  $stateProvider.state('state1', {
    url: "/",
    templateUrl: "login.html",
    controller: 'loginCtrl',
    data : {
      requireLogin : false
    }
  }).state('state2',{
    url: "/protected",
    templateUrl : 'pending.html',
    controller : 'pendingCtrl',
    data : {
      requireLogin : true
    }
  });
});

app.controller('loginCtrl',function($scope,$rootScope,$state,$http){

  $scope.login = function(userlogin) {
    $http.post("http://128.199.236.141:7000/bo/login/", userlogin).success(function(data, status) {
              console.log(data);
      /*
    $rootScope.currentUser = userlogin.username;
    $state.go('state2');
    */
    });
  };
});

app.controller('pendingCtrl',function($scope){


});

app.run(function ($rootScope,$state) {

  $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
    var requireLogin = toState.data.requireLogin;

    if (requireLogin && typeof $rootScope.currentUser === 'undefined') {
      event.preventDefault();
      // get me a login modal!
      console.log('not authorized');
      $state.go('state1');
    }
  });

});
