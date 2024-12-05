
const express = require('express');
const app = express();
const User = require('../../Db_Schemas/User');
const bcrypt = require('bcrypt');

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
    if (email === 'helio@gmail.com' && password === 'helio') {
        return res.json({
            auth: true, type: "admin"
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

app.get('/refreshUser/:userId',async(req,res,next)=>{
    const userId=req.params.userId;
    console.log(userId)
    User.findOne({_id:userId})
    .then(result=>{
        res.json(result);
    })
    .catch(error=>{
        console.log(error);
    })
})








module.exports = app;