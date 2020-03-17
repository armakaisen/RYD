const express = require('express');
const ruta = express.Router();
const passport = require('passport');
const {isLoggedIn} = require('../lib/autoriza');

ruta.get('/signup', isLoggedIn, (req, res)=>{
    res.render("auth/signup");
})

ruta.post('/signup', passport.authenticate('local.signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true    
}));

/*
ruta.get('/signin', (req, res)=>{
    res.render('auth/signin');
})*/
ruta.get('/', (req, res)=>{
    res.render('auth/signin');
})

ruta.post('/signin', (req, res, next)=>{
    passport.authenticate('local.signin',{
        successRedirect: '/list',
        //successRedirect: '/profile',
        failureRedirect: '/',
        failureFlash: true
    })(req, res, next);
});

ruta.get('/profile', isLoggedIn, (req, res)=>{
    res.render('profile');
})

ruta.get('/logout', isLoggedIn, (req, res) =>{
    req.logOut();
    res.redirect('/');
})
//console.log('dentro de authentication');
    

module.exports = ruta;