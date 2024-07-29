document.addEventListener("DOMContentLoaded", () => {
  const searchBox = document.getElementById("searchBox");
  const agregarProductoBtn = document.getElementById("agregarProducto");
  const crearUsuarioBtn = document.getElementById("crearUsuario");
  let productos = [];

  // Cargar productos al inicio
  window.addEventListener("load", () => {
    fetch("/mostrarProductos")
      .then(response => response.json())
      .then(data => {
        productos = data;
        mostrarProductos(productos);
      })
      .catch(error => {
        console.error('Error al cargar productos:', error);
      });
  });

  // Cargar categorías al abrir modal de agregar producto
  agregarProductoBtn.addEventListener("click", () => {
    fetch("/categorias")
      .then(response => response.json())
      .then(data => {
        const selectCategoria = document.getElementById("selectCategoria");
        selectCategoria.innerHTML = '';
        data.forEach(categoria => {
          const elemento = `<option value="${categoria.id}">${categoria.nombre}</option>`;
          selectCategoria.insertAdjacentHTML("beforeend", elemento);
        });
      })
      .catch(error => {
        console.error('Error al cargar categorías:', error);
      });
  });

  // Filtrar productos al escribir en el cuadro de búsqueda
  searchBox.addEventListener("input", () => {
    const searchTerm = searchBox.value.toLowerCase();
    const productosFiltrados = productos.filter(producto =>
      producto.nombre.toLowerCase().includes(searchTerm) ||
      producto.categoria_nombre.toLowerCase().includes(searchTerm)
    );
    mostrarProductos(productosFiltrados);
  });

  // Crear producto
  crearUsuarioBtn.addEventListener("click", crearProducto);

  function mostrarProductos(data) {
    const contenedor = document.getElementById("tablaProductos");
    contenedor.innerHTML = '';
    data.forEach(producto => {
      const elemento = `
        <tr>
          <th scope="row">${producto.id}</th>
          <td>${producto.categoria_nombre}</td>
          <td>${producto.nombre}</td>
          <td>${producto.precio}</td>
          <td><img src="${producto.foto}" alt="${producto.nombre}" class="img-fluid"></td>
          <td>
            <i class="fa-solid fa-pen-to-square fa-xl" data-id="${producto.id}" data-bs-toggle="modal" data-bs-target="#editarUsuario" style="color: #FFD43B;"></i>
            <i class="fa-solid fa-trash fa-xl" data-id="${producto.id}" style="color: #e90707;"></i>
          </td>
        </tr>
      `;
      contenedor.insertAdjacentHTML("beforeend", elemento);
    });

    // Añadir eventos para los botones de editar y eliminar
    document.querySelectorAll('.fa-pen-to-square').forEach(button => {
      button.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        document.getElementById("editarIdProducto").value = id;
        
        // Llamada para obtener las categorías
        fetch("/categorias")
          .then(response => response.json())
          .then(categorias => {
            const selectCategoria = document.getElementById("editarSelectCategoria");
            selectCategoria.innerHTML = ''; // Limpiar contenido previo
            categorias.forEach(categoria => {
              const option = document.createElement("option");
              option.value = categoria.id;
              option.text = categoria.nombre;
              selectCategoria.appendChild(option);
            });
          })
          .catch(error => {
            console.error('Error al cargar categorías o producto:', error);
          });
          editarProducto()
      });
    });

    document.querySelectorAll('.fa-trash').forEach(button => {
      button.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        eliminarProducto(id);
      });
    });
  }

  function crearProducto() {
    const formData = new FormData();
    formData.append("categoria", document.getElementById("selectCategoria").value);
    formData.append("nombre", document.getElementById("nombre").value);
    formData.append("precio", document.getElementById("precio").value);
    formData.append("foto", document.getElementById("foto").files[0]);

    fetch("/crearProducto", {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.message) {
        Swal.fire('Éxito', 'Producto creado correctamente', 'success');
        window.location.reload();
      } else {
        Swal.fire('Error', data.error, 'error');
      }
    })
    .catch(error => {
      console.error('Error al crear el producto:', error);
      Swal.fire('Error', 'Error al crear el producto', 'error');
    });
  }

  // Función para editar producto
  function editarProducto() {
    const formData = new FormData();
    formData.append("id",  document.getElementById("editarIdProducto").value);
    formData.append("categoria", document.getElementById("editarSelectCategoria").value);
    formData.append("nombre", document.getElementById("editarNombre").value);
    formData.append("precio", document.getElementById("editarPrecio").value);
    formData.append("foto", document.getElementById("editarFoto").files[0]);
    
    fetch("/editarProducto", {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.message) {
        Swal.fire('Éxito', 'Producto editado correctamente', 'success');
        window.location.reload();
      } else {
        Swal.fire('Error', data.error, 'error');
      }
    })
    .catch(error => {
      console.error('Error al editar el producto:', error);
      Swal.fire('Error', 'Error al editar el producto', 'error');
    });
  }

  // Función para eliminar producto
  function eliminarProducto(id) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminarlo'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`/eliminarProducto/${id}`, {
          method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
          if (data.message) {
            Swal.fire('Eliminado', 'Producto eliminado correctamente', 'success');
            window.location.reload();
          } else {
            Swal.fire('Error', data.error, 'error');
          }
        })
        .catch(error => {
          console.error('Error al eliminar el producto:', error);
          Swal.fire('Error', 'Error al eliminar el producto', 'error');
        });
      }
    });
  }
});
