const { EmailService } = require('./src/dispatch/email.service');
const emailService = new EmailService();
emailService.sendReportEmail({ property: { nombreEdificio: 'TEST E2E' }, opportunityId: 'OPP-123456' }, 'test.xlsx').then(console.log).catch(console.error);
