// KOS Security
define(['jquery', 'angularAMD', 'ngSanitize'], function ($, angularAMD) {

    var kosSecurity = angular.module("kos.security", ['ipCookie']);

    kosSecurity.constant('AUTH_ENDPOINTS', {
        LOGOUT  : 'security/logout',
        LOGIN   : 'security/login',
        PROFILE : 'security/profile',
        PASSWORD_CHANGE : 'security/password'
    });

    kosSecurity.constant('AUTH_EVENTS', {
        loginSuccess : 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized'
    });

    kosSecurity.config(function($httpProvider, $stateProvider){
        $stateProvider.state('main', {
            url: '/',
            access : { requiredLogin : false}
        });

        $stateProvider.state('editProfile',{
            access : { requiredLogin : true},
            templateUrl : 'kosResource/ui/passwordReset.jade',
            controller  : 'ProfileSettingsController'
        });
    
        $httpProvider.interceptors.push(['$injector', function($injector){
            return $injector.get('AuthInterceptor');
        }]);
    });

    kosSecurity.controller('ProfileSettingsController', ['$scope', '$http', 'AuthService', 'AUTH_ENDPOINTS',
    function($scope, $http, AuthService, AUTH_ENDPOINTS) {
        
        if (!AuthService.isAuthenticated()) $location.path('/');

        $scope.passwordDetails = {};
            
        // Change user password
        $scope.changeUserPassword = function() {
            $scope.success = $scope.error = null;
            $http.post(AUTH_ENDPOINTS.PASSWORD_CHANGE, $scope.passwordDetails).success(function(response) {
                $scope.success = true;
                $scope.passwordDetails = null;
            }).error(function(response) {
                $scope.error = response.message;
            });
        };
    }
]);

    kosSecurity.factory('AuthResolver',
        ['$q', '$rootScope', '$state', function ($q, $rootScope, $state) {
        return {
            resolve: function () {
                var deferred = $q.defer();
                var unwatch = $rootScope.$watch('currentUser', function (currentUser) {
                if (angular.isDefined(currentUser)) {
                    if (currentUser) {
                        deferred.resolve(currentUser);
                    } else {
                        deferred.reject();
                        $state.go('user-login');
                    }
                    unwatch();
                }
              });
              return deferred.promise;
            }
        };
    }]);





    kosSecurity.factory('AuthInterceptor', ['$rootScope', '$q', 'AUTH_EVENTS', function($rootScope, $q, AUTH_EVENTS){
        return {
            responseError: function (response) {
                $rootScope.$broadcast({
                    401: AUTH_EVENTS.notAuthenticated,
                    403: AUTH_EVENTS.notAuthorized,
                    419: AUTH_EVENTS.sessionTimeout,
                    440: AUTH_EVENTS.sessionTimeout
                }[response.status], response);
                return $q.reject(response);
            }
        };
    }]);

    kosSecurity.service('Session', function () {
        this.create = function (sessionId, userId, loginName, userRoles, personId) {
            this.id = sessionId;
            this.userId = userId;
            this.loginName = loginName;
            this.userRoles = userRoles;
            this.loggedIn = true;
            this.personId = personId;
        };
        this.destroy = function () {
            this.id = null;
            this.userId = null;
            this.userRoles = null;
            this.loginName = null;
            this.loggedIn = false;
            this.personId = null;
        };
    });
    
    kosSecurity.factory('AuthService', ['$http', 'Session', 'AUTH_ENDPOINTS', '$rootScope', 'AUTH_EVENTS',
        function($http, Session, AUTH_ENDPOINTS, $rootScope, AUTH_EVENTS){

        var authService = {};

        authService.login = function(credentials){
            return $http
                .post(AUTH_ENDPOINTS.LOGIN, credentials)
                .then(function(res){
                    Session.create(
                        res.data.token,
                        res.data._id || res.data.userId || res.data.id,
                        res.data.displayName || res.data.username,
                        res.data.roles,
                        res.data.personId);
                    return res.data;
                });
        };

        authService.logout = function(credentials){
            return $http
                .get(AUTH_ENDPOINTS.LOGOUT)
                .then(function(res){
                    Session.destroy();
                    return true;
                });
        };


        authService.isAuthenticated = function(){
            return Session.loggedIn;
        };

        authService.isAuthorized = function (authorizedRoles) {
            if (!authorizedRoles || !authorizedRoles.length)
                return true;

            if (!angular.isArray(authorizedRoles)) {
                authorizedRoles = [authorizedRoles];
            }
            if(!authService.isAuthenticated())
                return false;
            var found = false;
            for(var i in Session.userRoles)
                if(authorizedRoles.indexOf(Session.userRoles[i]) !== -1){
                    found = true;
                    break;
                }
            return found;
        };

        authService.restore = function(){
            $http.get(AUTH_ENDPOINTS.PROFILE)
                .success(function(user){
                    Session.create(
                        user.token,
                        user._id || user.userId || user.id,
                        user.displayName || user.username,
                        user.roles,
                        user.personId);
                    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                })
                .error(function(data){
                    
                });
        };

        authService.getLoginName = function(){
            return Session.loginName;
        };

        authService.getUserId = function(){
            return Session.userId;
        };
        authService.getRoles = function(){
            return Session.userRoles;
        };

        authService.getPersonId = function(){
            return Session.personId;
        };
 
        return authService;
    }]);

    kosSecurity.controller('LoginController',
        ['$scope', '$http', '$rootScope', 'AUTH_EVENTS', 'AuthService',
    function($scope, $http,  $rootScope, AUTH_EVENTS, AuthService){
        $scope.credentials = {
            identifier  : '',
            password    : ''
        };
        $scope.login = function(credentials){
            $scope.loginLoader = true;
            AuthService.login(credentials).then(function(user){
                $scope.loginLoader = false;
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            }, function(){
                $scope.loginLoader = false;
                $scope.loginFailedMessage = true;
                $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
            });
        };

        $scope.loginInfo;
        $http.get('config').success(function(data) {
            if(data.info) {
                $scope.loginInfo    = data.info.loginInfo;
                $scope.loginHeader = data.info.loginHeader;
            }
            $scope.loginStrategy = data.loginType;

        });
    }]);

    kosSecurity.directive('userAccountMenu', function() {
        return {
            restrict    : 'E',
            replace     : true,
            templateUrl : 'kosResource/ui/userAccountMenu.jade',
            controller  : 'NavBarController'
        }
    });
    kosSecurity.controller('NavBarController', [
        '$rootScope', '$scope', '$window', 'AuthService', '$state', '$location', '$modal', 'AUTH_EVENTS',
        function($rootScope, $scope, $window, AuthService, $state, $location, $modal, AUTH_EVENTS){
            
            $scope.loggedIn     = AuthService.isAuthenticated;
            $scope.getRoles     = AuthService.getRoles;
            $scope.getLoginName = AuthService.getLoginName;
            
            $scope.userId       = AuthService.getUserId;
            
            $scope.logout = function() {
                if (AuthService.isAuthenticated()) {
                    AuthService.logout().then(function(user){
                        $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
                    });
                }
            };

            $scope.class = function(){
                switch($scope.getLoginName()){
                    case "shin":
                        return 'octa';
                    default:
                        return 'hexa';
                }
            };

            $scope.src = function(){
                var host_url  = 'http://disi.unitn.it/~knowdive/assets/Members/';
                switch($scope.getLoginName()){
                    case "shin":
                        return host_url + 'bux.jpg';
                    case 'fausto':
                        return host_url + "fausto_giunchiglia.jpg";
                    case "enzo":
                    case "maltese":
                        return host_url + "maltese.jpg";
                    case "stella" :
                        return host_url + 'margonar.png';
                    default:
                        return 'img/knowdive_logo_small.png';
                }
            };
        }
    ]);
});
