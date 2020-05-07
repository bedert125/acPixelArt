// data = ctx.getImageData(0, 0, image.width, image.height).data;
// 
// mediancut(data, colorCount);
// returns [[255,55,255], [233,34,233], [144,34,233], [89,34,233]];
function mediancut(data, n) {
  var boxes = [getBoundingBox(data)];

  if (n !== 1) {
    boxes = cut(boxes[0]);
    while (boxes.length < n) {
      var boxId = findBiggestIndex(boxes);
      var splittedBoxes = cut(boxes[boxId]);
      boxes.splice(boxId, 1, splittedBoxes[0], splittedBoxes[1]);
    }
  }


  return getColors(boxes);
}

function findBiggestIndex(boxes) {
  var biggest = 0;
  var id = 0;

  for (var i = 0; i < boxes.length; i++) {
    if (boxes[i].area > biggest) {
      biggest = boxes[i].area;
      id = i;
    }
  };

  return id;
}

function getColors(colorSets) {
  var colors = new Array();

  for (var i = 0; i < colorSets.length; i++) {
    var center = getCenterColor(colorSets[i]);
    var data = {
      rgb: center,
      group: colorSets[i].existing
    }
    colors.push(data)
  };

  delete colorSets;
  return colors;
}

function getCenterColor(box) {
  var amount = box.data.length / 4;
  // find the color in the box thats closest to the center
  return findMostSimilarColor(box.data, [
    Math.round(box.r.count / amount),
    Math.round(box.g.count / amount),
    Math.round(box.b.count / amount)
  ]);
  // or calculate the median color
  // return [ Math.round(box.r.count/amount), Math.round(box.g.count/amount), Math.round(box.b.count/amount) ];
}

function cut(box) {
  var a = new Array(), b = new Array();
  var index = "rgb".indexOf(box.max);
  var median = getMedian(box.data, index);

  for (var i = 0, l = box.data.length; i < l; i += 4) {
    var array = box.data[i + index] < median ? a : b;
    array.push(box.data[i], box.data[i + 1], box.data[i + 2], box.data[i + 3]);
  }

  return [getBoundingBox(a), getBoundingBox(b)];
}

function getMedian(data, offset) {
  var histogram = [];
  var total = 0;

  // set histogram initially to 0
  for (var i = 0; i < 256; i++)
    histogram[i] = 0;

  for (var i = 0, l = data.length; i < l; i += 4, total++) {
    var value = data[i + offset];
    histogram[value] += 1;
  }

  for (var i = 0, count = 0; i < histogram.length; i++) {
    count += histogram[i];
    if (count > total / 2)
      return i;
  }
}

function getBoundingBox(data) {
  var colors = {
    data: data,
    r: { min: 255, max: 0, count: 0 },
    g: { min: 255, max: 0, count: 0 },
    b: { min: 255, max: 0, count: 0 },
    existing: {}
  };

  for (var i = 0, l = data.length; i < l; i += 4) {
    // check r
    if (data[i] < colors.r.min) colors.r.min = data[i];
    if (data[i] > colors.r.max) colors.r.max = data[i];
    colors.r.count += data[i];

    // check g
    if (data[i + 1] < colors.g.min) colors.g.min = data[i + 1];
    if (data[i + 1] > colors.g.max) colors.g.max = data[i + 1];
    colors.g.count += data[i + 1];

    // check b
    if (data[i + 2] < colors.b.min) colors.b.min = data[i + 2];
    if (data[i + 2] > colors.b.max) colors.b.max = data[i + 2];
    colors.b.count += data[i + 2];

    var stringColor = ImageUtil.pixelToHexString({
      red: data[i],
      green: data[i + 1],
      blue: data[i + 2],
    });

    colors.existing[stringColor] = true;


  }

  // the count can be zero
  colors.r.distance = colors.r.count === 0 ? 0 : colors.r.max - colors.r.min;
  colors.g.distance = colors.g.count === 0 ? 0 : colors.g.max - colors.g.min;
  colors.b.distance = colors.b.count === 0 ? 0 : colors.b.max - colors.b.min;

  colors.area = Math.max(colors.r.distance, 1) * Math.max(colors.g.distance, 1) * Math.max(colors.b.distance, 1);

  // find longest expansion
  var maxDistance = Math.max(colors.r.distance, colors.g.distance, colors.b.distance);

  var colorSet = ["r", "g", "b"];
  for (swatch in colorSet) {
    if (colors[colorSet[swatch]].distance === maxDistance) {
      colors.max = colorSet[swatch];
      break;
    }
  }

  return colors;
}


function findMostSimilarColor(data, rgb) {
  var rgbData = new Array();
  var minDistance = 255 * 3;
  var index = 0;

  for (var i = 0, l = data.length; i < l; i += 4) {
    var distance = Math.abs(data[i] - rgb[0]) + Math.abs(data[i + 1] - rgb[1]) + Math.abs(data[i + 2] - rgb[2]);
    if (distance < minDistance) {
      minDistance = distance;
      index = i;
    }
  }

  return [data[index], data[index + 1], data[index + 2]];
}