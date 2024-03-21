sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Label",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
],
    function(Controller, Label, Dialog, Button, Text) {
        "use strict";
        return Controller.extend("com.urlshortener.grilo.urlshortener.controller.Main", {
            _sUser : null,

            onInit : function() {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.attachRouteMatched(this.onRouteMatched, this);
            },

            onRouteMatched: function(oEvent) {
                //triggers when this controller is acessed via routing.
                var oArguments = oEvent.getParameter("arguments");
                this._sUser = oArguments["user"];
            },

            onHashPress : function(oEvent) {
                var sText = this.getView().byId("originalUrl").getValue();
                var oFormData = {
                    "url" : sText
                };
                if (!this._validateUrl(sText) || !sText) {
                    var oBundle = this.getView().getModel("i18n").getResourceBundle();
                    var sValueMessage = oBundle.getText("missingHashText");
                    this.SetDialog(sValueMessage);
                    return;
                }
                var that = this;
                //we're using AJAX requests because this ain't a ODATA service-compliant with UI5 methods.
                $.ajax({
                    type : "POST",
                    url: "/urlservice/shorten",
                    contentType: "application/json",
                    data: JSON.stringify(oFormData),
                    success: function(response) {
                        that.setDialog(response["shortened"]);
                    },
                    error: function(response) {
                        that.setDialog(response["message"]);
                    }
                });
            },

            onDeletePress: function(){
                var sText = {
                   "url" : this.getView().byId("originalUrl").getValue()
                }
                if (!sText["url"]) {
                    const oBundle = this.getView().getModel("i18n").getResourceBundle();
                    const sInfoText = oBundle.getText("noDeleteParam");
                    this.setDialog(sInfoText);
                    return;
                }
                /*if (!this._validateUrl(sText)) {
                    return;
                }*/
                var that = this;
                $.ajax({
                    type: "DELETE",
                    url: "/urlservice/shorten",
                    contentType: "application/json",
                    //data needs to be a json ALWAYS
                    data: JSON.stringify(sText),
                    success: function(response) {
                        that.setDialog(response["message"]);
                    },
                    error: function(response) {
                        that.setDialog(response["message"]);
                    }
                });
            },

            onRetrievePress: function(){
                var sText = {
                    "url": this.getView().byId("retrieveUrl").getValue()
                };
                var that = this;
                $.ajax({
                    type: "SEARCH",
                    url: "/urlservice/shorten",
                    contentType: "application/json",
                    data: JSON.stringify(sText),
                    statusCode: {
                        302: function(response){
                            that.setDialog(response.responseJSON['message']['origUrl']);
                        },
                        404: function(response){
                            that.setDialog(response.responseJSON['message']);
                        },
                        500: function(response){
                            that.setDialog(response.responseJSON['message']);
                        }
                    },
                    success: function(response){
                        that.setDialog(response.responseJSON["message"]);
                    },
                    error: function (response) {
                        that.setDialog(response["responseText"]);
                    }
                })
            },

            onLogoutPress: function() {
                //TODO invalidate cache in the server for the user.
                var that = this;
                $.ajax({
                    type:"POST",
                    url: "/urlservice/logoff",
                    success: function(response) {
                        var oRouter = that.getOwnerComponent().getRouter();
                        //var sPreviousHash = History.getInstance().getPreviousHash();
                        oRouter.navTo("login",{}, true);
                    }, 
                    error: function(response) {
                        var oBundle = that.getView().getModel("i18n").getResourceBundle();
                        var sDialogText = oBundle.getText("logoffFailure");
                        that.setDialog(sDialogText);
                    }
                });
            },
            
            onListPress : function() {
                //this should be in the onBeforeRender of the List controller.
                var body = {
                    "user" : this._sUser
                }
                var that = this;
                $.ajax({
                    type: "SEARCH",
                    data: JSON.stringify(body),
                    url: "/urlservice/urlcollection",
                    contentType: "application/json",
                    success: function(response) {
                        var oModel = new sap.ui.model.json.JSONModel();
                        oModel.setData(response);
                        //bind the model to the core, not to the view.
                        //sap.ui.getCore().setModel(oModel);
                        that.getView().setModel(oModel);
                        that._listFragment()
                    },
                    error: function(response) {

                    }

                });
            },

            setDialog : function(sDialogContent){
                if(!this._oDialog){   
                    this._oDialog = new Dialog({
                        type : "Message",
                        title : "Result",
                        content : new Text({
                            text : sDialogContent
                        }),
                        beginButton : new Button({
                            text : "OK",
                            press: function () {
                                //you need to refer the parent as the button's context is within the _oDialog itself
                                this.getParent().close();
                            }
                        })
                    });
                }
                else {
                    this._oDialog.destroyContent();
                    this._oDialog.addContent(new Text({
                        text : sDialogContent
                    }));
                }
                this._oDialog.open();
            },

            _validateUrl : function(sUrl) {
                if (!jQuery.sap.validateUrl(sUrl)) {
                    this.setDialog("Please enter a valid URL");
                    return false;
                }
                return true
            },

            _listFragment : function() {
                //opens a register fragment and registers the user if valid.
                if (!this._oListFragment) {
                    this._oListFragment = sap.ui.xmlfragment(this.getView().getId(),"com.urlshortener.grilo.urlshortener.view.List", this);
                    var oTable = this.getView().byId("urlList")
                    this.getView().addDependent(this._oListFragment);
                }
                this._oListFragment.open();
            },

            onListCancelPress: function() {
                this.getView().byId("urlListCancel").getParent().close();
            }
        });
    },
    
);