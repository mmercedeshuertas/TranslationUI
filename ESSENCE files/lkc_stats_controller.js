/*'use strict';
define(['kos.arbalest', 'angularAMD'],
    function(kos, angularAMD){
    var appNameSpace = 'lkcApp';
    /*
     * LKC Statistics
     
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
            pointStrokeColor: '#fff',
            pointHighlightFill: '#fff',
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

        kos.kosController(appNameSpace, 'LKCAPP_LKCStatsController', ['$scope', '$http', '$interval', function($scope, $http, $interval){

                // LKC Stats 
                $scope.genericStatsKind    = 'current';
                $scope.lkcStats     = {
                    labels: [],
                    datasets: [{data:[]}]
                };
                var d = new Date();
                
                $scope.yesterday    = d.getTime() - 86400000;
                $scope.week         = d.getTime() - (86400000 * 7);
                $scope.month        = d.getTime() - (86400000 * 30);
                
                $scope.rangeFrom    = undefined;

                $scope.setRangeFilter = function(filter){
                    $scope.rangeFrom = filter;
                    $scope.refreshLKCStats();
                };
                
                $scope.chartOptions = {
                    responsive: true,
                    scaleShowGridLines : true,
                    legendTemplate : '<ul class="tc-chart-js-legend"><% for (var i=0; i < datasets.length; i++) { %> <li><span style=\'background-color : <%=datasets[i].fillColor%>; border: <%=datasets[i].fillColor %> 1px solid; \'></span><% if (datasets[i].label) { %> <%=datasets[i].label %> <%}%></li><%} %> </ul>',
                    multiTooltipTemplate: '<%if (datasetLabel){%><%=datasetLabel%>: <%}%> <%= value %>',
                };

                $scope.lkcStatsBar = {};

                $scope.toggleLKCStats = function(kind){
                    if(kind == $scope.genericStatsKind)
                        return;
                    $scope.genericStatsKind = kind;
                    $scope.refreshLKCStats();
                }

                $scope.refreshLKCStats = function(){
                    $http.get('lkcApp/lkcStatistix/' + $scope.rangeFrom)
                        .success(function(payload){
                                
                                var index = 0;
                                
                            var colorChart ={
                                'WORD_FORM'    : 'rgba(128 ,150,153 ,1)',
                                'SYNSET_EXAMPLE'         : 'rgba(41  ,187,204 ,1)',
                                'SYNSET'            : 'rgba(77  ,255,174 ,1)',
                                'WORD'              : 'rgba(204 ,41 ,129 ,1)',
                                'SENSE'             : 'rgba(255 ,36 ,71  ,1)',
                                'LEXICAL_GAP'       : 'rgba(204 ,48 ,41 , 1)'
                            };
                            var data = payload.typeMap;
                            var datasets = [];
                            // dataset building
                            var n = 0;
                            for(var kind in data){
                                var dataset = properties[n++] || { data: []};
                                dataset.label = kind;
                                for(var l in typeLabels)
                                    dataset.data.push(0);
                            
                                for(var type in data[kind]){
                                    dataset.data[typeLabels[type]] = data[kind][type][$scope.genericStatsKind];
                                }
                                datasets.push(dataset);
                            }

                            var tmp = [];
                            for(var l in typeLabels)
                                tmp.push(l);
                            
                            $scope.lkcStats = {
                                labels      : tmp,
                                datasets    : datasets,
                                show        : $scope.lkcStats.show || false
                            };

                            //Stacked Bar per kind
                            $scope.lkcStatsBar = {};
                            for(var objectType in data){
                                var element = data[objectType];
                                var pending     = (element.VALIDATION_LKC_PENDING ? element.VALIDATION_LKC_PENDING.current : 0) + (element.VALIDATION_UKC_PENDING ? element.VALIDATION_UKC_PENDING.current : 0);
                                var accepted    = (element.VALIDATED_LKC ? element.VALIDATED_LKC.current : 0) + (element.VALIDATED_UKC ? element.VALIDATED_UKC.current : 0);
                                var rejected    = (element.REJECTED_LKC ? element.REJECTED_LKC.current : 0) + (element.REJECTED_UKC ? element.REJECTED_UKC.current : 0);
                                var done        = (element.SYNC_READY ? element.SYNC_READY.current : 0) + (element.SYNCED ? element.SYNCED.current : 0);
                                var sum = done + accepted + rejected + pending; 

                                $scope.lkcStatsBar[objectType] = {
                                    pending     : Math.round(pending != 0   ? (pending / sum)   * 100 : 0),
                                    accepted    : Math.round(accepted != 0  ? (accepted / sum)  * 100 : 0),
                                    rejected    : Math.round(rejected != 0  ? (rejected / sum)  * 100 : 0),
                                    done        : Math.round(done != 0      ? (done / sum)      * 100 : 0),
                                    total       : sum
                                };
                                

                            }
                        })
                        .error(function(data){
                            console.error('Error retrieving statistics');
                            console.error(data);
                            $scope.statisticsError = data;
                        });    
                }
                /*
                $scope.refreshLKCStatsPromise = $interval($scope.refreshLKCStats,10000);
                $scope.$on('$destroy', function(){
                    if (angular.isDefined($scope.refreshLKCStatsPromise))
                        $interval.cancel($scope.refreshLKCStatsPromise)
                });

    *//*
                $scope.refreshLKCStats();
                // LKC Stats end

            }]);
    
        kos.directive('lkcStats', function(){
        return {
            restrict    : 'E',
            scope       : {},
            replace     : true,
            controller  : kos.buildControllerName(appNameSpace, 'LKCAPP_LKCStatsController'),
            templateUrl : kos.requireResourceFile(appNameSpace, 'lkc_stats.jade'),
        };
    });
        
    });*/