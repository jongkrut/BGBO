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
  }).state('menu-new',{
    url: "/menu-new/",
    templateUrl : 'menu_new.html',
    controller : 'menuNewCtrl',
    data : {
      requireLogin : true
    }
  }).state('recipe-edit',{
    url: "/recipe-edit/:menu_id",
    templateUrl : 'recipe_edit.html',
    controller : 'recipeCtrl',
    data : {
      requireLogin : true
    }
  }).state('ordering', {
    url: "/ordering/",
    templateUrl : 'ordering.html',
    controller : 'orderingCtrl',
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
    $http.post("http://api.blackgarlic.id:7000/bo/login/", $scope.data).success(function(data, status) {
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

  $scope.timerange = moment().startOf('week').format('YYYY-MM-DD');
  $scope.title = "Week of " + $scope.timerange;

  $http.get("http://api.blackgarlic.id:7000/bo/order/week/" + $scope.timerange).success(function(data, status) {
    $scope.data = JSON.parse(data);
    console.log(data);
  });

  $scope.getNext = function() {
    $scope.timerange = moment($scope.timerange).add(1,'w').format('YYYY-MM-DD');
    $http.get("http://api.blackgarlic.id:7000/bo/order/week/"+$scope.timerange).success(function(data, status) {
      $scope.data = JSON.parse(data);
      $scope.title = "Week of " + $scope.timerange;
    });
  };

  $scope.getCurrent = function() {
    $scope.timerange = moment($scope.timerange).subtract(1,'w').format('YYYY-MM-DD');
    $http.get("http://api.blackgarlic.id:7000/bo/order/week/"+$scope.timerange).success(function(data, status) {
      $scope.data = JSON.parse(data);
      $scope.title = "Week of " + $scope.timerange;

    });
  };

  $scope.markPaid = function(order_id) {
    var order_id = order_id;
    $http.post("http://api.blackgarlic.id:7000/bo/order/paid/", { "order_id" : order_id} ).success(function(data, status) {
      $http.get("http://api.blackgarlic.id:7000/bo/order/week/"+$scope.timerange).success(function(data, status) {
        $scope.data = JSON.parse(data);
      });
    });
  };
  $scope.markCancel = function(order_id) {
    var order_id = order_id;
    $http.post("http://api.blackgarlic.id:7000/bo/order/cancel/", { "order_id" : order_id} ).success(function(data, status) {
      $http.get("http://api.blackgarlic.id:7000/bo/order/week/"+$scope.timerange).success(function(data, status) {
        $scope.data = JSON.parse(data);
      });
    });
  };
  $scope.markComplete = function(order_id){
    var order_id = order_id;
    $http.post("http://api.blackgarlic.id:7000/bo/order/complete/", { "order_id" : order_id} ).success(function(data, status) {
      $http.get("http://api.blackgarlic.id:7000/bo/order/week/"+$scope.timerange).success(function(data, status) {
        $scope.data = JSON.parse(data);
      });
    });
  };
  $scope.markDelivery = function(order_id){
    var order_id = order_id;
    $http.post("http://api.blackgarlic.id:7000/bo/order/delivery/", { "order_id" : order_id} ).success(function(data, status) {
      console.log(data);
    });
  };
  $scope.exportCSV = function () {
    $window.location.href = "http://api.blackgarlic.id:7000/bo/orderdl/" + $scope.timerange;
  };
  $scope.test = function() {
      $http.post("http://api.blackgarlic.id:7000/bo/order/test/", { "order_id" : 1} ).success(function(data, status) {
          console.log(data);
      });
  };
});

app.controller('exportCtrl',function($scope,$http){
  $scope.data = {};
  $http.get("http://api.blackgarlic.id:7000/bo/order/").success(function(data, status) {
    $scope.data = JSON.parse(data);
  });
});

app.controller('menuCtrl',function($scope,$http,$state){
  $scope.data = {};
  $http.get("http://api.blackgarlic.id:7000/bo/menu/").success(function(data, status) {
    $scope.data = JSON.parse(data);
  });
  $scope.newMenu = function(){
    $state.go('menu-new');
  };
  $scope.activate = function(id){
    $http.get("http://api.blackgarlic.id:7000/bo/menu/recipe/activate/"+id).success(function(data, status) {
      $scope.data = JSON.parse(data);
    });
  }
  $scope.deactivate = function(id){
    $http.get("http://api.blackgarlic.id:7000/bo/menu/recipe/deactivate/"+id).success(function(data, status) {
      $scope.data = JSON.parse(data);
    });
  }
});

app.controller('boxCtrl',function($scope,$http){
  $scope.data = {};
  $http.get("http://api.blackgarlic.id:7000/bo/box/").success(function(data, status) {
    $scope.data = JSON.parse(data);
  });
});

app.controller('menuEditCtrl',function($scope,$http,$stateParams,$modal) {
  $scope.menu_id = $stateParams.menu_id;
  $scope.data = {};
  $scope.newIngr = {};$scope.newIngr.addToUsedIngr=true;
  $scope.ingredients = {};
  $scope.usedIngr = {};
  $scope.editted = false;

  $http.get("http://api.blackgarlic.id:7000/bo/menu/" + $scope.menu_id).success(function(data, status) {
    $scope.data = JSON.parse(data);
    $scope.usedIngr = $scope.data[1].ingredients;

    $http.get("http://api.blackgarlic.id:7000/bo/ingredient/").success(function(data, status) {
      $scope.ingredients = JSON.parse(data).filter(function(val){
        for(var i = 0;i<$scope.usedIngr.length;i++) {
          if(val.ingredient_id == $scope.usedIngr[i].ingredient_id)
            return false;
        }
        return true;
      });
    });
  });

  $scope.openModal = function () {
    $scope.modal = $modal.open({
      animation: true,
      scope : $scope,
      templateUrl: 'ModalIngredient.html',
      size: 'lg',
    });
  };
  $scope.closeModal = function() {
    $scope.modal.close();
  };
  $scope.saveIngredient = function(){
    $http.post("http://api.blackgarlic.id:7000/bo/ingredient/", $scope.newIngr).success(function(data, status) {
      if($scope.newIngr.addToUsedIngr==true)
        $scope.usedIngr.push({"ingredient_name":$scope.newIngr.ingredient_name , "ingredient_id" : data.id});
      else
        $scope.ingredients.push({"ingredient_name":$scope.newIngr.ingredient_name , "ingredient_id" : data.id});
      $scope.newIngr = {};
      $scope.modal.close();
    });
  };

  $scope.addToList = function(ingred) {
    $scope.ingredients.splice($scope.ingredients.indexOf(ingred),1);
    $scope.usedIngr.push(ingred);
    $scope.editted = true;
  };

  $scope.removeFromList = function(ingred) {
    $scope.usedIngr.splice($scope.usedIngr.indexOf(ingred),1);
    $scope.ingredients.push(ingred);
    $scope.editted = true;
  };

  $scope.saveIngredients = function() {
    var data = { "menu_id": $scope.menu_id,"ingredients" : [] };
    for(var i = 0 ; i < $scope.usedIngr.length;i++) {
      data.ingredients.push({ "ingredient_id" : $scope.usedIngr[i].ingredient_id});
    }
    $http.post("http://api.blackgarlic.id:7000/bo/menu/ingredient/", data).success(function(data, status) {
      $scope.editted = false;
    });
  };
});


app.controller('menuNewCtrl',function($scope,$http,$modal) {
  $scope.data = {};
  $scope.newIngr = {};$scope.newIngr.addToUsedIngr=true;
  $scope.ingredients = {};
  $scope.usedIngr = [];

  $http.get("http://api.blackgarlic.id:7000/bo/ingredient/").success(function(data, status) {
    $scope.ingredients = JSON.parse(data);
  });

  $scope.openModal = function () {
    $scope.modal = $modal.open({
      animation: true,
      scope : $scope,
      templateUrl: 'ModalIngredient.html',
      size: 'lg',
    });
  };
  $scope.closeModal = function() {
    $scope.modal.close();
  };
  $scope.saveIngredient = function(){
    $http.post("http://api.blackgarlic.id:7000/bo/ingredient/", $scope.newIngr).success(function(data, status) {
      if($scope.newIngr.addToUsedIngr==true)
        $scope.usedIngr.push({"ingredient_name":$scope.newIngr.ingredient_name , "ingredient_id" : data.id});
      else
        $scope.ingredients.push({"ingredient_name":$scope.newIngr.ingredient_name , "ingredient_id" : data.id});
      $scope.newIngr = {};
      $scope.modal.close();
    });
  };

  $scope.addToList = function(ingred) {
    $scope.ingredients.splice($scope.ingredients.indexOf(ingred),1);
    $scope.usedIngr.push(ingred);
  };

  $scope.removeFromList = function(ingred) {
    $scope.usedIngr.splice($scope.usedIngr.indexOf(ingred),1);
    $scope.ingredients.push(ingred);
  };

  $scope.saveMenu = function() {
    $scope.data.ingredient = $scope.usedIngr;
    console.log(JSON.stringify($scope.data));
  };
});

app.controller('recipeCtrl',function($scope,$http,$stateParams,$modal,$state) {
  $scope.menu_id = $stateParams.menu_id;
  $scope.steps = {};
  $scope.form = {};
  $scope.form.steps = {};

  $http.get("http://api.blackgarlic.id:7000/bo/menu/recipe/"+$scope.menu_id, $scope.newIngr).success(function(data, status) {
      $scope.steps = JSON.parse(data);
  });

  $scope.saveThisStep = function() {
    var as = angular.copy($scope.form.steps);
    var done = 0;
    for(var i = 0; i < $scope.steps.length;i++)
    {
      if($scope.steps[i].steps_order == as.num) {
        $scope.steps[i].steps_order = as.num;
        $scope.steps[i].content_id = as.ind;
        $scope.steps[i].content_en = as.eng;
        done = 1;
        break;
      }
    }
    if(done == 0) {
      $scope.steps.push({
        "steps_order" : as.num, "menu_id" : $scope.menu_id, "content_id" : as.ind, "content_en" : as.eng
      });
    }

    $scope.form.steps = {};
  };

  $scope.editStep = function(step) {
    console.log(step);
    $scope.form.steps.num = $scope.steps[step-1].steps_order;
    $scope.form.steps.ind = $scope.steps[step-1].content_id;
    $scope.form.steps.eng = $scope.steps[step-1].content_en;
  };

  $scope.saveSteps = function() {
    var datastring = { "menu_id" : $scope.menu_id, "steps" : $scope.steps};
    $http.post("http://api.blackgarlic.id:7000/bo/menu/recipe/", datastring).success(function(data, status) {
      $state.go('menu');
    });
  };

});

app.controller('orderingCtrl',function($scope,$http,$filter,$state){
  $scope.minDate = new Date();
  $scope.data = {};
  $scope.data.newAddr = 0;
  $scope.data.email = "";
  $scope.form = {};
  $scope.form.address = {};
  $scope.form.menu = {};
  $scope.customer = {};
  $scope.customer.customer = {};
  $scope.customerFound = false;
  $scope.customerFindError = "";
  $scope.package = 1;
  $scope.menus = {};

  $scope.findCustomer = function() {
      var sendData = {"customer_email" : $scope.data.email};
      $http.post("http://api.blackgarlic.id:7000/bo/customer/", sendData).success(function(data, status) {
          if(data.customer == 0 ) {
              $scope.customerFound = false;
              $scope.customerFindError = "Email Not Found";
          } else {
              $scope.customer.customer = JSON.parse(data.customer);
              if(data.address != 0)
                $scope.customer.address = JSON.parse(data.address);
              else
                $scope.customer.address = {};

              $scope.customerFound = true;
              $scope.customerFindError = "";
          }
      });
  };
  $scope.getMenu = function() {
    var date = $filter('date')($scope.data.order_date,'yyyy-MM-dd');
    $http.get("http://api.blackgarlic.id:7000/bo/menu/ordering/"+$scope.package+"/"+date).success(function(data, status) {
        $scope.menus = JSON.parse(data);
    });
  };

  $scope.placeOrder = function(){
      for(var item in $scope.form.menu){
        console.log($scope.form.menu[item]);
      }
      var menuSel = Object.keys($scope.form.menu);
      var grandtotal = 0;
      for(var i =0;i<$scope.menus.length;i++){
        if(menuSel.indexOf($scope.menus[i].menu_id.toString()) != -1){
            if($scope.menus[i].menu_type == 1) {
              grandtotal += 100000;
            } else {
              grandtotal += 150000;
            }
        }
      }

      console.log(grandtotal);

      var sendData = { "box_type" : $scope.package, "customer_id" : $scope.customer.customer.customer_id, "order_date" : $filter('date')($scope.data.order_date,'yyyy-MM-dd'), "menu" : Object.keys($scope.form.menu)}
      if($scope.data.newAddr == 0) {
        sendData.address = $scope.customer.address;
        sendData.address.customer_name = $scope.customer.customer.first_name + " " + $scope.customer.customer.last_name;
      } else {
        sendData.address = $scope.form.address;
      }


/*
      $http.post("http://api.blackgarlic.id:7000/bo/order/", sendData).success(function(data, status) {
          $state.go('pending');
      });
*/
  };
});
