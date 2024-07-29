
//const bcryptjs = require('bcryptjs')
const conexion = require('../database/db')
// 1 - Invocamos a Express
const express = require('express');
const app = express()
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const PDFDocument = require('pdfkit');
const path = require('path');
const multer = require('multer');




// Configurar bodyParser para manejar datos JSON
app.use(bodyParser.json());

app.use(session({
  secret: 'your_secret_key',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: true, maxAge: 3600000 } // Cookie segura y expira en 1 hora
}));

// Configurar limitador de tasa
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite cada IP a 100 solicitudes por ventanaMs
});

app.use(limiter);

// Función de login
exports.login = async (req, res) => {
  try {
      const { user, pass } = req.body;

      if (!user || !pass) {
          return res.render('login', {
              alert: true,
              alertTitle: "Advertencia",
              alertMessage: "Ingrese un usuario y password",
              alertIcon: 'info',
              showConfirmButton: true,
              timer: false,
              ruta: '/'
          });
      }

      // Utilizar una consulta parametrizada para evitar la inyección SQL
      const query = 'SELECT * FROM usuarios WHERE user = ?';
      conexion.query(query, [user], async (error, results) => {
          if (error) throw error;

          if (results.length == 0 || !(await bcrypt.compare(pass, results[0].password))) {
              return res.render('login', {
                  alert: true,
                  alertTitle: "Error",
                  alertMessage: "Usuario y/o Password incorrectas",
                  alertIcon: 'error',
                  showConfirmButton: true,
                  timer: false,
                  ruta: '/'
              });
          } else {
              // Crear una var de sesión y asignar true si se inicia sesión
              req.session.loggedin = true;
              req.session.rol = results[0].rol;
              req.session.name = results[0].user;

              const rutaR = results[0].rol === 1 ? "admin/index" : "mesera/mesera";

              res.render('login', {
                  alert: true,
                  alertTitle: "Conexión exitosa",
                  alertMessage: "¡LOGIN CORRECTO!",
                  alertIcon: 'success',
                  showConfirmButton: false,
                  timer: 1500,
                  ruta: rutaR
              });
          }
      });
  } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};

exports.isAuthenticated = (req, res, next) => {
  if (req.session.loggedin) {
      if (req.session.rol == 1 && req.originalUrl.startsWith('/admin') || req.originalUrl.startsWith('/mesera') || req.originalUrl.startsWith('/cajera')) {
          return next();
      } else if (req.session.rol == 2 && req.originalUrl.startsWith('/mesera')) {
          return next();
      } else if (req.session.rol == 3 && req.originalUrl.startsWith('/cajera')) {
          return next();
      } else {
          res.redirect(req.session.rol == 1 ? '/admin/index' : req.session.rol == 2 ? '/mesera/mesera' : '/cajera/cajera');
      }
  } else {
      res.redirect('/');
  }
};


// FUNCIONALIDADES DE LA APP


//Funcion para cerrar cesion
exports.logout = (req, res)=>{
    req.session.destroy(() => {
        res.setHeader('Cache-Control', 'no-store');
        res.redirect('/');
    });
}

