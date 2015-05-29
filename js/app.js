var app = angular.module('indexApp',['ui.router','operator','ui.bootstrap']);

app.run(function ($rootScope,$state,Operator) {
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
    var requireLogin = toState.data.requireLogin;
    $rootScope.statename = toState.name;
    var isLogged = Operator.checkLogin();
    if (requireLogin && !isLogged) {
      event.preventDefault();
      $rootScope.statename = 'login';
      console.log('not authorized');
      $state.go('login');

    } else {
      console.log("authorized");
    }
  });
});

app.config(function($stateProvider,$urlRouterProvider){
  $urlRouterProvider.otherwise("/");
  $stateProvider.state('login', {
    url: "/",
    templateUrl: "login.html",
    controller: 'loginCtrl',
    data : {
      requireLogin : false
    }
  }).state('pending',{
    url: "/protected",
    templateUrl : 'pending.html',
    controller : 'pendingCtrl',
    data : {
      requireLogin : true
    }
  }).state('export',{
    url: "/export/:time",
    templateUrl : 'export.html',
    controller : 'exportCtrl',
    data : {
      requireLogin : true
    }
  }).state('box',{
    url: "/box",
    templateUrl : 'box.html',
    controller : 'boxCtrl',
    data : {
      requireLogin : true
    }
  }).state('menu',{
    url: "/menu/",
    templateUrl : 'menu.html',
    controller : 'menuCtrl',
    data : {
      requireLogin : true
    }
  }).state('menu-edit',{
    url: "/menu-edit/:menu_id",
    templateUrl : 'menu_edit.html',
    controller : 'menuEditCtrl',
    data : {
      requireLogin : true
    }
  });
});

app.controller('loginCtrl',function($scope,$rootScope,$state,$http,Operator){
  $scope.data = {};
  $scope.errorLogin = false;

  $scope.login = function(userlogin) {
    $scope.errorLogin = false;
    $scope.data = angular.copy(userlogin);
    var shaObj = new jsSHA($scope.data.password, "TEXT");
  	var hash = shaObj.getHash("SHA-1", "HEX");
    $scope.data.password = hash;
    $http.post("http://128.199.236.141:7000/bo/login/", $scope.data).success(function(data, status) {
      if(data.login == 1) {
        Operator.login(data.info);
        $state.go('pending');
      } else {
        $scope.errorLogin = true;
      }
    });
  };
});

app.controller('pendingCtrl',function($scope,$http,$window){
  $scope.data = {};
  $scope.title = "Current Week";
  $http.get("http://128.199.236.141:7000/bo/order/").success(function(data, status) {
    $scope.data = JSON.parse(data);
  });

  $scope.getNext = function() {
    $http.get("http://128.199.236.141:7000/bo/order/next").success(function(data, status) {
      $scope.data = JSON.parse(data);
      $scope.title = "Next Week";
    });
  };

  $scope.getCurrent = function() {
    $http.get("http://128.199.236.141:7000/bo/order/").success(function(data, status) {
      $scope.data = JSON.parse(data);
      $scope.title = "Current Week";
    });
  };

  $scope.markPaid = function(order_id) {
    var order_id = order_id;
    $http.post("http://128.199.236.141:7000/bo/order/paid/", { "order_id" : order_id} ).success(function(data, status) {
      $http.get("http://128.199.236.141:7000/bo/order/next").success(function(data, status) {
        $scope.data = JSON.parse(data);
        $scope.title = "Next Week";
      });
    });
  };
  $scope.markCancel = function(order_id) {
    var order_id = order_id;
    $http.post("http://128.199.236.141:7000/bo/order/cancel/", { "order_id" : order_id} ).success(function(data, status) {
      $http.get("http://128.199.236.141:7000/bo/order/next").success(function(data, status) {
        $scope.data = JSON.parse(data);
        $scope.title = "Next Week";
      });
    });
  };
  $scope.markComplete = function(order_id){
    var order_id = order_id;
    $http.post("http://128.199.236.141:7000/bo/order/complete/", { "order_id" : order_id} ).success(function(data, status) {
      $http.get("http://128.199.236.141:7000/bo/order/").success(function(data, status) {
        $scope.data = JSON.parse(data);
        $scope.title = "Current Week";
      });
    });
  };
  $scope.exportCSV = function () {
      if($scope.title == "Current Week")
        $window.location.href = "http://128.199.236.141:7000/bo/orderdl/current"
      else
        $window.location.href = "http://128.199.236.141:7000/bo/orderdl/next";
  };
});

app.controller('exportCtrl',function($scope,$http){
  $scope.data = {};
  $http.get("http://128.199.236.141:7000/bo/order/").success(function(data, status) {
    $scope.data = JSON.parse(data);
  });
});

app.controller('menuCtrl',function($scope,$http){
  $scope.data = {};
  $http.get("http://128.199.236.141:7000/bo/menu/").success(function(data, status) {
    $scope.data = JSON.parse(data);
  });
});

app.controller('boxCtrl',function($scope,$http){
  $scope.data = {};
  $http.get("http://128.199.236.141:7000/bo/box/").success(function(data, status) {
    $scope.data = JSON.parse(data);
  });
});

app.controller('menuEditCtrl',function($scope,$http,$stateParams) {
  $scope.menu_id = $stateParams.menu_id;
  $scope.data = {};
  $http.get("http://128.199.236.141:7000/bo/menu/" + $scope.menu_id).success(function(data, status) {
    $scope.data = JSON.parse(data);
  });
});
