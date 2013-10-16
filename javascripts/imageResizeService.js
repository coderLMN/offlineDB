app.service('imageResizeService', function() {
    this.resize = function(file, fn){
        var dimension = 300;            //dimension of the target image, which will be saved in IndexedDB

        var fileLoader = new FileReader(),
            canvas = document.createElement('canvas'),
            context = null,
            imageObj = new Image();

        //create a hidden canvas object we can use to create the new resized image data
        canvas.id     = "hiddenCanvas";
        canvas.height = dimension;
        canvas.width  = dimension;
        canvas.style.visibility   = "hidden";
        document.body.appendChild(canvas);

        //if it's a valid image file, feed fileloader with data from the image file
        if (file.type.match('image.*')) {
            fileLoader.readAsDataURL(file);
        }
        else{
            console.log('This file : ' + file.name + ' is not a valid image file.');
        }

        // when the fileloader has the file object, it passes data to the image object,
        // which will triggers the imageObj onload function once the image has loaded.
        fileLoader.onload = function() {
            var data = this.result;
            imageObj.src = data;
        };

        imageObj.onload = function() {
            // Check for empty images
            if(this.width == 0 || this.height == 0){
                console.log('Image is empty');
            } else {
                var top = 0;
                var left = 0;
                var hei = this.height;
                var wid = this.width;           //default drawing area

                var diff = Math.abs(this.width - this.height);     //difference between width and height
                if(this.width > this.height){
                    left = Math.round(diff/2);
                    wid = this.width - diff;
                }
                else{
                    top = Math.round(diff/2);
                    hei = this.height - diff;
                }                                 //get central square area of the image

                context = canvas.getContext('2d');
                context.clearRect(0,0,dimension,dimension);
                //draw the central 300x300 pixel square image on the canvas -- it's a HTML 5 method
                context.drawImage(imageObj, left, top, wid, hei, 0, 0, dimension, dimension);
                fn(canvas);              //pass the re-sized image back to the slide edit modal
            }
        };
    }
});