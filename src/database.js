const mysql = require('mysql');
const {promisify} = require('util');
const {database} = require('./keys');


const pool = mysql.createPool(database);

pool.getConnection((err, g_conexion)=>{
    if (err){
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){
            console.log('Conexión a Base de datos perdida... ');                
        }

        if(err.code === 'ER_CON_COUNT_ERROR'){
            console.log('Base de datos con demasiadas conexiones...');
        }

        if(err.code === 'ECONNREFUSED'){
            console.log('No se pudo realizar conexión a la base de datos...');
        }
    }

    if(g_conexion){
        g_conexion.release();
        console.log('Conexión a base de datos fue exitosa...');
        return;
    }
    
});


pool.query = promisify(pool.query);

module.exports = pool;