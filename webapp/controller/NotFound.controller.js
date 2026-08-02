sap.ui.define([
    "./BaseController"
], function (BaseController) {

    "use strict";

    return BaseController.extend("inventoryportal.controller.NotFound", {

        onNavBack: function () {
            this.getRouter().navTo("list");
        }

    });

});
