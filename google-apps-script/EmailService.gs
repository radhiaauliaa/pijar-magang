/**
 * EmailService.gs
 */

var EmailService = {
  sendEmail: function(params) {
    var to = params.to;
    var subject = params.subject;
    var html = params.html;

    if (!to || !subject || !html) {
      return jsonResponse({ success: false, message: 'Parameter (to, subject, html) wajib diisi' }, 400);
    }

    try {
      MailApp.sendEmail({
        to: to,
        subject: subject,
        htmlBody: html,
        name: 'PIJAR PLN UP3 Padang'
      });
      Logger.log('[EmailService] Email successfully sent to ' + to + ' with subject: ' + subject);
      return jsonResponse({ success: true, message: 'Email berhasil dikirimkan dari magangplnup3pdg@gmail.com' });
    } catch (err) {
      Logger.log('[EmailService Error] ' + err.toString());
      return jsonResponse({ success: false, message: 'Gagal mengirim email: ' + err.toString() }, 500);
    }
  }
};
