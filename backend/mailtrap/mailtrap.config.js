
import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();

export const mailtrapClient = new MailtrapClient({ token: process.env.MAILTRAP_TOKEN,});

export const sender = {
  email: "hello@demomailtrap.com", //process.env.EMAIL_FROM,
  name: "Crypto-Insight", //process.env.EMAIL_FROM_NAME 
};


