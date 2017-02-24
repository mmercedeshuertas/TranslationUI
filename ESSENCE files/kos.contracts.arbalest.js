define(function(){
    return {
        requireControllerFile : function(appName, controllerName){
            return 'arbalest/appControllers/' + appName + '/' + controllerName;
        },

        requireResourceFile : function(appName, resourceName){
            return 'arbalest/appResource/' + appName + '/' + resourceName;
        },

        buildControllerName : function(applicationName, controllerName){
            return applicationName + '::' + controllerName;
        }
    }
});