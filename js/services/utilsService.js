

angular.module("PixArtApp")
    .factory("utils", function () {
        'use strict';

        function hsvBinIndex(H, S, V) {
            var n_h = 30;
            var n_s = 15;
            var n_v = 15;

            var a = (Math.floor(n_h * H) * n_s * n_v);
            var b = (Math.floor(n_s * S) * n_v);
            var c = Math.floor(n_v * V);

            return a + b + c;

        }

        function rgbToAci(R, G, B) {
            var n_h = 30;
            var n_s = 15;
            var n_v = 15;

            var color = rgbToHsv(R, G, B);


            var a = Math.floor(n_h * color[0]);
            var b = Math.floor(n_s * color[1]);
            var c = Math.floor(n_v * color[2]);

            a = a === n_h ? n_h - 1 : a;
            b = b === n_s ? n_s - 1 : b;
            c = c === n_v ? n_v - 1 : c;

            return [a, b, c];

        }

        function aciToRgb(Ha, Sa, Va) {
            var n_h = 29;
            var n_s = 14;
            var n_v = 14;

            var h = Ha / n_h;
            var s = Sa / n_s
            var v = Va / n_v;

            var rgb = hsvToRgb(h, s, v);

            return rgb;

        }


        /**
         * Converts an RGB color value to HSL. Conversion formula
         * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
         * Assumes r, g, and b are contained in the set [0, 255] and
         * returns h, s, and l in the set [0, 1].
         *
         * @param   Number  r       The red color value
         * @param   Number  g       The green color value
         * @param   Number  b       The blue color value
         * @return  Array           The HSL representation
         */
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

            return [h, s, l];
        }

        /**
        * Converts an HSL color value to RGB. Conversion formula
        * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
        * Assumes h, s, and l are contained in the set [0, 1] and
        * returns r, g, and b in the set [0, 255].
        *
        * @param   Number  h       The hue
        * @param   Number  s       The saturation
        * @param   Number  l       The lightness
        * @return  Array           The RGB representation
        */
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

            return [r * 255, g * 255, b * 255];
        }

        /**
        * Converts an RGB color value to HSV. Conversion formula
        * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
        * Assumes r, g, and b are contained in the set [0, 255] and
        * returns h, s, and v in the set [0, 1].
        *
        * @param   Number  r       The red color value
        * @param   Number  g       The green color value
        * @param   Number  b       The blue color value
        * @return  Array           The HSV representation
        */
        function rgbToHsv(r, g, b) {
            r = r / 255, g = g / 255, b = b / 255;
            var max = Math.max(r, g, b), min = Math.min(r, g, b);
            var h, s, v = max;

            var d = max - min;
            s = max == 0 ? 0 : d / max;
            var s2 = 1 - (min / max)
            // console.log(s, s2)

            if (max == min) {
                h = 0; // achromatic
            } else {
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }

            return [h, s, v];
        }

        /**
        * Converts an HSV color value to RGB. Conversion formula
        * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
        * Assumes h, s, and v are contained in the set [0, 1] and
        * returns r, g, and b in the set [0, 255].
        *
        * @param   Number  h       The hue
        * @param   Number  s       The saturation
        * @param   Number  v       The value
        * @return  Array           The RGB representation
        */
        function hsvToRgb(h, s, v) {
            var r, g, b;

            var i = Math.floor(h * 6);
            var f = h * 6 - i;
            var p = v * (1 - s);
            var q = v * (1 - f * s);
            var t = v * (1 - (1 - f) * s);

            switch (i % 6) {
                case 0: r = v, g = t, b = p; break;
                case 1: r = q, g = v, b = p; break;
                case 2: r = p, g = v, b = t; break;
                case 3: r = p, g = q, b = v; break;
                case 4: r = t, g = p, b = v; break;
                case 5: r = v, g = p, b = q; break;
            }

            return [r * 255, g * 255, b * 255];
        }

        function getAnimalCrColor(rgb) {
            //var hsl = rgbToHsl(rgb[0], rgb[1], rgb[2])
            // var hsl = ImageUtil.rgbToHsl(rgb[0], rgb[1], rgb[2]);

            var aciColor = rgbToAci(rgb[0], rgb[1], rgb[2]);

            var newRGB = aciToRgb(aciColor[0], aciColor[1], aciColor[2]);

            var hex = ImageUtil.pixelToHexString({
                red: newRGB[0],
                green: newRGB[1],
                blue: newRGB[2],
            });

            return {
                position: aciColor,
                hex: hex,
                rgb: newRGB//[newRGB.r, newRGB.g, newRGB.b]
            }

        }

        function pixelsIterator(imageData, callback) {
            var size = imageData.resultSize;
            var mapImage = []
            for (var y = 0; y < size; y++) {
                var row = [];
                var yg = y * imageData.gridSize;
                for (var x = 0; x < size; x++) {

                    var xg = x * imageData.gridSize;
                    var pixelPos = (y * size) + x;
                    var color = imageData.pixels[pixelPos];

                    var stringColor = ImageUtil.pixelToHexString(color);

                    var colornumber = callback(stringColor, {
                        x: x,
                        y: y,
                        xg: xg,
                        yg: yg
                    }, color);

                    row.push(colornumber);
                }
                mapImage.push(row)
            }
            // console.log(mapImage)
            return mapImage;
        }

        function pick(x, y, type, ctxLocal) { 
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

        var interfaz = {
            getAnimalCrColor: getAnimalCrColor,
            pixelsIterator: pixelsIterator,
            colorPick: pick,
            rgbToHsv:rgbToHsv
        }
        return interfaz;
    })

