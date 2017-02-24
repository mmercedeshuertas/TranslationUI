define(['jquery', 'angularAMD', 'kos.contracts.arbalest', 'angular.ui.extras', 'koosApp.kb', 'angular.ui.router', 'kos.arbalest', 'kos.security'], 
  function ($, angularAMD, arbalestContract) {

    var app = angular.module('kos.ui', ['koosApp.kb', 'ui.router',  'ct.ui.router.extras', 'kos.arbalest', 'kos.security']);

    app.controller('DesktopWrapperController', ['$scope', '$http', 'AuthService', function($scope, $http, AuthService){
        $scope.loggedIn = AuthService.isAuthenticated;
        $scope.sidebars = {left: 'show', top: 'show'};
        $scope.testCSS = 'this_is_a_custom_css.css';
        $http.get('config').success(function(data) {
            if(data.sidebars) {
                $scope.sidebars = data.sidebars;
            }
        });
    }]);

    app.controller('DesktopController',
        ['$scope', '$http', 'ArbalestService', 'AuthService', '$state',
        function($scope, $http, ArbalestService, AuthService, $state){
        
        $scope.hasRole = AuthService.isAuthorized;
        $scope.isLoggedIn = AuthService.isAuthenticated;
        $scope.workspaceMode = false;
        $scope.desktopApps = [];
        $scope.$parent.$parent.cssResources = [];
        
        $scope.workspaces = {
            knowledgeWorkspace : {
                name: "Knowledge",
                code: "knowledgeDesktop",
                icon: "fa fa-book"
            },
            
            analysisWorkspace: {
                name: "Analysis",
                code: "analysisDesktop",
                icon: "fa fa-code"
            },
            managementWorkspace :{
                name: "Management",
                code: "managementDesktop",
                icon: "fa fa-database"
            },
            experimentalWorkspace: {
                name : "Experiments",
                code : "experimentalDesktop",
                icon : "fa fa-gears"
            },
            gameWorkspace: {
                name : "Games",
                code : "gameDesktop",
                icon : "fa fa-gamepad"
            }
            
        };
        $scope.$watch('isLoggedIn', function(){
            
            ArbalestService.getApplications(1)
                .success(function(data) {
                    var toload = [];
                    var bootApp = '';
                    for(var appName in data){
                        var application = data[appName];
                        
                        if(application.requiresInit){
                            toload.push(arbalestContract.requireControllerFile(appName, 'init.js'));
                        }
                        
                        console.log($scope.hasRole(application.requiredRoles));
                        if(application.startAtBoot && $scope.hasRole(application.requiredRoles)){
                            bootApp = application.entryState;
                        }
                        
                        if(application.isWidget){
                            if($scope.workspaceMode){
                                if(!('applications' in $scope.workspaces[application.workspace]))
                                    $scope.workspaces[application.workspace].applications = {};
                                $scope.workspaces[application.workspace].applications[application.namespace] = application;
                            }else{
                                $scope.desktopApps.push(application);
                            }                            
                        }
                        if (application.customStyle) {
                            loadCssFile(appName);
                        }
                    }
                    if(bootApp)
                      $state.go(bootApp);
                });
        });

        var loadCssFile = function(appName) {
            var cssResourceUrl = arbalestContract.requireResourceFile(appName, 'style.css');
            $scope.$parent.$parent.cssResources.push(cssResourceUrl);
        }

        $scope.footerInfo;
        $http.get('config').success(function(data) {
            if(data.info)
                $scope.footerInfo = data.info.footerInfo;
        });
    }]);

    app.directive('kosWindow', function($compile){

        var directiveDefinitionObject = {
            restrict : 'E',
            templateUrl : 'views/kosWindow',
            replace  : true,
            transclude : true,
            scope: {
                appTitle : '@',
                appIcon  : '@?',
                windowLanguageSelector : '=',
                windowReferenceLanguageSelector : '=',
                windowClass : '=',
                knowledgePath : '=?',
                conceptId : '=?'
            },
            controller: ['$scope', 'KnowledgeBaseService', '$state', '$stickyState',
            function($scope, KnowledgeBaseService, $state, $stickyState){
                $scope.associatedState = {
                    ref     : angular.copy($state.current.name),
                    params  : angular.copy($state.params)
                };
                $scope.state = $state;
                $scope.stickyState = $stickyState;
                $scope.firstOpen = true;
                
                $scope.selectedLanguage = 'en';

                KnowledgeBaseService.getLanguages()
                    .success(function(data){
                        $scope.languages = data;
                    });

                $scope.$watch('selectedLanguage', function(){
                    $scope.$emit('languageSelected', $scope.selectedLanguage);
                    $scope.$broadcast('languageSelected', $scope.selectedLanguage);
                });

                $scope.$watch('selectedReferenceLanguage', function(){
                    $scope.$emit('referenceLanguageSelected', $scope.selectedReferenceLanguage);
                    $scope.$broadcast('referenceLanguageSelected', $scope.selectedReferenceLanguage);
                });
                
            }],
        };
        return directiveDefinitionObject;
    });
    
    app.directive('collapsibleBox', function(){
       return {
           link: function ($scope, element, attrs) {
               element.bind('click', function () {
                   var angElement = angular.element(element);
                   var box = angElement.parents(".box").first();
                   //Find the body and the footer
                   var bf = box.find(".box-body, .box-footer");
                   if (!box.hasClass("collapsed-box")) {
                       //Convert minus into plus
                       angElement.children(".fa-minus").removeClass("fa-minus").addClass("fa-plus");
                       bf.slideUp(300, function () {
                        box.addClass("collapsed-box");
                       });
                   } else {
                       //Convert plus into minus
                       angElement.children(".fa-plus").removeClass("fa-plus").addClass("fa-minus");
                       bf.slideDown(300, function () {
                        ìbox.removeClass("collapsed-box");
                       });
                   }
               });
           }
       };
   });
    var CLOSE_ICON = 'fa-minus';
    var OPEN_ICON = 'fa-plus';
    var ANIMATION_SPEED = 750;
    app.directive('box', function () {
    return {
      templateUrl: 'kosResource/ui/box.jade',
      restrict: 'E',
      transclude: true,
      replace : true,
      scope : {
        type            : '=?',
        collapsible     : '=?',
        title           : '=?',
        loading         : '=?',
        loadingIcon     : '=?',
        solid           : '=?',
        removable       : '=?',
        backgroundColor : '=?',
        buttons         : '=?',
        actionArg       : '=?' // element to pass to the action of buttons
      },
      link: function ($scope, element) {
        element
          .find('[data-widget="collapse"]')
          .bind('click', function () {
            var angElement = angular.element(this);
            var box = angElement.parents('.box').first();
            var bf = box.find('.box-body, .box-footer');
            if (!box.hasClass('collapsed-box')) {
              angElement.children('.' + CLOSE_ICON).removeClass(CLOSE_ICON).addClass(OPEN_ICON);
              bf.slideUp(300, function () {
                box.addClass('collapsed-box');
              });
            } else {
              angElement.children('.' + OPEN_ICON).removeClass(OPEN_ICON).addClass(CLOSE_ICON);
              bf.slideDown(300, function () {
                box.removeClass('collapsed-box');
              });
            }
          });
        element
          .find('[data-widget="remove"]')
          .bind('click', function () {
            var angElement = angular.element(this);
            var box = angElement.parents('.box').first();
            box.slideUp(ANIMATION_SPEED);
          });
      }
    };
  });

    app.directive('notificationBox', function(){
        return {
            restrict    : 'E',
            replace     : true,
            templateUrl : 'kosResource/ui/dashboardNotification.jade',
            controller  : ['$scope', function($scope){
                $scope.notifications = [];
                // Faye.subscribe("/channel-notifications", function(notification){
                //     $scope.data.push(notification);
                // });
            }]
        }
    });

    app.filter("ucwords", function () {
        return function (input){
            if(input) { //when input is defined the apply filter
               input = input.toLowerCase().replace(/\b[a-z]/g, function(letter) {
                  return letter.toUpperCase();
               });
            }
            return input; 
        }    
    });

  app.directive('confirmationNeeded', function () {
  return {
    priority: 1,
    terminal: true,
    link: function (scope, element, attr) {
      var msg = attr.confirmationNeeded || "Are you sure?";
      var clickAction = attr.ngClick;
      element.bind('click',function () {
        if ( window.confirm(msg) ) {
          scope.$eval(clickAction)
        }
      });
    }
  };
});

      app.directive("fileread", [function () {
          return {
              scope: {
                  fileread: "=",
                  file: "="
              },
              link: function (scope, element, attributes) {
                  element.bind("change", function (changeEvent) {
                      var reader = new FileReader();
                      reader.onload = function (loadEvent) {
                          scope.$apply(function () {
                              scope.fileread = loadEvent.target.result;
                          });
                      };
                      scope.file = changeEvent.target.files[0];
                      reader.readAsText(changeEvent.target.files[0]);
                  });
              }
          }
      }]);
});