'use strict';
define(['kos.arbalest', 'angularAMD'],
    function(kos, angularAMD){
        kos.directive('lkcAssignmentCoverage', function(){
            var string = "";

            return {
                restrict        : 'E',
                replace         : true,
                scope           : {
                    assignmentId    : '=assignmentId',
                    assignmentType  : '=assignmentType'
                },
                controller : function($scope, $http){
                    var url = 'lkcApp/statistix/assignment/' + $scope.assignmentId + '/';
                    $http.get(url)
                        .success(function(data){
                            //console.log(data);
                            var total           = data.totalConcepts;
                            var toBeProcessed   = 0;
                            var processed       = 0;
                            var delivered       = 0;
                            var elementSynset   = data.typeMap.SYNSET;
                            var elementGAP      = data.typeMap.LEXICAL_GAP; 
                            $scope.messageWord     = undefined;

                            console.log("data");
                            console.log(data);
                            console.log(" data coverage " + data.totalConcepts);
                            console.log("info in synset");
                            console.log( elementSynset);
                            console.log("info in GAP "); 
                            console.log(elementGAP);
                            console.log("assignment Type");
                            console.log($scope.assignmentType);

                            if($scope.assignmentType === 'TRANSLATION'){
                                //console.log(element.VALIDATED_LKC);
                                processed += (elementSynset.SYNCED ? elementSynset.SYNCED.current: 0)
                                    + (elementGAP.SYNCED ? elementGAP.SYNCED.current: 0)
                                    + (elementSynset.SYNC_READY ? elementSynset.SYNC_READY.current: 0)
                                    + (elementGAP.SYNC_READY ? elementGAP.SYNC_READY.current: 0)
                                    ;
                                console.log("processed " + processed);        
                                /*delivered +=
                                    (element.SYNC_READY ? element.SYNC_READY.current : 0) +
                                    (element.SYNCED ? element.SYNCED.current : 0);
                                console.log("delivered " + delivered);*/
                                //toBeProcessed = total - processed;
                            }else if($scope.assignmentType === 'VALIDATION'){
                                console.log("validation");
                                /*toBeProcessed +=
                                    (element.VALIDATION_LKC_PENDING ? element.VALIDATION_LKC_PENDING.current : 0) 
                                    +(element.VALIDATION_UKC_PENDING ? element.VALIDATION_UKC_PENDING.current : 0);*/
                                processed += (elementSynset.VALIDATION_LKC_PENDING ? elementSynset.VALIDATION_LKC_PENDING.current : 0) 
                                    + (elementGAP.VALIDATION_LKC_PENDING ? elementGAP.VALIDATION_LKC_PENDING.current : 0) 
                                    + (elementSynset.VALIDATED_LKC ? elementSynset.VALIDATED_LKC.current : 0) 
                                    + (elementGAP.VALIDATED_LKC ? elementGAP.VALIDATED_LKC.current : 0) 
                                    + (elementSynset.REJECTED_LKC ? elementSynset.REJECTED_LKC.current : 0) 
                                    + (elementGAP.REJECTED_LKC ? elementGAP.REJECTED_LKC.current : 0)
                                    ; 
                                    /* validator doesn't have access to objectes whose state is REVISION_PENDING_UKC
                                    + (elementSynset.REVISION_PENDING_UKC ? elementSynset.REVISION_PENDING_UKC.current : 0)
                                    + (elementGAP.REVISION_PENDING_UKC ? elementGAP.REVISION_PENDING_UKC.current : 0);
                                /*deliveredToOthers +=
                                    (element.SYNC_READY ? element.SYNC_READY.current : 0) +
                                    (element.SYNCED ? element.SYNCED.current : 0);*/
                            } else if($scope.assignmentType === 'MANAGEMENT'){
                                /*toBeProcessed +=
                                    (element.VALIDATION_LKC_PENDING ? element.VALIDATION_LKC_PENDING.current : 0) 
                                    +(element.VALIDATION_UKC_PENDING ? element.VALIDATION_UKC_PENDING.current : 0);
                                processed +=
                                    (elementSynset.VALIDATED_LKC ? elementSynset.VALIDATED_LKC.current : 0) +
                                    (element.VALIDATED_UKC ? element.VALIDATED_UKC.current : 0) +
                                    (element.REJECTED_LKC ? element.REJECTED_LKC.current : 0) +
                                    (element.REJECTED_UKC ? element.REJECTED_UKC.current : 0);
                                delivered +=
                                    (element.SYNC_READY ? element.SYNC_READY.current : 0) +
                                    (element.SYNCED ? element.SYNCED.current : 0);*/
                                processed += (elementSynset.VALIDATED_UKC ? elementSynset.VALIDATED_UKC.current : 0) 
                                    + (elementGAP.VALIDATED_UKC ? elementGAP.VALIDATED_UKC.current : 0) 
                                    + (elementSynset.VALIDATION_UKC_PENDING ? elementSynset.VALIDATION_UKC_PENDING.current : 0) 
                                    + (elementGAP.VALIDATION_UKC_PENDING ? elementGAP.VALIDATION_UKC_PENDING.current : 0) 
                                    + (elementSynset.REJECTED_UKC ? elementSynset.REJECTED_UKC.current : 0) 
                                    + (elementGAP.REJECTED_UKC ? elementGAP.REJECTED_UKC.current : 0) 
                                    + (elementSynset.SYNC_READY ? elementSynset.SYNC_READY.current : 0)
                                    + (elementGAP.SYNC_READY ? elementGAP.SYNC_READY.current : 0);
                                
                            }


                            $scope.stats = {
                                total           : total,
                                //toBeProcessed   : toBeProcessed,
                                processed       : processed
                                //delivered       : delivered
                            };
                            $scope.statsToShow  = undefined;
                            if($scope.assignmentType === 'TRANSLATION'){
                                $scope.statsToShow = $scope.stats.total - $scope.stats.processed;
                                //template : '<div><b>{{statsToShow}} words </b> are waiting for you! </div>';
                                $scope.messageWord = "waiting";
                                $scope.languageElement="words";
                                $scope.fullMessage = "This challenge has "+ $scope.stats.total + " activities";

                            }
                            if($scope.assignmentType === 'VALIDATION'){
                                console.log("if final validation");
                                /*if(toBeProcessed > 0){
                                    $scope.statsToShow = $scope.stats.toBeProcessed - $scope.stats.processed;
                                } else {
                                    $scope.statsToShow = 0;
                                }*/
                                $scope.statsToShow = $scope.stats.processed;
                                console.log("stats " + $scope.stats.processed);
                                $scope.messageWord = "ready";
                                $scope.languageElement = "language elements";
                                $scope.fullMessage = $scope.statsToShow + " activities are ready for you!";
                                //string : '<div><b>{{statsToShow}} words </b> are ready for you! </div>';

                            }
                            if($scope.assignmentType === 'MANAGEMENT'){
                                console.log("if final validation");
                                /*if(toBeProcessed > 0){
                                    $scope.statsToShow = $scope.stats.toBeProcessed - $scope.stats.processed;
                                } else {
                                    $scope.statsToShow = 0;
                                }*/
                                $scope.statsToShow = $scope.stats.processed;
                                console.log("stats " + $scope.stats.processed);
                                $scope.messageWord = "ready";
                                $scope.languageElement = "language elements";
                                $scope.fullMessage = $scope.statsToShow + " activities are ready for you!";

                                //string : '<div><b>{{statsToShow}} words </b> are ready for you! </div>';

                            }
                        });
                },
                //template : '<div><b>{{statsToShow}} {{languageElement}} </b> are {{messageWord}} for you! </div>'
                template : '<div>{{fullMessage}}</div>'

            };
        });
    });