"use strict";

function instantiateApplication(appName, dependencies){
    return angular.module(appName, dependencies);
}

define(
    [
        'jquery', 'angularAMD',
        'json!arbalest/applications/1',
        'kos.contracts.arbalest',
        'kos.security', 'kos.arbalest',
        'kos.ui',

        'angular.ui.router', 'ui.bootstrap',
        'angular.ui.grid',
        'angular.chartjs', 'angular.ui.extras', 'angular.treeview',
        'angular.jqcloud',
        'angular.ui.checklist',

    
        'koosApp.kb','koosApp.eb', 'KOS.filters',
        'angular.ui.select',
        'hammerjs', 'jqcloud2',
        'dashboard.lte',
        'd3.cloud', 'toggle-switch', 'tc.chartjs', 'ngSanitize', 'vis','ngVis', 'ang-drag-drop', 'ngMaterial'
    ],
    function ($, angularAMD, applications, arbalestContract) {
        
        var app;
        
        var semaphore = {
            'count': 1, // represents the number of thread that need to be "done" before 
            'callback': function(){
                console.log('called');
                angularAMD.bootstrap(app);
                return app;
            },
            'checkIfLast': function(){
                this.count -= 1;
                if (!this.count){
                    return this.callback();
                }
            }
        };


        // Load Applications as modules
        var modulesToLoad = [];
        var bootApp       = "";
        var additionalDeps = [];
        for(var appName in applications){
            var application = applications[appName];
            
            if(application.requiresInit){
                modulesToLoad.push(arbalestContract.requireControllerFile(appName, 'init.js'));
                additionalDeps.push(appName);
            }
        }

        require(modulesToLoad, function(){
            
            var appName = 'kos';
            var dependencies = [
                'ui.router', 'ct.ui.router.extras',
                'kos.security', 'kos.arbalest', 'kos.ui',
                'koosApp.kb', 'koosApp.eb', 'KOS.filters',
                'chart.js',  'ui.bootstrap',
                'treeControl', 'ui.select',
                'angular-jqcloud', 'checklist-model',
                'dashboard.lte','toggle-switch', 'tc.chartjs', 'ngSanitize', 'ngVis', 'ang-drag-drop', 'ngMaterial'
            ];
            dependencies = dependencies.concat(additionalDeps);
            app = instantiateApplication(appName, dependencies);
            
            app.config([
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
                    app.requireControllerFile = function(appName, controllerName){
                        return 'arbalest/appControllers/' + appName + '/' + controllerName;
                    };

                    app.requireResourceFile = function(appName, resourceName){
                        return 'arbalest/appResource/' + appName + '/' + resourceName;
                    };

                    app.buildControllerName = function(applicationName, controllerName){
                        return applicationName + '::' + controllerName;
                    };

                    app.kosController = function(applicationName, controllerName, parameters){
                        return $controllerProvider.register(app.buildControllerName(applicationName, controllerName), parameters);
                    };

                    app.createApplication = function(applicationName, dependencies){
                        return angular.module(applicationName, dependencies);
                    };
                    
                    app.controller = $controllerProvider.register;
                    app.directive  = $compileProvider.directive;
                    app.filter     = $filterProvider.register;
                    app.factory    = $provide.factory;
                    app.service    = $provide.service;
                    app.value      = $provide.value;
                    app.constant   = $provide.constant;

                    app.version    = '0.1.0';

                    $stateProvider.state('403', {
                        name : '403',
                        templateUrl : 'kosResource/ui/notauthorized.jade'
                    });
                    $stateProvider.state('404', {
                        name : '404',
                        templateUrl : 'kosResource/ui/notfound.jade'
                    });
                    $stateProvider.state('500', {
                        name : '500',
                        templateUrl : 'kosResource/ui/exception.jade'
                    });
                }]);

            app.run(function($rootScope, $state, AuthService) {
                AuthService.restore();
                $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
                    if (toState.access !== undefined && toState.access.requiredLogin && !AuthService.isAuthenticated()) {
                        event.preventDefault();
                        $rootScope.previousState = {
                            name : toState.name,
                            params : toParams
                        };
                        $state.go('main');
                    }else{
                        if(toState.access !== undefined && toState.access.requiredRoles && !AuthService.isAuthorized(toState.access.requiredRoles)){
                            event.preventDefault();
                            $state.go('403');
                        }
                    }
                });
            });
            semaphore.checkIfLast();
        });
    });


/*
var app = angular.module('koosApp', [
    'ui.router', 'ct.ui.router.extras',
    'kos.security', 'kos.arbalest',
    'koosApp.kb', 'koosApp.eb', 'KOS.filters',
    'chart.js',  'ui.bootstrap',
    'treeControl', 'ui.select',
    'angular-jqcloud', 'checklist-model',
    'dashboard.lte'
]);
*/
