import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import en from "./templates/en";
import fr from "./templates/fr";
import Handlebars from "handlebars";

const transporter = nodemailer.createTransport(process.env.MAIL_URL);

const compileOptions: CompileOptions = {};

const runtimeOptions: RuntimeOptions = {
  allowProtoMethodsByDefault: true,
  allowProtoPropertiesByDefault: true,
};

Handlebars.registerHelper("eq", function (v1, v2) {
  return v1 === v2;
});

Handlebars.registerHelper(
  "formatDate",
  function (date: Date, language: string) {
    if (!date) {
      return "";
    }
    if (language === "fr") {
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
);

export type MailKeyType = keyof typeof en | keyof typeof fr;

export const mail = async (
  mailKey: MailKeyType,
  language: string,
  data: any
) => {
  const templates = language === "en" ? en : fr;
  const { subject, raw, html } = { ...templates[mailKey] };

  if (!subject) {
    throw new Error(
      `No mail subject template found for ${mailKey} in ${language}`
    );
  }
  const subjectTemplate = Handlebars.compile(subject, compileOptions);
  const rawTemplate = Handlebars.compile(raw, compileOptions);
  const htmlTemplate = Handlebars.compile(html, compileOptions);

  return {
    subject: subjectTemplate(data, runtimeOptions),
    html: htmlTemplate(data, runtimeOptions),
    text: rawTemplate(data, runtimeOptions),
  };
};

export const htmlToRawText = (html: string): string => {
  return html
    .replace(/<p[^>]*\/>/gi, "\n") // Replace self-closing <p/> tags with newlines
    .replace(/<p[^>]*>/gi, "") // Remove opening <p> tags
    .replace(/<\/p>/gi, "\n") // Replace closing </p> tags with newlines
    .replace(/<br\s*\/?>/gi, "\n") // Replace <br> tags with newlines
    .replace(/<[^>]*>/g, "") // Remove all other HTML tags
    .replace(/&nbsp;/g, " ") // Replace &nbsp; with spaces
    .replace(/&amp;/g, "&") // Replace &amp; with &
    .replace(/&lt;/g, "<") // Replace &lt; with <
    .replace(/&gt;/g, ">") // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .replace(/\n\s*\n/g, "\n") // Remove multiple consecutive newlines
    .trim(); // Remove leading/trailing whitespace
};

export const send = async (options: Mail.Options) => {
  if (!process.env.MAIL_URL) {
    console.log("SENDING EMAILS IS DISABLED");
    console.log(options);
    return;
  }
  const newOptions = { ...options };
  if (!options.text && options.html && typeof options.html === "string") {
    newOptions.text = htmlToRawText(options.html as string);
  }

  await transporter.sendMail(newOptions);
};
