var app = angular.module("PixArtApp", [
    'ngFileUpload',
    'ngMaterial'
]);

app.config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('pink')
        .accentPalette('orange')
        // .primaryPalette('blue')
        // .accentPalette('teal')
        .warnPalette('green')
        .backgroundPalette('grey');
});

app.controller("mainController", function IndexController($scope) {
    // var ctrl = this;
    // ctrl.sourceImage = "";

    // ctrl.onChange = function (files) {
    //     if (files[0] == undefined) return;
    //     $scope.fileExt = files[0].name.split(".").pop()
    // }

    $scope.download = function (ev) {
        $scope.$broadcast("download")
    }

    $scope.load = function () {
        $scope.$broadcast("load")
    }



})


app.directive("pixeling", ["$timeout", "$mdDialog", function ($timeout, $mdDialog) {
    return {
        controller: function ($scope) {

            $scope.controls = {
                showColors: true,
                guide: 16,
                colors: 15,
                isGuide: function (index) {

                    return $scope.controls.showGuides && ((index + 1) % $scope.controls.guide) === 0;
                },
                // onChangePixelSize: onChangePixelSize,
                pixelSize: "",
                maxPixelSize: 10,
                colorSelection: 0,
                showGuides: true,
                background: "#FFFFFF"
            }


            var download = function (ev) {
                if (!$scope.picFile) {
                    $mdDialog.show(
                        $mdDialog.alert()
                            // .parent(angular.element(document.querySelector('#popupContainer')))
                            .clickOutsideToClose(true)
                            .title('Missing image data :(')
                            // .textContent('Missing image data.')
                            .ok('ok')
                            .targetEvent(ev)
                    );

                }
                var contentData = {};
                contentData.palette = $scope.palette;
                contentData.bitMap = $scope.bitMap;
                contentData.colorCounter = $scope.colorCounter;
                var content = JSON.stringify(contentData);
                // any kind of extension (.txt,.cpp,.cs,.bat)

                var filename = $scope.picFile.name + ".json";

                var blob = new Blob([content], {
                    type: "text/plain;charset=utf-8"
                });

                saveAs(blob, filename);
            }

            function onReaderLoad(event) {
                console.log(event.target.result);
                var obj = JSON.parse(event.target.result);
                $timeout(function () {

                    $scope.palette = obj.palette;
                    $scope.bitMap = obj.bitMap;
                    $scope.colorCounter = obj.colorCounter;

                })
            }

            var load = function () {
                var reader = new FileReader();
                reader.onload = onReaderLoad;
                reader.readAsText($scope.controls.jsonFile);
            }

            $scope.$on("download", download)
            $scope.$on("load", load)



        },
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

            var imageData = {
                w: 0,
                h: 0,
                canvasResultSize: 0,
                resultSize: 32,
                gridSize: 10,
                pixelSize: 1
            }


            scope.pixelData = imageData;
            function drawGrid() {
                lock()
                setTimeout(drawGridInner, 10);
            }

            function drawGridInner() {


                canvas.width = imageData.canvasResultSize;
                canvas.height = imageData.canvasResultSize;

                // var processing = $interval(function () {
                //     console.log(imageData.process)
                //     scope.loadingProcess = imageData.process;
                // }, 500);

                // var loaderText = document.getElementById("loaderText")


                var x, y;
                // var step = imageData.gridSize;
                // var hg = imageData.resultSize * imageData.gridSize;
                // var wg = imageData.resultSize * imageData.gridSize;
                var max = imageData.resultSize * imageData.resultSize;

                var pixelSize = imageData.pixelSize;
                scope.controls.pixelSize = pixelSize
                // imageData.pixelSize = pixelSize; 


                var current = 0

                // ctx.fillStyle = "#FF0000";
                // ctx.strokeStyle = "#FF0000";

                var xPadding = imageData.clip.x1 + 1;
                var yPadding = imageData.clip.y1 + 1;

                imageData.pixels = [];
                var size = imageData.resultSize;

                for (y = 0; y < size; y++) {
                    var yg = y * imageData.gridSize;
                    var yp = (y * pixelSize) + yPadding;
                    for (x = 0; x < size; x++) {

                        var xg = x * imageData.gridSize;
                        var xp = (x * pixelSize) + xPadding;

                        var pixel = getPixelColor(xp, yp, pixelSize);

                        imageData.pixels.push({
                            red: pixel[0],
                            green: pixel[1],
                            blue: pixel[2]
                        })

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

                $timeout(getQuant, 10)
                // console.log(imageData)
                // canvas.width = imageData.gridSize * imageData.resultSize;
                // canvas.height = imageData.gridSize * imageData.resultSize;
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

                console.log("drawOriginal")
                if (!imageData.loaded) {
                    return
                }
                imageData.h = img.height;
                imageData.w = img.width;


                var originalStyle = {}

                // canvasImg.width = imageData.w;
                // canvasImg.height = imageData.h;

                imageData.canvasResultSize = imageData.gridSize * imageData.resultSize;
                // canvas.height = imageData.gridSize * imageData.resultSize;

                var max = imageData.w > imageData.h ? imageData.h : imageData.w;
                // imageData.maxSize = max;

                var maxSize = imageData.w < imageData.h ? imageData.h : imageData.w;

                var paddedSize = 20;//Math.round(maxSize / 8)

                imageData.padding = paddedSize;

                canvasImg.width = maxSize + (paddedSize * 2);
                canvasImg.height = canvasImg.width;


                var windowSize = imageData.windowSize || max;

                var pixelSize = Math.floor(windowSize / imageData.resultSize);
                imageData.pixelSize = pixelSize;

                // var pixelSize = 
                scope.controls.maxPixelSize = Math.round(maxSize / imageData.resultSize);


                var cipMax = (pixelSize * imageData.resultSize);

                if (max == imageData.w) {
                    canvasImg.style.width = imageData.canvasResultSize < imageData.w ? imageData.canvasResultSize : imageData.w;
                } else {
                    canvasImg.style.width = "";
                }

                if (max == imageData.h) {
                    canvasImg.style.height = imageData.canvasResultSize < imageData.h ? imageData.canvasResultSize : imageData.h;
                } else {
                    canvasImg.style.height = "";
                }



                imageData.clip = {
                    x1: -1 + paddedSize,
                    y1: -1 + paddedSize,
                    // x2: cipMax + 2,
                    // y2: cipMax + 2,
                    size: cipMax + 2
                }


                clippingImage()

            }

            function clippingImage() {

                var imgPadding = imageData.padding;
                ctxImg.clearRect(0, 0, canvasImg.width, canvasImg.height);
                ctxImg.beginPath();

                ctxImg.moveTo(0, 0);
                ctxImg.fillStyle = scope.controls.background;
                ctxImg.fillRect(0, 0, canvasImg.width, canvasImg.width);

                ctxImg.moveTo(0, 0);
                ctxImg.drawImage(img, imgPadding, imgPadding);
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
                    // imageData.clip.x2 = x + clipOriginal.size;

                    imageData.clip.y1 = y;
                    // imageData.clip.y2 = y + clipOriginal.size;

                    // console.log(imageData.clip)
                    clippingImage()
                })
            })

            scope.updatePixels = function () {
                $timeout(drawGrid)
            }

            $(canvasImg).on("mouseup", function () {

                $(canvasImg).off("mousemove")

                // $timeout(drawGrid, 10)



            })

            img.onload = function () {

                imageData.loaded = false;

                lock();

                setTimeout(function () {
                    imageData.loaded = true;
                    // drawOriginal();
                    $timeout(drawOriginal, 5);
                    $timeout(drawGrid, 15);
                }, 0);
                // img.style.display = 'none';


                // drawPixelArt();
            };



            scope.controls.onChangePixelSize = function () {

                if (imageData.pixelSize != scope.controls.pixelSize) {
                    imageData.windowSize = scope.controls.pixelSize * imageData.resultSize;
                    drawOriginal();
                }
            }

            scope.controls.onChangeBgColor = function () {

                clippingImage()
            }



            function lock() {
                $("body").addClass("loading");
            }

            function unlock() {
                $("body").removeClass("loading");
            }

            function runKMeans() {

                // var pixels = [];
                // for (var x = 0; x < canvas.width; x++) {
                //     for (var y = 0; y < canvas.height; y++) {
                //         var pixel = canvas.getContext('2d').getImageData(x, y, 1, 1).data;
                //         pixels.push({
                //             red: pixel[0],
                //             green: pixel[1],
                //             blue: pixel[2]
                //         });
                //     }
                // }
                var kMeansInputValue = parseInt(scope.controls.colors);

                var copy = _.map(imageData.pixels, _.clone);

                let kmeansRunner = new KMeansRunner();
                let result = kmeansRunner.run(kMeansInputValue, copy);

                // let kmeansPlotter = new KMeansPlotter(); 
                // kmeansPlotter.plot("kmeans-plot", result.clusters);
                // console.log(result)
                // PaletteTableWriter.drawPaletteTable("#kmeans-palette", result.clusters);

                // $("#kmeans-output").show();

                return result;
            }

            function getColorCorrection(color) {
                var option = parseInt(scope.controls.colorSelection)
                switch (option) {
                    default:
                    case 1:
                        return ImageUtil.computeAverageColor(color);
                    case 2:
                        return getMedian(color)
                    case 3:
                        return getModa(color)

                }
            }

            function paletteTable(pixelGroups) { 

                pixelGroups = _.sortBy(pixelGroups, function (pg) {
                    var correctColor = getColorCorrection(pg);
                    // var hsl = ImageUtil.rgbToHsl(correctColor.red, correctColor.green, correctColor.blue);
                    var colored = rgbToHsv(correctColor.red, correctColor.green, correctColor.blue)
                    return colored[0];
                    // return hsl[0];
                }).reverse();

                var palette = [];
                var map = {};

                _.each(pixelGroups, function (group) {

                    var correctColor = getColorCorrection(group);
                    var colorData = {
                        used: group.length,
                        rgb: [parseInt(correctColor.red), parseInt(correctColor.green), parseInt(correctColor.blue)],
                        hex: ImageUtil.pixelToHexString(correctColor),
                        group: group
                    }
                    palette.push(colorData) 
                });
 
                return palette;
            }


            function HEX2RGB(hex) {
                if (hex.charAt(0) === '#') {
                    hex = hex.substr(1);
                }
                if ((hex.length < 2) || (hex.length > 6)) {
                    return false;
                }
                var values = hex.split(''),
                    r,
                    g,
                    b;

                if (hex.length === 2) {
                    r = parseInt(values[0].toString() + values[1].toString(), 16);
                    g = r;
                    b = r;
                } else if (hex.length === 3) {
                    r = parseInt(values[0].toString() + values[0].toString(), 16);
                    g = parseInt(values[1].toString() + values[1].toString(), 16);
                    b = parseInt(values[2].toString() + values[2].toString(), 16);
                } else if (hex.length === 6) {
                    r = parseInt(values[0].toString() + values[1].toString(), 16);
                    g = parseInt(values[2].toString() + values[3].toString(), 16);
                    b = parseInt(values[4].toString() + values[5].toString(), 16);
                } else {
                    return false;
                }
                return [r, g, b];
            }


            function getMedian(values) {
                var ordered = _.sortBy(values, function (val) {
                    // var hsl = ImageUtil.rgbToHsl(val.red, val.green, val.blue);
                    var colored = rgbToHsv(val.red, val.green, val.blue)
                    return colored[0];
                }).reverse();

                var half = Math.floor(ordered.length / 2)

                var median = ordered[half] || { red: NaN, green: NaN, blue: NaN };
                return median;
            }

            function getModa(values) {
                var count = {}
                for (var i = 0; i < values.length; i++) {
                    var stringVal = ImageUtil.pixelToHexString(values[i]);
                    if (!count[stringVal]) {
                        count[stringVal] = 0;
                    }
                    count[stringVal]++;
                }

                var max = -1;
                var keyMax;
                for (var key in count) {
                    if (max < count[key]) {
                        max = count[key]
                        keyMax = key;
                    }
                }


                if (keyMax) {
                    keyMax = HEX2RGB(keyMax);
                } else {
                    keyMax = [NaN, NaN, NaN]
                }


                // console.log(median)
                return {
                    red: keyMax[0],
                    green: keyMax[1],
                    blue: keyMax[2]
                }

            }


            function rgbQuant() {
                var opts = {
                    colors: scope.controls.colors,             // desired palette size
                    method: 1,               // histogram method, 2: min-population threshold within subregions; 1: global top-population
                    boxSize: [320, 320],        // subregion dims (if method = 2)
                    boxPxls: 80,              // min-population threshold (if method = 2)
                    initColors: 32 * 32,        // # of top-occurring colors  to start with (if method = 1)
                    minHueCols: 0,           // # of colors per hue group to evaluate regardless of counts, to retain low-count hues
                    dithKern: null,          // dithering kernel name, see available kernels in docs below
                    dithDelta: 0,            // dithering threshhold (0-1) e.g: 0.05 will not dither colors with <= 5% difference
                    dithSerp: false,         // enable serpentine pattern dithering
                    palette: [],             // a predefined palette to start with in r,g,b tuple format: [[r,g,b],[r,g,b]...]
                    reIndex: false,          // affects predefined palettes only. if true, allows compacting of sparsed palette once target palette size is reached. also enables palette sorting.
                    useCache: false,          // enables caching for perf usually, but can reduce perf in some cases, like pre-def palettes
                    cacheFreq: 10,           // min color occurance count needed to qualify for caching
                    colorDist: "manhattan",  // method used to determine color distance, can also be "manhattan"
                };

                var q = new RgbQuant(opts);
                q.sample(canvas);
                var pal = q.palette(true);
                var out = q.reduce(canvas);




                var paletteMap = {}

                for (var i = 0; i < pal.length; i++) {




                    var np = getAnimalCrColor(pal[i]);

                    var stringColor = ImageUtil.pixelToHexString({
                        red: pal[i][0],
                        green: pal[i][1],
                        blue: pal[i][2],
                    })

                    paletteMap[stringColor] = i;

                    np.key = stringColor;

                    stringColor = ImageUtil.pixelToHexString({
                        red: np.rgb[0],
                        green: np.rgb[1],
                        blue: np.rgb[2],
                    });

                    np.hex = stringColor;
                    // np.used = pal[i].used;
                    pal[i].colorNumber = i;
                    // paletteMap[np.key] = i;
                    scope.palette.push(np)
                    // console.log(np)

                }


                drawPixels(out, imageData.canvasResultSize);


                findColorsRgbQuant(paletteMap)

            }

            function kmeans() {
                var clusterData = runKMeans()
                var pal = paletteTable(clusterData.clusters)

                var map = {};
                for (var i = 0; i < pal.length; i++) {

                    var np = getAnimalCrColor(pal[i].rgb);
                    np.key = pal[i].hex;
                    np.used = pal[i].used;
                    pal[i].colorNumber = i;

                    var stringColor = ImageUtil.pixelToHexString({
                        red: np.rgb[0],
                        green: np.rgb[1],
                        blue: np.rgb[2],
                    });

                    if(map[stringColor]!= undefined){
                        console.log("duplicated", stringColor,map[stringColor], i)
                        var duplicated =map[stringColor];
                        pal[duplicated].group = _.concat(pal[duplicated].group, pal[i].group);
                        pal[i].group =[];   
                        pal[i].colorNumber = duplicated; 
                        np.used = 0;
                        // join groups;
                         
                    }
                    map[stringColor] = i;
                    
                    np.hex = stringColor;

                    scope.palette.push(np)

                }

                findColorsKmeans(pal);
            }
            function getQuant() {

                scope.palette = [];

                if (parseInt(scope.controls.colorSelection) == 0) {
                    rgbQuant()
                } else {
                    kmeans()

                }

                unlock();


            }


            function findColorsRgbQuant(paletteMap) {

                var mapImage = [];
                var size = imageData.resultSize;

                for (var y = 0; y < size; y++) {
                    var row = [];
                    var yg = y * imageData.gridSize;
                    for (var x = 0; x < size; x++) {
                        var xg = x * imageData.gridSize;

                        var color = pick(xg, yg, "array", ctx)
                        var stringColor = ImageUtil.pixelToHexString({
                            red: color[0],
                            green: color[1],
                            blue: color[2],
                        })

                        var num = paletteMap[stringColor];
                        row.push(num);
                    }
                    mapImage.push(row)
                }
                scope.bitMap = mapImage;
            }




            function findColorsKmeans(paletteMap) {

                var mapImage = [];
                var size = imageData.resultSize;
                var map = {};


                for (var y = 0; y < size; y++) {
                    var row = [];
                    var yg = y * imageData.gridSize;
                    for (var x = 0; x < size; x++) {

                        var xg = x * imageData.gridSize;

                        var pixelPos = (y * size) + x;
                        var color = imageData.pixels[pixelPos];

                        // var stringColor = ImageUtil.pixelToHexString(color),
                        var colorGroup;

                        for (var p = 0; p < paletteMap.length; p++) {
                            var indexColor = _.findIndex(paletteMap[p].group, color);
                            if (indexColor !== -1) {
                                colorGroup = paletteMap[p]; 
                                break
                            }
                        }
                         var colornumber = colorGroup.colorNumber

                        ctx.fillStyle = scope.palette[colornumber].hex;

                        ctx.fillRect(xg, yg, imageData.gridSize, imageData.gridSize);
                        // var num = paletteMap[stringColor];
                        // if (!counter[stringColor]) {
                        //     counter[stringColor] = 0;
                        // }
                        // counter[stringColor]++;
                        row.push(colornumber);
                    }
                    mapImage.push(row)
                }
                scope.bitMap = mapImage;
                // scope.colorCounter = counter;

                // console.log(mapImage)
            }


            function drawPixels(idxi8, width) {
                var idxi32 = new Uint32Array(idxi8.buffer);

                var canAux = document.createElement("canvas"),
                    // ctx = can.getContext("2d"),
                    ctxAux = canAux.getContext("2d");

                canAux.width = width;
                canAux.height = Math.ceil(idxi32.length / width);
                // can2.width = width1;
                // can2.height = Math.ceil(can.height * width1 / width0);

                ctxAux.imageSmoothingEnabled = ctxAux.mozImageSmoothingEnabled = ctxAux.webkitImageSmoothingEnabled = ctxAux.msImageSmoothingEnabled = false;

                var imgd = ctxAux.createImageData(canAux.width, canAux.height);

                // if (typeOf imgd.data  == "CanvasPixelArray") {
                var data = imgd.data;
                for (var i = 0, len = data.length; i < len; ++i)
                    data[i] = idxi8[i];
                // }
                // else {
                //     var buf32 = new Uint32Array(imgd.data.buffer);
                //     buf32.set(idxi32);
                // }

                ctxAux.putImageData(imgd, 0, 0);

                ctx.drawImage(canAux, 0, 0, canAux.width, canAux.height);

                return imgd;
            }


            // drawing = setInterval(refresh, 500)

            function rgb2hsv(r, g, b) {
                let rabs, gabs, babs, rr, gg, bb, h, s, v, diff, diffc, percentRoundFn;
                rabs = r / 255;
                gabs = g / 255;
                babs = b / 255;
                v = Math.max(rabs, gabs, babs),
                    diff = v - Math.min(rabs, gabs, babs);
                diffc = c => (v - c) / 6 / diff + 1 / 2;
                percentRoundFn = num => Math.round(num * 100) / 100;
                if (diff == 0) {
                    h = s = 0;
                } else {
                    s = diff / v;
                    rr = diffc(rabs);
                    gg = diffc(gabs);
                    bb = diffc(babs);

                    if (rabs === v) {
                        h = bb - gg;
                    } else if (gabs === v) {
                        h = (1 / 3) + rr - bb;
                    } else if (babs === v) {
                        h = (2 / 3) + gg - rr;
                    }
                    if (h < 0) {
                        h += 1;
                    } else if (h > 1) {
                        h -= 1;
                    }
                }
                return {
                    h: Math.round(h * 360),
                    s: percentRoundFn(s * 100),
                    v: percentRoundFn(v * 100)
                };
            }


            function getAnimalCrColor(rgb) {
                //var hsl = rgbToHsl(rgb[0], rgb[1], rgb[2])
                // var hsl = ImageUtil.rgbToHsl(rgb[0], rgb[1], rgb[2]);

                var color = rgbToHsv(rgb[0], rgb[1], rgb[2]);


                var AC_1 = Math.round((color[0] ) * 29);
                var AC_2 = Math.round((color[1] ) * 14);
                var AC_3 = Math.round((color[2]) * 14);


                // ha = ha == 30 ? 29 : ha;
                // sa = sa == 15 ? 14 : sa;
                // la = la == 15 ? 14 : la;

                var r = (AC_1 / 29) ;
                var g = (AC_2 / 14) ;
                var b = (AC_3 / 14) ;

                var newRGB = hsvToRgb(r, g, b);
                return {
                    position: [AC_1, AC_2, AC_3],
                    rgb: newRGB//[newRGB.r, newRGB.g, newRGB.b]
                }

            }


            // function rgbToHsl(r, g, b) {
            //     r /= 255, g /= 255, b /= 255;

            //     var max = Math.max(r, g, b), min = Math.min(r, g, b);
            //     var h, s, l = (max + min) / 2;

            //     if (max == min) {
            //         h = s = 0; // achromatic
            //     } else {
            //         var d = max - min;
            //         s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            //         switch (max) {
            //             case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            //             case g: h = (b - r) / d + 2; break;
            //             case b: h = (r - g) / d + 4; break;
            //         }

            //         h /= 6;
            //     }


            //     // h 30 // 360 all
            //     // s 15 // 100
            //     // l = 15 // 100
            //     return [h, s, l];
            // }

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



            // console.log(imageElement)
            var onNewImage = function (newValue) {
                img.src = newValue;

            };

            var handlerWatch = scope.$watch(function () {
                return imageElement.attr('src');
            }, onNewImage);







        }
    }

}]);