// get slides whose date are between scope.start and scope.end
app.filter('period', function() {
    return function(input, scope) {
        var out = [];
        var start, end;
        if(scope != undefined){
            var day = scope.start.getDate();
            var month = scope.start.getMonth() + 1; // Months begin from zero as January
            var year = scope.start.getFullYear();

            start = parseInt(year)*10000 +  parseInt(month)*100  + parseInt(day);
            day = scope.end.getDate();
            month = scope.end.getMonth() + 1; //Months are zero based
            year = scope.end.getFullYear();
            end = parseInt(year)*10000 +  parseInt(month)*100  + parseInt(day);     // convert start and end dates to Integers
        }
        if(start && end && input){
            for (var i = 0; i < input.length; i++) {
                var date = parseInt(input[i].date.replace(/-/g,''));   // convert date of the slide to a Integer
                if((date >= start) && (date <= end)) {
                    out.push(input[i]);
                }
            }
        }
        else{
            out = input;
        }
        return out;
    }
});

// get slides whose price are between scope.startPrice and scope.endPrice
app.filter('cost', function() {
    return function(input, scope) {
        var out = [];
        var start, end;
        if(scope != undefined){
            start = parseInt(scope.startPrice);
            end = parseInt(scope.endPrice);            // parse costs to Integers
        }
        if(end  && input){
            for (var i = 0; i < input.length; i++) {
                var price = parseInt(input[i].price);  // parse price of the slide to Integer

                if((price >= start) && (price <= end)) {
                    out.push(input[i]);
                }
            }
        }
        else{
            out = input;
        }
        return out;
    }
});


// search result highlighting: copy from angularjs ui-utils source code
// https://github.com/angular-ui/ui-utils/blob/gh-pages/build/ui-utils.js
app.filter('highlight', function () {
    return function (text, search) {
        var result = text;
        if (search) {
            // replace matched part with the same text styled by ui-match class
            if(text.length <= 120){
                result = text.replace(new RegExp(search, 'gi'), '<span class="ui-match">$&</span>');
            }
            else {          // if the content is longer than 120 characters, need to put some dots to indicate something omitted
                // if the omitted part also contains the key words to search, put one between the dots
                result = text.substring(0,120).replace(new RegExp(search, 'gi'), '<span class="ui-match">$&</span>') + '...';
                if(text.lastIndexOf(search) > 120) {
                    result += '<span class="ui-match">'+ search +'</span>' + '...';  //all the key words are shown, add some dots is fine
                }
            }
        }
        else if(text.length > 120){
            result = text.substring(0,120) + '...'    //there is no key words to search for, just add some dots when it is too long
        }
        return result;
    };
});


// pagination filter: display the slides in current page only
app.filter('startFrom', function() {
    return function(input, start) {
        if(input) {
            return input.slice(start);      // slice slides to get the right subset
        }
        return [];
    }
});