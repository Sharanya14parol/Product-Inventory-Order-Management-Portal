sap.ui.define([
    "./BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../model/formatter"
], function (
    BaseController,
    Filter,
    FilterOperator,
    formatter
) {

"use strict";

return BaseController.extend(
"inventoryportal.controller.List",

{

formatter: formatter,

onInit:function(){

},

onItemPress:function(oEvent){

var oItem = oEvent.getSource();

var sProductId = oItem.getBindingContext("products")
.getProperty("productId");

this.getRouter().navTo("detail",{

productId:sProductId

});

},

onSearch:function(oEvent){

var sValue = oEvent.getParameter("newValue");

var oFilter = new Filter({

filters:[

new Filter("name",
FilterOperator.Contains,
sValue),

new Filter("category",
FilterOperator.Contains,
sValue)

],

and:false

});

this.byId("productList")
.getBinding("items")
.filter(oFilter);

},

onAddProduct:function(){

sap.m.MessageToast.show(
"Open Add Product Dialog"
);

},

onOpenSort:function(){

sap.m.MessageToast.show(
"Sort Fragment"
);

},

onOpenFilter:function(){

sap.m.MessageToast.show(
"Filter Fragment"
);

}

});

});