sap.ui.define([
    "sap/ui/model/type/Currency"
], function (Currency) {

    "use strict";

    return {

        formatCurrency: function (fPrice, sCurrency) {

            if (
                fPrice === undefined ||
                fPrice === null ||
                fPrice === ""
            ) {
                return "";
            }

            var oCurrency = new Currency({
                showMeasure: true
            });

            return oCurrency.formatValue(
                [
                    Number(fPrice).toFixed(2),
                    sCurrency || "USD"
                ],
                "string"
            );
        },

        getStockStatus: function (iStock, iThreshold) {

            if (
                iStock === undefined ||
                iStock === null ||
                iStock === ""
            ) {
                return "Unknown";
            }

            iStock = Number(iStock);
            iThreshold = Number(iThreshold);

            if (iStock === 0) {
                return "Out of Stock";
            }

            if (iStock <= iThreshold) {
                return "Low Stock";
            }

            return "Available";
        },


        getStockState: function (iStock, iThreshold) {

            console.log(
                "STOCK STATE:",
                iStock,
                iThreshold
            );

            iStock = Number(iStock);
            iThreshold = Number(iThreshold);

            if (iStock === 0) {
                return "Error";
            }

            if (iStock <= iThreshold) {
                return "Warning";
            }

            return "Success";
        },
        formatProductCount: function (sLabel, iCount) {
            return sLabel + " (" + iCount + ")";
        },
        getStockIcon: function (iStock, iThreshold) {

            console.log(
                "STOCK ICON:",
                iStock,
                iThreshold
            );

            iStock = Number(iStock);
            iThreshold = Number(iThreshold);

            if (iStock === 0) {
                return "sap-icon://error";
            }

            if (iStock <= iThreshold) {
                return "sap-icon://alert";
            }

            return "sap-icon://accept";
        },

    };

});

