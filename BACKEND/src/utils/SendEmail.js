import nodemailer from 'nodemailer'
import { ApiError } from './ApiError.js';

const sendEmail = async({to, subject, text, html})=>{
    try{
        //Create transporter
        const transporter = nodemailer.createTransport({
            service: "gmail", 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        //mail options
        const mailOptions = {
            from: `"Hostel Management" <${process.env.EMAIL_USER}`,
            to,
            subject,
            text,
            html
        };

        //send mail
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: ", info.messageId);
    }catch(error){
        console.error("Email error: ",error)
        throw new ApiError(500,"Email could not be sent")
    }
}

export {sendEmail}