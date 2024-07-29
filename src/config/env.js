//seccion encaragda de la configuracion de los archvos publicos y el puerto 

require('dotenv').config(); 
const {get} = require('env-var');

const env ={
    PORT: get('PORT').required().asPortNumber(),
    PUBLIC_PATH: get('PUBLIC_PATH').default('public').asString()
}

module.exports={
    env

}