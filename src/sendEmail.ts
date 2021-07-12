import sgMail from "@sendgrid/mail";
import { Email } from "./entity/Email";

export const send = async (text: string, html: string, subject: string) => {
  const all = await Email.find();
  const total = all.map((x) => {
    return x.email;
  });
  try {
    await sgMail.send({
      to: total,
      from: "newsolutionsproject@gmail.com",
      subject,
      text,
      html,
    });
  } catch (err) {
    throw new Error("There is an Error");
  }
};
