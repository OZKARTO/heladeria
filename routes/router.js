//Seccion encaragda de la redireccion de las paticiones htpp

//librerias necesarias 
const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser');
const authController = require('../controllers/Controller')


// Middleware para parsear JSON
router.use(bodyParser.json());

// Router para la página de inicio de sesión
router.get('/', (req, res) => {
    res.render('login', { alert: false })
})

// Rutas para el administrador
router.get('/admin/index', authController.isAuthenticated, (req, res) => {
    res.render('admin/index', { user: req.session.name, rol: req.session.rol  })
})
router.get('/admin/pedidos', authController.isAuthenticated, (req, res) => {
    res.render('admin/pedidos', { user: req.session.name })
})

router.get('/admin/usuarios', authController.isAuthenticated, (req, res) => {
    res.render('admin/usuarios', { user: req.session.name , rol: req.session.rol  })
})
router.get('/admin/productos', authController.isAuthenticated, (req, res) => {
    res.render('admin/productos', { user: req.session.name})
})
router.get('/admin/categorias', authController.isAuthenticated, (req, res) => {
    res.render('admin/categorias', { user: req.session.name})
})
router.get('/admin/ventas', authController.isAuthenticated, (req, res) => {
    res.render('admin/ventas', { user: req.session.name})
})


// Rutas para la mesera
router.get('/mesera/mesera', authController.isAuthenticated, (req, res) => {
    res.render('mesera/mesera', { user: req.session.name , rol: req.session.rol })
}) 

router.get('/mesera/pedido', authController.isAuthenticated, (req, res) => {
    res.render('mesera/pedido', { user: req.session.name })
})
router.get('/mesera/verpedidos', authController.isAuthenticated, (req, res) => {
    res.render('mesera/verpedidos', { user: req.session.name })
})
router.get('/mesera/preparacion', authController.isAuthenticated, (req, res) => {
    res.render('mesera/preparacion', { user: req.session.name ,  rol: req.session.rol})
})


//RUTAS PARA LA CAJERA 
router.get('/cajera/cajera', authController.isAuthenticated, (req, res) => {
    res.render('cajera/cajera', { user: req.session.name , rol: req.session.rol  })
})



// Rutas para el controlador de autenticación

//muestran
// Rutas para mostrar todas las categorias 
router.get('/categorias',authController.mostrar_categorias)
// Rutas para mostrar todos los productos ini0dvidual 
router.get('/productos',authController.mostrar_productos)
// Rutas para mostrar todos los productos 
router.get('/mostrarProductos',authController.productos)
// Rutas para msotrar los detalles de los productos
router.get('/productosview',authController.detalle_productos)
// Rutas para guardar un pedido
router.post('/guardarPedidos',authController.guardarPedido)
// Rutas para mostar los pedidos guardados en estado pedido
router.get('/mostrarPedidos',authController.mostarPedidos)
// Rutas para mostar los pedidos guardados en estado pedido
// Rutas para mostar los pedidos guardados en estado pedido
router.get('/pedidosCaja',authController.pedidosCaja)
// Rutas para mostar el detalle de los ped0idos
router.get('/detallePedido',authController.detallePedidos)
router.post('/cambiarEstadoPedido',authController.cambiarEstadoPedido)
// Rutas para mostar el detalle de los pedidos
router.get('/detallePedidosPreparar',authController.detallePedidosPreparar)
// Rutas para mostar el detalle de los pedidos
router.get('/detallePedidosCaja',authController.detallePedidosCaja)
//Ruta para traer los usuarios  
router.get("/usuarios",authController.usuarios)
//Ruta para ever el detalle del usuario individual  
router.get("/detalleUsuarios",authController.detalleUsuarios)
router.post("/detalleCategorias",authController.detalleCategorias)
router.post('/editarProducto', authController.editarProducto);
router.delete('/eliminarProducto/:id', authController.eliminarProducto);
router.get("/detalleVentaCeo",authController.detalleVentaCeo)
router.get("/productosMasVendidos",authController.productosMasVendidos)


//crean 
//Ruta para crear los usuarios 
router.post("/crearUsuario",authController.crearUsuario)
//crea las categorias
router.post("/crearCategoria", authController.crear_categoria)
//crear un producto
router.post("/crearProducto",authController.crearProducto)
//crea una venta 
router.post("/venta",authController.venta)
router.get('/detalleVentaFecha',authController.detalleVentaFecha)
router.post("/eliminarPedidos",authController.eliminarPedidos)

//editan
//Ruta para ever el detalle del usuario individual  
router.post("/editarUsuario",authController.editarUsuarios)
// Rutas para editar el detalle de los pedidos 
router.post('/editarDetallePedido',authController.editarDetallePedido)
router.post("/imprimirFactura",authController.imprimirFactura)
router.post('/imprimirComanda',authController.imprimirComanda)
//edita una categoria
router.post("/editarCategoria",authController.editar_categoria)




router.post('/', authController.login)
// Rutas para cerrar cesion
router.get('/logout', authController.logout)


//Ruta para eliminar un pedido 
router.delete('/borrarPedido',authController.borrarPedido)
//Ruta para eliminar un pedido 
router.post('/enpezarPedido',authController.empezarPedido)
router.post('/terminarPedido',authController.terminarPedido)
router.post("/eliminarCategoria",authController.eliminarCategoria)


module.exports = router
