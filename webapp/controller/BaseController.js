sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {

    "use strict";

    return Controller.extend("inventoryportal.controller.BaseController", {

        getRouter: function () {
            return this.getOwnerComponent().getRouter();
        },
        getModel: function (sName) {
            return this.getOwnerComponent().getModel(sName);
        },
        getResourceBundle: function () {
            return this.getOwnerComponent()
                .getModel("i18n")
                .getResourceBundle();

        }

    });

});