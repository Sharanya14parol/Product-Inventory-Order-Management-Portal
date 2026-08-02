sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {

    "use strict";

    return UIComponent.extend("inventoryportal.Component", {

        metadata: {
            interfaces: ["sap.ui.core.IAsyncContentCreation"],
            manifest: "json"
        },

        init: function () {

            UIComponent.prototype.init.apply(this, arguments);

            var oModel = new JSONModel(
                "model/products.json"
            );

            this.setModel(oModel,"ProductModel");

            this.getRouter().initialize();

        }

    });

});