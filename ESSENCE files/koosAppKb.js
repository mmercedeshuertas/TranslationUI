define(['jquery', 'angularAMD', 'angular.ui.router', 'ui.bootstrap', 'angular.cookie'], function ($, angularAMD) {
    
    var app = angular.module('koosApp.kb', ['ui.bootstrap']);

    app.constant('KOS_EB_EVENTS', {
        updateEtypeLattice : 'update-etype-lattice'
    });

    /*
     * SINGLETON
     */
    app.factory('KnowledgeBaseService', ['$http', function($http){
        
        var instance = {};

        instance.getConceptsByPrefixPromise = function(prefix, localeCode){
            return $http.get('kb/synsets/byprefix/' + prefix + '/' + localeCode);
        };

        instance.getConceptsByPrefixAndLocalePromise = function(prefix, languageCode){
            return $http.get('kb/synsets/byprefix/' + prefix + '/' + languageCode);
        };

        instance.getConceptsByLemma = function(lemma, localeCode){
            return $http.get('kb/concepts/bylemma/' + lemma + '/' + localeCode);
        };

        instance.getConceptsByLemmaAndLocale = function(lemma, localeCode){
            return $http.get('kb/concepts/bylemmaandlangcode/' + lemma + '/' + localeCode);
        };

        instance.getLanguages = function(){
            return $http.get('kb/languages/list');
        };

        instance.getConceptById = function(conceptId, vocabularyId){
            return $http.get('kb/concepts/byid/' + conceptId + '/' + vocabularyId);
        };

        instance.getConceptByIdAndLangCode = function(conceptId, language){
            return $http.get('kb/concepts/byidandlangcode/' + conceptId + '/' + language);
        };

        instance.getConceptAncestors = function(conceptId){
            return $http.get('kb/concepts/ancestors/' + conceptId);
        };

        instance.getSemanticRelations = function(conceptId, languageCode, asSource, childrenOnly, filters){
            return $http.get('kb/concepts/semantic/' + conceptId + '/' + languageCode + '/' + asSource + '/' + childrenOnly+'/' + filters);
        };

        instance.getRelationTypes = function(level) {
            var url = 'kb/concepts/relationstypes/';
            if (level) url += level;
            return $http.get(url);
        };
        
        return instance;
    }]);

    app.factory('EtypeService', ['$http', function($http){

        var instance = {};
        var namespace = 'etypes';
        instance.getEtypesList = function(){
            return $http.get(namespace + '/list');
        };

        instance.getEtypeById = function(id) {
            return $http.get(namespace + '/byId/' + id);
        };

        instance.getEtypeLattice = function(force){
            var uri = namespace + '/lattice';
            if (force)
                uri += '/true';
            return $http.get(uri);
        };

        instance.getIdentifyingSets = function(id){
            return $http.get(namespace + '/idsets/' + id);
        };

        return instance;

    }]);

    /*
     * ================================================= APPLICATIONS
     * Natural App
     */
    app.controller('SourceController', ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope){

        $scope.sourceConcept = {};

        $scope.init = function(conceptId){
            $http.get('kb/concept/byconceptid/' + conceptId + '/en/mn/false')
                .success(function(data) {
                    $scope.sourceConcept = data;
                });
        
        };

        $scope.$on('changedConceptId', function(event, data) {
            $scope.init(data.conceptId);
        });

    }]);

    app.directive('conceptPath', function(){
        return {
            restrict : 'E',
            templateUrl : 'kosResource/kb/conceptPath.jade',
            scope : {
                concept : '=',
                language  : '=?'
            },
            controller : ['$scope', 'KnowledgeBaseService' , function($scope, KnowledgeBaseService){

                $scope.$watch('concept', function(){
                    if(angular.isDefined($scope.concept))
                        KnowledgeBaseService.getConceptAncestors($scope.concept)
                            .success(function(data){
                                $scope.knowledgePath = data;
                            });
                });
                
            }]
        };
    });

    app.directive('conceptProvenance', function(){
        return {
            restrict : 'E',
            templateUrl : 'kosResource/kb/provenance.jade',
            scope : {
                concept : '='
            },
            controller : ['$scope', '$http', 'AuthService', function($scope, $http, AuthService){
                $scope.hasRole = AuthService.isAuthorized;
                $scope.$watch('concept', function(){
                    if(angular.isDefined($scope.concept)){
                        $scope.loader = true;
                        $http.get('kb/concepts/provenance/' + $scope.concept)
                            .success(function(data){
                                $scope.provenance = data;
                                $scope.loader = false;
                            });
                    }
                });
            }]
        };
    });

    /*
        E-type Lattice
        @author francesco shin bux
        <etype-lattice />
     */
    app.directive('etypeLattice', function(){
        return {
            restrict : 'E',
            templateUrl : 'kosResource/kb/etypeLattice.jade',
            controller : ['$scope', 'EtypeService', 'KOS_EB_EVENTS', function($scope, EtypeService, KOS_EB_EVENTS){

                $scope.treeOptions = {
                    nodeChildren: "children",
                    dirSelectable: true,
                    isLeaf : function(node){
                        return node.children.length === 0;
                    },
                    selectable: true
                };

                
                $scope.updateLattice = function(force){
                    EtypeService.getEtypeLattice(force)
                        .success(function(data){
                            $scope.lattice = [];
                            $scope.structures = [];

                            // split lattice in entities and structures
                            for (var i in data) {
                                if (data[i].kind == 'ETYPE')
                                    $scope.lattice.push(data[i]);
                                else
                                    $scope.structures.push(data[i]);
                            }
                        });
                };

                $scope.updateLattice();

                /*
                 * Selection Etype
                 */
                $scope.broadcastSelection = function(etypeNode){
                    $scope.$emit('etypeSelected', etypeNode);
                };

                /*
                 * Lattice has changed
                 */
                $scope.$on(KOS_EB_EVENTS.updateEtypeLattice, function(event, args){
                    var force = false;
                    if (args) force = true;
                    $scope.updateLattice(force);
                });
                
            }]
        };
    });

    /*
        Concept Lattice
        @author francesco shin bux
        <concept-tree concept="" language="" />
     */
    app.directive('conceptTree', function(){
        return {
            restrict : 'E',
            templateUrl : 'kosResource/kb/conceptTree.jade',
            scope : {
                language    : '=?',
                direction   : '=?',
                concept     : '=',
                onSelection : '=?',
                linguistic  : '=?'
            },
            /*
            compile: function(element, attrs){
                if (!attrs.linguistic)
                    attrs.linguistic = false;
                if (!attrs.direction)
                    attrs.direction = true;
            },
            */
            controller : ['$scope', 'KnowledgeBaseService', function($scope, KnowledgeBaseService){
                $scope.direction        = $scope.linguistic == 'true' || false;
                $scope.direction        = $scope.direction || true;
                $scope.language         = $scope.language || 'en';
                $scope.relationTypes    = [];
                $scope.availableRelationTypes = ['PART_OF', 'IS_A', 'SUBSTANCE_OF', 'MEMBER_OF', 'VALUE_OF', 'HAS_ASPECT', 'IS_AGENT', 'METAPHOR_OF'];
                $scope.loader=false;

                if (!$scope.onSelection) {
                    $scope.onSelection = function() {};
                }

                $scope.openSubtree = function(node){
                    
                    if(node.children)
                        return;

                    $scope.loader=true;
                    KnowledgeBaseService.getSemanticRelations(
                        node.conceptId,
                        $scope.language,
                        $scope.direction,
                        'true',
                        $scope.relationTypes)
                        .success(function(data){
                            $scope.loader=false;
                            node.children = data;
                        });
                };


                $scope.init = function(){
                    var language = $scope.language || 'en';

                    KnowledgeBaseService.getRelationTypes().success(function(data) {
                        data = [{
                                name: 'All Lexical Semantic',
                                knowledgeLevel : 'LEXICAL_SEMANTIC'
                            },
                            {
                                name: 'All Conceptual',
                                knowledgeLevel : 'CONCEPTUAL'
                            }].concat(data);
                        $scope.availableRelationTypes = data;
                    });
                    //var url = 'kb/concept/relations/semantic/' + $scope.concept + '/'+ $scope.language +'/it/' + $scope.direction + '/false/' + $scope.relationTypes;
                    //$http.get(url)
               
                    $scope.loader=true;
                    KnowledgeBaseService.getSemanticRelations(
                        $scope.concept,
                        $scope.language,
                        $scope.direction,
                        'false',
                        $scope.relationTypes.map(function(reltype) {return reltype.name;}))
                        .success(function(data){
                            $scope.lattice = data;
                            $scope.loader=false;
                        });
                };

                $scope.options = {
                    isLeaf: function(node){
                        if(node.children){
                            return node.children.length === 0;
                        }
                        if(node.load_on_demand){
                            return !node.load_on_demand;
                        }
                        return true;
                    },
                    selectable: false
                };

                $scope.$watch('concept', function(conceptId){
                    if(angular.isDefined($scope.concept))
                        $scope.init();
                });

                $scope.$watch('relationTypes', function(conceptId){
                    if(angular.isDefined($scope.relationTypes)) {
                        var selectAll = 0;
                        $scope.relationTypes.forEach(function(relType) {
                            if (relType.name == 'All Lexical Semantic') {
                                selectAll = 2;
                            }
                            if (relType.name == 'All Conceptual') {
                                selectAll = 3;
                            }
                        });

                        if (selectAll == 2) {
                            $scope.relationTypes = $scope.availableRelationTypes.filter(function(relType) {
                                return (relType.knowledgeLevel == 'LEXICAL_SEMANTIC') && (relType.name.indexOf('All') == -1);
                            });
                        }
                        if (selectAll == 3) {
                            $scope.relationTypes = $scope.availableRelationTypes.filter(function(relType) {
                                return (relType.knowledgeLevel == 'CONCEPTUAL') && (relType.name.indexOf('All') == -1);
                            });
                        }
                        $scope.init();
                    }
                });

                $scope.$watch('direction', function(direction){
                    if(angular.isDefined($scope.concept))
                        $scope.init();
                });

                $scope.$watch('language', function(direction){
                    if(angular.isDefined($scope.concept) && angular.isDefined($scope.language))
                        $scope.init();
                });

                $scope.$on('languageSelected', function(event, language){
                    if(angular.isDefined(language))
                        $scope.language = language;
                });


                $scope.relationLevel= function (item){
                    return item.knowledgeLevel;
                };
                $scope.orderLevels = function(groups) {
                    return groups;
                };
            }]

        };
        
    });

    app.directive('relationBadge', function(){
        return {
            restrict : 'E',
            scope    : {type : '='},
            template : "<small><span class='label label-default {{customClass[type]}}'>{{type}}</span></small>",
            controller : ['$scope', function($scope){
                $scope.customClass = {
                    'IS_A' : 'label-primary',
                    'PART_OF' : 'label-info',
                    'VALUE_OF' : 'label-default',
                };
            }]
        };
    });
    
    // Pop Overs
    app.directive('senseTooltip', function(){
        return {
            restrict : 'A',
            scope    : {
                elementId : '@'
            },
            controller : ['$scope', '$http', function($scope, $http){
                $scope.text = "CIAONE";

                $scope.getText = function(){
                    return $scope.text;
                };
            }],

            compile: function compile(element, attrs) {
                element.attr('popover', '{{getText()}}');
                
                return {
                    pre: function preLink(scope, iElement, iAttrs, controller) {  },
                    post: function postLink(scope, iElement, iAttrs, controller) {
                        $compile(iElement)(scope);
                    }
                };
            }
        };
    });


    app.directive('natural-view', function() {
        return {
            restrict: 'E',
            templateUrl: 'kosResource/kb/naturalView.jade'
        };
    });

    app.directive('conceptLemma', function() {
        return {
            restrict : 'E',
            replace  : true,
            scope    : {
                concept : '=',
                language : '='
            },
            controller : ['$scope','KnowledgeBaseService', function($scope, KnowledgeBaseService){
                $scope.language = "en";
                
                $scope.$watch('concept', function(){
                    if(angular.isDefined($scope.concept))
                        $scope.load();
                });

                $scope.$watch('language', function(){
                    if(angular.isDefined($scope.language))
                        $scope.load();
                });
                
                $scope.load = function(){
                    KnowledgeBaseService.getConceptByIdAndLangCode($scope.concept, $scope.language)
                        .success(function(data){
                            $scope.conceptLemma = data.concept;
                        });
                };
            }],
            template : "<span>{{conceptLemma}}</span>"
        };
    });

   
    // KB Directives
    // <kb-view conceptId="" workingLanguage="" [referenceLanguages="[]"]></kb-view>
    // <formal-view conceptId="" workingLanguage="" [referenceLanguages="[]"] />
    //      <concept-tree rootConceptId="" [direction="up|down"] [filter="[]"] />
    // <natural-view ...
    // <lemma view ...
    // <etype-view conceptId||etypeId />
    // 
    // Autocompleters
    // <lemma-completer name="" workingLanguage="" referenceLanguage="" />
    // <etype-completer name="" />
    app.directive('conceptPicker', ['$compile', function($compile){
        return {
            restrict : 'EA',
            replace : true,
            scope : {
                language : '=?',
                conceptPickerVar : '=',
                conceptPickerCallback : '=?',
                full : '=?'
            },
            templateUrl : function(elem,attrs) {
                return attrs.version == 'full' ? 'kosResource/kb/conceptPickerFull.jade' : 'kosResource/kb/conceptPicker.jade';
            },
            controller  : ['$scope', 'KnowledgeBaseService', function($scope, KnowledgeBaseService){
                $scope.getConceptsByPrefix = function(value){
                    return KnowledgeBaseService.getConceptsByPrefixPromise((value || '').toLowerCase(), $scope.language)
                        .then(function(response){
                            if(response.data.length === undefined)
                                response.data = [];
                            return response.data.map(function(item){
                                return item;
                            });
                        });
                };
            }]
        };
    }]);

    app.directive('conceptDisplayer', function(){
        return {
            restrict :'E',
            templateUrl : 'kosResource/kb/conceptDisplayer.jade',
            scope : {
                concept : '=',
                language: '=',
                global : '@?'
            },
            controller : [ '$scope', 'KnowledgeBaseService', 'AuthService', function($scope, KnowledgeBaseService, AuthService){
                $scope.notFound = false;
                $scope.data = undefined;
                $scope.global = $scope.global ? true : false;
                $scope.AuthService = AuthService;

                KnowledgeBaseService.getConceptByIdAndLangCode($scope.concept, $scope.language)
                    .success(function(result){
                        if(!result.synset && !result.lexicalGap ) {
                            $scope.notFound = true;
                            return;
                        }
                        
                        $scope.data = result;
                    })
                    .error(function(data){
                        console.error("error");
                        console.error(data);
                    });
            }]
        };
    });

    app.directive('etypeSelector', ['$compile', function($compile){
        return {
            restrict : 'EA',
            replace : true,
            scope : {
                language : '=?',
                etypeSelectorVar : '='
            },
            templateUrl : 'kosResource/kb/etypeSelector.jade',
            controller  : ['$scope', 'EtypeService', 'KOS_EB_EVENTS', function($scope, EtypeService, KOS_EB_EVENTS){
                $scope.etypes = [];
                var init = function() {
                    EtypeService.getEtypesList()
                        .success(function (etypes) {
                            $scope.etypes = etypes;
                        });
                };
                init();

                /*
                 * Lattice has changed
                 */
                $scope.$on(KOS_EB_EVENTS.updateEtypeLattice, function(event, args){
                    init();
                });
            }]
        };
    }]);

    app.directive('etypeName', function() {
        return {
            restrict : 'E',
            replace  : true,
            scope    : {
                etypeId : '=',
                language : '=?'
            },
            controller : function($scope, $http, EtypeService){
                $scope.$watch('etypeId', function() {
                    if(angular.isDefined($scope.etypeId))
                    EtypeService.getEtypeById($scope.etypeId)
                        .success(function(etype) {
                            $scope.name = etype.name;
                        });
                    });
            },
            template : "<div>{{name | localize:language}}</div>"
        };
    });

    
    
});
