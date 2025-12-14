// app/[lang]/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, company, phone, message } =
      await request.json();

    // Расширенная валидация на сервере
    const errors: string[] = [];

    // Проверка обязательных полей
    if (!firstName?.trim()) errors.push("First name is required");
    if (!lastName?.trim()) errors.push("Last name is required");
    if (!email?.trim()) errors.push("Email is required");
    if (!message?.trim()) errors.push("Message is required");

    // Проверка длины имени/фамилии
    if (firstName && firstName.trim().length < 2) {
      errors.push("First name must be at least 2 characters");
    }
    if (lastName && lastName.trim().length < 2) {
      errors.push("Last name must be at least 2 characters");
    }

    // Проверка формата имени/фамилии
    const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s\-']+$/;
    if (firstName && !nameRegex.test(firstName)) {
      errors.push("First name contains invalid characters");
    }
    if (lastName && !nameRegex.test(lastName)) {
      errors.push("Last name contains invalid characters");
    }

    // Проверка email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      errors.push("Invalid email format");
    }

    // Проверка одноразовых email
    const disposableEmails = [
      "tempmail.com",
      "10minutemail.com",
      "guerrillamail.com",
      "mailinator.com",
      "throwaway.email",
      "temp-mail.org",
    ];
    if (email) {
      const domain = email.split("@")[1]?.toLowerCase();
      if (domain && disposableEmails.includes(domain)) {
        errors.push("Disposable email addresses are not allowed");
      }
    }

    // Проверка сообщения
    if (message && message.trim().length < 10) {
      errors.push("Message must be at least 10 characters");
    }
    if (message && message.length > 500) {
      errors.push("Message must be 500 characters or less");
    }

    // Проверка телефона (если указан)
    if (phone) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(phone)) {
        errors.push("Invalid phone format");
      } else {
        const digitsOnly = phone.replace(/\D/g, "");
        if (digitsOnly.length < 7 || digitsOnly.length > 15) {
          errors.push("Phone must be between 7 and 15 digits");
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    // Настройка транспорта
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // HTML шаблон письма
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #1f2937;
              color: white;
              padding: 20px;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f9fafb;
              padding: 20px;
              border: 1px solid #e5e7eb;
              border-radius: 0 0 5px 5px;
            }
            .field {
              margin-bottom: 15px;
            }
            .label {
              font-weight: bold;
              color: #1f2937;
            }
            .value {
              color: #4b5563;
              margin-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Contact Form Submission</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${firstName} ${lastName}</div>
              </div>
              
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${email}</div>
              </div>
              
              ${
                company
                  ? `
              <div class="field">
                <div class="label">Company:</div>
                <div class="value">${company}</div>
              </div>
              `
                  : ""
              }
              
              ${
                phone
                  ? `
              <div class="field">
                <div class="label">Phone:</div>
                <div class="value">${phone}</div>
              </div>
              `
                  : ""
              }
              
              <div class="field">
                <div class="label">Message:</div>
                <div class="value">${message.replace(/\n/g, "<br>")}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Отправка письма
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL || "craft.bear2025@gmail.com",
      replyTo: email,
      subject: `New Contact Form: ${firstName} ${lastName}`,
      html: htmlContent,
      text: `
Name: ${firstName} ${lastName}
Email: ${email}
Company: ${company || "N/A"}
Phone: ${phone || "N/A"}

Message:
${message}
      `,
    });

    return NextResponse.json(
      { success: true, message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
