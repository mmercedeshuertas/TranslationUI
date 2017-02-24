'use strict';
define(['kos.arbalest', 'angularAMD'],
    function(kos, angularAMD){
    var appNameSpace = 'lkcApp';
    /*
     * Base Controller
     */
    kos.kosController(appNameSpace, 'LKCAPP_BaseController',
        ['$scope', '$http', '$modal', 'ipCookie',
        
        function($scope, $http, $modal, ipCookie){

            $scope.logDisabled      = true;
            $scope.modalInstance    = undefined;

            $scope.noMoreWords      = undefined;
            $scope.loading          = undefined;


            /*
             * Language Part
             */
            $scope.referenceLanguages = [];
            var loadUkcLanguages = function () {
                $http.get('lkcApp/reference/languages').success(function(data) {
                    $scope.referenceLanguages = data;
                });
            };
            loadUkcLanguages();

            if (!$scope.referenceLanguage) {
                $scope.referenceLanguage = 'en';
            }
            $scope.$watch('referenceLanguage', function (data) {
                if (angular.isDefined($scope.referenceLanguage)) {
                    $scope.$emit('changedReferenceLanguage', $scope.referenceLanguage);
                    $scope.$broadcast('changedReferenceLanguage', $scope.referenceLanguage);
                }
            });

            /*console.log("BASE CONTROLLER ");
            $scope.saveRootConcept = function(rootConceptId){
                console.log("ROOT CONCEPT "); 
                console.log(rootConceptId.conceptId);
            
                $scope.rootConcept = rootConceptId.conceptId;
            }*/
     


            /*
            kosSocket.forward('translation:skipped');
            $scope.$on('translation:skipped', function(){
                console.log('someone skipped, scope event version');
            });
            kosSocket.on('translation:skipped', function(data){
                console.log('Someone skipped a translation');
                console.log(data);
            });

            kosSocket.on('socket:translation:skipped', function(data){
                console.log('Someone skipped a translation');
                console.log(data);
            });
*/

            $scope.getNext = function(assignmentId){
                delete $scope.nexts[assignmentId];
                console.log("GET NEXT");
                $scope.loading = true;
                $http.post('lkcApp/nextTask/' + assignmentId, ipCookie('skipped_'  + assignmentId) || [])
                    .success(function(data){
                        var skipped = ipCookie('skipped_' + assignmentId) || [];
                        skipped.push(data);
                        //console.log("data next");
                        //console.log(data);
                        //kosSocket.emit('translation:skipped', data);
                        ipCookie('skipped_' + assignmentId, skipped);
                        $scope.nexts[assignmentId] = data; //current assignment id
                        $scope.loading = false;
                    })
                    .error(function(data){
                        if (data == 'Not Found'){
                            $scope.noMoreWords = true;
                            console.log("no more words");
                            $scope.loading = false;
                        }
                        //console.error('Next not found for : ' + assignmentId);
                    });
            };
            
            $scope.deleteSkipHistory = function(assignmentId){
                ipCookie.remove('skipped_' + assignmentId);
            };

            $scope.openModalLog = function(conceptId, filter, objectType){
                $scope.modalInstance = $modal.open({
                    templateUrl : kos.requireResourceFile('lkcApp', 'logModal.jade'),
                    controllerUrl : kos.requireControllerFile('lkcApp', 'application_controllers'),
                    controller  : kos.buildControllerName('lkcApp', 'LKCAPP_LogController'),
                    size: 'lg',
                    resolve: {
                        objectType: function() { return objectType;},
                        conceptId: function () { return conceptId;},
                        filter: function() { return filter;}
                    }
                });
            };

            $scope.$on('closeModal', function(event, data) {
                $scope.modalInstance.dismiss('cancel');
            });
        }]);

});