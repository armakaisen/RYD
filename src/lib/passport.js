const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const db_pool = require('../database');
const helpers = require('../lib/helpers');

passport.use('local.signin', new localStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done)=>{   
    //console.log(req.body);
    const filas = await db_pool.query('SELECT * FROM usuarios WHERE login = ?', [username]);
    
    //console.log(filas);

    if(filas.length > 0){
        const user = filas[0];
        //console.log(user.clave);
        const validpassword = await helpers.comparePassword(password, user.clave);
       
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
        login: username,
        clave: password,
        nombre: fullname
    };
    console.log(newUser);
    //newUser.password = await helpers.encryptPassword(password);
    newUser.clave = await helpers.encryptPassword(password);
    try {
        //const result = await db_pool.query('INSERT INTO users SET ?', [newUser]);
        const result = await db_pool.query('INSERT INTO usuarios SET ?', [newUser]);
        //console.log(result);
        newUser.id = result.insertId;
        return done(null, newUser);     
    } catch (error) {
       console.log(error)
        if (error.errno == 1062){
            return done(null, false, req.flash('message', 'Ya  existe el usuario ingresado...'));
        }
        return done(null, false, req.flash('messaage', 'Se encontró eror al insertar...'));
       
    }
   
}));


passport.serializeUser((user, done)=>{
    /*
    console.log(user.id_usuario);
    console.log(user.login);
    console.log(user.nombre);
    */
    done(null, user.id_usuario);
});

passport.deserializeUser( async (id, done)=>{
  
   // console.log('deserializando...');
    //console.log([id]);
    const filas = await db_pool.query('SELECT * FROM usuarios WHERE id_usuario = ?', [id]);
    done(null, filas[0])        //como recupera una sola fila, lo hace en un arreglo y la posicion del arreglo es 0
})
 