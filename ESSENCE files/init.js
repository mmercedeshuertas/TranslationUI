'use strict';
define(['js/koosApp', 'angularAMD', 'kos.contracts.arbalest', 'angular.ui.router','angular.treeview'],
    function(app, angularAMD, arbalest) {
    
    var appName = 'lkcApp';
    var lkcApp = angular.module(appName, ['kos.security']);

    return lkcApp.config(function ($stateProvider) {
        $stateProvider
            .state(appName, angularAMD.route({
                url     : '/' + appName,
                templateUrl     : arbalest.requireResourceFile(appName, 'index.jade'),
                controller      : arbalest.buildControllerName(appName, 'AssignmentsController'),
                controllerUrl   : arbalest.requireControllerFile(appName, 'application_controllers'),
                access          : {
                    requiredLogin: true
                }
            }))
            
            .state('lkcApp.assignment', {
                template: '<div ui-view></div>',
                sticky: true,
            })
            
            .state('lkcApp.assignment.translate', angularAMD.route({
                url: '/translate/:assignmentId/:conceptId',
                templateUrl     : arbalest.requireResourceFile(appName, 'lkc_assignmentView.jade'),
                controller      : arbalest.buildControllerName(appName, 'LKCAPP_TranslationController'),
                controllerUrl   : arbalest.requireControllerFile(appName, 'translation_controller'),
                access          : { requiredLogin: true }
            }))

            .state('lkcApp.assignment.validate', angularAMD.route({
                url             : '/validate/:assignmentId/:conceptId',
                templateUrl     : arbalest.requireResourceFile(appName, 'lkc_validatorView.jade'),
                //templateUrl     : arbalest.requireResourceFile(appName, 'lkc_assignmentValidationView.jade'),
                controller      : arbalest.buildControllerName(appName, 'LKCAPP_ValidationController'),
                controllerUrl   : arbalest.requireControllerFile(appName, 'validation_controller'),
            
                access          : { requiredLogin: true },
            }))

            .state('lkcApp.assignment.ukc_validate', angularAMD.route({
                url             : '/ukcvalidate/:assignmentId/:conceptId',
                templateUrl     : arbalest.requireResourceFile(appName, 'lkc_ukcValidatorView.jade'),
                controller      : arbalest.buildControllerName(appName, 'LKCAPP_UKCValidationController'),
                controllerUrl   : arbalest.requireControllerFile(appName, 'ukcValidation_controller'),
                access          : { requiredLogin: true }
            }));
    });

});