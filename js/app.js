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


app.directive("pixeling", ["$timeout", "$mdDialog",
    "medianCut", "histogramQ", "kMeans",
    function ($timeout, $mdDialog, medianCut, histogramQ, kMeans) {
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
                    colorSelection: 1,
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


                function getQuant() {

                    scope.palette = [];
                    var selection = parseInt(scope.controls.colorSelection);

                    var resultData;

                    if (selection == 0) {
                        resultData = histogramQ.run(
                            canvas,
                            scope.controls.colors,
                            imageData)
                    } else if (selection == 4) {

                        resultData = medianCut.run(
                            ctx.getImageData(0, 0, canvas.width, canvas.height).data,
                            scope.controls.colors,
                            imageData)
                        //rgbQuant()
                    } else {
                        imageData.colorCorrection = selection;
                        resultData = kMeans.run(
                            undefined,
                            scope.controls.colors,
                            imageData
                        )

                    }

                    ctx.drawImage(resultData.image, 0, 0, canvas.width, canvas.height);

                    scope.palette = resultData.palette;
                    scope.bitMap = resultData.bitMap;

                    unlock();


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