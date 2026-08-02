sap.ui.define([], function () {

    "use strict";

    return {

        formatCurrency: function (price, currency) {

            if (price === undefined) {
                return "";
            }

            return Number(price).toFixed(2) + " " + currency;

        },

        getStockStatus: function (stock, threshold) {

            if (stock === 0) {
                return "Out of Stock";
            }

            if (stock <= threshold) {
                return "Low Stock";
            }

            return "Available";

        },

        getStatusState: function (stock, threshold) {

            if (stock === 0) {
                return "Error";
            }

            if (stock <= threshold) {
                return "Warning";
            }

            return "Success";

        },

        formatDate: function (date) {

            if (!date) {
                return "";
            }

            return new Date(date).toLocaleDateString();

        }

    };

});