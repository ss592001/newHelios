
// const express = require('express');
// const app = express();
// const User = require('../../Db_Schemas/User');
// const bcrypt = require('bcrypt');

// app.post('/signup', async (req, res, next) => {
//     const data = req.body;
//     const usr = await User.findOne({ email: data.email });
//     if (usr) {
//         return res.sendStatus(201);
//     }
//     const hashedPassword = await bcrypt.hash(data.password, 10);
//     const newuser = new User({
//         name: data.name,
//         email: data.email,
//         password: hashedPassword,
//         assignedTests: [],
//         completedTests: []
//     })
//     await newuser.save()
//         .then(result => {
//             console.log(result);
//             res.json(result);
//             res.sendStatus(200);
//         })
//         .catch(error => {
//             console.log(error);
//         })

// })

// app.get('/login/:email/:password', async (req, res, next) => {
//     const email = req.params.email;
//     const password = req.params.password;
//     if (email === 'helio@gmail.com' && password === 'helio') {
//         return res.json({
//             auth: true, type: "admin"
//         })
//     }
//     const usr = await User.findOne({ email: email });
//     if (usr !== null) {
//         const isMatch = bcrypt.compare(password, usr.password)
//             .then(result => {
//                 if (result) {
//                     res.json({ auth: true, data: usr, type: 'user' });
//                 }
//                 else {
//                     res.json({ auth: false });
//                 }
//             })
//             .catch(error => {
//                 console.log(error)
//             })
//     }
//     else {
//         res.json({ auth: false });
//     }
// })

// app.get('/refreshUser/:userId',async(req,res,next)=>{
//     const userId=req.params.userId;
//     console.log(userId)
//     User.findOne({_id:userId})
//     .then(result=>{
//         res.json(result);
//     })
//     .catch(error=>{
//         console.log(error);
//     })
// })








// module.exports = app;




const express = require('express');
const app = express();
const User = require('../../Db_Schemas/User');
const bcrypt = require('bcrypt');

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: 'info@rvgoprep.com',
        pass: 'Rvgoprep@2025',
    },
});
app.post("/sendEmail", async (req, res) => {
    const { name, email, phone, desc } = req.body;
    const htmlContent = `
<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 30px; font-family: Arial, sans-serif;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <tr>
          <td style="background-color: #4b6cb7; padding: 20px 40px; color: #ffffff; font-size: 24px; font-weight: bold;">
            You got a new enquiry from ${name}
          </td>
        </tr>
        <tr>
          <td style="padding: 30px 40px; color: #333333;">
            <p style="font-size: 16px; margin: 0 0 10px;"><strong>Email:</strong> ${email}</p>
            <p style="font-size: 16px; margin: 0 0 10px;"><strong>Phone:</strong> ${phone}</p>
            <p style="font-size: 16px; margin: 20px 0 0;"><strong>Description:</strong></p>
            <p style="font-size: 15px; line-height: 1.6; background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
             ${desc}
            </p>

            <div style="margin-top: 30px; text-align: center;display:flex;gap:2%">
              <a href="mailto:${email}" style="display: inline-block; background-color: #4b6cb7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 5px;">Reply by Email</a>
              <a href="sms:${phone}" style="display: inline-block; background-color: #4b6cb7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 5px;">Reply by SMS</a>
              <a href="tel:${phone}" style="display: inline-block; background-color: #4b6cb7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 5px;">Call Now</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background-color: #eaeaea; padding: 15px 40px; text-align: center; font-size: 12px; color: #777;">
            This email was generated from your website form - RVGOPREP.COM .
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;
    const mailOptions = {
        from: 'info@rvgoprep.com',
        to: 'info@rvgoprep.com',
        subject: 'New Enquery From RVGOPREP',
        html: htmlContent,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Email sent", info });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ success: false, message: "Failed to send email", error });
    }
});

app.post('/signup', async (req, res, next) => {
    const data = req.body;
    const usr = await User.findOne({ email: data.email });
    if (usr) {
        return res.sendStatus(201);
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newuser = new User({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        assignedTests: [],
        completedTests: []
    })
    await newuser.save()
        .then(result => {
            console.log(result);
            res.json(result);
            res.sendStatus(200);
        })
        .catch(error => {
            console.log(error);
        })

})

app.get('/login/:email/:password', async (req, res, next) => {
    const email = req.params.email;
    const password = req.params.password;
    const xactEmail = email === 'root.rvgo@gmail.com' ? 'root.rvgo@gmail.com' : 'temp@gmail.com';
    if ((email === 'root.rvgo@gmail.com' && password === 'rvgo@2025')
        || (email === 'temp@gmail.com' && password === 'temp_root_access')) {
        return res.json({
            auth: true, type: "admin", data: { _id: "682a069dabdf121fa26d3e68", email: xactEmail }
        })
    }
    const usr = await User.findOne({ email: email });
    if (usr !== null) {
        const isMatch = bcrypt.compare(password, usr.password)
            .then(result => {
                if (result) {
                    res.json({ auth: true, data: usr, type: 'user' });
                }
                else {
                    res.json({ auth: false });
                }
            })
            .catch(error => {
                console.log(error)
            })
    }
    else {
        res.json({ auth: false });
    }
})

app.get('/refreshUser/:userId', async (req, res, next) => {
    const userId = req.params.userId;
    console.log(userId)
    User.findOne({ _id: userId })
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            console.log(error);
        })
})








module.exports = app;
