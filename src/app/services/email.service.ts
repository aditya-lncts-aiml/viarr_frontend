import { Injectable } from '@angular/core';
import emailjs from 'emailjs-com';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private serviceId = 'viarr_service';
  private templateId = 'service_viarr';
  private userId = 'lwmZfGJ8EUlva6jep';

  constructor() {}

  sendOtpEmail(email: string, otp: string, time: string): Promise<any> {
    const templateParams = {
        to_email: email,
        otp: otp,
        time: new Date().toLocaleString(),
      };
      

    return emailjs.send(this.serviceId, this.templateId, templateParams, this.userId);
  }
}
