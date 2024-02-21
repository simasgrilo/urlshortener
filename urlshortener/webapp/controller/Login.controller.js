sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], function(Controller, MessageBox, Fragment) {
    "use strict";

    return Controller.extend("com.urlshortener.grilo.urlshortener.controller.Login", {
        _oRegisterFragment : null,

        onLoginClick : function() {
            const oBundle = this.getView().getModel("i18n").getResourceBundle();
            const sInfoText = oBundle.getText("missingUserOrPass");
            var oUser = this.getView().byId("user").getValue();
            var oPassword = this.getView().byId("pwd").getValue();
            if (oUser && oPassword) {
                //send to the login service.

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
                this._oRegisterFragment = sap.ui.xmlfragment("com.urlshortener.grilo.urlshortener.view.Register", this);
                this.getView().addDependent(this._oRegisterFragment);
            }
            this._oRegisterFragment.open();
        },

        onFragmentSubmit: function() {

        },

        onFragmentClose : function() {
            this._oRegisterFragment.close();
        }
    });
});