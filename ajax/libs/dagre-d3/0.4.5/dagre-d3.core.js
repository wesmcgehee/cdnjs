!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.dagreD3=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @license
 * Copyright (c) 2012-2013 Chris Pettitt
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
module.exports =  {
  graphlib: require("./lib/graphlib"),
  dagre: require("./lib/dagre"),
  intersect: require("./lib/intersect"),
  render: require("./lib/render"),
  util: require("./lib/util"),
  version: require("./lib/version")
};

},{"./lib/dagre":8,"./lib/graphlib":9,"./lib/intersect":10,"./lib/render":25,"./lib/util":27,"./lib/version":28}],2:[function(require,module,exports){
var util = require("./util");

module.exports = {
  "default": normal,
  "normal": normal,
  "vee": vee,
  "undirected": undirected
};

function normal(parent, id, edge, type) {
  var marker = parent.append("marker")
    .attr("id", id)
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 9)
    .attr("refY", 5)
    .attr("markerUnits", "strokeWidth")
    .attr("markerWidth", 8)
    .attr("markerHeight", 6)
    .attr("orient", "auto");

  var path = marker.append("path")
    .attr("d", "M 0 0 L 10 5 L 0 10 z")
    .style("stroke-width", 1)
    .style("stroke-dasharray", "1,0");
  util.applyStyle(path, edge[type + "Style"]);
}

function vee(parent, id, edge, type) {
  var marker = parent.append("marker")
    .attr("id", id)
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 9)
    .attr("refY", 5)
    .attr("markerUnits", "strokeWidth")
    .attr("markerWidth", 8)
    .attr("markerHeight", 6)
    .attr("orient", "auto");

  var path = marker.append("path")
    .attr("d", "M 0 0 L 10 5 L 0 10 L 4 5 z")
    .style("stroke-width", 1)
    .style("stroke-dasharray", "1,0");
  util.applyStyle(path, edge[type + "Style"]);
}

function undirected(parent, id, edge, type) {
  var marker = parent.append("marker")
    .attr("id", id)
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 9)
    .attr("refY", 5)
    .attr("markerUnits", "strokeWidth")
    .attr("markerWidth", 8)
    .attr("markerHeight", 6)
    .attr("orient", "auto");

  var path = marker.append("path")
    .attr("d", "M 0 5 L 10 5")
    .style("stroke-width", 1)
    .style("stroke-dasharray", "1,0");
  util.applyStyle(path, edge[type + "Style"]);
}

},{"./util":27}],3:[function(require,module,exports){
var util = require("./util"),
    addLabel = require("./label/add-label");

module.exports = createClusters;

function createClusters(selection, g) {
  var clusters = g.nodes().filter(function(v) { return util.isSubgraph(g, v); }),
      svgClusters = selection.selectAll("g.cluster")
        .data(clusters, function(v) { return v; });

  svgClusters.selectAll("*").remove();
  svgClusters.enter()
    .append("g")
      .attr("class", "cluster")
      .style("opacity", 0)
      .append("rect");
  util.applyTransition(svgClusters.exit(), g)
    .style("opacity", 0)
    .remove();

  util.applyTransition(svgClusters, g)
    .style("opacity", 1);

  svgClusters.each(function(v) {
    var node = g.node(v),
        thisGroup = d3.select(this),
        labelGroup = thisGroup.append("g").attr("class", "label");
    addLabel(labelGroup, node, node.clusterLabelPos);
  });

  svgClusters.selectAll("rect").each(function(c) {
    var node = g.node(c);
    var domCluster = d3.select(this);
    util.applyStyle(domCluster, node.style);
  });
}

},{"./label/add-label":18,"./util":27}],4:[function(require,module,exports){
"use strict";

var _ = require("./lodash"),
    addLabel = require("./label/add-label"),
    util = require("./util"),
    d3 = require("./d3");

module.exports = createEdgeLabels;

function createEdgeLabels(selection, g) {
  var svgEdgeLabels = selection.selectAll("g.edgeLabel")
    .data(g.edges(), function(e) { return util.edgeToId(e); })
    .classed("update", true);

  svgEdgeLabels.selectAll("*").remove();
  svgEdgeLabels.enter()
    .append("g")
      .classed("edgeLabel", true)
      .style("opacity", 0);
  svgEdgeLabels.each(function(e) {
    var edge = g.edge(e),
        label = addLabel(d3.select(this), g.edge(e), 0, 0).classed("label", true),
        bbox = label.node().getBBox();

    if (edge.labelId) { label.attr("id", edge.labelId); }
    if (!_.has(edge, "width")) { edge.width = bbox.width; }
    if (!_.has(edge, "height")) { edge.height = bbox.height; }
  });

  util.applyTransition(svgEdgeLabels.exit(), g)
    .style("opacity", 0)
    .remove();

  return svgEdgeLabels;
}

},{"./d3":7,"./label/add-label":18,"./lodash":21,"./util":27}],5:[function(require,module,exports){
"use strict";

var _ = require("./lodash"),
    intersectNode = require("./intersect/intersect-node"),
    util = require("./util"),
    d3 = require("./d3");

module.exports = createEdgePaths;

function createEdgePaths(selection, g, arrows) {
  var svgPaths = selection.selectAll("g.edgePath")
    .data(g.edges(), function(e) { return util.edgeToId(e); })
    .classed("update", true);

  enter(svgPaths, g);
  exit(svgPaths, g);

  util.applyTransition(svgPaths, g)
    .style("opacity", 1);

  // Save DOM element in the path group, and set ID and class
  svgPaths.each(function(e) {
    var domEdge = d3.select(this);
    var edge = g.edge(e);
    edge.elem = this;

    if (edge.id) {
      domEdge.attr("id", edge.id);
    }

    util.applyClass(domEdge, edge["class"],
      (domEdge.classed("update") ? "update " : "") + "edgePath");
  });

  svgPaths.selectAll("path.path")
    .each(function(e) {
      var edge = g.edge(e);
      edge.arrowheadId = _.uniqueId("arrowhead");

      var domEdge = d3.select(this)
        .attr("marker-end", function() {
          return "url(#" + edge.arrowheadId + ")";
        })
        .style("fill", "none");

      util.applyTransition(domEdge, g)
        .attr("d", function(e) { return calcPoints(g, e); });

      util.applyStyle(domEdge, edge.style);
    });

  svgPaths.selectAll("defs *").remove();
  svgPaths.selectAll("defs")
    .each(function(e) {
      var edge = g.edge(e),
          arrowhead = arrows[edge.arrowhead];
      arrowhead(d3.select(this), edge.arrowheadId, edge, "arrowhead");
    });

  return svgPaths;
}

function calcPoints(g, e) {
  var edge = g.edge(e),
      tail = g.node(e.v),
      head = g.node(e.w),
      points = edge.points.slice(1, edge.points.length - 1);
  points.unshift(intersectNode(tail, points[0]));
  points.push(intersectNode(head, points[points.length - 1]));

  return createLine(edge, points);
}

function createLine(edge, points) {
  var line = d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; });

  if (_.has(edge, "lineInterpolate")) {
    line.interpolate(edge.lineInterpolate);
  }

  if (_.has(edge, "lineTension")) {
    line.tension(Number(edge.lineTension));
  }

  return line(points);
}

function getCoords(elem) {
  var bbox = elem.getBBox(),
      matrix = elem.getTransformToElement(elem.ownerSVGElement)
        .translate(bbox.width / 2, bbox.height / 2);
  return { x: matrix.e, y: matrix.f };
}

function enter(svgPaths, g) {
  var svgPathsEnter = svgPaths.enter()
    .append("g")
      .attr("class", "edgePath")
      .style("opacity", 0);
  svgPathsEnter.append("path")
    .attr("class", "path")
    .attr("d", function(e) {
      var edge = g.edge(e),
          sourceElem = g.node(e.v).elem,
          points = _.range(edge.points.length).map(function() { return getCoords(sourceElem); });
      return createLine(edge, points);
    });
  svgPathsEnter.append("defs");
}

