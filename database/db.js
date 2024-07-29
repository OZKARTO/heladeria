// Aqui encontraremos todo lo neceseraio para realizar la conexion a la base de datos 

const msqly = require('mysql')

const conexion = msqly.createConnection({
    host: process.env.DB_HOSTS,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_DATABASE
});

conexion.connect((error)=>{
    if (error) {
        console.log(`el error es ${error}`)
        return;
    }
    console.log("base OK")
})

module.exports=conexion;