import { MailerOptions } from "@nestjs-modules/mailer";

export const mailerConfig: MailerOptions = {
    transport:{
        host:"smtp.gmail.com",
        port:587,
        secure:false,
        auth:{
            user: "liketechnology95@gmail.com",
            pass:"ifllxthtotfxaohc"
        },
        tls:{
            rejectUnauthorized: false
        }
    },
}