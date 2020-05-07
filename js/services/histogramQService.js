

angular.module("PixArtApp").factory("histogramQ", ["utils",
    function (utils) {
        'use strict';


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

            //ctx.drawImage(canAux, 0, 0, canAux.width, canAux.height);

            return [canAux, ctxAux];
        }

        function findColorsRgbQuant(paletteMap, imageData, ctxLocal) {

            // var mapImage = [];
            // var size = imageData.resultSize;


            return utils.pixelsIterator(imageData, function (hex, coorData) {

                var color = utils.colorPick(coorData.xg, coorData.yg, "array", ctxLocal)
                var stringColor = ImageUtil.pixelToHexString({
                    red: color[0],
                    green: color[1],
                    blue: color[2],
                })

                var num = paletteMap[stringColor];
                return num;

            })

            // for (var y = 0; y < size; y++) {
            //     var row = [];
            //     var yg = y * imageData.gridSize;
            //     for (var x = 0; x < size; x++) {
            //         var xg = x * imageData.gridSize;

            //         var color = pick(xg, yg, "array", ctx)
            //         var stringColor = ImageUtil.pixelToHexString({
            //             red: color[0],
            //             green: color[1],
            //             blue: color[2],
            //         })

            //         var num = paletteMap[stringColor];
            //         row.push(num);
            //     }
            //     mapImage.push(row)
            // }

            // return mapImage;
        }

        function rgbQuant(canvas, imageData, n) {

            var opts = {
                colors: n,             // desired palette size
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

            var palette = [];

            for (var i = 0; i < pal.length; i++) {




                var color = utils.getAnimalCrColor(pal[i]);

                var stringColor = ImageUtil.pixelToHexString({
                    red: pal[i][0],
                    green: pal[i][1],
                    blue: pal[i][2],
                })

                paletteMap[stringColor] = i;

                color.key = stringColor;

                pal[i].colorNumber = i;
                palette.push(color)

            }


            var image = drawPixels(out, imageData.canvasResultSize);


            var bitmap = findColorsRgbQuant(paletteMap, imageData, image[1])

            return {
                bitMap: bitmap,
                palette: palette,
                image: image[0]
            }

        }




        function runner(canvas, n, imageData) {

            return rgbQuant(canvas, imageData, n);
        }



        var interfaz = {
            run: runner
        }
        return interfaz;
    }
])