//Funcion para mostar las categorias 
exports.mostrar_categorias=(req,res)=>{
    conexion.query('SELECT  * FROM categorias', (error, results) => {
        if (error) {
          console.error('Error al obtener productos:', error);
          res.status(500).json({ error: 'Error al obtener productos' });
        } else {
          res.json(results);
        }
      });
}
//Funcion para mostar detalle de las categorias 
exports.detalleCategorias=(req,res)=>{
     const {categoriaId} = req.body
     id = Number(categoriaId) 
      try {
        conexion.query('SELECT  * FROM categorias where id =?',[id], (error, results) => {
          if (error) {
            console.error('Error al obtener la categoria:', error);
            res.status(500).json({ error: 'Error al obtener productos' });
          } else {
            res.json(results);
          }
        });
      } catch (error) {
        console.error('Error en la función detalle_productos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
      }
}


//Funcion para crear una categoria
exports.crear_categoria=(req,res)=>{
   const {nombre} = req.body
   .log(nombre)
    try {
      conexion.query('INSERT INTO categorias (nombre) VALUES (?)',[nombre], (error, results) => {
        if (error) {
          res.status(500).json({ error: 'Error al crear las categorias',error });
        } else {
          if (results.affectedRows>0) {
            res.json({message:"Categoria creada"});
          } else {
            res.status(500).json({ error: 'Error al crear la categoria' });
          }
        }
      });
    } catch (error) {
      console.error('Error en la función detalle_productos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
}


//Funcion para editar una categoria
exports.editar_categoria =(req,res)=>{
   const {idCate,nombre} = req.body
   id = Number(idCate)
    try {
      conexion.query('UPDATE categorias SET nombre=? WHERE id = ?',[nombre,id], (error, results) => {
        if (error) {
          res.status(500).json({ error: 'Error al editar la categoria',error });
        } else {
          if (results.affectedRows>0) {
            res.json({message:"Categoria editada"});
          } else {
            res.status(500).json({ error: 'Error al editar la categoria' });
          }
        }
      });
    } catch (error) {
      console.error('Error en la función detalle_productos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
}
//Funcion para eliminar una categoria
exports.eliminarCategoria =(req,res)=>{
   const {idCate} = req.body
   id = Number(idCate)
    try {
      conexion.query('DELETE FROM categorias WHERE id = ?',[id], (error, results) => {
        if (error) {
          res.status(500).json({ error: 'Error al eliminar la categoria',error });
        } else {
          if (results.affectedRows>0) {
            res.json({message:"Categoria eliminada"});
          } else {
            res.status(500).json({ error: 'Error al eliminar la categoria' });
          }
        }
      });
    } catch (error) {
      console.error('Error en la función detalle_productos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
}


//Funcion para mostar los productos dependiendo la categoria 
exports.mostrar_productos = (req, res) => {
  // Obtener el valor de 'valor' desde el cuerpo de la solicitud
  const idCate = req.query.valor;
  try {
    // Realizar la consulta a la base de datos
    conexion.query(
      `SELECT p.* FROM productos p JOIN categorias c ON p.categoria_id = c.id 
      WHERE p.categoria_id = ? and estado = 'activo';`,[idCate],
      (error, results) => {
        if (error) {
          console.error('Error al obtener productos:', error);
          res.status(500).json({ error: 'Error al obtener productos' });
        } else {
          res.json(results);
        }
      }
    );
  } catch (error) {
    console.error('Error en la función mostrar_productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

//Funcion para mostar todos  los productos
exports.productos=(req,res)=>{
  try {
    conexion.query(
      `
       SELECT p.*, c.nombre AS categoria_nombre
        FROM productos p
        JOIN categorias c ON p.categoria_id = c.id
        WHERE estado = 'activo';
      `,  (error, results) => {
        if (error) {
          console.error('Error al obtener productos:', error);
          res.status(500).json({ error: 'Error al obtener productos' });
        } else {
          res.json(results);
        }
      });

  } catch (error) {
    console.error('Error en la función detalle_productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });  }  
}


// Configuración de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/img/uploads')); // Ruta de la carpeta uploads
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Nombre del archivo con timestamp
  }
});

const upload = multer({ storage: storage }).single('foto');

exports.crearProducto = (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ error: 'Error al subir el archivo' });
    } else if (err) {
      return res.status(500).json({ error: 'Error desconocido al subir el archivo' });
    }

    const { categoria, nombre, precio } = req.body;
    const foto = req.file ? `img/uploads/${req.file.filename}` : null; // Guardar ruta relativa

    if (!categoria || !nombre || !precio || !foto) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    conexion.query('INSERT INTO productos (categoria_id, nombre, precio, foto) VALUES (?, ?, ?, ?)', [categoria, nombre, precio, foto], (error, results) => {
      if (error) {
        return res.status(500).json({ error: 'Error al crear el producto', error });
      } else {
        if (results.affectedRows > 0) {
          res.json({ message: 'Producto creado' });
        } else {
          res.status(500).json({ error: 'Error al crear el producto' });
        }
      }
    });
  });
};
// Editar producto
exports.editarProducto = (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ error: 'Error al subir el archivo' });
    } else if (err) {
      return res.status(500).json({ error: 'Error oscar al subir el archivo' });
    }

    const { id, categoria, nombre, precio } = req.body;
    const foto = req.file ? `img/uploads/${req.file.filename}` : null;

    if (!id || !categoria || !nombre || !precio) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const query = foto 
      ? 'UPDATE productos SET categoria_id = ?, nombre = ?, precio = ?, foto = ? WHERE id = ?'
      : 'UPDATE productos SET categoria_id = ?, nombre = ?, precio = ? WHERE id = ?';
    const params = foto 
      ? [categoria, nombre, precio, foto, id]
      : [categoria, nombre, precio, id];

    conexion.query(query, params, (error, results) => {
      if (error) {
        return res.status(500).json({ error: 'Error al editar el producto', error });
      } else {
        if (results.affectedRows > 0) {
          res.json({ message: 'Producto editado' });
        } else {
          res.status(500).json({ error: 'Error al editar el producto' });
        }
      }
    });
  });
};

// Eliminar producto
exports.eliminarProducto = (req, res) => {
  const { id } = req.params;
  idProducto = Number(id)
  if (!idProducto) {
    return res.status(400).json({ error: 'ID de producto es requerido' });
  }

  conexion.query(`UPDATE productos SET estado ='inactivo' WHERE id = ?`, [idProducto], (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Error al eliminar el producto', error });
    } else {
      if (results.affectedRows > 0) {
        res.json({ message: 'Producto eliminado',estado: 'ok' });
      } else {
        res.status(500).json({ error: 'Error al eliminar el producto' });
      }
    }
  });
};


