sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text"
], function(Controller, MessageBox, Dialog, Button, Text) {
    "use strict";

    return Controller.extend("com.urlshortener.grilo.urlshortener.controller.Login", {
        _oRegisterFragment : null,

        onBeforeRendering: function() {
            var that = this;
            $.ajax({
                type: "GET",
                url: "/urlservice/logon",
                success: function(response) {
                    that.getOwnerComponent().getRouter().navTo("main", {
                        "username": response["username"]
                    })
                },
                error: function(response) {
                    that.setDialog(response.responseJSON["message"]);
                },
                async: false
            });
        },

        onLoginClick : function() {
            const oBundle = this.getView().getModel("i18n").getResourceBundle();
            const sInfoText = oBundle.getText("missingUserOrPass");
            var sUser = this.getView().byId("user").getValue();
            var sPassword = this.getView().byId("pwd").getValue();
            var oPayload = {
                username: sUser,
                password: sPassword
            };
            var that = this;
            if (sUser && sPassword) {
                //send to the login service.
                $.ajax({
                    type: "POST",
                    url: "/urlservice/auth",
                    contentType: "application/json",
                    data: JSON.stringify(oPayload),
                    success: function(response) {
                        //need to pass the username to the next view, or get it from browser.
                        that.getOwnerComponent().getRouter().navTo("main" ,{
                            username : response["username"]
                        });
                    },
                    error: function(response) {
                        //failure error is not prompting the dialog.
                        if (response.responseJSON){
                            that.setDialog(response.responseJSON["message"]);
                        }
                        else {
                            that.setDialog(response.responseText);
                        }
                    }

                });
            }
            else {
                MessageBox.information(sInfoText, {
                    icon: MessageBox.Icon.INFORMATION,

                    }
                );
            }
        },
        
        onRegisterClick : function() {
            //opens a register fragment and registers the user if valid.
            if (!this._oRegisterFragment) {
                this._oRegisterFragment = sap.ui.xmlfragment(this.getView().getId(),"com.urlshortener.grilo.urlshortener.view.Register", this);
                this.getView().addDependent(this._oRegisterFragment);
            }
            this._oRegisterFragment.open();
        },

        onFragmentSubmit: function() {
            const oBundle = this.getView().getModel("i18n").getResourceBundle();
            const sInfoText = oBundle.getText("regInfoMissing");
            const sPassNotMatch = oBundle.getText("passNotMatch");
            const view = this.getView()
            //fragments work differently than the controls of the view. it's attached as dependent to the view, but it's not a part of the view.
            //id of the container and id of the element you want.
            var sUser = view.byId("regUsername").getValue();
            var sPassword = view.byId("regPassword").getValue();
            var sEmail = view.byId("regEmail").getValue();
            var sConfirmPassword = view.byId("regConfirmPass").getValue();
            if (sPassword !== sConfirmPassword){
                MessageBox.information(sPassNotMatch, {
                    icon: MessageBox.Icon.ERROR
                })
            }
            var oPayload = {
                username: sUser,
                password: sPassword,
                email: sEmail
            };
            var that = this;
            if (sUser && sPassword && sEmail) {
                //send to the login service.
                $.ajax({
                    async: false,
                    type: "POST",
                    url: "/urlservice/register",
                    contentType: "application/json",
                    data: JSON.stringify(oPayload),
                    success: function(response) {
                        that.setDialog(response["message"]);
                    },
                    error: function(response) {
                        //failure error is not prompting the dialog.
                        that.setDialog(response.responseJSON["message"]);
                    }

                });
            }
            else {
                MessageBox.information(sInfoText, {
                    icon: MessageBox.Icon.INFORMATION,

                    }
                );
            }

        },

        onFragmentClose : function() {
            this._oRegisterFragment.close();
        },

        setDialog : function(sDialogContent){
            console.log(sDialogContent);
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
    });
});