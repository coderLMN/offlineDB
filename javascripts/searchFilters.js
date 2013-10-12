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
        if (search) {
            text = text.toString();
            search = search.toString();
            // replace matched part with the same text styled by ui-match class
            return text.replace(new RegExp(search, 'gi'), '<span class="ui-match">$&</span>');
        } else {
            return text;
        }
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