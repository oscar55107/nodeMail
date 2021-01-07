let express = require('express');
let admin = require("firebase-admin");
let serviceAccount = require("../project-4204899175405540532-firebase-adminsdk-k9hlb-36647f22af.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://project-4204899175405540532-default-rtdb.firebaseio.com"
});
let firedata = admin.database()
let nodemailer = require('nodemailer');
let csrf = require('csurf')
let csrfProtection = csrf({ cookie: true })
require('dotenv').config()
let router = express.Router();
router.get('/',csrfProtection,function(req, res) {
    res.render('contact',{ 
        csrfToken: req.csrfToken(),
        errors: req.flash('errors'), 
    });
});
router.get('/review', function(req, res) {
    res.render('contactReview');
});
router.post('/post',csrfProtection,function(req, res) {
    let username = req.body.username;
    let email = req.body.email;
    let number = req.body.number;
    let description = req.body.description;
    let date = Math.floor(new Date(req.body.date) / 1000) 
    let data = {
        username: username,
        email: email,
        number: number,
        description: description,
        date: date
    }
    if(req.body.username===''){
        req.flash('errors','請填入姓名')
        res.redirect('/contact')
    } else if(req.body.email===''){
        req.flash('errors','請填入電子郵件')
        res.redirect('/contact')
    } else if(req.body.number===''){
        req.flash('errors','請填入人數')
        res.redirect('/contact')
    }else if(req.body.date===''){
        req.flash('errors','請填入時間')
        res.redirect('/contact')
    }
    var transporter = nodemailer.createTransport({
        service:'Gmail',
        auth:{
            type: "OAuth2",
            user:'s1031581@gm.pu.edu.tw',
            clientId: process.env.clientId,
            clientSecret: process.env.clientSecret,
            refreshToken: process.env.refreshToken,
        }
    })
    var mailOptions = {
        from:'Fireman美式餐廳<s1031581@gm.pu.edu.tw>',
        to:'jerry55107@gmail.com',
        subject:req.body.username + '訂位成功',
        text:req.body.description,
    }
    transporter.sendMail(mailOptions,function(err, info) {
        if(err){
            return console.log(err);
        }
    })
    firedata.ref('userDetail').push(data)
    .then(function(){
    })
    res.redirect('/contact/review');
});
module.exports = router;