//Funcion para mostar las destalles de los productos 
exports.detalle_productos = (req, res) => {
    try {
        const valor = req.query.valor;
        conexion.query('SELECT * FROM productos WHERE id = ?', [valor], (error, results) => {
            if (error) {
                console.error('Error al obtener productos:', error);
                res.status(500).json({ error: 'Error al obtener productos' });
            } else {
                if (results.length > 0) {
                    res.json(results[0]);
                } else {
                    res.status(404).json({ error: 'Producto no encontrado' });
                }
            }
        });
    } catch (error) {
        console.error('Error en la función detalle_productos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

//Funcion para guardar el pedido
exports.guardarPedido = (req, res) => {
    const { mesa, usuario, pedidos } = req.body;
    if (!Array.isArray(pedidos)) {
      return res.status(400).send('El formato de datos enviado no es correcto');
    }
  
    if (!mesa || !usuario) {
      return res.status(400).send('Faltan datos de mesa o usuario');
    }
  
    // Iniciar una transacción
    conexion.beginTransaction((err) => {
      if (err) {
        console.error('Error al iniciar la transacción:', err);
        return res.status(500).send('Error al crear el pedido');
      }
  
      const queryPedido = 'INSERT INTO pedidos (mesa, usuario, estado) VALUES (?, ?, ?)';
      conexion.query(queryPedido, [mesa, usuario, 'pedido'], (err, result) => {
        if (err) {
          return conexion.rollback(() => {
            console.error('Error al insertar el pedido:', err);
            res.status(500).send('Error al crear el pedido');
          });
        }
  
        const pedidoId = result.insertId;
  
        const detalleQuery = 'INSERT INTO detallePedido (pedido_id, cantidad, observacion,precio,producto_id) VALUES ?';
        const detalleValues = pedidos.map(pedido => [pedidoId, pedido.cantidad, pedido.observacion, pedido.precioNumerico ,pedido.productos ]);
  
        conexion.query(detalleQuery, [detalleValues], (err) => {
          if (err) {
            return conexion.rollback(() => {
              console.error('Error al insertar los detalles del pedido:', err);
              res.status(500).send('Error al crear el pedido');
            });
          }
  
          // Confirmar la transacción
          conexion.commit((err) => {
            if (err) {
              return conexion.rollback(() => {
                console.error('Error al confirmar la transacción:', err);
                res.status(500).send('Error al crear el pedido');
              });
            }
  
            res.status(201).send('Pedidos insertados correctamente');
          });
        });
      });
    });
  };

  //Funcion paa mostrar los pedidos que estan sin preparar
  exports.mostarPedidos =(req,res)=>{
    try {
      conexion.query('SELECT `id`,`mesa` FROM `pedidos` WHERE `estado` = "pedido"',(error,results)=>{
        if (error) {
          console.error('Error al obtener productos:', error);
          res.status(500).json({ error: 'Error al obtener productos' });
        }else{
          if (results.length > 0) {
            res.json(results); // Enviar todos los resultados
        } else {
            res.status(404).json({ error: 'no hay pedidos' });
        }
        }
      })
    } catch (error) {
      
    }
  }

  //Funcion para mostrar los pedidos que estan lsito para preparar
  exports.eliminarPedidos =(req,res)=>{
    const {pedidoId,justificacion} = req.body
    const idpedido = Number(pedidoId)
    try {
      conexion.query('UPDATE pedidos SET estado = "eliminar" , justificacion = ? WHERE id = ?',[justificacion,idpedido],(error,results)=>{
        if (error) {
          console.error('Error al obtener productos:', error);
          res.status(500).json({ error: 'Error al eliminar el pedido' });
        }else{
          if (results.affectedRows > 0) {
            res.json({ message: 'Pedido eliminado correctamente', estado:"ok" });
        } else {
            res.status(404).json({ error: 'no hay pedidos' });
        }
        }
      })
    } catch (error) {
      
    }
  }

  //Funcion para mostrar los pedidos que estan lsito para preparar
  exports.cambiarEstadoPedido =(req,res)=>{
    const {pedidoId} = req.body
    const idpedido = Number(pedidoId)
    try {
      conexion.query('UPDATE pedidos SET estado = "facturar"  WHERE id = ?',[idpedido],(error,results)=>{
        if (error) {
          console.error('Error al obtener el pedido:', error);
          res.status(500).json({ error: 'Error al empezar  el pedido' });
        }else{
          if (results.affectedRows > 0) {
            res.json({ message: 'Pedido em´pezado correctamente', estado:"ok" });
        } else {
            res.status(404).json({ error: 'no hay pedidos' });
        }
        }
      })
    } catch (error) {
      
    }
  }

  //Funcion para mostrar los pedidos que estan lsito para facturar
  exports.pedidosCaja =(req,res)=>{
    try {
      conexion.query('SELECT id , mesa FROM pedidos WHERE estado = "facturar"',(error,results)=>{
        if (error) {
          console.error('Error al obtener productos:', error);
          res.status(500).json({ error: 'Error al obtener productos' });
        }else{
          if (results.length > 0) {
            res.json(results); // Enviar todos los resultados
        } else {
            res.status(404).json({ error: 'no hay pedidos' });
        }
        }
      })
    } catch (error) {
      
    }
  }
//Funcion para mostara el detalle del pedido 
  exports.detallePedidos = (req, res) => {
    const valor = req.query.valor;
    try {
      const query = `
          SELECT 
        p.id AS pedido_id, 
        p.mesa, 
        p.usuario AS detalle_id, 
        dp.id,
        dp.cantidad, 
        dp.observacion, 
        dp.precio,
        dp.producto_id,
        prod.nombre AS producto
      FROM 
        pedidos p  
        JOIN detallePedido dp ON p.id = dp.pedido_id
        JOIN productos prod ON dp.producto_id = prod.id
      WHERE 
        p.id = ? AND p.estado = 'pedido';
      `;
      conexion.query(query, [valor], (error, results) => {
        if (error) {
          console.error('Error al obtener pedido:', error);
          res.status(500).json({ error: 'Error al obtener productos' });
        } else {
          if (results.length > 0) {
            res.json(results); // Enviar todos los resultados
          } else {
            res.status(404).json({ error: 'no hay pedidos' });
          }
        }
      });
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
  };
  
//Funcion para mostara el detalle del pedido que se va a preparar
  exports.detallePedidosPreparar = (req, res) => {
    const valor = req.query.valor;
    try {
      const query = `
         SELECT 
        p.id AS pedido_id, 
        p.mesa, 
        p.usuario AS detalle_id, 
        dp.id,
        dp.cantidad, 
        dp.observacion, 
        dp.precio,
        dp.producto_id,
        prod.nombre AS producto
      FROM 
        pedidos p  
        JOIN detallePedido dp ON p.id = dp.pedido_id
        JOIN productos prod ON dp.producto_id = prod.id
      WHERE 
        p.id = ?  AND(p.estado = 'pedido'|| p.estado ='preparando')
      `;
      conexion.query(query, [valor], (error, results) => {
        if (error) {
          console.error('Error al obtener pedido:', error);
          res.status(500).json({ error: 'Error al obtener productos' });
        } else {
          if (results.length > 0) {
            res.json(results); // Enviar todos los resultados
          } else {
            res.status(404).json({ error: 'no hay pedidos' });
          }
        }
      });
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
  };
//Funcion para mostara el detalle del pedido para la caja
  exports.detallePedidosCaja = (req, res) => {
    const valor = req.query.valor;
    try {
      const query = `
        SELECT 
        p.id AS pedido_id, 
        p.mesa, 
        p.usuario AS detalle_id, 
        dp.id,
        dp.cantidad, 
        dp.observacion, 
        dp.precio,
        dp.producto_id,
        prod.nombre AS producto
      FROM 
        pedidos p  
        JOIN detallePedido dp ON p.id = dp.pedido_id
        JOIN productos prod ON dp.producto_id = prod.id
      WHERE 
        p.id = ?  AND p.estado = 'facturar'
      `;
      conexion.query(query, [valor], (error, results) => {
        if (error) {
          console.error('Error al obtener pedido:', error);
          res.status(500).json({ error: 'Error al obtener productos' });
        } else {
          if (results.length > 0) {
            res.json(results); // Enviar todos los resultados
          } else {
            res.status(404).json({ error: 'no hay pedidos' });
          }
        }
      });
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
  };
  

  // FUNCION PARA EDITAR DETALLE DEL PEDIO 
  exports.editarDetallePedido = (req, res) => {
    const { detalleId, producto, cantidad, observacion } = req.body;
        try {
        conexion.query(
            "UPDATE detallepedido SET cantidad = ?, observacion = ? WHERE id = ? AND producto_id  = ?",
            [cantidad, observacion, detalleId, producto],
            (error, results) => {
                if (error) {
                    console.error('Error al actualizar el detalle del pedido:', error);
                    res.status(500).json({ error: 'Error al actualizar el detalle del pedido' });
                } else {
                    if (results.affectedRows > 0) {
                        res.json({ message: 'Detalle del pedido actualizado correctamente' });
                    } else {
                        res.status(404).json({ error: 'Detalle del pedido no encontrado' });
                    }
                }
            }
        );
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
}

//funcion para eliminar un pedido 
exports.borrarPedido = (req, res) => {
  const { id, idPedido } = req.body;
   // Convertir id y idPedido a números
   let idDetalle = Number(id);
   let pedido = Number(idPedido);

  try {
    // Consulta para verificar cuántos detalles hay para el pedido
    conexion.query("SELECT * FROM detallepedido WHERE pedido_id = ?", [idDetalle], (error, results) => {
      if (error) {
        console.error("Error al obtener los detalles del pedido", error);
        return res.status(500).json({ error: "Error al obtener los detalles del pedido" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "No se encontraron detalles para el pedido" });
      }

      if (results.length > 1) {
        // Si hay más de un detalle, borrar solo el detalle especificado
        conexion.query("DELETE FROM detallepedido WHERE id = ?", [pedido], (error, deleteResults) => {
          if (error) {
            console.error("Error al borrar el detalle del pedido", error);
            return res.status(500).json({ error: "Error al borrar el detalle del pedido" });
          }

          if (deleteResults.affectedRows === 0) {
            return res.status(404).json({ error: "Detalle del pedido no encontrado para borrar" });
          }

          res.json({ message: 'Detalle del pedido borrado correctamente', vacio:false });
        });
      } else {
        // Si solo hay un detalle, borrar el detalle y luego el pedido
        conexion.query("DELETE FROM pedidos WHERE id = ?", [idDetalle], (error, deleteDetalleResults) => {
          if (error) {
            console.error("Error al borrar el pedido", error);
            return res.status(500).json({ error: "Error al borrar el pedido" });
          }

          if (deleteDetalleResults.affectedRows === 0) {
            return res.status(404).json({ error: "Pedido no encontrado para borrar" });
          }
          res.json({ message: 'Detalle del pedido borrado correctamente',vacio:true });

        });
      }
    });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};

exports.empezarPedido = (req,res)=> {
  const {idPedido} = req.body
  id = Number(idPedido)
      try {
        conexion.query("UPDATE pedidos SET estado='preparando' WHERE id = ? ",[id],(error,results)=>{
          if (error) {
            console.error("Error al actualizar el estado",error);
            return res.status(500).json({error:"Error al actualizar el pedido"})
          } else {
            if (results.affectedRows>0) {
              res.json({message:"Estado actualizado correctamente"})
            } else {
              res.status(404).json({ error: 'pedido no encontrado' });
            }
          }
        })
      } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        res.status(500).json({ error: 'Error al procesar la solicitud' });
      }
}
exports.terminarPedido = (req,res)=> {
  const {idPedido} = req.body
  id = Number(idPedido)
      try {
        conexion.query("UPDATE pedidos SET estado='terminado' WHERE id = ? ",[id],(error,results)=>{
          if (error) {
            console.error("Error al actualizar el estado",error);
            return res.status(500).json({error:"Error al actualizar el pedido"})
          } else {
            if (results.affectedRows>0) {
              res.json({message:"Estado actualizado correctamente"})
            } else {
              res.status(404).json({ error: 'pedido no encontrado' });
            }
          }
        })
      } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        res.status(500).json({ error: 'Error al procesar la solicitud' });
      }
}


exports.usuarios = (req, res) => {
  try {
    
    conexion.query(`
      SELECT 
        u.id,
        u.nombre,
        u.apellidos,
        u.user,
        u.password,
        r.rol
      FROM 
        usuarios u
      JOIN 
        roles r ON u.rol = r.id_rol
    `, (error, results) => {
      if (error) {
        console.error("Error al buscar los usuarios ", error);
        return res.status(500).json({ error: "Error al buscar los pedidos" });
      } else {
        if (results.length > 0) {
          res.json(results);
        } else {
          res.status(400).json({ message: "Usuario no encontrado" });
        }
      }
    });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
}
exports.detalleUsuarios = (req, res) => {
  const valor = req.query.valor;
  idUsuario = Number(valor)
  try {
    conexion.query(`
      SELECT 
    u.id,
    u.nombre,
    u.apellidos,
    u.user,
    u.password,
    r.rol
FROM 
    usuarios u
JOIN 
    roles r ON u.rol = r.id_rol
WHERE
    u.id =?
    `,[idUsuario], (error, results) => {
      if (error) {
        console.error("Error al buscar los usuarios ", error);
        return res.status(500).json({ error: "Error al buscar los pedidos" });
      } else {
        if (results.length > 0) {
          res.json(results);
        } else {
          res.status(400).json({ message: "Usuario no encontrado" });
        }
      }
    });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
}


exports.crearUsuario = async (req, res) => {
    const { id, nombre, apellidos, user, password, rol } = req.body;
    const idUsuario = Number(id); // Convertir id a número

    console.log(id, nombre, apellidos, user, password, rol);

    try {
        // Verificar que la contraseña sea una cadena válida
        if (typeof password !== 'string' || password.length === 0) {
            return res.status(400).json({ error: "La contraseña no es válida" });
        }

        // Cifrar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Verificar si el usuario ya existe
        conexion.query("SELECT id, user FROM usuarios WHERE id= ? || user = ?", [idUsuario,user], async (error, results) => {
            if (error) {
                console.error("Error al buscar el usuario", error);
                res.status(500).json({ error: "Error al buscar al usuario" });
            } else {
                if (results.length > 0) {
                  console.log('Resultados:', results);

                  let idAlreadyExists = false;
                  let userAlreadyExists = false;

                  results.forEach(result => {
                      if (result.id === idUsuario) {
                          idAlreadyExists = true;
                      }
                      if (result.user === user) {
                          userAlreadyExists = true;
                      }
                  });

                  if (idAlreadyExists && userAlreadyExists) {
                      return res.status(400).json({ message: "El ID y el nombre de usuario ya fueron registrados" });
                  } else if (idAlreadyExists) {
                      return res.status(400).json({ message: "El ID ya fue registrado" });
                  } else if (userAlreadyExists) {
                      return res.status(400).json({ message: "El nombre de usuario ya existe" });
                  }

                } else {
                    // Crear un nuevo usuario con la contraseña cifrada
                    conexion.query(
                        `
                        INSERT INTO usuarios (id, nombre, apellidos, user, password, rol) 
                        VALUES (?, ?, ?, ?, ?, ?)
                        `,
                        [idUsuario, nombre, apellidos, user, hashedPassword, rol],
                        (error, results) => {
                            if (error) {
                                console.error("Error al crear el usuario", error);
                                res.status(500).json({ error: "Error al crear el usuario" });
                            } else {
                                if (results.affectedRows > 0) {
                                  res.status(201).json({message:'Usuario crado correctamente',estado:"ok"});
                                } else {
                                    res.status(500).json({ error: "No se pudo crear el usuario" });
                                }
                            }
                        }
                    );
                }
            }
        });
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
};


exports.editarUsuarios = async (req, res) => {
  const { id, nombre, apellidos, user, password, rol } = req.body;
  const idUsuario = Number(id); // Convertir id a número

  try {
      // Verificar si el usuario ya existe
      if (user) {
          const [existingUsers] = await new Promise((resolve, reject) => {
              conexion.query("SELECT id FROM usuarios WHERE user = ? AND id != ?", [user, idUsuario], (error, results) => {
                  if (error) {
                      reject(error);
                  } else {
                      resolve([results]);
                  }
              });
          });
          if (existingUsers.length > 0) {
              return res.status(400).json({ message: "El nombre de usuario ya existe" });
          }
      }

      // Cifrar la contraseña si se proporciona
      let hashedPassword;
      if (password) {
          hashedPassword = await bcrypt.hash(password, 10);
      }

      // Construir la consulta de actualización dinámicamente
      const updateFields = [];
      const updateValues = [];

      if (nombre) {
          updateFields.push("nombre = ?");
          updateValues.push(nombre);
      }
      if (apellidos) {
          updateFields.push("apellidos = ?");
          updateValues.push(apellidos);
      }
      if (user) {
          updateFields.push("user = ?");
          updateValues.push(user);
      }
      if (password) {
          updateFields.push("password = ?");
          updateValues.push(hashedPassword);
      }
      if (rol) {
          updateFields.push("rol = ?");
          updateValues.push(rol);
      }

      if (updateFields.length > 0) {
          const updateQuery = `UPDATE usuarios SET ${updateFields.join(", ")} WHERE id = ?`;
          updateValues.push(idUsuario);

          await new Promise((resolve, reject) => {
              conexion.query(updateQuery, updateValues, (error, results) => {
                  if (error) {
                      reject(error);
                  } else {
                      resolve(results);
                  }
              });
          });

          res.status(201).json({message:'Usuario editado correctamente'});
      } else {
          res.status(400).json({ message: "No hay campos para actualizar" });
      }

  } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};


const QRCode = require('qrcode');
exports.imprimirFactura = async (req, res) => {
  const { pedidoId, detallesPedido, total, tipoPago, montoRecibido, cambio } = req.body;
  console.log(montoRecibido, "------------", total);

  // Obtener la fecha y hora actual en el formato deseado
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  // Variables separadas para la fecha y la hora
  const fecha = `${day}/${month}/${year}`;
  const hora = `${hours}:${minutes}:${seconds}`;

  // Crear un nuevo documento PDF
  const doc = new PDFDocument({
    size: [200, 400], // Tamaño típico de una tirilla de POS (80mm x 400mm)
    margin: 5
  });

  // Establecer el tipo de contenido de la respuesta como PDF
  res.contentType('application/pdf');

  // Buffer para almacenar el contenido del PDF
  let buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    // Concatenar todos los buffers en uno solo
    const pdfData = Buffer.concat(buffers);
    // Enviar el PDF como archivo adjunto
    res.send(pdfData);
  });

  // Encabezado de la factura
  doc.font('Helvetica-Bold');
  doc.fontSize(10);
  doc.text('meuNenitas', { align: 'center' });
  doc.text('heladería', { align: 'center' });
  doc.text('San José de los Campanos', { align: 'center' });
  doc.moveDown();

  doc.font('Helvetica');
  doc.fontSize(7);
  doc.text(`Numero de pedido: ${pedidoId}`, { align: 'left' });
  doc.text(`Fecha: ${fecha}    Hora: ${hora}`, { align: 'left' });
  doc.moveDown();

  // Encabezados de la tabla
  doc.text('-----------------------------------------', { align: 'center' });
  doc.font('Helvetica-Bold');
  doc.text('DESCRIPCIÓN     CANT     VALOR', { align: 'center' });
  doc.font('Helvetica');
  doc.text('-----------------------------------------', { align: 'center' });
  doc.moveDown();

  // Detalles del pedido
  if (Array.isArray(detallesPedido.productos) && Array.isArray(detallesPedido.cantidades) && Array.isArray(detallesPedido.precios)) {
    detallesPedido.productos.forEach((producto, index) => {
      const cantidad = detallesPedido.cantidades[index];
      const precio = detallesPedido.precios[index].toFixed(2);
      doc.text(`${producto.padEnd(20)}${cantidad.toString().padStart(5)}${`$${precio}`.padStart(8)}`, { align: 'left' });
    });
  }
  doc.text('-----------------------------------------', { align: 'center' });
  doc.moveDown();

  // Resumen del pago
  doc.font('Helvetica-Bold');
  doc.text('Resumen del Pago:', { underline: true });
  doc.font('Helvetica');
  doc.text(`Total: $${total}`, { align: 'right' });
  doc.text(`Tipo de Pago: ${tipoPago}`, { align: 'right' });
  doc.text(`Monto Recibido: $${montoRecibido}`, { align: 'right' });
  doc.text(`Cambio: $${cambio}`, { align: 'right' });
  doc.moveDown();

  // Mensaje de agradecimiento
  doc.text('Muchas gracias por tu compra, espero que vuelvas pronto', { align: 'center' });
  doc.moveDown();

  // Generar y agregar el QR
  doc.text('-----------------------------------------', { align: 'center' });
   const qrUrl = 'https://www.instagram.com/meu_barheladeria?igsh=ODNsemt2dmNsOHh6'; // Cambia esto a la URL real que deseas usar
  const qrCodeImage = await QRCode.toDataURL(qrUrl);

  doc.image(qrCodeImage, {
    fit: [100, 100],
    align: 'center',
    valign: 'center'
  });
  doc.moveDown();
  doc.text('ESCANEA ESTE QR PARA VER TODOS NUESTROS PRODUCTOS', { align: 'center' });
  doc.moveDown();

  // Finalizar el documento PDF
  doc.end();
};


exports.imprimirComanda = async (req, res) => {
  const { pedidoId, detallesPedido, mesa, usuario } = req.body;

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const fecha = `${day}/${month}/${year}`;
  const hora = `${hours}:${minutes}:${seconds}`;

  const doc = new PDFDocument({
    size: [200, 400],
    margin: 5
  });

  res.contentType('application/pdf');

  let buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    const pdfData = Buffer.concat(buffers);
    res.send(pdfData);
  });

  doc.font('Helvetica-Bold');
  doc.fontSize(10);
  doc.text('MeuNenitas', { align: 'center' });
  doc.text(`Fecha: ${fecha}    Hora: ${hora}`, { align: 'left' });
  doc.moveDown();

  doc.font('Helvetica');
  doc.fontSize(7);
  doc.text(`Número de pedido: ${pedidoId}`, { align: 'left' });
  doc.text(`Mesa: ${mesa}`, { align: 'left' });
  doc.text(`Tomado por: ${usuario}`, { align: 'left' });
  doc.moveDown();

  doc.text('---------------------------------------------------------------------------------', { align: 'center' });
  doc.font('Helvetica-Bold');
  doc.text('PRODUCTO           ', { align: 'left' });
  doc.text('  CANT     ', { align: 'right' });
  doc.font('Helvetica');
  doc.text('---------------------------------------------------------------------------------', { align: 'center' });
  doc.moveDown();

  detallesPedido.forEach(detalle => {
  doc.moveDown();
    doc.text(`${detalle.producto.padEnd(15)}`, { align: 'left' });
    doc.text(`${detalle.cantidad.toString().padEnd(6)}`, { align: 'right' });
    if (detalle.observacion.trim() !== "") {
      doc.text(`Obs: ${detalle.observacion}`, { align: 'left' });
    }
    doc.text('---------------------------------------------------------------------------------', { align: 'center' });
  doc.moveDown();
  });

  doc.moveDown();

  doc.text('Gracias por su pedido!', { align: 'center' });
  doc.end();
};




exports.categorias = (req,res)=>{
  try {
    conexion.query('SELECT * FROM categorias;',(error,results)=>{
      if (error) {
        console.error('Error al obtener las categorias:', error);
        res.status(500).json({ error: 'Error al obtener las categorias' });
      }else{
        if (results.length > 0) {
          res.json(results); // Enviar todos los resultados
      } else {
          res.status(404).json({ error: 'no hay categorias' });
      }
      }
    })
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
      res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
}


exports.venta = (req,res)=>{
 const {id,total,tipoPago,fecha} = req.body
 const idPedido = Number(id) 
 console.log(idPedido,total,tipoPago,fecha)
  try {
    conexion.query(`
      INSERT INTO ventas( pedido_id, total, tipo_pago, fecha_venta) 
      VALUES (?,?,?,?);

      `,[idPedido,total,tipoPago,fecha],(error,results)=>{
          if (error) {
            console.error('Error al insertar la venta :', error);
            res.status(500).json({ error: 'Error al insertar la venta' });
          } else {
            if (results.affectedRows > 0) {
              res.status(201).json({message:'venta creada correctamente', estado: "ok"});
            } else {e
                res.status(500).json({ error: "No se pudo crear la venta" });
            }
          }

      })
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
}


exports.detalleVenta = (req,res)=>{
  try {
    conexion.query(`
    SELECT 
    id,
    pedido_id,
    total,
    tipo_pago,
    fecha_venta
FROM 
    ventas

UNION ALL

SELECT 
    NULL AS id,
    NULL AS pedido_id,
    SUM(total) AS total,
    NULL AS tipo_pago,
    NULL AS fecha_venta
FROM 
    ventas;

      `,(error,results)=>{
          if (error) {
            console.error('Error al obtener las ventas :', error);
            res.status(500).json({ error: 'Error al obtener las ventas' });
          } else {
            if (results.length > 0) {
              res.json({results});
            } else {e
                res.status(500).json({ error: "No se pudo obtener las ventas" });
            }
          }

      })
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
}
exports.detalleVentaFecha = (req, res) => {
  try {
    const { fechaInicio, fechaFin, tipoPago } = req.query;
    let query = `
      SELECT 
        id,
        pedido_id,
        total,
        tipo_pago,
        fecha_venta
      FROM 
        ventas
      WHERE 
        fecha_venta BETWEEN ? AND ?
    `;

    const params = [fechaInicio, fechaFin];

    if (tipoPago) {
      query += ` AND tipo_pago = ?`;
      params.push(tipoPago);
    }

    let totalQuery = `
      SELECT 
        SUM(total) AS total
      FROM 
        ventas
      WHERE 
        fecha_venta BETWEEN ? AND ?
    `;

    const totalParams = [fechaInicio, fechaFin];

    if (tipoPago) {
      totalQuery += ` AND tipo_pago = ?`;
      totalParams.push(tipoPago);
    }

    conexion.query(query, params, (error, results) => {
      if (error) {
        console.error('Error al obtener las ventas:', error);
        res.status(500).json({ error: 'Error al obtener las ventas' });
      } else {
        conexion.query(totalQuery, totalParams, (totalError, totalResults) => {
          if (totalError) {
            console.error('Error al obtener el total de ventas:', totalError);
            res.status(500).json({ error: 'Error al obtener el total de ventas' });
          } else {
            res.json({ results, total: totalResults[0].total });
          }
        });
      }
    });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};

exports.detalleVentaCeo = (req, res) => {
  try {
    const { fechaInicio, fechaFin, ceo } = req.query;
    let query = `
      SELECT 
    p.ceo,
    SUM(dp.cantidad) AS cantidad_vendida,
    SUM(dp.cantidad * p.precio) AS total_ganancias
    FROM 
    detallepedido dp
    JOIN 
    productos p ON dp.producto_id = p.id
    JOIN 
    ventas v ON dp.pedido_id = v.pedido_id
    WHERE 
    v.fecha_venta BETWEEN ? AND ?
    `;

    const params = [fechaInicio, fechaFin];

    if (ceo) {
      query += ` AND p.ceo = ?`;
      params.push(ceo);
    }

    query += `
      GROUP BY 
        p.ceo
    `;

    conexion.query(query, params, (error, results) => {
      if (error) {
        console.error('Error al obtener las ventas por CEO:', error);
        res.status(500).json({ error: 'Error al obtener las ventas por CEO' });
      } else {
        res.json({ results });
      }
    });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};

exports.productosMasVendidos = (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    let query = `
      SELECT 
    p.nombre,
    SUM(dp.cantidad) AS cantidad_vendida
    FROM 
    detallepedido dp
    JOIN 
    productos p ON dp.producto_id = p.id
    JOIN 
    ventas v ON dp.pedido_id = v.pedido_id
    WHERE 
    v.fecha_venta BETWEEN ? AND ?
    GROUP BY 
    p.nombre
    ORDER BY 
    cantidad_vendida DESC;
    `;

    const params = [fechaInicio, fechaFin];

    conexion.query(query, params, (error, results) => {
      if (error) {
        console.error('Error al obtener los productos más vendidos:', error);
        res.status(500).json({ error: 'Error al obtener los productos más vendidos' });
      } else {
        res.json({ results });
      }
    });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};
