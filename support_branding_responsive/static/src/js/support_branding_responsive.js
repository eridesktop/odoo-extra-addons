
// Copyright© 2018-today  ICTSTUDIO <http://www.ictstudio.eu>
// License: LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl)

odoo.define('web.support_branding_responsive', function(require) {
    var CrashManager = require('web.CrashManager');
    var core = require('web.core');
    var Model = require('web.Model');
    var session = require('web.session');
    var _t = core._t;
    CrashManager.include({
        init: function() {
            var self = this,
                ir_config_parameter = new Model('ir.config_parameter');
            ir_config_parameter.call(
                'get_param', ['support_branding_responsive.support_email']).then(
                function(email) {
                    self.support_branding_responsive_support_email = email;
                });
            ir_config_parameter.call(
                'get_param', ['support_branding_responsive.company_name']).then(
                function(name) {
                    self.support_branding_responsive_company_name = name;
                });
            return this._super(this, arguments);
        },
        show_error: function(error) {
            var self = this;
            error._session = session;
            this._super.apply(this, arguments);
            jQuery('.support-branding-submit-form').each(function() {
                var $form = jQuery(this),
                    $button = $form.find('button'),
                    $description = $form.find('textarea[name="description"]'),
                    $subject = $form.find('input[name="subject"]'),
                    $body = $form.find('input[name="body"]');
                if (self.support_branding_responsive_support_email) {
                    $form.attr(
                        'action',
                        'mailto:' + self.support_branding_responsive_support_email);
                    $form.parents('.modal').find('.modal-body')
                        .css('max-height', '70vh');
                    $button.click(function(ev) {
                        var mail_mail = new Model('mail.mail');
                        if (!$description.val()) {
                            $description.parent().addClass('oe_form_invalid');
                            ev.preventDefault();
                            return;
                        }
                        mail_mail.call(
                                'create', [{
                                    state: 'outgoing',
                                    auto_delete: true,
                                    email_to: self.support_branding_responsive_support_email,
                                    subject: $subject.val(),
                                    body_html: jQuery('<div/>').append(
                                        jQuery('<div/>').text($description.val()),
                                        jQuery('<pre/>').text($body.val())
                                    ).html(),
                                }])
                            .then(function(mail_id) {
                                return mail_mail.call('send', [
                                    [mail_id]
                                ]);
                            }, function() {
                                // if the call failed, fire the mailto link
                                // hoping there is a properly configured email
                                // client
                                $body.val($description.val() + '\n' + $body.val());
                                $button.unbind('click');
                                $button.click();
                            })
                            .then(function() {
                                $form.parents('.modal').modal('hide');
                            });
                        ev.preventDefault();
                    });
                } else {
                    $description.hide();
                    $button.hide();
                }
                if (self.support_branding_responsive_company_name) {
                    $button.text(
                        _.str.sprintf(
                            _t('Email to %s'),
                            self.support_branding_responsive_company_name));
                }
                $form.prependTo(
                    $form.parents('.modal-dialog').find('.modal-footer'));
            });
        }
    });
    // this is already instantiated, so we need to call init manually
    require('web.crash_manager').init();
});