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


    


    var centered = $("#notification").kendoNotification({
        hideOnClick: false,
        stacking: "down",
        show: onShow,
        button: true,
        autoHideAfter: 30000
    }).data("kendoNotification");

    $("#notification").kendoNotification().data("kendoNotification");

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
    var popupNotification = $("#notification").data("kendoNotification");
    for (var key in e.values) {
        var value = e.values[key];
        popupNotification.show("The value of '" + key + "' changed to '" + value + "'!");
    }
}

function onKendoGridSaveChanges() {
    var popupNotification = $("#notification").data("kendoNotification");
    popupNotification.show("All pending changes are successfully saved!");
}

function onKendoGridRemove() {
    var popupNotification = $("#notification").data("kendoNotification");
    popupNotification.show("Item removed! Press 'Save Changes' to delete the item from the database!");
}


