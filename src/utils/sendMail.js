import nodemailer from 'nodemailer';
import { EMAIL_USERNAME, EMAIL_PASSWORD } from '../configs/enviroments.js';

export const sendEmail = async (to, subject, text) => {
  try {
    console.log('Email config:', { 
      username: EMAIL_USERNAME, 
      passwordLength: EMAIL_PASSWORD ? EMAIL_PASSWORD.length : 0 
    });
    
    const transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		auth: {
		  user: EMAIL_USERNAME,
		  pass: EMAIL_PASSWORD
		}
	  });

    const mailOptions = {
      from: EMAIL_USERNAME,
      to,
      subject,
      text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Không thể gửi email');
  }
};
