export interface IMailAdapter {
  sendMail(to: string, subject: string, html: string): Promise<void>;
}
