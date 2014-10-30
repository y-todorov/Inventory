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
        doc = document,
        math = Math,

        kendo = window.kendo,
        Class = kendo.Class,
        dataviz = kendo.dataviz,
        Box2D = dataviz.Box2D,
        ExpandAnimation = dataviz.ExpandAnimation,
        Point2D = dataviz.Point2D,
        ViewBase = dataviz.ViewBase,
        ViewElement = dataviz.ViewElement,
        deepExtend = kendo.deepExtend,
        defined = dataviz.defined,
        round = dataviz.round,
        renderTemplate = dataviz.renderTemplate,
        rotatePoint = dataviz.rotatePoint,
        uniqueId = dataviz.uniqueId;

    // Constants ==============================================================
    var BUTT = "butt",
        CLIP = dataviz.CLIP,
        COORD_PRECISION = dataviz.COORD_PRECISION,
        DASH_ARRAYS = dataviz.DASH_ARRAYS,
        DEFAULT_WIDTH = dataviz.DEFAULT_WIDTH,
        DEFAULT_HEIGHT = dataviz.DEFAULT_HEIGHT,
        DEFAULT_FONT = dataviz.DEFAULT_FONT,
        NONE = "none",
        RADIAL = "radial",
        SOLID = "solid",
        SQUARE = "square",
        SVG_NS = "http://www.w3.org/2000/svg",
        TRANSPARENT = "transparent",
        UNDEFINED = "undefined";

    // View ===================================================================
    var SVGView = ViewBase.extend({
        init: function(options) {
            var view = this;

            ViewBase.fn.init.call(view, options);

            view.decorators.push(
                new SVGOverlayDecorator(view),
                new SVGGradientDecorator(view)
            );

            if (dataviz.ui.Chart) {
                view.decorators.push(
                    new dataviz.BarAnimationDecorator(view),
                    new dataviz.PieAnimationDecorator(view),
                    new dataviz.BubbleAnimationDecorator(view)
                );
            }

            view.decorators.push(
                new SVGClipAnimationDecorator(view),
                new dataviz.FadeAnimationDecorator(view)
            );

            if (dataviz.Gauge) {
                view.decorators.push(
                    new dataviz.RadialPointerAnimationDecorator(view),
                    new dataviz.ArrowPointerAnimationDecorator(view),
                    new dataviz.BarIndicatorAnimationDecorator(view)
                );
            }

            view.defsId = uniqueId();
            view.template = SVGView.template;
            view.display = view.options.inline ? "inline" : "block";

            if (!view.template) {
                view.template = SVGView.template = renderTemplate(
                    "<?xml version='1.0' ?>" +
                    "<svg xmlns='" + SVG_NS + "' version='1.1' " +
                    "width='#= d.options.width #px' height='#= d.options.height #px' " +
                    "style='position: relative; display: #= d.display #;'>" +
                    "#= d.renderDefinitions() #" +
                    "#= d.renderContent() #</svg>"
                );
            }
        },

        options: {
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
            encodeText: false
        },

        renderTo: function(container) {
            var view = this,
                viewElement;

            view.setupAnimations();

            dataviz.renderSVG(container, view.render());
            viewElement = container.firstElementChild;
            view.alignToScreen(viewElement);

            view.playAnimations();

            view._viewElement = viewElement;

            return viewElement;
        },

        renderDefinitions: function() {
            var view = this,
                id = view.defsId,
                output = ViewBase.fn.renderDefinitions.call(view);

            return "<defs id='" + id + "'>" + output + "</defs>";
        },

        renderElement: function(element) {
            var view = this,
                container = doc.createElement("div"),
                defsCurrent = doc.getElementById(view.defsId),
                defsElement,
                domElement;

            dataviz.renderSVG(container,
                "<?xml version='1.0' ?>" +
                "<svg xmlns='" + SVG_NS + "' version='1.1'>" +
                view.renderDefinitions() +
                element.render() +
                "</svg>"
            );

            defsElement = container.firstElementChild.firstChild;
            domElement = container.firstElementChild.lastChild;

            if (defsCurrent && defsCurrent.textContent !== defsElement.textContent) {
                defsCurrent.parentNode.replaceChild(defsElement, defsCurrent);
            }

            return domElement;
        },

        createGroup: function(options) {
            return this.decorate(
                new SVGGroup(options)
            );
        },

        createClipPath: function(id, box) {
            var view = this,
                clipPath = view.definitions[id],
                children = [view.createRect(box, {})];
            if(!clipPath) {
                clipPath = new SVGClipPath({id: id});
                clipPath.children = children;
                view.definitions[id] = clipPath;
            } else {
                clipPath.children = children;
                clipPath.refresh();
            }

            return clipPath;
        },

        createText: function(content, options) {
            return this.decorate(
                new SVGText(content, deepExtend({ encode: this.options.encodeText }, options))
            );
        },

        createTextBox: function(options) {
            return this.decorate(
                new SVGTextBox(options)
            );
        },

        createRect: function(box, style) {
            return this.decorate(
                new SVGLine(box.points(), true, this.setDefaults(style))
            );
        },

        createCubicCurve: function(points, options, areaPoints){
            return this.decorate(
                new SVGCubicCurve(points, options, areaPoints)
            );
        },

        // TODO: Refactor to (p1, p2, options)
        createLine: function(x1, y1, x2, y2, options) {
            return this.decorate(
                new SVGLine([new Point2D(x1, y1),
                             new Point2D(x2, y2)], false, this.setDefaults(options))
            );
        },

        createMultiLine: function(elements, options){
            return this.decorate(
                new SVGMultiLine(elements, false, this.setDefaults(options))
            );
        },

        createPolyline: function(points, closed, options) {
            return this.decorate(
                new SVGLine(points, closed, this.setDefaults(options))
            );
        },

        createCircle: function(center, radius, options) {
            return this.decorate(
                new SVGCircle(center, radius, options)
            );
        },

        createSector: function(sector, options) {
            return this.decorate(
                new SVGSector(sector, options)
            );
        },

        createRing: function(ring, options) {
            return this.decorate(
                new SVGRing(ring, options)
            );
        },

        createPin: function(pin, options) {
            return this.decorate(
                new SVGPin(pin, options)
            );
        },

        createGradient: function(options) {
            if (options.type === RADIAL) {
                if (defined(options.ir)){
                    return new SVGDonutGradient(options);
                } else {
                    return new SVGRadialGradient(options);
                }
            } else {
                return new SVGLinearGradient(options);
            }
        },

        alignToScreen: function(element) {
            var ctm;

            try {
                ctm = element.getScreenCTM ? element.getScreenCTM() : null;
            } catch (e) { }

            if (ctm) {
                var left = - ctm.e % 1,
                    top = - ctm.f % 1,
                    style = element.style;

                if (left !== 0 || top !== 0) {
                    style.left = left + "px";
                    style.top = top + "px";
                }
            }
        }
    });

    var SVGViewElement = ViewElement.extend({
        renderClipPath: function () {
            var element = this,
                id = element.options.clipPathId,
                clipPath = "";
            if (id) {
                clipPath = element.renderAttr("clip-path", "url(" + baseUrl() +"#" + id + ")");
            }
            return clipPath;
        }
    });

    var SVGText = SVGViewElement.extend({
        init: function(content, options) {
            var text = this;
            SVGViewElement.fn.init.call(text, options);

            text.content = content;
            text.template = SVGText.template;
            if (!text.template) {
                text.template = SVGText.template = renderTemplate(
                    "<text #= d.renderId() # " +
                    "#= d.renderDataAttributes() # " +
                    "x='#= Math.round(d.options.x) #' " +
                    "y='#= Math.round(d.options.y + d.options.baseline) #' " +
                    "fill-opacity='#= d.options.fillOpacity #' " +
                    "style='font: #= d.options.font #; " +
                    "#= d.renderCursor() #' " +
                    "fill='#= d.options.color #'>" +
                    "#= d.renderContent() #</text>"
                );
            }
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
            fillOpacity: 1,
            cursor: {}
        },

        refresh: function(domElement) {
            var options = this.options;

            $(domElement).attr({
                "fill-opacity": options.fillOpacity
            });
        },

        clone: function() {
            var text = this;
            return new SVGText(text.content, deepExtend({}, text.options));
        },

        renderContent: function() {
            var content = this.content;
            if (this.options.encode) {
                content = dataviz.decodeEntities(content);
                content = kendo.htmlEncode(content);
            }

           return content;
        }
    });

    var SVGTextBox = SVGViewElement.extend({
        init: function(options) {
            var textbox = this;
            ViewElement.fn.init.call(textbox, options);

            textbox.template = SVGTextBox.template;
            if (!textbox.template) {
                textbox.template = SVGTextBox.template =
                renderTemplate(
                    "#if (d.options.matrix) {#" +
                        "<g #= d.renderRotation()#>" +
                        "#= d.renderContent() #</g>" +
                    "#} else {#" +
                        "#=d.renderContent() #" +
                    "#}#"
                );
            }
        },

        renderRotation: function() {
            var matrix = this.options.matrix,
                values = [matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f];
            return "transform='matrix(" + values.join(",") + ")'";
        }
    });

    var SVGPath = SVGViewElement.extend({
        init: function(options) {
            var path = this;
            SVGViewElement.fn.init.call(path, options);

            path.template = SVGPath.template;
            if (!path.template) {
                path.template = SVGPath.template = renderTemplate(
                    "<path #= d.renderId() #" +
                    "#= d.renderClipPath() #" +
                    "style='display: #= d.renderDisplay() #; " +
                    "#= d.renderCursor() #' " +
                    "#= d.renderDataAttributes() # " +
                    "d='#= d.renderPoints() #' " +
                    "#= d.renderAttr(\"stroke\", d.options.stroke) # " +
                    "#= d.renderAttr(\"stroke-width\", d.options.strokeWidth) #" +
                    "#= d.renderDashType() # " +
                    "stroke-linecap='#= d.renderLinecap() #' " +
                    "stroke-linejoin='round' " +
                    "fill-opacity='#= d.options.fillOpacity #' " +
                    "stroke-opacity='#= d.options.strokeOpacity #' " +
                    "fill='#= d.renderFill() #'></path>"
                );
            }
        },

        options: {
            fill: "",
            fillOpacity: 1,
            strokeOpacity: 1,
            rotation: [0,0,0],
            strokeLineCap: SQUARE,
            visible: true,
            cursor: {}
        },

        refresh: function(domElement) {
            var options = this.options;

            $(domElement).attr({
                "d": this.renderPoints(),
                "fill-opacity": options.fillOpacity,
                "stroke-opacity": options.strokeOpacity
            }).css("display", this.renderDisplay());
        },

        clone: function() {
            return new SVGPath(deepExtend({}, this.options));
        },

        renderPoints: function() {
            // Overriden by inheritors
        },

        renderDashType: function () {
            var path = this,
                options = path.options;

            return renderSVGDash(options.dashType, options.strokeWidth);
        },

        renderLinecap: function() {
            var options = this.options,
                dashType = options.dashType,
                strokeLineCap = options.strokeLineCap;

            return (dashType && dashType != SOLID) ? BUTT : strokeLineCap;
        },

        renderFill: function() {
            var fill = this.options.fill;

            if (fill && fill !== TRANSPARENT) {
                return fill;
            }

            return NONE;
        },

        renderDisplay: function() {
            return this.options.visible ? "block" : "none";
        },

        destroy: function() {
            // Expand animation should have this method
        }
    });

    var SVGCubicCurve = SVGPath.extend({
        init: function(points, options, areaPoints) {
            var curve = this;
            SVGPath.fn.init.call(curve, options);
            curve.areaPoints = areaPoints;
            curve.points = points;
        },
        renderPoints: function() {
            var curve = this,
                points = curve.points,
                curvePoints = [],
                areaPoints = curve.areaPoints;
            for(var i = 0; i < points.length; i++){
                if(i % 3 == 1){
                    curvePoints.push("C");
                }
                curvePoints.push(round(points[i].x, COORD_PRECISION) + " " + round(points[i].y, COORD_PRECISION));
            }

            if(areaPoints && areaPoints.length){
                for(i = 0; i < areaPoints.length; i++){
                    curvePoints.push("L " + areaPoints[i].x + " " + areaPoints[i].y);
                }
                curvePoints.push("z");
            }

            return "M " + curvePoints.join(" ");
        }
    });

    var SVGLine = SVGPath.extend({
        init: function(points, closed, options) {
            var line = this;
            SVGPath.fn.init.call(line, options);

            line.points = points;
            line.closed = closed;
        },
        renderPoints: function(){
            var line = this,
                points = line.points;
            return line._renderPoints(points);
        },
        _renderPoints: function(points) {
            var line = this,
                rotation = line.options.rotation,
                rCenter = new Point2D(rotation[1], rotation[2]),
                rAmount = -rotation[0],
                rotate = rAmount !== 0,
                i,
                result = [];

            for (i = 0; i < points.length; i++) {
                var point = points[i];
                if (rotate) {
                    point = point.clone().rotate(rCenter, rAmount);
                }

                result.push(line._print(point));
            }

            if (line.closed) {
                result.push("z");
            }

            return "M" + result.join(" ");
        },

        clone: function() {
            var line = this;
            return new SVGLine(
                deepExtend([], line.points), line.closed,
                deepExtend({}, line.options)
            );
        },

        _print: function(point) {
            var line = this,
                options = line.options,
                strokeWidth = options.strokeWidth,
                shouldAlign = options.align !== false && strokeWidth && strokeWidth % 2 !== 0,
                align = shouldAlign ? alignToPixel : round;

            return align(point.x, COORD_PRECISION) + " " + align(point.y, COORD_PRECISION);
        }
    });

    var SVGMultiLine = SVGLine.extend({
        renderPoints: function(){
            var multiLine = this,
                elements = multiLine.points,
                result = [],
                idx;

            for(idx = 0; idx < elements.length; idx++){
                result.push(multiLine._renderPoints(elements[idx]));
            }

            return result.join(" ");
        }
    });

    var SVGRing = SVGPath.extend({
        init: function(config, options) {
            var ring = this;

            SVGPath.fn.init.call(ring, options);

            ring.pathTemplate = SVGRing.pathTemplate;
            if (!ring.pathTemplate) {
                ring.pathTemplate = SVGRing.pathTemplate = renderTemplate(
                    "M #= d.firstOuterPoint.x # #= d.firstOuterPoint.y # " +
                    "A#= d.r # #= d.r # " +
                    "0 #= d.isReflexAngle ? '1' : '0' #,1 " +
                    "#= d.secondOuterPoint.x # #= d.secondOuterPoint.y # " +
                    "L #= d.secondInnerPoint.x # #= d.secondInnerPoint.y # " +
                    "A#= d.ir # #= d.ir # " +
                    "0 #= d.isReflexAngle ? '1' : '0' #,0 " +
                    "#= d.firstInnerPoint.x # #= d.firstInnerPoint.y # z"
                );
            }

            ring.config = config || {};
        },

        renderPoints: function() {
            var ring = this,
                ringConfig = ring.config,
                startAngle = ringConfig.startAngle,
                endAngle = ringConfig.angle + startAngle,
                isReflexAngle = (endAngle - startAngle) > 180,
                r = math.max(ringConfig.r, 0),
                ir = math.max(ringConfig.ir, 0),
                center = ringConfig.c,
                firstOuterPoint = ringConfig.point(startAngle),
                firstInnerPoint = ringConfig.point(startAngle, true),
                secondOuterPoint,
                secondInnerPoint;

            if (round(startAngle) % 360 === round(endAngle) % 360) {
                endAngle -= 0.05;
            }
            secondOuterPoint = ringConfig.point(endAngle);
            secondInnerPoint = ringConfig.point(endAngle, true);

            return ring.pathTemplate({
                firstOuterPoint: firstOuterPoint,
                secondOuterPoint: secondOuterPoint,
                isReflexAngle: isReflexAngle,
                r: r,
                ir: ir,
                cx: center.x,
                cy: center.y,
                firstInnerPoint: firstInnerPoint,
                secondInnerPoint: secondInnerPoint
            });
        },

        clone: function() {
            var ring = this;
            return new SVGRing(
                deepExtend({}, ring.config),
                deepExtend({}, ring.options)
            );
        }
    });

    var SVGPin = SVGPath.extend({
        init: function(config, options) {
            var pin = this;

            SVGPath.fn.init.call(pin, options);

            pin.pathTemplate = SVGPin.pathTemplate;
            if (!pin.pathTemplate) {
                pin.pathTemplate = SVGPin.pathTemplate = renderTemplate(
                    "M #= d.origin.x # #= d.origin.y # " +
                    "#= d.as.x # #= d.as.y # " +
                    "A#= d.r # #= d.r # " +
                    "0 #= d.isReflexAngle ? '1' : '0' #,0 " +
                    "#= d.ae.x # #= d.ae.y # " +
                    "z"
                );
            }

            pin.config = config || new dataviz.Pin();
        },

        renderPoints: function() {
            var pin = this,
                config = pin.config,
                r = config.radius,
                degrees = math.PI / 180,
                arcAngle = config.arcAngle,
                halfChordLength = r * math.sin(arcAngle * degrees / 2),
                height = config.height - r * (1 - math.cos(arcAngle * degrees / 2)),
                origin = config.origin,
                arcStart = { x: origin.x + halfChordLength, y: origin.y - height },
                arcEnd = { x: origin.x - halfChordLength, y: origin.y - height },
                rotate = function(point, inclinedPoint) {
                    var rotation = pin.options.rotation,
                        inclination = config.rotation;

                    point = rotatePoint(point.x, point.y, rotation[1], rotation[2], -rotation[0]);

                    if (inclinedPoint) {
                        point = rotatePoint(point.x, point.y, origin.x, origin.y, inclination);
                    }

                    return point;
                };

            origin = rotate(origin);

            return pin.pathTemplate({
                origin: origin,
                as: rotate(arcStart, true),
                ae: rotate(arcEnd, true),
                r: r,
                isReflexAngle: arcAngle > 180
            });
        }
    });

    var SVGSector = SVGRing.extend({
        init: function(config, options) {
            var sector = this;
            SVGRing.fn.init.call(sector, config, options);

            sector.pathTemplate = SVGSector.pathTemplate;
            if (!sector.pathTemplate) {
                sector.pathTemplate = SVGSector.pathTemplate = renderTemplate(
                    "M #= d.firstOuterPoint.x # #= d.firstOuterPoint.y # " +
                    "A#= d.r # #= d.r # " +
                    "0 #= d.isReflexAngle ? '1' : '0' #,1 " +
                    "#= d.secondOuterPoint.x # #= d.secondOuterPoint.y # " +
                    "L #= d.cx # #= d.cy # z"
                );
            }
        },

        options: {
            fill: "",
            fillOpacity: 1,
            strokeOpacity: 1,
            strokeLineCap: SQUARE
        },

        clone: function() {
            var sector = this;
            return new SVGSector(
                deepExtend({}, sector.config),
                deepExtend({}, sector.options)
            );
        }
    });

    var SVGCircle = ViewElement.extend({
        init: function(c, r, options) {
            var circle = this;
            ViewElement.fn.init.call(circle, options);

            circle.c = c;
            circle.r = r;

            circle.template = SVGCircle.template;
            if (!circle.template) {
                circle.template = SVGCircle.template = renderTemplate(
                    "<circle #= d.renderId() # " +
                    "#= d.renderDataAttributes() #" +
                    "cx='#= d.c.x #' cy='#= d.c.y #' " +
                    "r='#= d.r #' " +
                    "#= d.renderAttr(\"stroke\", d.options.stroke) # " +
                    "#= d.renderAttr(\"stroke-width\", d.options.strokeWidth) #" +
                    "fill-opacity='#= d.options.fillOpacity #' " +
                    "stroke-opacity='#= d.options.strokeOpacity #'  " +
                    "fill='#= d.options.fill || \"none\" #'></circle>"
                );
            }
        },

        options: {
            fill: "",
            fillOpacity: 1,
            strokeOpacity: 1
        },

        refresh: function(domElement) {
            $(domElement).attr({
                "r": math.max(0, this.r),
                "fill-opacity": this.options.fillOpacity
            });
        },

        clone: function() {
            var circle = this;
            return new SVGCircle(
                deepExtend({}, circle.c),
                circle.r,
                deepExtend({}, circle.options)
            );
        }
    });

    var SVGGroup = SVGViewElement.extend({
        init: function(options) {
            var group = this;
            ViewElement.fn.init.call(group, options);

            group.template = SVGGroup.template;
            if (!group.template) {
                group.template = SVGGroup.template =
                renderTemplate(
                    "<g#= d.renderId() #" +
                    "#= d.renderDataAttributes() #" +
                    "#= d.renderClipPath() #>" +
                    "#= d.renderContent() #</g>"
                );
            }
        }
    });

    var SVGClipPath = ViewElement.extend({
        init: function(options) {
            var clip = this;
            ViewElement.fn.init.call(clip, options);

            clip.template = SVGClipPath.template;
            if (!clip.template) {
                clip.template = SVGClipPath.template =
                renderTemplate("<clipPath#= d.renderAttr(\"id\", d.options.id) #>" +
                         "#= d.renderContent() #</clipPath>");
            }
        },

        refresh: function() {
            var element = doc.getElementById(this.options.id);
            if (element) {
                $(element).children().attr("d", this.children[0].renderPoints());
            }
        }
    });

    var SVGGradient = ViewElement.extend({
        init: function(options) {
            var gradient = this;
            ViewElement.fn.init.call(gradient, options);
        },

        options: {
            id: ""
        },

        renderStops: function() {
            var gradient = this,
                stops = gradient.options.stops,
                stopTemplate = gradient.stopTemplate,
                i,
                length = stops.length,
                currentStop,
                output = '';

            for (i = 0; i < length; i++) {
                currentStop = stops[i];
                output += stopTemplate(currentStop);
            }

            return output;
        }
    });

    var SVGLinearGradient = SVGGradient.extend({
        init: function(options) {
            var gradient = this;
            SVGGradient.fn.init.call(gradient, options);

            gradient.template = SVGLinearGradient.template;
            gradient.stopTemplate = SVGLinearGradient.stopTemplate;
            if (!gradient.template) {
                gradient.template = SVGLinearGradient.template = renderTemplate(
                    "<linearGradient id='#= d.options.id #' " +
                    "gradientTransform='rotate(#= d.options.rotation #)'> " +
                    "#= d.renderStops() #" +
                    "</linearGradient>"
                );

                gradient.stopTemplate = SVGLinearGradient.stopTemplate = renderTemplate(
                    "<stop offset='#= Math.round(d.offset * 100) #%' " +
                    "style='stop-color:#= d.color #;stop-opacity:#= d.opacity #' />");
            }
        },

        options: {
            rotation: 0
        }
    });

    var SVGRadialGradient = SVGGradient.extend({
        init: function(options) {
            var gradient = this;
            SVGGradient.fn.init.call(gradient, options);

            gradient.template = SVGRadialGradient.template;
            gradient.stopTemplate = SVGRadialGradient.stopTemplate;
            if (!gradient.template) {
                gradient.template = SVGRadialGradient.template = renderTemplate(
                    "<radialGradient id='#= d.options.id #' " +
                    "cx='#= d.options.cx #' cy='#= d.options.cy #' " +
                    "fx='#= d.options.cx #' fy='#= d.options.cy #' " +
                    "r='#= d.options.r #' gradientUnits='userSpaceOnUse'>" +
                    "#= d.renderStops() #" +
                    "</radialGradient>"
                );

                gradient.stopTemplate = SVGRadialGradient.stopTemplate = renderTemplate(
                    "<stop offset='#= Math.round(d.offset * 100) #%' " +
                    "style='stop-color:#= d.color #;stop-opacity:#= d.opacity #' />");
            }
        }
    });

    var SVGDonutGradient = ViewElement.extend({
        init: function(options) {
            var gradient = this;

            ViewElement.fn.init.call(gradient, options);

            gradient.template = SVGDonutGradient.template;
            gradient.stopTemplate = SVGDonutGradient.stopTemplate;
            if (!gradient.template) {
                gradient.template = SVGDonutGradient.template = renderTemplate(
                    "<radialGradient id='#= d.options.id #' " +
                    "cx='#= d.options.cx #' cy='#= d.options.cy #' " +
                    "fx='#= d.options.cx #' fy='#= d.options.cy #' " +
                    "r='#= d.options.r #' gradientUnits='userSpaceOnUse'>" +
                    "#= d.renderStops() #" +
                    "</radialGradient>"
                );

                gradient.stopTemplate = SVGDonutGradient.stopTemplate = renderTemplate(
                    "<stop offset='#= d.offset #%' " +
                    "style='stop-color:#= d.color #;stop-opacity:#= d.opacity #' />");
            }
        },

        options: {
            id: ""
        },

        renderStops: function() {
            var gradient = this,
                options = gradient.options,
                stops = options.stops,
                stopTemplate = gradient.stopTemplate,
                usedSpace = ((options.ir / options.r) * 100),
                i,
                length = stops.length,
                currentStop,
                output = '';

            currentStop = deepExtend({}, stops[0]);
            currentStop.offset = usedSpace;
            output += stopTemplate(currentStop);

            for (i = 1; i < length; i++) {
                currentStop = deepExtend({}, stops[i]);
                currentStop.offset = currentStop.offset * (100 -  usedSpace) + usedSpace;
                output += stopTemplate(currentStop);
            }

            return output;
        }
    });

    // Decorators =============================================================
    function SVGOverlayDecorator(view) {
        this.view = view;
    }

    SVGOverlayDecorator.prototype = {
        decorate: function(element) {
            var decorator = this,
                view = decorator.view,
                options = element.options,
                id = options.id,
                group,
                overlay;

            if (options.overlay) {
                element.options.id = uniqueId();

                group = view.createGroup();
                overlay = element.clone();

                group.children.push(element, overlay);

                overlay.options.id = id;
                overlay.options.fill = options.overlay;

                return group;
            } else {
                return element;
            }
        }
    };

    function SVGGradientDecorator(view) {
        this.view = view;
    }

    SVGGradientDecorator.prototype = {
        decorate: function(element) {
            var decorator = this,
                options = element.options;

            options.fill = decorator.getPaint(options.fill);

            return element;
        },

        getPaint: function(paint) {
            var decorator = this,
                view = decorator.view,
                definitions = view.definitions,
                overlay,
                overlayId,
                gradient;

            if (paint && defined(paint.gradient)) {
                overlay = view.buildGradient(paint);
                if (overlay) {
                    overlayId = overlay.id;
                    gradient = definitions[overlayId];
                    if (!gradient) {
                        gradient = view.createGradient(overlay);
                        definitions[overlayId] = gradient;
                    }

                    return "url(" + baseUrl() + "#" + gradient.options.id + ")";
                } else {
                    return NONE;
                }
            } else {
                return paint;
            }
        }
    };

    var SVGClipAnimationDecorator = Class.extend({
        init: function(view) {
            this.view = view;
        },

        decorate: function(element) {
            var decorator = this,
                view = decorator.view,
                clipId = decorator.clipId,
                options = view.options,
                animation = element.options.animation,
                definitions = view.definitions,
                clipPath,
                clipRect;

            if (animation && animation.type === CLIP && options.transitions) {
                if (!clipId) {
                    decorator.clipId = clipId = uniqueId();
                }

                clipPath = definitions[clipId];
                if (!clipPath) {
                    clipPath = new SVGClipPath({ id: clipId });
                    clipRect = view.createRect(
                        new Box2D(0, 0, options.width, options.height), { id: uniqueId() });
                    clipPath.children.push(clipRect);
                    definitions[clipId] = clipPath;

                    view.animations.push(
                        new ExpandAnimation(clipRect, { size: options.width })
                    );
                }

                element.options.clipPathId = clipId;
            }

            return element;
        }
    });

    // Helpers ================================================================
    function alignToPixel(coord) {
        return math.round(coord) + 0.5;
    }

    function renderSVGDash(dashType, strokeWidth) {
        var result = [],
            dashTypeArray,
            i;

        dashType = dashType ? dashType.toLowerCase() : null;

        if (dashType && dashType != SOLID) {
            dashTypeArray = DASH_ARRAYS[dashType];
            for (i = 0; i < dashTypeArray.length; i++) {
                result.push(dashTypeArray[i] * (strokeWidth || 1));
            }

            return "stroke-dasharray='" + result.join(" ") + "' ";
        }

        return "";
    }

    var renderSVG = function(container, svg) {
        container.innerHTML = svg;
    };

    function baseUrl() {
        var base = doc.getElementsByTagName("base")[0],
            url = "",
            href = doc.location.href,
            hashIndex = href.indexOf("#");

        if (base && !kendo.support.browser.msie) {
            if (hashIndex !== -1) {
                href = href.substring(0, hashIndex);
            }

            url = href;
        }

        return url;
    }

    (function() {
        var testFragment = "<svg xmlns='" + SVG_NS + "'></svg>",
            testContainer = doc.createElement("div"),
            hasParser = typeof DOMParser != UNDEFINED;

        testContainer.innerHTML = testFragment;

        if (hasParser && testContainer.firstChild.namespaceURI != SVG_NS) {
            renderSVG = function(container, svg) {
                var parser = new DOMParser(),
                    chartDoc = parser.parseFromString(svg, "text/xml"),
                    importedDoc = doc.adoptNode(chartDoc.documentElement);

                container.innerHTML = "";
                container.appendChild(importedDoc);
            };
        }
    })();

    // Exports ================================================================
    if (dataviz.supportsSVG()) {
        dataviz.ViewFactory.current.register("svg", SVGView, 10);
    }

    deepExtend(dataviz, {
        renderSVG: renderSVG,
        SVGCircle: SVGCircle,
        SVGClipAnimationDecorator: SVGClipAnimationDecorator,
        SVGClipPath: SVGClipPath,
        SVGGradientDecorator: SVGGradientDecorator,
        SVGGroup: SVGGroup,
        SVGLine: SVGLine,
        SVGMultiLine: SVGMultiLine,
        SVGLinearGradient: SVGLinearGradient,
        SVGOverlayDecorator: SVGOverlayDecorator,
        SVGPath: SVGPath,
        SVGRadialGradient: SVGRadialGradient,
        SVGDonutGradient: SVGDonutGradient,
        SVGRing: SVGRing,
        SVGSector: SVGSector,
        SVGText: SVGText,
        SVGTextBox: SVGTextBox,
        SVGView: SVGView
    });

})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(_, f){ f(); });