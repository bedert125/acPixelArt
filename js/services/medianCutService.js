

angular.module("PixArtApp").factory("medianCut", ["utils",
    function (utils) {
        'use strict';


        function getColors(data, n) {

            return mediancut(data, n)

        }






        function runner(img, n, imageData) {


            var pal = getColors(img, n)


            var map = {};
            var palette = []
            for (var i = 0; i < pal.length; i++) {

                var color = utils.getAnimalCrColor(pal[i].rgb);
                // np.key = pal[i].hex;
                // np.used = pal[i].used;
                pal[i].colorNumber = i;
                color.colorNumber = i;

                var stringColor = color.hex;

                if (map[stringColor] != undefined) {
                    console.log("duplicated", stringColor, map[stringColor], i)
                    var duplicated = map[stringColor];
                    // pal[duplicated].group = _.concat(pal[duplicated].group, pal[i].group);
                    // pal[i].group = [];
                    // pal[i].colorNumber = duplicated;
                    color.used = 0;
                    // join groups;

                }
                map[stringColor] = i;

                // np.hex = stringColor;

                palette.push(color)

            }


            console.log(map)
            console.log(palette)

            var result = findColors(map, palette, pal, imageData);
            result.palette = palette;

            return result;
        }


        function findColors(paletteMap, palette, boxes, imageData) {

            // var mapImage = [];
            // var size = imageData.resultSize;
            // var map = {};

            var canAux = document.createElement("canvas"),
                ctxAux = canAux.getContext("2d");

            canAux.width = imageData.canvasResultSize;
            canAux.height = imageData.canvasResultSize;

      

            var bitmap = utils.pixelsIterator(imageData, function (hex, coorData) {
                var colorGroup;
                // var colornumber;
                for (var p = 0; p < palette.length; p++) {
                    if (boxes[p].group[hex]) {
                        colorGroup = palette[p];
                        // colornumber = p;
                        break;
                    }
                }


                ctxAux.fillStyle = colorGroup.hex;
                // console.log(colorGroup.hex)

                ctxAux.fillRect(coorData.xg, coorData.yg,
                    imageData.gridSize, imageData.gridSize);

                return colorGroup.colorNumber;

            })

            // for (var y = 0; y < size; y++) {
            //     var row = [];
            //     var yg = y * imageData.gridSize;
            //     for (var x = 0; x < size; x++) {

            //         var xg = x * imageData.gridSize;

            //         var pixelPos = (y * size) + x;
            //         var color = imageData.pixels[pixelPos];

            //         var stringColor = ImageUtil.pixelToHexString(color);
            //         var colorGroup;
            //         var colornumber;
            //         // console.log(color)

            //         for (var p = 0; p < palette.length; p++) {
            //             if (boxes[p].group[stringColor]) {
            //                 colorGroup = palette[p];
            //                 colornumber = p;
            //                 break;
            //             }
            //         }



            //         // var colornumber = colorGroup.colorNumber

            //         ctxAux.fillStyle = colorGroup.hex;
            //         // console.log(colorGroup.hex)

            //         ctxAux.fillRect(xg, yg, imageData.gridSize, imageData.gridSize);
            //         // var num = paletteMap[stringColor];
            //         // if (!counter[stringColor]) {
            //         //     counter[stringColor] = 0;
            //         // }
            //         // counter[stringColor]++;
            //         row.push(colornumber);
            //     }
            //     mapImage.push(row)
            // }

            // // bitMap = mapImage;
            // // scope.colorCounter = counter;

            // console.log(mapImage)

            return {
                bitMap: bitmap,
                image: canAux
            }
        }
        var interfaz = {
            run: runner
        }
        return interfaz;
    }
])

