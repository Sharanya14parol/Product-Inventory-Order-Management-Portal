sap.ui.define([
    "sap/ui/core/format/NumberFormat",
    "sap/ui/core/format/DateFormat"
], function (NumberFormat, DateFormat) {

    "use strict";

    var oResourceBundle;

    return {

        setResourceBundle: function (oBundle) {
            oResourceBundle = oBundle;
        },

        formatCurrency: function (fPrice, sCurrency) {
            if (fPrice === undefined || fPrice === null || fPrice === "" || !sCurrency) {
                return "";
            }

            return NumberFormat.getCurrencyInstance({
                currencyCode: true
            }).format(Number(fPrice), sCurrency);
        },

        getStockStatus: function (iStock, iThreshold) {
            if (!oResourceBundle) {
                return "";
            }

            if (Number(iStock) === 0) {
                return oResourceBundle.getText("statusOutOfStock");
            }

            if (Number(iStock) <= Number(iThreshold)) {
                return oResourceBundle.getText("statusLowStock");
            }

            return oResourceBundle.getText("statusAvailable");
        },

        getStockState: function (iStock, iThreshold) {
            if (Number(iStock) === 0) {
                return "Error";
            }

            if (Number(iStock) <= Number(iThreshold)) {
                return "Warning";
            }

            return "Success";
        },

        getStockIcon: function (iStock, iThreshold) {
            if (Number(iStock) === 0) {
                return "sap-icon://error";
            }

            if (Number(iStock) <= Number(iThreshold)) {
                return "sap-icon://alert";
            }

            return "sap-icon://accept";
        },

        formatDate: function (sDate) {
            if (!sDate) {
                return "";
            }

            return DateFormat.getDateInstance({
                style: "medium"
            }).format(new Date(sDate));
        }

    };

});
