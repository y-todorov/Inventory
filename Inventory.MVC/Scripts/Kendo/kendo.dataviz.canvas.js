/*
* Kendo UI v2014.2.903 (http://www.telerik.com/kendo-ui)
* Copyright 2014 Telerik AD. All rights reserved.
*
* Kendo UI commercial licenses may be obtained at
* http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
* If you do not own a commercial license, this file shall be governed by the trial license terms.
*/
(function(f, define){
    define([ "./kendo.dataviz.core" ], f);
})(function(){

(function () {

    // Imports ================================================================
    var $ = jQuery,
        math = Math,

        kendo = window.kendo,
        dataviz = kendo.dataviz,
        Box2D = dataviz.Box2D,
        Color = dataviz.Color,
        Point2D = dataviz.Point2D,
        Ring = dataviz.Ring,
        ViewBase = dataviz.ViewBase,
        ViewElement = dataviz.ViewElement,
        deepExtend = kendo.deepExtend,
        round = dataviz.round,
        renderTemplate = dataviz.renderTemplate;

    // Constants ==============================================================
    var BUTT = "butt",
        COORD_PRECISION = dataviz.COORD_PRECISION,
        DASH_ARRAYS = dataviz.DASH_ARRAYS,
        DEFAULT_WIDTH = dataviz.DEFAULT_WIDTH,
        DEFAULT_HEIGHT = dataviz.DEFAULT_HEIGHT,
        DEFAULT_FONT = dataviz.DEFAULT_FONT,
        DEG_TO_RAD = math.PI / 180,
        TWO_PI = math.PI * 2,
        LINEAR = "linear",
        RADIAL = "radial",
        SOLID = "solid",
        SQUARE = "square";

    var CANVAS_TEMPLATE = renderTemplate(
        "<canvas width='#= d.options.width #px' height='#= d.options.height #px' " +
        "style='position: relative; display: #= d.display #;'></canvas>"
    );

    // View ===================================================================
    var CanvasView = ViewBase.extend({
        init: function(options) {
            var view = this;

            ViewBase.fn.init.call(view, options);

            view.display = view.options.inline ? "inline" : "block";
        },

        options: {
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT
        },

        renderTo: function(container) {
            var view = this,
                options = view.options,
                canvas;

            canvas = container.firstElementChild;
            if (!canvas || canvas.tagName.toLowerCase() !== "canvas") {
                container.innerHTML = CANVAS_TEMPLATE(this);
                canvas = container.firstElementChild;
            } else {
                $(canvas).siblings().remove();
                canvas.width = options.width;
                canvas.height = options.height;
            }

            view._viewElement = canvas;
            view.renderContent(canvas.getContext("2d"));

            return canvas;
        },

        replace: function(model) {
            var view = this,
                canvas = view._viewElement,
                bbox = model.box,
                ctx;

            if (canvas && bbox) {
                ctx = canvas.getContext("2d");
                ctx.clearRect(bbox.x1, bbox.y1, bbox.width(), bbox.height());
                model.getViewElements(view)[0].render(ctx);
            }
        },

        renderContent: function(context) {
            var element = this,
                sortedChildren = element.sortChildren(),
                childrenCount = sortedChildren.length,
                clipPath = element.clipPath,
                i;

            if (clipPath) {
                context.save();
                clipPath.render(context);
            }

            for (i = 0; i < childrenCount; i++) {
                sortedChildren[i].render(context);
            }

            if (clipPath) {
                context.restore();
            }
        },

        applyDefinitions: function (element) {
            if (element.options.clipPathId) {
                element.clipPath = this.definitions[element.options.clipPathId];
            }
            return element;
        },

        createGroup: function(options) {
             return this.applyDefinitions(new CanvasGroup(options));
        },

        createClipPath: function(id, box) {
            var view = this,
                clipPath = view.definitions[id];

            if (!clipPath) {
                clipPath = new CanvasClipPath({id: id});
                view.definitions[id] = clipPath;
            }

            clipPath.children = [view.createRect(box, {fill: "none"})];

            return clipPath;
        },

        createText: function(content, options) {
            return new CanvasText(content, options);
        },

        createTextBox: function(options) {
             return new CanvasTextBox(options);
        },

        createRect: function(box, style) {
            return new CanvasLine(box.points(), true, this.setDefaults(style));
        },

        createCubicCurve: function(points, options, areaPoints){
             return new CanvasCubicCurve(points, options, areaPoints);
        },

        createLine: function(x1, y1, x2, y2, options) {
            return new CanvasLine([new Point2D(x1, y1), new Point2D(x2, y2)],
                false, this.setDefaults(options));
        },

        createMultiLine: function(elements, options){
            return this.decorate(
                new CanvasMultiLine(elements, false, this.setDefaults(options))
            );
        },

        createPolyline: function(points, closed, options) {
            return new CanvasLine(points, closed, this.setDefaults(options));
        },

        createCircle: function(center, radius, options) {
            return new CanvasCircle(center, radius, options);
        },

        createSector: function(sector, options) {
            return new CanvasRing(sector, options);
        },

        createRing: function(ring, options) {
            return new CanvasRing(ring, options);
        },

        createPin: function(pin, options) {
            return new CanvasPin(pin, options);
        }
    });

    var CanvasClipPath = ViewElement.extend({
        render: function (context) {
            var clipPath = this,
                children = clipPath.children,
                idx = 0, length = children.length;

            context.beginPath();
            for (; idx < length; idx++) {
                children[idx].renderPoints(context);
            }
            context.clip();
        }
    });

    var CanvasGroup = ViewElement.extend({
        render: function(context) {
            this.renderContent(context);
        },

        renderContent: CanvasView.fn.renderContent
    });

    var CanvasPath = ViewElement.extend({
        options: {
            fillOpacity: 1,
            strokeOpacity: 1,
            strokeLineCap: SQUARE
        },

        render: function(ctx) {
            var path = this,
                options = path.options;

            ctx.save();

            ctx.beginPath();
            path.renderPoints(ctx);

            path.setLineDash(ctx);
            path.setLineCap(ctx);

            if (options.fill && options.fill !== "transparent") {
                path.setFill(ctx);
                ctx.globalAlpha = options.fillOpacity;
                ctx.fill();
            }

            if (options.stroke && options.strokeWidth) {
                ctx.strokeStyle = options.stroke;
                ctx.lineWidth = options.strokeWidth;
                ctx.lineJoin = "round";
                ctx.globalAlpha = options.strokeOpacity;
                ctx.stroke();
            }

            path.renderOverlay(ctx);

            ctx.restore();
        },

        setLineDash: function(ctx) {
            var dashType = this.options.dashType,
                dashArray;

            dashType = dashType ? dashType.toLowerCase() : null;
            if (dashType && dashType != SOLID) {
                dashArray = DASH_ARRAYS[dashType];
                if (ctx.setLineDash) {
                    ctx.setLineDash(dashArray);
                } else {
                    ctx.mozDash = dashArray;
                    ctx.webkitLineDash = dashArray;
                }
            }
        },

        setLineCap: function(ctx) {
            var options = this.options,
                dashType = options.dashType;

            ctx.lineCap = (dashType && dashType !== SOLID) ?
                BUTT : options.strokeLineCap;
        },

        setFill: function(ctx) {
            var options = this.options,
                fill = options.fill;

            ctx.fillStyle = fill;
        },

        renderOverlay: function(ctx) {
            var options = this.options,
                overlay = options.overlay,
                gradient,
                def;

            if (overlay && overlay.gradient) {
                def = dataviz.Gradients[overlay.gradient];
                gradient = this.buildGradient(ctx, def);
                if (gradient) {
                    ctx.fillStyle = gradient;
                    ctx.fill();
                }
            }
        },

        renderPoints: $.noop,
        buildGradient: $.noop
    });

    var CanvasCubicCurve = CanvasPath.extend({
      init: function(points, options, areaPoints) {
        var curve = this;
        CanvasPath.fn.init.call(curve, options);

        curve.points = points;
        curve.areaPoints = areaPoints;
      },
      renderPoints: function(ctx){
         var curve = this,
            i,
            areaPoints = curve.areaPoints,
            points = curve.points;
            ctx.moveTo(points[0].x, points[0].y);
            for(i = 1; i < points.length; i+=3){
                ctx.bezierCurveTo(round(points[i].x, COORD_PRECISION), round(points[i].y,COORD_PRECISION),
                    round(points[i+1].x, COORD_PRECISION), round(points[i+1].y, COORD_PRECISION), round(points[i+2].x, COORD_PRECISION),
                    round(points[i+2].y, COORD_PRECISION));
            }

            if(areaPoints && areaPoints.length){
                for(i = 0; i < areaPoints.length; i++){
                    ctx.lineTo(round(areaPoints[i].x, COORD_PRECISION), round(areaPoints[i].y, COORD_PRECISION));
                }
                ctx.closePath();
            }
       }
    });

    var CanvasLine = CanvasPath.extend({
        init: function(points, closed, options) {
            var line = this;
            CanvasPath.fn.init.call(line, options);

            line.points = points;
            line.closed = closed;
        },

        options: {
            rotation: [0, 0, 0]
        },
        renderPoints: function(ctx){
            var line = this,
                points = line.points;
            line._renderPoints(ctx, points);
        },
        _renderPoints: function(ctx, points) {
            var line = this,
                i,
                p,
                options = line.options,
                strokeWidth = options.strokeWidth,
                shouldAlign = options.align !== false && strokeWidth && strokeWidth % 2 !== 0,
                align = shouldAlign ? alignToPixel : round;

            if (points.length === 0 || !(options.fill || options.stroke)) {
                return;
            }

            if (options.rotation[0] !== 0) {
                line.setRotation(ctx);
            }

            p = points[0];
            ctx.moveTo(align(p.x, COORD_PRECISION), align(p.y, COORD_PRECISION));

            for (i = 1; i < points.length; i++) {
                p = points[i];
                ctx.lineTo(align(p.x, COORD_PRECISION), align(p.y, COORD_PRECISION));
            }

            if (line.closed) {
                ctx.closePath();
            }
        },

        buildGradient: function(ctx, definition) {
            var bbox = this.bbox(),
                rotation = this.options.overlay.rotation,
                x = bbox.x2,
                y = bbox.y1,
                gradient;

            if (rotation === 90) {
                x = bbox.x1;
                y = bbox.y2;
            }

            if (definition && definition.type === LINEAR) {
                gradient = ctx.createLinearGradient(bbox.x1, bbox.y1, x, y);
                addGradientStops(gradient, definition.stops);
            }

            return gradient;
        },

        bbox: function() {
            var points = this.points,
                bbox = new Box2D(),
                i;

            if (points.length > 0) {
                bbox.move(points[0].x, points[0].y);
                for (i = 1; i < points.length; i++) {
                    bbox.wrapPoint(points[i]);
                }
            }

            return bbox;
        },

        setRotation: function(context) {
            var text = this,
                options = text.options,
                rotation = options.rotation,
                cx = rotation[1],
                cy = rotation[2];

            context.translate(cx, cy);
            context.rotate(rotation[0] * DEG_TO_RAD);
            context.translate(-cx, -cy);
        }
    });

    var CanvasMultiLine = CanvasLine.extend({
        renderPoints: function(ctx){
            var multiLine = this,
                elements = multiLine.points,
                idx;

            for(idx = 0; idx < elements.length; idx++){
                multiLine._renderPoints(ctx, elements[idx]);
            }
        }
    });

    var CanvasRing = CanvasPath.extend({
        init: function(config, options) {
            var ring = this;

            CanvasPath.fn.init.call(ring, options);

            ring.config = config || {};
        },

        options: {
            strokeLineCap: SQUARE
        },

        renderPoints: function(ctx) {
            var ring = this,
                config = ring.config,
                startAngle = config.startAngle,
                endAngle = config.angle + startAngle,
                r = math.max(config.r, 0),
                ir = math.max(config.ir, 0),
                c = config.c,
                startRadians = toRadians(startAngle),
                endRadians = toRadians(endAngle);

            if (startRadians === endRadians) {
                startAngle = 0;
                endAngle = 360;
                startRadians = 0;
                endRadians = 2 * Math.PI;
            }

            var firstOuterPoint = config.point(startAngle),
                secondInnerPoint = config.point(endAngle, true);

            ctx.moveTo(firstOuterPoint.x, firstOuterPoint.y);
            ctx.arc(c.x, c.y, r, startRadians, endRadians);

            if (ir > 0) {
                ctx.lineTo(secondInnerPoint.x, secondInnerPoint.y);
                ctx.arc(c.x, c.y, ir, endRadians, startRadians, true);
            } else {
                ctx.lineTo(c.x, c.y);
            }
        },

        buildGradient: function(ctx, definition) {
            var config = this.config,
                c = config.c,
                gradient;

            if (definition && definition.type === RADIAL) {
                gradient = ctx.createRadialGradient(
                    c.x, c.y, config.ir,
                    c.x, c.y, config.r
                );
                addGradientStops(gradient, definition.stops);
            }

            return gradient;
        }
    });

    var CanvasCircle = CanvasPath.extend({
        init: function(c, r, options) {
            var circle = this;
            CanvasPath.fn.init.call(circle, options);

            circle.config = new Ring(c, 0, r);
        },

        renderPoints: function(context) {
            var config = this.config,
                c = config.c;

            context.arc(c.x, c.y, config.r, 0, TWO_PI, false);
        },

        buildGradient: CanvasRing.fn.buildGradient
    });

    var CanvasPin = CanvasPath.extend({
        init: function(config, options) {
            var pin = this;

            CanvasPath.fn.init.call(pin, options);

            pin.config = config;
        },

        renderPoints: function(context) {
            var pin = this,
                config = pin.config,
                r = config.radius,
                degrees = math.PI / 180,
                arcAngle = config.arcAngle,
                height = config.height - r * (1 - math.cos(arcAngle * degrees / 2)),
                origin = config.origin;

            var rotation = pin.options.rotation;
            context.translate(rotation[1], rotation[2]);
            context.rotate(toRadians(rotation[0]));
            context.translate(rotation[1] - origin.x, rotation[2] - origin.y);
            context.rotate(toRadians(-pin.config.rotation));

            context.moveTo(0, 0);
            context.arc(0, -height, r, toRadians(90 - arcAngle / 2), toRadians(90 + arcAngle / 2));
            context.lineTo(0, 0);
            context.closePath();
        }
    });

    var CanvasText = ViewElement.extend({
        init: function(content, options) {
            var text = this;
            ViewElement.fn.init.call(text, options);

            text.content = dataviz.decodeEntities(content);
        },

        options: {
            x: 0,
            y: 0,
            baseline: 0,
            font: DEFAULT_FONT,
            size: {
                width: 0,
                height: 0
            },
            fillOpacity: 1
        },

        render: function(context) {
            var text = this,
                options = text.options,
                content = text.content,
                x = options.x,
                y = options.y + options.baseline;

            context.save();

            context.font = options.font;
            context.fillStyle = options.color;
            context.globalAlpha = options.fillOpacity;

            context.fillText(content, x, y);

            context.restore();
        }
    });

    var CanvasTextBox = ViewElement.extend({
        render: function(context) {
            var matrix = this.options.matrix;

            if (matrix) {
                context.save();
                context.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
            }

            this.renderContent(context);

            if (matrix) {
                context.restore();
            }
        },

        renderContent: CanvasView.fn.renderContent
    });

    // Helpers ================================================================
    function toRadians(degrees) {
        return ((degrees + 540) % 360) * DEG_TO_RAD;
    }

    function alignToPixel(coord) {
        return math.round(coord) + 0.5;
    }

    function addGradientStops(gradient, stops) {
        var i,
            length = stops.length,
            currentStop,
            color;

        for (i = 0; i < length; i++) {
            currentStop = stops[i];
            color = new Color(currentStop.color);
            gradient.addColorStop(
                currentStop.offset,
                "rgba(" + color.r + "," + color.g + "," + color.b + "," + currentStop.opacity + ")"
            );
        }
    }

    // Exports ================================================================
    if (dataviz.supportsCanvas()) {
        dataviz.ViewFactory.current.register("canvas", CanvasView, 30);
    }

    deepExtend(dataviz, {
        CanvasCircle: CanvasCircle,
        CanvasClipPath: CanvasClipPath,
        CanvasGroup: CanvasGroup,
        CanvasLine: CanvasLine,
        CanvasMultiLine: CanvasMultiLine,
        CanvasPath: CanvasPath,
        CanvasRing: CanvasRing,
        CanvasText: CanvasText,
        CanvasTextBox: CanvasTextBox,
        CanvasView: CanvasView
    });

})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(_, f){ f(); });