/*
* Kendo UI v2014.2.903 (http://www.telerik.com/kendo-ui)
* Copyright 2014 Telerik AD. All rights reserved.
*
* Kendo UI commercial licenses may be obtained at
* http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
* If you do not own a commercial license, this file shall be governed by the trial license terms.
*/
(function(f, define){
    define([ "./kendo.dom", "./kendo.data" ], f);
})(function(){

/*jshint eqnull: true*/
(function($, undefined) {
    var kendo = window.kendo,
        ui = kendo.ui,
        Class = kendo.Class,
        Widget = ui.Widget,
        DataSource = kendo.data.DataSource,
        toString = {}.toString,
        identity = function(o) { return o; },
        map = $.map,
        extend = $.extend,
        isFunction = kendo.isFunction,
        CHANGE = "change",
        ERROR = "error",
        PROGRESS = "progress",
        STATERESET = "stateReset",
        DIV = "<div/>",
        NS = ".kendoPivotGrid",
        ROW_TOTAL_KEY = "__row_total__",
        DATABINDING = "dataBinding",
        DATABOUND = "dataBound",
        EXPANDMEMBER = "expandMember",
        COLLAPSEMEMBER = "collapseMember",
        STATE_EXPANDED = "k-i-arrow-s",
        STATE_COLLAPSED = "k-i-arrow-e",
        HEADER_TEMPLATE = "#: data.member.caption || data.member.name #",
        DATACELL_TEMPLATE = '#: data.dataItem ? (data.dataItem.fmtValue || data.dataItem.value) : "" #',
        LAYOUT_TABLE = '<table class="k-pivot-layout">' +
                            '<tr>' +
                                '<td>' +
                                    '<div class="k-pivot-rowheaders"></div>' +
                                '</td>' +
                                '<td>' +
                                    '<div class="k-pivot-table k-state-default"></div>' +
                                '</td>' +
                            '</tr>' +
                        '</table>';

    function normalizeMembers(member) {
        var descriptor = typeof member === "string" ? { name: member, expand: false } : member,
            descriptors = toString.call(descriptor) === "[object Array]" ? descriptor : (descriptor !== undefined ? [descriptor] : []);

        return map(descriptors, function(d) {
            if (typeof d === "string") {
                return { name: d, expand: false };
            }
            return { name: d.name, expand: d.expand };
        });
    }

    function accumulateMembers(accumulator, tuples, level) {
        var member;
        var name;
        var parentName;

        for (var idx = 0; idx < tuples.length; idx++) {
            member = tuples[idx].members[level];
            name = member.name;
            parentName = member.parentName || "";

            if (member.children.length > 0) {
                accumulator[name] = true;
                accumulateMembers(accumulator, member.children, level);
            } else if (!(parentName in accumulator)) {
                accumulator[name] = false;
            }
        }
    }

    function descriptorsForAxes(tuples) {
        var result = {};

        if (tuples.length) {
            var members = tuples[0].members || [];
            for (var idx = 0; idx < members.length; idx++) {
                if (!members[idx].measure) {
                    accumulateMembers(result, tuples, idx);
                }
            }
        }

        var descriptors = [];
        for (var k in result) {
            descriptors.push({ name: k, expand: result[k] });
        }

        return descriptors;
    }

    function addMissingPathMembers(members, axis) {
        var tuples = axis.tuples || [];
        var firstTuple = tuples[0];

        if (firstTuple && members.length < firstTuple.members.length) {
            var tupleMembers = firstTuple.members;

            for (var idx = 0; idx < tupleMembers.length; idx++) {
                if (tupleMembers[idx].measure) {
                    continue;
                }

                var found = false;
                for (var j = 0; j < members.length; j++) {
                    if (members[j].name.indexOf(tupleMembers[idx].hierarchy) === 0) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    members.push(tupleMembers[idx]);
                }
            }
        }
    }

    function tupleToDescriptors(tuple) {
        var result = [];
        var members = tuple.members;

        for (var idx = 0; idx < members.length; idx++) {
            if (members[idx].measure) {
                continue;
            }
            result.push({ name: members[idx].name, expand: members[idx].children.length > 0});
        }

        return result;
    }

    function descriptorsForMembers(axis, members, measures) {
        axis = axis || {};

        addMissingPathMembers(members, axis);

        if (measures.length > 1) {
            members.push({
                name: "Measures",
                measure: true,
                children: normalizeMembers(measures)
            });
        }

        var tupletoSearch = {
            members: members
        };

        if (axis.tuples) {
            var result = findExistingTuple(axis.tuples, tupletoSearch);
            if (result.tuple) {
                members = tupleToDescriptors(result.tuple);
            }
        }

        return members;
    }

    function addDataCell(result, rowIndex, map, key, format) {
        result[result.length] = {
            ordinal: rowIndex,
            value: map[key].aggregates,
            fmtValue: format ? kendo.format(format, map[key].aggregates) : map[key].aggregates
        };

        var items = map[key].items;

        for (var columnKey in items) {
            result[result.length] = {
                ordinal: rowIndex + items[columnKey].index + 1,
                value: items[columnKey].aggregate,
                fmtValue: format ? kendo.format(format, items[columnKey].aggregate) : items[columnKey].aggregate
            };
        }
    }

    var PivotCubeBuilder = Class.extend({
        init: function(options) {
            this.options = extend({}, this.options, options);
            this.dimensions = this._normalizeDescriptors("field", this.options.dimensions);
            this.measures = this._normalizeDescriptors("name", this.options.measures);
        },

        _normalizeDescriptors: function(keyField, descriptors) {
            descriptors = descriptors || {};
            var fields = {};
            var field;

            if (toString.call(descriptors) === "[object Array]") {
                for (var idx = 0, length = descriptors.length; idx < length; idx++) {
                    field = descriptors[idx];
                    if (typeof field === "string") {
                        fields[field] = {};
                    } else if (field[keyField]) {
                        fields[field[keyField]] = field;
                    }
                }
                descriptors = fields;
            }

            return descriptors;
        },

        _asTuples: function(map, descriptors) {
            var dimensionsSchema = this.dimensions || [];
            var result = [];
            var root;
            var idx;
            var length;

            if (descriptors.length) {
                root = { members: [] };

                for (idx = 0, length = descriptors.length; idx < length; idx++) {
                    root.members[root.members.length] = {
                        children: [],
                        caption: (dimensionsSchema[descriptors[idx].name] || {}).caption || "All",
                        name: descriptors[idx].name,
                        levelName: descriptors[idx].name,
                        levelNum: "0",
                        hasChildren: true,
                        parentName: undefined,
                        hierarchy: descriptors[idx].name
                    };
                }

                result[result.length] = root;
            }

            for (var key in map) {
                var tuple = { members: [] };
                for (idx = 0, length = descriptors.length; idx < length; idx++) {
                    if (map[key].parentName.indexOf(descriptors[idx].name) === 0) {
                        tuple.members[tuple.members.length] = {
                            children: [],
                            caption: map[key].value,
                            name: map[key].name,
                            levelName: map[key].name,
                            levelNum: 1,
                            hasChildren: false,
                            parentName: descriptors[idx].name,
                            hierarchy: descriptors[idx].name
                        };
                    } else {
                        tuple.members[tuple.members.length] = {
                            children: [],
                            caption: (dimensionsSchema[descriptors[idx].name] || {}).caption || "All",
                            name: descriptors[idx].name,
                            levelName: descriptors[idx].name,
                            levelNum: "0",
                            hasChildren: true,
                            parentName: undefined,
                            hierarchy: descriptors[idx].name
                        };
                    }
                }

                result[result.length] = tuple;
            }

            return result;
        },

        _toDataArray: function(map, columns, measures) {
            var format;
            if (measures && measures.length) {
                var measure = (this.measures || {})[measures[0]];
                if (measure.format) {
                    format = measure.format;
                }
            }

            var result = [];
            var items;
            var rowIndex = 0;

            addDataCell(result, rowIndex, map, ROW_TOTAL_KEY, format);

            rowIndex += columns.length;

            for (var key in map) {
                if (key === ROW_TOTAL_KEY) {
                    continue;
                }

                addDataCell(result, rowIndex, map, key, format);

                rowIndex += columns.length;
            }

            return result;
        },

        _matchDescriptors: function(dataItem, descriptors, getters, idx) {
            var descriptor;
            var parts;
            var parentField;
            var expectedValue;
            var parentGetter;

            while (idx > 0) {
                descriptor = descriptors[--idx];
                parts = descriptor.name.split("&");
                if (parts.length > 1) {
                    parentField = parts[0];
                    expectedValue = parts[1];
                    parentGetter = getters[parentField];

                    if (parentGetter(dataItem) != expectedValue) {
                        return false;
                    }
                }
            }
            return true;
        },

        _isExpanded: function(descriptors) {
            for (var idx = 0, length = descriptors.length; idx < length; idx++) {
                if (descriptors[idx].expand) {
                    return true;
                }
            }
            return false;
        },

        _processColumns: function(measureAggregator, descriptors, getters, columns, dataItem, rowTotal, state, updateColumn) {
            var value;
            var descriptor;
            var name;
            var column;
            var totalItem;

            for (var idx = 0; idx < descriptors.length; idx++) {
                descriptor = descriptors[idx];

                if (descriptor.expand) {
                    if (!this._matchDescriptors(dataItem, descriptors, getters, idx)) {
                        continue;
                    }

                    value = getters[descriptor.name](dataItem);
                    value = value !== undefined ? value.toString() : value;

                    name = descriptor.name + "&" + value;

                    column = columns[name] || {
                        index: state.columnIndex,
                        name: name,
                        parentName: descriptor.name,
                        value: value
                    };

                    totalItem = rowTotal.items[name] || {
                        aggregate: 0
                    };

                    rowTotal.items[name] = { index: column.index, aggregate: measureAggregator(dataItem, totalItem.aggregate) };

                    if (updateColumn) {
                        if (!columns[name]) {
                            state.columnIndex++;
                        }
                        columns[name] = column;
                    }
                }
            }
        },

        _measureAggregator: function(options) {
            var measureDescriptors = options.measures || [];
            var measure = (this.measures || {})[measureDescriptors[0]];
            var measureAggregator;

            if (measure) {
                var measureGetter = kendo.getter(measure.field, true);
                measureAggregator = function(data, state) {
                    return measure.aggregate(measureGetter(data), state);
                };
            } else {
                measureAggregator = function() { return 1; };
            }
            return measureAggregator;
        },

        _buildGetters: function(descriptors) {
            var result = {};
            var descriptor;
            var parts;

            for (var idx = 0, length = descriptors.length; idx < length; idx++) {
                descriptor = descriptors[idx];
                parts = descriptor.name.split("&");

                if (parts.length > 1) {
                    result[parts[0]] = kendo.getter(parts[0], true);
                } else {
                    result[descriptor.name] = kendo.getter(descriptor.name, true);
                }
            }

            return result;
        },

        process: function(data, options) {
            data = data || [];
            options = options || {};

            var columnDescriptors = options.columns || [];
            var rowDescriptors = options.rows || [];

            var aggregatedData = {};
            var columns = {};
            var rows = {};

            var rowValue;
            var state = { columnIndex: 0 };

            var measureAggregator = this._measureAggregator(options);
            var columnGetters = this._buildGetters(columnDescriptors);
            var rowGetters = this._buildGetters(rowDescriptors);

            var processed = false;

            if (columnDescriptors.length || rowDescriptors.length) {
                var hasExpandedRows = this._isExpanded(rowDescriptors);

                processed = true;

                for (var idx = 0, length = data.length; idx < length; idx++) {
                    var rowTotal = aggregatedData[ROW_TOTAL_KEY] || {
                        items: {},
                        aggregates: 0
                    };

                    this._processColumns(measureAggregator, columnDescriptors, columnGetters, columns, data[idx], rowTotal, state, !hasExpandedRows);

                    rowTotal.aggregates = measureAggregator(data[idx], rowTotal.aggregates);
                    aggregatedData[ROW_TOTAL_KEY] = rowTotal;

                    for (var rowIdx = 0, rowLength = rowDescriptors.length; rowIdx < rowLength; rowIdx++) {
                        var rowDescriptor = rowDescriptors[rowIdx];

                        if (rowDescriptor.expand) {
                            if (!this._matchDescriptors(data[idx], rowDescriptors, rowGetters, rowIdx)) {
                                continue;
                            }

                            rowValue = rowGetters[rowDescriptor.name](data[idx]);
                            rowValue = rowValue !== undefined ? rowValue.toString() : rowValue;
                            rows[rowValue] = {
                                name: rowDescriptor.name + "&" + rowValue,
                                parentName: rowDescriptor.name,
                                value: rowValue
                            };

                            var value = aggregatedData[rowValue] || {
                                items: {},
                                aggregates: 0
                            };

                            this._processColumns(measureAggregator, columnDescriptors, columnGetters, columns, data[idx], value, state, true);

                            value.aggregates = measureAggregator(data[idx], value.aggregates);
                            aggregatedData[rowValue] = value;
                        }
                    }
                }
            }

            if (processed && data.length) {
                columns = this._asTuples(columns, columnDescriptors);
                rows = this._asTuples(rows, rowDescriptors);
                aggregatedData = this._toDataArray(aggregatedData, columns, options.measures);
            } else {
                aggregatedData = columns = rows = [];
            }

            return {
                axes: {
                    columns: { tuples: columns },
                    rows: { tuples: rows }
                },
                data: aggregatedData
            };
        }
    });

    var PivotTransport = Class.extend({
        init: function(options, transport) {
            this.transport = transport;
            this.options = transport.options || {};

            if (!this.transport.discover) {
                if (isFunction(options.discover)) {
                    this.discover = options.discover;
                }
            }
        },
        read: function(options) {
            return this.transport.read(options);
        },
        update: function(options) {
            return this.transport.update(options);
        },
        create: function(options) {
            return this.transport.create(options);
        },
        destroy: function(options) {
            return this.transport.destroy(options);
        },
        discover: function(options) {
            if (this.transport.discover) {
                return this.transport.discover(options);
            }
            options.success({});
        },
        catalog: function(val) {
            var options = this.options || {};

            if (val === undefined) {
                return (options.connection || {}).catalog;

            }

            var connection = options.connection || {};
            connection.catalog = val;

            this.options.connection = connection;
            $.extend(this.transport.options, { connection: connection });
        },
        cube: function(val) {
            var options = this.options || {};

            if (val === undefined) {
                return (options.connection || {}).cube;
            }

            var connection = options.connection || {};
            connection.cube = val;

            this.options.connection = connection;
            extend(true, this.transport.options, { connection: connection });
        }
    });

    var PivotDataSource = DataSource.extend({
        init: function(options) {
            DataSource.fn.init.call(this, extend(true, {}, {
                schema: {
                    axes: identity,
                    cubes: identity,
                    catalogs: identity,
                    measures: identity,
                    dimensions: identity,
                    hierarchies: identity,
                    levels: identity,
                    members: identity
                }
            }, options));

            if (this.options.schema && this.options.schema.cube) {
                this.cubeBuilder = new PivotCubeBuilder(this.options.schema.cube);
            }

            this.transport = new PivotTransport(this.options.transport || {}, this.transport);

            this._columns = normalizeMembers(this.options.columns);
            this._rows = normalizeMembers(this.options.rows);

            var measures = this.options.measures || [];
            var measuresAxis = "columns";

            if (this.options.measures !== null && toString.call(this.options.measures) === "[object Object]") {
                measures = this.options.measures.values || [];
                measuresAxis = this.options.measures.axis || "columns";
            }

            this._measures = measures || [];
            this._measuresAxis = measuresAxis;

            this._axes = {};
        },

        options: {
            serverSorting: true,
            serverPaging: true,
            serverFiltering: true,
            serverGrouping: true,
            serverAggregates: true
        },

        catalog: function(val) {
            if (val === undefined) {
                return this.transport.catalog();
            }

            this.transport.catalog(val);
            this._mergeState({});// clears current state
            this._axes = {};
            this.data([]);
        },

        cube: function(val) {
            if (val === undefined) {
                return this.transport.cube();
            }

            this.transport.cube(val);
            this._axes = {};
            this._mergeState({});// clears current state
            this.data([]);
        },

        axes: function() {
            return this._axes;
        },

        columns: function(val) {
            if (val === undefined) {
                return this._columns;
            }

            this._clearAxesData = true;
            this._columns = normalizeMembers(val);
            this.query({
                columns: val,
                rows: this.rowsAxisDescriptors(),
                measures: this.measures()
            });
        },

        rows: function(val) {
            if (val === undefined) {
                return this._rows;
            }

            this._clearAxesData = true;
            this._rows = normalizeMembers(val);

            this.query({
                columns: this.columnsAxisDescriptors(),
                rows: val,
                measures: this.measures()
            });
        },

        measures: function(val) {
            if (val === undefined) {
                return this._measures;
            }

            this._clearAxesData = true;
            this.query({
                columns: this.columnsAxisDescriptors(),
                rows: this.rowsAxisDescriptors(),
                measures: val
            });
        },

        measuresAxis: function() {
            return this._measuresAxis || "columns";
        },

        _expandPath: function(path, axis) {
            var origin = axis === "columns" ? "columns" : "rows";
            var other = axis === "columns" ? "rows" : "columns";

            var members = normalizeMembers(path);
            var memberToExpand = members[members.length - 1].name;

            this._lastExpanded = origin;

            members = descriptorsForMembers(this.axes()[origin], members, this.measures());

            for (var idx = 0; idx < members.length; idx++) {
                if (members[idx].name === memberToExpand) {
                    if (members[idx].expand) {
                        return;
                    }
                    members[idx].expand = true;
                } else {
                    members[idx].expand = false;
                }
            }

            var descriptors = {};
            descriptors[origin] = members;
            descriptors[other] = this._descriptorsForAxis(other);

            this._query(descriptors);
        },

        _descriptorsForAxis: function(axis) {
            var axes = this.axes();
            var descriptors = this[axis]() || [];

            if (axes && axes[axis] && axes[axis].tuples && axes[axis].tuples[0]) {
                descriptors = descriptorsForAxes(axes[axis].tuples || []);
            }
            return descriptors;
        },

        columnsAxisDescriptors: function() {
            return this._descriptorsForAxis("columns");
        },

        rowsAxisDescriptors: function() {
            return this._descriptorsForAxis("rows");
        },

        _process: function (data, e) {
            this._view = data;

            e = e || {};
            e.items = e.items || this._view;

            this.trigger(CHANGE, e);
        },

        _query: function(options) {
            var that = this;

            if (!options) {
                this._clearAxesData = true;
            }

            that.query(extend({}, {
                page: that.page(),
                pageSize: that.pageSize(),
                sort: that.sort(),
                filter: that.filter(),
                group: that.group(),
                aggregate: that.aggregate(),
                columns: this.columnsAxisDescriptors(),
                rows: this.rowsAxisDescriptors(),
                measures: this.measures()
            }, options));
        },

        query: function(options) {
            var state = this._mergeState(options);
            if (this._data.length && this.cubeBuilder) {
                this._params(state);
                this._updateLocalData(this._pristineData);
            } else {
                this.read(state);
            }
        },

        _mergeState: function(options) {
            options = DataSource.fn._mergeState.call(this, options);

            if (options !== undefined) {
                this._measures = asArray(options.measures);

                if (options.columns) {
                    options.columns = normalizeMembers(options.columns);
                } else if (!options.columns) {
                    this._columns = [];
                }

                if (options.rows) {
                    options.rows = normalizeMembers(options.rows);
                } else if (!options.rows) {
                    this._rows = [];
                }
            }
            return options;
        },

        filter: function(val) {
            if (val === undefined) {
                return this._filter;
            }

            this._clearAxesData = true;
            this._query({ filter: val, page: 1 });
        },

        expandColumn: function(path) {
            this._expandPath(path, "columns");
        },

        expandRow: function(path) {
            this._expandPath(path, "rows");
        },

        success: function(data) {
            var originalData;
            if (this.cubeBuilder) {
                originalData = (this.reader.data(data) || []).slice(0);
            }
            DataSource.fn.success.call(this, data);
            if (originalData) {
                this._pristineData = originalData;
            }
        },

        _processResult: function(data, axes) {
            if (this.cubeBuilder) {
                var processedData = this.cubeBuilder.process(data, this._requestData);

                data = processedData.data;
                axes = processedData.axes;
            }

            var tuples, resultAxis, measures, axisToSkip;
            var columnDescriptors = this.columns().length;
            var rowDescriptors = this.rows().length;
            var hasColumnTuples = axes.columns && axes.columns.tuples;

            if (!columnDescriptors && rowDescriptors && hasColumnTuples && (this._rowMeasures().length || !this.measures().length)) {
                axes = {
                    columns: {},
                    rows: axes.columns
                };
            }

            if (!columnDescriptors && !rowDescriptors && this.measuresAxis() === "rows" && hasColumnTuples) {
                axes = {
                    columns: {},
                    rows: axes.columns
                };
            }

            this._axes = {
                columns: normalizeAxis(this._axes.columns),
                rows: normalizeAxis(this._axes.rows)
            };

            axes = {
                columns: normalizeAxis(axes.columns),
                rows: normalizeAxis(axes.rows)
            };

            data = this._normalizeData(data, axes.columns.tuples.length, axes.rows.tuples.length);

            if (this._lastExpanded == "rows") {
                tuples = axes.columns.tuples;
                measures = this._columnMeasures();
                resultAxis = validateAxis(axes.columns, this._axes.columns, measures);

                if (resultAxis) {
                    axisToSkip = "columns";
                    axes.columns = resultAxis;
                    adjustDataByColumn(tuples, resultAxis.tuples, axes.rows.tuples.length, measures, data);
                    data = this._normalizeData(data, membersCount(axes.columns.tuples, measures), axes.rows.tuples.length);
                }
            } else if (this._lastExpanded == "columns") {
                tuples = axes.rows.tuples;
                measures = this._rowMeasures();
                resultAxis = validateAxis(axes.rows, this._axes.rows, measures);

                if (resultAxis) {
                    axisToSkip = "rows";
                    axes.rows = resultAxis;
                    adjustDataByRow(tuples, resultAxis.tuples, axes.columns.tuples.length, measures, data);
                    data = this._normalizeData(data, membersCount(axes.rows.tuples, measures), axes.columns.tuples.length);
                }
            }

            this._lastExpanded = null;

            var result = this._mergeAxes(axes, data, axisToSkip);
            this._axes = result.axes;

            return result.data;
        },

        _readData: function(data) {
            var axes = this.reader.axes(data);
            var newData = this.reader.data(data);

            return this._processResult(newData, axes);
        },

        _mergeAxes: function(sourceAxes, data, axisToSkip) {
            var columnMeasures = this._columnMeasures();
            var rowMeasures = this._rowMeasures();
            var axes = this.axes();
            var startIndex, tuples;

            var newRowsLength = sourceAxes.rows.tuples.length;
            var oldColumnsLength = membersCount(axes.columns.tuples, columnMeasures);
            var newColumnsLength = sourceAxes.columns.tuples.length;

            if (axisToSkip == "columns") {
                newColumnsLength = oldColumnsLength;
                tuples = sourceAxes.columns.tuples;
            } else {
                tuples = parseSource(sourceAxes.columns.tuples, columnMeasures);
                data = prepareDataOnColumns(tuples, data);
            }
            var mergedColumns = mergeTuples(axes.columns.tuples, tuples, columnMeasures);

            if (axisToSkip == "rows") {
                newRowsLength = membersCount(sourceAxes.rows.tuples, rowMeasures);
                tuples = sourceAxes.rows.tuples;
            } else {
                tuples = parseSource(sourceAxes.rows.tuples, rowMeasures);
                data = prepareDataOnRows(tuples, data);
            }
            var mergedRows = mergeTuples(axes.rows.tuples, tuples, rowMeasures);

            axes.columns.tuples = mergedColumns.tuples;
            axes.rows.tuples = mergedRows.tuples;

            if (oldColumnsLength !== membersCount(axes.columns.tuples, columnMeasures)) {
                //columns are expanded
                startIndex = mergedColumns.index + findDataIndex(mergedColumns.parsedRoot, mergedColumns.memberIndex, columnMeasures);
                var offset = oldColumnsLength + newColumnsLength;
                data = this._mergeColumnData(data, startIndex, newRowsLength, newColumnsLength, offset);
            } else {
                //rows are expanded
                startIndex = mergedRows.index + findDataIndex(mergedRows.parsedRoot, mergedRows.memberIndex, rowMeasures);
                data = this._mergeRowData(data, startIndex, newRowsLength, newColumnsLength);
            }

            return {
                axes: axes,
                data: data
            };
        },

        _mergeColumnData: function(newData, columnIndex, rowsLength, columnsLength, offset) {
            var data = this.data().toJSON();
            var rowIndex, index, drop = 0, toAdd;
            var columnMeasures = Math.max(this._columnMeasures().length, 1);

            rowsLength = Math.max(rowsLength, 1);

            if (data.length > 0) {
                //if there is already data, drop the first new data item
                drop = columnMeasures;
                offset -= columnMeasures;
            }

            for (rowIndex = 0; rowIndex < rowsLength; rowIndex++) {
                index = columnIndex + (rowIndex * offset);
                toAdd = newData.splice(0, columnsLength);
                toAdd.splice(0, drop);
                [].splice.apply(data, [index, 0].concat(toAdd));
            }

            return data;
        },

        _mergeRowData: function(newData, rowIndex, rowsLength, columnsLength) {
            var data = this.data().toJSON();
            var idx, dataIndex, toAdd;
            var rowMeasures = Math.max(this._rowMeasures().length, 1);

            columnsLength = Math.max(columnsLength, 1);
            if (data.length > 0) {
                //if there is already data, drop the first new data item
                rowsLength -= rowMeasures;
                newData.splice(0, columnsLength * rowMeasures);
            }

            for (idx = 0; idx < rowsLength; idx++) {
                toAdd = newData.splice(0, columnsLength);
                dataIndex = (rowIndex * columnsLength) + (idx * columnsLength);
                [].splice.apply(data, [dataIndex, 0].concat(toAdd));
            }

            return data;
        },

        _columnMeasures: function() {
            var measures = this.measures();
            var columnMeasures = [];

            if (this.measuresAxis() === "columns") {
                if (this.columns().length === 0) {
                    columnMeasures = measures;
                } else if (measures.length > 1) {
                    columnMeasures = measures;
                }
            }

            return columnMeasures;
        },

        _rowMeasures: function() {
            var measures = this.measures();
            var rowMeasures = [];

            if (this.measuresAxis() === "rows") {
                if (this.rows().length === 0) {
                    rowMeasures = measures;
                } else if (measures.length > 1) {
                    rowMeasures = measures;
                }
            }

            return rowMeasures;
        },

        _updateLocalData: function(data, state) {
            if (this.cubeBuilder) {
                if (state) {
                    this._requestData = state;
                }
                data = this._processResult(data);
            }

            this._data = this._observe(data);

            this._ranges = [];
            this._addRange(this._data);

            this._total = this._data.length;
            this._pristineTotal = this._total;
            this._process(this._data);
        },

        data: function(value) {
            var that = this;
            if (value !== undefined) {
                this._pristineData = value.slice(0);
                this._updateLocalData(value, {
                        columns: this.columns(),
                        rows: this.rows(),
                        measures: this.measures()
                    });
            } else {
                return that._data;
            }
        },

        _normalizeData: function(data, columns, rows) {
            var cell, idx, length;
            var axesLength = (columns || 1) * (rows || 1);
            var result = new Array(axesLength);

            if (data.length === axesLength) {
                return data;
            }

            for (idx = 0, length = result.length; idx < length; idx++) {
                result[idx] = { value: "", fmtValue: "", ordinal: idx };
            }

            for (idx = 0, length = data.length; idx < length; idx++) {
               cell = data[idx];
               result[cell.ordinal] = cell;
            }

            return result;
        },

        discover: function(options, converter) {
            var that = this,
                transport = that.transport;

            return $.Deferred(function(deferred) {
                transport.discover(extend({
                    success: function(response) {
                       response = that.reader.parse(response);

                        if (that._handleCustomErrors(response)) {
                            return;
                        }

                        if (converter) {
                            response = converter(response);
                        }
                        deferred.resolve(response);
                    },
                    error: function(response, status, error) {
                        deferred.reject(response);
                        that.error(response, status, error);
                    }
                }, options));
            }).promise().done(function() {
                that.trigger("schemaChange");
            });
        },

        schemaMeasures: function() {
            var that = this;

            return that.discover({
                data: {
                    command: "schemaMeasures",
                    restrictions: {
                        catalogName: that.transport.catalog(),
                        cubeName: that.transport.cube()
                    }
                }
            }, function(response) {
                return that.reader.measures(response);
            });
        },

        schemaDimensions: function() {
            var that = this;

            return that.discover({
                data: {
                    command: "schemaDimensions",
                    restrictions: {
                        catalogName: that.transport.catalog(),
                        cubeName: that.transport.cube()
                    }
                }
            }, function(response) {
                return that.reader.dimensions(response);
            });
        },

        schemaHierarchies: function(dimensionName) {
            var that = this;

            return that.discover({
                data: {
                    command: "schemaHierarchies",
                    restrictions: {
                        catalogName: that.transport.catalog(),
                        cubeName: that.transport.cube(),
                        dimensionUniqueName: dimensionName
                    }
                }
            }, function(response) {
                return that.reader.hierarchies(response);
            });
        },

        schemaLevels: function(hierarchyName) {
            var that = this;

            return that.discover({
                data: {
                    command: "schemaLevels",
                    restrictions: {
                        catalogName: that.transport.catalog(),
                        cubeName: that.transport.cube(),
                        hierarchyUniqueName: hierarchyName
                    }
                }
            }, function(response) {
                return that.reader.levels(response);
            });
        },

        schemaCubes: function() {
            var that = this;

            return that.discover({
                data: {
                    command: "schemaCubes",
                    restrictions: {
                        catalogName: that.transport.catalog()
                    }
                }
            }, function(response) {
                return that.reader.cubes(response);
            });
        },

        schemaCatalogs: function() {
            var that = this;

            return that.discover({
                data: {
                    command: "schemaCatalogs"
                }
            }, function(response) {
                return that.reader.catalogs(response);
            });
        },

        schemaMembers: function(restrictions) {
            var that = this;

            return that.discover({
                data: {
                    command: "schemaMembers",
                    restrictions: extend({
                       catalogName: that.transport.catalog(),
                       cubeName: that.transport.cube()
                   }, restrictions)
                }
            }, function(response) {
                return that.reader.members(response);
            });
        },

        _params: function(data) {
            if (this._clearAxesData) {
                this._axes = {};
                this._data = this._observe([]);
                this._clearAxesData = false;
                this.trigger(STATERESET);
            }

            var options = DataSource.fn._params.call(this, data);

            options = extend({
                measures: this.measures(),
                measuresAxis: this.measuresAxis(),
                columns: this.columns(),
                rows: this.rows()
            }, options);

            if (this.cubeBuilder) {
                this._requestData = options;
            }

            return options;
        }
    });

    function validateAxis(newAxis, axis, measures) {
        if (newAxis.tuples.length < membersCount(axis.tuples, measures)) {

            return axis;
        }

        return;
    }

    function adjustDataByColumn(sourceTuples, targetTuples, rowsLength, measures, data) {
        var columnIdx, rowIdx, dataIdx;
        var columnsLength = sourceTuples.length;
        var targetColumnsLength = membersCount(targetTuples, measures);
        var measuresLength = measures.length || 1;

        for (rowIdx = 0; rowIdx < rowsLength; rowIdx++) {
            for (columnIdx = 0; columnIdx < columnsLength; columnIdx++) {
                dataIdx = tupleIndex(sourceTuples[columnIdx], targetTuples) * measuresLength;
                dataIdx += columnIdx % measuresLength;

                data[rowIdx * columnsLength + columnIdx].ordinal = rowIdx * targetColumnsLength + dataIdx;
            }
        }
    }

    function adjustDataByRow(sourceTuples, targetTuples, columnsLength, measures, data) {
        var columnIdx, rowIdx, dataIdx;
        var rowsLength = sourceTuples.length;
        var targetRowsLength = membersCount(targetTuples, measures);
        var measuresLength = measures.length || 1;

        for (rowIdx = 0; rowIdx < rowsLength; rowIdx++) {
            dataIdx = tupleIndex(sourceTuples[rowIdx], targetTuples);
            dataIdx *= measuresLength;
            dataIdx += rowIdx % measuresLength;

            for (columnIdx = 0; columnIdx < columnsLength; columnIdx++) {
                data[rowIdx * columnsLength + columnIdx].ordinal = dataIdx * columnsLength + columnIdx;
            }
        }
    }

    function tupleIndex(tuple, collection) {
        return findExistingTuple(collection, tuple).index;
    }

    function membersCount(tuples, measures) {
        if (!tuples.length) {
            return 0;
        }

        var queue = tuples.slice();
        var current = queue.shift();
        var idx, length, result = 1;

        while (current) {
            if (current.members) {
                [].push.apply(queue, current.members);
            } else if (current.children) {
                if (!current.measure) {
                    result += current.children.length;
                }
                [].push.apply(queue, current.children);
            }

            current = queue.shift();
        }

        if (measures.length) {
            result = result * measures.length;
        }

        return result;
    }

    function normalizeAxis(axis) {
        if (!axis) {
            axis = {
                tuples: []
            };
        }

        if (!axis.tuples) {
            axis.tuples = [];
        }

        return axis;
    }

    function findDataIndex(tuple, memberIndex, measures) {
        if (!tuple) {
            return 0;
        }

        var counter = Math.max(measures.length, 1);
        var tuples = tuple.members.slice(0, memberIndex);
        var current = tuples.shift();

        while (current) {
            if (current.children) {
                //is member
                [].push.apply(tuples, current.children);
            } else {
                //is tuple
                counter ++;
                [].push.apply(tuples, current.members);
            }

            current = tuples.shift();
        }

        return counter;
    }

    function mergeTuples(target, source, measures) {
        if (!source[0]) {
            return {
                parsedRoot: null,
                tuples: target,
                memberIndex: 0,
                index: 0
            };
        }

        var result = findExistingTuple(target, source[0]);

        if (!result.tuple) {
            return {
                parsedRoot: null,
                tuples: source,
                memberIndex: 0,
                index: 0
            };
        }

        var targetMembers = result.tuple.members;
        var sourceMembers = source[0].members;
        var memberIndex = -1;

        if (targetMembers.length !== sourceMembers.length) {
            return {
                parsedRoot: null,
                tuples: source,
                memberIndex: 0,
                index: 0
            };
        }

        for (var idx = 0, length = targetMembers.length; idx < length; idx++) {
            if (!targetMembers[idx].measure && sourceMembers[idx].children[0]) {
                if (memberIndex == -1 && sourceMembers[idx].children.length) {
                    memberIndex = idx;
                }

                targetMembers[idx].children = sourceMembers[idx].children;
            }
        }

        measures = Math.max(measures.length, 1);

        return {
            parsedRoot: result.tuple,
            index: result.index * measures,
            memberIndex: memberIndex,
            tuples: target
        };
    }

    function equalTuples(first, second) {
        var equal = true;
        var idx, length;

        first = first.members;
        second = second.members;

        for (idx = 0, length = first.length; idx < length; idx++) {
            if (first[idx].measure || second[idx].measure) {
                continue;
            }
            equal = equal && (first[idx].name === second[idx].name);
        }

        return equal;
    }

    function findExistingTuple(tuples, toFind) {
        var idx, length, tuple, found, counter = 0;
        var memberIndex, membersLength, member;

        for (idx = 0, length = tuples.length; idx < length; idx++) {
            tuple = tuples[idx];
            if (equalTuples(tuple, toFind)) {
                return {
                    tuple: tuple,
                    index: counter
                };
            }

            counter ++;

            for (memberIndex = 0, membersLength = tuple.members.length; memberIndex < membersLength; memberIndex++) {
                member = tuple.members[memberIndex];
                if (member.measure) {
                    //counter += member.children.length;
                    continue;
                }
                found = findExistingTuple(member.children, toFind);
                counter += found.index;
                if (found.tuple) {
                    return {
                        tuple: found.tuple,
                        index: counter
                    };
                }
            }
        }

        return {
            index: counter
        };
    }

    function addMembers(members, map) {
        var member, i, len, path = "";
        for (i = 0, len = members.length; i < len; i++) {
            member = members[i];
            path += member.name;
            if (!map[path]) {
                map[path] = member;
            }
        }
    }

    function findParentMember(tuple, map) {
        var members = tuple.members;
        var i, len, member, path = "";
        var parentPath = "";
        var parentMember;

        for (i = 0, len = members.length; i < len; i++) {
            member = members[i];
            if (parentMember) {
                if (map[path + member.name]) {
                    path += member.name;
                    parentMember = map[path];
                    continue;
                } else if (map[path + member.parentName]) {
                    return map[path + member.parentName];
                } else {
                    if (member.parentName) {
                        parentPath += member.parentName;
                    }
                    return map[parentPath];
                }
            }

            path += member.name;
            parentMember = map[member.parentName];

            if (!parentMember) {
                parentMember = map[path];
                if (!parentMember) {
                    return null;
                }
            }

            if (parentMember) {
                parentPath += parentMember.name;
            }
        }

        return parentMember;
    }

    function measurePosition(tuple, measures) {
        if (measures.length === 0) {
            return -1;
        }

        var measure = measures[0];
        var members = tuple.members;
        for (var idx = 0, len = members.length; idx < len; idx ++) {
            if (members[idx].name == measure) {
                return idx;
            }
        }
    }

    function normalizeMeasures(tuple, index) {
        if (index < 0) {
            return;
        }
        var member = {
            name: "Measures",
            measure: true,
            children: [
                $.extend({ members: [], dataIndex: tuple.dataIndex }, tuple.members[index])
            ]
        };
        tuple.members.splice(index, 1, member);
        tuple.dataIndex = undefined;
    }

    function parseSource(tuples, measures) {
        if (tuples.length < 1) {
            return [];
        }
        var result = [];
        var map = { };
        var measureIndex = measurePosition(tuples[0], measures);

        for (var i = 0; i < tuples.length; i++) {
            var tuple = tuples[i];

            //keep the old data index of the tuple
            tuple.dataIndex = i;

            normalizeMeasures(tuple, measureIndex);
            var parentMember = findParentMember(tuple, map);

            if (parentMember) {
                if (measureIndex < 0 || !parentMember.measure) {
                    parentMember.children.push(tuple);
                } else {
                    parentMember.children.push(tuple.members[measureIndex].children[0]);
                }
            } else {
                result.push(tuple);
            }

            addMembers(tuple.members, map);
        }

        return result;
    }

    function prepareDataOnRows(tuples, data) {
        if (!tuples || !tuples.length) {
            return data;
        }

        var result = [];
        var indices = buildDataIndices(tuples);
        var rowsLength = indices.length;
        var columnsLength = Math.max(data.length / rowsLength, 1);
        var rowIndex, columnIndex, targetIndex, sourceIndex;

        for (rowIndex = 0; rowIndex < rowsLength; rowIndex++) {
            targetIndex = columnsLength * rowIndex;
            sourceIndex = columnsLength * indices[rowIndex];
            for (columnIndex = 0; columnIndex < columnsLength; columnIndex++) {
                result[targetIndex + columnIndex] = data[sourceIndex + columnIndex];
            }
        }

        return result;
    }

    function prepareDataOnColumns(tuples, data) {
        if (!tuples || !tuples.length) {
            return data;
        }

        var result = [];
        var indices = buildDataIndices(tuples);
        var columnsLength = indices.length;
        var rowsLength = Math.max(data.length / columnsLength, 1);
        var columnIndex, rowIndex, dataIndex;

        for (rowIndex = 0; rowIndex < rowsLength; rowIndex++) {
            dataIndex = columnsLength * rowIndex;
            for (columnIndex = 0; columnIndex < columnsLength; columnIndex++) {
                result[dataIndex + columnIndex] = data[indices[columnIndex] + dataIndex];
            }
        }

        return result;
    }

    function buildDataIndices(tuples) {
        tuples = tuples.slice();
        var result = [];
        var tuple = tuples.shift();
        var idx, length, spliceIndex, children, member;

        while (tuple) {
            //required for multiple measures
            if (tuple.dataIndex !== undefined) {
                result.push(tuple.dataIndex);
            }

            spliceIndex = 0;
            for (idx = 0, length = tuple.members.length; idx < length; idx++) {
                member = tuple.members[idx];
                children = member.children;
                if (member.measure) {
                    [].splice.apply(tuples, [0, 0].concat(children));
                } else {
                    [].splice.apply(tuples, [spliceIndex, 0].concat(children));
                }
                spliceIndex += children.length;
            }

            tuple = tuples.shift();
        }

        return result;
    }

    PivotDataSource.create = function(options) {
        options = options && options.push ? { data: options } : options;

        var dataSource = options || {},
            data = dataSource.data;

        dataSource.data = data;

        if (!(dataSource instanceof PivotDataSource) && dataSource instanceof kendo.data.DataSource) {
            throw new Error("Incorrect DataSource type. Only PivotDataSource instances are supported");
        }

        return dataSource instanceof PivotDataSource ? dataSource : new PivotDataSource(dataSource);
    };

    function transformDescriptors(members, mapFunction) {
        var result = [];

        for (var idx = 0; idx < members.length; idx++) {
            result.push(mapFunction(members[idx]));
        }

        return result;
    }

    function baseHierarchyPath(memberName) {
        var parts = memberName.split(".");
        if (parts.length > 2) {
            return parts[0] + "." + parts[1];
        }
        return memberName;
    }

    function trimSameHierarchyChildDescriptors(members) {
        var result = members.slice(0);

        for (var idx = 0; idx < members.length; idx++) {
            var hierarchyName = baseHierarchyPath(members[idx].name);

            var j = idx + 1;
            while(j < result.length) {
                if (result[j].name.indexOf(hierarchyName) === 0) {
                    result.splice(j, 1);
                } else {
                    j++;
                }
            }
        }

        return result;
    }

    function trimSameHierarchyChildDescriptorsForName(members, memberName) {
        var result = [];

        for (var idx = 0; idx < members.length; idx++) {
            var name = members[idx].name;
            var hierarchyName = baseHierarchyPath(memberName);

            if (memberName == name || name.indexOf(hierarchyName) !== 0) {
                result.push(members[idx]);
            }
        }

        return result;
    }

    function sameHierarchyDescriptors(members) {
        var same = {};

        for (var idx = 0; idx < members.length; idx++) {
            var name = members[idx].name;
            var hierarchyName = baseHierarchyPath(name);

            for (var j = 0; j < members.length; j++) {
                var memberName = members[j].name;
                if (memberName.indexOf(hierarchyName) === 0 && memberName !== name) {
                    same[name] = members[idx];
                }
            }
        }

        var result = [];

        for (var key in same) {
            result.push(same[key]);
        }

        return result;
    }


    function expandMemberDescriptor(members, memberNames) {
        return transformDescriptors(members, function(member) {
            var name = member.name;

            var found = false;

            for (var idx = 0; idx < memberNames.length; idx++) {
                if (name === memberNames[idx]) {
                    found = true;
                    break;
                }
            }

            if (member.expand && found) {
                name += ".Children";
            }

            return name;
        });
    }

    function expandDescriptors(members) {
        return transformDescriptors(members, function(member) {
            var name = member.name;

            if (member.expand) {
                name += ".Children";
            }
            return name;
        });
    }

    function convertMemberDescriptors(members) {
        return transformDescriptors(members, function(member) {
            return member.name;
        });
    }

    function crossJoin(names) {
        var result = "CROSSJOIN({";
        var r;
        if (names.length > 2) {
            r = names.pop();
            result += crossJoin(names);
        } else {
            result += names.shift();
            r = names.pop();
        }
        result += "},{";
        result += r;
        result += "})";
        return result;
    }

    function crossJoinCommand(members, measures) {
        var tmp = members;
        if (measures.length > 1) {
            tmp.push("{" + measures.join(",") + "}");
        }
        return crossJoin(tmp);
    }

    function expandedMembers(members) {
        var result = [];

        for (var idx = 0; idx < members.length; idx++) {
            if (members[idx].expand) {
                result.push(members[idx]);
            }
        }

        return result;
    }

    function serializeMembers(members, measures) {
        var command = "";

        members = members || [];

        var memberNames = convertMemberDescriptors(trimSameHierarchyChildDescriptors(members));
        var expandedColumns = expandedMembers(members);

        if (memberNames.length > 1 || measures.length > 1) {
            command += crossJoinCommand(memberNames, measures);

            if (expandedColumns.length) {
                var start = 0;
                var idx;
                var j;
                var name;

                var expandedMemberNames = [];
                var sameHierarchyMembers = sameHierarchyDescriptors(members);

                var generatedMembers = [];

                for (idx = 0; idx < expandedColumns.length; idx++) {

                    for (j=start; j < expandedColumns.length; j++) {
                        name = expandedColumns[j].name;

                        var tmpMembers = trimSameHierarchyChildDescriptors(members);

                        if ($.inArray(expandedColumns[j], sameHierarchyMembers) > -1) {
                            tmpMembers = trimSameHierarchyChildDescriptorsForName(members, name);
                        }

                        var tmp = crossJoinCommand(expandMemberDescriptor(tmpMembers, expandedMemberNames.concat(name)), measures);
                        if ($.inArray(tmp, generatedMembers) == -1) {
                            command += ",";
                            command += tmp;
                            generatedMembers.push(tmp);
                        }
                    }
                    start++;

                    expandedMemberNames.push(expandedColumns[idx].name);
                    expandedMemberNames.shift();
                }
            }
        } else {
            if (expandedColumns.length) {
                memberNames = memberNames.concat(expandDescriptors(members));
            }
            command += memberNames.join(",");
        }

        return command;
    }

    var filterFunctionFormats = {
        contains: ", InStr({0}.CurrentMember.MEMBER_CAPTION,\"{1}\") > 0",
        doesnotcontain: ", InStr({0}.CurrentMember.MEMBER_CAPTION,\"{1}\") = 0",
        startswith: ", Left({0}.CurrentMember.MEMBER_CAPTION,Len(\"{1}\"))=\"{1}\"",
        endswith: ", Right({0}.CurrentMember.MEMBER_CAPTION,Len(\"{1}\"))=\"{1}\"",
        eq: ", {0}.CurrentMember.MEMBER_CAPTION = \"{1}\"",
        neq: ", NOT {0}.CurrentMember.MEMBER_CAPTION = \"{1}\""
    };

    function serializeExpression(expression) {
        var command = "";
        var value = expression.value;
        var field = expression.field;
        var operator = expression.operator;

        if (operator == "in") {
            command += "{";
            command += value;
            command += "}";
        } else {
            command += "Filter(";
            command += field + ".Children";
            command += kendo.format(filterFunctionFormats[operator], field, value);
            command += ")";
        }

        return command;
    }

    function serializeFilters(filter, cube) {
        var command = "", current;
        var filters = filter.filters;
        var length = filters.length;
        var idx;

        for (idx = length - 1; idx >= 0; idx--) {

            current = "SELECT (";
            current += serializeExpression(filters[idx]);
            current += ") ON 0";

            if (idx == length - 1) {
                current += " FROM [" + cube + "]";
                command = current;
            } else {
                command = current + " FROM ( " + command + " )";
            }
        }

        return command;
    }

    function serializeOptions(parentTagName, options, capitalize) {
        var result = "";

        if (options) {
            result += "<" + parentTagName + ">";
            var value;
            for (var key in options) {
                value = options[key] ;
                if (capitalize) {
                    key = key.replace(/([A-Z]+(?=$|[A-Z][a-z])|[A-Z]?[a-z]+)/g, "$1_").toUpperCase().replace(/_$/, "");
                }
                result += "<" + key + ">" + value + "</" + key + ">";
            }
            result += "</" + parentTagName + ">";
        } else {
            result += "<" + parentTagName + "/>";
        }
        return result;
    }

    var xmlaDiscoverCommands = {
        schemaCubes: "MDSCHEMA_CUBES",
        schemaCatalogs: "DBSCHEMA_CATALOGS",
        schemaMeasures: "MDSCHEMA_MEASURES",
        schemaDimensions: "MDSCHEMA_DIMENSIONS",
        schemaHierarchies: "MDSCHEMA_HIERARCHIES",
        schemaLevels: "MDSCHEMA_LEVELS",
        schemaMembers: "MDSCHEMA_MEMBERS"
    };

    var convertersMap = {
        read: function(options, type) {
            var command = '<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/"><Header/><Body><Execute xmlns="urn:schemas-microsoft-com:xml-analysis"><Command><Statement>';

            command += "SELECT NON EMPTY {";

            var columns = options.columns || [];
            var rows = options.rows || [];

            var measures = options.measures || [];
            var measuresRowAxis = options.measuresAxis === "rows";

            if (!columns.length && rows.length && (!measures.length || (measures.length && measuresRowAxis))) {
                columns = rows;
                rows = [];
                measuresRowAxis = false;
            }

            if (!columns.length && !rows.length) {
                measuresRowAxis = false;
            }

            if (columns.length) {
                command += serializeMembers(columns, !measuresRowAxis ? measures : []);
            } else if (measures.length && !measuresRowAxis) {
                command += measures.join(",");
            }

            command += "} DIMENSION PROPERTIES CHILDREN_CARDINALITY, PARENT_UNIQUE_NAME ON COLUMNS";

            if (rows.length || (measuresRowAxis && measures.length > 1)) {
                command += ", NON EMPTY {";

                if (rows.length) {
                    command += serializeMembers(rows, measuresRowAxis ? measures : []);
                } else {
                    command += measures.join(",");
                }

                command += "} DIMENSION PROPERTIES CHILDREN_CARDINALITY, PARENT_UNIQUE_NAME ON ROWS";
            }

            if (options.filter) {
                command += " FROM ";
                command += "(";
                command += serializeFilters(options.filter, options.connection.cube);
                command += ")";
            } else {
                command += " FROM [" + options.connection.cube + "]";
            }

            if (measures.length == 1 && columns.length) {
                command += " WHERE (" + measures.join(",") + ")";
            }

            command += '</Statement></Command><Properties><PropertyList><Catalog>' + options.connection.catalog + '</Catalog><Format>Multidimensional</Format></PropertyList></Properties></Execute></Body></Envelope>';
            return command.replace(/\&/g, "&amp;");
        },
        discover: function(options, type) {
            options = options || {};

            var command = '<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/"><Header/><Body><Discover xmlns="urn:schemas-microsoft-com:xml-analysis">';
            command += "<RequestType>" + (xmlaDiscoverCommands[options.command] || options.command) + "</RequestType>";

            command += "<Restrictions>" + serializeOptions("RestrictionList", options.restrictions, true) + "</Restrictions>";

            if (options.connection && options.connection.catalog) {
                options.properties = $.extend({}, {
                    Catalog: options.connection.catalog
                }, options.properties);
            }

            command += "<Properties>" + serializeOptions("PropertyList", options.properties) + "</Properties>";

            command += '</Discover></Body></Envelope>';
            return command;
        }
    };

    var XmlaTransport = kendo.data.RemoteTransport.extend({
        init: function(options) {
            var originalOptions = options;

            options = this.options = extend(true, {}, this.options, options);

            kendo.data.RemoteTransport.call(this, options);

            if (isFunction(originalOptions.discover)) {
                this.discover = originalOptions.discover;
            } else if (typeof originalOptions.discover === "string") {
                this.options.discover = {
                    url: originalOptions.discover
                };
            } else if (!originalOptions.discover) {
                this.options.discover = this.options.read;
            }
        },
        setup: function(options, type) {
            options.data = options.data || {};
            $.extend(true, options.data, { connection: this.options.connection });

            return kendo.data.RemoteTransport.fn.setup.call(this, options, type);
        },
        options: {
            read: {
                dataType: "text",
                contentType: "text/xml",
                type: "POST"
            },
            discover: {
                dataType: "text",
                contentType: "text/xml",
                type: "POST"
            },
            parameterMap: function(options, type) {
                return convertersMap[type](options,type);
            }
        },

        discover: function(options) {
            return $.ajax(this.setup(options, "discover"));
        }
    });

    function asArray(object) {
        if (object == null) {
            return [];
        }

        var type = toString.call(object);
        if (type !== "[object Array]") {
            return [object];
        }

        return object;
    }

    function translateAxis(axis) {
        var result = { tuples: [] };
        var tuples = asArray(kendo.getter("Tuples.Tuple", true)(axis));
        var captionGetter = kendo.getter("Caption['#text']");
        var unameGetter = kendo.getter("UName['#text']");
        var levelNameGetter = kendo.getter("LName['#text']");
        var levelNumGetter = kendo.getter("LNum['#text']");
        var childrenGetter = kendo.getter("CHILDREN_CARDINALITY['#text']", true);
        var hierarchyGetter = kendo.getter("['@Hierarchy']");
        var parentNameGetter = kendo.getter("PARENT_UNIQUE_NAME['#text']", true);

        for (var idx = 0; idx < tuples.length; idx++) {
            var members = [];
            var member = asArray(tuples[idx].Member);
            for (var memberIdx = 0; memberIdx < member.length; memberIdx++) {
                members.push({
                    children: [],
                    caption: captionGetter(member[memberIdx]),
                    name: unameGetter(member[memberIdx]),
                    levelName: levelNameGetter(member[memberIdx]),
                    levelNum: levelNumGetter(member[memberIdx]),
                    hasChildren: parseInt(childrenGetter(member[memberIdx]), 10) > 0,
                    parentName: parentNameGetter(member[memberIdx]),
                    hierarchy: hierarchyGetter(member[memberIdx])
                });
            }

            result.tuples.push({ members: members });
        }
        return result;
    }

    var schemaDataReaderMap = {
        cubes: {
            name: kendo.getter("CUBE_NAME['#text']", true),
            caption: kendo.getter("CUBE_CAPTION['#text']", true),
            description: kendo.getter("DESCRIPTION['#text']", true),
            type: kendo.getter("CUBE_TYPE['#text']", true)
        },
        catalogs: {
            name: kendo.getter("CATALOG_NAME['#text']", true),
            description: kendo.getter("DESCRIPTION['#text']", true)
        },
        measures: {
            name: kendo.getter("MEASURE_NAME['#text']", true),
            caption: kendo.getter("MEASURE_CAPTION['#text']", true),
            uniqueName: kendo.getter("MEASURE_UNIQUE_NAME['#text']", true),
            description: kendo.getter("DESCRIPTION['#text']", true),
            aggregator: kendo.getter("MEASURE_AGGREGATOR['#text']", true),
            groupName: kendo.getter("MEASUREGROUP_NAME['#text']", true),
            displayFolder: kendo.getter("MEASURE_DISPLAY_FOLDER['#text']", true),
            defaultFormat: kendo.getter("DEFAULT_FORMAT_STRING['#text']", true)
        },
        dimensions: {
            name: kendo.getter("DIMENSION_NAME['#text']", true),
            caption: kendo.getter("DIMENSION_CAPTION['#text']", true),
            description: kendo.getter("DESCRIPTION['#text']", true),
            uniqueName: kendo.getter("DIMENSION_UNIQUE_NAME['#text']", true),
            defaultHierarchy: kendo.getter("DEFAULT_HIERARCHY['#text']", true),
            type: kendo.getter("DIMENSION_TYPE['#text']", true)
//unknown = 0; time = 1; measure = 2; other = 3; quantitative = 5; accounts = 6; customers = 7; products = 8; scenario = 9; utility = 10; currency = 11; rates = 12; channel = 13; promotion = 14; organization = 15; billOfMaterials = 16; geography = 17;

        },
        hierarchies: {
            name: kendo.getter("HIERARCHY_NAME['#text']", true),
            caption: kendo.getter("HIERARCHY_CAPTION['#text']", true),
            description: kendo.getter("DESCRIPTION['#text']", true),
            uniqueName: kendo.getter("HIERARCHY_UNIQUE_NAME['#text']", true),
            dimensionUniqueName: kendo.getter("DIMENSION_UNIQUE_NAME['#text']", true),
            displayFolder: kendo.getter("HIERARCHY_DISPLAY_FOLDER['#text']", true),
            origin: kendo.getter("HIERARCHY_ORIGIN['#text']", true),
            defaultMember: kendo.getter("DEFAULT_MEMBER['#text']", true)
        },
        levels: {
            name: kendo.getter("LEVEL_NAME['#text']", true),
            caption: kendo.getter("LEVEL_CAPTION['#text']", true),
            description: kendo.getter("DESCRIPTION['#text']", true),
            uniqueName: kendo.getter("LEVEL_UNIQUE_NAME['#text']", true),
            dimensionUniqueName: kendo.getter("DIMENSION_UNIQUE_NAME['#text']", true),
            displayFolder: kendo.getter("LEVEL_DISPLAY_FOLDER['#text']", true),
            orderingProperty: kendo.getter("LEVEL_ORDERING_PROPERTY['#text']", true),
            origin: kendo.getter("LEVEL_ORIGIN['#text']", true),
            hierarchyUniqueName: kendo.getter("HIERARCHY_UNIQUE_NAME['#text']", true)
        },
        members: {
            name: kendo.getter("MEMBER_NAME['#text']", true),
            caption: kendo.getter("MEMBER_CAPTION['#text']", true),
            uniqueName: kendo.getter("MEMBER_UNIQUE_NAME['#text']", true),
            dimensionUniqueName: kendo.getter("DIMENSION_UNIQUE_NAME['#text']", true),
            hierarchyUniqueName: kendo.getter("HIERARCHY_UNIQUE_NAME['#text']", true),
            levelUniqueName: kendo.getter("LEVEL_UNIQUE_NAME['#text']", true),
            childrenCardinality: kendo.getter("CHILDREN_CARDINALITY['#text']", true)
        }
    };

    var XmlaDataReader = kendo.data.XmlDataReader.extend({
        parse: function(xml) {
            var result = kendo.data.XmlDataReader.fn.parse(xml.replace(/<(\/?)(\w|-)+:/g, "<$1"));
            return kendo.getter("['Envelope']['Body']", true)(result);
        },
        errors: function(root) {
            var fault = kendo.getter("['Fault']", true)(root);
            if (fault) {
                return [{
                    faultstring: kendo.getter("faultstring['#text']", true)(fault),
                    faultcode: kendo.getter("faultcode['#text']", true)(fault)
                }];
            }
            return null;
        },
        axes: function(root) {
            root = kendo.getter("ExecuteResponse.return.root", true)(root);

            var axes = asArray(kendo.getter("Axes.Axis", true)(root));
            var columns = translateAxis(axes[0]);
            var rows = {};

            if (axes.length > 2) {
                rows = translateAxis(axes[1]);
            }

            return {
                columns: columns,
                rows: rows
            };
        },
        data: function(root) {
            root = kendo.getter("ExecuteResponse.return.root", true)(root);

            var cells = asArray(kendo.getter("CellData.Cell", true)(root));

            var result = [];
            var ordinalGetter = kendo.getter("['@CellOrdinal']");
            var valueGetter = kendo.getter("Value['#text']");
            var fmtValueGetter = kendo.getter("FmtValue['#text']");

            for (var idx = 0; idx < cells.length; idx++) {
                result.push({
                    value: valueGetter(cells[idx]),
                    fmtValue: fmtValueGetter(cells[idx]),
                    ordinal: parseInt(ordinalGetter(cells[idx]), 10)
                });
            }

            return result;
        },
        _mapSchema: function(root, getters) {
            root = kendo.getter("DiscoverResponse.return.root", true)(root);
            var rows = asArray(kendo.getter("row", true)(root));

            var result = [];

            for (var idx = 0; idx < rows.length; idx++) {
                var obj = {};
                for (var key in getters) {
                    obj[key] = getters[key](rows[idx]);
                }
                result.push(obj);
            }

            return result;
        },
        measures: function(root) {
            return this._mapSchema(root, schemaDataReaderMap.measures);
        },
        hierarchies: function(root) {
            return this._mapSchema(root, schemaDataReaderMap.hierarchies);
        },
        levels: function(root) {
            return this._mapSchema(root, schemaDataReaderMap.levels);
        },
        dimensions: function(root) {
            return this._mapSchema(root, schemaDataReaderMap.dimensions);
        },
        cubes: function(root) {
            return this._mapSchema(root, schemaDataReaderMap.cubes);
        },
        catalogs: function(root) {
            return this._mapSchema(root, schemaDataReaderMap.catalogs);
        },
        members: function(root) {
            return this._mapSchema(root, schemaDataReaderMap.members);
        }
    });

    extend(true, kendo.data, {
       PivotDataSource: PivotDataSource,
       XmlaTransport: XmlaTransport,
       XmlaDataReader: XmlaDataReader,
       PivotCubeBuilder: PivotCubeBuilder,
       transports: {
           xmla: XmlaTransport
       },
       readers: {
           xmla: XmlaDataReader
       }
    });

    kendo.ui.PivotSettingTarget = Widget.extend({
        init: function(element, options) {
            Widget.fn.init.call(this, element, options);

            this.element.addClass("k-pivot-setting");

            this.dataSource = kendo.data.PivotDataSource.create(options.dataSource);

            this._refreshHandler = $.proxy(this.refresh, this);
            this.dataSource.first(CHANGE, this._refreshHandler);

            if (!options.template) {
                this.options.template = "<div data-" + kendo.ns + 'name="${data.name || data}">${data.name || data}' +
                    (this.options.enabled ?
                    '<a class="k-button k-button-icon k-button-bare"><span class="k-icon k-setting-delete"></span></a>' : "") + '</div>';
            }

            this.template = kendo.template(this.options.template);
            this.emptyTemplate = kendo.template(this.options.emptyTemplate);

            this._sortable();

            var that = this;

            this.element.on("click" + NS, ".k-setting-delete", function() {
                var name = $(this).closest("[" + kendo.attr("name") + "]").attr(kendo.attr("name"));
                if (name) {
                    that.remove(name);
                }
            });

            if (options.filterable) {
                this.fieldMenu = new ui.PivotFieldMenu(this.element, {
                    messages: this.options.messages.fieldMenu,
                    filter: ".k-setting-filter",
                    dataSource: this.dataSource
                });
            }

            this.refresh();
        },

        options: {
            name: "PivotSettingTarget",
            template: null,
            filterable: false,
            emptyTemplate: "<div class='k-empty'>${data}</div>",
            setting: "columns",
            enabled: true,
            messages: {
                empty: "Drop Fields Here"
            }
        },
        setDataSource: function(dataSource) {
            this.dataSource.unbind(CHANGE, this._refreshHandler);
            this.dataSource = this.options.dataSource = dataSource;

            if (this.fieldMenu) {
                this.fieldMenu.setDataSource(dataSource);
            }
            dataSource.first(CHANGE, this._refreshHandler);

            this.refresh();
        },

        _sortable: function() {
            var that = this;

            if (that.options.enabled) {
                this.sortable = this.element.kendoSortable({
                    connectWith: this.options.connectWith,
                    filter: ">:not(.k-empty)",
                    hint: that.options.hint,
                    cursor: "move",
                    change: function(e) {
                        var name = e.item.attr(kendo.attr("name"));

                        if (e.action == "receive") {
                            that.add(name);
                        } else if (e.action == "remove") {
                            that.remove(name);
                        } else if (e.action == "sort") {
                            that.move(name, e.newIndex);
                        }
                    }
                }).data("kendoSortable");
            }
        },

        _indexOf: function(name, items) {
            var idx, length, index = -1;

            for (idx = 0, length = items.length; idx < length; idx++) {
                if (items[idx].name === name || items[idx] === name) {
                    index = idx;
                    break;
                }
            }
            return index;
        },

        validate: function(data) {
            var isMeasure = (data.type == 2 || "aggregator" in data);

            if (isMeasure) {
                return this.options.setting === "measures";
            }

            if (this.options.setting === "measures") {
                return isMeasure;
            }

            var items = this.dataSource[this.options.setting]();
            var name = data.defaultHierarchy || data.uniqueName;
            if (this._indexOf(name, items) > -1) {
                return false;
            }

            items = this.dataSource[this.options.setting === "columns" ? "rows" : "columns"]();
            if (this._indexOf(name, items) > -1) {
                return false;
            }

            return true;
        },

        add: function(name) {
            var items = this.dataSource[this.options.setting]();
            var idx = this._indexOf(name, items);

            if (idx == -1) {
                items.push(name);
                this.dataSource[this.options.setting](items);
            }
        },

        move: function(name, index) {
            var items = this.dataSource[this.options.setting]();

            var idx = this._indexOf(name, items);

            if (idx > -1) {
                items.splice(idx, 1);
                items.splice(index, 0, name);
                this.dataSource[this.options.setting](items);
            }
        },

        remove: function(name) {
            var items = this.dataSource[this.options.setting]();

            var idx = this._indexOf(name, items);
            if (idx > -1) {
                items.splice(idx, 1);
                this.dataSource[this.options.setting](items);
            }
        },

        refresh: function() {
            var items = this.dataSource[this.options.setting]();

            var html = this.emptyTemplate(this.options.messages.empty);

            if (items.length) {
                html = kendo.render(this.template, items);
            }

            this.element.html(html);
        },

        destroy: function() {
            Widget.fn.destroy.call(this);

            this.dataSource.unbind(CHANGE, this._refreshHandler);
            this.element.off(NS);

            if (this.sortable) {
                this.sortable.destroy();
            }

            if (this.fieldMenu) {
                this.fieldMenu.destroy();
            }

            this.element = null;
            this._refreshHandler = null;
        }
    });

    var PivotGrid = Widget.extend({
        init: function(element, options) {
            var that = this;
            var columnBuilder;
            var rowBuilder;

            Widget.fn.init.call(that, element, options);

            that._dataSource();

            that._bindConfigurator();

            that._wrapper();
            that._createLayout();


            that._columnBuilder = columnBuilder = new ColumnBuilder();
            that._rowBuilder = rowBuilder = new RowBuilder();
            that._contentBuilder = new ContentBuilder();

            that._templates();

            that.columnsHeader
                .add(that.rowsHeader)
                .on("click", "span.k-icon", function() {
                    var button = $(this);
                    var builder = columnBuilder;
                    var action = "expandColumn";
                    var eventName;
                    var path = button.attr(kendo.attr("path"));
                    var eventArgs = {
                        axis: "columns",
                        path: $.parseJSON(path)
                    };

                    if (button.parent().is("td")) {
                        builder = rowBuilder;
                        action = "expandRow";
                        eventArgs.axis = "rows";
                    }

                    var expanded = button.hasClass(STATE_EXPANDED);
                    var metadata = builder.metadata[path];
                    var request = metadata.expanded === undefined;

                    eventName = expanded ? COLLAPSEMEMBER : EXPANDMEMBER;
                    if (that.trigger(eventName, eventArgs)) {
                        return;
                    }

                    builder.metadata[path].expanded = !expanded;

                    button.toggleClass(STATE_EXPANDED, !expanded)
                          .toggleClass(STATE_COLLAPSED, expanded);

                    if (!expanded && request) {
                        that.dataSource[action](eventArgs.path);
                    } else {
                        that.refresh();
                    }
                });

            that._scrollable();

            if (that.options.autoBind) {
                that.dataSource.fetch();
            }

            kendo.notify(that);
        },

        events: [
            DATABINDING,
            DATABOUND,
            EXPANDMEMBER,
            COLLAPSEMEMBER
        ],

        options: {
            name: "PivotGrid",
            autoBind: true,
            reorderable: true,
            filterable: false,
            height: null,
            columnWidth: 100,
            configurator: "",
            columnHeaderTemplate: null,
            rowHeaderTemplate: null,
            dataCellTemplate: null,
            messages: {
                measureFields: "Drop Data Fields Here",
                columnFields: "Drop Column Fields Here",
                rowFields: "Drop Rows Fields Here"
            }
        },

        _templates: function() {
            var dataTemplate = this.options.dataCellTemplate;
            var columnTemplate = this.options.columnHeaderTemplate;
            var rowTemplate = this.options.rowHeaderTemplate;

            this._columnBuilder.template = kendo.template(columnTemplate || HEADER_TEMPLATE, { useWithBlock: !!columnTemplate });
            this._contentBuilder.template = kendo.template(dataTemplate || DATACELL_TEMPLATE, { useWithBlock: !!dataTemplate });
            this._rowBuilder.template = kendo.template(rowTemplate || HEADER_TEMPLATE, { useWithBlock: !!rowTemplate });
        },

        _bindConfigurator: function() {
            var configurator = this.options.configurator;
            if (configurator) {
                $(configurator).kendoPivotConfigurator("setDataSource", this.dataSource);
            }
        },

        cellInfoByElement: function(element) {
            element = $(element);

            return this.cellInfo(element.index(), element.parent("tr").index());
        },

        cellInfo: function(columnIndex, rowIndex) {
            var contentBuilder = this._contentBuilder;
            var columnInfo = contentBuilder.columnIndexes[columnIndex || 0];
            var rowInfo = contentBuilder.rowIndexes[rowIndex || 0];
            var dataIndex;

            if (!columnInfo || !rowInfo) {
                return null;
            }

            dataIndex = (rowInfo.index * contentBuilder.rowLength) + columnInfo.index;

            return {
                columnTuple: columnInfo.tuple,
                rowTuple: rowInfo.tuple,
                measure: columnInfo.measure || rowInfo.measure,
                dataItem: this.dataSource.view()[dataIndex]
            };
        },

        setDataSource: function(dataSource) {
            this.options.dataSource = dataSource;

            this._dataSource();

            if (this.measuresTarget) {
                this.measuresTarget.setDataSource(dataSource);
            }

            if (this.rowsTarget) {
                this.rowsTarget.setDataSource(dataSource);
            }

            if (this.columnsTarget) {
                this.columnsTarget.setDataSource(dataSource);
            }

            this._bindConfigurator();

            if (this.options.autoBind) {
                dataSource.fetch();
            }
        },

        setOptions: function(options) {
            Widget.fn.setOptions.call(this, options);

            this._templates();
        },

        _dataSource: function() {
            var that = this;
            var dataSource = that.options.dataSource;

            dataSource = $.isArray(dataSource) ? { data: dataSource } : dataSource;

            if (that.dataSource && this._refreshHandler) {
                that.dataSource.unbind(CHANGE, that._refreshHandler)
                               .unbind(STATERESET, that._stateResetHandler)
                               .unbind(PROGRESS, that._progressHandler)
                               .unbind(ERROR, that._errorHandler);
            } else {
                that._refreshHandler = $.proxy(that.refresh, that);
                that._progressHandler = $.proxy(that._requestStart, that);
                that._stateResetHandler = $.proxy(that._stateReset, that);
                that._errorHandler = $.proxy(that._error, that);
            }

            that.dataSource = kendo.data.PivotDataSource.create(dataSource)
                                   .bind(CHANGE, that._refreshHandler)
                                   .bind(PROGRESS, that._progressHandler)
                                   .bind(STATERESET, that._stateResetHandler)
                                   .bind(ERROR, that._errorHandler);
        },

        _error: function() {
            this._progress(false);
        },

        _requestStart: function() {
            this._progress(true);
        },

        _stateReset: function() {
            this._columnBuilder.reset();
            this._rowBuilder.reset();
        },

        _wrapper: function() {
            this.wrapper = this.element.addClass("k-widget k-pivot");
        },

        _measureFields: function() {
            this.measureFields = $(DIV).addClass("k-pivot-toolbar k-header k-settings-measures");

            this.measuresTarget = this._createSettingTarget(this.measureFields, {
                setting: "measures",
                messages: {
                    empty: this.options.messages.measureFields
                }
            });
        },

        _createSettingTarget: function(element, options) {
            var template = '<span class="k-button" data-' + kendo.ns + 'name="${data.name || data}">${data.name || data}';
            var icons = "";

            if (options.filterable) {
                icons += '<span class="k-icon k-filter k-setting-filter"></span>';
            }
            if (this.options.reorderable) {
                icons += '<span class="k-icon k-si-close k-setting-delete"></span>';
            }

            if (icons) {
                template += '<span class="k-field-actions">' + icons + '</span>';
            }

            template += '</span>';

            return new kendo.ui.PivotSettingTarget(element, $.extend({
                template: template,
                emptyTemplate: '<span class="k-empty">${data}</span>',
                enabled: this.options.reorderable,
                dataSource: this.dataSource
            }, options));
        },

        _initSettingTargets: function() {
            this.columnsTarget = this._createSettingTarget(this.columnFields, {
                connectWith: this.rowFields,
                setting: "columns",
                filterable: this.options.filterable,
                messages: {
                    empty: this.options.messages.columnFields,
                    fieldMenu: this.options.messages.fieldMenu
                }
            });

            this.rowsTarget = this._createSettingTarget(this.rowFields, {
                connectWith: this.columnFields,
                setting: "rows",
                filterable: this.options.filterable,
                messages: {
                    empty: this.options.messages.rowFields,
                    fieldMenu: this.options.messages.fieldMenu
                }
            });
        },

        _createLayout: function() {
            var that = this;
            var layoutTable = $(LAYOUT_TABLE);
            var leftContainer = layoutTable.find(".k-pivot-rowheaders");
            var rightContainer = layoutTable.find(".k-pivot-table");
            var gridWrapper = $(DIV).addClass("k-grid k-widget");

            that._measureFields();
            that.columnFields = $(DIV).addClass("k-pivot-toolbar k-header k-settings-columns");

            that.rowFields = $(DIV).addClass("k-pivot-toolbar k-header k-settings-rows");
            that.columnsHeader = $('<div class="k-grid-header-wrap" />')
                                    .wrap('<div class="k-grid-header" />');

            that.columnsHeader.parent().css("padding-right", kendo.support.scrollbar());

            that.rowsHeader = $('<div class="k-grid k-widget k-alt"/>');
            that.content = $('<div class="k-grid-content" />');

            leftContainer.append(that.measureFields);
            leftContainer.append(that.rowFields);
            leftContainer.append(that.rowsHeader);

            gridWrapper.append(that.columnsHeader.parent());
            gridWrapper.append(that.content);

            rightContainer.append(that.columnFields);
            rightContainer.append(gridWrapper);

            that.wrapper.append(layoutTable);

            that.columnsHeaderTree = new kendo.dom.Tree(that.columnsHeader[0]);
            that.rowsHeaderTree = new kendo.dom.Tree(that.rowsHeader[0]);
            that.contentTree = new kendo.dom.Tree(that.content[0]);

            that._initSettingTargets();
        },

        _progress: function(toggle) {
            kendo.ui.progress(this.wrapper, toggle);
        },

        _resize: function() {
            if (this.content[0].firstChild) {
                this._setSectionsWidth();
                this._setSectionsHeight();
                this._setContentWidth();
                this._setContentHeight();
            }
        },

        _setSectionsWidth: function() {
            var rowsHeader = this.rowsHeader;
            var leftColumn = rowsHeader.parent(".k-pivot-rowheaders").width("auto");
            var width;

            width = Math.max(this.measureFields.outerWidth(), this.rowFields.outerWidth());
            width = Math.max(rowsHeader.children("table").width(), width);

            leftColumn.width(width);
        },

        _setSectionsHeight: function() {
            var measureFieldsHeight = this.measureFields.height("auto").height();
            var columnFieldsHeight = this.columnFields.height("auto").height();
            var rowFieldsHeight = this.rowFields.height("auto").innerHeight();
            var columnsHeight = this.columnsHeader.height("auto").innerHeight();

            var padding = rowFieldsHeight - this.rowFields.height();

            var firstRowHeight = columnFieldsHeight > measureFieldsHeight ? columnFieldsHeight : measureFieldsHeight;
            var secondRowHeight = columnsHeight > rowFieldsHeight ? columnsHeight : rowFieldsHeight;

            this.measureFields.height(firstRowHeight);
            this.columnFields.height(firstRowHeight);
            this.rowFields.height(secondRowHeight - padding);
            this.columnsHeader.height(secondRowHeight);
        },

        _setContentWidth: function() {
            var contentTable = this.content.children("table");
            var contentWidth = this.content.width();

            var rowLength = contentTable.children("colgroup").children().length;

            var minWidth = 100;
            var calculatedWidth = rowLength * this.options.columnWidth;

            if (contentWidth < calculatedWidth) {
                minWidth = Math.ceil((calculatedWidth / contentWidth) * 100);
            }

            contentTable.add(this.columnsHeader.children("table"))
                        .css("min-width", minWidth + "%");

        },

        _setContentHeight: function() {
            var that = this;
            var content = that.content;
            var rowsHeader = that.rowsHeader;
            var height = that.options.height;
            var scrollbar = kendo.support.scrollbar();
            var skipScrollbar = content[0].offsetHeight === content[0].clientHeight;

            if (that.wrapper.is(":visible")) {
                if (!height) {
                    if (skipScrollbar) {
                        scrollbar = 0;
                    }

                    rowsHeader.height(content.height() - scrollbar);
                    return;
                }

                height -= that.columnFields.outerHeight();
                height -= that.columnsHeader.outerHeight();

                if (height <= scrollbar * 2) { // do not set height if proper scrollbar cannot be displayed
                    height = scrollbar * 2 + 1;
                }

                content.height(height);

                if (skipScrollbar) {
                    scrollbar = 0;
                }

                rowsHeader.height(height - scrollbar);
            }
        },

        refresh: function() {
            var that = this;
            var dataSource = that.dataSource;

            var axes = dataSource.axes();
            var columns = (axes.columns || {}).tuples || [];
            var rows = (axes.rows || {}).tuples || [];

            var columnBuilder = that._columnBuilder;
            var rowBuilder = that._rowBuilder;

            var columnAxis = {};
            var rowAxis = {};

            if (that.trigger(DATABINDING, { action: "rebind" } )) {
                return;
            }

            columnBuilder.measures = dataSource._columnMeasures();

            that.columnsHeaderTree.render(columnBuilder.build(columns));
            that.rowsHeaderTree.render(rowBuilder.build(rows));

            columnAxis = {
                indexes: columnBuilder._indexes,
                measures: columnBuilder.measures,
                metadata: columnBuilder.metadata
            };

            rowAxis = {
                indexes: rowBuilder._indexes,
                measures: dataSource._rowMeasures(),
                metadata: rowBuilder.metadata
            };

            that.contentTree.render(that._contentBuilder.build(dataSource.view(), columnAxis, rowAxis));

            that._resize();

            if (that.touchScroller) {
                that.touchScroller.contentResized();
            } else {
                var touchScroller = kendo.touchScroller(that.content);

                if (touchScroller && touchScroller.movable) {
                    that.touchScroller = touchScroller;

                    touchScroller.movable.bind("change", function(e) {
                        that.columnsHeader.scrollLeft(-e.sender.x);
                        that.rowsHeader.scrollTop(-e.sender.y);
                    });
                }
            }

            that._progress(false);

            that.trigger(DATABOUND);
        },

        _scrollable: function() {
            var that = this;
            var columnsHeader = that.columnsHeader;
            var rowsHeader = that.rowsHeader;

            that.content.scroll(function() {
                columnsHeader.scrollLeft(this.scrollLeft);
                rowsHeader.scrollTop(this.scrollTop);
            });

            rowsHeader.bind("DOMMouseScroll" + NS + " mousewheel" + NS, $.proxy(that._wheelScroll, that));
        },

        _wheelScroll: function (e) {
            if (e.ctrlKey) {
                return;
            }

            var delta = kendo.wheelDeltaY(e);
            var scrollTop = this.content.scrollTop();

            if (delta) {
                e.preventDefault();
                //In Firefox DOMMouseScroll event cannot be canceled
                $(e.currentTarget).one("wheel" + NS, false);

                this.rowsHeader.scrollTop(scrollTop + (-delta));
                this.content.scrollTop(scrollTop + (-delta));
            }
        }
    });

    var element = kendo.dom.element;
    var htmlNode = kendo.dom.html;
    var text = kendo.dom.text;

    var createMetadata = function(levelNum, memberIdx) {
       return {
            maxChildren: 0,
            children: 0,
            maxMembers: 0,
            members: 0,
            measures: 1,
            levelNum: levelNum,
            parentMember: memberIdx !== 0
        };
    };

    var buildPath = function(tuple, index) {
        var path = [];
        var idx = 0;

        for(; idx <= index; idx++) {
            path.push(tuple.members[idx].name);
        }

        return path;
    };

    var ColumnBuilder = Class.extend({
        init: function(options) {
            this.measures = 1;
            this.metadata = {};
        },

        build: function(tuples) {
            var tbody = this._tbody(tuples);
            var colgroup = this._colGroup();

            return [
                element("table", null, [colgroup, tbody])
            ];
        },

        reset: function() {
            this.metadata = {};
        },

        _colGroup: function() {
            var length = this._rowLength();
            var children = [];
            var idx = 0;

            for (; idx < length; idx++) {
                children.push(element("col", null));
            }

            return element("colgroup", null, children);
        },

        _tbody: function(tuples) {
            var root = tuples[0];

            this.map = {};
            this.rows = [];
            this.rootTuple = root;

            this._indexes = [];

            if (root) {
                this._buildRows(root, 0);
                this._normalize();
            } else {
                this.rows.push(element("tr", null, [ element("th", null) ]));
            }

            return element("tbody", null, this.rows);
        },

        _normalize: function() {
            var rows = this.rows;
            var rowsLength = rows.length;
            var rowIdx = 0;
            var row;

            var cellsLength;
            var cellIdx;
            var cells;
            var cell;

            for (; rowIdx < rowsLength; rowIdx++) {
                row = rows[rowIdx];

                if (row.rowspan === 1) {
                    continue;
                }

                cells = row.children;

                cellIdx = 0;
                cellsLength = cells.length;

                for (; cellIdx < cellsLength; cellIdx++) {
                    cell = cells[cellIdx];

                    if (cell.tupleAll) {
                        cell.attr.rowspan = row.rowspan;
                    }
                }
            }
        },

        _rowIndex: function(row) {
            var rows = this.rows;
            var length = rows.length;
            var idx = 0;

            for(; idx < length; idx++) {
                if (rows[idx] === row) {
                    break;
                }
            }

            return idx;
        },

        _rowLength: function() {
            var cells = this.rows[0] ? this.rows[0].children : [];
            var length = cells.length;
            var rowLength = 0;
            var idx = 0;

            if (length) {
                for (; idx < length; idx++) {
                    rowLength += cells[idx].attr.colspan || 1;
                }
            }

            if (!rowLength) {
                rowLength = this.measures;
            }

            return rowLength;
        },

        _row: function(tuple, memberIdx, parentMember) {
            var rootName = this.rootTuple.members[memberIdx].name;
            var levelNum = tuple.members[memberIdx].levelNum;
            var rowKey = rootName + levelNum;
            var map = this.map;
            var parentRow;
            var children;

            var row = map[rowKey];

            if (!row) {
                row = element("tr", null, []);

                row.parentMember = parentMember;
                row.colspan = 0;
                row.rowspan = 1;

                map[rowKey] = row;
                parentRow = map[rootName + (Number(levelNum) - 1)];

                if (parentRow) {
                    children = parentRow.children;

                    if (children[1] && children[1].attr.className.indexOf("k-alt") === -1) {
                        row.notFirst = true;
                    } else {
                        row.notFirst = parentRow.notFirst;
                    }
                }

                this.rows.splice(this._rowIndex(parentRow) + 1, 0, row);
            } else {
                row.notFirst = false;

                if (!row.parentMember || row.parentMember !== parentMember) {
                    row.parentMember = parentMember;
                    row.colspan = 0;
                }
            }

            return row;
        },

        _measures: function(measures, tuple, className) {
            var map = this.map;
            var row = map.measureRow;
            var measure;

            if (!row) {
                row = element("tr", null, []);
                map.measureRow = row;
                this.rows.push(row);
            }

            for (var idx = 0, length = measures.length; idx < length; idx++) {
                measure = measures[idx];
                row.children.push(element("th", { className: "k-header" + (className || "") }, [this._content(measure, tuple)]));
            }

            return length;
        },

        _content: function(member, tuple) {
            return htmlNode(this.template({
                member: member,
                tuple: tuple
            }));
        },

        _cell: function(className, children) {
            return element("th", { className: "k-header" + className }, children);
        },

        _buildRows: function(tuple, memberIdx, parentMember) {
            var members = tuple.members;
            var member = members[memberIdx];
            var nextMember = members[memberIdx + 1];

            var row, childRow, children, childrenLength;
            var cell, allCell, cellAttr;
            var cellChildren = [];
            var path;

            var idx = 0;
            var colspan;
            var metadata;

            if (member.measure) {
                this._measures(member.children, tuple);
                return;
            }

            path = kendo.stringify(buildPath(tuple, memberIdx));
            row = this._row(tuple, memberIdx, parentMember);

            children = member.children;
            childrenLength = children.length;

            metadata = this.metadata[path];
            if (!metadata) {
                this.metadata[path] = metadata = createMetadata(Number(member.levelNum), memberIdx);
            }

            this._indexes.push({
                path: path,
                tuple: tuple
            });

            if (member.hasChildren) {
                if (metadata.expanded === false) {
                    childrenLength = 0;
                    metadata.children = 0;
                }

                cellAttr = { className: "k-icon " + (childrenLength ? STATE_EXPANDED : STATE_COLLAPSED) };
                cellAttr[kendo.attr("path")] = path;

                cellChildren.push(element("span", cellAttr));
            }

            cellChildren.push(this._content(member, tuple));
            cell = this._cell((row.notFirst ? " k-first" : ""), cellChildren);

            row.children.push(cell);
            row.colspan += 1;

            if (childrenLength) {
                allCell = this._cell(" k-alt", [this._content(member, tuple)]);
                row.children.push(allCell);

                for (; idx < childrenLength; idx++) {
                    childRow = this._buildRows(children[idx], memberIdx, member);
                }

                colspan = childRow.colspan;
                cell.attr.colspan = colspan;

                metadata.children = colspan;
                metadata.members = 1;

                row.colspan += colspan;
                row.rowspan = childRow.rowspan + 1;

                if (nextMember) {
                    if (nextMember.measure) {
                        colspan = this._measures(nextMember.children, tuple, " k-alt");
                    } else {
                        colspan = this._buildRows(tuple, memberIdx + 1).colspan;
                    }

                    allCell.attr.colspan = colspan;
                    colspan -= 1;

                    metadata.members += colspan;
                    row.colspan += colspan;
                }
            } else if (nextMember) {
                if (nextMember.measure) {
                    colspan = this._measures(nextMember.children, tuple);
                } else {
                    colspan = this._buildRows(tuple, memberIdx + 1).colspan;
                }

                metadata.members = colspan;

                if (colspan > 1) {
                    cell.attr.colspan = colspan;
                    row.colspan += colspan - 1;
                }
            }

            if (metadata.maxChildren < metadata.children) {
                metadata.maxChildren = metadata.children;
            }

            if (metadata.maxMembers < metadata.members) {
                metadata.maxMembers = metadata.members;
            }

            (allCell || cell).tupleAll = true;

            return row;
        }
    });

    var RowBuilder = Class.extend({
        init: function(options) {
            this.metadata = {};
        },

        build: function(tuples) {
            var tbody = this._tbody(tuples);
            var colgroup = this._colGroup();

            return [
                element("table", null, [colgroup, tbody])
            ];
        },

        reset: function() {
            this.metadata = {};
        },

        _colGroup: function() {
            var length = this.rows[0].children.length;
            var children = [];
            var idx = 0;

            for (; idx < length; idx++) {
                children.push(element("col", null));
            }

            return element("colgroup", null, children);
        },

        _tbody: function(tuples) {
            var root = tuples[0];

            this.rootTuple = root;
            this.rows = [];
            this.map = {};

            this._indexes = [];

            if (root) {
                this._buildRows(root, 0);
                this._normalize();
            } else {
                this.rows.push(element("tr", null, [ element("td", null) ]));
            }

            return element("tbody", null, this.rows);
        },

        _normalize: function() {
            var rows = this.rows;
            var rowsLength = rows.length;
            var rowIdx = 0;

            var members = this.rootTuple.members;
            var firstMemberName = members[0].name;
            var membersLength = members.length;
            var memberIdx = 0;

            var row;
            var cell;
            var maxColspan;
            var map = this.map;
            var allRow;

            for (; rowIdx < rowsLength; rowIdx++) {
                row = rows[rowIdx];

                for (memberIdx = 0; memberIdx < membersLength; memberIdx++) {
                    maxColspan = this[members[memberIdx].name];
                    cell = row.colspan["dim" + memberIdx];

                    if (cell && cell.levelNum < maxColspan) {
                        cell.attr.colspan = (maxColspan - cell.levelNum) + 1;
                    }
                }
            }

            row = map[firstMemberName];
            allRow = map[firstMemberName + "all"];

            if (row) {
                row.children[0].attr.className = "k-first";
            }

            if (allRow) {
                allRow.children[0].attr.className += " k-first";
            }
        },

        _row: function(children) {
            var row = element("tr", null, children);
            row.rowspan = 1;
            row.colspan = {};

            this.rows.push(row);

            return row;
        },

        _content: function(member, tuple) {
            return htmlNode(this.template({
                member: member,
                tuple: tuple
            }));
        },

        _buildRows: function(tuple, memberIdx) {
            var map = this.map;
            var path;

            var members = tuple.members;
            var member = members[memberIdx];
            var nextMember = members[memberIdx + 1];

            var children = member.children;
            var childrenLength = children.length;

            var levelNum = Number(member.levelNum) + 1;
            var rootName = this.rootTuple.members[memberIdx].name;
            var tuplePath = buildPath(tuple, memberIdx - 1).join("");

            var parentName = tuplePath + (member.parentName || "");
            var row = map[parentName + "all"] || map[parentName];
            var childRow;
            var allRow;

            var metadata;
            var expandIconAttr;
            var cellChildren = [];
            var allCell;
            var cell;
            var attr;
            var idx;

            if (!row || row.hasChild) {
                row = this._row();
            } else {
                row.hasChild = true;
            }

            if (member.measure) {
                attr = { className: row.allCell ? "k-grid-footer" : "" };
                row.children.push(element("td", attr, [ this._content(children[0], tuple) ]));

                row.rowspan = childrenLength;

                for (idx = 1; idx < childrenLength; idx++) {
                    this._row([ element("td", attr, [ this._content(children[idx], tuple) ]) ]);
                }

                return row;
            }

            map[tuplePath + member.name] = row;

            path = kendo.stringify(buildPath(tuple, memberIdx));

            metadata = this.metadata[path];
            if (!metadata) {
                this.metadata[path] = metadata = createMetadata(levelNum - 1, memberIdx);
            }

            this._indexes.push({
                path: path,
                tuple: tuple
            });

            if (member.hasChildren) {
                if (metadata.expanded === false) {
                    childrenLength = 0;
                    metadata.children = 0;
                }

                expandIconAttr = { className: "k-icon " + (childrenLength ? STATE_EXPANDED : STATE_COLLAPSED) };
                expandIconAttr[kendo.attr("path")] = path;

                cellChildren.push(element("span", expandIconAttr));
            }

            cellChildren.push(this._content(member, tuple));
            cell = element("td", { className: row.allCell && !childrenLength ? "k-grid-footer" : "" }, cellChildren);
            cell.levelNum = levelNum;

            row.children.push(cell);
            row.colspan["dim" + memberIdx] = cell;

            if (!this[rootName] || this[rootName] < levelNum) {
                this[rootName] = levelNum;
            }

            if (childrenLength) {
                row.allCell = false;
                row.hasChild = false;

                for (idx = 0; idx < childrenLength; idx++) {
                    childRow = this._buildRows(children[idx], memberIdx);

                    if (row !== childRow) {
                        row.rowspan += childRow.rowspan;
                    }
                }

                if (row.rowspan > 1) {
                    cell.attr.rowspan = row.rowspan;
                }

                metadata.children = row.rowspan;

                allCell = element("td", { className: "k-grid-footer" }, [this._content(member, tuple)]);
                allCell.levelNum = levelNum;

                allRow = this._row([ allCell ]);
                allRow.colspan["dim" + memberIdx] = allCell;
                allRow.allCell = true;

                map[tuplePath + member.name + "all"] = allRow;

                if (nextMember) {
                    childRow = this._buildRows(tuple, memberIdx + 1);
                    allCell.attr.rowspan = childRow.rowspan;
                }

                row.rowspan += allRow.rowspan;

                metadata.members = allRow.rowspan;

            } else if (nextMember) {
                row.hasChild = false;
                this._buildRows(tuple, memberIdx + 1);

                (allCell || cell).attr.rowspan = row.rowspan;

                metadata.members = row.rowspan;
            }

            if (metadata.maxChildren < metadata.children) {
                metadata.maxChildren = metadata.children;
            }

            if (metadata.maxMembers < metadata.members) {
                metadata.maxMembers = metadata.members;
            }

            return row;
        }
    });

    var ContentBuilder = Class.extend({
        init: function() {
            this.columnAxis = {};
            this.rowAxis = {};
        },

        build: function(data, columnAxis, rowAxis) {
            var index = columnAxis.indexes[0];
            var metadata = columnAxis.metadata[index ? index.path : undefined];

            this.columnAxis = columnAxis;
            this.rowAxis = rowAxis;

            this.data = data;

            this.rowLength = metadata ? metadata.maxChildren + metadata.maxMembers : columnAxis.measures.length || 1;

            if (!this.rowLength) {
                this.rowLength = 1;
            }

            var tbody = this._tbody();
            var colgroup = this._colGroup();

            return [
                element("table", null, [colgroup, tbody])
            ];
        },

        _colGroup: function() {
            var length = this.columnAxis.measures.length || 1;
            var children = [];
            var idx = 0;

            if (this.rows[0]) {
                length = this.rows[0].children.length;
            }

            for (; idx < length; idx++) {
                children.push(element("col", null));
            }

            return element("colgroup", null, children);
        },

        _tbody: function() {
            this.rows = [];

            if (this.data[0]) {
                this.columnIndexes = this._indexes(this.columnAxis);
                this.rowIndexes = this._indexes(this.rowAxis);

                this._buildRows();
            } else {
                this.rows.push(element("tr", null, [ element("td", null, [ text("") ]) ]));
            }

            return element("tbody", null, this.rows);
        },

        _indexes: function(axisInfo) {
            var result = [];
            var axisInfoMember;
            var indexes = axisInfo.indexes;
            var metadata = axisInfo.metadata;
            var measures = axisInfo.measures;
            var measuresLength = measures.length || 1;

            var current;
            var dataIdx = 0;
            var firstEmpty = 0;

            var idx = 0;
            var length = indexes.length;
            var measureIdx;

            var children;
            var skipChildren;

            if (!length) {
                for (measureIdx = 0; measureIdx < measuresLength; measureIdx++) {
                    result[measureIdx] = {
                        index: measureIdx,
                        measure: measures[measureIdx],
                        tuple: null
                    };
                }

                return result;
            }

            for (; idx < length; idx++) {
                axisInfoMember = indexes[idx];
                current = metadata[axisInfoMember.path];
                children = current.children + current.members;
                skipChildren = 0;

                if (children) {
                    children -= measuresLength;
                }

                if (current.expanded === false && current.children !== current.maxChildren) {
                    skipChildren = current.maxChildren;
                }

                if (current.parentMember && current.levelNum === 0) {
                    children = -1;
                }

                if (children > -1) {
                    for (measureIdx = 0; measureIdx < measuresLength; measureIdx++) {
                        result[children + firstEmpty + measureIdx] = {
                            children: children,
                            index: dataIdx,
                            measure: measures[measureIdx],
                            tuple: axisInfoMember.tuple
                        };
                        dataIdx += 1;
                    }

                    while(result[firstEmpty] !== undefined) {
                        firstEmpty += 1;
                    }
                }

                dataIdx += skipChildren;
            }

            return result;
        },

        _buildRows: function() {
            var rowIndexes = this.rowIndexes;
            var length = rowIndexes.length;
            var idx = 0;

            for (; idx < length; idx++) {
                this.rows.push(this._buildRow(rowIndexes[idx]));
            }
        },

        _buildRow: function(rowInfo) {
            var startIdx = rowInfo.index * this.rowLength;
            var columnIndexes = this.columnIndexes;
            var length = columnIndexes.length;
            var columnInfo;
            var cells = [];
            var idx = 0;

            var cellContent;
            var attr;

            for (; idx < length; idx++) {
                columnInfo = columnIndexes[idx];

                attr = {};
                if (columnInfo.children) {
                    attr.className = "k-alt";
                }

                cellContent = this.template({
                    columnTuple: columnInfo.tuple,
                    rowTuple: rowInfo.tuple,
                    measure: columnInfo.measure || rowInfo.measure,
                    dataItem: this.data[startIdx + columnInfo.index]
                });

                cells.push(element("td", attr, [ htmlNode(cellContent) ]));
            }

            attr = {};
            if (rowInfo.children) {
                attr.className = "k-grid-footer";
            }

            return element("tr", attr, cells);
        }
    });

    ui.plugin(PivotGrid);
})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(_, f){ f(); });