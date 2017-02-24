define([
    'kos.arbalest', 'angularAMD', 'angular.ui.router','angular.treeview', 'jquery.jqtree',
    'arbalest/appControllers/lkcApp/lkc_stats_controller',
    //'arbalest/appControllers/lkcApp/lkc_role_stats_controller',
    'arbalest/appControllers/lkcApp/lkc_assignment_quality_controller',
    'arbalest/appControllers/lkcApp/lkc_assignment_coverage_controller',
    //'arbalest/appControllers/lkcApp/lkc_assignment_statistics_controller',
    'arbalest/appControllers/lkcApp/lkc_base_controller'
    //'arbalest/appControllers/lkcApp/lkc_tree_controller'
], function(app, angularAMD){
    'use strict';


    var appNameSpace = 'lkcApp';

    var objectTypeColors = {
        'WORD_FORM'         : 'rgba(128,    150,    153,    1)',
        'SYNSET_EXAMPLE'    : 'rgba(41,     187,    204,    1)',
        'SYNSET'            : 'rgba(77,     255,    174,    1)',
        'WORD'              : 'rgba(204,    41,     129,    1)',
        'SENSE'             : 'rgba(255,    36,     71,     1)',
        'LEXICAL_GAP'       : 'rgba(204,    48,     41,     1)'
    };

    var typeLabels = {
        'TRANSLATED'                : 0,
        'VALIDATION_LKC_PENDING'    : 1,
        'VALIDATED_LKC'             : 2,
        'REJECTED_LKC'              : 3,
        'VALIDATION_UKC_PENDING'    : 4,
        'VALIDATED_UKC'             : 5,
        'REJECTED_UKC'              : 6,
        'SYNC_READY'                : 7,
        'SYNCED'                    : 8,
    };

    var properties = [
        {
            label: '',
            fillColor           : 'rgba(41, 187,204,0.2)',
            strokeColor         : 'rgba(41, 187,204,1)',
            pointColor          : 'rgba(41, 187,204,1)',
            pointStrokeColor    : '#fff',
            pointHighlightFill  : '#fff',
            pointHighlightStroke: 'rgba(41, 187,204,1)',
            data: []
        },
        {
            label: '',
            fillColor           : 'rgba(128,150,153,0.2)',
            strokeColor         : 'rgba(128,150,153,1)',
            pointColor          : 'rgba(128,150,153,1)',
            pointStrokeColor: '#fff',
            pointHighlightFill: '#fff',
            pointHighlightStroke: 'rgba(128,150,153,1)',
            data: []
        },
        {
            label: '',
            fillColor           : 'rgba(77,255,174,0.2)',
            strokeColor         : 'rgba(77,255,174,1)',
            pointColor          : 'rgba(77,255,174,1)',
            pointStrokeColor    : '#fff',
            pointHighlightFill  : '#fff',
            pointHighlightStroke: 'rgba(77,255,174,1)',
            data: []
        },
        {
            label: '',
            fillColor           : 'rgba(255,36,71,0.2)',
            strokeColor         : 'rgba(255,36,71,1)',
            pointColor          : 'rgba(255,36,71,1)',
            pointStrokeColor    : '#fff',
            pointHighlightFill  : '#fff',
            pointHighlightStroke: 'rgba(255,141,145,1)',
            data: []
        },
        {
            label: '',
            fillColor           : 'rgba(204,41,129,0.2)',
            strokeColor         : 'rgba(204,41,129,1)',
            pointColor          : 'rgba(204,41,129,1)',
            pointStrokeColor: '#fff',
            pointHighlightFill: '#fff',
            pointHighlightStroke: 'rgba(204,41,129,1)',
            data: []
        },
        {
            label: '',
            fillColor           : 'rgba(204,48,41,0.2)',
            strokeColor         : 'rgba(204,48,41,1)',
            pointColor          : 'rgba(204,48,41,1)',
            pointStrokeColor: '#fff',
            pointHighlightFill: '#fff',
            pointHighlightStroke: 'rgba(204,48,41,1)',
            data: []
        }
    ];


    app.directive('lkcTreeView', function() {
        return {
            restrict: 'E',
            templateUrl: app.requireResourceFile(appNameSpace, 'lkc_treeView.jade')
        };
    });

    app.directive('lkcSourceView', function() {
        return {
            restrict: 'E',
            templateUrl: app.requireResourceFile(appNameSpace, 'lkc_sourceView.jade')
        };
    });

    app.directive('lkcLogView', function() {
        return {
            restrict: 'E',
            templateUrl: app.requireResourceFile(appNameSpace, 'lkc_logView.jade')
        };
    });

    app.directive('lkcTranslatorView', function() {
        return {
            restrict: 'E',
            templateUrl: app.requireResourceFile(appNameSpace, 'lkc_translatorView.jade')
        };
    });

    app.directive('lkcValidatorView', function() {
        return {
            restrict: 'E',
            templateUrl: app.requireResourceFile(appNameSpace, 'lkc_validatorView.jade')
        };
    });

    app.directive('lastEditTooltip', function(){
        return {
            restrict: 'E',
            scope:{
                info : '=',
                key : '=',
                conceptId : '='
            },
            controller : function($scope, $controller){

                $controller('lkcApp::LKCAPP_BaseController', {$scope: $scope});
        
                var el = $scope.key.split('.');
                $scope.kind = el[0];
                $scope.id = el[1];
            },
            templateUrl : app.requireResourceFile(appNameSpace, 'last_edit_tooltip.jade')
        };
    });

    /* ========================================= */
    /*              CONTROLLERS                  */
    /* ========================================= */
    app.kosController(appNameSpace, 'LKCAPP_LogController',
        ['$scope', '$http', 'AuthService', '$previousState', 'conceptId', 'filter', 'objectType', '$rootScope',
        function ($scope, $http, AuthService, $previousState, conceptId, filter, objectType, $rootScope) {
            
            $scope.conceptId            = conceptId;
            $scope.filterOverObjectId   = filter || undefined;

            $scope.objectType           = objectType || undefined;
            $scope.logData              = [];
            $scope.total                = 0;
            $scope.pageSize             = 10;
            $scope.pageNumber           = 0;
            $scope.currentPage          = 1;
            console.log(conceptId);


            $scope.init = function(conceptId){
                $http.get('lkcApp/log/' + $scope.conceptId + '/' + $scope.filterOverObjectId + '/' + $scope.currentPage)
                    .success(function(data){
                        $scope.total = data.total;

                        $scope.pageNumber = Math.ceil($scope.total/$scope.pageSize);
                        $scope.logData = [];
                        data = data.data;
                        for(var i in data)
                            $scope.logData.push(data[i]);
                        console.log("log data " );
                        console.log( data);

                    })
                    .error(function(data){
                        $scope.logData = [];
                    });
            };
            $scope.init();

            $scope.loadPage = function(page){
                $scope.currentPage = page;
                $http.get('lkcApp/log/' + $scope.conceptId + '/' + $scope.filterOverObjectId + '/' + $scope.currentPage + '/' + $scope.pageSize)
                    .success(function(data){
                        data = data.data;
                        $scope.logData = [];
                        for(var i in data)
                            $scope.logData.push(data[i]);
                    })
                    .error(function(data){
                        $scope.logData = [];
                    });
            };

            $scope.close = function(){
                $rootScope.$broadcast('closeModal');
            };

        }]);

    /*
     * Assignment Controller
     */
    app.kosController(appNameSpace, 'AssignmentsController',
        ['$scope', '$http', 'AuthService', '$controller', '$state', function($scope, $http, AuthService, $controller, $state){
            $controller('lkcApp::LKCAPP_BaseController', {$scope: $scope});
        $scope.isActiveState = function(route) {
            return $state.is(route);
        };
        
        $scope.userId = AuthService.getLoginName();
        $scope.application = {
            title : 'Localization Application'
        };

        $http.get('arbalest/appOptions/lkcApp')
            .success(function(data){
                $scope.application.targetLanguage = data.targetLanguage;
                $scope.application.vocabularyId = data.vocabularyId;
            });
        console.log("ASSIGNMENTS CONTROLLER");
        //$controller('lkcApp::LKCAPP_BaseController', {$scope: $scope});
        

        $scope.isManager            = AuthService.isAuthorized('UKC_VALIDATOR');
        $scope.showAssignmentStats  = {};
        $scope.assignments          = null;
        $scope.nexts                = {};
        $scope.assignment           = {};
        $scope.rootConcept          = undefined;
        $scope.rootLemma            = undefined;
        $scope.rootGloss            = undefined;
        $scope.rootObject           = undefined;
        $scope.assignementType      = undefined;

        console.log("Assignments Controller");
        $scope.saveRootConcept = function(rootConceptId){
            $scope.rootConcept = rootConceptId.conceptId;

            $http.get('lkcApp/concepts/byid/' + rootConceptId.conceptId + '/' + $scope.referenceLanguage)
                .success(function (data) {
                    $scope.rootObject = data;
                    $scope.rootLemma = data.concept;
                    $scope.rootGloss = data.gloss;
                });
        }
     
        $scope.refreshAssignments = function(){
            console.log("refreshing assignments ");
            if(!AuthService.getUserId()){
                console.error('Cannot retrieve user id');
                return;
            }
            $http.get('lkcApp/userAssignments/' + AuthService.getUserId())
                .success(function(data) {
                    if(!angular.equals({},data)){
                        $scope.assignments = data;
                        console.log("assignments");
                        console.log(data);
                       
                        for(var type in data){
                            
                            for(var j in data[type]){
                                if($scope.assignments[type][j].status !== 'CLOSED' && $scope.assignments[type][j].status !== 'REJECTED'){
                                    $scope.deleteSkipHistory($scope.assignments[type][j].id);
                                    $scope.getNext($scope.assignments[type][j].id);
                                }
                            }
                        }
                    }
                })
                .
                error(function(data, status, headers, config) {
                    console.error(data);
                });
        };
       
        $scope.$watch('userId', function(data){
            $scope.refreshAssignments();
        });

        

        $scope.acceptAssignment = function(assignmentId){
            console.log('acceptAssignment ' + assignmentId);
            $http.get('lkcApp/acceptAssignment/' + assignmentId)
                .success(function(data){
                    console.log('accepted assignement ' + assignmentId);
                    $scope.refreshAssignments();
                    //$scope.broadcast('acceptAssignment', {assignmentId : assignmentId});
                })
                .error(function(data){
                    console.error(data);
                });

        };

        $scope.rejectAssignment = function(assignmentId){
            console.log('rejectAssignment' + assignmentId);
            $http.get('lkcApp/rejectAssignment/' + assignmentId)
                .success(function(data){
                    $scope.refreshAssignments();
                  //  $scope.broadcast('rejectedAssignment', {assignmentId : assignmentId});
                })
                .error(function(data){
                    console.error(data.error);
                });
        };



    }]);
    
    /**
     * ASSIGNMENTS MANAGEMENT CONTROLLER
     * REFRESH EVERY 10 sec
     */


    app.kosController(appNameSpace, 'LKCAPP_AssignmentManagementController', ['$scope', '$http', '$controller','AuthService', '$interval',
        function($scope, $http, $controller, AuthService, $interval){

            $controller('lkcApp::LKCAPP_BaseController', {$scope: $scope});
        /**
         Management part
        **/
        $scope.syncStatus = {status :'test'};
                        
        // Pagination
        $scope.total                            = 0;
        //$scope.pageSize                         = 10;
        $scope.pageSize                         = 10;
        $scope.pageNumber                       = 0;
        $scope.currentPage                      = 1;
        $scope.managedAssignments   =[];
        $scope.showPage = function(index){
            $scope.currentPage = index;
            $scope.updateManagedAssignments();
        };

        console.log(" MANAGER CONTROLLER");
        $scope.closeAssignment = function(assignmentId){
            console.log('closeAssignment' + assignmentId);
            $http.get('lkcApp/closeAssignment/' + assignmentId)
                .success(function(data){
                    $scope.updateManagedAssignments();
                })
                .error(function(data){
                    console.error(data);
                });
        };
        
        $scope.updateManagedAssignments = function(){
            $http.get('lkcApp/assignments/'+ $scope.application.vocabularyId + '/' + $scope.currentPage)
                .success(function(data){
                    $scope.total = data.total;
                    console.log("ASSIGNMENTS " + $scope.total);

                    $scope.pageNumber = Math.ceil($scope.total/$scope.pageSize);
                    $scope.managedAssignments = data.assignments;
                    console.log($scope.managedAssignments);
                })
                .error(function(data){
                    console.log('::fail');
                });
        };
        

        $scope.updateSyncStatus = function(){
            $http.get('lkcApp/syncStatus')
                .success(function(data){
                    console.log('updateSyncStatus::success sync status');
                    console.log(data);
                    $scope.syncStatus = data;
                    //$scope.checkStatus();
                })
                .error(function(data){
                    console.log('updateSyncStatus::fail sync status');
                    console.log(data);
                });
        };

        $scope.checkStatus = function(){
            $scope.updateManagedAssignments();
            $scope.updateSyncStatus();
        };

        $scope.checkStatusPromise = $interval($scope.checkStatus, 10000);
        $scope.$on('$destroy', function(){
            if (angular.isDefined($scope.checkStatusPromise))
                $interval.cancel($scope.checkStatusPromise);
        });

        $scope.checkStatus();

        $scope.syncAssignment = function(conceptId){
            console.log('syncAssignment' + conceptId);
            if(conceptId === undefined){
                $http.get('lkcApp/syncAssignment/')
                    .success(function(data){
                        $scope.updateManagedAssignments();
                    })
                    .error(function(data){
                        console.error(data);
                    });
            }else{
                $http.get('lkcApp/syncAssignment/' + conceptId)
                    .success(function(data){
                        $scope.updateManagedAssignments();
                    })
                    .error(function(data){
                        console.error(data);
                    });
            }
        };


    }]);


    app.controller('ReferenceController',
        ['$scope', '$http' , '$controller', '$state',
            function ($scope, $http, $controller, $state) {
                $controller('lkcApp::LKCAPP_BaseController', {$scope: $scope});
                $scope.sourceConcept = {};
                
                $scope.loading = undefined;


                $scope.init = function (conceptId, referenceLanguage, assignmentId) {
                    $scope.conceptId = conceptId;
                    $scope.loading = true;
                    if (assignmentId)
                        $scope.assignmentId = assignmentId;
                    $http.get('lkcApp/concepts/byid/' + conceptId + '/' + $scope.referenceLanguage)
                        .success(function (data) {
                            //console.log('Read concept for ' );
                            //console.log($scope.sourceConcept);
                            $scope.sourceConcept = data;
                            //console.log(data);
                            $scope.loading = false;
                        });

                };

                
                $scope.$on('changedConceptId', function (event, data) {
                    $scope.init(data.conceptId);
                });

                $scope.$on('changedReferenceLanguage', function(event, data) {
                    $scope.init($scope.conceptId, data);
                });

                $scope.conceptTreeChange = function(node) {
                    console.log("conceptTreeChange");
                    console.log(node);
                    var destState;
                    if ($state.is('lkcApp.assignment.translate'))
                        destState = 'translate';
                    else 
                        destState = 'validate';
                    $state.go('lkcApp.assignment.' + destState, {assignmentId: $scope.assignmentId, conceptId: node.conceptId});
                };

                
            }]);


    app.directive('referenceConceptLemma', function() {
        return {
            restrict : 'E',
            replace  : true,
            scope    : {
                concept : '=',
                referenceLanguage : '='
            },
            controller : ['$scope', '$http', function($scope, $http){

                $scope.$watch('concept', function(){
                    if(angular.isDefined($scope.concept))
                        $scope.load();
                });

                $scope.$watch('referenceLanguage', function(data) {
                    $scope.load();
                });

                $scope.load = function(){
                    $http({
                        method: 'GET',
                        url: 'lkcApp/concepts/byidandlangcode/' + $scope.concept + '/' + $scope.referenceLanguage
                    }).success(function(data){
                        $scope.conceptLemma = data.concept;
                    });
                };
            }],
            template : "<div>{{conceptLemma}}</div>"
        };
    });

    app.directive('lkcManagement', function() {
        return {
            restrict: 'E',
            controller : app.buildControllerName(appNameSpace, 'LKCAPP_AssignmentManagementController'),
            templateUrl: app.requireResourceFile(appNameSpace, 'lkc_managementView.jade')
        };
    });

});