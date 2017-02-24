define(['angularAMD'], function (angularAMD) {
    
    var kosFilters = angular.module("KOS.filters", []);

    kosFilters.filter('range', function() {
        return function(input, total) {
            total = parseInt(total);
            for (var i=0; i<total; i++)
                input.push(i);
            return input;
        };
    });

    kosFilters.filter('reverse', function() {
        return function(items) {
            if(items)
                return items.slice().reverse();
        };
    });

    
    kosFilters.filter('localize', function(){
        return function(input, languageCode) {
            if(!angular.isDefined(input))
                return '';
            if(!angular.isDefined(languageCode))
                return '';
            return typeof(input) === 'object' ? (languageCode in input ? input[languageCode] : 'EN.' + input.en) : input;
        };
    });
    
    kosFilters.filter('startFrom', function() {
        return function(input, start) {
            start = +start; //parse to int
            return input.slice(start);
        };
    });

    kosFilters.filter('displayLanguage', function() {
        return function(input, languages) {
            var output = input;
            for (var i in languages) {
                if (languages[i].languageCode == input) {
                    output =languages[i].displayLanguage;
                    break;
                }
            }
            return output;
        }
    });
});