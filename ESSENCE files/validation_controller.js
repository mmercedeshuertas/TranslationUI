'use strict';
define(['kos.arbalest', 'angularAMD', 'angular.ui.router'],
    function(app, angularAMD){
    var appNameSpace = 'lkcApp';

//define(['js/koosApp', 'angularAMD', 'angular.ui.router'], function(app, angularAMD){
//    'use strict';
    // LKC Validator
    // 
    app.directive('lkcSynsetLkcValidation', function(){
        return {
            restrict    : 'E',
            templateUrl : app.requireResourceFile(appNameSpace, 'synsetLKCValidation.jade')
        };
    });

    app.directive('lkcSensesLkcValidation', function(){
        return {
            restrict    : 'E',
            templateUrl : app.requireResourceFile(appNameSpace, 'sensesLKCValidation.jade')
        };
    });

    app.directive('lkcExamplesLkcValidation', function(){
        return {
            restrict    : 'E',
            templateUrl : app.requireResourceFile(appNameSpace, 'examplesLKCValidation.jade')

        };
    });

    app.kosController(appNameSpace, 'LKCAPP_ValidationController',
            ['$scope', '$http', '$state', '$controller',
            function ($scope, $http, $state, $controller) {
        
        $controller('lkcApp::LKCAPP_BaseController', {$scope: $scope});
        $scope.conceptId = $state.params.conceptId;
        $scope.assignmentId = $state.params.assignmentId;
        $scope.successMessage = "";
        $scope.translationUnit = {};
        $scope.validationUnit = {objectInfoMap: {}};
        $scope.validateEnabled      = false;
        $scope.logDisabled          = true;
        $scope.assignmentNotFound   = false;
        $scope.nextValidationConceptId  = "";
        $scope.syncedMessage            = "";
        $scope.notAvailableMessage      = "";
        $scope.notExistingTranslation   = "";
        $scope.rejectedMessage          = "";
        $scope.infoMessage              = "";


        $scope.leaveAComment            = undefined;
        $scope.acceptLemma              = undefined;
        $scope.acceptGloss              = undefined;
        $scope.acceptExample            = undefined;
        $scope.leaveACommentGloss       = undefined;
        $scope.leaveACommentExample     = undefined;
        $scope.leaveACommentExampleNew     = undefined;

        $scope.leaveACommentSense       = undefined;
        
        $scope.generalStatus            = undefined;
        $scope.comeLater                = undefined;
        $scope.sendToUKC                = undefined;
        $scope.showSuccess              = undefined;
        $scope.translationReview        = undefined;
        $scope.synsetRejected           = false;
        $scope.senseRejected            = false;
        $scope.exampleRejected          = false;
        $scope.sendToTranslator         = undefined;
        $scope.flagAllSenses            = false;

        $scope.sendToTranslatorButton   = undefined;

        $scope.readyForValidation       = undefined;
        $scope.readyForTranslation      = undefined;
        $scope.objectGap                = undefined;
        $scope.validated_lkc            = undefined; // variable ti disable buttons when gap

        $scope.nothingToValidate        = undefined;
        $scope.onlyConsult              = undefined;
        $scope.mixedStatus              = undefined;
        $scope.objectStatus             = undefined; 

        $scope.showButtonEdit           = undefined;
        $scope.editButton               = undefined;
        $scope.editGlossAfterReject     = undefined;
        $scope.allowGlossAfterReject    = undefined;
        $scope.allowExampleAfterReject  = undefined;
        $scope.words                    = [];
        $scope.examples                 = [];



        $scope.$watch("validationUnit" ,function(oldValue, newValue){
            $scope.updateStyles();
            //$scope.checkValidationEnabled();
            $scope.checkIfCanSubmitToUkcValidator();
            $scope.propagateActions();
        }, true);

        $scope.getNext($scope.assignmentId);

        $scope.buttonBack = function(action){
            if(action == "inComeLater"){
                $scope.generalStatus = undefined;
                $scope.comeLater = undefined;
            }
            if(action == "inSendValiation"){
                $scope.generalStatus = undefined;
                $scope.sendToUKC = undefined;
            }
            if(action == "inSendToTranslator"){
                $scope.sendToTranslator = undefined;
                $scope.generalStatus = undefined;
            }
        }


        $scope.buttonNext = function(action){
            console.log("next " + action);
            if(action == "sendToValidation"){
                $scope.comeLater = true;
                $scope.generalStatus = false;
                
            }
            if(action == 'sendToUKC'){
                $scope.sendToUKC = true;
                $scope.generalStatus = false;
                $scope.rejectedMessage ='';

            }
            if(action == 'sendToTranslator'){
                $scope.sendToTranslator = true;
                $scope.generalStatus = false;

            }
        }
        
        
        $scope.propagateActions = function(){
            for(var i in $scope.validationUnit.objectInfoMap){
                if(i.indexOf('SENSE') == 0){
                    var action = $scope.validationUnit.objectInfoMap[i].action;
                    if(action != 'ACCEPT' && action != 'REJECT')
                        continue;

                    var senseId = i.substring(i.indexOf('.') + 1, i.length);
                    for(var j in $scope.translationUnit.synset.senses){
                        if($scope.translationUnit.synset.senses[j].id != senseId)
                            continue;
                        var wordId = 'WORD.' + $scope.translationUnit.synset.senses[j].word.id;
                        if( ($scope.validationUnit.objectInfoMap[wordId].status !== 'VALIDATION_LKC_PENDING') &&
                            ($scope.validationUnit.objectInfoMap[wordId].status !== 'VALIDATED_LKC') &&
                            ($scope.validationUnit.objectInfoMap[wordId].status !== 'REJECTED_LKC'))
                            continue;
                        $scope.validationUnit.objectInfoMap[wordId].action = action;
                        
                        var wordFormId = undefined;
                        if($scope.translationUnit.synset.senses[j].word.forms){
                            for(var k =0; k < $scope.translationUnit.synset.senses[j].word.forms.length; k++){
                                wordFormId = 'WORD_FORM.' + $scope.translationUnit.synset.senses[j].word.forms[k].id;
                                if( ($scope.validationUnit.objectInfoMap[wordFormId].status !== 'VALIDATION_LKC_PENDING') &&
                                    ($scope.validationUnit.objectInfoMap[wordFormId].status !== 'VALIDATED_LKC') &&
                                    ($scope.validationUnit.objectInfoMap[wordFormId].status !== 'REJECTED_LKC'))
                                    continue;
                                $scope.validationUnit.objectInfoMap[wordFormId].action = action;
                            }
                        }
                        
                    }
                }
            }
        }
        $scope.checkValidationEnabled = function(){
            $scope.validateEnabled = true;
            
        }

        $scope.isSubmitToUkcValidatorEnabled = false;

        
        $scope.checkIfCanSubmitToUkcValidator = function(){
            
            if($scope.translationUnit.lexicalGap && $scope.validationUnit.objectInfoMap["LEXICAL_GAP." + $scope.translationUnit.lexicalGap.id].status == 'VALIDATED_LKC'){
                $scope.isSubmitToUkcValidatorEnabled = true;
                return true;
            }
            if($scope.translationUnit.lexicalGap && ($scope.validationUnit.objectInfoMap["LEXICAL_GAP." + $scope.translationUnit.lexicalGap.id].status == 'REJECTED_LKC' ||
                $scope.validationUnit.objectInfoMap["LEXICAL_GAP." + $scope.translationUnit.lexicalGap.id].status == 'VALIDATED_LKC')){
                $scope.isSubmitToUkcValidatorEnabled = true;
                return true;
            }

            var flagSubmit = false;
            var flagExample = false;
            if($scope.translationUnit.synset && ($scope.validationUnit.objectInfoMap["SYNSET." + $scope.translationUnit.synset.id].status == 'REJECTED_LKC' ||
                $scope.validationUnit.objectInfoMap["SYNSET." + $scope.translationUnit.synset.id].status == 'VALIDATED_LKC')){


                if ($scope.translationUnit.synsetExamples.length >=1){
                    for(var i = 0 ; i < $scope.translationUnit.synsetExamples.length; i++){
                        var idExample = $scope.translationUnit.synsetExamples[i].id;
                        if(! flagExample && ($scope.validationUnit.objectInfoMap['SYNSET_EXAMPLE.' + idExample].status == 'REJECTED_LKC' ||
                            $scope.validationUnit.objectInfoMap['SYNSET_EXAMPLE.' + idExample].status == 'VALIDATED_LKC')){
                            flagExample = true;   
                        }
                    }
                }    

                   
                for(var i in $scope.translationUnit.synset.senses){
                    if( flagExample && !flagSubmit && (($scope.validationUnit.objectInfoMap['SENSE.' + $scope.translationUnit.synset.senses[i].id].status == 'VALIDATED_LKC') ||
                            ($scope.validationUnit.objectInfoMap['SENSE.' + $scope.translationUnit.synset.senses[i].id].status == 'REJECTED_LKC') ))
                    {

                        flagSubmit = true;
                        $scope.isSubmitToUkcValidatorEnabled = true;
                        return true;
                    
                        break;
                    }
                }
            }
            
            if($scope.translationUnit.synset && $scope.validationUnit.objectInfoMap['SYNSET.' + $scope.translationUnit.synset.id].status == 'VALIDATED_LKC' && $scope.translationUnit.synset.senses.length >= 1){
                var flag = false;
                for(var i in $scope.translationUnit.synset.senses){
                    if($scope.validationUnit.objectInfoMap['SENSE.' + $scope.translationUnit.synset.senses[i].id].status == 'VALIDATED_LKC'){
                        flag = true;
                        break;
                    }
                }
                if(flag){
                    $scope.isSubmitToUkcValidatorEnabled = true;
                    return true;
                }
            }
            if($scope.acceptLemma == false){
                //console.log("watching");
                for(var i = 0 ; i < $scope.translationUnit.synset.senses.length; i++){
                    var id = $scope.translationUnit.synset.senses[i].id;
                    if($scope.validationUnit.objectInfoMap['SENSE.'+id].comment !== undefined) {
                        $scope.leaveAComment = $scope.validationUnit.objectInfoMap['SENSE.'+id].comment.length > 0;
                    }
                }

            }
            if($scope.acceptGloss == false){

                if($scope.translationUnit.synset){
                    var idSynset = $scope.translationUnit.synset.id;
                    if($scope.validationUnit.objectInfoMap['SYNSET.' + idSynset].comment !== undefined){
                        $scope.leaveACommentGloss = $scope.validationUnit.objectInfoMap['SYNSET.' + idSynset].comment.length > 0;
                        //console.log ("leave a comment " + $scope.leaveACommentGloss);
                    }
                } else{
                    var idGap = $scope.translationUnit.lexicalGap.id;
                    if($scope.validationUnit.objectInfoMap['LEXICAL_GAP.' + idGap].comment !== undefined){
                        $scope.leaveACommentGloss = $scope.validationUnit.objectInfoMap['LEXICAL_GAP.' + idGap].comment.length > 0;
                        
                    }
                }    
            }

            if($scope.acceptExample == false){
                if ($scope.translationUnit.synsetExamples.length >=1){
                    for(var i = 0 ; i < $scope.translationUnit.synsetExamples.length; i++){
                        var idExample = $scope.translationUnit.synsetExamples[i].id;
                        if($scope.validationUnit.objectInfoMap['SYNSET_EXAMPLE.' + idExample].comment !== undefined){
                            $scope.leaveACommentExample = $scope.validationUnit.objectInfoMap['SYNSET_EXAMPLE.' + idExample].comment.length > 0;
                        }
                    }    
                }
            }

            var flag = false;
            // check examples
            if($scope.translationUnit.synsetExamples) {
                for (var i in $scope.translationUnit.synsetExamples) {
                    if ($scope.validationUnit.objectInfoMap['SYNSET_EXAMPLE.' + $scope.translationUnit.synsetExamples[i].id].status == 'VALIDATED_LKC') {
                        flag = true;
                        break;
                    }
                }
            }
            var flagSave = false;
            if( !$scope.checkSynset() && $scope.checkSenses() && 
                ($scope.checkExamples() || $scope.leaveACommentExample) ){
                flagSave = true;
                
            } 
            
            $scope.checkRejections();    
                
            $scope.validateEnabled = flagSave;

            if (flag) {
                $scope.isSubmitToUkcValidatorEnabled = true;
                return true;
            }

            $scope.isSubmitToUkcValidatorEnabled = false;
            return false;
        }
        // Helpers
        $scope.updateStyles = function(){
            for(var key in $scope.validationUnit.objectInfoMap){
                if(key.indexOf('SYNSET_EXAMPLE') == 0){
                    $scope.updateExample(key);
                }
            }
        }

        $scope.exampleStyles = {};
        $scope.canValidateExample = {};
        $scope.canCommentExample = {};
        $scope.isCommentDisabled = {};

        $scope.updateExample = function(exampleID){
            var element = $scope.validationUnit.objectInfoMap[exampleID];
            
            if(element.status == 'VALIDATION_LKC_PENDING')
                $scope.exampleStyles[exampleID] = 'alert-warning';
            if(element.status == 'VALIDATED_UKC' || element.status == 'VALIDATED_LKC')
                $scope.exampleStyles[exampleID] = 'alert-success';
            if(element.status == 'REJECTED_LKC' || element.status == 'REJECTED_LKC')
                $scope.exampleStyles[exampleID] = 'alert-danger';
            if(element.status == 'VALIDATION_UKC_PENDING')
                $scope.exampleStyles[exampleID] = 'alert-info';
            
            // can validate it ?
            $scope.canValidateExample[exampleID] = element.status !== 'VALIDATION_UKC_PENDING' || element.status !== 'VALIDATED_UKC';
            $scope.canCommentExample[exampleID] = 
                    element.action != 'VALIDATE_LATER' && 
                    element.status !== 'VALIDATION_UKC_PENDING' && 
                    element.status !== 'VALIDATED_UKC'; 
            $scope.isCommentDisabled[exampleID] = 
                    element.status == 'VALIDATED_LKC' || 
                    element.status == 'REJECTED_LKC' ||
                    element.status == 'VALIDATED_UKC' || 
                    element.status == 'REJECTED_UKC';
            
        };
        $scope.objectGeneralStatus = function(){
            var status_Validation_ukc_Pending   = 0;
            var status_Validation_Pending_lkc   = 0;
            var status_validated                = 0;
            var status_rejected                 = 0;
            var status_Revision_Pending_lkc     = 0;
            var status_Revision_Pending_UKC     = 0;
            var status_validated_UKC            = 0;
            var status_rejected_UKC             = 0;
            var status_synced                   = 0;
            var status_translated               = 0;

            for(var i in $scope.translationUnit.objectInfoMap){
                if ($scope.translationUnit.objectInfoMap[i].status == 'TRANSLATED') {
                    status_translated ++;
                }
                if (($scope.translationUnit.objectInfoMap[i].status == 'SYNCED') ||
                    ($scope.translationUnit.objectInfoMap[i].status == 'SYNC_READY')){
                    status_synced ++;
                }
                if($scope.translationUnit.objectInfoMap[i].status == 'VALIDATION_UKC_PENDING'){
                    
                        status_Validation_ukc_Pending ++;//= status_Validation_ukc_Pending++;
                } 
                if ($scope.translationUnit.objectInfoMap[i].status == 'VALIDATION_LKC_PENDING') {
                    status_Validation_Pending_lkc ++;//= status_Revision_Pending_lkc++;
                }
                if ($scope.translationUnit.objectInfoMap[i].status == 'REVISION_PENDING_LKC') {
                    status_Revision_Pending_lkc ++;//= status_Revision_Pending_lkc++;
                }
                if ($scope.translationUnit.objectInfoMap[i].status == 'VALIDATED_LKC'){
                    status_validated ++;
                }
                if ($scope.translationUnit.objectInfoMap[i].status == 'REJECTED_LKC'){
                    status_rejected ++;
                }
                if ($scope.translationUnit.objectInfoMap[i].status == 'REVISION_PENDING_UKC'){
                    status_Revision_Pending_UKC ++;
                }
                if ($scope.translationUnit.objectInfoMap[i].status == 'REJECTED_UKC'){
                    status_rejected_UKC ++;
                }
                if ($scope.translationUnit.objectInfoMap[i].status == 'VALIDATED_UKC'){
                    status_validated_UKC ++;
                }

            }
            if( (status_translated != 0 )){
                $scope.notAvailableMessage = "Right now you can not see the translation of this activity";
                $scope.nothingToValidate = true;
                                 
            }
            if ( (status_synced !=0) && (status_Validation_Pending_lkc == 0) && (status_validated == 0) && (status_rejected == 0) &&
                (status_Revision_Pending_lkc == 0 ) && (status_validated_UKC ==0) ){
                $scope.syncedMessage = "This activity is saved as follows";
                $scope.onlyConsult = true;
            }

            if ( (status_synced !=0) && ( (status_Validation_Pending_lkc != 0) || (status_validated !== 0) || (status_rejected !== 0)) ){
                $scope.mixedStatus = true;
                return true;
            }

            if( (status_Validation_Pending_lkc != 0 ) && (status_Validation_ukc_Pending != 0) && (status_validated == 0)
                && (status_rejected == 0) && (status_Revision_Pending_lkc == 0) && (status_Revision_Pending_UKC == 0) 
                && (status_rejected_UKC == 0 ) && (status_validated_UKC == 0) ){
                $scope.mixedStatus = true;
                $scope.syncedMessage = "The translator corrected the activity as follows";
                
                return true;
            }
            if( (status_Validation_Pending_lkc > 0) && (status_Validation_ukc_Pending == 0) && (status_validated == 0)  
                && (status_rejected == 0) && (status_Revision_Pending_lkc == 0) && (status_Revision_Pending_UKC == 0) 
                && (status_rejected_UKC == 0 ) && (status_validated_UKC == 0) ) {
                    $scope.allRejected = true;
                    $scope.mixedStatus = false;
                    $scope.buttonSendValidation = false;

                return false;


            }

            if( (status_Validation_Pending_lkc == 0) && (status_Validation_ukc_Pending !== 0) && (status_validated == 0)  
                && (status_rejected == 0) && (status_Revision_Pending_lkc == 0) && (status_Revision_Pending_UKC == 0) 
                && (status_rejected_UKC == 0 ) && (status_validated_UKC == 0) ) {
                    $scope.mixedStatus = true;
                    $scope.onlyConsult = true;
                    $scope.infoMessage = "This word was sent to validation";

                return false;


            }
            if( (status_Validation_Pending_lkc == 0) && (status_Validation_ukc_Pending !== 0) && (status_validated == 0)  
                && (status_rejected == 0) && (status_Revision_Pending_lkc == 0) && (status_Revision_Pending_UKC == 0) 
                && (status_rejected_UKC == 0 ) && (status_validated_UKC !== 0) ) {
                    console.log()
                    $scope.mixedStatus = true;
                    $scope.onlyConsult = true;
                    $scope.infoMessage = "This word was sent to validation";

                return false;

            }
            
            if( (status_Validation_Pending_lkc == 0) && (status_Validation_ukc_Pending > 0) && (status_validated == 0) 
                && (status_rejected == 0) && (status_Revision_Pending_lkc == 0) && (status_Revision_Pending_UKC == 0) 
                && (status_rejected_UKC == 0 ) && (status_validated_UKC == 0) ){
                    $scope.allRejected = true;
                    $scope.mixedStatus = false;
                    $scope.buttonSendValidation = false;

                return false;
            }
            
            if( (status_Revision_Pending_lkc != 0) && ( (status_Validation_ukc_Pending != 0) || (status_Validation_ukc_Pending == 0) )
                && (status_validated == 0) 
                && (status_rejected == 0) && (status_Revision_Pending_UKC == 0) 
                && (status_rejected_UKC == 0 ) && (status_validated_UKC == 0) ){
                    $scope.allRejected = false;
                    $scope.mixedStatus = false;
                    $scope.onlyConsult = true;

                    $scope.rejectedMessage = "This activity was sent to the translator for review";

                return false;
            }
            
            if( (status_Revision_Pending_lkc == 0) && (status_Validation_Pending_lkc != 0) && (status_validated == 0) 
                && (status_rejected == 0) && (status_Revision_Pending_UKC == 0) 
                && (status_rejected_UKC == 0 ) && (status_validated_UKC !== 0) ){
                    $scope.allRejected = false;
                    $scope.mixedStatus = false;
                    $scope.syncedMessage = "The translator corrected the activity as follows";
                    

                return false;
            }
                


            if( ( (status_validated !=0 ) && (status_rejected !=0) && (status_Validation_ukc_Pending == 0 ) 
                && (status_Validation_Pending_lkc == 0) 
                && (status_Revision_Pending_lkc == 0) && (status_Revision_Pending_UKC == 0) 
                && (status_rejected_UKC == 0 ) && (status_validated_UKC == 0) ) ) {
                $scope.allRejected = false;
                $scope.mixedStatus = true;
                $scope.syncedMessage = "The validation was saved as follows";
                $scope.sendToTranslatorButton = true;
                $scope.sendToValidation = false;
                $scope.validated_lkc = true;
                return true;
            }

            if( (status_validated !=0 ) && (status_Validation_ukc_Pending == 0 ) && (status_Validation_Pending_lkc == 0) 
                && (status_Revision_Pending_lkc == 0) && (status_Revision_Pending_UKC == 0) 
                && (status_rejected_UKC == 0 ) && (status_validated_UKC == 0)  ) {

                $scope.allRejected = false;
                $scope.mixedStatus = false;
                $scope.infoMessage = "This activity was stored in your records";
                
                $scope.validated_lkc = true; //variable used when gap

                return true;

            }

            if( (status_rejected !=0) && (status_Validation_ukc_Pending == 0) && (status_Validation_Pending_lkc == 0) 
                && (status_Revision_Pending_lkc == 0) && (status_Revision_Pending_UKC == 0) 
                && (status_rejected_UKC == 0 ) && (status_validated_UKC == 0) ){
                

                $scope.allRejected = false;
                $scope.mixedStatus = true;
                $scope.infoMessage = "This activity was stored in your records";
                
                $scope.validated_lkc = true;//variable used when gap
           
                return true;
            }
            

            if( (status_Revision_Pending_lkc == 0) && (status_Validation_ukc_Pending == 0) && (status_validated == 0)
                && (status_rejected == 0) && (status_Revision_Pending_UKC != 0) 
                && (status_rejected_UKC == 0 ) && ( (status_validated_UKC == 0) || (status_validated_UKC != 0) ) ){
                $scope.mixedStatus = true;
                $scope.onlyConsult = true;
                $scope.rejectedMessage = "The synchronizer sent this activity to the translator for review";

            }


            if( (status_Revision_Pending_lkc == 0) && (status_Validation_ukc_Pending == 0) && (status_validated == 0)
                && (status_rejected == 0) && (status_Revision_Pending_UKC == 0) 
                && (status_rejected_UKC == 0 ) && (status_validated_UKC != 0) ){
                
                $scope.notAvailableMessage = "Right now you can not see the translation of this activity";
                $scope.nothingToValidate = true;
                                
            }

            if( (status_Revision_Pending_lkc == 0) && (status_Validation_ukc_Pending == 0) && (status_validated == 0)
                && (status_rejected == 0) && (status_Revision_Pending_UKC == 0) 
                && (status_rejected_UKC !== 0 ) && (status_validated_UKC == 0) ){
                
                $scope.notAvailableMessage = "Right now you can not see the translation of this activity";
                $scope.nothingToValidate = true;
                                
            }
            if( (status_Revision_Pending_lkc == 0) && (status_Validation_ukc_Pending == 0) && (status_validated == 0)
                && (status_rejected == 0) && (status_Revision_Pending_UKC == 0) 
                && (status_rejected_UKC !== 0 ) && (status_validated_UKC !== 0) ){
                
                $scope.notAvailableMessage = "Right now you can not see the translation of this activity";
                $scope.nothingToValidate = true;
                                
            }    
            
            if ((status_rejected !=0 ) && (status_Validation_ukc_Pending == 0 ) && (status_Validation_Pending_lkc == 0) 
                && (status_Revision_Pending_lkc == 0) && (status_Revision_Pending_UKC == 0) 
                && (status_rejected_UKC == 0 ) && (status_validated_UKC !== 0)  ) {
                
                $scope.infoMessage = "This activity was saved in your records";

                $scope.validated_lkc = true;

                $scope.mixedStatus = true;
                return true;
            }
            if ((status_rejected !=0 ) && (status_Validation_ukc_Pending !== 0 ) && (status_Validation_Pending_lkc == 0) 
                && (status_Revision_Pending_lkc == 0) && (status_Revision_Pending_UKC == 0) 
                && (status_rejected_UKC == 0 ) && (status_validated_UKC == 0)  ) {
                
                $scope.infoMessage = "This activity was saved in your records";

                $scope.validated_lkc = true;

                $scope.mixedStatus = true;
                return true;
            }

            if ((status_validated !=0 ) && (status_Validation_ukc_Pending !== 0 ) && (status_Validation_Pending_lkc == 0) 
                && (status_Revision_Pending_lkc == 0) && (status_Revision_Pending_UKC == 0) 
                && (status_rejected_UKC == 0 ) && (status_validated_UKC == 0)  ) {
                
                $scope.syncedMessage = "This activity was saved in your records";

                $scope.validated_lkc = true;

                $scope.mixedStatus = true;
                return true;
            }

            if ((status_validated !=0 ) && (status_Validation_ukc_Pending == 0 ) && (status_Validation_Pending_lkc == 0) 
                && (status_Revision_Pending_lkc == 0) && (status_Revision_Pending_UKC == 0) 
                && (status_rejected_UKC == 0 ) && (status_validated_UKC !== 0)  ) {
                
                $scope.infoMessage = "This activity was saved in your records";

                $scope.validated_lkc = true;

                $scope.mixedStatus = true;
                return true;
                
            }
        }
        
      


        // HELPERS END
        $http.get('lkcApp/validation/check/' + $scope.assignmentId + '/' + $scope.conceptId)
            .success(function(data){
                $http.get('lkcApp/translationUnit/' + $scope.assignmentId + '/' + $scope.conceptId)
                .success(function(data, status, headers, config) {
                    console.log("GET VALIDATOR");
                    $scope.translationUnit = data;
                    $scope.objectStatus = $scope.objectGeneralStatus();
                    
                    var currentState    = 0;
                    var nextState       = 0;
                    var previousState   = 0;

                    if($scope.translationUnit.lexicalGap !== undefined){
                        $scope.objectGap = true;
                    }
                    if($scope.translationUnit.synset !== undefined){
                        $scope.objectGap = false;
                    }

                    for(var i in $scope.translationUnit.objectInfoMap){
                        
                            $scope.validationUnit.objectInfoMap[i] = {
                                comment : ($scope.translationUnit.objectInfoMap[i].status  === 'VALIDATION_LKC_PENDING') ? "" : $scope.translationUnit.objectInfoMap[i].comment,
                                status  :  $scope.translationUnit.objectInfoMap[i].status,
                                userDetails  :  $scope.translationUnit.objectInfoMap[i].userDetails,
                                action  : 
                                            $scope.translationUnit.objectInfoMap[i].status === 'VALIDATION_UKC_PENDING' || 
 
                                            $scope.translationUnit.objectInfoMap[i].status === 'SYNCED' ||
                                            $scope.translationUnit.objectInfoMap[i].status === 'SYNC_READY'
                                                 
                                            ? 'NO_ACTION' :
                                            (
                                                $scope.translationUnit.objectInfoMap[i].status === 'VALIDATION_LKC_PENDING' ? 
                                                    "VALIDATE_LATER" : (
                                                        $scope.translationUnit.objectInfoMap[i].status === 'VALIDATED_UKC' ||
                                                        $scope.translationUnit.objectInfoMap[i].status === 'VALIDATED_LKC' ? 
                                                        'ACCEPT' : 'REJECT')
                                            )
                            };
                            
                                
                    }

                    
                    $scope.infoMap = $scope.validationUnit.objectInfoMap;
                    
                    if(Object.keys($scope.infoMap).length === 0){
                        $scope.notExistingTranslation = "This activity hasn't been translated yet";
                        $scope.nothingToValidate = true;
                     }
                    
                    $scope.logDisabled = false;
                    $scope.updateControls();
                    $scope.checkRejections();
                });
            })
            .error(function(data){
                $scope.assignmentNotFound = true;
            });
        
        $scope.sendValidation = function(){
            
            $http.post('lkcApp/validate/' + $scope.assignmentId + '/' + $scope.conceptId, $scope.validationUnit)
                .success(function(data){
                    $scope.showSuccess = true;
                    $scope.comeLater    = false;
                    $scope.translationUnit = data;
                    for(var i in $scope.translationUnit.objectInfoMap){
                        if($scope.translationUnit.objectInfoMap[i].status !== 'TRANSLATED')
                            $scope.validationUnit.objectInfoMap[i] = {
                                comment : ($scope.translationUnit.objectInfoMap[i].status  === 'VALIDATION_UKC_PENDING') ? "" : $scope.translationUnit.objectInfoMap[i].comment,
                                status  : $scope.translationUnit.objectInfoMap[i].status,
                                action  : 
                                            $scope.translationUnit.objectInfoMap[i].status === 'VALIDATION_UKC_PENDING' || 
                                            $scope.translationUnit.objectInfoMap[i].status === 'SYNCED' ||
                                            $scope.translationUnit.objectInfoMap[i].status === 'SYNC_READY'
                                                 
                                            ? 'NO_ACTION' :
                                            (
                                                $scope.translationUnit.objectInfoMap[i].status === 'VALIDATION_LKC_PENDING' ? 
                                                    "VALIDATE_LATER" : (
                                                        $scope.translationUnit.objectInfoMap[i].status === 'VALIDATED_LKC' ||  
                                                        $scope.translationUnit.objectInfoMap[i].status === 'VALIDATED_UKC' 
                                                        ? 'ACCEPT' : 'REJECT')
                                            )
                            };
                    }
                    $scope.successMessage = "Validation Submitted";
                    $scope.rejectedMessage = "";
                    $scope.syncedMessage='';
                    $scope.infoMessage = "";
                    $scope.updateControls();
                    $scope.updateStyles();
                    //$scope.deleteSkipHistory($scope.assignmentId);
                    $scope.getNext($scope.assignmentId);
                    
                });
        };

        

        $scope.submitForValidation = function(){
                    
            $http.post('lkcApp/submitForUkcValidation/' + $scope.assignmentId + '/' + $scope.conceptId, $scope.validationUnit)
                .success(function(data){
                    
                    $scope.translationUnit = data;
                    $scope.sendToUKC = false;
                    $scope.sendToTranslator = false;
                    $scope.showSuccess = true;
                    $scope.validationUnit = data;
                    $scope.successMessage = "Validation Submitted";
                    $scope.syncedMessage = '';
                    $scope.infoMessage = "";
                    $scope.updateControls();
                    $scope.updateStyles();
                
                });


        };
        $scope.changeEditStatus = function(){
            $scope.editButton = true;
        }
        
        $scope.updateControls = function(){
            var flag = true;
            for(var i in $scope.validationUnit.objectInfoMap){

                if(($scope.validationUnit.objectInfoMap[i].status === 'VALIDATION_LKC_PENDING') || 
                    ($scope.validationUnit.objectInfoMap[i].status === 'VALIDATION_UKC_PENDING') && (i.indexOf('WORD') === -1)){
                    if(!(
                        $scope.validationUnit.objectInfoMap[i].action === 'ACCEPT' ||
                        $scope.validationUnit.objectInfoMap[i].action === 'REJECT' ||
                        $scope.validationUnit.objectInfoMap[i].action === 'VALIDATE_LATER'
                    )){
                        console.log("false for " + i);
                        flag = false;
                        break;
                    }
                }
                
            } 
            
                
            $scope.updateStyles();
            $scope.checkIfCanSubmitToUkcValidator();
        };

        
        $scope.checkSenses = function(){
            var flagSenses = true;
            var arrayFlags = [];
            var arrayLemmas =[];
            var auxflag = true;

            if ($scope.translationUnit.synset !== undefined){
                for(var i = 0 ; i < $scope.translationUnit.synset.senses.length; i++){
                        var id = $scope.translationUnit.synset.senses[i].id;
                        if($scope.validationUnit.objectInfoMap['SENSE.'+id].action == 'VALIDATE_LATER'){
                            $scope.senseRejected = true;
                            $scope.leaveACommentSense = false;
                        } 
                        
                        if($scope.validationUnit.objectInfoMap['SENSE.'+id].action == 'REJECT') {
                            $scope.senseRejected = true;
                            if($scope.validationUnit.objectInfoMap['SENSE.'+id].comment == undefined){
                                $scope.leaveACommentSense = false;

                            }
                            
                            if($scope.validationUnit.objectInfoMap['SENSE.'+id].comment !== undefined){
                                $scope.leaveACommentSense = $scope.validationUnit.objectInfoMap['SENSE.'+id].comment.length > 0;
                                
                            }
                        }
                        if(($scope.validationUnit.objectInfoMap['SENSE.'+id].action == 'ACCEPT') ||
                            ($scope.validationUnit.objectInfoMap['SENSE.'+id].action == 'NO_ACTION')) {
                            $scope.senseRejected = true; 
                            $scope.leaveACommentSense = true;
                        }
                    arrayLemmas[i]=flagSenses;
                    arrayFlags[i] = $scope.leaveACommentSense;

                }
            }
            
            for(var  j=0; j<arrayFlags.length; j++){
                auxflag = auxflag && arrayFlags[j];
            }

            $scope.flagAllSenses = auxflag;
            
            return auxflag;
        }

        $scope.checkExamples = function(){
            var flagExamplesNew    = true;
            var auxflag         = true;
            var arrayFlags = [];
            var p = 0;
            if ($scope.translationUnit.synset !== undefined){
                for(var i = 0 ; i < $scope.translationUnit.synsetExamples.length; i++){
                    var idExample = $scope.translationUnit.synsetExamples[i].id;
                    
                    if($scope.validationUnit.objectInfoMap['SYNSET_EXAMPLE.' + idExample].action == 'VALIDATE_LATER'){
                        flagExamplesNew = false;
                        $scope.exampleRejected = true;
                        $scope.leaveACommentExampleNew = false;
                    }
                    
                    if($scope.validationUnit.objectInfoMap['SYNSET_EXAMPLE.' + idExample].action == 'REJECT'){
                        $scope.exampleRejected = true;
                        
                        if($scope.validationUnit.objectInfoMap['SYNSET_EXAMPLE.' + idExample].comment !== undefined){
                            flagExamplesNew = $scope.validationUnit.objectInfoMap['SYNSET_EXAMPLE.' + idExample].comment.length > 0;
                            $scope.leaveACommentExampleNew = $scope.validationUnit.objectInfoMap['SYNSET_EXAMPLE.' + idExample].comment.length > 0;
                        }
                        
                    }    
                    if(($scope.validationUnit.objectInfoMap['SYNSET_EXAMPLE.' + idExample].action == 'ACCEPT') ||
                        ($scope.validationUnit.objectInfoMap['SYNSET_EXAMPLE.' + idExample].action == 'NO_ACTION')){
                        $scope.exampleRejected = true;
                        $scope.leaveACommentExampleNew = true;
                        flagExamplesNew = true;
                    }    
                    arrayFlags[p] = flagExamplesNew;
                    
                    p++;
                }

                for(var  j=0; j<arrayFlags.length; j++){
                    auxflag = auxflag && arrayFlags[j];
                }
                flagExamplesNew = auxflag;     

            }
            return flagExamplesNew;
        }

        
        $scope.checkSynset = function(){
            var flagSynset = true;
            if ($scope.translationUnit.synset !== undefined){
                var idSynset = $scope.translationUnit.synset.id;
                if($scope.validationUnit.objectInfoMap['SYNSET.' + idSynset].action == 'VALIDATE_LATER'){
                    flagSynset = false;
                    $scope.synsetRejected = true;
                    $scope.leaveACommentGloss = false;
                }
                
                if($scope.validationUnit.objectInfoMap['SYNSET.' + idSynset].action == 'REJECT'){
                    $scope.synsetRejected = true;
                    
                    if($scope.validationUnit.objectInfoMap['SYNSET.' + idSynset].comment !== undefined){
                        flagSynset = $scope.validationUnit.objectInfoMap['SYNSET.' + idSynset].comment.length > 0;
                        $scope.leaveACommentGloss = flagSynset;
                    }
                }
                if(($scope.validationUnit.objectInfoMap['SYNSET.' + idSynset].action == 'ACCEPT') || 
                    ($scope.validationUnit.objectInfoMap['SYNSET.' + idSynset].action == 'NO_ACTION')){
                    $scope.synsetRejected = true;
                    $scope.leaveACommentGloss = true;
                    flagSynset = true;
                }
            }  

            if($scope.translationUnit.lexicalGap !== undefined){
                var idGap = $scope.translationUnit.lexicalGap.id;
                if($scope.validationUnit.objectInfoMap['LEXICAL_GAP.' + idGap].action == 'VALIDATE_LATER'){
                    flagSynset = false;
                    $scope.synsetRejected = false;

                }
                if($scope.validationUnit.objectInfoMap['LEXICAL_GAP.' + idGap].action == 'REJECT'){
                    $scope.synsetRejected = true;
                    if($scope.validationUnit.objectInfoMap['LEXICAL_GAP.' + idGap].comment !== undefined){
                        flagSynset = $scope.validationUnit.objectInfoMap['LEXICAL_GAP.' + idGap].comment.length > 0;
                        if($scope.validated_lkc){
                            $scope.readyForTranslation = true;
                            $scope.readyForValidation = false;
                        }

                    }
                }
                if($scope.validationUnit.objectInfoMap['LEXICAL_GAP.' + idGap].action == 'ACCEPT'){
                    flagSynset = true;
                    $scope.synsetRejected = true;
                    if($scope.validated_lkc){
                            $scope.readyForTranslation = false;
                            $scope.readyForValidation = true;
                    }
                }
            }
            return flagSynset;
        }




        $scope.checkRejections = function(){
            var p = 0;
            var arrayFlagsNew = [];
            var auxflagNew = true;
            var rejected = true;
            var validatedCounter = 0;
            
            if($scope.translationUnit.synset){
                for(var i in $scope.validationUnit.objectInfoMap){
                    
                    if(($scope.validationUnit.objectInfoMap[i].status == 'VALIDATED_LKC') ||
                        ($scope.validationUnit.objectInfoMap[i].status == 'VALIDATED_UKC') ||
                        ($scope.validationUnit.objectInfoMap[i].status == 'VALIDATION_UKC_PENDING') ||
                        ($scope.validationUnit.objectInfoMap[i].status == 'SYNCED') ||
                        ($scope.validationUnit.objectInfoMap[i].status == 'SYNC_READY') ){
                    
                        rejected = true;
                        validatedCounter++;

                        if($scope.validationUnit.objectInfoMap[i].action == 'REJECT'){
                            rejected = false;
                            validatedCounter--;
                        }
                        
                    }
                    if($scope.validationUnit.objectInfoMap[i].status == 'REJECTED_LKC'){
                        rejected = false;
                        validatedCounter++;
                        if($scope.validationUnit.objectInfoMap[i].action == 'ACCEPT'){
                            validatedCounter--;
                        }
                    }
                    arrayFlagsNew[p] = rejected;
                    p++;
                }

                
                if (validatedCounter < Object.keys($scope.translationUnit.objectInfoMap).length){
                    $scope.readyForTranslation = false;
                    $scope.readyForValidation = false;

                }
                if(validatedCounter == Object.keys($scope.translationUnit.objectInfoMap).length){
                

                        for(var  j=0; j<arrayFlagsNew.length; j++){
                            auxflagNew = auxflagNew && arrayFlagsNew[j];
                        }


                        if (auxflagNew == false){
                            $scope.translationReview = true;
                            
                            $scope.readyForTranslation = true;
                            $scope.readyForValidation = false;
                        }
                        if (auxflagNew == true){
                            $scope.translationReview = false;
                            
                            $scope.readyForTranslation = false;
                            $scope.readyForValidation = true;
                        }
                }

                return auxflagNew;
            }    
            
            return $scope.translationReview;

        }


        $scope.checkRejectionsGap = function(){
            var rejected = true;
            var validatedCounter = 0;
            var disable = true;
            if($scope.translationUnit.lexicalGap){
               for(var i in $scope.validationUnit.objectInfoMap){
                    
                    if(($scope.validationUnit.objectInfoMap[i].status == 'VALIDATED_LKC') ){
                    
                        rejected = true;
                        validatedCounter++;
                        disable = false;

                        if($scope.validationUnit.objectInfoMap[i].action == 'REJECT'){
                            rejected = false;
                            validatedCounter--;
                            disable = true;
                        }
                        
                    }
                    if($scope.validationUnit.objectInfoMap[i].status == 'REJECTED_LKC'){
                        rejected = false;
                        validatedCounter++;
                        disable = false;

                        if($scope.validationUnit.objectInfoMap[i].action == 'ACCEPT'){
                            validatedCounter--;
                            disable = true;
                        }
                    }
                    
                }

                if(disable){
                    $scope.readyForTranslation = false;
                    $scope.readyForValidation = false;
                }
                if (!disable){
                    if (rejected == false){
                        $scope.translationReview = true;
                        
                        $scope.readyForTranslation = true;
                        $scope.readyForValidation = false;
                    }
                    if (rejected == true){
                        $scope.translationReview = false;
                        
                        $scope.readyForTranslation = false;
                        $scope.readyForValidation = true;
                    }
                }
            }
            return disable;
        }
        $scope.cannotPerformActionByStatus = function(status){
            return status == 'VALIDATED_LKC' || status == 'VALIDATED_UKC' || status == 'REJECTED_LKC' || status == 'REJECTED_UKC';
        }

        $scope.statusLemma = function(status){
            $scope.acceptLemma  = status;
            
        }
        $scope.statusExample = function(status){
            console.log("example index " + status);

            $scope.acceptExample    = status;
            
        }

        $scope.statusGloss = function (status){
            $scope.acceptGloss = status;
        }
    }]);
});
