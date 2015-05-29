angular.module('operator',[]).factory('Operator',function($rootScope){
	var cart = {
		init: function(customer){
			localStorage.setItem("customer",JSON.stringify(customer));
			localStorage.setItem("customer_address",JSON.stringify([]));
			$rootScope.$broadcast('state.login');
		},
		login: function(info){
      var d = new Date();
      sessionStorage.setItem("operator_type", info.operator_type);
      sessionStorage.setItem("operator_name", info.operator_name);
      sessionStorage.setItem("operator_login", info.login);
      sessionStorage.setItem("operator_time", d.getTime());
		},
    checkLogin : function() {
      if(sessionStorage.operator_login)
        return true;
      else {
        return false;
      }
    },
		logout : function(){
      sessionStorage.removeItem("operator");
		}
	}
	return cart;
});
