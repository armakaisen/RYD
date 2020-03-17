const express = require('express');
const ruta = express.Router();
const passport = require('passport');
const helpers = require('../lib/helpers');
const db_pool = require('../database');
const {isLoggedIn} = require('../lib/autoriza');

ruta.get('/signup', isLoggedIn, (req, res)=>{
    res.render("auth/signup");
})

ruta.post('/signup', async (req, res, done)=> {
   
        //console.log(req.body);
      
        const { username, password, fullname } = req.body;
         
        const newUser = {
            login: username,
            clave: password,
            nombre: fullname
        };
        
        //console.log(newUser);
         
        newUser.clave = await helpers.encryptPassword(password);
        try {
            
            const result = await db_pool.query('INSERT INTO usuarios SET ?', [newUser]);
            console.log(result);
            newUser.id = result.insertId;
            req.flash('success','Usuario fue grabado...');
            //res.redirect('/signup');
            //render('/signup', req.flash('success','Usuario fue grabado...'));
                
        } catch (error) {
           console.log(error)
            if (error.errno == 1062){
                req.flash('message', 'Ya  existe el usuario ingresado...');
            }else {
                req.flash('message', 'Se encontró error al insertar...');        
            }
            
        }
        res.redirect('/signup');
});

/*
ruta.get('/signin', (req, res)=>{
    res.render('auth/signin');
})*/
ruta.get('/', (req, res)=>{
    //res.send('signin');
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