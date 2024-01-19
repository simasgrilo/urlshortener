sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Label",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text"
],
    function(Controller, Label, Dialog, Button, Text) {
        "use strict";
        return Controller.extend("com.urlshortener.grilo.urlshortener.controller.Main", {
            onInit : function() {

            },

            onHashPress : function(oEvent) {
                var sText = this.getView().byId("originalUrl").getValue();
                var oFormData = {
                    "url" : sText
                };
                if (!this._validateUrl(sText)) {
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
                    failure: function() {
                        that.setDialog(response["message"]);
                    }
                });
            },

            onDeletePress: function(){
                var sText = {
                   "url" : this.getView().byId("originalUrl").getValue()
                }
                if (!this._validateUrl(sText)) {
                    return;
                }
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
                    failure: function(response) {
                        that.setDialog(response["message"]);
                    }
                });
            },

            onRetrievePress: function(){
                var sText = {
                    "url": this.getView().byId("retrieveUrl").getValue()
                };
                if (!this._validateUrl(sText)) {
                    return;
                }
                var that = this;
                $.ajax({
                    type: "GET",
                    url: "/urlservice/shorten",
                    contentType: "application/json",
                    data: JSON.stringify(sText),
                    success: function(){
                        that.setDialog(response["message"]);
                    },
                    failure: function(){
                        that.setDialog(response["message"]);
                    }
                })
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
                            buttonType : "Emphasized",
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
            }
        });
    }
);