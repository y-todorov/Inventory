/*
* Kendo UI v2014.2.903 (http://www.telerik.com/kendo-ui)
* Copyright 2014 Telerik AD. All rights reserved.
*
* Kendo UI commercial licenses may be obtained at
* http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
* If you do not own a commercial license, this file shall be governed by the trial license terms.
*/
(function(f, define){
    define([ "./kendo.dom" ], f);
})(function(){

/*jshint eqnull: true*/
(function($, undefined) {
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget,
        ns = ".kendoPivotConfigurator",
        HOVEREVENTS = "mouseenter" + ns + " mouseleave" + ns,
        SETTING_CONTAINER_TEMPLATE = kendo.template('<p class="k-reset"><span class="k-icon #=icon#"></span>${name}</p>' +
                '<div class="k-list-container k-reset"/>');


    function settingTargetFromNode(node) {
        var target = $(node).closest(".k-pivot-setting");

        if (target.length) {
            return target.data("kendoPivotSettingTarget");
        }
        return null;
    }

    var PivotConfigurator = Widget.extend({
        init: function(element, options) {
            Widget.fn.init.call(this, element, options);

            this.element.addClass("k-widget k-fieldselector k-alt k-edit-form-container");

            this._dataSource();

            this._layout();

            this.refresh();

            kendo.notify(this);
        },

        events: [],

        options: {
            name: "PivotConfigurator",
            filterable: false,
            messages: {
                measures: "Drop Data Fields Here",
                columns: "Drop Column Fields Here",
                rows: "Drop Rows Fields Here",
                measuresLabel: "Measures",
                columnsLabel: "Columns",
                rowsLabel: "Rows",
                fieldsLabel: "Fields"
            }
        },

        _dataSource: function() {
            if (this.dataSource && this._refreshHandler) {
                this.dataSource.unbind("change", this._refreshHandler);
            } else {
                this._refreshHandler = $.proxy(this.refresh, this);
            }

            this.dataSource = kendo.data.PivotDataSource.create(this.options.dataSource);
            this.dataSource.bind("change", this._refreshHandler);
        },

        setDataSource: function(dataSource) {
            this.options.dataSource = dataSource;

            this._dataSource();

            if (this.measures) {
                this.measures.setDataSource(dataSource);
            }

            if (this.rows) {
                this.rows.setDataSource(dataSource);
            }

            if (this.columns) {
                this.columns.setDataSource(dataSource);
            }

            this.refresh();
        },


        _treeViewDataSource: function() {
            var that = this;

            return kendo.data.HierarchicalDataSource.create({
                schema: {
                    model: {
                        id: "uniqueName",
                        hasChildren: function(item) {
                            return !("hierarchyUniqueName" in item) && !("aggregator" in item);
                        }
                    }
                },
                transport: {
                    read: function(options) {
                        var promise;
                        if ($.isEmptyObject(options.data)) {
                            promise = that.dataSource.schemaDimensions();
                        } else {
                            //Hack to get the actual node as the HierarchicalDataSource does not support passing it
                            var node = that.treeView.dataSource.get(options.data.uniqueName);

                            if (node.type == 2) { //measure
                                promise = that.dataSource.schemaMeasures();
                            } else if (node.dimensionUniqueName) { // hierarchy
                                promise = that.dataSource.schemaLevels(options.data.uniqueName);
                            } else { // dimension
                                promise = that.dataSource.schemaHierarchies(options.data.uniqueName);
                            }
                        }
                        promise.done(options.success)
                            .fail(options.error);
                    }
                }
            });
        },

        _layout: function() {
            this.form = $('<div class="k-columns k-state-default k-floatwrap"/>').appendTo(this.element);
            this._fields();
            this._targets();
        },

        _fields: function() {
            var container = $('<div class="k-state-default"><p class="k-reset"><span class="k-icon k-i-group"></span>' + this.options.messages.fieldsLabel + '</p></div>').appendTo(this.form);

            var that = this;

            this.treeView = $("<div/>").appendTo(container)
                .kendoTreeView({
                    dataTextField: "name",
                    dragAndDrop: true,
                    autoBind: false,
                    dataSource: this._treeViewDataSource(),
                    dragstart: function(e) {
                        var dataItem = this.dataItem(e.sourceNode);
                        if ((!dataItem.hasChildren && !dataItem.aggregator) || (dataItem.type == 2)) {
                            e.preventDefault();
                        }
                    },
                    drag: function(e) {
                        var status = "k-denied";

                        var setting = settingTargetFromNode(e.dropTarget);
                        if (setting && setting.validate(this.dataItem(e.sourceNode))) {
                            status = "k-add";
                        }

                        e.setStatusClass(status);
                    },
                    drop: function(e) {
                        e.preventDefault();

                        var setting = settingTargetFromNode(e.dropTarget);
                        var node = this.dataItem(e.sourceNode);

                        if (setting && setting.validate(node)) {
                            setting.add(node.defaultHierarchy || node.uniqueName);
                        }
                    }
                 })
                .data("kendoTreeView");
        },

        _createTarget: function(element, options) {
            var filter = options.filterable ? '<span class="k-icon k-filter k-setting-filter"></span>' : '';
            return new kendo.ui.PivotSettingTarget(element, $.extend({
                dataSource: this.dataSource,
                hint: function(element) {
                    var wrapper = $('<div class="k-fieldselector"><ul class="k-list k-reset"></ul></div>');

                    wrapper.find(".k-list").append(element.clone());

                    return wrapper;
                },
                template: '<li class="k-item k-header" data-' + kendo.ns + 'name="${data.name || data}">${data.name || data}<span class="k-field-actions">' +
                            filter + '<span class="k-icon k-si-close k-setting-delete"></span></span></li>',
                emptyTemplate: '<li class="k-item k-empty">${data}</li>'
            }, options));
        },

        _targets: function() {
            var container = $('<div class="k-state-default"/>').appendTo(this.form);

            var columnsContainer = $(SETTING_CONTAINER_TEMPLATE({ name: this.options.messages.columnsLabel, icon: "k-i-vbars" })).appendTo(container);
            var columns = $('<ul class="k-pivot-configurator-settings k-list k-reset" />').appendTo(columnsContainer.last());

            var rowsContainer = $(SETTING_CONTAINER_TEMPLATE({ name: this.options.messages.rowsLabel, icon: "k-i-hbars" })).appendTo(container);
            var rows = $('<ul class="k-pivot-configurator-settings k-list k-reset" />').appendTo(rowsContainer.last());

            var measuresContainer = $(SETTING_CONTAINER_TEMPLATE({ name: this.options.messages.measuresLabel, icon: "k-i-sum"})).appendTo(container);
            var measures = $('<ul class="k-pivot-configurator-settings k-list k-reset" />').appendTo(measuresContainer.last());

            this.columns = this._createTarget(columns, {
                filterable: this.options.filterable,
                connectWith: rows,
                messages: {
                    empty: this.options.messages.columns,
                    fieldMenu: this.options.messages.fieldMenu
                }
            });

            this.rows = this._createTarget(rows, {
                filterable: this.options.filterable,
                setting: "rows",
                connectWith: columns,
                messages: {
                    empty: this.options.messages.rows,
                    fieldMenu: this.options.messages.fieldMenu
                }
            });

            this.measures = this._createTarget(measures, {
                setting: "measures",
                messages: {
                    empty: this.options.messages.measures
                }
            });

            columns
                .add(rows)
                .add(measures)
                .on(HOVEREVENTS, ".k-item:not(.k-empty)", this._toggleHover);
        },

        _toggleHover: function(e) {
            $(e.currentTarget).toggleClass("k-state-hover", e.type === "mouseenter");
        },

        refresh: function() {
            var dataSource = this.dataSource;

            if (this._cube !== dataSource.cube() || this._catalog !== dataSource.catalog()) {
                this.treeView.dataSource.fetch();
            }

            this._catalog = this.dataSource.catalog();
            this._cube = this.dataSource.cube();
        },

        destroy: function() {
            Widget.fn.destroy.call(this);

            this.dataSource.unbind("change", this._refreshHandler);

            this.form.find(".k-list").off(ns);

            this.rows.destroy();
            this.columns.destroy();
            this.measures.destroy();
            this.treeView.destroy();

            this.element = null;
            this._refreshHandler = null;
        }
    });

    ui.plugin(PivotConfigurator);

})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(_, f){ f(); });