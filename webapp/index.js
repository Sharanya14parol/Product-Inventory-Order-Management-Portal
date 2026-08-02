sap.ui.define([
    "sap/m/Shell",
    "sap/ui/core/ComponentContainer"
], function (Shell, ComponentContainer) {

    "use strict";

    new Shell({
        app: new ComponentContainer({
            name: "inventoryportal",
            async: true,
            height: "100%"
        })
    }).placeAt("content");

});

