sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "../model/formatter"
], function (
    BaseController,
    JSONModel,
    MessageToast,
    MessageBox,
    Fragment,
    formatter
) {

    "use strict";

    return BaseController.extend(
        "inventoryportal.controller.Detail",
        {

            formatter: formatter,


            // =========================================
            // INIT
            // =========================================

            onInit: function () {

                var oRouter =
                    this.getRouter();

                oRouter
                    .getRoute("detail")
                    .attachPatternMatched(
                        this._onObjectMatched,
                        this
                    );


                var oViewModel =
                    new JSONModel({

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
                        thresholdStateText: ""

                    });


                this.getView()
                    .setModel(
                        oViewModel,
                        "view"
                    );

            },


            // =========================================
            // ROUTE MATCHED
            // =========================================

            _onObjectMatched: function (oEvent) {

                var sProductId =
                    oEvent
                        .getParameter("arguments")
                        .productId;


                var oModel =
                    this.getView()
                        .getModel("products");


                var aProducts =
                    oModel.getProperty("/products");


                var oProduct =
                    aProducts.find(
                        function (oItem) {

                            return oItem.productId ===
                                sProductId;

                        }
                    );


                if (!oProduct) {

                    MessageBox.error(
                        "Product not found."
                    );

                    this.getRouter()
                        .navTo("list");

                    return;

                }


                this.getView()
                    .bindElement({
                        path:
                            "/products/" +
                            aProducts.indexOf(oProduct),

                        model: "products"
                    });

            },


            // =========================================
            // EDIT PRODUCT
            // =========================================

            onEdit: function () {

                var oContext =
                    this.getView()
                        .getBindingContext("products");


                if (!oContext) {

                    MessageBox.error(
                        "Product data not available."
                    );

                    return;

                }


                var oProduct =
                    oContext.getObject();


                var oViewModel =
                    this.getView()
                        .getModel("view");


                // Make a copy.
                // This is important because
                // changes should not immediately
                // affect the original product.

                oViewModel.setProperty(
                    "/product",
                    Object.assign(
                        {},
                        oProduct
                    )
                );


                oViewModel.setProperty(
                    "/dialogTitle",
                    "Edit Product"
                );


                oViewModel.setProperty(
                    "/dialogMode",
                    "edit"
                );


                this._resetValidation();

                this._openProductDialog();

            },


            // =========================================
            // OPEN PRODUCT DIALOG
            // =========================================

            _openProductDialog: function () {

                var oView =
                    this.getView();


                if (!this.byId(
                    "addEditProductDialog"
                )) {

                    Fragment.load({

                        id: oView.getId(),

                        name:
                            "inventoryportal.fragment.AddEditProduct",

                        controller: this

                    }).then(function (oDialog) {

                        oView.addDependent(
                            oDialog
                        );

                        this._oProductDialog =
                            oDialog;

                        oDialog.open();

                    }.bind(this));

                } else {

                    this.byId(
                        "addEditProductDialog"
                    ).open();

                }

            },


            // =========================================
            // SAVE EDIT
            // =========================================

            onSaveProduct: function () {

                if (!this._validateProduct()) {

                    return;

                }


                var oViewModel =
                    this.getView()
                        .getModel("view");


                var oEditedProduct =
                    oViewModel
                        .getProperty("/product");


                var oContext =
                    this.getView()
                        .getBindingContext(
                            "products"
                        );


                if (!oContext) {

                    MessageBox.error(
                        "Product context not found."
                    );

                    return;

                }


                var oModel =
                    this.getView()
                        .getModel("products");


                var aProducts =
                    oModel.getProperty("/products");


                var iIndex =
                    aProducts.findIndex(
                        function (oItem) {

                            return oItem.productId ===
                                oEditedProduct.productId;

                        }
                    );


                if (iIndex === -1) {

                    MessageBox.error(
                        "Product not found."
                    );

                    return;

                }


                oEditedProduct.price =
                    Number(
                        oEditedProduct.price
                    );


                oEditedProduct.stock =
                    Number(
                        oEditedProduct.stock
                    );


                oEditedProduct.reorderThreshold =
                    Number(
                        oEditedProduct.reorderThreshold
                    );


                aProducts[iIndex] =
                    Object.assign(
                        {},
                        oEditedProduct
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
            // CLOSE
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
                    this.getView()
                        .getModel("view");


                var oProduct =
                    oViewModel
                        .getProperty("/product");


                var bValid = true;


                this._resetValidation();


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
                    this.getView()
                        .getModel("view");


                var aProperties = [

                    "/nameState",
                    "/categoryState",
                    "/priceState",
                    "/currencyState",
                    "/stockState",
                    "/thresholdState"

                ];


                aProperties.forEach(
                    function (sPath) {

                        oViewModel.setProperty(
                            sPath,
                            "None"
                        );

                    }
                );


                oViewModel.setProperty(
                    "/nameStateText",
                    ""
                );

                oViewModel.setProperty(
                    "/categoryStateText",
                    ""
                );

                oViewModel.setProperty(
                    "/priceStateText",
                    ""
                );

                oViewModel.setProperty(
                    "/currencyStateText",
                    ""
                );

                oViewModel.setProperty(
                    "/stockStateText",
                    ""
                );

                oViewModel.setProperty(
                    "/thresholdStateText",
                    ""
                );

            },


            // =========================================
            // DELETE
            // =========================================

            onDelete: function () {

                var oContext =
                    this.getView()
                        .getBindingContext(
                            "products"
                        );


                if (!oContext) {

                    return;

                }


                var sProductName =
                    oContext.getProperty(
                        "name"
                    );


                MessageBox.confirm(

                    "Delete " +
                    sProductName +
                    "?",

                    {

                        onClose:
                            function (sAction) {

                                if (
                                    sAction === "OK"
                                ) {

                                    var oModel =
                                        this.getView()
                                            .getModel(
                                                "products"
                                            );


                                    var aProducts =
                                        oModel.getProperty(
                                            "/products"
                                        );


                                    var sProductId =
                                        oContext
                                            .getProperty(
                                                "productId"
                                            );


                                    var aUpdatedProducts =
                                        aProducts.filter(
                                            function (
                                                oProduct
                                            ) {

                                                return (
                                                    oProduct.productId
                                                    !==
                                                    sProductId
                                                );

                                            }
                                        );


                                    oModel.setProperty(
                                        "/products",
                                        aUpdatedProducts
                                    );


                                    MessageToast.show(
                                        "Product deleted"
                                    );


                                    this.getRouter()
                                        .navTo("list");

                                }

                            }.bind(this)

                    }

                );

            },


            // =========================================
            // BACK
            // =========================================

            onNavBack: function () {

                this.getRouter()
                    .navTo("list");

            }

        }
    );

});