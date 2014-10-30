/*
* Kendo UI v2014.2.903 (http://www.telerik.com/kendo-ui)
* Copyright 2014 Telerik AD. All rights reserved.
*
* Kendo UI commercial licenses may be obtained at
* http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
* If you do not own a commercial license, this file shall be governed by the trial license terms.
*/
(function(f, define){
    define([ "./kendo.dataviz.chart" ], f);
})(function(){

(function ($, undefined) {
    // Imports ===============================================================
    var kendo = window.kendo,
        dataviz = kendo.dataviz,

        Chart = dataviz.ui.Chart,
        ObservableArray = kendo.data.ObservableArray,
        SharedTooltip = dataviz.SharedTooltip,

        deepExtend = kendo.deepExtend,
        isArray = $.isArray,
        inArray = dataviz.inArray,
        math = Math;

    // Constants =============================================================
    var CSS_PREFIX = "k-",
        DEAULT_BAR_WIDTH = 150,
        DEAULT_BULLET_WIDTH = 150,
        BAR = "bar",
        BULLET = "bullet",
        PIE = "pie",
        NO_CROSSHAIR = [BAR, BULLET];

    // Sparkline =============================================================
    var Sparkline = Chart.extend({
        init: function(element, userOptions) {
            var chart = this,
                stage = chart.stage = $("<span />"),
                options = userOptions || {};

            element = $(element)
                .addClass(CSS_PREFIX + "sparkline")
                .empty().append(stage);

            chart._initialWidth = math.floor(element.width());

            options = wrapNumber(options);

            if (isArray(options) || options instanceof ObservableArray) {
                options = { seriesDefaults: { data: options } };
            }

            if (!options.series) {
                options.series = [{ data: wrapNumber(options.data) }];
            }

            deepExtend(options, {
                seriesDefaults: {
                    type: options.type
                }
            });

            if (inArray(options.series[0].type, NO_CROSSHAIR) ||
                inArray(options.seriesDefaults.type, NO_CROSSHAIR)) {
                options = deepExtend({}, {
                        categoryAxis: {
                            crosshair: {
                                visible: false
                            }
                        }
                    }, options);
            }

            Chart.fn.init.call(chart, element, options);
        },

        options: {
            name: "Sparkline",
            chartArea: {
                margin: 2
            },
            axisDefaults: {
                visible: false,
                majorGridLines: {
                    visible: false
                },
                valueAxis: {
                    narrowRange: true
                }
            },
            seriesDefaults: {
                type: "line",
                area: {
                    line: {
                        width: 0.5
                    }
                },
                bar: {
                    stack: true
                },
                padding: 2,
                width: 0.5,
                overlay: {
                    gradient: null
                },
                highlight: {
                    visible: false
                },
                border: {
                    width: 0
                },
                markers: {
                    size: 2,
                    visible: false
                }
            },
            tooltip: {
                visible: true,
                shared: true
            },
            categoryAxis: {
                crosshair: {
                    visible: true,
                    tooltip: {
                        visible: false
                    }
                }
            },
            legend: {
                visible: false
            },
            transitions: false,

            pointWidth: 5,

            panes: [{
                clip: false
            }]
        },

        _applyDefaults: function(options) {
            var chart = this,
                view = dataviz.ViewFactory.current.create({}, options.renderAs);

            if (dataviz.CanvasView && view instanceof dataviz.CanvasView) {
                deepExtend(options, {
                    categoryAxis: {
                        crosshair: {
                            visible: false
                        }
                    }
                });
            }

            Chart.fn._applyDefaults.apply(chart, arguments);
        },

        _modelOptions: function() {
            var chart = this,
                chartOptions = chart.options,
                options,
                width = chart._initialWidth,
                stage = chart.stage;

            chart.stage[0].innerHTML = "&nbsp;";

            options = deepExtend({
                width: width ? width : chart._autoWidth(),
                height: stage.height(),
                transitions: chartOptions.transitions
            }, chartOptions.chartArea, {
                inline: true,
                align: false
            });

            stage.css({
                width: options.width,
                height: options.height
            });

            return options;
        },

        _createTooltip: function() {
            var chart = this,
                options = chart.options,
                element = chart.element,
                tooltip;

            if (chart._sharedTooltip()) {
                tooltip = new SparklineSharedTooltip(element, chart._plotArea, options.tooltip);
            } else {
                tooltip = Chart.fn._createTooltip.call(chart);
            }

            return tooltip;
        },

        _renderView: function() {
            var chart = this;
            chart.element.empty().append(chart.stage);
            return chart._view.renderTo(chart.stage[0]);
        },

        _autoWidth: function() {
            var chart = this,
                options = chart.options,
                margin = dataviz.getSpacing(options.chartArea.margin),
                series = options.series,
                dsTotal = chart.dataSource.total(),
                seriesTotal = 0,
                width,
                i,
                currentSeries;

            for (i = 0; i < series.length; i++) {
                currentSeries = series[i];

                if (currentSeries.type === BAR) {
                    return DEAULT_BAR_WIDTH;
                }

                if (currentSeries.type === BULLET) {
                    return DEAULT_BULLET_WIDTH;
                }

                if (currentSeries.type === PIE) {
                    return chart.stage.height();
                }

                if (currentSeries.data) {
                    seriesTotal = math.max(seriesTotal, currentSeries.data.length);
                }
            }

            width = math.max(dsTotal, seriesTotal) * options.pointWidth;
            if (width > 0) {
                width += margin.left + margin.right;
            }

            return width;
        }
    });

    var SparklineSharedTooltip = SharedTooltip.extend({
        options: {
            animation: {
                duration: 0
            }
        },

        _anchor: function(point, slot) {
            var anchor = SharedTooltip.fn._anchor.call(this, point, slot);
            var size = this._measure();
            anchor.y = -size.height - this.options.offset;

            return anchor;
        },

        _hideElement: function() {
            this.element.hide().remove();
        }
    });

    function wrapNumber(x) {
        return typeof x === "number" ? [x] : x;
    }

    // Exports ================================================================

    dataviz.ui.plugin(Sparkline);

    deepExtend(dataviz, {
        SparklineSharedTooltip: SparklineSharedTooltip
    });

})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(_, f){ f(); });