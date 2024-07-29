const {env} = require('./config/env');
const {starServer }= require('./server/server')



const main =()=>{
    starServer({
        port:env.PORT,
        public_path:env.PUBLIC_PATH
    })
}

//Funcion auto invocada 
(async () => {
    main()

})()