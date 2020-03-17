const express = require('express');
const morgan = require('morgan');
const handlebar = require('express-handlebars');
const path = require('path');
const Flash = require('connect-flash');
const session = require("express-session");
const mysqlstore = require('express-mysql-session');
const { database } = require('./keys');
const passport = require('passport');
 
/*
const routes = require('./routes/index');
const autenticacion = require('./routes/authentication');
const links = require('/links', './routes/links');
*/


// inicializaciones
const app = express();
require('./lib/passport');

//configuraciones
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));

app.engine('.hbs', handlebar({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}));

app.set('view engine', '.hbs');

// middlewares
app.use(session({
    secret: 'armakaisen',
    resave: false,
    saveUninitialized: false,
    store: new mysqlstore(database)
}))
app.use(Flash());
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());


// global variable
app.use((req, res, next)=>{
    app.locals.success = req.flash('success');
    app.locals.message = req.flash('message');   
    app.locals.user = req.user; 
    next();
})

// Routes
app.use(require('./routes/index'));
app.use(require('./routes/authentication'));
//app.use('/links', require('./routes/links'));
app.use(require('./routes/links'));

// public
app.use(express.static(path.join(__dirname, './public')))

// starting the server
app.listen(app.get('port'), ()=>{
    console.log('server on port', app.get('port'));
})