const bcrypt = require('bcryptjs');

const helpers = {};

helpers.encryptPassword = async (password)=>{
    const salt = await bcrypt.genSalt(10);        // saltos de encriptacion de seguridad 10 veces (puede ser mas)
    const passwordhash = await bcrypt.hash(password, salt);            // passwordhash ya tiene la clave cifrada encriptada
    return passwordhash;
}

helpers.comparePassword = async (password, passwordguardado)=>{
    try {
        return await bcrypt.compare(password, passwordguardado);
    } catch (error) {
        console.log(error);
    }
}



module.exports = helpers;
