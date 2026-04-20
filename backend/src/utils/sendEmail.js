import nodemailer from "nodemailer";
import handlebars from "handlebars";
import { useModels } from "./tenantContext.js";

/**
 * Creates a dynamic transporter based on the tenant's SMTP settings.
 * Falls back to global environment variables if no custom settings are provided.
 */
const _getTransporter = async () => {
  const { Settings } = useModels();
  let smtpSettings = null;

  try {
    smtpSettings = await Settings.findOne({ category: "SMTP", isActive: true });
  } catch (err) {
    console.warn(
      "[sendEmail] Failed to fetch tenant SMTP settings, falling back to environment.",
    );
  }

  if (smtpSettings && smtpSettings.value) {
    const { host, port, secure, authUser, authPass } = smtpSettings.value;
    return nodemailer.createTransport({
      host,
      port: parseInt(port) || 587,
      secure: secure === true || secure === "true",
      auth: {
        user: authUser,
        pass: authPass,
      },
    });
  }

  // Global Fallback
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Compiles a Handlebars HTML string and injects dynamic variables.
 */
const _compileTemplate = (templateStr, variables = {}) => {
  const compiled = handlebars.compile(templateStr || "");
  return compiled(variables);
};

/**
 * Fetches an EmailTemplate by event name, compiles the HTML body, and fires the email.
 * Accepts 'models' for multi-tenant isolation.
 *
 * @param {String}   eventName     - Template identifier
 * @param {String|Array} toEmails  - Recipient(s)
 * @param {Object}   variables     - Handlebars context
 * @param {Object}   overrides     - Optional: { cc: [...], bcc: [...] }
 */
export const sendMappedEmail = async (
  eventName,
  toEmails,
  variables = {},
  overrides = {},
) => {
  try {
    const { EmailTemplate, Settings } = useModels();
    const template = await EmailTemplate.findOne({
      templateName: eventName.toUpperCase(),
      isActive: true,
    });

    if (!template) {
      console.warn(
        `[sendMappedEmail] No active email template found for event: "${eventName}". Skipping.`,
      );
      return;
    }

    const compiledSubject = _compileTemplate(template.subject, variables);
    const compiledHtml = _compileTemplate(template.htmlBody, variables);

    const toList = Array.isArray(toEmails) ? toEmails : [toEmails];
    const ccList = [
      ...(template.defaultCcRecipients || []),
      ...(overrides.cc || []),
    ];
    const bccList = [
      ...(template.defaultBccRecipients || []),
      ...(overrides.bcc || []),
    ];

    const transporter = await _getTransporter();

    // Determine sender address
    let fromEmail = process.env.SMTP_USER;
    try {
      const smtpSettings = await Settings.findOne({
        category: "SMTP",
        isActive: true,
      });
      if (smtpSettings?.value?.fromEmail)
        fromEmail = smtpSettings.value.fromEmail;
    } catch (e) {}

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || "Workflow System"}" <${fromEmail}>`,
      to: toList.join(","),
      subject: compiledSubject,
      html: compiledHtml,
    };

    if (ccList.length) mailOptions.cc = ccList.join(",");
    if (bccList.length) mailOptions.bcc = bccList.join(",");

    await transporter.sendMail(mailOptions);
    console.info(
      `[sendMappedEmail] Email "${eventName}" sent to ${toList.join(", ")}`,
    );
  } catch (err) {
    console.error(
      `[sendMappedEmail] Failed to send email for event "${eventName}":`,
      err.message,
    );
  }
};

/**
 * Sends a generic direct HTML email without querying database templates.
 *
 * @param {Object} options - { to, subject, html }
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = await _getTransporter();

    // Attempt to grab generic sender email, fallback to ENV
    let fromEmail = process.env.SMTP_USER;

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || "Workflow System"}" <${fromEmail}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.info(`[sendEmail] Direct email sent to ${to}`);
  } catch (err) {
    console.error(
      `[sendEmail] Failed to send generic email to "${to}":`,
      err.message,
    );
  }
};
