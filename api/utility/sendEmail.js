import nodemailer from 'nodemailer'




  const sendEmail = async(to, subject, text) =>{
    try {
        let transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: "323fd5cbac6a89",
              pass: "48f45a1412d9f7"
            }
          });

          await transport.sendMail({
            from : 'faruk.inst.@gmail.com',
            to : to,
            subject : subject,
            text : text
          })
    } catch (error) {
        console.log(error);
    }
  }

  export default sendEmail;