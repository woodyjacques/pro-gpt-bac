import { MailerOptions } from "@nestjs-modules/mailer";

export const mailerConfig: MailerOptions = {
    transport:{
        host:"smtp.gmail.com",
        port:587,
        secure:false,
        auth:{
            user: "briefly376@gmail.com",
            pass:"mcmljkozztbaffna"
        },
        tls:{
            rejectUnauthorized: false
        }
    },
}