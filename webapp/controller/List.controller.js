sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "../model/formatter"
], function (
    BaseController,
    JSONModel,
    Filter,
    FilterOperator,
    Sorter,
    Fragment,
    MessageBox,
    MessageToast,
    formatter
) {

    "use strict";

    var REORDER_THRESHOLD_DEFAULT = 10;
    var INITIAL_PRODUCT_ID = 1001;
    var PRICE_LOW_MAX = 50;
    var PRICE_HIGH_MIN = 200;

    return BaseController.extend("inventoryportal.controller.List", {

        formatter: formatter,

        onInit: function () {
            var oViewModel = new JSONModel({
                busy: true,
                visibleCount: 0,
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

            var oModel = this.getModel("products");

            oModel.dataLoaded()
                .then(function () {
                    oViewModel.setProperty("/busy", false);
                    this._updateVisibleCount();
                }.bind(this))
                .catch(function () {
                    oViewModel.setProperty("/busy", false);
                    MessageBox.error(
                        this.getResourceBundle().getText("loadError")
                    );
                }.bind(this));
        },

        onItemPress: function (oEvent) {
            var oContext = oEvent.getParameter("listItem")
                .getBindingContext("products");

            this.getRouter().navTo("detail", {
                productId: oContext.getProperty("productId")
            });
        },

        onSearch: function (oEvent) {
            var sValue = oEvent.getParameter("newValue").trim();
            var oBinding = this.byId("productList").getBinding("items");
            var aFilters = [];

            if (sValue) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("name", FilterOperator.Contains, sValue),
                        new Filter("category", FilterOperator.Contains, sValue)
                    ],
                    and: false
                }));
            }

            oBinding.filter(aFilters, "Application");
            this._updateVisibleCount();
        },

        onListUpdateFinished: function () {
            this._updateVisibleCount();
        },

        _updateVisibleCount: function () {
            var oList = this.byId("productList");
            if (!oList) {
                return;
            }

            this.getView()
                .getModel("view")
                .setProperty("/visibleCount", oList.getItems().length);
        },

        onAddProduct: function () {
            this._prepareDialog({
                productId: "",
                name: "",
                category: "",
                sku: "",
                price: "",
                currency: "USD",
                stock: "",
                reorderThreshold: REORDER_THRESHOLD_DEFAULT,
                supplier: "",
                warehouse: "",
                description: "",
                imageUrl: "",
                lastUpdated: ""
            }, "add");
        },

        _prepareDialog: function (oProduct, sMode) {
            var oViewModel = this.getView().getModel("view");

            oViewModel.setProperty("/product", oProduct);
            oViewModel.setProperty(
                "/dialogTitle",
                this.getResourceBundle().getText(
                    sMode === "add" ? "addProduct" : "editProduct"
                )
            );
            oViewModel.setProperty("/dialogMode", sMode);
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
            var aProducts = oModel.getProperty("/products");

            if (oProduct.productId) {
                var iIndex = aProducts.findIndex(function (oItem) {
                    return oItem.productId === oProduct.productId;
                });

                if (iIndex === -1) {
                    MessageBox.error(
                        this.getResourceBundle().getText("productNotFound")
                    );
                    return;
                }

                oProduct.lastUpdated = this._today();
                oModel.setProperty("/products/" + iIndex, this._normalizeProduct(oProduct));

                MessageToast.show(
                    this.getResourceBundle().getText("productUpdated")
                );
            } else {
                oProduct.productId = this._generateProductId(aProducts);
                oProduct.lastUpdated = this._today();
                oProduct.sku = oProduct.sku || ("SKU-" + oProduct.productId);
                oModel.setProperty(
                    "/products",
                    aProducts.concat([this._normalizeProduct(oProduct)])
                );

                MessageToast.show(
                    this.getResourceBundle().getText("productAdded")
                );
            }

            this._closeProductDialog();
            this._updateVisibleCount();
        },

        _normalizeProduct: function (oProduct) {
            oProduct.name = oProduct.name.trim();
            oProduct.category = oProduct.category.trim();
            oProduct.currency = oProduct.currency.trim().toUpperCase();
            oProduct.price = Number(oProduct.price);
            oProduct.stock = Number(oProduct.stock);
            oProduct.reorderThreshold = Number(oProduct.reorderThreshold);
            return oProduct;
        },

        _generateProductId: function (aProducts) {
            var iMaxId = aProducts.reduce(function (iMax, oProduct) {
                var aMatch = String(oProduct.productId).match(/(\d+)$/);
                return aMatch
                    ? Math.max(iMax, Number(aMatch[1]))
                    : iMax;
            }, INITIAL_PRODUCT_ID - 1);

            return "P" + (iMaxId + 1);
        },

        _today: function () {
            return new Date().toISOString().slice(0, 10);
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

        onOpenSort: function () {
            this._openSettingsDialog();
        },

        onOpenFilter: function () {
            this._openSettingsDialog();
        },

        onOpenGroup: function () {
            this._openSettingsDialog();
        },

        _openSettingsDialog: function () {
            var oView = this.getView();

            if (!this._oSettingsDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "inventoryportal.fragment.ViewSettings",
                    controller: this
                }).then(function (oDialog) {
                    this._oSettingsDialog = oDialog;
                    oView.addDependent(oDialog);
                    oDialog.open();
                }.bind(this));
            } else {
                this._oSettingsDialog.open();
            }
        },

        onConfirmSettings: function (oEvent) {
            var oBinding = this.byId("productList").getBinding("items");
            var oParams = oEvent.getParameters();
            var aSorters = [];
            var aFilters = [];

            if (oParams.sortItem) {
                aSorters.push(new Sorter(
                    oParams.sortItem.getKey(),
                    oParams.sortDescending
                ));
            }

            if (oParams.groupItem) {
                aSorters.push(new Sorter(
                    oParams.groupItem.getKey(),
                    oParams.groupDescending,
                    true
                ));
            }

            var aSelectedItems = oParams.filterItems || [];
            var aCategoryFilters = [];
            var aStatusFilters = [];
            var aPriceFilters = [];
            var oModel = this.getModel("products");

            aSelectedItems.forEach(function (oItem) {
                var sKey = oItem.getKey();

                if (sKey.indexOf("category:") === 0) {
                    aCategoryFilters.push(new Filter(
                        "category",
                        FilterOperator.EQ,
                        sKey.substring("category:".length)
                    ));
                } else if (sKey.indexOf("status:") === 0) {
                    aStatusFilters.push(sKey.substring("status:".length));
                } else if (sKey.indexOf("price:") === 0) {
                    aPriceFilters.push(this._createPriceFilter(
                        sKey.substring("price:".length)
                    ));
                }
            }.bind(this));

            if (aCategoryFilters.length) {
                aFilters.push(new Filter({
                    filters: aCategoryFilters,
                    and: false
                }));
            }

            if (aStatusFilters.length) {
                aFilters.push(new Filter({
                    path: "productId",
                    test: function (sProductId) {
                        var aProducts = oModel.getProperty("/products") || [];
                        var oProduct = aProducts.find(function (oItem) {
                            return oItem.productId === sProductId;
                        });

                        if (!oProduct) {
                            return false;
                        }

                        var sStatus = this._getStatusKey(
                            oProduct.stock,
                            oProduct.reorderThreshold
                        );

                        return aStatusFilters.indexOf(sStatus) !== -1;
                    }.bind(this)
                }));
            }

            if (aPriceFilters.length) {
                aFilters.push(new Filter({
                    filters: aPriceFilters,
                    and: false
                }));
            }

            oBinding.sort(aSorters);
            oBinding.filter(aFilters, "Application");
            this._updateVisibleCount();
        },

        _createPriceFilter: function (sRange) {
            if (sRange === "low") {
                return new Filter("price", FilterOperator.LT, PRICE_LOW_MAX);
            }

            if (sRange === "medium") {
                return new Filter(
                    "price",
                    FilterOperator.BT,
                    PRICE_LOW_MAX,
                    PRICE_HIGH_MIN
                );
            }

            return new Filter("price", FilterOperator.GT, PRICE_HIGH_MIN);
        },

        _getStatusKey: function (iStock, iThreshold) {
            if (Number(iStock) === 0) {
                return "out";
            }

            if (Number(iStock) <= Number(iThreshold)) {
                return "low";
            }

            return "available";
        },

        onExit: function () {
            if (this._oProductDialog) {
                this._oProductDialog.destroy();
            }

            if (this._oSettingsDialog) {
                this._oSettingsDialog.destroy();
            }
        }

    });

});
