'use strict';
define(['kos.arbalest', 'angularAMD'],
    function(kos, angularAMD){
        kos.directive('lkcAssignmentQuality', function(){
            return {
                restrict    : 'E',
                scope       : {
                    assignmentId : '@assignmentId',
                    taskType     : '@taskType'
                },
                controller  : ['$scope', '$http', function($scope, $http){

                    $scope.refreshAssignmentQuality = function(){
                        
                        var assignmentId = $scope.assignmentId;
                        var taskType     = $scope.taskType;

                        $http.get('lkcApp/statistix/assignment/' + assignmentId + '/')
                            .success(function(data){
                                var done    = 0;
                                var notDone = 0;
                                var element = data.typeMap.SYNSET;
                  
                                if(taskType === 'TRANSLATION'){
                                    done    += (element.VALIDATED_LKC ? element.VALIDATED_LKC.current : 0) + (element.VALIDATED_UKC ? element.VALIDATED_UKC.current : 0) + (element.SYNC_READY ? element.SYNC_READY.current : 0) + (element.SYNCED ? element.SYNCED.current : 0);
                                    notDone += (element.REJECTED_LKC ? element.REJECTED_LKC.current : 0) + (element.REJECTED_LKC ? element.REJECTED_LKC.current : 0);
                                }else if(taskType === 'VALIDATION'){
                                    done    += (element.VALIDATED_UKC ? element.VALIDATED_UKC.current : 0) + (element.SYNC_READY ? element.SYNC_READY.current : 0) + (element.SYNCED ? element.SYNCED.current : 0);
                                    notDone += (element.REJECTED_LKC ? element.REJECTED_LKC.current : 0);
                                }else if(taskType === 'MANAGEMENT'){
                                    done += (element.SYNCED ? element.SYNCED.current : 0);
                                    notDone = (element.SYNC_READY ? element.SYNC_READY.current : 0);
                                }
                                $scope.stats = {
                                    total : data.totalConcepts,
                                    accepted : done,
                                    acceptedPercentage : Math.round(done !== 0 ? (done / (done + notDone)) * 100 : 0),
                                    rejected : notDone,
                                    rejectedPercentage : Math.round(notDone !== 0 ? (notDone / (done + notDone)) * 100 : 0),
                                };
                            });
                    };
                    $scope.refreshAssignmentQuality();

                }],
                templateUrl : kos.requireResourceFile('lkcApp', 'lkcAssignmentQuality.jade')
            };
        });
    });