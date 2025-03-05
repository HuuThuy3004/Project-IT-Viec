import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from './mail.service';

@Processor('mail-queue')
export class MailProcessor extends WorkerHost {
  constructor(private readonly mailService: MailService) {
    super();
  }
  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'send-mail-applicant') {
      await this.mailService.sendMail(
        job.data.email,
        'Welcom to IT viec',
        'welcome-application',
        {
          name: job.data.name,
          email: job.data.email,
        },
      );
    }
    console.log('job handled successfully', job.data)
    if (job.name === 'send-mail-company') {
      await this.mailService.sendMail(
        job.data.email,
        'Welcom to IT viec',
        'welcome-application',
        {
          name: job.data.name,
          email: job.data.email,
          company: job.data.company,
        },
      );
    }
    console.log('Job send mail to company handled successfully', job.data)

  }
}
