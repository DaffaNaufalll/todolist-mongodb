// filepath: c:\Users\Anime\OneDrive\Documents\Tugas\mern-project Daffa\server\testEmail.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function testSend() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    let info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // send to yourself for testing
      subject: 'Test Email',
      text: 'This is a test email from your MERN project.',
    });
    console.log('Email sent:', info.response);
  } catch (err) {
    console.error('Error sending email:', err);
  }
}

testSend();