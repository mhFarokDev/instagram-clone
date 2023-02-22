import nodemailer from 'nodemailer'



// use gmail to send mail no need anything Just change ( host, port, user, pass) cl -> inst-cln -p10



  const sendEmailByGmail = async(to, subject, text) =>{
    try {
        let transport = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            auth: {
              user: "ahfaruk807@gmail.com",
              pass: "xxgofqzrdonxioan"
            }
          });

          await transport.sendMail({
            from : 'faruk.inst.@gmail.com',
            to : to,
            subject : subject,
            // text : text
            html : text
          })
    } catch (error) {
        console.log(error);
    }
  }

  export default sendEmailByGmail;