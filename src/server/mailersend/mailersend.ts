import { env } from "@/env.mjs";

import { MailerSend, Recipient, EmailParams, Sender } from "mailersend";

export interface MailSendParams {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(params: MailSendParams) {
  const recipients = [new Recipient(params.to, params.toName)];
  const sender = new Sender(params.from, params.fromName);

  const emailParams = new EmailParams({
    from: sender,
    to: recipients,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });

  const mailersend = new MailerSend({
    apiKey: env.MAILERSEND_API_TOKEN,
  });
  await mailersend.email.send(emailParams);
}

export async function sendVerificationEmail({
  email,
  name,
  link,
}: {
  email: string;
  name: string;
  link: string;
}) {
  //Html verification email template
  const html = `
     <div style="font-family: sans-serif; text-align: center;">
        <h1 style="font-size: 2rem; margin-bottom: 2rem;"> Thank you for signing up for Podcast Solutions</h1>
        <p style="font-size: 1.2rem; margin-bottom: 2rem;">Hi ${name},</p>
        <p style="font-size: 1.2rem; margin-bottom: 2rem;">Please verify your email address by clicking the button below.</p>
        <a href="${link}" style="background-color: #00bfa6; color: white; padding: 1rem; border-radius: 0.5rem; text-decoration: none; font-size: 1.2rem;">Verify Email</a>
        <p style="font-size: 1.2rem; margin-bottom: 2rem;">If you did not create an account, no further action is required.</p>
        <p style="font-size: 1.2rem; margin-bottom: 2rem;">Thanks you!</p>
</div>
    `;
  await sendEmail({
    from: "signup@podcastsolutions.org",
    fromName: "Podcast Solutions",
    to: email,
    toName: name,
    subject: "Verify your email address",
    html,
    text: "Verify your email address",
  });
}

export async function sendPasswordRecoveryEmail({
  email,
  name,
  link,
}: {
  email: string;
  name: string;
  link: string;
}) {
  //Html verification email template
  const html = `
     <div style="font-family: sans-serif; text-align: center;">
        <h1 style="font-size: 2rem; margin-bottom: 2rem;">Hi ${name} we received a password reset request</h1>
        <p style="font-size: 1.2rem; margin-bottom: 2rem;">Reset your passwor clicking the button below.</p>
        <a href="${link}" style="background-color: #00bfa6; color: white; padding: 1rem; border-radius: 0.5rem; text-decoration: none; font-size: 1.2rem;">Reset password</a>
        <p style="font-size: 1.2rem; margin-bottom: 2rem;">If you did not request a password change, no further action is required.</p>
</div>
    `;
  await sendEmail({
    from: "password-reset@podcastsolutions.org",
    fromName: "Podcast Solutions",
    to: email,
    toName: name,
    subject: "Reset your password",
    html,
    text: "Reset your password",
  });
}
