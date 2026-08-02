sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "../model/formatter"
], function (
    BaseController,
    JSONModel,
    Filter,
    FilterOperator,
    MessageToast,
    MessageBox,
    Fragment,
    formatter
) {

    "use strict";

    return BaseController.extend(
        "inventoryportal.controller.List",
        {

            formatter: formatter,

            onInit: function () {

                var oViewModel = new JSONModel({

                    dialogTitle: "",
                    dialogMode: "",

                    product: {
                        productId: "",
                        name: "",
                        category: "",
                        price: "",
                        currency: "USD",
                        stock: "",
                        reorderThreshold: ""
                    },

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
                    thresholdStateText: ""

                });

                this.getView().setModel(
                    oViewModel,
                    "view"
                );

            },


            // =========================================
            // PRODUCT CLICK
            // =========================================

            onItemPress: function (oEvent) {

                var oItem = oEvent.getParameter("listItem")
                    || oEvent.getSource();

                var oContext =
                    oItem.getBindingContext("ProductModel");

                var sProductId =
                    oContext.getProperty("productId");

                this.getRouter().navTo(
                    "detail",
                    {
                        productId: sProductId
                    }
                );

            },


            // =========================================
            // SEARCH
            // =========================================

            onSearch: function (oEvent) {

                var sValue =
                    oEvent.getParameter("newValue");

                var aFilters = [];

                if (sValue) {

                    aFilters.push(

                        new Filter({
                            filters: [

                                new Filter(
                                    "name",
                                    FilterOperator.Contains,
                                    sValue
                                ),

                                new Filter(
                                    "category",
                                    FilterOperator.Contains,
                                    sValue
                                )

                            ],
                            and: false
                        })

                    );

                }

                this.byId("productList")
                    .getBinding("items")
                    .filter(aFilters);

            },


            // =========================================
            // OPEN ADD PRODUCT DIALOG
            // =========================================

            onAddProduct: function () {

                var oViewModel =
                    this.getView().getModel("view");

                oViewModel.setProperty(
                    "/dialogTitle",
                    "Add Product"
                );

                oViewModel.setProperty(
                    "/dialogMode",
                    "add"
                );

                oViewModel.setProperty(
                    "/product",
                    {
                        productId: "",
                        name: "",
                        category: "",
                        price: "",
                        currency: "USD",
                        stock: "",
                        reorderThreshold: ""
                    }
                );

                this._resetValidation();

                this._openProductDialog();

            },


            // =========================================
            // OPEN DIALOG
            // =========================================

            _openProductDialog: function () {

                var oView = this.getView();

                if (!this.byId("addEditProductDialog")) {

                    Fragment.load({

                        id: oView.getId(),

                        name:
                            "inventoryportal.fragment.AddEditProduct",

                        controller: this

                    }).then(function (oDialog) {

                        oView.addDependent(oDialog);

                        this._oProductDialog = oDialog;

                        oDialog.open();

                    }.bind(this));

                } else {

                    this.byId(
                        "addEditProductDialog"
                    ).open();

                }

            },


            // =========================================
            // SAVE PRODUCT
            // =========================================

            onSaveProduct: function () {

                if (!this._validateProduct()) {

                    return;

                }

                var oViewModel =
                    this.getView().getModel("view");

                var oProduct =
                    oViewModel.getProperty("/product");

                var sMode =
                    oViewModel.getProperty("/dialogMode");


                // Convert numeric fields
                oProduct.price =
                    Number(oProduct.price);

                oProduct.stock =
                    Number(oProduct.stock);

                oProduct.reorderThreshold =
                    Number(oProduct.reorderThreshold);


                if (sMode === "add") {

                    this._createProduct(oProduct);

                } else if (sMode === "edit") {

                    this._updateProduct(oProduct);

                }

            },


            // =========================================
            // CREATE PRODUCT
            // =========================================

            _createProduct: function (oProduct) {

                var oModel =
                    this.getView()
                        .getModel("ProductModel");

                var aProducts =
                    oModel.getProperty("/products");


                // Generate a simple ID
                var sProductId =
                    "P" + String(
                        aProducts.length + 1001
                    );


                oProduct.productId =
                    sProductId;


                aProducts.push(
                    oProduct
                );


                oModel.setProperty(
                    "/products",
                    aProducts
                );


                MessageToast.show(
                    "Product added successfully"
                );


                this._closeProductDialog();

            },


            // =========================================
            // UPDATE PRODUCT
            // =========================================

            _updateProduct: function (oProduct) {

                var oModel =
                    this.getView()
                        .getModel("ProductModel");

                var aProducts =
                    oModel.getProperty("/products");


                var iIndex =
                    aProducts.findIndex(
                        function (oItem) {

                            return oItem.productId ===
                                oProduct.productId;

                        }
                    );


                if (iIndex === -1) {

                    MessageBox.error(
                        "Product not found."
                    );

                    return;

                }


                aProducts[iIndex] =
                    Object.assign(
                        {},
                        oProduct
                    );


                oModel.setProperty(
                    "/products",
                    aProducts
                );


                MessageToast.show(
                    "Product updated successfully"
                );


                this._closeProductDialog();

            },


            // =========================================
            // CANCEL
            // =========================================

            onCancelProduct: function () {

                this._closeProductDialog();

            },


            // =========================================
            // CLOSE DIALOG
            // =========================================

            _closeProductDialog: function () {

                var oDialog =
                    this.byId(
                        "addEditProductDialog"
                    );

                if (oDialog) {

                    oDialog.close();

                }

            },


            // =========================================
            // VALIDATION
            // =========================================

            _validateProduct: function () {

                var oViewModel =
                    this.getView().getModel("view");

                var oProduct =
                    oViewModel
                        .getProperty("/product");

                var bValid = true;


                this._resetValidation();


                // Name
                if (!oProduct.name ||
                    !oProduct.name.trim()) {

                    oViewModel.setProperty(
                        "/nameState",
                        "Error"
                    );

                    oViewModel.setProperty(
                        "/nameStateText",
                        "Product name is required."
                    );

                    bValid = false;

                }


                // Category
                if (!oProduct.category ||
                    !oProduct.category.trim()) {

                    oViewModel.setProperty(
                        "/categoryState",
                        "Error"
                    );

                    oViewModel.setProperty(
                        "/categoryStateText",
                        "Category is required."
                    );

                    bValid = false;

                }


                // Price
                if (
                    oProduct.price === "" ||
                    isNaN(Number(oProduct.price)) ||
                    Number(oProduct.price) < 0
                ) {

                    oViewModel.setProperty(
                        "/priceState",
                        "Error"
                    );

                    oViewModel.setProperty(
                        "/priceStateText",
                        "Enter a valid price."
                    );

                    bValid = false;

                }


                // Currency
                if (!oProduct.currency ||
                    oProduct.currency.length !== 3) {

                    oViewModel.setProperty(
                        "/currencyState",
                        "Error"
                    );

                    oViewModel.setProperty(
                        "/currencyStateText",
                        "Enter a 3-letter currency code."
                    );

                    bValid = false;

                }


                // Stock
                if (
                    oProduct.stock === "" ||
                    isNaN(Number(oProduct.stock)) ||
                    Number(oProduct.stock) < 0
                ) {

                    oViewModel.setProperty(
                        "/stockState",
                        "Error"
                    );

                    oViewModel.setProperty(
                        "/stockStateText",
                        "Enter a valid stock quantity."
                    );

                    bValid = false;

                }


                // Reorder Threshold
                if (
                    oProduct.reorderThreshold === "" ||
                    isNaN(
                        Number(
                            oProduct.reorderThreshold
                        )
                    ) ||
                    Number(
                        oProduct.reorderThreshold
                    ) < 0
                ) {

                    oViewModel.setProperty(
                        "/thresholdState",
                        "Error"
                    );

                    oViewModel.setProperty(
                        "/thresholdStateText",
                        "Enter a valid reorder threshold."
                    );

                    bValid = false;

                }


                return bValid;

            },


            // =========================================
            // RESET VALIDATION
            // =========================================

            _resetValidation: function () {

                var oViewModel =
                    this.getView().getModel("view");


                oViewModel.setProperty(
                    "/nameState",
                    "None"
                );

                oViewModel.setProperty(
                    "/nameStateText",
                    ""
                );


                oViewModel.setProperty(
                    "/categoryState",
                    "None"
                );

                oViewModel.setProperty(
                    "/categoryStateText",
                    ""
                );


                oViewModel.setProperty(
                    "/priceState",
                    "None"
                );

                oViewModel.setProperty(
                    "/priceStateText",
                    ""
                );


                oViewModel.setProperty(
                    "/currencyState",
                    "None"
                );

                oViewModel.setProperty(
                    "/currencyStateText",
                    ""
                );


                oViewModel.setProperty(
                    "/stockState",
                    "None"
                );

                oViewModel.setProperty(
                    "/stockStateText",
                    ""
                );


                oViewModel.setProperty(
                    "/thresholdState",
                    "None"
                );

                oViewModel.setProperty(
                    "/thresholdStateText",
                    ""

                );

            },


            // =========================================
            // SORT
            // =========================================

            onOpenSort: function () {

                MessageToast.show(
                    "Sort Fragment"
                );

            },


            // =========================================
            // FILTER
            // =========================================

            onOpenFilter: function () {

                MessageToast.show(
                    "Filter Fragment"
                );

            }

        }
    );

});