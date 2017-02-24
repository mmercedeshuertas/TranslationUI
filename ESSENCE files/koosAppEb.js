define(['jquery', 'angularAMD', 'angular.ui.router', 'ui.bootstrap', 'angular.cookie', 'ang-drag-drop'], function ($, angularAMD) {
    
    var app = angular.module('koosApp.eb', ['ui.bootstrap']);

    app.factory('EntityBaseSearchService', ['$http', function($http){
        var instance = {};

        instance.advancedSearchPromise = function(payload, pageIndex, pageSize){
            payload.pageSize    = pageSize;
            payload.pageIndex   = pageIndex;
            return $http.post('eb/advancedSearch', payload);
        };

        return instance;
    }]);

    /*
     * SINGLETON
     */
    app.factory('LightweightOntologyService', ['$http', function($http){
        var instance = {};

        instance.getInstancesByQueryNodePromise = function(queryNodeId, pageIndex, pageSize, applyGS){
            return $http.get('eb/instances/byquerynode/' + queryNodeId + '/' + pageIndex + '/' + pageSize + '/' + applyGS);
        };

        instance.createQueryNodePromise = function(payload){
            return $http.post('lo/queryNode', payload);
        };

        instance.deleteQueryNodePromise = function(queryNodeId){
            return $http.delete('lo/queryNode/' + queryNodeId);
        };

        instance.getLOsByEtype = function(etypeId){
            return $http.get('lo/lobytype/' + etypeId);
        };

        instance.getOntologyTreeByNode = function(rootId, childrenOnly, applyGS){
            //TODO: add parameter to include semantics
            return $http.get('lo/getTreeNode/' + rootId + '/' + childrenOnly + '/' + applyGS);
            // return $http.get('lo/getTreeNode/' + rootId, {
            //     childrenOnly : childrenOnly,
            //     applyGS : applyGS
            // });
        };

        instance.getOntologyTree = function(id){
            //TODO: add parameter to include semantics
            return $http.get('lo/getTree/' + id);
        };

        instance.countInstances = function(queryNodeId, applyGS){
            return $http.get('lo/countInstances/byquerynode/' + queryNodeId + '/' + applyGS);
        };

        return instance;
    }]);

    app.factory('EntityBaseService', ['$http', function($http){

        var instance = {};

        instance.getByPrefixPromise = function(prefix, typeFilter){
            return $http.get('eb/byprefix/' + prefix + '/' + typeFilter);
        };

        instance.createInstancePromise = function(payload){
            return $http.post('eb/create', payload);
        };

        instance.getInstancesByTypeIdPromise = function(etypeId, pageIndex, pageSize){
            return $http.get('eb/instances/byetypeid/' + etypeId + '/' + pageIndex + '/' + pageSize);
        };

        instance.getInstanceByIdPromise = function(instanceId){
            return $http.get('eb/instances/byid/' + instanceId);
        };

        instance.addAttributeValue = function(entityId, conceptId, value, dataType, attributeId){
            return $http.post('eb/values', {
                instance : entityId,
                concept  : conceptId,
                value    : value,
                dataType : dataType,
                attributeId : attributeId,
                create  : false,
                edit    : false
            });
        };

        instance.addAttributeValues = function(entityId, conceptId, values, dataType, attributeId){
            console.log("Add Attribute Values");
            return $http.post('eb/values', {
                instance : entityId,
                concept  : conceptId,
                value    : values,
                dataType : dataType,
                attributeId : attributeId,
                create  : false,
                edit    : false,
                set     : true
            });    
        }

        instance.editAttributeValue = function(entityId, conceptId, value, dataType, attributeId, valueId){
            return $http.post('eb/values', {
                instance : entityId,
                concept  : conceptId,
                value    : value,
                dataType : dataType,
                attributeId : attributeId,
                create: false,
                edit: true,
                valueId : valueId
            });
        };

        instance.deleteAttributeValue = function(attributeId, valueId){
            return $http.delete('eb/values/' + attributeId + '/' + valueId);
        };

        instance.createAttribute = function(entityId, conceptId, value, dataType, attributeId){
            return $http.post('eb/values', {
                instance : entityId,
                concept  : conceptId,
                value    : value,
                dataType : dataType,
                create   : true,
                edit     : false
            });
        };

        return instance;

    }]);

    /**
     * Filters
     */
    var filterEntityName = function(input) {
        if(!angular.isDefined(input))
            return '';
        var nameConceptId = 2;
        var name = '';
        for(var j in input.attributes){
            if(input.attributes[j].conceptId === nameConceptId) {
                //
                if (input.attributes[j].dataType === 'COMPLEX_TYPE'){
                    var complexName = input.attributes[j].values[0].value;
                    for (var k in complexName.attributes){
                        if (complexName.attributes[k].conceptId === nameConceptId) {
                            name = complexName.attributes[k].values[0].value;
                        }
                    }
                }
                else {
                    name = input.attributes[j].values[0].value;
                }
                break;
            }
            /*
             if(input.attributes[j].values[0].value["@type"] == "Name"){
             name = input.attributes[j].values[0].value.attributes[0].values[0].value;
             break;
             }
             */
        }
        return name;
    };

    app.filter('entityNameExtractor', function(){
        return filterEntityName;
    });

    app.filter('entityClassExtractor', function(){
        return function(input) {
            if(!angular.isDefined(input))
                return '';
            var className = '';
            for(var j in input.attributes){
                if(input.attributes[j].conceptId === 42808) {
                    // 
                    if (input.attributes[j].dataType === 'CONCEPT'){
                        // var complexName = input.attributes[j].values[0].value;
                        // for (var k in complexName.attributes){
                        //     if (complexName.attributes[k].conceptId === 2) {
                        //         name = complexName.attributes[k].values[0].value;
                        //     }
                        // }
                        className = input.attributes[j].values[0].value.name.en;
                    }
                    // else {
                    //     className = input.attributes[j].values[0].value;
                    // }
                    break;
                }
                /*
                if(input.attributes[j].values[0].value["@type"] == "Name"){
                    name = input.attributes[j].values[0].value.attributes[0].values[0].value;
                    break;
                }
                */
            }
            return className;
        };
    });

    app.directive('entityName', function(){
        return {
            restrict : 'E',
            template : '{{instance | entityNameExtractor}}',
            scope : {
                entityId : '='
            },
            controller : ['$scope', 'EntityBaseService', function($scope, EntityBaseService){
                $scope.update = function(){
                    EntityBaseService.getInstanceByIdPromise($scope.entityId)
                        .success(function(instance){
                            $scope.instance = instance;
                        });
                };

                $scope.$watch('entityId', function(){
                    if(angular.isDefined($scope.entityId))
                        $scope.update();
                });
            }]
        };
    });


    app.filter('attributeNameExtractor', function(){
        return function(input) {
            if(!angular.isDefined(input))
                return '';
            return name in input ? input.name : '';
        };
    });

    app.directive('semanticStringAnnotator', function(){
        return {
            restrict : 'E',
            scope : {},
            controller : []
        };
    });

    app.directive('entityPicker', ['$compile', function($compile){
        return {
            restrict : 'EA',
            //replace : true,
            scope : {
                etypeFilter             : '=?',
                entityPickerVar         : '=',
                entityPickerCallback    : '=?',
                label                   : '@?',
                entityNameVar           : '=?'
            },
            templateUrl : 'kosResource/eb/entityPicker.jade',
            controller  : ['$scope', 'EntityBaseService', function($scope, EntityBaseService){
                $scope.getEntityByPrefix = function(value){
                    return EntityBaseService.getByPrefixPromise(value, $scope.etypeFilter)
                        .then(function(response){
                            return response.data.results.map(function(item){
                                return item;
                            });
                        });
                };
                $scope.updateSelectedEntityId = function(instance) {
                    if (instance && instance.id)
                        $scope.entityPickerVar = instance.id;
                };
                $scope.displayName = function(instance) {
                    var displayName = instance.displayName;
                    if (instance.attributes.length > 1 &&
                        instance.attributes[1].values &&
                        instance.attributes[1].values[0].value)
                        displayName += '  (' + filterEntityName(instance.attributes[1].values[0].value) + ')';
                    return displayName;
                };

            }]
        };
    }]);

    app.directive('entityViewer', function(){
        return {
            restrict : 'E',
            scope    : {
                entityId : '=',
                editor : '=?',
                showProvenance : '=?',
                language : '=?',
                loading : '=?',
                lom     : '=?'
            },
            templateUrl : 'kosResource/eb/instance.jade',
            controller : ['$scope', '$http', '$stateParams', 'EntityBaseService', 'EtypeService', 'AuthService',
                function($scope, $http, $stateParams, EntityBaseService, EtypeService, AuthService){
                    $scope.language         = $scope.language || 'en';
                    $scope.queryTmp = {};
                    
                    $scope.hasRole = AuthService.isAuthorized;

                    $scope.$on('languageSelected', function(event, language){
                        if(angular.isDefined(language))
                            $scope.language = language;
                    });

                    $scope.$watch('entityId', function(){
                        if(angular.isDefined($scope.entityId)){
                            $scope.loadEntity();
                            $scope.$emit('changedEntityId', $scope.entityId);
                        }
                    });
                    
                    $scope.loadEntity = function(){
                        $scope.loading = true;
                        EntityBaseService.getInstanceByIdPromise($scope.entityId)
                            .success(function(data){
                                $scope.result = data;
                                $scope.loading = false;
                                EtypeService.getEtypeById(data.typeId)
                                    .success(function(data){
                                        var attributes = [];
                                        for(var catId in data.categories){
                                            for(var i in data.categories[catId].attributes){
                                                attributes.push(data.categories[catId].attributes[i]);
                                            }
                                        }
                                        $scope.etypeAttributes = attributes;

                                    })
                            })
                            .error(function(){
                                $scope.loading = false;
                            });
                    };

                    $scope.addValue = function(){
                        var conceptId = $scope.queryTmp.attribute.conceptId;
                        var replace = false;
                        var addToSet = false;
                        var valueToEdit;
                        var attributeId = $scope.queryTmp.attribute.id;
                        var promise;
                        var method;
                        for(var i in $scope.result.attributes){
                            var attributeDef = $scope.result.attributes[i];
                        
                            if(attributeDef.conceptId === conceptId){
                                if(!$scope.queryTmp.attribute.set || $scope.queryTmp.attribute.set === false){
                                    valueToEdit = attributeDef.values[0].id;
                                    attributeId = attributeDef.values[0].attributeId;
                                    replace = true;
                                }else{
                                    addToSet = true;
                                    attributeId = attributeDef.values[0].attributeId;
                                
                                }
                            }
                        }
                        if(replace){
                            method = EntityBaseService.editAttributeValue;
                        }else if(addToSet){
                            method = EntityBaseService.addAttributeValue;
                        }else{
                            method = EntityBaseService.createAttribute;
                        }
                        
                        promise = method($scope.result.id, conceptId, $scope.queryTmp.value, $scope.queryTmp.attribute.dataType, attributeId, valueToEdit);
                        promise.success(function(data){
                            $scope.loadEntity();
                        });
                    };
                    
                    $scope.openEntity = function(entityId){
                        $scope.entityId = entityId;
                    };

                    $scope.removeValue = function(attributeId, valueId){
                        console.log("Deleting attribute value, attr: " + attributeId + ", value: " + valueId);

                        EntityBaseService.deleteAttributeValue(attributeId, valueId)
                            .success(function(data){
                                $scope.loadEntity();
                            });
                    };
                }
            ]
        };
    });

    /*
     * Lightweight Ontologies
     */
    app.directive('ontologyTree', function(){
        return {
            restrict        : 'E',
            templateUrl     : 'kosResource/eb/ontologyTree.jade',
            scope : {
                language    : '=?',
                root        : '=',
                onSelection : '=?',
                gs          : '=?'
            },
            controller      : ['$scope', '$http', 'LightweightOntologyService', 'AuthService', 'EntityBaseService',
                function($scope, $http, LightweightOntologyService, AuthService, EntityBaseService){
                    $scope.language     = $scope.language || 'en';
                    $scope.isAuthorized = AuthService.isAuthorized;
                    $scope.selected     = undefined;
                    $scope.subjects     = undefined;
                    $scope.nodeFound    = false;
                    
                    $scope.openSubtree = function(queryNode){
                        if(queryNode.node.children)
                            return;
                        if(queryNode.node['@type'] !== undefined){
                            LightweightOntologyService.getOntologyTreeByNode(queryNode.node.id, true, $scope.gs)
                                .success(function(data){
                                    queryNode.node.children = data;
                                });
                        }else{
                            LightweightOntologyService.countInstances(queryNode.node.root.id, $scope.gs).success(function(data){
                                queryNode.node.root['totalInstances'] = data.instances;
                            });
                            queryNode.node.children = [queryNode.node.root];
                        }
                        
                    };

                    $scope.options = {
                        isLeaf: function(node){
                            if(!node['@type'])
                            {
                                return !node.root;
                            }
                            if(node.children)
                                return node.children.length === 0;
                            if(node.childrenNumber !== undefined)
                                return node.childrenNumber === 0;
                            return true;
                        },
                        multiSelection: false
                    };

                    $scope.$watch('root', function(root){
                        if(angular.isDefined(root))
                            LightweightOntologyService.getOntologyTree($scope.root)
                                .success(function(data){
                                    $scope.tree = [data];
                                });
                    });

                    $scope.onDrop = function($event, $data, node){
                        console.log("Entity id: " + $data.id);
                        console.log("Node id: " + node.id);

                        var attributeId = undefined;
                        $scope.subjects = [];
                        $scope.nodeFound = false;

                        for(var i=0; i<$data.attributes.length; i++){
                            if($data.attributes[i].conceptId == 34741){
                                attributeId = $data.attributes[i].id;
                            }
                        }
                        console.log("Attribute id: " + attributeId);

                        //add subjects on the path from root to node
                        console.log($scope.tree[0].root);

                        $scope.addSubject($scope.tree[0].root, node, attributeId);
                        
                        if($scope.nodeFound){
                            console.log($scope.subjects);
                            //add subjects to entity
                            EntityBaseService.addAttributeValues($data.id, 34741, $scope.subjects, "SSTRING", attributeId)
                                .success(function(data){
                                    $scope.selected = node;
                                    $scope.onSelection(node);
                                });
                        }
                    };

                    $scope.addSubject = function(currentNode, targetNode, attrId){
                        if(currentNode.id == targetNode.id){
                            $scope.nodeFound = true;
                        }else{
                            if($scope.options.isLeaf(currentNode)){ 
                                return;
                            }
                            if(currentNode.children){
                                for(var i=0; i<currentNode.children.length; i++){
                                    $scope.addSubject(currentNode.children[i], targetNode, attrId);
                                    if($scope.nodeFound){
                                        break;
                                    }
                                }
                            }
                        }
                        if($scope.nodeFound){
                            console.log("Adding subjects of node " + currentNode.id);
                            //Push subjects of currentNode into $scope.subjets
                            if(currentNode.attributes){
                                for(var i=0; i<currentNode.attributes.length; i++){
                                    if(currentNode.attributes[i].conceptId == 34741 &&
                                        currentNode.attributes[i].dataType == "SSTRING" &&
                                        currentNode.attributes[i].values){
                                        for(var j=0; j<currentNode.attributes[i].values.length; j++){
                                            var subject = {
                                                // attributeId: attrId,
                                                // dataType: "SSTRING",
                                                // operator: "FUZZY",
                                                semanticValue: currentNode.attributes[i].values[j].semanticValue,
                                                value: currentNode.attributes[i].values[j].semanticValue.text
                                            };

                                            $scope.subjects.push(subject);
                                        }
                                    }
                                }
                            }
                        }
                    };

                    $scope.$on('ANGULAR_HOVER', function($event, $channel) {
                        console.log("channel: " + $channel);
                    });

                }]
        };
    });
    
    app.factory('ExportService', function($http){
        var instance = {};
        instance.toExport = [];
        instance.clean = function(){
            instance.toExport = [];
        };
        instance.export = function(format){
            var url = 'dataset-import/export/' + format + '/byid';
            var ids = instance.toExport;
            return $http.post(url, {ids : ids});
        };

        return instance;
    });
    app.directive('entitiesResultDisplayer', function(){
        return {
            restrict    : 'E',
            scope       : {
                results             : '=',
                viewMode            : '=',
                openEntityCallback  : '=',
                paginationCallback  : '=?',
                total               : '=?',
                pageSize            : '=?',
                currentPage         : '=?',
                pageNumber          : '=?',
                lom                 : '=?',
                language            : '=?'
            },
            templateUrl : 'kosResource/eb/entitiesResultDisplayer.jade',
            controller : ['$scope', 'ExportService', function($scope, ExportService){
                
                $scope.language = $scope.language || 'en';
                $scope.$on('languageSelected', function(event, language){
                    if(angular.isDefined(language))
                        $scope.language = language;
                });

                $scope.ExportService = ExportService;
                $scope.downloadLink = {
                    json : '',
                    rdf : ''
                };
                $scope.loader = {
                    json: false,
                    rdf : false
                };
                $scope.export = function(format){
                    $scope.loader[format] = true;
                    $scope.ExportService.export(format)
                        .success(function(data){
                            $scope.loader[format] = false;
                            $scope.downloadLink[format] = data.filepath;
                            $scope.ExportService.clean();
                        });
                };

                $scope.loadPage = function(){
                    $scope.paginationCallback($scope.currentPage);
                };
            }]
        };
    });

    app.directive('attributeProvenance', function(){
        return {
            restrict : 'A',
            scope : {
                valueId : '=',
                provenanceType : '=?',
                showProvenance : '=?'
            },
            transclude: true,
            templateUrl : 'kosResource/eb/attributeProvenance.jade',
            controller : ['$scope', '$http', function($scope, $http){

                var init = function(){
                    if(!$scope.showProvenance || !angular.isDefined($scope.valueId) || !angular.isDefined($scope.provenanceType))
                        return;
                    $http.get('eb/provenance/' + $scope.valueId + '/' + $scope.provenanceType)
                        .success(function(provenance){
                            if(provenance[0])
                                $scope.provenance = provenance[0].source.url;
                        });
                };

                $scope.$watch('showProvenance', init);
                $scope.$watch('valueId', init);
                $scope.$watch('provenanceType', init);
            }]
        };
    });

    app.directive('nlStringPicker', function(){
        return {
            restrict : 'E',
            templateUrl : 'kosResource/eb/nlStringPicker.jade',
            scope : {
                field : '='
            },
            controller : ['$scope', 'KnowledgeBaseService', function($scope, KnowledgeBaseService){
                KnowledgeBaseService.getLanguages()
                    .success(function(data){
                        $scope.languages = data;
                    });
            }]
        };
    });
    app.directive('entityCreator', function(){
       return {
            restrict : 'E',
            scope : {
                etypeId : '=',
                language: '=?'
            },
            templateUrl : 'kosResource/eb/entityCreator.jade',
            controller : ['$scope', 'EtypeService', 'EntityBaseService', function($scope, EtypeService, EntityBaseService){

                var isEmpty = function(values){
                    if(values.length == 0)
                        return true;
                    for(var i in values){
                        if(Object.keys(values[i]).length)
                            return false;
                    }
                    return true;
                };

                var cleanValues = function(values){
                    var v = [];
                    for(var i in values){
                        if(values[i].value)
                            v.push(values[i]);
                    }
                    return v;
                };

                $scope.instance = {
                    attributes : {}
                };
                $scope.language = $scope.language || 'en';
                $scope.init = function(){
                    if(!angular.isDefined($scope.etypeId))
                        return;
                    EtypeService.getEtypeById($scope.etypeId)
                        .success(function(etypeData){
                            $scope.etypeData = etypeData;
                        });
                };

                $scope.$watch('etypeId', $scope.init);

                $scope.initValues = function(values, id){
                    if(!values)
                        return {
                            definitionId :id,
                            values : [{}]
                        };
                    return values;
                };

                $scope.createInstance = function(){
                    var attributes = angular.copy($scope.instance.attributes);
                    var newInstance = {
                        attributes : []
                    };
                    for(var i in attributes){
                        if(attributes[i].values.length === 0)
                            continue;
                        attributes[i].values = cleanValues(attributes[i].values);
                        if(isEmpty(attributes[i].values))
                            continue;
                        newInstance.attributes.push(attributes[i]);
                    }
                    
                    newInstance.typeId = $scope.etypeId;
                    newInstance['@type'] = 'Instance';
                    $scope.newInstance = newInstance;
                    EntityBaseService.createInstancePromise(newInstance)
                        .success(function(data){
                            $scope.result = data;
                        });
                };
            }]
        };
    });

    // ================================================
    // Natural Language Processing (NLP)

    app.factory('NlpService', ['$http', function($http){
        var instance = {};

        instance.runPipeline = function(text, pipelineName, knowledgeBaseId){
            var uri = '/nlp/pipeline/'+ pipelineName ;
            if(knowledgeBaseId)
                uri += '/' + knowledgeBaseId;
            return $http.post(uri, {text : text});
        };
        return instance;
    }]);

    /*
     * @author Stella Margonar
     */
    app.directive('nlpTextAnnotator', function(){
        return {
            restrict : 'E',
            templateUrl : 'kosResource/eb/nlpTextAnnotator.jade',
            scope : {
                text : '=',
                pipeline : '@?'
            },
            controller : ['$scope', 'KnowledgeBaseService', 'NlpService', function($scope, KnowledgeBaseService, NlpService){
                // ------ INIT ------
                // init default pipeline if none specified
                $scope.pipeline = $scope.pipeline || 'FullTextPipeline';
                $scope.errorMessage = '';
                $scope.loading = false;


                KnowledgeBaseService.getLanguages()
                    .success(function(data){
                        $scope.languages = data;
                    });

                $scope.processText = function(text) {
                    $scope.loading = true;
                    NlpService.runPipeline(text, $scope.pipeline, undefined)
                        .success(function(data) {
                            $scope.loading = false;
                            $scope.text = data[0];
                        })
                        .error(function(err) {
                            $scope.loading = false;
                            $scope.errorMessage = err;
                        });
                }
            }]
        };
    });
});