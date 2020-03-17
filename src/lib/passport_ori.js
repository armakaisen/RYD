const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const db_pool = require('../database');
const helpers = require('../lib/helpers');

passport.use('local.signin', new localStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done)=>{   
    console.log(req.body);
    const filas = await db_pool.query('SELECT * FROM users WHERE username = ?', [username]);
   
    if(filas.length > 0){
        const user = filas[0];
        const validpassword = await helpers.comparePassword(password, user.password);
       
        if(validpassword){
            done(null, user, req.flash('success', 'bienvenido '+user.nombre));
        }else{
            done(null, false, req.flash('message', 'clave incorrecta'));
        }

    }else{
        return done(null, false, req.flash('message','usuario no existe'));
    }
}));


passport.use('local.signup', new localStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done)=>{
    //console.log(req.body);
    
    const { fullname } = req.body;
    const newUser = {
        username,
        password,
        fullname
    };
    
    newUser.password = await helpers.encryptPassword(password);
    try {
        const result = await db_pool.query('INSERT INTO users SET ?', [newUser]);
        //console.log(result);
        newUser.id = result.insertId;
        return done(null, newUser);     
    } catch (error) {
       // console.log(error)
        if (error.errno == 1062){
            return done(null, false, req.flash('message', 'Ya  existe el usuario ingresado...'));
        }
        return done(null, false, req.flash('messaage', 'Se encontró eror al insertar...'));
       
    }
   
}));


passport.serializeUser((user, done)=>{
    done(null, user.id);
});

passport.deserializeUser( async (id, done)=>{
    const filas = await db_pool.query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, filas[0])        //como recupera una sola fila, lo hace en un arreglo y la posicion del arreglo es 0
})
 