// KOS Arbalest
define(['jquery', 'angularAMD'], function ($, angularAMD) {

    var arbalest = angular.module('kos.arbalest', []);

    arbalest.factory('ArbalestService', ['$http', function($http){
        var instance = {};

        instance.getOptions = function(applicationName){
            return $http.get('arbalest/appOptions/' + applicationName);
        };
        
        instance.getApplications = function(level){
            level = level || 1;
            return $http.get('arbalest/applications/' + level);
        };

        return instance;
    }]);

    arbalest.config([
        '$stateProvider',
        '$locationProvider',
        '$controllerProvider',
        '$compileProvider',
        '$filterProvider',
        '$provide',
        '$urlRouterProvider',
        function($stateProvider, $locationProvider, $controllerProvider, $compileProvider,
            $filterProvider, $provide, $urlRouterProvider)
        {
            arbalest.requireControllerFile = function(appName, controllerName){
                return 'arbalest/appControllers/' + appName + '/' + controllerName;
            };

            arbalest.requireResourceFile = function(appName, resourceName){
                return 'arbalest/appResource/' + appName + '/' + resourceName;
            };

            arbalest.buildControllerName = function(applicationName, controllerName){
                return applicationName + '::' + controllerName;
            };

            arbalest.kosController = function(applicationName, controllerName, parameters){
                return $controllerProvider.register(arbalest.buildControllerName(applicationName, controllerName), parameters);
            };

            arbalest.createApplication = function(applicationName, dependencies){
                return angular.module(applicationName, dependencies);
            };
            
            arbalest.controller = $controllerProvider.register;
            arbalest.directive  = $compileProvider.directive;
            arbalest.filter     = $filterProvider.register;
            arbalest.factory    = $provide.factory;
            arbalest.service    = $provide.service;
            arbalest.value      = $provide.value;
            arbalest.constant   = $provide.constant;

            arbalest.version    = '0.1.0';

        }]);

    return arbalest;
});