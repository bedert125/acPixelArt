var app = angular.module("PixArtApp", [
    'ngFileUpload',
    'ngMaterial'
]);

app.config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('pink')
        .accentPalette('orange');
});

app.controller("mainController", function IndexController($scope) {
    var ctrl = this;
    ctrl.sourceImage = "";

    ctrl.onChange = function (files) {
        if (files[0] == undefined) return;
        $scope.fileExt = files[0].name.split(".").pop()
    }

})


app.directive("pixeling", ["$timeout", "$interval", function ($timeout, $interval) {
    return {
        link: function (scope, element, attributes, ctrls) {
            'use strict';
            var canvas = element.find("#pixelArt")[0];
            var canvasImg = element.find("#originalImageCanvas")[0];
            var idImage = attributes.pixeling;
            var ctx = canvas.getContext('2d');
            var ctxImg = canvasImg.getContext('2d');
            var imageElement = angular.element(
                document.getElementById(idImage));

            var domImage = imageElement[0];

            scope.controls={
                showColors: true,
                guide: 16,
                isGuide : function(index){
                    return ((index +1) % scope.controls.guide) === 0;
                }
            }

            var imageData = {
                w: 0,
                h: 0,
                result: {
                    w: 32,
                    h: 32
                },
                gridSize: 10
            }

            var pixelImage = [];

            function initPixelImage() {
                var x, y;
                for (x = 0; x < imageData.result.w; x++) {
                    var row = []
                    for (y = 0; y < imageData.result.h; y++) {
                        row.push("#FFFFFF")
                    }
                    pixelImage.push(row);
                }
            }

            initPixelImage()


            scope.pixelData = imageData;
            function drawGrid() {
                lock()
                setTimeout(drawGridInner, 10);
            }

            function drawGridInner() {

                // var processing = $interval(function () {
                //     console.log(imageData.process)
                //     scope.loadingProcess = imageData.process;
                // }, 500);

                // var loaderText = document.getElementById("loaderText")


                var x, y;
                var step = imageData.gridSize;
                var hg = imageData.result.h * imageData.gridSize;
                var wg = imageData.result.w * imageData.gridSize;
                var max = imageData.result.h * imageData.result.w;

                var pixelSize = imageData.pixelSize; //Math.floor(imageData.maxSize / imageData.result.w);
                // imageData.pixelSize = pixelSize;


                var current = 0

                // ctx.fillStyle = "#FF0000";
                // ctx.strokeStyle = "#FF0000";

                var xPadding = imageData.clip.x1 + 1;
                var yPadding = imageData.clip.y1 + 1;

                for (x = 0; x < imageData.result.w; x++) {
                    var xg = x * imageData.gridSize;
                    var xp = (x * pixelSize) + xPadding;
                    for (y = 0; y < imageData.result.h; y++) {

                        var yg = y * imageData.gridSize;
                        var yp = (y * pixelSize) + yPadding;

                        getPixelColor(xp, yp, pixelSize)

                        ctx.fillRect(xg, yg, imageData.gridSize, imageData.gridSize);
                        // ctx.rect(xg, yg, imageData.gridSize, imageData.gridSize);

                        // ctx.moveTo(xg, 0);
                        // ctx.lineTo(xg, hg);
                        // ctx.stroke();
                        // ctx.moveTo(0, yg);
                        // ctx.lineTo(wg, yg);
                        // ctx.stroke();
                        current++;
                        imageData.process = (current / max) * 100

                        // loaderText.innerText = imageData.process + "%"

                        // console.log(((current / max) * 100) + "% (" + current + "/" + max)

                    }
                }

                // processing && $interval.cancel(processing);

                $timeout(rgbQuant, 10)
                // console.log(imageData)
                // canvas.width = imageData.gridSize * imageData.result.w;
                // canvas.height = imageData.gridSize * imageData.result.h;
            }

            function getModa(values) {
                var sum = {};
                for (var i = 0; i < values.length; i++) {
                    var value = values[i]
                    if (!sum[value]) {
                        sum[value] = 0;
                    }
                    sum[value]++;
                }
                var max = -1;
                var keyMax;
                for (var key in sum) {
                    if (max < sum[key]) {
                        max = sum[key]
                        keyMax = key;
                    }
                }
                console.log(sum)
                return keyMax;
            }

            function getMedia(values) {
                var sum = [0, 0, 0];
                for (var i = 0; i < values.length; i++) {
                    var value = values[i]
                    sum[0] += value[0];
                    sum[1] += value[1];
                    sum[2] += value[2];
                }


                sum[0] = Math.floor(sum[0] / values.length);
                sum[1] = Math.floor(sum[1] / values.length);
                sum[2] = Math.floor(sum[2] / values.length);

                var rgb = 'rgb(' + sum[0] + ', ' + sum[1] +
                    ', ' + sum[2] + ')';
                // console.log(rgb)
                return sum;
            }

            function pick(x, y, type, ctxLocal) {
                ctxLocal = ctxLocal || ctxImg;
                var pixel = ctxLocal.getImageData(x, y, 1, 1);
                var data = pixel.data;
                // var rgba = data[0] + ', ' + data[1] +
                //     ', ' + data[2];
                var rgb;

                switch (type) {
                    case "rgb":
                        rgb = 'rgb(' + data[0] + ', ' + data[1] +
                            ', ' + data[2] + ')';
                        break;
                    case "array":
                        rgb = [data[0], data[1], data[2]];
                        break;

                }
                return rgb;
            }

            function getPixels(start, end, type) {
                var x, y;
                var colors = [];

                for (x = start.x; x < end.x; x++) {
                    for (y = start.y; y < end.y; y++) {
                        var color = pick(x, y, type);
                        colors.push(color)
                    }
                }
                return colors;
            }

            function getPixelColor(x, y, pixelSize) {
                var start = {
                    x: x,
                    y: y
                };
                var end = {
                    x: x + pixelSize,
                    y: y + pixelSize
                };

                var colors = getPixels(start, end, 'array')
                // var newColor = getModa(colors);
                var newColor = getMedia(colors);

                var rgb = 'rgb(' + newColor[0] + ', ' + newColor[1] +
                    ', ' + newColor[2] + ')';

                // var rgbColor = newColor.split(",")
                //  console.log(start, end,newColor)
                ctx.fillStyle = rgb;

                return newColor;

            }

            var img = new Image();


            function drawOriginal() {
                imageData.h = img.height;
                imageData.w = img.width;


                var originalStyle = {}

                canvasImg.width = imageData.w;
                canvasImg.height = imageData.h;

                canvas.width = imageData.gridSize * imageData.result.w;
                canvas.height = imageData.gridSize * imageData.result.h;

                var max = imageData.w > imageData.h ? imageData.h : imageData.w;
                imageData.maxSize = max;

                var pixelSize = Math.floor(imageData.maxSize / imageData.result.w);
                imageData.pixelSize = pixelSize;

                var cipMax = (pixelSize * imageData.result.w);

                if (max == imageData.w) {
                    canvasImg.style.width = canvas.width < imageData.w ? canvas.width : imageData.w;
                } else {
                    canvasImg.style.width = "";
                }

                if (max == imageData.h) {
                    canvasImg.style.height = canvas.width < imageData.h ? canvas.height : imageData.h;
                } else {
                    canvasImg.style.height = "";
                }



                imageData.clip = {
                    x1: -1,
                    y1: -1,
                    x2: cipMax + 2,
                    y2: cipMax + 2,
                    size: cipMax + 2
                }




                clippingImage()

            }

            function clippingImage() {
                ctxImg.clearRect(0, 0, canvasImg.width, canvasImg.height);
                ctxImg.beginPath();//ADD THIS LINE!<<<<<<<<<<<<<
                ctxImg.moveTo(0, 0);
                ctxImg.drawImage(img, 0, 0);
                ctxImg.strokeStyle = "#FF0000";
                ctxImg.rect(imageData.clip.x1, imageData.clip.y1,
                    imageData.clip.size, imageData.clip.size);

                ctxImg.stroke();
            }

            $(canvasImg).on("mousedown", function (evt) {

                var clipOriginal = angular.copy(imageData.clip);
                var mouseOriginal = {
                    x: evt.clientX,
                    y: evt.clientY
                }
                $(canvasImg).on("mousemove", function (evt) {
                    var left = mouseOriginal.x > evt.clientX
                    var x = Math.abs(mouseOriginal.x - evt.clientX);
                    if (left) x = x * -1;

                    x = clipOriginal.x1 + x;
                    if (x < 0) {
                        x = -1;
                    }

                    var y = -(mouseOriginal.y - evt.clientY);

                    y = clipOriginal.y1 + y;
                    if (y < 0) {
                        y = -1;
                    }


                    imageData.clip.x1 = x;
                    imageData.clip.x2 = x + clipOriginal.size;

                    imageData.clip.y1 = y;
                    imageData.clip.y2 = y + clipOriginal.size;

                    // console.log(imageData.clip)
                    clippingImage()
                })
            })

            scope.newPixels = function () {
                $timeout(drawGrid)
            }

            $(canvasImg).on("mouseup", function () {

                $(canvasImg).off("mousemove")

                // $timeout(drawGrid, 10)



            })

            img.onload = function () {

                lock();

                setTimeout(function () {
                    drawOriginal();
                    // $timeout(drawOriginal, 5);
                    $timeout(drawGrid, 10);
                }, 0);
                // img.style.display = 'none';


                // drawPixelArt();
            };



            function lock() {
                $("body").addClass("loading");
            }

            function unlock() {
                $("body").removeClass("loading");
            }

            function rgbQuant() {

                var opts = {
                    colors: 16,             // desired palette size
                    method: 2,               // histogram method, 2: min-population threshold within subregions; 1: global top-population
                    boxSize: [64, 64],        // subregion dims (if method = 2)
                    boxPxls: 2,              // min-population threshold (if method = 2)
                    initColors: 4096,        // # of top-occurring colors  to start with (if method = 1)
                    minHueCols: 0,           // # of colors per hue group to evaluate regardless of counts, to retain low-count hues
                    dithKern: null,          // dithering kernel name, see available kernels in docs below
                    dithDelta: 0,            // dithering threshhold (0-1) e.g: 0.05 will not dither colors with <= 5% difference
                    dithSerp: false,         // enable serpentine pattern dithering
                    palette: [],             // a predefined palette to start with in r,g,b tuple format: [[r,g,b],[r,g,b]...]
                    reIndex: false,          // affects predefined palettes only. if true, allows compacting of sparsed palette once target palette size is reached. also enables palette sorting.
                    useCache: true,          // enables caching for perf usually, but can reduce perf in some cases, like pre-def palettes
                    cacheFreq: 10,           // min color occurance count needed to qualify for caching
                    colorDist: "euclidean",  // method used to determine color distance, can also be "manhattan"
                };

                var q = new RgbQuant(opts);
                q.sample(canvas);
                var pal = q.palette(true);
                var out = q.reduce(canvas);

                // console.log(out)
                scope.palette = [];

                var paletteMap = {}

                for (var i = 0; i < pal.length; i++) {

                    var np = getAnimalCrColor(pal[i]);
                    scope.palette.push(np)
                    paletteMap[pal[i].join(",")] = i;
                }


                var DAT = drawPixels(out, canvas.width);
                // var DAT = new ImageData(out, canvas.width, canvas.height); 

                ctx.putImageData(DAT, 0, 0);

                 
                    findColors(paletteMap);
                    // console.log(pal)
                    // console.log(out)

                    unlock();
              

            }


            function findColors(paletteMap) {
                debugger
                var mapImage = [];
                var step = Math.floor(imageData.gridSize / 2);
                for (var y = step; y < canvas.height; y += step) {
                    var row = []
                    for (var x = step; x < canvas.width; x += step) {
                        var color = pick(x, y, "array", ctx);
                        var num = paletteMap[color.join(",")];
                        row.push(num);
                    }
                    mapImage.push(row)
                }
                scope.bitMap = mapImage;

                console.log(mapImage)
            }


            function drawPixels(idxi8, width0, width1) {
                var idxi32 = new Uint32Array(idxi8.buffer);

                width1 = width1 || width0;

                var can = document.createElement("canvas"),
                    can2 = document.createElement("canvas"),
                    ctx = can.getContext("2d"),
                    ctx2 = can2.getContext("2d");

                can.width = width0;
                can.height = Math.ceil(idxi32.length / width0);
                can2.width = width1;
                can2.height = Math.ceil(can.height * width1 / width0);

                ctx.imageSmoothingEnabled = ctx.mozImageSmoothingEnabled = ctx.webkitImageSmoothingEnabled = ctx.msImageSmoothingEnabled = false;
                ctx2.imageSmoothingEnabled = ctx2.mozImageSmoothingEnabled = ctx2.webkitImageSmoothingEnabled = ctx2.msImageSmoothingEnabled = false;

                var imgd = ctx.createImageData(can.width, can.height);

                // if (typeOf imgd.data  == "CanvasPixelArray") {
                var data = imgd.data;
                for (var i = 0, len = data.length; i < len; ++i)
                    data[i] = idxi8[i];
                // }
                // else {
                //     var buf32 = new Uint32Array(imgd.data.buffer);
                //     buf32.set(idxi32);
                // }

                ctx.putImageData(imgd, 0, 0);

                ctx2.drawImage(can, 0, 0, can2.width, can2.height);

                return imgd;
            }


            // drawing = setInterval(refresh, 500)


            function getAnimalCrColor(rgb) {
                var hsl = rgbToHsl(rgb[0], rgb[1], rgb[2])


                var ha = Math.round((hsl[0]) * 29);
                var sa = Math.round(hsl[1] * 14);
                var la = Math.round(hsl[2] * 14);

                var h = ha / 29;
                var s = sa / 14;
                var l = la / 14;

                var newRGB = hslToRgb(h, s, l);
                return {
                    position: [ha, sa, la],
                    rgb: newRGB
                }

            }


            function rgbToHsl(r, g, b) {
                r /= 255, g /= 255, b /= 255;

                var max = Math.max(r, g, b), min = Math.min(r, g, b);
                var h, s, l = (max + min) / 2;

                if (max == min) {
                    h = s = 0; // achromatic
                } else {
                    var d = max - min;
                    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

                    switch (max) {
                        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                        case g: h = (b - r) / d + 2; break;
                        case b: h = (r - g) / d + 4; break;
                    }

                    h /= 6;
                }


                // h 30 // 360 all
                // s 15 // 100
                // l = 15 // 100
                return [h, s, l];
            }

            function hslToRgb(h, s, l) {
                var r, g, b;

                if (s == 0) {
                    r = g = b = l; // achromatic
                } else {
                    function hue2rgb(p, q, t) {
                        if (t < 0) t += 1;
                        if (t > 1) t -= 1;
                        if (t < 1 / 6) return p + (q - p) * 6 * t;
                        if (t < 1 / 2) return q;
                        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                        return p;
                    }

                    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                    var p = 2 * l - q;

                    r = hue2rgb(p, q, h + 1 / 3);
                    g = hue2rgb(p, q, h);
                    b = hue2rgb(p, q, h - 1 / 3);
                }

                return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
            }



            console.log(imageElement)
            var onNewImage = function (newValue) {
                img.src = newValue;

            };

            var handlerWatch = scope.$watch(function () {
                return imageElement.attr('src');
            }, onNewImage);

        }
    }

}]);