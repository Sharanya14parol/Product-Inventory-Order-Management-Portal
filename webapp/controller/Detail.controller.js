sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "../model/formatter"
], function (
    BaseController,
    JSONModel,
    Fragment,
    MessageBox,
    MessageToast,
    formatter
) {

    "use strict";

    var REORDER_BATCH = 10;

    return BaseController.extend("inventoryportal.controller.Detail", {

        formatter: formatter,

        onInit: function () {
            var oViewModel = new JSONModel({
                busy: true,
                dialogTitle: "",
                dialogMode: "",
                product: {},
                nameState: "None",
                nameStateText: "",
                categoryState: "None",
                categoryStateText: "",
                priceState: "None",
                priceStateText: "",
                currencyState: "None",
                currencyStateText: "",
                stockState: "None",
                stockStateText: "",
                thresholdState: "None",
                thresholdStateText: "",
                skuState: "None",
                skuStateText: ""
            });

            this.getView().setModel(oViewModel, "view");

            this.getRouter()
                .getRoute("detail")
                .attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sProductId = oEvent
                .getParameter("arguments")
                .productId;

            var oViewModel = this.getView().getModel("view");
            oViewModel.setProperty("/busy", true);

            this.getModel("products")
                .dataLoaded()
                .then(function () {
                    this._bindProduct(sProductId);
                }.bind(this))
                .catch(function () {
                    oViewModel.setProperty("/busy", false);
                    this.getRouter().navTo("notFound", {}, true);
                }.bind(this));
        },

        _bindProduct: function (sProductId) {
            var oModel = this.getModel("products");
            var aProducts = oModel.getProperty("/products") || [];
            var iIndex = aProducts.findIndex(function (oProduct) {
                return oProduct.productId === sProductId;
            });

            if (iIndex === -1) {
                this.getView().getModel("view").setProperty("/busy", false);
                this.getRouter().navTo("notFound", {}, true);
                return;
            }

            this.getView().bindElement({
                path: "/products/" + iIndex,
                model: "products"
            });

            this.getView().getModel("view").setProperty("/busy", false);
        },

        onEdit: function () {
            var oContext = this.getView().getBindingContext("products");

            if (!oContext) {
                MessageBox.error(
                    this.getResourceBundle().getText("productContextMissing")
                );
                return;
            }

            var oViewModel = this.getView().getModel("view");

            oViewModel.setProperty(
                "/product",
                Object.assign({}, oContext.getObject())
            );
            oViewModel.setProperty(
                "/dialogTitle",
                this.getResourceBundle().getText("editProduct")
            );
            oViewModel.setProperty("/dialogMode", "edit");

            this._resetValidation();
            this._openProductDialog();
        },

        _openProductDialog: function () {
            var oView = this.getView();

            if (!this._oProductDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "inventoryportal.fragment.AddEditProduct",
                    controller: this
                }).then(function (oDialog) {
                    this._oProductDialog = oDialog;
                    oView.addDependent(oDialog);
                    oDialog.open();
                }.bind(this));
            } else {
                this._oProductDialog.open();
            }
        },

        onSaveProduct: function () {
            if (!this._validateProduct()) {
                return;
            }

            var oViewModel = this.getView().getModel("view");
            var oProduct = Object.assign(
                {},
                oViewModel.getProperty("/product")
            );
            var oModel = this.getModel("products");
            var aProducts = oModel.getProperty("/products") || [];
            var iIndex = aProducts.findIndex(function (oItem) {
                return oItem.productId === oProduct.productId;
            });

            if (iIndex === -1) {
                MessageBox.error(
                    this.getResourceBundle().getText("productNotFound")
                );
                return;
            }

            oProduct.name = oProduct.name.trim();
            oProduct.category = oProduct.category.trim();
            oProduct.currency = oProduct.currency.trim().toUpperCase();
            oProduct.price = Number(oProduct.price);
            oProduct.stock = Number(oProduct.stock);
            oProduct.reorderThreshold = Number(oProduct.reorderThreshold);
            oProduct.lastUpdated = new Date()
                .toISOString()
                .slice(0, 10);

            oModel.setProperty("/products/" + iIndex, oProduct);

            MessageToast.show(
                this.getResourceBundle().getText("productUpdated")
            );

            this._closeProductDialog();
        },

        onCancelProduct: function () {
            this._closeProductDialog();
        },

        _closeProductDialog: function () {
            if (this._oProductDialog) {
                this._oProductDialog.close();
            }
        },

        _validateProduct: function () {
            var oViewModel = this.getView().getModel("view");
            var oProduct = oViewModel.getProperty("/product");
            var bValid = true;

            this._resetValidation();

            if (!oProduct.name || !oProduct.name.trim()) {
                this._setError("/nameState", "/nameStateText", "requiredField");
                bValid = false;
            }

            if (!oProduct.category || !oProduct.category.trim()) {
                this._setError("/categoryState", "/categoryStateText", "requiredField");
                bValid = false;
            }

            if (oProduct.price === "" || isNaN(Number(oProduct.price)) || Number(oProduct.price) < 0) {
                this._setError("/priceState", "/priceStateText", "invalidPrice");
                bValid = false;
            }

            if (!oProduct.currency || oProduct.currency.trim().length !== 3) {
                this._setError("/currencyState", "/currencyStateText", "invalidCurrency");
                bValid = false;
            }

            if (oProduct.stock === "" || isNaN(Number(oProduct.stock)) || Number(oProduct.stock) < 0) {
                this._setError("/stockState", "/stockStateText", "invalidStock");
                bValid = false;
            }

            if (
                oProduct.reorderThreshold === "" ||
                isNaN(Number(oProduct.reorderThreshold)) ||
                Number(oProduct.reorderThreshold) < 0
            ) {
                this._setError(
                    "/thresholdState",
                    "/thresholdStateText",
                    "invalidThreshold"
                );
                bValid = false;
            }

            return bValid;
        },

        _setError: function (sStatePath, sTextPath, sKey) {
            var oViewModel = this.getView().getModel("view");
            oViewModel.setProperty(sStatePath, "Error");
            oViewModel.setProperty(
                sTextPath,
                this.getResourceBundle().getText(sKey)
            );
        },

        _resetValidation: function () {
            var oViewModel = this.getView().getModel("view");

            [
                "name",
                "category",
                "price",
                "currency",
                "stock",
                "threshold",
                "sku"
            ].forEach(function (sField) {
                oViewModel.setProperty("/" + sField + "State", "None");
                oViewModel.setProperty("/" + sField + "StateText", "");
            });
        },

        onDelete: function () {
            var oContext = this.getView().getBindingContext("products");

            if (!oContext) {
                return;
            }

            var sProductName = oContext.getProperty("name");

            MessageBox.confirm(
                this.getResourceBundle().getText(
                    "deleteConfirmation",
                    [sProductName]
                ),
                {
                    onClose: function (sAction) {
                        if (sAction !== MessageBox.Action.OK) {
                            return;
                        }

                        var oModel = this.getModel("products");
                        var aProducts = oModel.getProperty("/products") || [];
                        var sProductId = oContext.getProperty("productId");

                        oModel.setProperty(
                            "/products",
                            aProducts.filter(function (oProduct) {
                                return oProduct.productId !== sProductId;
                            })
                        );

                        MessageToast.show(
                            this.getResourceBundle().getText("productDeleted")
                        );

                        this.getRouter().navTo("list");
                    }.bind(this)
                }
            );
        },

        onReorder: function () {
            var oContext = this.getView().getBindingContext("products");

            if (!oContext) {
                return;
            }

            var iCurrentStock = Number(oContext.getProperty("stock")) || 0;
            var iNewStock = iCurrentStock + REORDER_BATCH;

            oContext.getModel().setProperty(
                oContext.getPath() + "/stock",
                iNewStock
            );

            MessageToast.show(
                this.getResourceBundle().getText(
                    "reorderSuccess",
                    [REORDER_BATCH, iNewStock]
                )
            );
        },

        onNavBack: function () {
            this.getRouter().navTo("list");
        },

        onExit: function () {
            if (this._oProductDialog) {
                this._oProductDialog.destroy();
            }
        }

    });

});
