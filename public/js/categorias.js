window.addEventListener("DOMContentLoaded", () => {
    fetchCategorias();

    const btnCrear = document.getElementById("btnCrearCategoria");
    btnCrear.addEventListener("click", crearCategoria);
    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("editar")) {
            const categoriaId = event.target.getAttribute('data-id');
            mostrarEditarModal(categoriaId);
        }else{
            if (event.target.classList.contains("eliminar")) {
                const categoriaId = event.target.getAttribute('data-id');
                eliminarCategoria(categoriaId)

            }
        }
    });
});

function fetchCategorias() {
    fetch("/categorias")
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            mostrarCategorias(data);
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema cargando las categorías.'
            });
        });
}

function mostrarCategorias(data) {
    const contenedor = document.getElementById("contenedorCate");
    contenedor.innerHTML = "";
    data.forEach(categoria => {
        const elemento = `
            <tr>
                <th scope="row" id="id">${categoria.id}</th>
                <td id="nombre">${categoria.nombre}</td>
                <td>
                    <i class="fa-solid fa-pen-to-square fa-xl editar" data-id="${categoria.id}" data-bs-toggle="modal" data-bs-target="#editar" style="color: #FFD43B;"></i>
                    <i class="fa-solid fa-trash fa-xl eliminar " id="eliminar" data-id="${categoria.id}" style="color: #e90707;"></i>
                </td>
            </tr>
        `;
        contenedor.insertAdjacentHTML('beforeend', elemento);
    });
}

function crearCategoria() {
    Swal.fire({
        text: "Deseas crear una categoria",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, crear"
    }).then((result) => {
        if (result.isConfirmed) {
            const nombre = document.getElementById("nuevaCategoria").value;
            fetch("/crearCategoria", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la respuesta del servidor');
                }
                return response.json();
            })
            .then(data => {
                console.log(data.message);
                if (data.message === "Categoria creada") {
                    Swal.fire({
                        title: "Categoria creada",
                        icon: "success"
                    });
                    // Cierra el modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('crear'));
                    modal.hide();
                    // Actualiza la lista de categorías
                    fetchCategorias();
                } else {
                    Swal.fire({
                        title: "Error",
                        text: data.message,
                        icon: "error"
                    });
                }
            })
            .catch(error => console.error('Error al crear la categoría:', error.message));
        }
    });
}

function mostrarEditarModal(categoriaId) {
    fetch(`/detalleCategorias`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({categoriaId })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            const editarModalContent = document.getElementById('editarCate');
            data.forEach(categoria=>{
                editarModalContent.innerHTML = `
                <div class="mb-3">
                    <label class="form-label">ID</label>
                    <input type="number" class="form-control" id="editId" value="${categoria.id}" disabled>
                </div>
                <div class="mb-3">
                    <label class="form-label">Nombre</label>
                    <input type="text" class="form-control" id="editNombre" value="${categoria.nombre}">
                </div>
                <button type="button" class="btn btn-success" id="editarCategoriaBtn">EDITAR</button>
            `;
            })
          
            document.getElementById("editarCategoriaBtn").addEventListener("click", editarCategoria);
        })
        .catch(error => console.error('Error al obtener la categoría:', error.message));
}


function editarCategoria() {
    Swal.fire({
        title: "Deseas editar la categoria",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si,editar"
      }).then((result) => {
        if (result.isConfirmed) {

            const idCate = document.getElementById("editId").value;
            const nombre = document.getElementById("editNombre").value;
                    
            fetch("/editarCategoria", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idCate, nombre })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la respuesta del servidor');
                }
                return response.json();
            })
            .then(data => {
                if (data.message === "Categoria editada") {
                    Swal.fire({
                        title: "Guardado!",
                        text: data.message,
                        icon: "success"
                    });
                    // Cierra el modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('editar'));
                    modal.hide();
                    // Actualiza la lista de categorías
                    fetchCategorias();
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: data.message,
                    });
                }
            })
            .catch(error => console.error('Error al editar la categoría:', error.message));
        }
      });
}

function eliminarCategoria(categoriaId) {
    Swal.fire({
        title: "¿Deseas eliminar la categoria?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si,eliminar"
      }).then((result) => {
        if (result.isConfirmed) {
            const idCate = categoriaId
         
            fetch("/eliminarCategoria", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idCate })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la respuesta del servidor');
                }
                return response.json();
            })
            .then(data => {
                if (data.message === "Categoria eliminada") {
                    Swal.fire({
                        title: "Guardado!",
                        text: data.message,
                        icon: "success"
                    });
                    // Actualiza la lista de categorías
                    fetchCategorias();
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: data.message,
                    });
                }
            })
            .catch(error => console.error('Error al editar la categoría:', error.message));
        }
      });
}
