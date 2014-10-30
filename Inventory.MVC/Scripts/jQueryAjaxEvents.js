$(document).ready(function () {

    $(document).ajaxStart(function () {
        console.log("Triggered ajaxStart handler.");
    });

    $(document).ajaxStop(function () {
        console.log("Triggered ajaxStop handler.");
    });

    $(document).ajaxError(function (event, request, settings, e) {
        console.log("Triggered ajaxError handler.");
        debugger;
        var popupNotification = $("#centeredNotification").data("kendoNotification");
        if (request.responseJSON.Errors) {
            $.each(request.responseJSON.Errors, function (key, value) {
                debugger;
                popupNotification.show(value, "error");
            });
        }

    });

    $(document).ajaxComplete(function () {
        console.log("Triggered ajaxComplete handler.");
    });

    $(document).ajaxSend(function () {
        console.log("Triggered ajaxSend handler.");
    });

    $(document).ajaxSuccess(function () {
        console.log("Triggered ajaxSuccess handler.");
    });
});