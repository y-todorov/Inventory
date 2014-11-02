//Disable context menu with jQuery
//$(document).on("contextmenu", function (event) { event.preventDefault(); });

kendo.culture("bg-BG");

$(document).ready(function () {
    $("label").addClass("k-label");
    $("input[type=text]").addClass("k-textbox");
    $("input[type=password]").addClass("k-textbox");
    $("input[type=submit]").addClass("k-button");
});

function errorHandler(e) {
    if (e.errors) {
        var message = "Errors:\n";
        $.each(e.errors, function (key, value) {
            if ('errors' in value) {
                $.each(value.errors, function () {
                    message += this + "\n";
                });
            }
        });
        alert(message);
    }
}


$(document).ready(function () {

    var centered = $("#centeredNotification").kendoNotification({
        hideOnClick: false,
        stacking: "down",
        show: onShow,
        button: true,
        autoHideAfter: 30000
    }).data("kendoNotification");

    $("#popupNotification").kendoNotification().data("kendoNotification");

    function onShow(e) {
        if (!$("." + e.sender._guid)[1]) {
            var element = e.element.parent(),
                eWidth = element.width(),
                eHeight = element.height(),
                wWidth = $(window).width(),
                wHeight = $(window).height(),
                newTop, newLeft;

            newLeft = Math.floor(wWidth / 2 - eWidth / 2);
            newTop = Math.floor(wHeight / 2 - eHeight / 2);

            e.element.parent().css({ top: newTop, left: newLeft });
        }
    }
});

function onKendoGridDataSourceError(e) {
    //debugger;
    //var popupNotification = $("#centeredNotification").data("kendoNotification");
    //if (e.errors) {
    //    $.each(e.errors, function (key, value) {
    //        debugger;
    //        popupNotification.show(value.errors, "error");
    //    });
    //}
}

function onKendoGridSave(e) {
    var popupNotification = $("#popupNotification").data("kendoNotification");
    for (var key in e.values) {
        var value = e.values[key];
        popupNotification.show("The value of '" + key + "' changed to '" + value + "'!");
    }
}

function onKendoGridSaveChanges() {
    var popupNotification = $("#popupNotification").data("kendoNotification");
    popupNotification.show("All pending changes are successfully saved!");
}

function onKendoGridRemove() {
    var popupNotification = $("#popupNotification").data("kendoNotification");
    popupNotification.show("Item removed! Press 'Save Changes' to delete the item from the database!");
}

function exportGridData(sender) {

    var gridDiv = ($(sender)).parents('div[class~="k-grid"]').first(); // да точно така е!!!
    var grid = gridDiv.data("kendoGrid");

    $.ajax({
        type: "POST",
        url: "/Download/ExportWithOpenXML",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            html: grid.table.context.innerHTML
        }),
        success: function () {
        },
        error: function (result) {
            alert('Oh no: ' + result.responseText);
        },
        async: false
    });
}

function getWeekString(weekInt) {
    //debugger;
    var res;
    $.ajax({
        type: "POST",
        url: "/Chart/GetWeekString",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            dateEncoded: weekInt
        }),
        success: function (data) {
            res = data;
        },
        error: function (result) {
            alert('Oh no: ' + result.responseText);
        },
        async: false
    });

    return res;
}

