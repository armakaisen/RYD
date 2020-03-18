const express = require('express');
const ruta = express.Router();

var Handlebars     = require('handlebars');
var HandlebarsIntl = require('handlebars-intl');

HandlebarsIntl.registerWith(Handlebars);
const helpers = require('../lib/helpers');
const db_pool = require('../database');
const {isLoggedIn, isNotLoggedIn} = require('../lib/autoriza');


ruta.get('/add', isLoggedIn, (req, res)=>{
    res.render('links/add');
})

ruta.post('/add', async (req, res)=>{
    const {title, url, description} = req.body;
    var lcTitle = req.body.title || '';
    var lcURL = req.body.url || '';
    if (lcTitle == ''){
        req.flash('message', 'Debe introducir título');
        //console.log(req.body);
        res.redirect('/add');
    }else {
        if (lcURL == ''){
            req.flash('message', 'Debe introducir URL');
            //res.body.url.focus();
           
            res.redirect('/add');
        }else {
            const newLink = {   
                title,
                url,
                description
            }
            //console.log(newLink);   
            await db_pool.query('INSERT INTO links set ?', [newLink]);
            req.flash('success', 'Guardado correctamente');
            res.redirect('/list');
        }
    }
});

/*
ruta.get('/',  (req, res)=>{
    res.redirect('/signin');
})*/
 

ruta.get('/list', isLoggedIn, async (req, res)=>{
    //const lccod = '370';
    const links = await db_pool.query('SELECT * FROM vw_res_saldos');
    //res.render('links/res_saldos', {links});
    res.render('links/res_saldos_pag',{links});
    //console.log(links);
    //res.send('aqui saldrá');
})

ruta.get('/delete/:id', isLoggedIn, async (req, res)=>{
    //console.log(req.params.id);
    //res.send('eliminado');
    const { id } = req.params;
    await db_pool.query('DELETE FROM links WHERE id = ?', [id]);
    req.flash('success','Registro eliminado...');
    res.redirect('/list');
})

//ruta.get('/edit/:id', isLoggedIn, async (req,res)=>{
ruta.get('/detalle/:id_cliente', isLoggedIn, async (req,res)=>{
    const { id_cliente } = req.params;
    
    const lnsaldo = await db_pool.query("SELECT if(id_moneda = 1, format(total,0), format(total,2)) as saldo FROM det_saldos WHERE id_cliente = ? and nombre = ''", [id_cliente]);
    console.log(lnsaldo);
    const links = await db_pool.query('SELECT * FROM vw_det_saldos WHERE id_cliente = ?', [id_cliente]);
   
    res.render('links/det_saldos', {links, lnsaldo});
})

ruta.post('/edit/:id', async (req,res)=>{
    const { id } = req.params;    
    const { title, url, description } = req.body;
    const updLink = {
        title,
        url,
        description
    };

    const link = await db_pool.query('UPDATE links set ? WHERE id = ?', [updLink, id]);
    req.flash('success', 'Registro fue actualizado...');
    res.redirect('/list');
})

/* USUARIOS */
ruta.get('/lstusuarios', isLoggedIn, async (req, res)=>{
    const tblusuarios = await db_pool.query('SELECT * FROM usuarios');
    //console.log(tblusuarios);
    res.render('links/lstusuarios', {tblusuarios});
})


ruta.get('/edtusuario/:ID_USUARIO', isLoggedIn, async (req,res)=>{
    const { ID_USUARIO } = req.params;
    //onsole.log(ID_USUARIO);
    const tblusuario = await db_pool.query('SELECT * FROM usuarios WHERE ID_USUARIO = ?', [ID_USUARIO]);
    //console.log(tblusuario[0]);
    res.render('links/edtusuario', {usuario: tblusuario[0]});
})

ruta.post('/edtusuario/:ID_USUARIO', async (req,res)=>{
    const { id } = req.params;    
    const { fullname, username, password } = req.body;
    const updUsuario = {
        login: username,
        clave: password,
        nombre: fullname
    };
    updUsuario.clave = await helpers.encryptPassword(password);

    const link = await db_pool.query('UPDATE usuarios set ? WHERE ID_USUARIO = ?', [updUsuario, id]);
    req.flash('success', 'Registro fue actualizado...');
    res.redirect('/lstusuarios');
})

ruta.get('/dltusuario/:ID_USUARIO', isLoggedIn, async (req, res)=>{
    //console.log(req.params.id);
    //res.send('eliminado');
    const { id } = req.params;
    try {
        await db_pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
        req.flash('success','Registro eliminado...');         
    } catch (error) {
        req.flash('message', 'Hubo un error al intentar borrar el registro...');
    }
       res.redirect('/lstusuarios');
})
module.exports = ruta;