function exit(svgPaths, g) {
  var svgPathExit = svgPaths.exit();
  util.applyTransition(svgPathExit, g)
    .style("opacity", 0)
    .remove();

  util.applyTransition(svgPathExit.select("path.path"), g)
    .attr("d", function(e) {
      var source = g.node(e.v);

      if (source) {
        var points = _.range(this.pathSegList.length).map(function() { return source; });
        return createLine({}, points);
      } else {
        return d3.select(this).attr("d");
      }
    });
}

},{"./d3":7,"./intersect/intersect-node":14,"./lodash":21,"./util":27}],6:[function(require,module,exports){
"use strict";

var _ = require("./lodash"),
    addLabel = require("./label/add-label"),
    util = require("./util"),
    d3 = require("./d3");

module.exports = createNodes;

function createNodes(selection, g, shapes) {
  var simpleNodes = g.nodes().filter(function(v) { return !util.isSubgraph(g, v); });
  var svgNodes = selection.selectAll("g.node")
    .data(simpleNodes, function(v) { return v; })
    .classed("update", true);

  svgNodes.selectAll("*").remove();
  svgNodes.enter()
    .append("g")
      .attr("class", "node")
      .style("opacity", 0);
  svgNodes.each(function(v) {
    var node = g.node(v),
        thisGroup = d3.select(this),
        labelGroup = thisGroup.append("g").attr("class", "label"),
        labelDom = addLabel(labelGroup, node),
        shape = shapes[node.shape],
        bbox = _.pick(labelDom.node().getBBox(), "width", "height");

    node.elem = this;

    if (node.id) { thisGroup.attr("id", node.id); }
    if (node.labelId) { labelGroup.attr("id", node.labelId); }
    util.applyClass(thisGroup, node["class"],
      (thisGroup.classed("update") ? "update " : "") + "node");

    if (_.has(node, "width")) { bbox.width = node.width; }
    if (_.has(node, "height")) { bbox.height = node.height; }

    bbox.width += node.paddingLeft + node.paddingRight;
    bbox.height += node.paddingTop + node.paddingBottom;
    labelGroup.attr("transform", "translate(" +
      ((node.paddingLeft - node.paddingRight) / 2) + "," +
      ((node.paddingTop - node.paddingBottom) / 2) + ")");

    var shapeSvg = shape(d3.select(this), bbox, node);
    util.applyStyle(shapeSvg, node.style);

    var shapeBBox = shapeSvg.node().getBBox();
    node.width = shapeBBox.width;
    node.height = shapeBBox.height;
  });

  util.applyTransition(svgNodes.exit(), g)
    .style("opacity", 0)
    .remove();

  return svgNodes;
}

},{"./d3":7,"./label/add-label":18,"./lodash":21,"./util":27}],7:[function(require,module,exports){
// Stub to get D3 either via NPM or from the global object
module.exports = window.d3;

},{}],8:[function(require,module,exports){
/* global window */

var dagre;

if (require) {
  try {
    dagre = require("dagre");
  } catch (e) {}
}

if (!dagre) {
  dagre = window.dagre;
}

module.exports = dagre;

},{"dagre":undefined}],9:[function(require,module,exports){
/* global window */

var graphlib;

if (require) {
  try {
    graphlib = require("graphlib");
  } catch (e) {}
}

if (!graphlib) {
  graphlib = window.graphlib;
}

module.exports = graphlib;

},{"graphlib":undefined}],10:[function(require,module,exports){
module.exports = {
  node: require("./intersect-node"),
  circle: require("./intersect-circle"),
  ellipse: require("./intersect-ellipse"),
  polygon: require("./intersect-polygon"),
  rect: require("./intersect-rect")
};

},{"./intersect-circle":11,"./intersect-ellipse":12,"./intersect-node":14,"./intersect-polygon":15,"./intersect-rect":16}],11:[function(require,module,exports){
var intersectEllipse = require("./intersect-ellipse");

module.exports = intersectCircle;

function intersectCircle(node, rx, point) {
  return intersectEllipse(node, rx, rx, point);
}

},{"./intersect-ellipse":12}],12:[function(require,module,exports){
module.exports = intersectEllipse;

function intersectEllipse(node, rx, ry, point) {
  // Formulae from: http://mathworld.wolfram.com/Ellipse-LineIntersection.html

  var cx = node.x;
  var cy = node.y;

  var px = cx - point.x;
  var py = cy - point.y;

  var det = Math.sqrt(rx * rx * py * py + ry * ry * px * px);

  var dx = Math.abs(rx * ry * px / det);
  if (point.x < cx) {
    dx = -dx;
  }
  var dy = Math.abs(rx * ry * py / det);
  if (point.y < cy) {
    dy = -dy;
  }

  return {x: cx + dx, y: cy + dy};
}


},{}],13:[function(require,module,exports){
module.exports = intersectLine;

/*
 * Returns the point at which two lines, p and q, intersect or returns
 * undefined if they do not intersect.
 */
function intersectLine(p1, p2, q1, q2) {
  // Algorithm from J. Avro, (ed.) Graphics Gems, No 2, Morgan Kaufmann, 1994,
  // p7 and p473.

  var a1, a2, b1, b2, c1, c2;
  var r1, r2 , r3, r4;
  var denom, offset, num;
  var x, y;

  // Compute a1, b1, c1, where line joining points 1 and 2 is F(x,y) = a1 x +
  // b1 y + c1 = 0.
  a1 = p2.y - p1.y;
  b1 = p1.x - p2.x;
  c1 = (p2.x * p1.y) - (p1.x * p2.y);

  // Compute r3 and r4.
  r3 = ((a1 * q1.x) + (b1 * q1.y) + c1);
  r4 = ((a1 * q2.x) + (b1 * q2.y) + c1);

  // Check signs of r3 and r4. If both point 3 and point 4 lie on
  // same side of line 1, the line segments do not intersect.
  if ((r3 !== 0) && (r4 !== 0) && sameSign(r3, r4)) {
    return /*DONT_INTERSECT*/;
  }

  // Compute a2, b2, c2 where line joining points 3 and 4 is G(x,y) = a2 x + b2 y + c2 = 0
  a2 = q2.y - q1.y;
  b2 = q1.x - q2.x;
  c2 = (q2.x * q1.y) - (q1.x * q2.y);

  // Compute r1 and r2
  r1 = (a2 * p1.x) + (b2 * p1.yy) + c2;
  r2 = (a2 * p2.x) + (b2 * p2.y) + c2;

  // Check signs of r1 and r2. If both point 1 and point 2 lie
  // on same side of second line segment, the line segments do
  // not intersect.
  if ((r1 !== 0) && (r2 !== 0) && (sameSign(r1, r2))) {
    return /*DONT_INTERSECT*/;
  }

  // Line segments intersect: compute intersection point.
  denom = (a1 * b2) - (a2 * b1);
  if (denom === 0) {
    return /*COLLINEAR*/;
  }

  offset = Math.abs(denom / 2);

  // The denom/2 is to get rounding instead of truncating. It
  // is added or subtracted to the numerator, depending upon the
  // sign of the numerator.
  num = (b1 * c2) - (b2 * c1);
  x = (num < 0) ? ((num - offset) / denom) : ((num + offset) / denom);

  num = (a2 * c1) - (a1 * c2);
  y = (num < 0) ? ((num - offset) / denom) : ((num + offset) / denom);

  return { x: x, y: y };
}

function sameSign(r1, r2) {
  return r1 * r2 > 0;
}

},{}],14:[function(require,module,exports){
module.exports = intersectNode;

function intersectNode(node, point) {
  return node.intersect(point);
}

},{}],15:[function(require,module,exports){
var intersectLine = require("./intersect-line");

module.exports = intersectPolygon;

/*
 * Returns the point ({x, y}) at which the point argument intersects with the
 * node argument assuming that it has the shape specified by polygon.
 */
function intersectPolygon(node, polyPoints, point) {
  var x1 = node.x;
  var y1 = node.y;

  var intersections = [];

  var minX = Number.POSITIVE_INFINITY,
      minY = Number.POSITIVE_INFINITY;
  polyPoints.forEach(function(entry) {
    minX = Math.min(minX, entry.x);
    minY = Math.min(minY, entry.y);
  });

  var left = x1 - node.width / 2 - minX;
  var top =  y1 - node.height / 2 - minY;

  for (var i = 0; i < polyPoints.length; i++) {
    var p1 = polyPoints[i];
    var p2 = polyPoints[i < polyPoints.length - 1 ? i + 1 : 0];
    var intersect = intersectLine(node, point,
      {x: left + p1.x, y: top + p1.y}, {x: left + p2.x, y: top + p2.y});
    if (intersect) {
      intersections.push(intersect);
    }
  }

  if (!intersections.length) {
    console.log("NO INTERSECTION FOUND, RETURN NODE CENTER", node);
    return node;
  }

  if (intersections.length > 1) {
    // More intersections, find the one nearest to edge end point
    intersections.sort(function(p, q) {
      var pdx = p.x - point.x,
          pdy = p.y - point.y,
          distp = Math.sqrt(pdx * pdx + pdy * pdy),

          qdx = q.x - point.x,
          qdy = q.y - point.y,
          distq = Math.sqrt(qdx * qdx + qdy * qdy);

      return (distp < distq) ? -1 : (distp === distq ? 0 : 1);
    });
  }
  return intersections[0];
}

},{"./intersect-line":13}],16:[function(require,module,exports){
module.exports = intersectRect;

function intersectRect(node, point) {
  var x = node.x;
  var y = node.y;

  // Rectangle intersection algorithm from:
  // http://math.stackexchange.com/questions/108113/find-edge-between-two-boxes
  var dx = point.x - x;
  var dy = point.y - y;
  var w = node.width / 2;
  var h = node.height / 2;

  var sx, sy;
  if (Math.abs(dy) * w > Math.abs(dx) * h) {
    // Intersection is top or bottom of rect.
    if (dy < 0) {
      h = -h;
    }
    sx = dy === 0 ? 0 : h * dx / dy;
    sy = h;
  } else {
    // Intersection is left or right of rect.
    if (dx < 0) {
      w = -w;
    }
    sx = w;
    sy = dx === 0 ? 0 : w * dy / dx;
  }

  return {x: x + sx, y: y + sy};
}

},{}],17:[function(require,module,exports){
var util = require("../util");

module.exports = addHtmlLabel;

function addHtmlLabel(root, node) {
  var fo = root
    .append("foreignObject")
      .attr("width", "100000");

  var div = fo
    .append("xhtml:div");

  var label = node.label;
  switch(typeof label) {
    case "function":
      div.insert(label);
      break;
    case "object":
      // Currently we assume this is a DOM object.
      div.insert(function() { return label; });
      break;
    default: div.html(label);
  }

  util.applyStyle(div, node.labelStyle);
  div.style("display", "inline-block");
  // Fix for firefox
  div.style("white-space", "nowrap");

  // TODO find a better way to get dimensions for foreignObjects...
  var w, h;
  div
    .each(function() {
      w = this.clientWidth;
      h = this.clientHeight;
    });

  fo
    .attr("width", w)
    .attr("height", h);

  return fo;
}

},{"../util":27}],18:[function(require,module,exports){
var addTextLabel = require("./add-text-label"),
    addHtmlLabel = require("./add-html-label"),
    addSVGLabel  = require("./add-svg-label");

module.exports = addLabel;

function addLabel(root, node, location) {
  var label = node.label;
  var labelSvg = root.append("g");

  // Allow the label to be a string, a function that returns a DOM element, or
  // a DOM element itself.
  if (node.labelType === "svg") {
    addSVGLabel(labelSvg, node);
  } else if (typeof label !== "string" || node.labelType === "html") {
    addHtmlLabel(labelSvg, node);
  } else {
    addTextLabel(labelSvg, node);
  }

  var labelBBox = labelSvg.node().getBBox();
  switch(location) {
    case "top":
      y = (-node.height / 2);
      break;
    case "bottom":
      y = (node.height / 2) - labelBBox.height;
      break;
    default:
      y = (-labelBBox.height / 2);
  }
  labelSvg.attr("transform",
                "translate(" + (-labelBBox.width / 2) + "," + y + ")");

  return labelSvg;
}

},{"./add-html-label":17,"./add-svg-label":19,"./add-text-label":20}],19:[function(require,module,exports){
var util = require("../util");

module.exports = addSVGLabel;

function addSVGLabel(root, node) {
  var domNode = root;

  domNode.node().appendChild(node.label);

  util.applyStyle(domNode, node.labelStyle);

  return domNode;
}

},{"../util":27}],20:[function(require,module,exports){
var util = require("../util");

module.exports = addTextLabel;

/*
 * Attaches a text label to the specified root. Handles escape sequences.
 */
function addTextLabel(root, node) {
  var domNode = root.append("text");

  var lines = processEscapeSequences(node.label).split("\n");
  for (var i = 0; i < lines.length; i++) {
    domNode
      .append("tspan")
        .attr("xml:space", "preserve")
        .attr("dy", "1em")
        .attr("x", "1")
        .text(lines[i]);
  }

  util.applyStyle(domNode, node.labelStyle);

  return domNode;
}

function processEscapeSequences(text) {
  var newText = "",
      escaped = false,
      ch;
  for (var i = 0; i < text.length; ++i) {
    ch = text[i];
    if (escaped) {
      switch(ch) {
        case "n": newText += "\n"; break;
        default: newText += ch;
      }
      escaped = false;
    } else if (ch === "\\") {
      escaped = true;
    } else {
      newText += ch;
    }
  }
  return newText;
}

},{"../util":27}],21:[function(require,module,exports){
/* global window */

var lodash;

if (require) {
  try {
    lodash = require("lodash");
  } catch (e) {}
}

if (!lodash) {
  lodash = window._;
}

module.exports = lodash;

},{"lodash":undefined}],22:[function(require,module,exports){
"use strict";

var util = require("./util"),
    d3 = require("./d3");

module.exports = positionClusters;

function positionClusters(selection, g) {
  var created = selection.filter(function() { return !d3.select(this).classed("update"); });

  function translate(v) {
    var node = g.node(v);
    return "translate(" + node.x + "," + node.y + ")";
  }

  created.attr("transform", translate);

  util.applyTransition(selection, g)
      .style("opacity", 1)
      .attr("transform", translate);

  util.applyTransition(created.selectAll("rect"), g)
      .attr("width", function(v) { return g.node(v).width; })
      .attr("height", function(v) { return g.node(v).height; })
      .attr("x", function(v) {
        var node = g.node(v);
        return -node.width / 2;
      })
      .attr("y", function(v) {
        var node = g.node(v);
        return -node.height / 2;
      });

}

},{"./d3":7,"./util":27}],23:[function(require,module,exports){
"use strict";

var util = require("./util"),
    d3 = require("./d3"),
    _ = require("./lodash");

module.exports = positionEdgeLabels;

function positionEdgeLabels(selection, g) {
  var created = selection.filter(function() { return !d3.select(this).classed("update"); });

  function translate(e) {
    var edge = g.edge(e);
    return _.has(edge, "x") ? "translate(" + edge.x + "," + edge.y + ")" : "";
  }

  created.attr("transform", translate);

  util.applyTransition(selection, g)
    .style("opacity", 1)
    .attr("transform", translate);
}

},{"./d3":7,"./lodash":21,"./util":27}],24:[function(require,module,exports){
"use strict";

var util = require("./util"),
    d3 = require("./d3");

module.exports = positionNodes;

function positionNodes(selection, g) {
  var created = selection.filter(function() { return !d3.select(this).classed("update"); });

  function translate(v) {
    var node = g.node(v);
    return "translate(" + node.x + "," + node.y + ")";
  }

  created.attr("transform", translate);

  util.applyTransition(selection, g)
    .style("opacity", 1)
    .attr("transform", translate);
}

},{"./d3":7,"./util":27}],25:[function(require,module,exports){
var _ = require("./lodash"),
    layout = require("./dagre").layout;

module.exports = render;

// This design is based on http://bost.ocks.org/mike/chart/.
function render() {
  var createNodes = require("./create-nodes"),
      createClusters = require("./create-clusters"),
      createEdgeLabels = require("./create-edge-labels"),
      createEdgePaths = require("./create-edge-paths"),
      positionNodes = require("./position-nodes"),
      positionEdgeLabels = require("./position-edge-labels"),
      positionClusters = require("./position-clusters"),
      shapes = require("./shapes"),
      arrows = require("./arrows");

  var fn = function(svg, g) {
    preProcessGraph(g);

    var outputGroup = createOrSelectGroup(svg, "output"),
        clustersGroup = createOrSelectGroup(outputGroup, "clusters"),
        edgePathsGroup = createOrSelectGroup(outputGroup, "edgePaths"),
        edgeLabels = createEdgeLabels(createOrSelectGroup(outputGroup, "edgeLabels"), g),
        nodes = createNodes(createOrSelectGroup(outputGroup, "nodes"), g, shapes);

    layout(g);

    positionNodes(nodes, g);
    positionEdgeLabels(edgeLabels, g);
    createEdgePaths(edgePathsGroup, g, arrows);
    createClusters(clustersGroup, g);
    positionClusters(clustersGroup.selectAll("g.cluster"), g);

    postProcessGraph(g);
  };

  fn.createNodes = function(value) {
    if (!arguments.length) return createNodes;
    createNodes = value;
    return fn;
  };

  fn.createClusters = function(value) {
    if (!arguments.length) return createClusters;
    createClusters = value;
    return fn;
  };

  fn.createEdgeLabels = function(value) {
    if (!arguments.length) return createEdgeLabels;
    createEdgeLabels = value;
    return fn;
  };

  fn.createEdgePaths = function(value) {
    if (!arguments.length) return createEdgePaths;
    createEdgePaths = value;
    return fn;
  };

  fn.shapes = function(value) {
    if (!arguments.length) return shapes;
    shapes = value;
    return fn;
  };

  fn.arrows = function(value) {
    if (!arguments.length) return arrows;
    arrows = value;
    return fn;
  };

  return fn;
}

var NODE_DEFAULT_ATTRS = {
  paddingLeft: 10,
  paddingRight: 10,
  paddingTop: 10,
  paddingBottom: 10,
  rx: 0,
  ry: 0,
  shape: "rect"
};

var EDGE_DEFAULT_ATTRS = {
  arrowhead: "normal",
  lineInterpolate: "linear"
};

function preProcessGraph(g) {
  g.nodes().forEach(function(v) {
    var node = g.node(v);
    if (!_.has(node, "label")) { node.label = v; }

    if (_.has(node, "paddingX")) {
      _.defaults(node, {
        paddingLeft: node.paddingX,
        paddingRight: node.paddingX
      });
    }

    if (_.has(node, "paddingY")) {
      _.defaults(node, {
        paddingTop: node.paddingY,
        paddingBottom: node.paddingY
      });
    }

    if (_.has(node, "padding")) {
      _.defaults(node, {
        paddingLeft: node.padding,
        paddingRight: node.padding,
        paddingTop: node.padding,
        paddingBottom: node.padding
      });
    }

    _.defaults(node, NODE_DEFAULT_ATTRS);

    _.each(["paddingLeft", "paddingRight", "paddingTop", "paddingBottom"], function(k) {
      node[k] = Number(node[k]);
    });

    // Save dimensions for restore during post-processing
    if (_.has(node, "width")) { node._prevWidth = node.width; }
    if (_.has(node, "height")) { node._prevHeight = node.height; }
  });

  g.edges().forEach(function(e) {
    var edge = g.edge(e);
    if (!_.has(edge, "label")) { edge.label = ""; }
    _.defaults(edge, EDGE_DEFAULT_ATTRS);
  });
}

function postProcessGraph(g) {
  _.each(g.nodes(), function(v) {
    var node = g.node(v);

    // Restore original dimensions
    if (_.has(node, "_prevWidth")) {
      node.width = node._prevWidth;
    } else {
      delete node.width;
    }

    if (_.has(node, "_prevHeight")) {
      node.height = node._prevHeight;
    } else {
      delete node.height;
    }

    delete node._prevWidth;
    delete node._prevHeight;
  });
}

function createOrSelectGroup(root, name) {
  var selection = root.select("g." + name);
  if (selection.empty()) {
    selection = root.append("g").attr("class", name);
  }
  return selection;
}

},{"./arrows":2,"./create-clusters":3,"./create-edge-labels":4,"./create-edge-paths":5,"./create-nodes":6,"./dagre":8,"./lodash":21,"./position-clusters":22,"./position-edge-labels":23,"./position-nodes":24,"./shapes":26}],26:[function(require,module,exports){
"use strict";

var intersectRect = require("./intersect/intersect-rect"),
    intersectEllipse = require("./intersect/intersect-ellipse"),
    intersectCircle = require("./intersect/intersect-circle"),
    intersectPolygon = require("./intersect/intersect-polygon");

module.exports = {
  rect: rect,
  ellipse: ellipse,
  circle: circle,
  diamond: diamond
};

function rect(parent, bbox, node) {
  var shapeSvg = parent.insert("rect", ":first-child")
        .attr("rx", node.rx)
        .attr("ry", node.ry)
        .attr("x", -bbox.width / 2)
        .attr("y", -bbox.height / 2)
        .attr("width", bbox.width)
        .attr("height", bbox.height);

  node.intersect = function(point) {
    return intersectRect(node, point);
  };

  return shapeSvg;
}

function ellipse(parent, bbox, node) {
  var rx = bbox.width / 2,
      ry = bbox.height / 2,
      shapeSvg = parent.insert("ellipse", ":first-child")
        .attr("x", -bbox.width / 2)
        .attr("y", -bbox.height / 2)
        .attr("rx", rx)
        .attr("ry", ry);

  node.intersect = function(point) {
    return intersectEllipse(node, rx, ry, point);
  };

  return shapeSvg;
}

function circle(parent, bbox, node) {
  var r = Math.max(bbox.width, bbox.height) / 2,
      shapeSvg = parent.insert("circle", ":first-child")
        .attr("x", -bbox.width / 2)
        .attr("y", -bbox.height / 2)
        .attr("r", r);

  node.intersect = function(point) {
    return intersectCircle(node, r, point);
  };

  return shapeSvg;
}

// Circumscribe an ellipse for the bounding box with a diamond shape. I derived
// the function to calculate the diamond shape from:
// http://mathforum.org/kb/message.jspa?messageID=3750236
function diamond(parent, bbox, node) {
  var w = (bbox.width * Math.SQRT2) / 2,
      h = (bbox.height * Math.SQRT2) / 2,
      points = [
        { x:  0, y: -h },
        { x: -w, y:  0 },
        { x:  0, y:  h },
        { x:  w, y:  0 }
      ],
      shapeSvg = parent.insert("polygon", ":first-child")
        .attr("points", points.map(function(p) { return p.x + "," + p.y; }).join(" "));

  node.intersect = function(p) {
    return intersectPolygon(node, points, p);
  };

  return shapeSvg;
}

},{"./intersect/intersect-circle":11,"./intersect/intersect-ellipse":12,"./intersect/intersect-polygon":15,"./intersect/intersect-rect":16}],27:[function(require,module,exports){
var _ = require("./lodash");

// Public utility functions
module.exports = {
  isSubgraph: isSubgraph,
  edgeToId: edgeToId,
  applyStyle: applyStyle,
  applyClass: applyClass,
  applyTransition: applyTransition
};

/*
 * Returns true if the specified node in the graph is a subgraph node. A
 * subgraph node is one that contains other nodes.
 */
function isSubgraph(g, v) {
  return !!g.children(v).length;
}

function edgeToId(e) {
  return escapeId(e.v) + ":" + escapeId(e.w) + ":" + escapeId(e.name);
}

var ID_DELIM = /:/g;
function escapeId(str) {
  return str ? String(str).replace(ID_DELIM, "\\:") : "";
}

function applyStyle(dom, styleFn) {
  if (styleFn) {
    dom.attr("style", styleFn);
  }
}

function applyClass(dom, classFn, otherClasses) {
  if (classFn) {
    dom
      .attr("class", classFn)
      .attr("class", otherClasses + " " + dom.attr("class"));
  }
}

function applyTransition(selection, g) {
  var graph = g.graph();

  if (_.isPlainObject(graph)) {
    var transition = graph.transition;
    if (_.isFunction(transition)) {
      return transition(selection);
    }
  }

  return selection;
}

},{"./lodash":21}],28:[function(require,module,exports){
module.exports = "0.4.5";

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsImxpYi9hcnJvd3MuanMiLCJsaWIvY3JlYXRlLWNsdXN0ZXJzLmpzIiwibGliL2NyZWF0ZS1lZGdlLWxhYmVscy5qcyIsImxpYi9jcmVhdGUtZWRnZS1wYXRocy5qcyIsImxpYi9jcmVhdGUtbm9kZXMuanMiLCJsaWIvZDMuanMiLCJsaWIvZGFncmUuanMiLCJsaWIvZ3JhcGhsaWIuanMiLCJsaWIvaW50ZXJzZWN0L2luZGV4LmpzIiwibGliL2ludGVyc2VjdC9pbnRlcnNlY3QtY2lyY2xlLmpzIiwibGliL2ludGVyc2VjdC9pbnRlcnNlY3QtZWxsaXBzZS5qcyIsImxpYi9pbnRlcnNlY3QvaW50ZXJzZWN0LWxpbmUuanMiLCJsaWIvaW50ZXJzZWN0L2ludGVyc2VjdC1ub2RlLmpzIiwibGliL2ludGVyc2VjdC9pbnRlcnNlY3QtcG9seWdvbi5qcyIsImxpYi9pbnRlcnNlY3QvaW50ZXJzZWN0LXJlY3QuanMiLCJsaWIvbGFiZWwvYWRkLWh0bWwtbGFiZWwuanMiLCJsaWIvbGFiZWwvYWRkLWxhYmVsLmpzIiwibGliL2xhYmVsL2FkZC1zdmctbGFiZWwuanMiLCJsaWIvbGFiZWwvYWRkLXRleHQtbGFiZWwuanMiLCJsaWIvbG9kYXNoLmpzIiwibGliL3Bvc2l0aW9uLWNsdXN0ZXJzLmpzIiwibGliL3Bvc2l0aW9uLWVkZ2UtbGFiZWxzLmpzIiwibGliL3Bvc2l0aW9uLW5vZGVzLmpzIiwibGliL3JlbmRlci5qcyIsImxpYi9zaGFwZXMuanMiLCJsaWIvdXRpbC5qcyIsImxpYi92ZXJzaW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTItMjAxMyBDaHJpcyBQZXR0aXR0XG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbiAqIFRIRSBTT0ZUV0FSRS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSAge1xuICBncmFwaGxpYjogcmVxdWlyZShcIi4vbGliL2dyYXBobGliXCIpLFxuICBkYWdyZTogcmVxdWlyZShcIi4vbGliL2RhZ3JlXCIpLFxuICBpbnRlcnNlY3Q6IHJlcXVpcmUoXCIuL2xpYi9pbnRlcnNlY3RcIiksXG4gIHJlbmRlcjogcmVxdWlyZShcIi4vbGliL3JlbmRlclwiKSxcbiAgdXRpbDogcmVxdWlyZShcIi4vbGliL3V0aWxcIiksXG4gIHZlcnNpb246IHJlcXVpcmUoXCIuL2xpYi92ZXJzaW9uXCIpXG59O1xuIiwidmFyIHV0aWwgPSByZXF1aXJlKFwiLi91dGlsXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJkZWZhdWx0XCI6IG5vcm1hbCxcbiAgXCJub3JtYWxcIjogbm9ybWFsLFxuICBcInZlZVwiOiB2ZWUsXG4gIFwidW5kaXJlY3RlZFwiOiB1bmRpcmVjdGVkXG59O1xuXG5mdW5jdGlvbiBub3JtYWwocGFyZW50LCBpZCwgZWRnZSwgdHlwZSkge1xuICB2YXIgbWFya2VyID0gcGFyZW50LmFwcGVuZChcIm1hcmtlclwiKVxuICAgIC5hdHRyKFwiaWRcIiwgaWQpXG4gICAgLmF0dHIoXCJ2aWV3Qm94XCIsIFwiMCAwIDEwIDEwXCIpXG4gICAgLmF0dHIoXCJyZWZYXCIsIDkpXG4gICAgLmF0dHIoXCJyZWZZXCIsIDUpXG4gICAgLmF0dHIoXCJtYXJrZXJVbml0c1wiLCBcInN0cm9rZVdpZHRoXCIpXG4gICAgLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCA4KVxuICAgIC5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDYpXG4gICAgLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvXCIpO1xuXG4gIHZhciBwYXRoID0gbWFya2VyLmFwcGVuZChcInBhdGhcIilcbiAgICAuYXR0cihcImRcIiwgXCJNIDAgMCBMIDEwIDUgTCAwIDEwIHpcIilcbiAgICAuc3R5bGUoXCJzdHJva2Utd2lkdGhcIiwgMSlcbiAgICAuc3R5bGUoXCJzdHJva2UtZGFzaGFycmF5XCIsIFwiMSwwXCIpO1xuICB1dGlsLmFwcGx5U3R5bGUocGF0aCwgZWRnZVt0eXBlICsgXCJTdHlsZVwiXSk7XG59XG5cbmZ1bmN0aW9uIHZlZShwYXJlbnQsIGlkLCBlZGdlLCB0eXBlKSB7XG4gIHZhciBtYXJrZXIgPSBwYXJlbnQuYXBwZW5kKFwibWFya2VyXCIpXG4gICAgLmF0dHIoXCJpZFwiLCBpZClcbiAgICAuYXR0cihcInZpZXdCb3hcIiwgXCIwIDAgMTAgMTBcIilcbiAgICAuYXR0cihcInJlZlhcIiwgOSlcbiAgICAuYXR0cihcInJlZllcIiwgNSlcbiAgICAuYXR0cihcIm1hcmtlclVuaXRzXCIsIFwic3Ryb2tlV2lkdGhcIilcbiAgICAuYXR0cihcIm1hcmtlcldpZHRoXCIsIDgpXG4gICAgLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgNilcbiAgICAuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIik7XG5cbiAgdmFyIHBhdGggPSBtYXJrZXIuYXBwZW5kKFwicGF0aFwiKVxuICAgIC5hdHRyKFwiZFwiLCBcIk0gMCAwIEwgMTAgNSBMIDAgMTAgTCA0IDUgelwiKVxuICAgIC5zdHlsZShcInN0cm9rZS13aWR0aFwiLCAxKVxuICAgIC5zdHlsZShcInN0cm9rZS1kYXNoYXJyYXlcIiwgXCIxLDBcIik7XG4gIHV0aWwuYXBwbHlTdHlsZShwYXRoLCBlZGdlW3R5cGUgKyBcIlN0eWxlXCJdKTtcbn1cblxuZnVuY3Rpb24gdW5kaXJlY3RlZChwYXJlbnQsIGlkLCBlZGdlLCB0eXBlKSB7XG4gIHZhciBtYXJrZXIgPSBwYXJlbnQuYXBwZW5kKFwibWFya2VyXCIpXG4gICAgLmF0dHIoXCJpZFwiLCBpZClcbiAgICAuYXR0cihcInZpZXdCb3hcIiwgXCIwIDAgMTAgMTBcIilcbiAgICAuYXR0cihcInJlZlhcIiwgOSlcbiAgICAuYXR0cihcInJlZllcIiwgNSlcbiAgICAuYXR0cihcIm1hcmtlclVuaXRzXCIsIFwic3Ryb2tlV2lkdGhcIilcbiAgICAuYXR0cihcIm1hcmtlcldpZHRoXCIsIDgpXG4gICAgLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgNilcbiAgICAuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIik7XG5cbiAgdmFyIHBhdGggPSBtYXJrZXIuYXBwZW5kKFwicGF0aFwiKVxuICAgIC5hdHRyKFwiZFwiLCBcIk0gMCA1IEwgMTAgNVwiKVxuICAgIC5zdHlsZShcInN0cm9rZS13aWR0aFwiLCAxKVxuICAgIC5zdHlsZShcInN0cm9rZS1kYXNoYXJyYXlcIiwgXCIxLDBcIik7XG4gIHV0aWwuYXBwbHlTdHlsZShwYXRoLCBlZGdlW3R5cGUgKyBcIlN0eWxlXCJdKTtcbn1cbiIsInZhciB1dGlsID0gcmVxdWlyZShcIi4vdXRpbFwiKSxcbiAgICBhZGRMYWJlbCA9IHJlcXVpcmUoXCIuL2xhYmVsL2FkZC1sYWJlbFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVDbHVzdGVycztcblxuZnVuY3Rpb24gY3JlYXRlQ2x1c3RlcnMoc2VsZWN0aW9uLCBnKSB7XG4gIHZhciBjbHVzdGVycyA9IGcubm9kZXMoKS5maWx0ZXIoZnVuY3Rpb24odikgeyByZXR1cm4gdXRpbC5pc1N1YmdyYXBoKGcsIHYpOyB9KSxcbiAgICAgIHN2Z0NsdXN0ZXJzID0gc2VsZWN0aW9uLnNlbGVjdEFsbChcImcuY2x1c3RlclwiKVxuICAgICAgICAuZGF0YShjbHVzdGVycywgZnVuY3Rpb24odikgeyByZXR1cm4gdjsgfSk7XG5cbiAgc3ZnQ2x1c3RlcnMuc2VsZWN0QWxsKFwiKlwiKS5yZW1vdmUoKTtcbiAgc3ZnQ2x1c3RlcnMuZW50ZXIoKVxuICAgIC5hcHBlbmQoXCJnXCIpXG4gICAgICAuYXR0cihcImNsYXNzXCIsIFwiY2x1c3RlclwiKVxuICAgICAgLnN0eWxlKFwib3BhY2l0eVwiLCAwKVxuICAgICAgLmFwcGVuZChcInJlY3RcIik7XG4gIHV0aWwuYXBwbHlUcmFuc2l0aW9uKHN2Z0NsdXN0ZXJzLmV4aXQoKSwgZylcbiAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIDApXG4gICAgLnJlbW92ZSgpO1xuXG4gIHV0aWwuYXBwbHlUcmFuc2l0aW9uKHN2Z0NsdXN0ZXJzLCBnKVxuICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgMSk7XG5cbiAgc3ZnQ2x1c3RlcnMuZWFjaChmdW5jdGlvbih2KSB7XG4gICAgdmFyIG5vZGUgPSBnLm5vZGUodiksXG4gICAgICAgIHRoaXNHcm91cCA9IGQzLnNlbGVjdCh0aGlzKSxcbiAgICAgICAgbGFiZWxHcm91cCA9IHRoaXNHcm91cC5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImxhYmVsXCIpO1xuICAgIGFkZExhYmVsKGxhYmVsR3JvdXAsIG5vZGUsIG5vZGUuY2x1c3RlckxhYmVsUG9zKTtcbiAgfSk7XG5cbiAgc3ZnQ2x1c3RlcnMuc2VsZWN0QWxsKFwicmVjdFwiKS5lYWNoKGZ1bmN0aW9uKGMpIHtcbiAgICB2YXIgbm9kZSA9IGcubm9kZShjKTtcbiAgICB2YXIgZG9tQ2x1c3RlciA9IGQzLnNlbGVjdCh0aGlzKTtcbiAgICB1dGlsLmFwcGx5U3R5bGUoZG9tQ2x1c3Rlciwgbm9kZS5zdHlsZSk7XG4gIH0pO1xufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZShcIi4vbG9kYXNoXCIpLFxuICAgIGFkZExhYmVsID0gcmVxdWlyZShcIi4vbGFiZWwvYWRkLWxhYmVsXCIpLFxuICAgIHV0aWwgPSByZXF1aXJlKFwiLi91dGlsXCIpLFxuICAgIGQzID0gcmVxdWlyZShcIi4vZDNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlRWRnZUxhYmVscztcblxuZnVuY3Rpb24gY3JlYXRlRWRnZUxhYmVscyhzZWxlY3Rpb24sIGcpIHtcbiAgdmFyIHN2Z0VkZ2VMYWJlbHMgPSBzZWxlY3Rpb24uc2VsZWN0QWxsKFwiZy5lZGdlTGFiZWxcIilcbiAgICAuZGF0YShnLmVkZ2VzKCksIGZ1bmN0aW9uKGUpIHsgcmV0dXJuIHV0aWwuZWRnZVRvSWQoZSk7IH0pXG4gICAgLmNsYXNzZWQoXCJ1cGRhdGVcIiwgdHJ1ZSk7XG5cbiAgc3ZnRWRnZUxhYmVscy5zZWxlY3RBbGwoXCIqXCIpLnJlbW92ZSgpO1xuICBzdmdFZGdlTGFiZWxzLmVudGVyKClcbiAgICAuYXBwZW5kKFwiZ1wiKVxuICAgICAgLmNsYXNzZWQoXCJlZGdlTGFiZWxcIiwgdHJ1ZSlcbiAgICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgMCk7XG4gIHN2Z0VkZ2VMYWJlbHMuZWFjaChmdW5jdGlvbihlKSB7XG4gICAgdmFyIGVkZ2UgPSBnLmVkZ2UoZSksXG4gICAgICAgIGxhYmVsID0gYWRkTGFiZWwoZDMuc2VsZWN0KHRoaXMpLCBnLmVkZ2UoZSksIDAsIDApLmNsYXNzZWQoXCJsYWJlbFwiLCB0cnVlKSxcbiAgICAgICAgYmJveCA9IGxhYmVsLm5vZGUoKS5nZXRCQm94KCk7XG5cbiAgICBpZiAoZWRnZS5sYWJlbElkKSB7IGxhYmVsLmF0dHIoXCJpZFwiLCBlZGdlLmxhYmVsSWQpOyB9XG4gICAgaWYgKCFfLmhhcyhlZGdlLCBcIndpZHRoXCIpKSB7IGVkZ2Uud2lkdGggPSBiYm94LndpZHRoOyB9XG4gICAgaWYgKCFfLmhhcyhlZGdlLCBcImhlaWdodFwiKSkgeyBlZGdlLmhlaWdodCA9IGJib3guaGVpZ2h0OyB9XG4gIH0pO1xuXG4gIHV0aWwuYXBwbHlUcmFuc2l0aW9uKHN2Z0VkZ2VMYWJlbHMuZXhpdCgpLCBnKVxuICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgMClcbiAgICAucmVtb3ZlKCk7XG5cbiAgcmV0dXJuIHN2Z0VkZ2VMYWJlbHM7XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKFwiLi9sb2Rhc2hcIiksXG4gICAgaW50ZXJzZWN0Tm9kZSA9IHJlcXVpcmUoXCIuL2ludGVyc2VjdC9pbnRlcnNlY3Qtbm9kZVwiKSxcbiAgICB1dGlsID0gcmVxdWlyZShcIi4vdXRpbFwiKSxcbiAgICBkMyA9IHJlcXVpcmUoXCIuL2QzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUVkZ2VQYXRocztcblxuZnVuY3Rpb24gY3JlYXRlRWRnZVBhdGhzKHNlbGVjdGlvbiwgZywgYXJyb3dzKSB7XG4gIHZhciBzdmdQYXRocyA9IHNlbGVjdGlvbi5zZWxlY3RBbGwoXCJnLmVkZ2VQYXRoXCIpXG4gICAgLmRhdGEoZy5lZGdlcygpLCBmdW5jdGlvbihlKSB7IHJldHVybiB1dGlsLmVkZ2VUb0lkKGUpOyB9KVxuICAgIC5jbGFzc2VkKFwidXBkYXRlXCIsIHRydWUpO1xuXG4gIGVudGVyKHN2Z1BhdGhzLCBnKTtcbiAgZXhpdChzdmdQYXRocywgZyk7XG5cbiAgdXRpbC5hcHBseVRyYW5zaXRpb24oc3ZnUGF0aHMsIGcpXG4gICAgLnN0eWxlKFwib3BhY2l0eVwiLCAxKTtcblxuICAvLyBTYXZlIERPTSBlbGVtZW50IGluIHRoZSBwYXRoIGdyb3VwLCBhbmQgc2V0IElEIGFuZCBjbGFzc1xuICBzdmdQYXRocy5lYWNoKGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgZG9tRWRnZSA9IGQzLnNlbGVjdCh0aGlzKTtcbiAgICB2YXIgZWRnZSA9IGcuZWRnZShlKTtcbiAgICBlZGdlLmVsZW0gPSB0aGlzO1xuXG4gICAgaWYgKGVkZ2UuaWQpIHtcbiAgICAgIGRvbUVkZ2UuYXR0cihcImlkXCIsIGVkZ2UuaWQpO1xuICAgIH1cblxuICAgIHV0aWwuYXBwbHlDbGFzcyhkb21FZGdlLCBlZGdlW1wiY2xhc3NcIl0sXG4gICAgICAoZG9tRWRnZS5jbGFzc2VkKFwidXBkYXRlXCIpID8gXCJ1cGRhdGUgXCIgOiBcIlwiKSArIFwiZWRnZVBhdGhcIik7XG4gIH0pO1xuXG4gIHN2Z1BhdGhzLnNlbGVjdEFsbChcInBhdGgucGF0aFwiKVxuICAgIC5lYWNoKGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBlZGdlID0gZy5lZGdlKGUpO1xuICAgICAgZWRnZS5hcnJvd2hlYWRJZCA9IF8udW5pcXVlSWQoXCJhcnJvd2hlYWRcIik7XG5cbiAgICAgIHZhciBkb21FZGdlID0gZDMuc2VsZWN0KHRoaXMpXG4gICAgICAgIC5hdHRyKFwibWFya2VyLWVuZFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gXCJ1cmwoI1wiICsgZWRnZS5hcnJvd2hlYWRJZCArIFwiKVwiO1xuICAgICAgICB9KVxuICAgICAgICAuc3R5bGUoXCJmaWxsXCIsIFwibm9uZVwiKTtcblxuICAgICAgdXRpbC5hcHBseVRyYW5zaXRpb24oZG9tRWRnZSwgZylcbiAgICAgICAgLmF0dHIoXCJkXCIsIGZ1bmN0aW9uKGUpIHsgcmV0dXJuIGNhbGNQb2ludHMoZywgZSk7IH0pO1xuXG4gICAgICB1dGlsLmFwcGx5U3R5bGUoZG9tRWRnZSwgZWRnZS5zdHlsZSk7XG4gICAgfSk7XG5cbiAgc3ZnUGF0aHMuc2VsZWN0QWxsKFwiZGVmcyAqXCIpLnJlbW92ZSgpO1xuICBzdmdQYXRocy5zZWxlY3RBbGwoXCJkZWZzXCIpXG4gICAgLmVhY2goZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIGVkZ2UgPSBnLmVkZ2UoZSksXG4gICAgICAgICAgYXJyb3doZWFkID0gYXJyb3dzW2VkZ2UuYXJyb3doZWFkXTtcbiAgICAgIGFycm93aGVhZChkMy5zZWxlY3QodGhpcyksIGVkZ2UuYXJyb3doZWFkSWQsIGVkZ2UsIFwiYXJyb3doZWFkXCIpO1xuICAgIH0pO1xuXG4gIHJldHVybiBzdmdQYXRocztcbn1cblxuZnVuY3Rpb24gY2FsY1BvaW50cyhnLCBlKSB7XG4gIHZhciBlZGdlID0gZy5lZGdlKGUpLFxuICAgICAgdGFpbCA9IGcubm9kZShlLnYpLFxuICAgICAgaGVhZCA9IGcubm9kZShlLncpLFxuICAgICAgcG9pbnRzID0gZWRnZS5wb2ludHMuc2xpY2UoMSwgZWRnZS5wb2ludHMubGVuZ3RoIC0gMSk7XG4gIHBvaW50cy51bnNoaWZ0KGludGVyc2VjdE5vZGUodGFpbCwgcG9pbnRzWzBdKSk7XG4gIHBvaW50cy5wdXNoKGludGVyc2VjdE5vZGUoaGVhZCwgcG9pbnRzW3BvaW50cy5sZW5ndGggLSAxXSkpO1xuXG4gIHJldHVybiBjcmVhdGVMaW5lKGVkZ2UsIHBvaW50cyk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUxpbmUoZWRnZSwgcG9pbnRzKSB7XG4gIHZhciBsaW5lID0gZDMuc3ZnLmxpbmUoKVxuICAgIC54KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQueDsgfSlcbiAgICAueShmdW5jdGlvbihkKSB7IHJldHVybiBkLnk7IH0pO1xuXG4gIGlmIChfLmhhcyhlZGdlLCBcImxpbmVJbnRlcnBvbGF0ZVwiKSkge1xuICAgIGxpbmUuaW50ZXJwb2xhdGUoZWRnZS5saW5lSW50ZXJwb2xhdGUpO1xuICB9XG5cbiAgaWYgKF8uaGFzKGVkZ2UsIFwibGluZVRlbnNpb25cIikpIHtcbiAgICBsaW5lLnRlbnNpb24oTnVtYmVyKGVkZ2UubGluZVRlbnNpb24pKTtcbiAgfVxuXG4gIHJldHVybiBsaW5lKHBvaW50cyk7XG59XG5cbmZ1bmN0aW9uIGdldENvb3JkcyhlbGVtKSB7XG4gIHZhciBiYm94ID0gZWxlbS5nZXRCQm94KCksXG4gICAgICBtYXRyaXggPSBlbGVtLmdldFRyYW5zZm9ybVRvRWxlbWVudChlbGVtLm93bmVyU1ZHRWxlbWVudClcbiAgICAgICAgLnRyYW5zbGF0ZShiYm94LndpZHRoIC8gMiwgYmJveC5oZWlnaHQgLyAyKTtcbiAgcmV0dXJuIHsgeDogbWF0cml4LmUsIHk6IG1hdHJpeC5mIH07XG59XG5cbmZ1bmN0aW9uIGVudGVyKHN2Z1BhdGhzLCBnKSB7XG4gIHZhciBzdmdQYXRoc0VudGVyID0gc3ZnUGF0aHMuZW50ZXIoKVxuICAgIC5hcHBlbmQoXCJnXCIpXG4gICAgICAuYXR0cihcImNsYXNzXCIsIFwiZWRnZVBhdGhcIilcbiAgICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgMCk7XG4gIHN2Z1BhdGhzRW50ZXIuYXBwZW5kKFwicGF0aFwiKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJwYXRoXCIpXG4gICAgLmF0dHIoXCJkXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBlZGdlID0gZy5lZGdlKGUpLFxuICAgICAgICAgIHNvdXJjZUVsZW0gPSBnLm5vZGUoZS52KS5lbGVtLFxuICAgICAgICAgIHBvaW50cyA9IF8ucmFuZ2UoZWRnZS5wb2ludHMubGVuZ3RoKS5tYXAoZnVuY3Rpb24oKSB7IHJldHVybiBnZXRDb29yZHMoc291cmNlRWxlbSk7IH0pO1xuICAgICAgcmV0dXJuIGNyZWF0ZUxpbmUoZWRnZSwgcG9pbnRzKTtcbiAgICB9KTtcbiAgc3ZnUGF0aHNFbnRlci5hcHBlbmQoXCJkZWZzXCIpO1xufVxuXG5mdW5jdGlvbiBleGl0KHN2Z1BhdGhzLCBnKSB7XG4gIHZhciBzdmdQYXRoRXhpdCA9IHN2Z1BhdGhzLmV4aXQoKTtcbiAgdXRpbC5hcHBseVRyYW5zaXRpb24oc3ZnUGF0aEV4aXQsIGcpXG4gICAgLnN0eWxlKFwib3BhY2l0eVwiLCAwKVxuICAgIC5yZW1vdmUoKTtcblxuICB1dGlsLmFwcGx5VHJhbnNpdGlvbihzdmdQYXRoRXhpdC5zZWxlY3QoXCJwYXRoLnBhdGhcIiksIGcpXG4gICAgLmF0dHIoXCJkXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBzb3VyY2UgPSBnLm5vZGUoZS52KTtcblxuICAgICAgaWYgKHNvdXJjZSkge1xuICAgICAgICB2YXIgcG9pbnRzID0gXy5yYW5nZSh0aGlzLnBhdGhTZWdMaXN0Lmxlbmd0aCkubWFwKGZ1bmN0aW9uKCkgeyByZXR1cm4gc291cmNlOyB9KTtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUxpbmUoe30sIHBvaW50cyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZDMuc2VsZWN0KHRoaXMpLmF0dHIoXCJkXCIpO1xuICAgICAgfVxuICAgIH0pO1xufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZShcIi4vbG9kYXNoXCIpLFxuICAgIGFkZExhYmVsID0gcmVxdWlyZShcIi4vbGFiZWwvYWRkLWxhYmVsXCIpLFxuICAgIHV0aWwgPSByZXF1aXJlKFwiLi91dGlsXCIpLFxuICAgIGQzID0gcmVxdWlyZShcIi4vZDNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlTm9kZXM7XG5cbmZ1bmN0aW9uIGNyZWF0ZU5vZGVzKHNlbGVjdGlvbiwgZywgc2hhcGVzKSB7XG4gIHZhciBzaW1wbGVOb2RlcyA9IGcubm9kZXMoKS5maWx0ZXIoZnVuY3Rpb24odikgeyByZXR1cm4gIXV0aWwuaXNTdWJncmFwaChnLCB2KTsgfSk7XG4gIHZhciBzdmdOb2RlcyA9IHNlbGVjdGlvbi5zZWxlY3RBbGwoXCJnLm5vZGVcIilcbiAgICAuZGF0YShzaW1wbGVOb2RlcywgZnVuY3Rpb24odikgeyByZXR1cm4gdjsgfSlcbiAgICAuY2xhc3NlZChcInVwZGF0ZVwiLCB0cnVlKTtcblxuICBzdmdOb2Rlcy5zZWxlY3RBbGwoXCIqXCIpLnJlbW92ZSgpO1xuICBzdmdOb2Rlcy5lbnRlcigpXG4gICAgLmFwcGVuZChcImdcIilcbiAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJub2RlXCIpXG4gICAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIDApO1xuICBzdmdOb2Rlcy5lYWNoKGZ1bmN0aW9uKHYpIHtcbiAgICB2YXIgbm9kZSA9IGcubm9kZSh2KSxcbiAgICAgICAgdGhpc0dyb3VwID0gZDMuc2VsZWN0KHRoaXMpLFxuICAgICAgICBsYWJlbEdyb3VwID0gdGhpc0dyb3VwLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwibGFiZWxcIiksXG4gICAgICAgIGxhYmVsRG9tID0gYWRkTGFiZWwobGFiZWxHcm91cCwgbm9kZSksXG4gICAgICAgIHNoYXBlID0gc2hhcGVzW25vZGUuc2hhcGVdLFxuICAgICAgICBiYm94ID0gXy5waWNrKGxhYmVsRG9tLm5vZGUoKS5nZXRCQm94KCksIFwid2lkdGhcIiwgXCJoZWlnaHRcIik7XG5cbiAgICBub2RlLmVsZW0gPSB0aGlzO1xuXG4gICAgaWYgKG5vZGUuaWQpIHsgdGhpc0dyb3VwLmF0dHIoXCJpZFwiLCBub2RlLmlkKTsgfVxuICAgIGlmIChub2RlLmxhYmVsSWQpIHsgbGFiZWxHcm91cC5hdHRyKFwiaWRcIiwgbm9kZS5sYWJlbElkKTsgfVxuICAgIHV0aWwuYXBwbHlDbGFzcyh0aGlzR3JvdXAsIG5vZGVbXCJjbGFzc1wiXSxcbiAgICAgICh0aGlzR3JvdXAuY2xhc3NlZChcInVwZGF0ZVwiKSA/IFwidXBkYXRlIFwiIDogXCJcIikgKyBcIm5vZGVcIik7XG5cbiAgICBpZiAoXy5oYXMobm9kZSwgXCJ3aWR0aFwiKSkgeyBiYm94LndpZHRoID0gbm9kZS53aWR0aDsgfVxuICAgIGlmIChfLmhhcyhub2RlLCBcImhlaWdodFwiKSkgeyBiYm94LmhlaWdodCA9IG5vZGUuaGVpZ2h0OyB9XG5cbiAgICBiYm94LndpZHRoICs9IG5vZGUucGFkZGluZ0xlZnQgKyBub2RlLnBhZGRpbmdSaWdodDtcbiAgICBiYm94LmhlaWdodCArPSBub2RlLnBhZGRpbmdUb3AgKyBub2RlLnBhZGRpbmdCb3R0b207XG4gICAgbGFiZWxHcm91cC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICtcbiAgICAgICgobm9kZS5wYWRkaW5nTGVmdCAtIG5vZGUucGFkZGluZ1JpZ2h0KSAvIDIpICsgXCIsXCIgK1xuICAgICAgKChub2RlLnBhZGRpbmdUb3AgLSBub2RlLnBhZGRpbmdCb3R0b20pIC8gMikgKyBcIilcIik7XG5cbiAgICB2YXIgc2hhcGVTdmcgPSBzaGFwZShkMy5zZWxlY3QodGhpcyksIGJib3gsIG5vZGUpO1xuICAgIHV0aWwuYXBwbHlTdHlsZShzaGFwZVN2Zywgbm9kZS5zdHlsZSk7XG5cbiAgICB2YXIgc2hhcGVCQm94ID0gc2hhcGVTdmcubm9kZSgpLmdldEJCb3goKTtcbiAgICBub2RlLndpZHRoID0gc2hhcGVCQm94LndpZHRoO1xuICAgIG5vZGUuaGVpZ2h0ID0gc2hhcGVCQm94LmhlaWdodDtcbiAgfSk7XG5cbiAgdXRpbC5hcHBseVRyYW5zaXRpb24oc3ZnTm9kZXMuZXhpdCgpLCBnKVxuICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgMClcbiAgICAucmVtb3ZlKCk7XG5cbiAgcmV0dXJuIHN2Z05vZGVzO1xufVxuIiwiLy8gU3R1YiB0byBnZXQgRDMgZWl0aGVyIHZpYSBOUE0gb3IgZnJvbSB0aGUgZ2xvYmFsIG9iamVjdFxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cuZDM7XG4iLCIvKiBnbG9iYWwgd2luZG93ICovXG5cbnZhciBkYWdyZTtcblxuaWYgKHJlcXVpcmUpIHtcbiAgdHJ5IHtcbiAgICBkYWdyZSA9IHJlcXVpcmUoXCJkYWdyZVwiKTtcbiAgfSBjYXRjaCAoZSkge31cbn1cblxuaWYgKCFkYWdyZSkge1xuICBkYWdyZSA9IHdpbmRvdy5kYWdyZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkYWdyZTtcbiIsIi8qIGdsb2JhbCB3aW5kb3cgKi9cblxudmFyIGdyYXBobGliO1xuXG5pZiAocmVxdWlyZSkge1xuICB0cnkge1xuICAgIGdyYXBobGliID0gcmVxdWlyZShcImdyYXBobGliXCIpO1xuICB9IGNhdGNoIChlKSB7fVxufVxuXG5pZiAoIWdyYXBobGliKSB7XG4gIGdyYXBobGliID0gd2luZG93LmdyYXBobGliO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdyYXBobGliO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIG5vZGU6IHJlcXVpcmUoXCIuL2ludGVyc2VjdC1ub2RlXCIpLFxuICBjaXJjbGU6IHJlcXVpcmUoXCIuL2ludGVyc2VjdC1jaXJjbGVcIiksXG4gIGVsbGlwc2U6IHJlcXVpcmUoXCIuL2ludGVyc2VjdC1lbGxpcHNlXCIpLFxuICBwb2x5Z29uOiByZXF1aXJlKFwiLi9pbnRlcnNlY3QtcG9seWdvblwiKSxcbiAgcmVjdDogcmVxdWlyZShcIi4vaW50ZXJzZWN0LXJlY3RcIilcbn07XG4iLCJ2YXIgaW50ZXJzZWN0RWxsaXBzZSA9IHJlcXVpcmUoXCIuL2ludGVyc2VjdC1lbGxpcHNlXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGludGVyc2VjdENpcmNsZTtcblxuZnVuY3Rpb24gaW50ZXJzZWN0Q2lyY2xlKG5vZGUsIHJ4LCBwb2ludCkge1xuICByZXR1cm4gaW50ZXJzZWN0RWxsaXBzZShub2RlLCByeCwgcngsIHBvaW50KTtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gaW50ZXJzZWN0RWxsaXBzZTtcblxuZnVuY3Rpb24gaW50ZXJzZWN0RWxsaXBzZShub2RlLCByeCwgcnksIHBvaW50KSB7XG4gIC8vIEZvcm11bGFlIGZyb206IGh0dHA6Ly9tYXRod29ybGQud29sZnJhbS5jb20vRWxsaXBzZS1MaW5lSW50ZXJzZWN0aW9uLmh0bWxcblxuICB2YXIgY3ggPSBub2RlLng7XG4gIHZhciBjeSA9IG5vZGUueTtcblxuICB2YXIgcHggPSBjeCAtIHBvaW50Lng7XG4gIHZhciBweSA9IGN5IC0gcG9pbnQueTtcblxuICB2YXIgZGV0ID0gTWF0aC5zcXJ0KHJ4ICogcnggKiBweSAqIHB5ICsgcnkgKiByeSAqIHB4ICogcHgpO1xuXG4gIHZhciBkeCA9IE1hdGguYWJzKHJ4ICogcnkgKiBweCAvIGRldCk7XG4gIGlmIChwb2ludC54IDwgY3gpIHtcbiAgICBkeCA9IC1keDtcbiAgfVxuICB2YXIgZHkgPSBNYXRoLmFicyhyeCAqIHJ5ICogcHkgLyBkZXQpO1xuICBpZiAocG9pbnQueSA8IGN5KSB7XG4gICAgZHkgPSAtZHk7XG4gIH1cblxuICByZXR1cm4ge3g6IGN4ICsgZHgsIHk6IGN5ICsgZHl9O1xufVxuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGludGVyc2VjdExpbmU7XG5cbi8qXG4gKiBSZXR1cm5zIHRoZSBwb2ludCBhdCB3aGljaCB0d28gbGluZXMsIHAgYW5kIHEsIGludGVyc2VjdCBvciByZXR1cm5zXG4gKiB1bmRlZmluZWQgaWYgdGhleSBkbyBub3QgaW50ZXJzZWN0LlxuICovXG5mdW5jdGlvbiBpbnRlcnNlY3RMaW5lKHAxLCBwMiwgcTEsIHEyKSB7XG4gIC8vIEFsZ29yaXRobSBmcm9tIEouIEF2cm8sIChlZC4pIEdyYXBoaWNzIEdlbXMsIE5vIDIsIE1vcmdhbiBLYXVmbWFubiwgMTk5NCxcbiAgLy8gcDcgYW5kIHA0NzMuXG5cbiAgdmFyIGExLCBhMiwgYjEsIGIyLCBjMSwgYzI7XG4gIHZhciByMSwgcjIgLCByMywgcjQ7XG4gIHZhciBkZW5vbSwgb2Zmc2V0LCBudW07XG4gIHZhciB4LCB5O1xuXG4gIC8vIENvbXB1dGUgYTEsIGIxLCBjMSwgd2hlcmUgbGluZSBqb2luaW5nIHBvaW50cyAxIGFuZCAyIGlzIEYoeCx5KSA9IGExIHggK1xuICAvLyBiMSB5ICsgYzEgPSAwLlxuICBhMSA9IHAyLnkgLSBwMS55O1xuICBiMSA9IHAxLnggLSBwMi54O1xuICBjMSA9IChwMi54ICogcDEueSkgLSAocDEueCAqIHAyLnkpO1xuXG4gIC8vIENvbXB1dGUgcjMgYW5kIHI0LlxuICByMyA9ICgoYTEgKiBxMS54KSArIChiMSAqIHExLnkpICsgYzEpO1xuICByNCA9ICgoYTEgKiBxMi54KSArIChiMSAqIHEyLnkpICsgYzEpO1xuXG4gIC8vIENoZWNrIHNpZ25zIG9mIHIzIGFuZCByNC4gSWYgYm90aCBwb2ludCAzIGFuZCBwb2ludCA0IGxpZSBvblxuICAvLyBzYW1lIHNpZGUgb2YgbGluZSAxLCB0aGUgbGluZSBzZWdtZW50cyBkbyBub3QgaW50ZXJzZWN0LlxuICBpZiAoKHIzICE9PSAwKSAmJiAocjQgIT09IDApICYmIHNhbWVTaWduKHIzLCByNCkpIHtcbiAgICByZXR1cm4gLypET05UX0lOVEVSU0VDVCovO1xuICB9XG5cbiAgLy8gQ29tcHV0ZSBhMiwgYjIsIGMyIHdoZXJlIGxpbmUgam9pbmluZyBwb2ludHMgMyBhbmQgNCBpcyBHKHgseSkgPSBhMiB4ICsgYjIgeSArIGMyID0gMFxuICBhMiA9IHEyLnkgLSBxMS55O1xuICBiMiA9IHExLnggLSBxMi54O1xuICBjMiA9IChxMi54ICogcTEueSkgLSAocTEueCAqIHEyLnkpO1xuXG4gIC8vIENvbXB1dGUgcjEgYW5kIHIyXG4gIHIxID0gKGEyICogcDEueCkgKyAoYjIgKiBwMS55eSkgKyBjMjtcbiAgcjIgPSAoYTIgKiBwMi54KSArIChiMiAqIHAyLnkpICsgYzI7XG5cbiAgLy8gQ2hlY2sgc2lnbnMgb2YgcjEgYW5kIHIyLiBJZiBib3RoIHBvaW50IDEgYW5kIHBvaW50IDIgbGllXG4gIC8vIG9uIHNhbWUgc2lkZSBvZiBzZWNvbmQgbGluZSBzZWdtZW50LCB0aGUgbGluZSBzZWdtZW50cyBkb1xuICAvLyBub3QgaW50ZXJzZWN0LlxuICBpZiAoKHIxICE9PSAwKSAmJiAocjIgIT09IDApICYmIChzYW1lU2lnbihyMSwgcjIpKSkge1xuICAgIHJldHVybiAvKkRPTlRfSU5URVJTRUNUKi87XG4gIH1cblxuICAvLyBMaW5lIHNlZ21lbnRzIGludGVyc2VjdDogY29tcHV0ZSBpbnRlcnNlY3Rpb24gcG9pbnQuXG4gIGRlbm9tID0gKGExICogYjIpIC0gKGEyICogYjEpO1xuICBpZiAoZGVub20gPT09IDApIHtcbiAgICByZXR1cm4gLypDT0xMSU5FQVIqLztcbiAgfVxuXG4gIG9mZnNldCA9IE1hdGguYWJzKGRlbm9tIC8gMik7XG5cbiAgLy8gVGhlIGRlbm9tLzIgaXMgdG8gZ2V0IHJvdW5kaW5nIGluc3RlYWQgb2YgdHJ1bmNhdGluZy4gSXRcbiAgLy8gaXMgYWRkZWQgb3Igc3VidHJhY3RlZCB0byB0aGUgbnVtZXJhdG9yLCBkZXBlbmRpbmcgdXBvbiB0aGVcbiAgLy8gc2lnbiBvZiB0aGUgbnVtZXJhdG9yLlxuICBudW0gPSAoYjEgKiBjMikgLSAoYjIgKiBjMSk7XG4gIHggPSAobnVtIDwgMCkgPyAoKG51bSAtIG9mZnNldCkgLyBkZW5vbSkgOiAoKG51bSArIG9mZnNldCkgLyBkZW5vbSk7XG5cbiAgbnVtID0gKGEyICogYzEpIC0gKGExICogYzIpO1xuICB5ID0gKG51bSA8IDApID8gKChudW0gLSBvZmZzZXQpIC8gZGVub20pIDogKChudW0gKyBvZmZzZXQpIC8gZGVub20pO1xuXG4gIHJldHVybiB7IHg6IHgsIHk6IHkgfTtcbn1cblxuZnVuY3Rpb24gc2FtZVNpZ24ocjEsIHIyKSB7XG4gIHJldHVybiByMSAqIHIyID4gMDtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gaW50ZXJzZWN0Tm9kZTtcblxuZnVuY3Rpb24gaW50ZXJzZWN0Tm9kZShub2RlLCBwb2ludCkge1xuICByZXR1cm4gbm9kZS5pbnRlcnNlY3QocG9pbnQpO1xufVxuIiwidmFyIGludGVyc2VjdExpbmUgPSByZXF1aXJlKFwiLi9pbnRlcnNlY3QtbGluZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbnRlcnNlY3RQb2x5Z29uO1xuXG4vKlxuICogUmV0dXJucyB0aGUgcG9pbnQgKHt4LCB5fSkgYXQgd2hpY2ggdGhlIHBvaW50IGFyZ3VtZW50IGludGVyc2VjdHMgd2l0aCB0aGVcbiAqIG5vZGUgYXJndW1lbnQgYXNzdW1pbmcgdGhhdCBpdCBoYXMgdGhlIHNoYXBlIHNwZWNpZmllZCBieSBwb2x5Z29uLlxuICovXG5mdW5jdGlvbiBpbnRlcnNlY3RQb2x5Z29uKG5vZGUsIHBvbHlQb2ludHMsIHBvaW50KSB7XG4gIHZhciB4MSA9IG5vZGUueDtcbiAgdmFyIHkxID0gbm9kZS55O1xuXG4gIHZhciBpbnRlcnNlY3Rpb25zID0gW107XG5cbiAgdmFyIG1pblggPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXG4gICAgICBtaW5ZID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICBwb2x5UG9pbnRzLmZvckVhY2goZnVuY3Rpb24oZW50cnkpIHtcbiAgICBtaW5YID0gTWF0aC5taW4obWluWCwgZW50cnkueCk7XG4gICAgbWluWSA9IE1hdGgubWluKG1pblksIGVudHJ5LnkpO1xuICB9KTtcblxuICB2YXIgbGVmdCA9IHgxIC0gbm9kZS53aWR0aCAvIDIgLSBtaW5YO1xuICB2YXIgdG9wID0gIHkxIC0gbm9kZS5oZWlnaHQgLyAyIC0gbWluWTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHBvbHlQb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcDEgPSBwb2x5UG9pbnRzW2ldO1xuICAgIHZhciBwMiA9IHBvbHlQb2ludHNbaSA8IHBvbHlQb2ludHMubGVuZ3RoIC0gMSA/IGkgKyAxIDogMF07XG4gICAgdmFyIGludGVyc2VjdCA9IGludGVyc2VjdExpbmUobm9kZSwgcG9pbnQsXG4gICAgICB7eDogbGVmdCArIHAxLngsIHk6IHRvcCArIHAxLnl9LCB7eDogbGVmdCArIHAyLngsIHk6IHRvcCArIHAyLnl9KTtcbiAgICBpZiAoaW50ZXJzZWN0KSB7XG4gICAgICBpbnRlcnNlY3Rpb25zLnB1c2goaW50ZXJzZWN0KTtcbiAgICB9XG4gIH1cblxuICBpZiAoIWludGVyc2VjdGlvbnMubGVuZ3RoKSB7XG4gICAgY29uc29sZS5sb2coXCJOTyBJTlRFUlNFQ1RJT04gRk9VTkQsIFJFVFVSTiBOT0RFIENFTlRFUlwiLCBub2RlKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIGlmIChpbnRlcnNlY3Rpb25zLmxlbmd0aCA+IDEpIHtcbiAgICAvLyBNb3JlIGludGVyc2VjdGlvbnMsIGZpbmQgdGhlIG9uZSBuZWFyZXN0IHRvIGVkZ2UgZW5kIHBvaW50XG4gICAgaW50ZXJzZWN0aW9ucy5zb3J0KGZ1bmN0aW9uKHAsIHEpIHtcbiAgICAgIHZhciBwZHggPSBwLnggLSBwb2ludC54LFxuICAgICAgICAgIHBkeSA9IHAueSAtIHBvaW50LnksXG4gICAgICAgICAgZGlzdHAgPSBNYXRoLnNxcnQocGR4ICogcGR4ICsgcGR5ICogcGR5KSxcblxuICAgICAgICAgIHFkeCA9IHEueCAtIHBvaW50LngsXG4gICAgICAgICAgcWR5ID0gcS55IC0gcG9pbnQueSxcbiAgICAgICAgICBkaXN0cSA9IE1hdGguc3FydChxZHggKiBxZHggKyBxZHkgKiBxZHkpO1xuXG4gICAgICByZXR1cm4gKGRpc3RwIDwgZGlzdHEpID8gLTEgOiAoZGlzdHAgPT09IGRpc3RxID8gMCA6IDEpO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBpbnRlcnNlY3Rpb25zWzBdO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBpbnRlcnNlY3RSZWN0O1xuXG5mdW5jdGlvbiBpbnRlcnNlY3RSZWN0KG5vZGUsIHBvaW50KSB7XG4gIHZhciB4ID0gbm9kZS54O1xuICB2YXIgeSA9IG5vZGUueTtcblxuICAvLyBSZWN0YW5nbGUgaW50ZXJzZWN0aW9uIGFsZ29yaXRobSBmcm9tOlxuICAvLyBodHRwOi8vbWF0aC5zdGFja2V4Y2hhbmdlLmNvbS9xdWVzdGlvbnMvMTA4MTEzL2ZpbmQtZWRnZS1iZXR3ZWVuLXR3by1ib3hlc1xuICB2YXIgZHggPSBwb2ludC54IC0geDtcbiAgdmFyIGR5ID0gcG9pbnQueSAtIHk7XG4gIHZhciB3ID0gbm9kZS53aWR0aCAvIDI7XG4gIHZhciBoID0gbm9kZS5oZWlnaHQgLyAyO1xuXG4gIHZhciBzeCwgc3k7XG4gIGlmIChNYXRoLmFicyhkeSkgKiB3ID4gTWF0aC5hYnMoZHgpICogaCkge1xuICAgIC8vIEludGVyc2VjdGlvbiBpcyB0b3Agb3IgYm90dG9tIG9mIHJlY3QuXG4gICAgaWYgKGR5IDwgMCkge1xuICAgICAgaCA9IC1oO1xuICAgIH1cbiAgICBzeCA9IGR5ID09PSAwID8gMCA6IGggKiBkeCAvIGR5O1xuICAgIHN5ID0gaDtcbiAgfSBlbHNlIHtcbiAgICAvLyBJbnRlcnNlY3Rpb24gaXMgbGVmdCBvciByaWdodCBvZiByZWN0LlxuICAgIGlmIChkeCA8IDApIHtcbiAgICAgIHcgPSAtdztcbiAgICB9XG4gICAgc3ggPSB3O1xuICAgIHN5ID0gZHggPT09IDAgPyAwIDogdyAqIGR5IC8gZHg7XG4gIH1cblxuICByZXR1cm4ge3g6IHggKyBzeCwgeTogeSArIHN5fTtcbn1cbiIsInZhciB1dGlsID0gcmVxdWlyZShcIi4uL3V0aWxcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gYWRkSHRtbExhYmVsO1xuXG5mdW5jdGlvbiBhZGRIdG1sTGFiZWwocm9vdCwgbm9kZSkge1xuICB2YXIgZm8gPSByb290XG4gICAgLmFwcGVuZChcImZvcmVpZ25PYmplY3RcIilcbiAgICAgIC5hdHRyKFwid2lkdGhcIiwgXCIxMDAwMDBcIik7XG5cbiAgdmFyIGRpdiA9IGZvXG4gICAgLmFwcGVuZChcInhodG1sOmRpdlwiKTtcblxuICB2YXIgbGFiZWwgPSBub2RlLmxhYmVsO1xuICBzd2l0Y2godHlwZW9mIGxhYmVsKSB7XG4gICAgY2FzZSBcImZ1bmN0aW9uXCI6XG4gICAgICBkaXYuaW5zZXJ0KGxhYmVsKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJvYmplY3RcIjpcbiAgICAgIC8vIEN1cnJlbnRseSB3ZSBhc3N1bWUgdGhpcyBpcyBhIERPTSBvYmplY3QuXG4gICAgICBkaXYuaW5zZXJ0KGZ1bmN0aW9uKCkgeyByZXR1cm4gbGFiZWw7IH0pO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDogZGl2Lmh0bWwobGFiZWwpO1xuICB9XG5cbiAgdXRpbC5hcHBseVN0eWxlKGRpdiwgbm9kZS5sYWJlbFN0eWxlKTtcbiAgZGl2LnN0eWxlKFwiZGlzcGxheVwiLCBcImlubGluZS1ibG9ja1wiKTtcbiAgLy8gRml4IGZvciBmaXJlZm94XG4gIGRpdi5zdHlsZShcIndoaXRlLXNwYWNlXCIsIFwibm93cmFwXCIpO1xuXG4gIC8vIFRPRE8gZmluZCBhIGJldHRlciB3YXkgdG8gZ2V0IGRpbWVuc2lvbnMgZm9yIGZvcmVpZ25PYmplY3RzLi4uXG4gIHZhciB3LCBoO1xuICBkaXZcbiAgICAuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHcgPSB0aGlzLmNsaWVudFdpZHRoO1xuICAgICAgaCA9IHRoaXMuY2xpZW50SGVpZ2h0O1xuICAgIH0pO1xuXG4gIGZvXG4gICAgLmF0dHIoXCJ3aWR0aFwiLCB3KVxuICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGgpO1xuXG4gIHJldHVybiBmbztcbn1cbiIsInZhciBhZGRUZXh0TGFiZWwgPSByZXF1aXJlKFwiLi9hZGQtdGV4dC1sYWJlbFwiKSxcbiAgICBhZGRIdG1sTGFiZWwgPSByZXF1aXJlKFwiLi9hZGQtaHRtbC1sYWJlbFwiKSxcbiAgICBhZGRTVkdMYWJlbCAgPSByZXF1aXJlKFwiLi9hZGQtc3ZnLWxhYmVsXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFkZExhYmVsO1xuXG5mdW5jdGlvbiBhZGRMYWJlbChyb290LCBub2RlLCBsb2NhdGlvbikge1xuICB2YXIgbGFiZWwgPSBub2RlLmxhYmVsO1xuICB2YXIgbGFiZWxTdmcgPSByb290LmFwcGVuZChcImdcIik7XG5cbiAgLy8gQWxsb3cgdGhlIGxhYmVsIHRvIGJlIGEgc3RyaW5nLCBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIERPTSBlbGVtZW50LCBvclxuICAvLyBhIERPTSBlbGVtZW50IGl0c2VsZi5cbiAgaWYgKG5vZGUubGFiZWxUeXBlID09PSBcInN2Z1wiKSB7XG4gICAgYWRkU1ZHTGFiZWwobGFiZWxTdmcsIG5vZGUpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBsYWJlbCAhPT0gXCJzdHJpbmdcIiB8fCBub2RlLmxhYmVsVHlwZSA9PT0gXCJodG1sXCIpIHtcbiAgICBhZGRIdG1sTGFiZWwobGFiZWxTdmcsIG5vZGUpO1xuICB9IGVsc2Uge1xuICAgIGFkZFRleHRMYWJlbChsYWJlbFN2Zywgbm9kZSk7XG4gIH1cblxuICB2YXIgbGFiZWxCQm94ID0gbGFiZWxTdmcubm9kZSgpLmdldEJCb3goKTtcbiAgc3dpdGNoKGxvY2F0aW9uKSB7XG4gICAgY2FzZSBcInRvcFwiOlxuICAgICAgeSA9ICgtbm9kZS5oZWlnaHQgLyAyKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJib3R0b21cIjpcbiAgICAgIHkgPSAobm9kZS5oZWlnaHQgLyAyKSAtIGxhYmVsQkJveC5oZWlnaHQ7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgeSA9ICgtbGFiZWxCQm94LmhlaWdodCAvIDIpO1xuICB9XG4gIGxhYmVsU3ZnLmF0dHIoXCJ0cmFuc2Zvcm1cIixcbiAgICAgICAgICAgICAgICBcInRyYW5zbGF0ZShcIiArICgtbGFiZWxCQm94LndpZHRoIC8gMikgKyBcIixcIiArIHkgKyBcIilcIik7XG5cbiAgcmV0dXJuIGxhYmVsU3ZnO1xufVxuIiwidmFyIHV0aWwgPSByZXF1aXJlKFwiLi4vdXRpbFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBhZGRTVkdMYWJlbDtcblxuZnVuY3Rpb24gYWRkU1ZHTGFiZWwocm9vdCwgbm9kZSkge1xuICB2YXIgZG9tTm9kZSA9IHJvb3Q7XG5cbiAgZG9tTm9kZS5ub2RlKCkuYXBwZW5kQ2hpbGQobm9kZS5sYWJlbCk7XG5cbiAgdXRpbC5hcHBseVN0eWxlKGRvbU5vZGUsIG5vZGUubGFiZWxTdHlsZSk7XG5cbiAgcmV0dXJuIGRvbU5vZGU7XG59XG4iLCJ2YXIgdXRpbCA9IHJlcXVpcmUoXCIuLi91dGlsXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFkZFRleHRMYWJlbDtcblxuLypcbiAqIEF0dGFjaGVzIGEgdGV4dCBsYWJlbCB0byB0aGUgc3BlY2lmaWVkIHJvb3QuIEhhbmRsZXMgZXNjYXBlIHNlcXVlbmNlcy5cbiAqL1xuZnVuY3Rpb24gYWRkVGV4dExhYmVsKHJvb3QsIG5vZGUpIHtcbiAgdmFyIGRvbU5vZGUgPSByb290LmFwcGVuZChcInRleHRcIik7XG5cbiAgdmFyIGxpbmVzID0gcHJvY2Vzc0VzY2FwZVNlcXVlbmNlcyhub2RlLmxhYmVsKS5zcGxpdChcIlxcblwiKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgIGRvbU5vZGVcbiAgICAgIC5hcHBlbmQoXCJ0c3BhblwiKVxuICAgICAgICAuYXR0cihcInhtbDpzcGFjZVwiLCBcInByZXNlcnZlXCIpXG4gICAgICAgIC5hdHRyKFwiZHlcIiwgXCIxZW1cIilcbiAgICAgICAgLmF0dHIoXCJ4XCIsIFwiMVwiKVxuICAgICAgICAudGV4dChsaW5lc1tpXSk7XG4gIH1cblxuICB1dGlsLmFwcGx5U3R5bGUoZG9tTm9kZSwgbm9kZS5sYWJlbFN0eWxlKTtcblxuICByZXR1cm4gZG9tTm9kZTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0VzY2FwZVNlcXVlbmNlcyh0ZXh0KSB7XG4gIHZhciBuZXdUZXh0ID0gXCJcIixcbiAgICAgIGVzY2FwZWQgPSBmYWxzZSxcbiAgICAgIGNoO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRleHQubGVuZ3RoOyArK2kpIHtcbiAgICBjaCA9IHRleHRbaV07XG4gICAgaWYgKGVzY2FwZWQpIHtcbiAgICAgIHN3aXRjaChjaCkge1xuICAgICAgICBjYXNlIFwiblwiOiBuZXdUZXh0ICs9IFwiXFxuXCI7IGJyZWFrO1xuICAgICAgICBkZWZhdWx0OiBuZXdUZXh0ICs9IGNoO1xuICAgICAgfVxuICAgICAgZXNjYXBlZCA9IGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoY2ggPT09IFwiXFxcXFwiKSB7XG4gICAgICBlc2NhcGVkID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV3VGV4dCArPSBjaDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG5ld1RleHQ7XG59XG4iLCIvKiBnbG9iYWwgd2luZG93ICovXG5cbnZhciBsb2Rhc2g7XG5cbmlmIChyZXF1aXJlKSB7XG4gIHRyeSB7XG4gICAgbG9kYXNoID0gcmVxdWlyZShcImxvZGFzaFwiKTtcbiAgfSBjYXRjaCAoZSkge31cbn1cblxuaWYgKCFsb2Rhc2gpIHtcbiAgbG9kYXNoID0gd2luZG93Ll87XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbG9kYXNoO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB1dGlsID0gcmVxdWlyZShcIi4vdXRpbFwiKSxcbiAgICBkMyA9IHJlcXVpcmUoXCIuL2QzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBvc2l0aW9uQ2x1c3RlcnM7XG5cbmZ1bmN0aW9uIHBvc2l0aW9uQ2x1c3RlcnMoc2VsZWN0aW9uLCBnKSB7XG4gIHZhciBjcmVhdGVkID0gc2VsZWN0aW9uLmZpbHRlcihmdW5jdGlvbigpIHsgcmV0dXJuICFkMy5zZWxlY3QodGhpcykuY2xhc3NlZChcInVwZGF0ZVwiKTsgfSk7XG5cbiAgZnVuY3Rpb24gdHJhbnNsYXRlKHYpIHtcbiAgICB2YXIgbm9kZSA9IGcubm9kZSh2KTtcbiAgICByZXR1cm4gXCJ0cmFuc2xhdGUoXCIgKyBub2RlLnggKyBcIixcIiArIG5vZGUueSArIFwiKVwiO1xuICB9XG5cbiAgY3JlYXRlZC5hdHRyKFwidHJhbnNmb3JtXCIsIHRyYW5zbGF0ZSk7XG5cbiAgdXRpbC5hcHBseVRyYW5zaXRpb24oc2VsZWN0aW9uLCBnKVxuICAgICAgLnN0eWxlKFwib3BhY2l0eVwiLCAxKVxuICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgdHJhbnNsYXRlKTtcblxuICB1dGlsLmFwcGx5VHJhbnNpdGlvbihjcmVhdGVkLnNlbGVjdEFsbChcInJlY3RcIiksIGcpXG4gICAgICAuYXR0cihcIndpZHRoXCIsIGZ1bmN0aW9uKHYpIHsgcmV0dXJuIGcubm9kZSh2KS53aWR0aDsgfSlcbiAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGZ1bmN0aW9uKHYpIHsgcmV0dXJuIGcubm9kZSh2KS5oZWlnaHQ7IH0pXG4gICAgICAuYXR0cihcInhcIiwgZnVuY3Rpb24odikge1xuICAgICAgICB2YXIgbm9kZSA9IGcubm9kZSh2KTtcbiAgICAgICAgcmV0dXJuIC1ub2RlLndpZHRoIC8gMjtcbiAgICAgIH0pXG4gICAgICAuYXR0cihcInlcIiwgZnVuY3Rpb24odikge1xuICAgICAgICB2YXIgbm9kZSA9IGcubm9kZSh2KTtcbiAgICAgICAgcmV0dXJuIC1ub2RlLmhlaWdodCAvIDI7XG4gICAgICB9KTtcblxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB1dGlsID0gcmVxdWlyZShcIi4vdXRpbFwiKSxcbiAgICBkMyA9IHJlcXVpcmUoXCIuL2QzXCIpLFxuICAgIF8gPSByZXF1aXJlKFwiLi9sb2Rhc2hcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gcG9zaXRpb25FZGdlTGFiZWxzO1xuXG5mdW5jdGlvbiBwb3NpdGlvbkVkZ2VMYWJlbHMoc2VsZWN0aW9uLCBnKSB7XG4gIHZhciBjcmVhdGVkID0gc2VsZWN0aW9uLmZpbHRlcihmdW5jdGlvbigpIHsgcmV0dXJuICFkMy5zZWxlY3QodGhpcykuY2xhc3NlZChcInVwZGF0ZVwiKTsgfSk7XG5cbiAgZnVuY3Rpb24gdHJhbnNsYXRlKGUpIHtcbiAgICB2YXIgZWRnZSA9IGcuZWRnZShlKTtcbiAgICByZXR1cm4gXy5oYXMoZWRnZSwgXCJ4XCIpID8gXCJ0cmFuc2xhdGUoXCIgKyBlZGdlLnggKyBcIixcIiArIGVkZ2UueSArIFwiKVwiIDogXCJcIjtcbiAgfVxuXG4gIGNyZWF0ZWQuYXR0cihcInRyYW5zZm9ybVwiLCB0cmFuc2xhdGUpO1xuXG4gIHV0aWwuYXBwbHlUcmFuc2l0aW9uKHNlbGVjdGlvbiwgZylcbiAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIDEpXG4gICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgdHJhbnNsYXRlKTtcbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoXCIuL3V0aWxcIiksXG4gICAgZDMgPSByZXF1aXJlKFwiLi9kM1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBwb3NpdGlvbk5vZGVzO1xuXG5mdW5jdGlvbiBwb3NpdGlvbk5vZGVzKHNlbGVjdGlvbiwgZykge1xuICB2YXIgY3JlYXRlZCA9IHNlbGVjdGlvbi5maWx0ZXIoZnVuY3Rpb24oKSB7IHJldHVybiAhZDMuc2VsZWN0KHRoaXMpLmNsYXNzZWQoXCJ1cGRhdGVcIik7IH0pO1xuXG4gIGZ1bmN0aW9uIHRyYW5zbGF0ZSh2KSB7XG4gICAgdmFyIG5vZGUgPSBnLm5vZGUodik7XG4gICAgcmV0dXJuIFwidHJhbnNsYXRlKFwiICsgbm9kZS54ICsgXCIsXCIgKyBub2RlLnkgKyBcIilcIjtcbiAgfVxuXG4gIGNyZWF0ZWQuYXR0cihcInRyYW5zZm9ybVwiLCB0cmFuc2xhdGUpO1xuXG4gIHV0aWwuYXBwbHlUcmFuc2l0aW9uKHNlbGVjdGlvbiwgZylcbiAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIDEpXG4gICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgdHJhbnNsYXRlKTtcbn1cbiIsInZhciBfID0gcmVxdWlyZShcIi4vbG9kYXNoXCIpLFxuICAgIGxheW91dCA9IHJlcXVpcmUoXCIuL2RhZ3JlXCIpLmxheW91dDtcblxubW9kdWxlLmV4cG9ydHMgPSByZW5kZXI7XG5cbi8vIFRoaXMgZGVzaWduIGlzIGJhc2VkIG9uIGh0dHA6Ly9ib3N0Lm9ja3Mub3JnL21pa2UvY2hhcnQvLlxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICB2YXIgY3JlYXRlTm9kZXMgPSByZXF1aXJlKFwiLi9jcmVhdGUtbm9kZXNcIiksXG4gICAgICBjcmVhdGVDbHVzdGVycyA9IHJlcXVpcmUoXCIuL2NyZWF0ZS1jbHVzdGVyc1wiKSxcbiAgICAgIGNyZWF0ZUVkZ2VMYWJlbHMgPSByZXF1aXJlKFwiLi9jcmVhdGUtZWRnZS1sYWJlbHNcIiksXG4gICAgICBjcmVhdGVFZGdlUGF0aHMgPSByZXF1aXJlKFwiLi9jcmVhdGUtZWRnZS1wYXRoc1wiKSxcbiAgICAgIHBvc2l0aW9uTm9kZXMgPSByZXF1aXJlKFwiLi9wb3NpdGlvbi1ub2Rlc1wiKSxcbiAgICAgIHBvc2l0aW9uRWRnZUxhYmVscyA9IHJlcXVpcmUoXCIuL3Bvc2l0aW9uLWVkZ2UtbGFiZWxzXCIpLFxuICAgICAgcG9zaXRpb25DbHVzdGVycyA9IHJlcXVpcmUoXCIuL3Bvc2l0aW9uLWNsdXN0ZXJzXCIpLFxuICAgICAgc2hhcGVzID0gcmVxdWlyZShcIi4vc2hhcGVzXCIpLFxuICAgICAgYXJyb3dzID0gcmVxdWlyZShcIi4vYXJyb3dzXCIpO1xuXG4gIHZhciBmbiA9IGZ1bmN0aW9uKHN2ZywgZykge1xuICAgIHByZVByb2Nlc3NHcmFwaChnKTtcblxuICAgIHZhciBvdXRwdXRHcm91cCA9IGNyZWF0ZU9yU2VsZWN0R3JvdXAoc3ZnLCBcIm91dHB1dFwiKSxcbiAgICAgICAgY2x1c3RlcnNHcm91cCA9IGNyZWF0ZU9yU2VsZWN0R3JvdXAob3V0cHV0R3JvdXAsIFwiY2x1c3RlcnNcIiksXG4gICAgICAgIGVkZ2VQYXRoc0dyb3VwID0gY3JlYXRlT3JTZWxlY3RHcm91cChvdXRwdXRHcm91cCwgXCJlZGdlUGF0aHNcIiksXG4gICAgICAgIGVkZ2VMYWJlbHMgPSBjcmVhdGVFZGdlTGFiZWxzKGNyZWF0ZU9yU2VsZWN0R3JvdXAob3V0cHV0R3JvdXAsIFwiZWRnZUxhYmVsc1wiKSwgZyksXG4gICAgICAgIG5vZGVzID0gY3JlYXRlTm9kZXMoY3JlYXRlT3JTZWxlY3RHcm91cChvdXRwdXRHcm91cCwgXCJub2Rlc1wiKSwgZywgc2hhcGVzKTtcblxuICAgIGxheW91dChnKTtcblxuICAgIHBvc2l0aW9uTm9kZXMobm9kZXMsIGcpO1xuICAgIHBvc2l0aW9uRWRnZUxhYmVscyhlZGdlTGFiZWxzLCBnKTtcbiAgICBjcmVhdGVFZGdlUGF0aHMoZWRnZVBhdGhzR3JvdXAsIGcsIGFycm93cyk7XG4gICAgY3JlYXRlQ2x1c3RlcnMoY2x1c3RlcnNHcm91cCwgZyk7XG4gICAgcG9zaXRpb25DbHVzdGVycyhjbHVzdGVyc0dyb3VwLnNlbGVjdEFsbChcImcuY2x1c3RlclwiKSwgZyk7XG5cbiAgICBwb3N0UHJvY2Vzc0dyYXBoKGcpO1xuICB9O1xuXG4gIGZuLmNyZWF0ZU5vZGVzID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBjcmVhdGVOb2RlcztcbiAgICBjcmVhdGVOb2RlcyA9IHZhbHVlO1xuICAgIHJldHVybiBmbjtcbiAgfTtcblxuICBmbi5jcmVhdGVDbHVzdGVycyA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gY3JlYXRlQ2x1c3RlcnM7XG4gICAgY3JlYXRlQ2x1c3RlcnMgPSB2YWx1ZTtcbiAgICByZXR1cm4gZm47XG4gIH07XG5cbiAgZm4uY3JlYXRlRWRnZUxhYmVscyA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gY3JlYXRlRWRnZUxhYmVscztcbiAgICBjcmVhdGVFZGdlTGFiZWxzID0gdmFsdWU7XG4gICAgcmV0dXJuIGZuO1xuICB9O1xuXG4gIGZuLmNyZWF0ZUVkZ2VQYXRocyA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gY3JlYXRlRWRnZVBhdGhzO1xuICAgIGNyZWF0ZUVkZ2VQYXRocyA9IHZhbHVlO1xuICAgIHJldHVybiBmbjtcbiAgfTtcblxuICBmbi5zaGFwZXMgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHNoYXBlcztcbiAgICBzaGFwZXMgPSB2YWx1ZTtcbiAgICByZXR1cm4gZm47XG4gIH07XG5cbiAgZm4uYXJyb3dzID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBhcnJvd3M7XG4gICAgYXJyb3dzID0gdmFsdWU7XG4gICAgcmV0dXJuIGZuO1xuICB9O1xuXG4gIHJldHVybiBmbjtcbn1cblxudmFyIE5PREVfREVGQVVMVF9BVFRSUyA9IHtcbiAgcGFkZGluZ0xlZnQ6IDEwLFxuICBwYWRkaW5nUmlnaHQ6IDEwLFxuICBwYWRkaW5nVG9wOiAxMCxcbiAgcGFkZGluZ0JvdHRvbTogMTAsXG4gIHJ4OiAwLFxuICByeTogMCxcbiAgc2hhcGU6IFwicmVjdFwiXG59O1xuXG52YXIgRURHRV9ERUZBVUxUX0FUVFJTID0ge1xuICBhcnJvd2hlYWQ6IFwibm9ybWFsXCIsXG4gIGxpbmVJbnRlcnBvbGF0ZTogXCJsaW5lYXJcIlxufTtcblxuZnVuY3Rpb24gcHJlUHJvY2Vzc0dyYXBoKGcpIHtcbiAgZy5ub2RlcygpLmZvckVhY2goZnVuY3Rpb24odikge1xuICAgIHZhciBub2RlID0gZy5ub2RlKHYpO1xuICAgIGlmICghXy5oYXMobm9kZSwgXCJsYWJlbFwiKSkgeyBub2RlLmxhYmVsID0gdjsgfVxuXG4gICAgaWYgKF8uaGFzKG5vZGUsIFwicGFkZGluZ1hcIikpIHtcbiAgICAgIF8uZGVmYXVsdHMobm9kZSwge1xuICAgICAgICBwYWRkaW5nTGVmdDogbm9kZS5wYWRkaW5nWCxcbiAgICAgICAgcGFkZGluZ1JpZ2h0OiBub2RlLnBhZGRpbmdYXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoXy5oYXMobm9kZSwgXCJwYWRkaW5nWVwiKSkge1xuICAgICAgXy5kZWZhdWx0cyhub2RlLCB7XG4gICAgICAgIHBhZGRpbmdUb3A6IG5vZGUucGFkZGluZ1ksXG4gICAgICAgIHBhZGRpbmdCb3R0b206IG5vZGUucGFkZGluZ1lcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChfLmhhcyhub2RlLCBcInBhZGRpbmdcIikpIHtcbiAgICAgIF8uZGVmYXVsdHMobm9kZSwge1xuICAgICAgICBwYWRkaW5nTGVmdDogbm9kZS5wYWRkaW5nLFxuICAgICAgICBwYWRkaW5nUmlnaHQ6IG5vZGUucGFkZGluZyxcbiAgICAgICAgcGFkZGluZ1RvcDogbm9kZS5wYWRkaW5nLFxuICAgICAgICBwYWRkaW5nQm90dG9tOiBub2RlLnBhZGRpbmdcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIF8uZGVmYXVsdHMobm9kZSwgTk9ERV9ERUZBVUxUX0FUVFJTKTtcblxuICAgIF8uZWFjaChbXCJwYWRkaW5nTGVmdFwiLCBcInBhZGRpbmdSaWdodFwiLCBcInBhZGRpbmdUb3BcIiwgXCJwYWRkaW5nQm90dG9tXCJdLCBmdW5jdGlvbihrKSB7XG4gICAgICBub2RlW2tdID0gTnVtYmVyKG5vZGVba10pO1xuICAgIH0pO1xuXG4gICAgLy8gU2F2ZSBkaW1lbnNpb25zIGZvciByZXN0b3JlIGR1cmluZyBwb3N0LXByb2Nlc3NpbmdcbiAgICBpZiAoXy5oYXMobm9kZSwgXCJ3aWR0aFwiKSkgeyBub2RlLl9wcmV2V2lkdGggPSBub2RlLndpZHRoOyB9XG4gICAgaWYgKF8uaGFzKG5vZGUsIFwiaGVpZ2h0XCIpKSB7IG5vZGUuX3ByZXZIZWlnaHQgPSBub2RlLmhlaWdodDsgfVxuICB9KTtcblxuICBnLmVkZ2VzKCkuZm9yRWFjaChmdW5jdGlvbihlKSB7XG4gICAgdmFyIGVkZ2UgPSBnLmVkZ2UoZSk7XG4gICAgaWYgKCFfLmhhcyhlZGdlLCBcImxhYmVsXCIpKSB7IGVkZ2UubGFiZWwgPSBcIlwiOyB9XG4gICAgXy5kZWZhdWx0cyhlZGdlLCBFREdFX0RFRkFVTFRfQVRUUlMpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcG9zdFByb2Nlc3NHcmFwaChnKSB7XG4gIF8uZWFjaChnLm5vZGVzKCksIGZ1bmN0aW9uKHYpIHtcbiAgICB2YXIgbm9kZSA9IGcubm9kZSh2KTtcblxuICAgIC8vIFJlc3RvcmUgb3JpZ2luYWwgZGltZW5zaW9uc1xuICAgIGlmIChfLmhhcyhub2RlLCBcIl9wcmV2V2lkdGhcIikpIHtcbiAgICAgIG5vZGUud2lkdGggPSBub2RlLl9wcmV2V2lkdGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSBub2RlLndpZHRoO1xuICAgIH1cblxuICAgIGlmIChfLmhhcyhub2RlLCBcIl9wcmV2SGVpZ2h0XCIpKSB7XG4gICAgICBub2RlLmhlaWdodCA9IG5vZGUuX3ByZXZIZWlnaHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSBub2RlLmhlaWdodDtcbiAgICB9XG5cbiAgICBkZWxldGUgbm9kZS5fcHJldldpZHRoO1xuICAgIGRlbGV0ZSBub2RlLl9wcmV2SGVpZ2h0O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlT3JTZWxlY3RHcm91cChyb290LCBuYW1lKSB7XG4gIHZhciBzZWxlY3Rpb24gPSByb290LnNlbGVjdChcImcuXCIgKyBuYW1lKTtcbiAgaWYgKHNlbGVjdGlvbi5lbXB0eSgpKSB7XG4gICAgc2VsZWN0aW9uID0gcm9vdC5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBuYW1lKTtcbiAgfVxuICByZXR1cm4gc2VsZWN0aW9uO1xufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBpbnRlcnNlY3RSZWN0ID0gcmVxdWlyZShcIi4vaW50ZXJzZWN0L2ludGVyc2VjdC1yZWN0XCIpLFxuICAgIGludGVyc2VjdEVsbGlwc2UgPSByZXF1aXJlKFwiLi9pbnRlcnNlY3QvaW50ZXJzZWN0LWVsbGlwc2VcIiksXG4gICAgaW50ZXJzZWN0Q2lyY2xlID0gcmVxdWlyZShcIi4vaW50ZXJzZWN0L2ludGVyc2VjdC1jaXJjbGVcIiksXG4gICAgaW50ZXJzZWN0UG9seWdvbiA9IHJlcXVpcmUoXCIuL2ludGVyc2VjdC9pbnRlcnNlY3QtcG9seWdvblwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHJlY3Q6IHJlY3QsXG4gIGVsbGlwc2U6IGVsbGlwc2UsXG4gIGNpcmNsZTogY2lyY2xlLFxuICBkaWFtb25kOiBkaWFtb25kXG59O1xuXG5mdW5jdGlvbiByZWN0KHBhcmVudCwgYmJveCwgbm9kZSkge1xuICB2YXIgc2hhcGVTdmcgPSBwYXJlbnQuaW5zZXJ0KFwicmVjdFwiLCBcIjpmaXJzdC1jaGlsZFwiKVxuICAgICAgICAuYXR0cihcInJ4XCIsIG5vZGUucngpXG4gICAgICAgIC5hdHRyKFwicnlcIiwgbm9kZS5yeSlcbiAgICAgICAgLmF0dHIoXCJ4XCIsIC1iYm94LndpZHRoIC8gMilcbiAgICAgICAgLmF0dHIoXCJ5XCIsIC1iYm94LmhlaWdodCAvIDIpXG4gICAgICAgIC5hdHRyKFwid2lkdGhcIiwgYmJveC53aWR0aClcbiAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgYmJveC5oZWlnaHQpO1xuXG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICByZXR1cm4gaW50ZXJzZWN0UmVjdChub2RlLCBwb2ludCk7XG4gIH07XG5cbiAgcmV0dXJuIHNoYXBlU3ZnO1xufVxuXG5mdW5jdGlvbiBlbGxpcHNlKHBhcmVudCwgYmJveCwgbm9kZSkge1xuICB2YXIgcnggPSBiYm94LndpZHRoIC8gMixcbiAgICAgIHJ5ID0gYmJveC5oZWlnaHQgLyAyLFxuICAgICAgc2hhcGVTdmcgPSBwYXJlbnQuaW5zZXJ0KFwiZWxsaXBzZVwiLCBcIjpmaXJzdC1jaGlsZFwiKVxuICAgICAgICAuYXR0cihcInhcIiwgLWJib3gud2lkdGggLyAyKVxuICAgICAgICAuYXR0cihcInlcIiwgLWJib3guaGVpZ2h0IC8gMilcbiAgICAgICAgLmF0dHIoXCJyeFwiLCByeClcbiAgICAgICAgLmF0dHIoXCJyeVwiLCByeSk7XG5cbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwb2ludCkge1xuICAgIHJldHVybiBpbnRlcnNlY3RFbGxpcHNlKG5vZGUsIHJ4LCByeSwgcG9pbnQpO1xuICB9O1xuXG4gIHJldHVybiBzaGFwZVN2Zztcbn1cblxuZnVuY3Rpb24gY2lyY2xlKHBhcmVudCwgYmJveCwgbm9kZSkge1xuICB2YXIgciA9IE1hdGgubWF4KGJib3gud2lkdGgsIGJib3guaGVpZ2h0KSAvIDIsXG4gICAgICBzaGFwZVN2ZyA9IHBhcmVudC5pbnNlcnQoXCJjaXJjbGVcIiwgXCI6Zmlyc3QtY2hpbGRcIilcbiAgICAgICAgLmF0dHIoXCJ4XCIsIC1iYm94LndpZHRoIC8gMilcbiAgICAgICAgLmF0dHIoXCJ5XCIsIC1iYm94LmhlaWdodCAvIDIpXG4gICAgICAgIC5hdHRyKFwiclwiLCByKTtcblxuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgcmV0dXJuIGludGVyc2VjdENpcmNsZShub2RlLCByLCBwb2ludCk7XG4gIH07XG5cbiAgcmV0dXJuIHNoYXBlU3ZnO1xufVxuXG4vLyBDaXJjdW1zY3JpYmUgYW4gZWxsaXBzZSBmb3IgdGhlIGJvdW5kaW5nIGJveCB3aXRoIGEgZGlhbW9uZCBzaGFwZS4gSSBkZXJpdmVkXG4vLyB0aGUgZnVuY3Rpb24gdG8gY2FsY3VsYXRlIHRoZSBkaWFtb25kIHNoYXBlIGZyb206XG4vLyBodHRwOi8vbWF0aGZvcnVtLm9yZy9rYi9tZXNzYWdlLmpzcGE/bWVzc2FnZUlEPTM3NTAyMzZcbmZ1bmN0aW9uIGRpYW1vbmQocGFyZW50LCBiYm94LCBub2RlKSB7XG4gIHZhciB3ID0gKGJib3gud2lkdGggKiBNYXRoLlNRUlQyKSAvIDIsXG4gICAgICBoID0gKGJib3guaGVpZ2h0ICogTWF0aC5TUVJUMikgLyAyLFxuICAgICAgcG9pbnRzID0gW1xuICAgICAgICB7IHg6ICAwLCB5OiAtaCB9LFxuICAgICAgICB7IHg6IC13LCB5OiAgMCB9LFxuICAgICAgICB7IHg6ICAwLCB5OiAgaCB9LFxuICAgICAgICB7IHg6ICB3LCB5OiAgMCB9XG4gICAgICBdLFxuICAgICAgc2hhcGVTdmcgPSBwYXJlbnQuaW5zZXJ0KFwicG9seWdvblwiLCBcIjpmaXJzdC1jaGlsZFwiKVxuICAgICAgICAuYXR0cihcInBvaW50c1wiLCBwb2ludHMubWFwKGZ1bmN0aW9uKHApIHsgcmV0dXJuIHAueCArIFwiLFwiICsgcC55OyB9KS5qb2luKFwiIFwiKSk7XG5cbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuIGludGVyc2VjdFBvbHlnb24obm9kZSwgcG9pbnRzLCBwKTtcbiAgfTtcblxuICByZXR1cm4gc2hhcGVTdmc7XG59XG4iLCJ2YXIgXyA9IHJlcXVpcmUoXCIuL2xvZGFzaFwiKTtcblxuLy8gUHVibGljIHV0aWxpdHkgZnVuY3Rpb25zXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNTdWJncmFwaDogaXNTdWJncmFwaCxcbiAgZWRnZVRvSWQ6IGVkZ2VUb0lkLFxuICBhcHBseVN0eWxlOiBhcHBseVN0eWxlLFxuICBhcHBseUNsYXNzOiBhcHBseUNsYXNzLFxuICBhcHBseVRyYW5zaXRpb246IGFwcGx5VHJhbnNpdGlvblxufTtcblxuLypcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIG5vZGUgaW4gdGhlIGdyYXBoIGlzIGEgc3ViZ3JhcGggbm9kZS4gQVxuICogc3ViZ3JhcGggbm9kZSBpcyBvbmUgdGhhdCBjb250YWlucyBvdGhlciBub2Rlcy5cbiAqL1xuZnVuY3Rpb24gaXNTdWJncmFwaChnLCB2KSB7XG4gIHJldHVybiAhIWcuY2hpbGRyZW4odikubGVuZ3RoO1xufVxuXG5mdW5jdGlvbiBlZGdlVG9JZChlKSB7XG4gIHJldHVybiBlc2NhcGVJZChlLnYpICsgXCI6XCIgKyBlc2NhcGVJZChlLncpICsgXCI6XCIgKyBlc2NhcGVJZChlLm5hbWUpO1xufVxuXG52YXIgSURfREVMSU0gPSAvOi9nO1xuZnVuY3Rpb24gZXNjYXBlSWQoc3RyKSB7XG4gIHJldHVybiBzdHIgPyBTdHJpbmcoc3RyKS5yZXBsYWNlKElEX0RFTElNLCBcIlxcXFw6XCIpIDogXCJcIjtcbn1cblxuZnVuY3Rpb24gYXBwbHlTdHlsZShkb20sIHN0eWxlRm4pIHtcbiAgaWYgKHN0eWxlRm4pIHtcbiAgICBkb20uYXR0cihcInN0eWxlXCIsIHN0eWxlRm4pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFwcGx5Q2xhc3MoZG9tLCBjbGFzc0ZuLCBvdGhlckNsYXNzZXMpIHtcbiAgaWYgKGNsYXNzRm4pIHtcbiAgICBkb21cbiAgICAgIC5hdHRyKFwiY2xhc3NcIiwgY2xhc3NGbilcbiAgICAgIC5hdHRyKFwiY2xhc3NcIiwgb3RoZXJDbGFzc2VzICsgXCIgXCIgKyBkb20uYXR0cihcImNsYXNzXCIpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhcHBseVRyYW5zaXRpb24oc2VsZWN0aW9uLCBnKSB7XG4gIHZhciBncmFwaCA9IGcuZ3JhcGgoKTtcblxuICBpZiAoXy5pc1BsYWluT2JqZWN0KGdyYXBoKSkge1xuICAgIHZhciB0cmFuc2l0aW9uID0gZ3JhcGgudHJhbnNpdGlvbjtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKHRyYW5zaXRpb24pKSB7XG4gICAgICByZXR1cm4gdHJhbnNpdGlvbihzZWxlY3Rpb24pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzZWxlY3Rpb247XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IFwiMC40LjVcIjtcbiJdfQ==
