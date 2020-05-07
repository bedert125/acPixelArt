

angular.module("PixArtApp").factory("kMeans", ["utils",
    function (utils) {
        'use strict';



        function getMedian(values) {
            var ordered = _.sortBy(values, function (val) {
                // var hsl = ImageUtil.rgbToHsl(val.red, val.green, val.blue);
                var colored = utils.rgbToHsv(val.red, val.green, val.blue)
                return colored[0];
            }).reverse();

            var half = Math.floor(ordered.length / 2)

            var median = ordered[half] || { red: NaN, green: NaN, blue: NaN };
            return median;
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

        function getModa(values) {
            var count = {}
            for (var i = 0; i < values.length; i++) {
                var stringVal = ImageUtil.pixelToHexString(values[i]);
                if (!count[stringVal]) {
                    count[stringVal] = 0;
                }
                count[stringVal]++;
            }
            console.log(count)

            var max = -1;
            var keyMax;
            for (var key in count) {
                if (max < count[key]) {
                    max = count[key]
                    keyMax = key;
                }
            }


            if (keyMax) {
                keyMax =  HEX2RGB(keyMax);
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




        function findColorsKmeans(paletteMap, palette,imageData) {


            var canAux = document.createElement("canvas"),
                ctxAux = canAux.getContext("2d");

            canAux.width = imageData.canvasResultSize;
            canAux.height = imageData.canvasResultSize;



            // var mapImage = [];
            // var size = imageData.resultSize;
            // var map = {};

            // var palette = [];
            // var bitMap = [];


            var bitmap = utils.pixelsIterator(imageData, function (hex, coorData, rgb) {
                var colorGroup;

                for (var p = 0; p < paletteMap.length; p++) {
                    var indexColor = _.findIndex(paletteMap[p].group, rgb);
                    if (indexColor !== -1) {
                        colorGroup = paletteMap[p];
                        break
                    }
                }
                var colornumber = colorGroup.colorNumber 
                
                ctxAux.fillStyle = palette[colornumber].hex;
                // console.log(colorGroup.hex)

                ctxAux.fillRect(coorData.xg, coorData.yg,
                    imageData.gridSize, imageData.gridSize);


                return colornumber;

            })

            // for (var y = 0; y < size; y++) {
            //     var row = [];
            //     var yg = y * imageData.gridSize;
            //     for (var x = 0; x < size; x++) {

            //         var xg = x * imageData.gridSize;

            //         var pixelPos = (y * size) + x;
            //         var color = imageData.pixels[pixelPos];

            //         // var stringColor = ImageUtil.pixelToHexString(color),
            //         var colorGroup;

            //         for (var p = 0; p < paletteMap.length; p++) {
            //             var indexColor = _.findIndex(paletteMap[p].group, color);
            //             if (indexColor !== -1) {
            //                 colorGroup = paletteMap[p];
            //                 break
            //             }
            //         }
            //         var colornumber = colorGroup.colorNumber

            //         ctx.fillStyle = palette[colornumber].hex;

            //         ctx.fillRect(xg, yg, imageData.gridSize, imageData.gridSize);
            //         // var num = paletteMap[stringColor];
            //         // if (!counter[stringColor]) {
            //         //     counter[stringColor] = 0;
            //         // }
            //         // counter[stringColor]++;
            //         row.push(colornumber);
            //     }
            //     mapImage.push(row)
            // }
            // bitMap = mapImage;

            return {
                bitMap: bitmap,
                image: canAux
            }

        }

        function getColorCorrection(color, type) {
            var option = parseInt(type)
            console.log("----- color correction", type)
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

        function paletteTable(pixelGroups, type) {

            pixelGroups = _.sortBy(pixelGroups, function (pg) {
                var correctColor = getColorCorrection(pg, type);
                // var hsl = ImageUtil.rgbToHsl(correctColor.red, correctColor.green, correctColor.blue);
                var colored = utils.rgbToHsv(correctColor.red, correctColor.green, correctColor.blue)
                return colored[0];
                // return hsl[0];
            }).reverse();

            var palette = [];
            var map = {};

            _.each(pixelGroups, function (group) {

                var correctColor = getColorCorrection(group, type);
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

        function runKMeans(imageData, n) {

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
            var kMeansInputValue = parseInt(n);

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

        function kmeans(canvas, n, imageData) {
            var clusterData = runKMeans(imageData, n)
            var pal = paletteTable(clusterData.clusters, imageData.colorCorrection)

            var map = {};
            var palette = [];
            for (var i = 0; i < pal.length; i++) {

                var color = utils.getAnimalCrColor(pal[i].rgb);
                color.key = pal[i].hex;
                color.used = pal[i].used;
                pal[i].colorNumber = i;

                var stringColor = color.hex;

                if (map[stringColor] != undefined) {
                    console.log("duplicated", stringColor, map[stringColor], i)
                    var duplicated = map[stringColor];
                    pal[duplicated].group = _.concat(pal[duplicated].group, pal[i].group);
                    pal[i].group = [];
                    pal[i].colorNumber = duplicated;
                    color.used = 0;
                    // join groups;

                }
                map[stringColor] = i;

                palette.push(color)

            }

            var pixels = findColorsKmeans(pal, palette,imageData);

            return {
                bitMap: pixels.bitMap,
                palette: palette,
                image: pixels.image
            }
        }




        function runner(img, n, imageData) {



            return kmeans(img, n, imageData);

        }

        var interfaz = {
            run: runner
        }
        return interfaz;
    }
])

