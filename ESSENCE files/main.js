require.config({
    baseUrl: '',
    paths: {
        'json'              : 'requirejs-plugins/src/json',
        'text'              : 'requirejs-plugins/lib/text',
        'noext'             : 'requirejs-plugins/src/noext',
        
        'angular'           : 'angular/angular.min',
        'angular.ui.router' : 'angular-ui-router/release/angular-ui-router.min',
        'ngMaterial'        : 'angular-material/angular-material.min',
        'angular.ui.grid'   : 'angular-ui-grid/ui-grid.min',
        'angular.table'     : 'ng-table/ng-table.min',
        'angular.resource'  : 'angular-resource/angular-resource.min',
        'angular.animate'   : 'angular-animate/angular-animate.min',
        'angular.aria'      : 'angular-aria/angular-aria.min',
        'angular.cookie'    : 'angular-cookie/angular-cookie.min',
        'angularAMD'        : 'angularAMD/angularAMD.min',
        'angular.chartjs'   : 'angular-chart.js/dist/angular-chart.min',
        'angular.ui.extras' : 'ui-router-extras/release/ct-ui-router-extras.min',
        'angular.ui.checklist' : 'angular-checklist-model/checklist-model',
        'ngSanitize'        : 'angular-sanitize/angular-sanitize.min',
        
        //'angular.strap'     : 'angular-strap/dist/angular-strap.min',
        'angular.treeview'  : 'angular-tree-control/angular-tree-control',
        'hammerjs'          : 'hammerjs/hammer.min',
        'ui.bootstrap'      : 'angular-bootstrap/ui-bootstrap-tpls.min',
        'jquery'            : 'jquery/dist/jquery.min',
        'jquery-ui'         : 'jquery-ui/jquery-ui.min',
        'ng.load'           : 'angularAMD/ngload.min',
        'chartjs'           : 'Chart.js/Chart.min',
        // Socket.io
        'socket.io'         : 'socket.io/socket.io',
        
        
        'bootstrap_js'      : 'bootstrap/dist/js/bootstrap.min',

        // move to ocLoad
        //'ocLazyLoad'        : 'js/ocLazyLoad',

        // jquery Window
        'jquery.window'     : 'js/jquery.window',
        
        'kos.security'              : 'js/kos.security',
        'kos.contracts.arbalest'    : 'js/kos.contracts.arbalest',
        'kos.arbalest'              : 'js/kos.arbalest',
        'kos.ui'                    : 'js/kos.ui',
        
        'koosApp.kb'        : 'js/koosAppKb',
        'koosApp.eb'        : 'js/koosAppEb',

        // Filters
        'KOS.filters'       : 'js/filters/kos.filters',

        //'bloodhound'        : 'typeahead.js/dist/bloodhound.min',
        //'typeahead.min'     : 'typeahead.js/dist/typeahead.bundle.min',
        //'angular.typeahead' : 'angular-typeahead.min'
        'jquery.jqtree'         : 'jqtree/tree.jquery',
        //'leaflet'           : 'leaflet/dist/leaflet'
        // Multi select, used initially in KB explorer
        'angular.ui.select'         : 'angular-ui-select/dist/select.min',
        'dashboard.lte'         : 'js/dashboard',
        /*
         * MAPS
         */
        //'lodash'            : 'lodash/dist/lodash.min',
        //'angular.maps'      : 'angular-google-maps/dist/angular-google-maps.min'
        'angular.jqcloud'   : 'angular-jqcloud/angular-jqcloud',
        'jqcloud2'          : 'jqcloud2/dist/jqcloud.min',
        'd3'                : 'd3/d3.min',
        'd3.cloud'          : 'd3.layout.cloud/d3.layout.cloud',
        'toggle-switch' : 'angular-bootstrap-toggle-switch/angular-toggle-switch.min',

        // tc-angular-charjs (For LKC stats charts)
        'tc.chartjs' : 'tc-angular-chartjs/dist/tc-angular-chartjs.min',

        // angular vis for concept graph
        'vis'           : 'vis/dist/vis.min',
        'ngVis'         : 'angular-visjs/angular-vis',

        // MAp lib for kg-context visualization app
        'leaflet'           : 'leaflet/dist/leaflet',
        'angular.leaflet'  : 'angular-leaflet/dist/angular-leaflet-directive.min',
        'leaflet.markercluster': 'leaflet.markercluster/dist/leaflet.markercluster',


        // library for drag and drop, used initially in LOM
        'ang-drag-drop'     : 'angular-native-dragdrop/draganddrop',
        'angular.ui.sortable'       : 'angular-ui-sortable/sortable.min'
    },
    shim: {
        'dashboard.lte'             : ['jquery', 'bootstrap_js'],
        'angularAMD'                : ['angular'],
        'angular-route'             : ['angular'],
        'angular.animate'           : ['angular'],
        'angular.aria'              : ['angular'],
        'ngMaterial'          : ['angular', 'hammerjs', 'angular.aria', 'angular.animate'],
        'angular.resource'          : ['angular'],
        'angular.ui.grid'           : ['angular', 'jquery'],
        'angular.table'             : ['angular', 'jquery'],
        'angular.ui.router'         : ['angular'],
        'angular.ui.extras'         : ['angular', 'angular.ui.router'],
        'angular.ui.select'         : ['angular', 'jquery'],
        'angular.ui.checklist'      : ['angular'],
        'angular.maps'              : ['angular', 'lodash'],
        'angular.treeview'          : ['angular'],
        'ng.load'                   : ['angularAMD'],
        'angular.chartjs'           : ['angular', 'chartjs'],
        'ui.bootstrap'              : ['angular'],
        'angular.strap'             : ['angular'],
        'angular.cookie'            : ['angular'],
        'jquery.window'             : ['jquery', 'jquery-ui'],
        'jquery.tree'               : ['jquery'],
        'bootstrap_js'              : ['jquery'],
        'hammerjs'                  : { exports: 'Hammer' },
        'tangcloud'                 : ['angular'],
        'jqcloud2'                  : ['jquery'],
        'angular.jqcloud'           : ['angular', 'jqcloud2'],
        'd3'                        : { exports: 'd3'},
        'd3.cloud'                 : ['d3'],
        'toggle-switch'             : ['angular', 'angular.animate'],
        'tc.chartjs'        : ['angular', 'chartjs'],
        'ngSanitize'        : ['angular'],
        'vis'               : [],
        'ngVis'             : ['angular', 'vis'],
        'leaflet'                  : { exports : 'L' },
        'leaflet.markercluster'     : ['leaflet'],
        'angular.leaflet'           : ['angular', 'leaflet'],
        'ang-drag-drop'     : ['angular'],
        'angular.ui.sortable' : ['angular', 'jquery-ui', 'jquery']
    },
    deps: ['js/koosApp']
    //deps: ['js/koosAppMaterial']
});
