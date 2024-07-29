const express = require('express')
const cookieParser = require('cookie-parser')
const path = require('path'); // Importar el módulo 'path'


//funcion que arranca el servidor 
const starServer =(options)=>{

   const {port, public_path='public'} = options //pasamos el puerto y la carpeta public
   const app = express()
   app.use(express.urlencoded({extended:false}));
   app.use(express.json());
// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, `../../${public_path}`))); // Ajusta la ruta según tu estructura


   //iniciamos el motor de plantilla
   app.set('view engine','ejs')

   //para poder trabajar con las cookies
   app.use(cookieParser())

   const session = require('express-session');
   
   app.use(session({
     secret: 'secret',
     resave: true,
     saveUninitialized: true,
     
   }))

   //llamar al router
    app.use('/', require('../../routes/router'))
    
   app.listen(port,()=>{
    console.log(`escuchando por el puerto ${port}`)
   })


}

module.exports={
    starServer
}