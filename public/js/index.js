window.addEventListener("load", () => {
    fetch('/categorias')
        .then(response => response.json())
        .then(categorias => {
            const contenedorCategorias = document.getElementById("contenedor-categorias");
            categorias.forEach(categoria => {
                const categoriaHTML = `
                    <div class="d-flex justify-content-center align-items-center mt-3">
                        <button type="button" class="btn btn1 abrirModal" data-bs-toggle="modal" data-bs-target="#exampleModal" data-categoria="${categoria.id}">${categoria.nombre}</button>
                    </div>
                `;
                contenedorCategorias.insertAdjacentHTML('beforeend', categoriaHTML);
            });

            const botonesAbrirModal = document.querySelectorAll('.abrirModal');
            botonesAbrirModal.forEach(boton => {
                boton.addEventListener("click", () => {
                    const categoria = boton.getAttribute('data-categoria');
                    fetch(`/productos?valor=${categoria}`)
                        .then(response => response.json())
                        .then(productos => {
                            const miModal = document.getElementById('modal');
                            miModal.innerHTML = '';
                            productos.forEach(producto => {
                                const modalHTML = `
                                    <div class="col mb-3">
                                        <div class="card">
                                            <img src="${producto.foto}" class="card-img-top" alt="${producto.nombre}">
                                            <div class="card-body">
                                                <p>${producto.nombre}</p>
                                                <button class="btn abrirModalProducto btn1" data-producto-id="${producto.id}">Ver</button>
                                            </div>
                                        </div>
                                    </div>
                                `;
                                miModal.insertAdjacentHTML("beforeend", modalHTML);
                            });

                            document.querySelectorAll('.abrirModalProducto').forEach(botonProducto => {
                                botonProducto.addEventListener("click", (event) => {
                                    event.stopPropagation(); // Evitar que se cierre el modal anterior
                                    const productoId = botonProducto.getAttribute('data-producto-id');

                                    if (!productoId) {
                                        console.error("Producto ID no encontrado");
                                        return;
                                    }

                                    fetch(`/productosview?valor=${productoId}`)
                                        .then(response => response.json())
                                        .then(detalle => {
                                            const productoModal = document.getElementById('productoModalBody');
                                            const precioFormateado = detalle.precio.toLocaleString('es-CO', { 
                                                style: 'currency', 
                                                currency: 'COP',
                                                minimumFractionDigits: 0, 
                                                maximumFractionDigits: 0 
                                            });
                                            productoModal.innerHTML = `
                                                <div class="card">
                                                    <img src="${detalle.foto}" class="card-img-top imgProduc" alt="${detalle.nombre}" style="object-fit: cover; height: 300px;">
                                                    <div class="card-body">
                                                        <h5 id="titulo" class="card-title" data-id="${detalle.id}">${detalle.nombre}</h5>
                                                        <div class="d-flex justify-content-between mb-3">
                                                            <h5>Precio: <span id="precio">${precioFormateado}</span></h5>
                                                        </div>
                                                        <div class="mb-3">
                                                            <input type="number" class="form-control" id="recipient-name" placeholder="Cantidad a pedir" min="1">
                                                        </div>
                                                        <div class="mb-3">
                                                            <label for="message-text" class="form-label">Comentarios:</label>
                                                            <textarea class="form-control" id="message-text" rows="3" required></textarea>
                                                        </div>
                                                        <div class="d-grid gap-2">
                                                            <button type="button" class="btn btn-success" id="guardarPedido">Guardar</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            `;

                                            const productoModalElement = new bootstrap.Modal(document.getElementById('productoModal'), {
                                                backdrop: 'static',
                                                keyboard: false
                                            });

                                            const backdrop = document.querySelector('.modal-backdrop');
                                            if (backdrop) {
                                                backdrop.classList.add('show-second-modal');
                                            }

                                            productoModalElement.show();

                                            document.getElementById('productoModal').addEventListener('hidden.bs.modal', () => {
                                                if (backdrop) {
                                                    backdrop.classList.remove('show-second-modal');
                                                }
                                            });

                                            const btnGuardar = document.getElementById('guardarPedido');
                                            btnGuardar.replaceWith(btnGuardar.cloneNode(true));
                                            document.getElementById('guardarPedido').addEventListener("click", () => {
                                                const a = document.getElementById('titulo');
                                                const productoNombre = document.getElementById('titulo').textContent;
                                                const productos = a.getAttribute("data-id");
                                                const cantidad = document.getElementById('recipient-name').value;
                                                const observacion = document.getElementById('message-text').value;
                                                const mesa = document.getElementById('selectMesa').value;
                                                const precio = document.getElementById('precio').textContent;
                                                const precioNumerico = parseInt(precio.replace(/[^\d]/g, ''), 10);

                                                localStorage.setItem("mesa", mesa);

                                                if (cantidad.trim() === '' || cantidad <= 0 || mesa == "Numero de mesa") {
                                                    Swal.fire({
                                                        icon: "error",
                                                        title: "Oops...",
                                                        text: "Todos los campos son obligatorios y deben ser válidos.",
                                                    });
                                                    return;
                                                }

                                                let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
                                                const nuevoPedido = { productos, cantidad, observacion, precioNumerico, productoNombre };
                                                pedidos.push(nuevoPedido);
                                                localStorage.setItem('pedidos', JSON.stringify(pedidos));
                                                document.getElementById('guardar').hidden = false;
                                                document.getElementById('eliminar').hidden = false;
                                                bootstrap.Modal.getInstance(document.getElementById("productoModal")).hide();
                                                actualizarPedidosEnVista(); // Actualizar la vista de pedidos
                                            });

                                            const btnEliminar = document.getElementById('eliminar');
                                            btnEliminar.addEventListener("click", () => {
                                                Swal.fire({
                                                    title: "¿Deseas borrar el pedido?",
                                                    text: "Si lo borras no podrás recuperar el pedido.",
                                                    icon: "warning",
                                                    showCancelButton: true,
                                                    confirmButtonColor: "#3085d6",
                                                    cancelButtonColor: "#d33",
                                                    confirmButtonText: "Borrar"
                                                }).then((result) => {
                                                    if (result.isConfirmed) {
                                                        localStorage.removeItem('pedidos');
                                                        Swal.fire({
                                                            title: "BORRADO!",
                                                            icon: "success"
                                                        });
                                                        document.getElementById('guardar').hidden = true;
                                                        document.getElementById('eliminar').hidden = true;
                                                        document.getElementById('selectMesa').selectedIndex = 0;
                                                        actualizarPedidosEnVista();
                                                    }
                                                });
                                            });

                                            const guardar = document.getElementById('guardar');
                                            guardar.replaceWith(guardar.cloneNode(true));
                                            document.getElementById('guardar').addEventListener("click", () => {
                                                const guardar = document.getElementById('guardar');
                                                guardar.disabled = true;

                                                const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
                                                const usuario = localStorage.getItem("user");
                                                const mesa = localStorage.getItem("mesa");

                                                if (!pedidos.length) {
                                                    alert("No hay pedidos para guardar.");
                                                    guardar.disabled = false;
                                                    return;
                                                }

                                                fetch('/guardarPedidos', {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json'
                                                    },
                                                    body: JSON.stringify({ mesa, usuario, pedidos })
                                                })
                                                    .then(response => response.text())
                                                    .then(data => {
                                                        if (data === 'Pedidos insertados correctamente') {
                                                            localStorage.removeItem('pedidos');
                                                            document.getElementById('guardar').hidden = true;
                                                            document.getElementById('eliminar').hidden = true;
                                                            document.getElementById('selectMesa').selectedIndex = 0;
                                                            Swal.fire({
                                                                icon: "success",
                                                                title: "Guardado",
                                                            });
                                                            actualizarPedidosEnVista(); // Actualizar la vista de pedidos
                                                        }
                                                        guardar.disabled = false;
                                                    })
                                                    .catch(error => {
                                                        console.error('Error:', error);
                                                        guardar.disabled = false;
                                                    });
                                            });
                                        })
                                        .catch(error => console.error("Error al obtener detalles del producto:", error));
                                });
                            });
                        })
                        .catch(error => console.error("Error al obtener productos:", error));
                });
            });
        })
        .catch(error => console.error('Error al obtener categorías:', error));
});
// Función para actualizar la vista de pedidos
function actualizarPedidosEnVista() {
    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    const listaPedidos = document.getElementById('listaPedidos');
    listaPedidos.innerHTML = '';

    pedidos.forEach((pedido) => {
        const pedidoHTML = `
            <div class="pedido-item d-flex justify-content-between align-items-center mb-2">
                <span>${pedido.productoNombre} - Cantidad: ${pedido.cantidad}</span>
                <div>
                    <button class="btn btn-info btn-sm me-2" onclick="mas('${pedido.productoNombre}')">+</button>
                    <button class="btn btn-warning btn-sm" onclick="menos('${pedido.productoNombre}')">-</button>
                </div>
            </div>
        `;
        listaPedidos.insertAdjacentHTML('beforeend', pedidoHTML);
    });
}

// Función para aumentar la cantidad de un producto
function mas(productoNombre) {
    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    const pedidoIndex = pedidos.findIndex(p => p.productoNombre === productoNombre);
    if (pedidoIndex !== -1) {
        pedidos[pedidoIndex].cantidad = (parseInt(pedidos[pedidoIndex].cantidad) + 1).toString();
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        actualizarPedidosEnVista();
    }
}

// Función para disminuir la cantidad de un producto
function menos(productoNombre) {
    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    const pedidoIndex = pedidos.findIndex(p => p.productoNombre === productoNombre);
    if (pedidoIndex !== -1 && parseInt(pedidos[pedidoIndex].cantidad) > 1) {
        pedidos[pedidoIndex].cantidad = (parseInt(pedidos[pedidoIndex].cantidad) - 1).toString();
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        actualizarPedidosEnVista();
    }
}

// Función para eliminar un producto del carrito
function eliminarProducto(index) {
    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    if (pedidos[index]) {
        pedidos.splice(index, 1);
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        actualizarPedidosEnVista();
    }
}



// Cargar los pedidos en la vista cuando la página se carga
window.addEventListener('load', () => {
    actualizarPedidosEnVista();
});
