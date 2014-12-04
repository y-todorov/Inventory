var initialDataSource;

var isReinitNeed = true;

function gridDataBound(a, b, c) {
    if (isReinitNeed === false) {
        var grid = $(".k-grid").data("kendoGrid");
        //var gridData = grid.dataSource.view();
        var gridData = grid.dataSource.data(); // this fixes colours when grouping
        initialDataSource = gridData;
        isReinitNeed = true;
    }
}

function gridDataSourceRequestEnd(a, b, c) {
    isReinitNeed = false;
}

function gridBtnSearchClick(e) {
    //var grid = $("#FileViewModel").data("kendoGrid");
    var grid = $(".k-grid").data("kendoGrid");

    var gridData = initialDataSource;

    var tbSearch = $("#tbSearch");
    var searchVal = tbSearch.val();
    var arrResult = [];
    for (var i = 0; i < gridData.length; i++) {

        var currData = gridData[i];

        for (var property in currData) {

            if (currData.hasOwnProperty(property)) {
                if (property !== 'uid' && property !== '_events' && property !== 'dirty' && property !== 'parent' && property !== '__proto__') { // това е важно защото e GUID и почти винаги съдържа отделни букви
                    var valToCheck = currData[property];
                    //if (valToCheck != null) {
                    if (valToCheck != null && typeof valToCheck !== 'object') {
                        if (valToCheck.toString().toLowerCase().indexOf(searchVal.toString().toLowerCase()) > -1) {
                            arrResult.push(gridData[i]);
                            break;
                        }
                    }
                }
            }
        }
    }

    grid.dataSource.data(arrResult);
    grid.refresh();
}
