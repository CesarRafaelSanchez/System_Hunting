import { EmailService } from '../src/dispatch/email.service';

async function test() {
  console.log('Testing EmailService directly');
  const service = new EmailService();
  try {
    await service.sendReportEmail({ property: { nombreEdificio: 'TEST E2E' }, opportunityId: 'OPP-123456' }, 'test.xlsx');
    console.log('Done!');
  } catch(e) {
    console.error(e);
  }
}

test();
