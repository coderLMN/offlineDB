
var app = angular.module('app', ['ui.bootstrap']);
app.controller('AppCtrl', function($scope, $modal, $timeout, indexDBService) {
    $scope.message = {};
    $scope.flags = {};
    $scope.flags.showRemoveIcon = false;      //remove icons are hidden by default to protect data from being removed by random clicks
    $scope.flags.title = "Offline DB demo";
    $scope.pageSize = 10;

    $scope.date = {};
    $scope.cost = {};
    $scope.maxSize = 5;
    $scope.imgBuf = {};

    $scope.setDefaultFilter = function() {
        $scope.cost.startPrice = 0;         //endPrice will be set in init()
        $scope.cost.endPrice = 0;
        $scope.date.start = new Date();     //assign current date to initial start date, which is subject to further adjustment in init()
        $scope.date.end = new Date();
        $scope.currentPage =  1;            //set default page as the first page
    };
    $scope.init = function() {
        window.scrollTo(0,0);
        $scope.flags.title="Loading slides......";
        $scope.flags.isViewLoading = true;
        $scope.slides = [];
        $scope.flags.sorted ={};            //clear sort flags
        $scope.imgBuf = {};
        $scope.setDefaultFilter();
        $scope.message.type = "";

        indexDBService.open(function(){
            indexDBService.getAllItems(function(row){
                $scope.slides.push(row);                       //get all the slides and put them in DOM
                if(! $scope.imgBuf[row.imageAll[0]]){          //load small image which is stored in IndexedDB
                    indexDBService.getItem('images', row.imageAll[0], function(item){
                        $scope.imgBuf[row.imageAll[0]] = item.imgBuf;        //enable image display in web page
                    });
                }
                if(parseInt(row.price) > $scope.cost.endPrice ){
                    $scope.cost.endPrice  = parseInt(row.price);
                }                                             //set max value of search item: end price
                var start = new Date();
                var currentDateString = row.date.replace(/-/g,'');
                start.setFullYear(parseInt(currentDateString.substring(0,4)), parseInt(currentDateString.substring(4,6)) -1, parseInt(currentDateString.substring(6)));
                if(start < $scope.date.start) {
                    $scope.date.start = start;                //set max value of search item: end date
                }
            },
            function(){
                $scope.slides.sort(function(a, b) {
                    return ((a.timeStamp > b.timeStamp) ? -1 : ((a.timeStamp < b.timeStamp) ? 1 : 0));
                });                                         // sort by the time added by default
                $scope.flags.title = 'Offline DB demo';
                $scope.flags.isViewLoading = false;
                $scope.currentPage = 1;
                $scope.$apply();
            });
        });
    };
    $scope.toTop = function() {
        window.scrollTo(0,0);
    };

    $scope.toggleRemove = function(){
        $scope.flags.showRemoveIcon = ! $scope.flags.showRemoveIcon;
    };

    $scope.close = function () {
        $scope.shouldBeOpen = false;
    };

    $scope.datePickStart = function() {
        $timeout(function() {
            $scope.flags.isOpenStart = true;
        });
    };
    $scope.datePickEnd = function() {
        $timeout(function() {
            $scope.flags.isOpenEnd = true;
        });
    };

    $scope.newDatePick = function() {
        $timeout(function() {
            $scope.flags.newDateOpen = true;
        });
    };

    $scope.closeMessage = function() {
        $scope.message = {};
    };

    $scope.clearDB = function(){                           //clear all the slides in DB
        $scope.flags.title = "Clearing database......";
        $scope.flags.isViewLoading = true;
        indexDBService.getAllItems(function(slide){
            indexDBService.deleteRecord(slide.timeStamp, function(){
                console.log(slide);                        //do nothing but log each removed slide deleted successfully
            });
        },
        function(){
            window.scrollTo(0,0);
            $scope.slides = [];
            $scope.message.text = "The database is now empty!";
            $scope.message.type = "alert-info";
            $scope.flags.title = "Offline DB demo";
            $scope.flags.isViewLoading = false;
            $scope.$apply();
        });
    };

    $scope.sort = function (key) {             //sort slides according to the key clicked
        if($scope.flags.sorted[key]){
            $scope.slides.reverse();           //each time the thead clicked, reverse the sort order
        }
        else{
            $scope.flags.sorted ={};            //clear previous sort flags
            $scope.flags.sorted[key] = true;
            $scope.slides.sort(function(a, b) {
                var x = parseFloat(a[key].replace(/-/g,''));
                var y = parseFloat(b[key].replace(/-/g,''));
                return ((x > y) ? -1 : ((x < y) ? 1 : 0));
            });
        }
    };

    //$index is subject to change after user modify sort or search condition, and hence is unstable.
    //to make sure the right record is processed, a timeStamp has to be passed as parameter
    function getItemByTimeStamp(timeStamp){        //get the slide whose timeStamp matches the parameter
        var total = $scope.slides.length;
        var found = false;
        var i = 0;
        var result = null;
        while(!found && i<total){
            if($scope.slides[i].timeStamp != timeStamp){
                i++;
            }
            else{
                result = $scope.slides[i];
                found = true;
            }
        }
        return result;
    }

    $scope.openSlide = function (timeStamp) {
        var modalInstance = $modal.open({       //pass the slide to  ShowSlideModalCtrl
            templateUrl: 'showSlide.html',
            controller: "ShowSlideModalCtrl",
            resolve: {
                slide: function() {
                    return getItemByTimeStamp(timeStamp);
                }
            }
        });
    };

    //encode text input to transform potential malicious html/javascript inputs
    function encode(text){
        return text.replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
    //Now this method handles not only editing and saving new slide, but also modifying existing slide
    $scope.addSlide = function(timeStamp) {
        var modalInstance = $modal.open({
            templateUrl: 'newSlide.html',
            controller: "NewSlideModalCtrl",
            resolve: {
                slide: function () {
                    return getItemByTimeStamp(timeStamp);
                }
            }
        });
        modalInstance.result.then(function(record) {      //record is returned object from NewSlideModalCtrl
            var newDate = '';
            if(angular.isDate(record.date)){
                var day = parseInt(record.date.getDate());
                var month = parseInt(record.date.getMonth() + 1); //Months are zero based
                var year = parseInt(record.date.getFullYear());

                newDate += year + '-';
                if(month < 10) {
                    newDate += '0' +  month + '-';
                }
                else{
                    newDate += '' + month + '-';
                }
                if(day < 10) {
                    newDate += '0' +  day;
                }
                else{
                    newDate += '' + day;
                }
            }
            else{
                newDate = record.date;                      //if date is not modified
            }
            var timeStamp = new Date().getTime();
            if(record.timeStamp){
                timeStamp = record.timeStamp;
            }
            var slide = {
                "name" :  encode(record.name),         //encode text fields to protect DB from malicious input
                "text": encode(record.text),
                "location": encode(record.location),
                "imageAll": record.imageAll,
                "date": newDate,
                "price": ''+record.price,
                "timeStamp" : timeStamp
            };                                              //create a slide object
            indexDBService.addRecord('slides', slide, function(){     //save the slide
                $scope.init();
                $scope.$apply();
            });
        }, function () {
            console.log('failed to add new slide: ' + record);
        });
    }

    $scope.removeSlide = function(timeStamp) {
        var slide = getItemByTimeStamp(timeStamp);
        var res = confirm("Do you mean to remove this slide? " + slide.name);
        if (res == true) {
            indexDBService.deleteRecord(slide.timeStamp, function(){
                $scope.init();
                $scope.message.text = "Record removed: " +  slide.location+'  |  ' + slide.name+'  |  ' +slide.imageAll.join(' ') + ' | ' +slide.date+'  |  RMB ' +slide.price+' | ' +slide.text;
                $scope.message.type = "alert-danger";
                $scope.$apply();
            });
        }
    };

    $scope.$watch('numPages', function () {           //catch any change to total pages available
        if($scope.numPages < $scope.currentPage){
            $scope.currentPage =  $scope.numPages;    //when currentPage is out of boundary, which normally happens under some filter condition, change it to the last page
        }
    });
    $scope.$watch('currentPage', function () {           //catch any change to current page number
        if($scope.currentPage == 0){
            $scope.currentPage =  1;                  //when currentPage is set to 0 by bootstrap ui, reset it to 1
        }
    });
    $scope.setDefaultFilter();                       //set default search value
    $scope.init();                                   //load slides
});

// open a modal box to show a specific slide
app.controller('ShowSlideModalCtrl', function($scope, $modalInstance, slide) {
    $scope.record = slide;
    $scope.exit = function() {              // only one close icon in show modal box
        $modalInstance.dismiss('cancel');
    };
});

// open a modal box to add a new slide record or modify an existing record
app.controller('NewSlideModalCtrl', function($scope, $modalInstance, slide, indexDBService, imageResizeService) {
    var imageStr = '\n';           // use \n instead of blank to split image files to contain file names with blanks inside
    $scope.imgBuf = {};
    if(slide){
        $scope.newSlide = slide;
        $scope.newSlide.price = parseInt(slide.price);
        imageStr = '\n' + slide.imageAll.join('\n') + '\n';
        slide.imageAll.forEach(function(img) {
            indexDBService.getItem('images', img, function(item){
                $scope.imgBuf[img] = item.imgBuf;        //enable image display in web page
                $scope.$apply();                 //apply change to reflect instantly the images selected
            });
        });
    }
    else{
        $scope.newSlide = {};
        $scope.newSlide.date = new Date();
    }
    $scope.ok = function() {
        $modalInstance.close($scope.newSlide);          // confirmed save, return the newSlide to the caller in AppCtrl
    };
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.selectFile = function(element) {    //select image files within the photos directory
        var file = element.files[0];
        console.log(file);
        if(0 <= imageStr.indexOf('\n' + file.name +'\n')) {  //check if image file already selected
            $scope.duplicateImg = true;
        }
        else{
            var timeStamp = file.lastModifiedDate.getTime();
            indexDBService.getItem('images', file.name, function(item){
                if(!item || item.timeStamp != timeStamp){      //file not re-sized or modified after re-size
                    $scope.addImgBuf = true;
                    imageResizeService.resize(file, function(canvas){
                        var imgSelected = {imageFile: file.name, imgBuf: canvas.toDataURL(file.type), timeStamp: timeStamp};
                        indexDBService.addRecord('images', imgSelected, function(){     //save the image
                            $scope.imgBuf[file.name] = imgSelected.imgBuf;
                            $scope.$apply();                 //apply change to reflect instantly the images selected
                        });
                    });
                }
                else{
                    indexDBService.getItem('images', file.name, function(item){
                        $scope.imgBuf[file.name] = item.imgBuf;        //enable image display in web page
                        $scope.$apply();                 //apply change to reflect instantly the images selected
                    });
                }
            })
            imageStr += file.name + '\n'; // newSlide.image is only for duplication check purpose
            $scope.newSlide.imageAll = imageStr.replace(/^\n+|\n+$/g, '').split('\n');   // this is the one to persist
        }
    };

    $scope.clearError = function(){
        $scope.duplicateImg = false;       // hide the duplicate image error note
    };
    $scope.clearExists = function(){
        $scope.addImgBuf = false;       // hide the duplicate image error note
    };
    $scope.cancelImg = function(img){      // remove the img from imageAll list
        var start = imageStr.indexOf('\n' + img + '\n');
        if(start > -1){
            imageStr = imageStr.substring(0,start) + imageStr.substring(start+img.length+1);   //remove img from the string
            if(imageStr.length > 1){
                $scope.newSlide.imageAll = imageStr.replace(/^\n+|\n+$/g, '').split('\n');
            }
            else{
                $scope.newSlide.imageAll = [];
            }
        }
    }
});
