'use strict';
define(['kos.arbalest', 'angularAMD', 'angular.ui.router'],
    function(kos, angularAMD){
    var appNameSpace = 'lkcApp';
    
    kos.directive('lkcSensesLkcTranslator', function(){
        return {
            restrict    : 'E',
            templateUrl : kos.requireResourceFile(appNameSpace, 'sensesLKCTranslator.jade')
        };
    });

    kos.directive('lkcExamplesLkcTranslator', function(){
        return {
            restrict    : 'E',
            templateUrl : kos.requireResourceFile(appNameSpace, 'examplesLKCTranslator.jade')
        };
    });

    kos.directive('lkcSynsetLkcTranslator', function(){
        return {
            restrict    : 'E',
            templateUrl : kos.requireResourceFile(appNameSpace, 'synsetLKCTranslator.jade')
        };
    });

    kos.kosController(appNameSpace, 'LKCAPP_TranslationController',
    ['$rootScope', '$scope', '$http', '$state', 'AuthService', '$modal', '$controller',

        function ($rootScope, $scope, $http, $state, AuthService, $modal, $controller) {
        $controller('lkcApp::LKCAPP_BaseController', {$scope: $scope});
        
        $scope.roles 				= AuthService.getRoles();
        $scope.userId 				= AuthService.getUserId();

        $scope.conceptId 			= $state.params.conceptId;
        $scope.assignmentId 		= $state.params.assignmentId; // Assignment ID should be translation
        $scope.assignmentNotFound 	= false;

        $scope.logDisabled 				= true;
        $scope.successMessage 			= "";
        $scope.infoMessage 				= "";
        $scope.errorMessage 			= "";
        $scope.submitedMessage          = "";
        $scope.syncedMessage            = "";
        $scope.rejectionMessage         = "";
        $scope.statusMixedMessage       = "";
        $scope.assignmentTypeLegend     = undefined;

        $scope.translationStored        = "";
        $scope.Congratulations          = "";

        $scope.originalTranslationUnit  = {};    // Original
        $scope.translationUnit 			= {};
        $scope.infoMap                  = {};
        $scope.saveFlag         		= false;            
        $scope.statusTranslated         = undefined;

        
        $scope.validationFlag   		= false;
        $scope.showSummaryGap           = undefined;
        $scope.comeLater                = undefined;
        $scope.sendValidation           = undefined;
        $scope.tableTask                = undefined;
        $scope.introduceExample         = undefined;
        $scope.showResponse             = undefined;
        $scope.isGap                    = undefined;
        $scope.deletedObject            = undefined;
        
        $scope.lemmaAdded               = false;
        $scope.exampleAdded             = false;
        $scope.lexicalGapPresent        = undefined;
        $scope.gapDefined               = undefined;
        
        $scope.fromGaptoNoGap           = undefined;
        $scope.fromNoGapToGap           = undefined;

        $scope.gapToBeDeleted           = undefined;
        $scope.synsetToBeDeleted        = undefined;

        $scope.sendToValidator          = false;
        $scope.elementValidated         = undefined; //controls if the status of any element is VALIDATED_UKC
        $scope.elementRejected          = undefined; //controls if the state of any alement is REVISION_PENFING_LKC OR _UKC

        $scope.buttonGoAhead            = undefined;
        $scope.reVisit                  = undefined;
        $scope.reEdit                   = undefined;
        $scope.hideFields               = undefined;
        $scope.reUpload                 = false;
        $scope.showSuccess              = undefined;
        $scope.backButton               = undefined;
        $scope.disabledButton           = undefined;
        $scope.buttonSendValidation     = undefined;

        $scope.checkBoxGapVariable      = undefined;
        $scope.onlyVisualizeState       = undefined;
        $scope.objectState              = undefined;
        $scope.objectStatus             = undefined; 
        $scope.allRejected              = undefined;
        $scope.mixedStatus              = undefined;
        $scope.rejectedManager          = undefined;
        //$scope.checkManager             = undefined;
        $scope.objectTranslated         = undefined;
        $scope.translatedGAP            = undefined;

        /*$scope.reasonsGAP               = {
            value1  : false,
            value2  : false,
            value3  : false,
        };
        $scope.commentToAdd             = '';*/


        
        $scope.possiblePosTag = [
            {
                code: "ADJECTIVE",
                label: "Adjective"
            },
            {
                code: "ADVERB",
                label: "Adverb"
            },
            {
                code: "NOUN",
                label: "Noun"
            },
            {
                code: "VERB",
                label: "Verb"
            }
        ];

        $scope.word = {
            synsetWordRank: 1,
            word : {
                lemma: "",
                forms: ""
            }
        };

        $scope.example = {
            text: ""
        };

        /* GET NEXT */
        //delete $scope.nexts[$scope.assignmentId];
        
        $scope.getNext($scope.assignmentId);
        

        $scope.$watch("translationUnit" ,function(oldValue, newValue){
            $scope.updateSaveFlag();
            $scope.updateValidationFlag();
            //$scope.exampleWithRightLength();
        }, true);

        $scope.viewGap=false;

        $scope.rejectedFromManager = function(){
            var status_validted_ukc = 0;
            var status_Revision_Pending_ukc = 0;
            for(var i in $scope.translationUnit.objectInfoMap){

                if($scope.translationUnit.objectInfoMap[i].status === 'VALIDATED_UKC') {
                    status_validted_ukc++;
                }     
                if ($scope.translationUnit.objectInfoMap[i].status === 'REVISION_PENDING_UKC') {
                    status_Revision_Pending_ukc++;
                } 
            }
            if( (status_Revision_Pending_ukc !== 0) && ((status_validted_ukc == 0) || (status_validted_ukc !== 0)) ){
                    $scope.rejectedManager = true;
                    
                }
            return $scope.rejectedManager;
        }

        $scope.objectGeneralStatus = function(){
            var status_Validation_ukc_Pending   = 0;
            var status_Revision_Pending_lkc     = 0;
            var status_Revision_Pending_ukc     = 0;
            var status_translated               = 0;
            var status_validation_lkc_pending   = 0;
            var status_validated_lkc            = 0;
            var status_validated_ukc            = 0;
            var status_rejected_lkc             = 0;
            var status_rejected_ukc             = 0;
            var status_synced                   = 0;
            var status_delete_requested         = 0;
            for(var i in $scope.translationUnit.objectInfoMap){
                
                var position = i.indexOf('.');
                $scope.deletedObject = i.substr(0, position);
                    
                if($scope.deletedObject !== 'WORD'){
                    //console.log("if different word");
                    if($scope.translationUnit.objectInfoMap[i].status === 'VALIDATION_LKC_PENDING'){
                        status_validation_lkc_pending ++;
                    }
                    if($scope.translationUnit.objectInfoMap[i].status === 'VALIDATION_UKC_PENDING'){
                        status_Validation_ukc_Pending ++;
                    }
                    
                    if($scope.translationUnit.objectInfoMap[i].status === 'VALIDATED_LKC'){
                        status_validated_lkc ++;
                    }
                    if($scope.translationUnit.objectInfoMap[i].status === 'VALIDATED_UKC'){
                        status_validated_ukc ++;
                    }
                    
                    if($scope.translationUnit.objectInfoMap[i].status === 'REJECTED_LKC'){
                        status_rejected_lkc ++;
                    }
                    
                    if($scope.translationUnit.objectInfoMap[i].status === 'REJECTED_UKC') {
                        status_rejected_ukc ++;
                    }
                       
                    if(($scope.translationUnit.objectInfoMap[i].status === 'SYNCED') || 
                        ($scope.translationUnit.objectInfoMap[i].status === 'SYNC_READY')){
                        status_synced++;
                    }
                           
                    if ($scope.translationUnit.objectInfoMap[i].status === 'REVISION_PENDING_LKC'){
                        status_Revision_Pending_lkc ++;//= status_Revision_Pending_lkc++;
                        $scope.elementRejected = false;
                    }
                    if ($scope.translationUnit.objectInfoMap[i].status === 'REVISION_PENDING_UKC'){
                        status_Revision_Pending_ukc ++;//= status_Revision_Pending_lkc++;
                        $scope.elementRejected = false;
                    }
                    if ($scope.translationUnit.objectInfoMap[i].status === 'TRANSLATED'){
                        status_translated ++;
                    }
                    if ($scope.translationUnit.objectInfoMap[i].status === 'DELETE_REQUESTED'){
                        if($scope.deletedObject === 'LEXICAL_GAP'){
                            $scope.gapToBeDeleted = true;
                        }
                        if($scope.deletedObject === 'SYNSET'){
                            $scope.synsetToBeDeleted = true;
                        }
                        status_delete_requested ++;
                    }
                }    
            }
            if (status_synced !== 0) {
                $scope.syncedMessage = "This activity is saved as follows";
                $scope.onlyVisualizeState   = true;
                            if( $scope.translationUnit.lexicalGap !== undefined && !$scope.gapToBeDeleted){
                                
                                $scope.gapSelected.checkBoxGap=true;
                                $scope.showSummaryGap = true;
                                $scope.showResponse = true; //different when gap is not present
                                $scope.hideFields = false;
                                $scope.checkBoxGapVariable      = true;

                           } 
                           if( $scope.translationUnit.lexicalGap !== undefined && $scope.gapToBeDeleted){
                                $scope.gapSelected.checkBoxGap=false;

                                $scope.showSummaryGap = true;
                                $scope.showResponse = false;
                                $scope.hideFields = true;
                            
                           }
                           if( $scope.translationUnit.lexicalGap == undefined && $scope.synsetToBeDeleted){
                                $scope.gapSelected.checkBoxGap=true;
                                $scope.showSummaryGap = true;
                                $scope.showResponse = true; //different when gap is not present
                                $scope.hideFields = false;
                                $scope.checkBoxGapVariable      = true;

                           }

                           if( $scope.translationUnit.lexicalGap == undefined){
                                $scope.gapSelected.checkBoxGap=false;

                                $scope.showSummaryGap = true;
                                $scope.showResponse = false;
                                $scope.hideFields = true;
                                
                           }
            }




            if( ((status_validated_lkc !== 0) || (status_rejected_lkc !== 0) || (status_rejected_ukc !== 0)) &&
                ((status_validation_lkc_pending == 0) && (status_Validation_ukc_Pending == 0)) ){
                $scope.submitedMessage      =   "This activity has been sent to validation. Unfortunatelly you cannot edit it";
                $scope.onlyVisualizeState   = true;
                
                $scope.objectState = $scope.translationUnit.objectInfoMap[i].status;


                if( $scope.translationUnit.lexicalGap !== undefined && !$scope.gapToBeDeleted){
                    
                    $scope.gapSelected.checkBoxGap=true;
                    $scope.showSummaryGap = true;
                    $scope.showResponse = true; //different when gap is not present
                    $scope.hideFields = false;
                    $scope.checkBoxGapVariable      = true;

               } 
               if( $scope.translationUnit.lexicalGap !== undefined && $scope.gapToBeDeleted){
                        $scope.gapSelected.checkBoxGap=false;

                        $scope.showSummaryGap = true;
                        $scope.showResponse = false;
                        $scope.hideFields = true;
                    
                }
                if( $scope.translationUnit.lexicalGap == undefined && $scope.synsetToBeDeleted){
                                $scope.gapSelected.checkBoxGap=true;
                                $scope.showSummaryGap = true;
                                $scope.showResponse = true; //different when gap is not present
                                $scope.hideFields = false;
                                $scope.checkBoxGapVariable      = true;

                           }
               if( $scope.translationUnit.lexicalGap == undefined){
                    $scope.gapSelected.checkBoxGap=false;

                    $scope.showSummaryGap = true;
                    $scope.showResponse = false;
                    $scope.hideFields = true;
                    
               }
            }

            if (( ((status_validated_lkc !== 0) && (status_rejected_lkc !== 0)) ||
                 ((status_validated_lkc == 0) && (status_rejected_lkc !== 0)) ||
                 ((status_validated_lkc !== 0) && (status_rejected_lkc !== 0)) ) && (status_Validation_ukc_Pending !== 0)) {
                $scope.submitedMessage      =   "This activity has been sent to validation. Unfortunatelly you cannot edit it";
                $scope.onlyVisualizeState   = true;
                
                $scope.objectState = $scope.translationUnit.objectInfoMap[i].status;


                if( $scope.translationUnit.lexicalGap !== undefined && !$scope.gapToBeDeleted){
                    
                    $scope.gapSelected.checkBoxGap=true;
                    $scope.showSummaryGap = true;
                    $scope.showResponse = true; //different when gap is not present
                    $scope.hideFields = false;
                    $scope.checkBoxGapVariable      = true;

               } 
               if( $scope.translationUnit.lexicalGap !== undefined && $scope.gapToBeDeleted){
                        $scope.gapSelected.checkBoxGap=false;

                        $scope.showSummaryGap = true;
                        $scope.showResponse = false;
                        $scope.hideFields = true;
                    
                }
                if( $scope.translationUnit.lexicalGap == undefined && $scope.synsetToBeDeleted){
                                $scope.gapSelected.checkBoxGap=true;
                                $scope.showSummaryGap = true;
                                $scope.showResponse = true; //different when gap is not present
                                $scope.hideFields = false;
                                $scope.checkBoxGapVariable      = true;

                           }
               if( $scope.translationUnit.lexicalGap == undefined){
                    $scope.gapSelected.checkBoxGap=false;

                    $scope.showSummaryGap = true;
                    $scope.showResponse = false;
                    $scope.hideFields = true;
                    
               }
            }


            if( (status_validated_lkc == 0) && (status_rejected_lkc == 0) && (status_rejected_ukc == 0) &&
                (status_validation_lkc_pending !== 0) && (status_Validation_ukc_Pending == 0) ){
                $scope.submitedMessage      =   "This activity has been sent to validation. Unfortunatelly you cannot edit it";
                $scope.onlyVisualizeState   = true;
                
                $scope.objectState = $scope.translationUnit.objectInfoMap[i].status;


                if( $scope.translationUnit.lexicalGap !== undefined && !$scope.gapToBeDeleted){
                    
                    $scope.gapSelected.checkBoxGap=true;
                    $scope.showSummaryGap = true;
                    $scope.showResponse = true; //different when gap is not present
                    $scope.hideFields = false;
                    $scope.checkBoxGapVariable      = true;

               }
               if( $scope.translationUnit.lexicalGap !== undefined && $scope.gapToBeDeleted){
                    $scope.gapSelected.checkBoxGap=false;

                    $scope.showSummaryGap = true;
                    $scope.showResponse = false;
                    $scope.hideFields = true;
                    
                } 
                if( $scope.translationUnit.lexicalGap == undefined && $scope.synsetToBeDeleted){
                    $scope.gapSelected.checkBoxGap=true;
                    $scope.showSummaryGap = true;
                    $scope.showResponse = true; //different when gap is not present
                    $scope.hideFields = false;
                    $scope.checkBoxGapVariable      = true;

                }

               if( $scope.translationUnit.lexicalGap == undefined){
                    $scope.gapSelected.checkBoxGap=false;

                    $scope.showSummaryGap = true;
                    $scope.showResponse = false;
                    $scope.hideFields = true;
                    
               }
            }

            if( (status_validated_lkc == 0) && (status_rejected_lkc == 0) && (status_rejected_ukc == 0) &&
                (status_validation_lkc_pending !== 0) && (status_Validation_ukc_Pending !== 0) ){
                $scope.submitedMessage      =   "This activity has been sent to validation. Unfortunatelly you cannot edit it";
                $scope.onlyVisualizeState   = true;
                
                $scope.objectState = $scope.translationUnit.objectInfoMap[i].status;


                if( $scope.translationUnit.lexicalGap !== undefined && !$scope.gapToBeDeleted){
                    
                    $scope.gapSelected.checkBoxGap=true;
                    $scope.showSummaryGap = true;
                    $scope.showResponse = true; //different when gap is not present
                    $scope.hideFields = false;
                    $scope.checkBoxGapVariable      = true;

               }

               if( $scope.translationUnit.lexicalGap !== undefined && $scope.gapToBeDeleted){
                    $scope.gapSelected.checkBoxGap=false;

                    $scope.showSummaryGap = true;
                    $scope.showResponse = false;
                    $scope.hideFields = true;
                
                }

                if( $scope.translationUnit.lexicalGap == undefined && $scope.synsetToBeDeleted){
                    $scope.gapSelected.checkBoxGap=true;
                    $scope.showSummaryGap = true;
                    $scope.showResponse = true; //different when gap is not present
                    $scope.hideFields = false;
                    $scope.checkBoxGapVariable      = true;

                }

               if( $scope.translationUnit.lexicalGap == undefined){
                    $scope.gapSelected.checkBoxGap=false;

                    $scope.showSummaryGap = true;
                    $scope.showResponse = false;
                    $scope.hideFields = true;
                    
               }
            }


            if( (status_validated_lkc == 0) && (status_rejected_lkc == 0) && (status_rejected_ukc == 0) &&
                (status_validation_lkc_pending == 0) && (status_Validation_ukc_Pending !== 0) ){
                $scope.submitedMessage      =   "This activity has been sent to validation. Unfortunatelly you cannot edit it";
                $scope.onlyVisualizeState   = true;
                
                $scope.objectState = $scope.translationUnit.objectInfoMap[i].status;


                if( $scope.translationUnit.lexicalGap !== undefined && !$scope.gapToBeDeleted){
                    
                    $scope.gapSelected.checkBoxGap=true;
                    $scope.showSummaryGap = true;
                    $scope.showResponse = true; //different when gap is not present
                    $scope.hideFields = false;
                    $scope.checkBoxGapVariable      = true;

               }

               if( $scope.translationUnit.lexicalGap !== undefined && $scope.gapToBeDeleted){
                    $scope.gapSelected.checkBoxGap=false;

                    $scope.showSummaryGap = true;
                    $scope.showResponse = false;
                    $scope.hideFields = true;
                
                }
                if( $scope.translationUnit.lexicalGap == undefined && $scope.synsetToBeDeleted){
                    $scope.gapSelected.checkBoxGap=true;
                    $scope.showSummaryGap = true;
                    $scope.showResponse = true; //different when gap is not present
                    $scope.hideFields = false;
                    $scope.checkBoxGapVariable      = true;

                }

               if( $scope.translationUnit.lexicalGap == undefined){
                    $scope.gapSelected.checkBoxGap=false;

                    $scope.showSummaryGap = true;
                    $scope.showResponse = false;
                    $scope.hideFields = true;
                    
               }
            }


            if( ((status_validated_ukc !== 0 ) || (status_rejected_ukc !== 0) ) && ((status_Validation_ukc_Pending !== 0) ||
                (status_validation_lkc_pending !== 0)) && (status_validated_lkc == 0) && (status_rejected_lkc == 0) && 
                (status_translated == 0)
                 ){
                $scope.elementValidated = true;
                $scope.submitedMessage      =   "This activity has been sent to validation. Unfortunatelly you cannot edit it";
                $scope.onlyVisualizeState   = true;
                
                $scope.objectState = $scope.translationUnit.objectInfoMap[i].status;


                if( $scope.translationUnit.lexicalGap !== undefined && !$scope.gapToBeDeleted){
                    
                    $scope.gapSelected.checkBoxGap=true;
                    $scope.showSummaryGap = true;
                    $scope.showResponse = true; //different when gap is not present
                    $scope.hideFields = false;
                    $scope.checkBoxGapVariable      = true;

               }

               if( $scope.translationUnit.lexicalGap !== undefined && $scope.gapToBeDeleted){
                    $scope.gapSelected.checkBoxGap=false;

                    $scope.showSummaryGap = true;
                    $scope.showResponse = false;
                    $scope.hideFields = true;
                    
                }

                if( $scope.translationUnit.lexicalGap == undefined && $scope.synsetToBeDeleted){
                    $scope.gapSelected.checkBoxGap=true;
                    $scope.showSummaryGap = true;
                    $scope.showResponse = true; //different when gap is not present
                    $scope.hideFields = false;
                    $scope.checkBoxGapVariable      = true;

                }
               if( $scope.translationUnit.lexicalGap == undefined){
                    $scope.gapSelected.checkBoxGap=false;

                    $scope.showSummaryGap = true;
                    $scope.showResponse = false;
                    $scope.hideFields = true;
                    
               }
            }


            if( (status_validated_ukc !== 0 ) && (status_Validation_ukc_Pending == 0) && (status_translated == 0 ) &&
                (status_validation_lkc_pending == 0) && (status_validated_lkc == 0) && (status_rejected_lkc == 0)
                 ){
                
                $scope.submitedMessage      =   "This activity has been sent to validation. Unfortunatelly you cannot edit it";
                $scope.onlyVisualizeState   = true;
                $scope.elementValidated = true;
                
                $scope.objectState = $scope.translationUnit.objectInfoMap[i].status;


                if( $scope.translationUnit.lexicalGap !== undefined && !$scope.gapToBeDeleted){
                    
                    $scope.gapSelected.checkBoxGap=true;
                    $scope.showSummaryGap = true;
                    $scope.showResponse = true; //different when gap is not present
                    $scope.hideFields = false;
                    $scope.checkBoxGapVariable      = true;

               }

               if( $scope.translationUnit.lexicalGap !== undefined && $scope.gapToBeDeleted){
                        $scope.gapSelected.checkBoxGap=false;

                        $scope.showSummaryGap = true;
                        $scope.showResponse = false;
                        $scope.hideFields = true;
                    
                }

                if( $scope.translationUnit.lexicalGap == undefined && $scope.synsetToBeDeleted){
                    $scope.gapSelected.checkBoxGap=true;
                    $scope.showSummaryGap = true;
                    $scope.showResponse = true; //different when gap is not present
                    $scope.hideFields = false;
                    $scope.checkBoxGapVariable      = true;

                }
               if( $scope.translationUnit.lexicalGap == undefined){
                    $scope.gapSelected.checkBoxGap=false;

                    $scope.showSummaryGap = true;
                    $scope.showResponse = false;
                    $scope.hideFields = true;
                    
               }
            }


            //if((status_Revision_Pending_ukc !== 0) || (status_Revision_Pending_lkc !== 0)){
            if((status_Revision_Pending_ukc !== 0)  && ((status_validated_ukc == 0) || (status_validated_ukc !== 0)) ){
                $scope.objectState = $scope.translationUnit.objectInfoMap[i].status;
                $scope.elementValidated = true;
                $scope.reVisit = true; 
                $scope.mixedStatus = true;
                $scope.onlyVisualizeState   = false;

                $scope.rejectionMessage = "Your translation is not correct. Understand why by reading the comments";
               if( $scope.translationUnit.lexicalGap !== undefined && !$scope.gapToBeDeleted){
                    
                    $scope.gapSelected.checkBoxGap=true;
                    $scope.showSummaryGap = true;
                    $scope.showResponse = true; //different when gap is not present
                    $scope.hideFields = false;
                    $scope.checkBoxGapVariable      = true;

               }

               if( $scope.translationUnit.lexicalGap !== undefined && $scope.gapToBeDeleted){
                    $scope.gapSelected.checkBoxGap=false;

                    $scope.showSummaryGap = true;
                    $scope.showResponse = false;
                    $scope.hideFields = true;
                    
                }
                if( $scope.translationUnit.lexicalGap == undefined && $scope.synsetToBeDeleted){
                    $scope.gapSelected.checkBoxGap=true;
                    $scope.showSummaryGap = true;
                    $scope.showResponse = true; //different when gap is not present
                    $scope.hideFields = false;
                    $scope.checkBoxGapVariable      = true;

                }

               if( $scope.translationUnit.lexicalGap == undefined){
                    $scope.gapSelected.checkBoxGap=false;

                    $scope.showSummaryGap = true;
                    $scope.showResponse = false;
                    $scope.hideFields = true;
                    
               }
            }

            if( (status_Revision_Pending_lkc != 0 ) && (status_Validation_ukc_Pending != 0) && (status_translated == 0)){
                $scope.allRejected = false;
                $scope.mixedStatus = true;
                $scope.statusMixedMessage  = "Some of the following elements need review";
                $scope.onlyVisualizeState   = false;
                $scope.reVisit = true; 
                $scope.buttonSendValidation = false;

                if( $scope.translationUnit.lexicalGap !== undefined && !$scope.gapToBeDeleted){
                    
                    $scope.gapSelected.checkBoxGap=true;
                    $scope.showSummaryGap = true;
                    $scope.showResponse = true; //different when gap is not present
                    $scope.hideFields = false;
                    $scope.checkBoxGapVariable      = true;

               }

                if( $scope.translationUnit.lexicalGap !== undefined && $scope.gapToBeDeleted){
                        $scope.gapSelected.checkBoxGap=false;

                        $scope.showSummaryGap = true;
                        $scope.showResponse = false;
                        $scope.hideFields = true;
                    
                }

                if( $scope.translationUnit.lexicalGap == undefined && $scope.synsetToBeDeleted){
                    $scope.gapSelected.checkBoxGap=true;
                    $scope.showSummaryGap = true;
                    $scope.showResponse = true; //different when gap is not present
                    $scope.hideFields = false;
                    $scope.checkBoxGapVariable      = true;

                }
               if( $scope.translationUnit.lexicalGap == undefined){
                    $scope.gapSelected.checkBoxGap=false;

                    $scope.showSummaryGap = true;
                    $scope.showResponse = false;
                    $scope.hideFields = true;
                    
               }

                return true;
            }
            if( (status_Revision_Pending_lkc > 0) && (status_Validation_ukc_Pending == 0) && (status_translated == 0)){
                    $scope.allRejected = true;
                    $scope.mixedStatus = false;
                    $scope.buttonSendValidation = false;


                    $scope.reVisit = true; 
                    $scope.mixedStatus = true;
                    $scope.onlyVisualizeState   = false;


                    $scope.rejectionMessage = "Your translation is not correct. Understand why by reading the comments";
                   if( $scope.translationUnit.lexicalGap !== undefined && !$scope.gapToBeDeleted){
                        
                        $scope.gapSelected.checkBoxGap=true;
                        $scope.showSummaryGap = true;
                        $scope.showResponse = true; //different when gap is not present
                        $scope.hideFields = false;
                        $scope.checkBoxGapVariable      = true;

                   }
                   if( $scope.translationUnit.lexicalGap !== undefined && $scope.gapToBeDeleted){
                        $scope.gapSelected.checkBoxGap=false;

                        $scope.showSummaryGap = true;
                        $scope.showResponse = false;
                        $scope.hideFields = true;
                    
                   }

                   if( $scope.translationUnit.lexicalGap == undefined && $scope.synsetToBeDeleted){
                        $scope.gapSelected.checkBoxGap=true;
                        $scope.showSummaryGap = true;
                        $scope.showResponse = true; //different when gap is not present
                        $scope.hideFields = false;
                        $scope.checkBoxGapVariable      = true;

                    }

                   if( $scope.translationUnit.lexicalGap == undefined){
                        $scope.gapSelected.checkBoxGap=false;

                        $scope.showSummaryGap = true;
                        $scope.showResponse = false;
                        $scope.hideFields = true;
                    
                    }

                return false;


                }
                
            
            if((status_translated !=0 ) && (status_Validation_ukc_Pending != 0 ) && (status_Revision_Pending_lkc == 0)){
                $scope.allRejected = false;
                $scope.mixedStatus = true;
                $scope.translationStored  = "The following translation was stored in your records";
                $scope.onlyVisualizeState   = false;
                $scope.reVisit = true; 
                $scope.buttonSendValidation = true;
                $scope.sendToValidator         = true; // if the object is translated, It can be send to next level
                $scope.showSummaryGap = false

                return true;
            }

            
            if((status_translated !=0 ) && (status_Validation_ukc_Pending == 0 ) && (status_Revision_Pending_lkc == 0) &&
                ((status_validated_ukc == 0) || (status_validated_ukc !=0) )){
                $scope.buttonGoAhead = true;
                $scope.objectState = $scope.translationUnit.objectInfoMap[i].status;
                $scope.objectTranslated = true;


               $scope.reVisit = true; 
               $scope.translationStored = "This translation was stored in your records"
               $scope.sendToValidator         = true;

               if (status_validated_ukc !=0){
                    $scope.elementValidated = true;
               }
               if( $scope.translationUnit.lexicalGap !== undefined && !$scope.gapToBeDeleted){
                    
                    $scope.gapSelected.checkBoxGap=true;
                    $scope.showSummaryGap = true;
                    $scope.showResponse = true; //different when gap is not present
                    $scope.checkBoxGapVariable      = true;
                    $scope.translatedGAP = true;

               }

               if( $scope.translationUnit.lexicalGap !== undefined && $scope.gapToBeDeleted){
                        $scope.gapSelected.checkBoxGap=false;

                        $scope.showSummaryGap = true;
                        $scope.showResponse = false;
                        $scope.hideFields = true;
                    
                }

                if( $scope.translationUnit.lexicalGap == undefined && $scope.synsetToBeDeleted){
                    $scope.gapSelected.checkBoxGap=true;
                    $scope.showSummaryGap = true;
                    $scope.showResponse = true; //different when gap is not present
                    $scope.hideFields = false;
                    $scope.checkBoxGapVariable      = true;

                }

               if( $scope.translationUnit.lexicalGap == undefined){
                    $scope.gapSelected.checkBoxGap=false;
                    $scope.translatedGAP = false;

                    $scope.showSummaryGap = true;
                    $scope.showResponse = false;
                    
               }
            }

                   
        }

        $http.get('lkcApp/translationUnit/' + $scope.assignmentId + '/' + $scope.conceptId)
            .success(function(data) {
                
                $scope.translationUnit = data;

                $scope.originalTranslationUnit = data;
                if(data !== {} && data.synset !== {} && data.synset !== undefined && data.synset.senses.length > 0)
                    $scope.word.synsetWordRank = data.synset.senses[data.synset.senses.length -1 ].synsetWordRank +1;
                // update lexical gap
                if($scope.translationUnit.lexicalGap !== undefined){
                    $scope.translationUnit.lexicalGap.present = true;
                }    
                $scope.infoMap = $scope.translationUnit.objectInfoMap;

                console.log("Object InforMat ");
                console.log($scope.infoMap);
                if (!(Object.keys($scope.infoMap).length >= 1) ){
                    console.log("object exists");
                    $scope.statusTranslated = true;
                }

                if (Object.keys($scope.infoMap).length >= 1) {
                    $scope.objectStatus = $scope.objectGeneralStatus();
                    for (var i in $scope.translationUnit.objectInfoMap){
                        if($scope.translationUnit.objectInfoMap[i].status === "DELETE_REQUESTED"){
                            var objectInfo = $scope.translationUnit.objectInfoMap[i];
                            $scope.translationUnit.objectInfoMap[i] = {
                                assignmentId : objectInfo.assignmentId,
                                conceptId : objectInfo.conceptId,
                                userDetails: {
                                    id : objectInfo.userDetails.id,
                                    name : objectInfo.userDetails.name
                                },
                               status : "DELETE_REQUESTED",
                               comment: "Element to be deleted",
                               translator : objectInfo.translator,
                               deleteRequest: true,
                               local: true,
                               action : "DELETE" 
                            }
                        }
                    }
                }else {
                    $scope.objectTranslated = false;

                    //$scope.showInitialQuestion = true;
                }
                $scope.updateSaveFlag();
                $scope.logDisabled = false;
                
            })
            .error(function(data){
                $scope.assignmentNotFound = true;
            });



        /*  added by mercedes*/
        $scope.showSummary = function(booleanVar){
            $scope.showSummaryGap = true;
            $scope.backButton = "inSummary";
            console.log("show summary reVisit " + $scope.reVisit);
            if (booleanVar == true){
                $scope.showResponse = true;

                $scope.isGap = "true";
            } 
            if(booleanVar == false){
                $scope.showResponse = false;
                $scope.introduceExample = false;
                $scope.isGap = "false";
            }
        }

        $scope.buttonNext = function(actionNext){

            if (actionNext =="YesGap"){
                $scope.backButton = "commentGloss";
                $scope.showSummaryGap = undefined;
                $scope.lexicalGapPresent = true;
                $scope.fromGaptoNoGap =false;
                $scope.fromNoGapToGap = true;
                $scope.gapDefined = false;
                console.log("yesGap");
                
            }
            if(actionNext == "NoGap"){
                $scope.tableTask = true;
                $scope.lexicalGapPresent = false;
                $scope.fromNoGapToGap = false;
                $scope.fromGaptoNoGap =true;
                $scope.showResponse = false;

                $scope.gapDefined = true;
                
            }
            if ($scope.reVisit == true) {

                if ($scope.translationUnit.lexicalGap == undefined){
                    
                    if (actionNext == "comeLater"){
                        $scope.comeLater = true;
                        $scope.showSummaryGap = false;
                        $scope.introduceExample = undefined;
                    }
                    if(actionNext == "sendValidation"){
                        $scope.sendValidation = true;
                        $scope.showSummaryGap = false;
                        $scope.introduceExample = undefined;
                        $scope.tableTask = undefined;
                    }
                }
                if ($scope.translationUnit.lexicalGap !== undefined){
                    if (actionNext == "comeLater"){
                        $scope.comeLater = true;
                        $scope.showSummaryGap = false;
                        $scope.introduceExample = undefined;
                    }
                    if(actionNext == "sendValidation"){
                        $scope.sendValidation = true;
                        $scope.showSummaryGap = false;
                        $scope.introduceExample = undefined;
                        $scope.tableTask = undefined;
                    }
                }
            }

            if ((actionNext == "comeLater") && ($scope.reVisit == undefined)){
                $scope.buttonGoAhead = true; //CHECK IF THIS IS CORRECT
                $scope.comeLater = true;
                $scope.showSummaryGap = false;
                $scope.introduceExample = undefined;
            }
            
            if ((actionNext == "sendValidation") && ($scope.reVisit == undefined)) {
                $scope.sendValidation = true;
                $scope.showSummaryGap = false;
                $scope.introduceExample = undefined;
                $scope.tableTask = undefined;
                
            }

            if(actionNext == "introduceExample"){
                $scope.introduceExample = true;
                $scope.tableTask = undefined;
            }

            if(actionNext == 'nextItem'){
                $scope.infoMap = $scope.translationUnit.objectInfoMap;

                $scope.lexicalizationForm.$setPristine(); 
                                      
            }
        }

        $scope.checkDelete_Requested = function(){
            for(var i in $scope.translationUnit.objectInfoMap){
                if($scope.translationUnit.objectInfoMap[i].status === 'TRANSLATED'){
                    $scope.validationFlag = true;
                    break;
                }
            }
        }
       // $scope.goAheadFunction = function(isGap){
       $scope.goAheadFunction = function(){
            if($scope.showSummaryGap == true && $scope.showResponse == false){
                var sensesvalid = false;
                var exampleValid = false;
                if($scope.translationUnit.synset !== undefined){     
                    if($scope.translationUnit.synset.senses !== undefined){            
                        sensesvalid = $scope.translationUnit.synset.senses.length > 0; 
                    }
                }
                if ($scope.translationUnit.synsetExamples !== undefined){
                    if ($scope.translationUnit.synsetExamples.length !== undefined){
                        exampleValid = $scope.translationUnit.synsetExamples.length >0;
                    }
                } 
                $scope.checkDelete_Requested();
                
                return (sensesvalid && exampleValid && $scope.glossWithRightLength() && ($scope.translationUnit.synset.partOfSpeech !== undefined) ); 
                
            }

            //}else{
            //}
            if($scope.showSummaryGap == true && $scope.showResponse == true){
                return ($scope.commentWhyGap() && $scope.glossGAPWithRightLength()); 

            }
        }
       

        $scope.gapSelected = function (variable){
           
            if(variable=="yestono"){
                $scope.fromGaptoNoGap = true;
                $scope.fromNoGapToGap = false;

                if($scope.translationUnit.lexicalGap == undefined){
                    $scope.gapDefined       = false;
                    $scope.disabledButton   = false;
                    $scope.showResponse     = false;
                    $scope.hideFields       = true;
                                
                }
                if($scope.translationUnit.lexicalGap !== undefined){
                    $scope.gapDefined       = true;
                    $scope.showResponse     = false;
                    $scope.hideFields       = true;
                    $scope.disabledButton   = true;
                    $scope.buttonSendValidation = false; // when the status is PENDING_VALIDATION/LKC   

                }
            }
            if(variable == "notoyes"){
                $scope.fromGaptoNoGap = false;
                $scope.fromNoGapToGap = true;

                if($scope.translationUnit.lexicalGap == undefined){
                    $scope.gapDefined       = false;

                    $scope.hideFields = false;
                    $scope.showResponse = true;
                    var lexicalGap = {};
                    lexicalGap.present = true;
                    $scope.disabledButton = true;
                    $scope.buttonSendValidation = false; // when the status is PENDING_VALIDATION/LKC   

                    $scope.buttonGoAhead = false;
                }
                if($scope.translationUnit.lexicalGap !== undefined){
                    $scope.gapDefined       = true;

                    $scope.hideFields       = false;
                    $scope.showResponse     = true;
                    $scope.disabledButton   = false;
                    
                }    
                
                    
            }
        }    

        $scope.buttonBackFromEnd = function(actionBack){
            
            if (actionBack == 'revisiting'){
                $scope.reEdit  = true;
                $scope.buttonSendValidation = true;
                
            }
        }

        $scope.buttonBack = function(actionBack){
            
            if (actionBack === "formIsGAP"){
                
                $scope.backButton = undefined;
                $scope.lexicalGapPresent = undefined;
                
                $scope.showSummaryGap = undefined;
            }
            if (actionBack === "true"){
                $scope.translationUnit.lexicalGap.present = true;
                $scope.showSummaryGap = undefined;
                console.log ( $scope.backButton + "   " + $scope.lexicalGapPresent + "    " + $scope.showSummaryGap);
            }
            
            if ($scope.reVisit == true){
                if ($scope.translationUnit.lexicalGap == undefined){
                
                    if (actionBack === "inComeLater"){
                        $scope.tableTask = undefined;
                        $scope.showSummaryGap = true;
                        $scope.comeLater = undefined; 
                        $scope.sendValidation = undefined;

                    }
                    if(actionBack === "inSendValiation"){
                        $scope.tableTask = undefined;
                        $scope.showSummaryGap = true;
                        $scope.introduceExample = undefined;
                        $scope.sendValidation = undefined;

                    }
                }
                if ($scope.translationUnit.lexicalGap !== undefined){
                
                    if(actionBack === "inSendValiation"){
                        $scope.tableTask        = undefined;
                        $scope.showSummaryGap   = true;
                        $scope.comeLater        = undefined; 
                        $scope.sendValidation   = undefined;

                    } 
                    if (actionBack === "inComeLater"){
                        $scope.tableTask        = undefined;
                        $scope.showSummaryGap   = true;
                        $scope.comeLater        = undefined; 
                        $scope.sendValidation   = undefined;


                    }   
                }

            }

            if ((actionBack === 'inComeLater') && ($scope.reVisit == undefined)){
                $scope.tableTask = undefined;
                $scope.showSummaryGap = true;
                $scope.introduceExample = undefined;
                $scope.comeLater = undefined; 
                $scope.sendValidation = undefined;   
            }
            if ((actionBack === 'inSendValiation')&& ($scope.reVisit == undefined)){

                $scope.tableTask = undefined;
                $scope.showSummaryGap = true;
                $scope.introduceExample = undefined;
                $scope.sendValidation = undefined;
            }
            
            if(actionBack === 'exampleAdded'){
                $scope.introduceExample = undefined;
                $scope.lexicalGapPresent = false;
                $scope.tableTask = true;
            }

            if(actionBack === "false"){
                $scope.introduceExample = true; 
                $scope.lexicalGapPresent = false;
                $scope.showSummaryGap = undefined;
            }

            if(actionBack === "errorSaving"){
                $scope.tableTask = undefined;
                $scope.showSummaryGap = true;
                $scope.introduceExample = undefined;
                $scope.sendValidation = undefined;
            }
            

        }
        /*8888888888888888888*/
        $scope.buttonGlossGap = function (){
            return $scope.glossGAPWithRightLength() && $scope.commentWhyGap();
        }

        $scope.buttonDisableLemma = function(){
            return $scope.lemmaAdded && $scope.translationUnit.synset.partOfSpeech && $scope.glossWithRightLength();        
        }

        $scope.buttonDisableExample = function(){
            return $scope.exampleAdded;
        }

        $scope.updateSaveFlag = function(){
            $scope.saveFlag = (($scope.translationUnit.synset !== undefined) && ($scope.translationUnit.synset.senses !== undefined) && $scope.translationUnit.synset.senses.length > 0)
            || $scope.isGapValid()
        };


        $scope.glossWithRightLength = function(){
            if($scope.translationUnit.synset !== undefined){
                if($scope.translationUnit.synset.gloss !== undefined){
                    return ($scope.translationUnit.synset.gloss.length > 0);
                }
            }
            
        };

        $scope.glossGAPWithRightLength = function(){
            if($scope.translationUnit.lexicalGap !== undefined){
                if($scope.translationUnit.lexicalGap.gloss !== undefined){
                    return ($scope.translationUnit.lexicalGap.gloss.length > 0);
                }
            }
            
        };

        $scope.commentWhyGap = function(){
            var commentLength = false;
            for(var i in $scope.reasonsGAP){
                if($scope.reasonsGAP[i])
                    commentLength = true;
            }
            if($scope.translationUnit.lexicalGap !== undefined){
                if($scope.translationUnit.lexicalGap.comment !== undefined){
                    commentLength = $scope.translationUnit.lexicalGap.comment.length > 0;
                }
            }
            
            
            
            return commentLength;

        };

       $scope.exampleWithRightLength = function(){
            if($scope.exampleRevisit !== undefined){
                    return ($scope.exampleRevisit.length > 0);
                
            }
        }


        $scope.updateValidationFlag = function(){
            $scope.validationFlag = false;
            for(var i in $scope.translationUnit.objectInfoMap){
                if($scope.translationUnit.objectInfoMap[i].status === 'TRANSLATED'){
                    $scope.validationFlag = true;
                    break;
                }
            }
        };

        $scope.isGapValid = function() {
            return ($scope.translationUnit.lexicalGap !== undefined && $scope.translationUnit.lexicalGap.present == true && $scope.translationUnit.lexicalGap.gloss !== undefined && $scope.translationUnit.lexicalGap.gloss != "");
        };


/*
WHEN PRESSING THE BUTTON DELETE NEXT TO THE WORD JUST ADDED, WE DELETE THE WORD,THE EXCEPTIONAL FORMS AND DECREASE THE RANK
*/
        $scope.deleteLemma = function(index){
            
            
            var wordToDeleteList = $scope.translationUnit.synset.senses;
            if(wordToDeleteList[index].id !== undefined){

                var wordFormId = 0;
                var wordFormContent = undefined;

                if(wordToDeleteList[index].word.forms.length > 0){

                    for(var t=0; t<wordToDeleteList[index].word.forms.length; t++){
                        wordFormId = wordToDeleteList[index].word.forms[0].id;
                        $scope.translationUnit.objectInfoMap['WORD_FORM.' + wordFormId].deleteRequest = true;

                        wordFormContent = $scope.translationUnit.objectInfoMap['WORD_FORM.' + wordFormId];

                        $scope.translationUnit.objectInfoMap['WORD_FORM.' + wordFormId] = {
                            assignmentId : wordFormContent.assignmentId,
                            conceptId : wordFormContent.conceptId,
                            userDetails: {
                                id : wordFormContent.userDetails.id,
                                name : wordFormContent.userDetails.name
                            },
                           status : "DELETE_REQUESTED",
                           comment: "Word form deleted",
                           translator : wordFormContent.translator,
                           deleteRequest: true,
                           local: true,
                           action : "DELETE" 
                        };

                    }
                } else {
                    delete wordToDeleteList[index].word.forms;
                }

                var wordId = wordToDeleteList[index].word.id
                var senseToDelete = $scope.translationUnit.objectInfoMap['SENSE.'+ wordToDeleteList[index].id];
                $scope.translationUnit.objectInfoMap['SENSE.'+ wordToDeleteList[index].id] = {
                    assignmentId : senseToDelete.assignmentId,
                    conceptId : senseToDelete.conceptId,
                    userDetails: {
                        id: senseToDelete.userDetails.id,
                        name : senseToDelete.userDetails.name
                    },
                    status : "DELETE_REQUESTED",
                    comment: "Sense translation to be deleted",
                    translator : senseToDelete.translator,
                    deleteRequest : true,
                    local: true,
                    action : "DELETE"
                };

                var wordToDelete = $scope.translationUnit.objectInfoMap['WORD.'+ wordId];
                $scope.translationUnit.objectInfoMap['WORD.'+ wordId] = {
                    assignmentId : wordToDelete.assignmentId,
                    conceptId : wordToDelete.conceptId,
                    userDetails : {
                        id: wordToDelete.userDetails.id,
                        name : wordToDelete.userDetails.name
                    },
                    status : "DELETE_REQUESTED",
                    comment: "Word form to be deleted",
                    translator : wordToDelete.translator,
                    deleteRequest : true,
                    local: true,
                    action : "DELETE"  
                };
            }    
            

            if(wordToDeleteList[index].id == undefined){
                wordToDeleteList.splice(index,1);
            }    
            if (wordToDeleteList.length < 1){
                $scope.lemmaAdded = false;    
            }
            $scope.word.synsetWordRank--;
        }


        $scope.pushLemma = function(){
            $scope.lemmaAdded = true;
            if($scope.word.word.lemma === "")
                return;
            if($scope.translationUnit.synset === undefined)
                $scope.translationUnit.synset = {};
            if($scope.translationUnit.synset.senses === undefined)
                $scope.translationUnit.synset.senses = [];
            var element = angular.copy($scope.word);

            if(element.word.forms === "")
                delete(element.word.forms);
            else if(element.word.forms.indexOf(',') !== -1){
                var forms = element.word.forms.split(',');
                element.word.forms = [];
                for(var i in forms){
                    element.word.forms.push({
                        form: forms[i],
                        partOfSpeech: $scope.translationUnit.synset.partOfSpeech || ''
                    });
                }
            }else
                element.word.forms = [{
                    form: element.word.forms,
                    partOfSpeech: $scope.translationUnit.synset.partOfSpeech || ''
                }];
            $scope.translationUnit.synset.senses.push(element);
            $scope.word.word = {lemma: "", forms: ""};
            $scope.word.synsetWordRank++;
            $scope.updateSaveFlag();
            
        };

        
        
        $scope.pushExample = function(){
            
            if($scope.example.text === "")
                return;
            if($scope.translationUnit.synsetExamples === undefined)
                $scope.translationUnit.synsetExamples = [];

            var exampleObj = {
                //text: angular.copy($scope.word.text)
                text: angular.copy($scope.example.text)

            };
            $scope.translationUnit.synsetExamples.push(exampleObj);
            $scope.example.text = '';
            $scope.exampleAdded = true;
           
        };

        $scope.deleteExample = function(index){
            var exampleToDelete = $scope.translationUnit.synsetExamples;
            if(exampleToDelete[index].id !== undefined){

                var exampleId = exampleToDelete[index].id;
                var exampleToDeleteNew = $scope.translationUnit.objectInfoMap['SYNSET_EXAMPLE.'+ exampleId];
                
                $scope.translationUnit.objectInfoMap['SYNSET_EXAMPLE.'+ exampleId] = {
                    assignmentId : exampleToDeleteNew.assignmentId,
                    conceptId : exampleToDeleteNew.conceptId,
                    userDetails: {
                        id: exampleToDeleteNew.userDetails.id,
                        name : exampleToDeleteNew.userDetails.name
                    },
                    status : "DELETE_REQUESTED",
                    comment: "Sense translation to be deleted",
                    translator : exampleToDeleteNew.translator,
                    deleteRequest : true,
                    local: true,
                    action : "DELETE"
                };
            }   
            //console.log (exampleToDelete);
            if(exampleToDelete[index].id == undefined){

                exampleToDelete.splice(index,1);
                
            }
            if(exampleToDelete.length < 1) {
                $scope.exampleAdded = false;
            }
            
        }

        $scope.sendToValidation = function(isValid){
            $scope.sendValidation = undefined; 
            $scope.showResponse = undefined;

            if(!$scope.translationUnit.lexicalGap && $scope.translationUnit.synset.senses.length === 0)
                isValid = false;
            if (isValid) {
                if($scope.translationUnit.lexicalGap !== undefined && $scope.translationUnit.lexicalGap.present === false){
                    delete $scope.translationUnit['lexicalGap'];
                }
                if($scope.translationUnit.lexicalGap !== undefined && $scope.translationUnit.lexicalGap.present === true){
                    console.log("It's a GAP! " );
                }

                $http.post('lkcApp/translationUnit/' + $scope.assignmentId + '/' + $scope.conceptId, $scope.translationUnit)
                    .success(function(data){
                        if(data !== {}){
                            $scope.translationUnit = data;
                            $http.post('lkcApp/submitForValidation/' + $scope.assignmentId + '/' + $scope.conceptId)
                                .success(function(data){
                                    $scope.infoMessage = data;
                                    if(data.code){
                                        if((data.code == 400) || (data.code == 500)){
                                            $scope.errorMessage = "Validation error: Your translation was not sent to the validator. An error occurred.";
                                            $scope.showSuccess  = true;
                                            $scope.comeLater    = undefined;
                                            $scope.translationStored = '';
                                            $scope.rejectionMessage = '';
                                            $scope.statusMixedMessage = '';
                                        

                                        }
                                    }else 
                                        if(data !== {}){
                                            $scope.successMessage = "Translation successfully sent for validation";
                                            $scope.showSuccess  = true;
                                            
                                            $scope.translationUnit = data;
                                            $scope.translationStored = '';
                                            $scope.statusMixedMessage = '';
                                            $scope.rejectionMessage = '';
                                            $scope.statusMixedMessage='';
                                        }         
                                });
                        }
                    });
                    
            }else{
                console.log("Form not valid");
            }
        };

        $scope.addExceptionalForm = function(wordNode){
            if(!('forms' in wordNode))
                wordNode.forms = [];
            var elements = wordNode.temp.split(',');
            for(var i in elements){
                var element = {
                    form: elements[i],
                    partOfSpeech: $scope.translationUnit.synset.partOfSpeech
                };
                wordNode.forms.push(element);
            }

            delete wordNode['temp'];
        };



        /*
         * SAVE
         */
        $scope.submitLexicalizationForm = function(isValid) {
            $scope.errorMessage = "";
            $scope.successMessage = "";
            $scope.infoMessage = "";
            $scope.comeLater = undefined;
            $scope.showResponse = undefined;
            if(!$scope.translationUnit.lexicalGap && $scope.translationUnit.synset.senses.length === 0){
                isValid = false;
            }
            if (isValid) {

                if($scope.translationUnit.lexicalGap !== undefined && $scope.translationUnit.lexicalGap.present === false){
                    delete $scope.translationUnit['lexicalGap'];
                }
              if($scope.translationUnit.objectInfoMap){
                    // re-translation
                    for(var i in $scope.translationUnit.objectInfoMap)
                    {
                        var obId = i;
                        /*console.log($scope.originalTranslationUnit);
                            
                        if($scope.originalTranslationUnit.objectInfoMap[obId] !== undefined)
                        {
                            // if changed -> delete comment
                            var changed = false;
                            if(obId.indexOf('SYNSET.') == 0){
                                if($scope.translationUnit.synset.gloss != $scope.originalTranslationUnit.synset.gloss)
                                    changed = true;
                                if($scope.translationUnit.synset.partOfSpeech != $scope.originalTranslationUnit.synset.partOfSpeech)
                                    changed = true;
                            }
                            if(obId.indexOf('LEXICAL_GAP.') == 0){
                                if($scope.translationUnit.lexicalGap.gloss != $scope.originalTranslationUnit.lexicalGap.gloss)
                                    changed = true;
                                if($scope.translationUnit.lexicalGap.comment != $scope.originalTranslationUnit.lexicalGap.comment)
                                    changed = true;
                            }

                            if(changed)
                                $scope.objectInfoMap[obId].comment = "";

                        }*/
                        $scope.translationUnit.objectInfoMap[obId].comment = "";
                    }
                }
                
               
               if($scope.fromGaptoNoGap && $scope.gapDefined && !$scope.fromNoGapToGap){
                    if($scope.translationUnit.lexicalGap !== undefined)
                        delete $scope.translationUnit.lexicalGap;
                } 
                
                if($scope.fromNoGapToGap && !$scope.gapDefined && !$scope.fromGaptoNoGap){
                    if($scope.translationUnit.synset !== undefined)
                        delete $scope.translationUnit.synset;
                    if($scope.translationUnit.synsetExamples !== undefined)
                        delete $scope.translationUnit.synsetExamples;
                }

                //adding POS to exceptional WordForms
                if($scope.translationUnit.synset){
                    var senseList = $scope.translationUnit.synset.senses;
                    var wordFormList = undefined;
                    for(var z = 0; z < senseList.length; z++){

                        if(senseList[z].word.forms !== undefined){
                            wordFormList = senseList[z].word.forms;
                            for(var r = 0; r < wordFormList.length; r ++){
                                wordFormList[r].partOfSpeech = $scope.translationUnit.synset.partOfSpeech;
                            }
                        }
                    }
                }

                
                $http.post('lkcApp/translationUnit/' + $scope.assignmentId + '/' + $scope.conceptId, $scope.translationUnit)
                    .success(function(data){
                        $scope.infoMessage = data;
                        if(data.code){
                            if((data.code == 400) || (data.code == 500)){
                                $scope.errorMessage = "Validation error: Your translation was not saved. An error occurred.";
                                $scope.showSuccess  = true;
                                $scope.comeLater    = undefined;
                                $scope.translationStored = '';
                                $scope.rejectionMessage = '';
                                $scope.statusMixedMessage = '';
                            

                            }
                        }else 
                        if(data !== {}){
                            $scope.successMessage = "Translation sucessfully saved in your records";
                            $scope.showSuccess  = true;
                            $scope.translationUnit          = data;
                            $scope.originalTranslationUnit  = data;
                            $scope.comeLater    = undefined;
                            $scope.translationStored = '';
                            $scope.rejectionMessage = '';
                            $scope.statusMixedMessage = '';
                            /* not sure is this is correcta anymore*/
                           if($scope.translationUnit.lexicalGap !== undefined){
                                $scope.translationUnit.lexicalGap.present = true;
                            }
                                
                       }
                    });
            
            }else{
                console.error("form not valid");
            }
        };

    }]);

});