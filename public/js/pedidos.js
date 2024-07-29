window.addEventListener("load", () => {
    fetch("/mostrarPedidos")
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                const contenedor = document.getElementById("contenedorPedidos");
                contenedor.innerHTML = ''; // Limpiar contenido anterior
                data.forEach(pedido => {
                    // Crear el elemento HTML para cada pedido
                    const element = `
                    <div class="col-4 pedido-container" id="contenedor-${pedido.id}">
                        <button type="button" class="btn btn1 btn-ver-pedido" data-pedido-id="${pedido.id}" data-bs-toggle="modal" data-bs-target="#detallePedidoModal">MESA NUM:${pedido.mesa}</button>
                    </div>
                    `;
                    // Insertar el elemento en el contenedor
                    contenedor.insertAdjacentHTML('beforeend', element);
                });

                // Agregar event listener a todos los botones
                document.querySelectorAll('.btn-ver-pedido').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const pedidoId = event.target.getAttribute('data-pedido-id');
                        mostrarDetallesPedido(pedidoId);
                    });
                });
            } else {
                console.error('El formato de los datos no es el esperado, se esperaba un array.');
            }
        })
        .catch(error => console.error('Error al obtener los pedidos:', error));
});

function mostrarDetallesPedido(pedidoId) {
    fetch(`/detallePedido?valor=${pedidoId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            const modalBody = document.getElementById('detallePedidoModalBody');
            modalBody.innerHTML = ''; // Limpiar contenido anterior
            if (Array.isArray(data)) {
                let precioTotal = 0;

                data.forEach(detalle => {
                    const subtotal = detalle.precio * detalle.cantidad;
                    precioTotal += subtotal;

                    const detalleElement = `
                    <div class="card mb-3">
                        <div class="card-header">
                            <h5 class="card-title" data-producto-id="${detalle.producto_id}" id="producto">${detalle.producto}</h5>
                        </div>
                        <div class="card-body">
                            <div class="form-group mb-3">
                                <input type="hidden" class="detalle-id" id="pedido"  value="${detalle.id}">
                                <input type="hidden" class="pedido-id" value="${detalle.pedido_id}">
                            </div>
                            <div class="form-group mb-3">
                                <label for="cantidad-${detalle.id}" class="form-label">Cantidad</label>
                                <input type="number" class="form-control cantidad-input" id="cantidad" value="${detalle.cantidad}" data-precio="${detalle.precio}">
                            </div>
                            <div class="form-group mb-3">
                                <label for="observacion-${detalle.id}" class="form-label">Observación</label>
                                <textarea class="form-control" id="observacion" rows="3">${detalle.observacion}</textarea>
                            </div>
                            <div class="form-group mb-3">
                                <h5>Precio del Producto: <span>${detalle.precio.toLocaleString('es-CO', { 
                                    style: 'currency', 
                                    currency: 'COP',
                                    minimumFractionDigits: 0, 
                                    maximumFractionDigits: 0 
                                })}</span></h5>
                            </div>
                            <button class="btn btn-warning mt-2 btn-editar-detalle" data-detalle-id="${detalle.id}">Editar</button>
                        </div>
                    </div>
                    `;
                    modalBody.insertAdjacentHTML('beforeend', detalleElement);
                });

                // Mostrar el precio total del pedido
                const precioTotalFormateado = precioTotal.toLocaleString('es-CO', { 
                    style: 'currency', 
                    currency: 'COP',
                    minimumFractionDigits: 0, 
                    maximumFractionDigits: 0 
                });

                const totalElement = `
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">Precio Total del Pedido: <span id="precioTotal">${precioTotalFormateado}</span></h5>
                        <button type="button" class="btn btn-danger" id="btnEliminarPedido" data-pedido-id="${pedidoId}">Eliminar pedido</button>
                        <button type="button" class="btn btn-primary mt-3" id="btnRecuperarPedido" data-pedido-id="${pedidoId}">Recuperar pedido</button>
                    </div>
                </div>
                `;
                modalBody.insertAdjacentHTML('beforeend', totalElement);

                // Actualizar el precio total cuando se cambie la cantidad
                document.querySelectorAll('.cantidad-input').forEach(input => {
                    input.addEventListener('input', () => {
                        actualizarPrecioTotal();
                    });
                });

                // Agregar event listener para los botones de eliminar detalle
                document.querySelectorAll('.btn-eliminar-detalle').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const detalleId = event.target.getAttribute('data-detalle-id');
                        eliminarDetalle(detalleId);
                    });
                });

                // Agregar event listener para el botón de eliminar pedido
                document.getElementById('btnEliminarPedido').addEventListener('click', (event) => {
                    const pedidoId = event.target.getAttribute('data-pedido-id');
                    mostrarModalJustificacion(pedidoId);
                });

                // Agregar event listener para el botón de recuperar pedido
                document.getElementById('btnRecuperarPedido').addEventListener('click', () => {
                    localStorage.setItem('pedidoId', pedidoId);
                    window.location.href = '/tomarPedido';
                });  
            

                // Event listeners para botones de editar y eliminar
                document.querySelectorAll('.btn-editar-detalle').forEach(button => {
                    button.addEventListener('click', () => {
                        const contenedorProducto = document.getElementById("producto")
                        const detalleId = document.getElementById("pedido").value
                        const producto = contenedorProducto.getAttribute("data-producto-id")
                        const cantidad = document.getElementById(`cantidad`).value;
                        const observacion = document.getElementById(`observacion`).value;
                        if (cantidad <= 0) {
                            Swal.fire({
                                icon: "error",
                                title: "Oops...",
                                text: "La cantidad no puede ser menor que 0",
                            });
                        } else {
                            Swal.fire({
                                title: "¿Desea editar el pedido?",
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonColor: "#3085d6",
                                cancelButtonColor: "#d33",
                                confirmButtonText: "Si, editar"
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    fetch(`/editarDetallePedido`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ detalleId, producto, cantidad, observacion })
                                    })
                                    .then(response => response.json())
                                    .then(data => {
                                        console.log('Detalle actualizado:', data);
                                    })
                                    .catch(error => console.error('Error al editar el detalle del pedido:', error));
                                    Swal.fire({
                                        title: "Guardado!",
                                        text: "El pedido ha sido editado",
                                        icon: "success"
                                    });
                                }
                            });
                        }
                    });
                });
            } else {
                modalBody.innerHTML = '<p>No se encontraron detalles para este pedido.</p>';
            }
        })
        .catch(error => console.error('Error al obtener los detalles del pedido:', error));
}


// Función para actualizar el precio total
function actualizarPrecioTotal() {
    let precioTotal = 0;
    document.querySelectorAll('.cantidad-input').forEach(input => {
        const cantidad = parseInt(input.value);
        const precio = parseFloat(input.getAttribute('data-precio'));
        precioTotal += cantidad * precio;
    });

    const precioTotalFormateado = precioTotal.toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    document.getElementById('precioTotal').textContent = precioTotalFormateado;
}

function mostrarModalJustificacion(pedidoId) {
    const modalJustificacion = `
    <div class="modal fade" id="modalJustificacion" tabindex="-1" aria-labelledby="modalJustificacionLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalJustificacionLabel">Justificación para eliminar pedido</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="justificacion" class="form-label">Justificación</label>
                        <textarea class="form-control" id="justificacion" rows="3"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-danger" id="confirmarEliminarPedido" data-pedido-id="${pedidoId}">Eliminar</button>
                </div>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalJustificacion);
    const modal = new bootstrap.Modal(document.getElementById('modalJustificacion'));
    modal.show();

    document.getElementById('confirmarEliminarPedido').addEventListener('click', () => {
        const justificacion = document.getElementById('justificacion').value;
        if (justificacion.trim() !== '') {
            
            Swal.fire({
                title: "Deseas eliminar el pedido",
                text: "Esta accion no se puede revertir",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "BORRAR"
              }).then((result) => {
                if (result.isConfirmed) {
                    eliminarPedido(pedidoId, justificacion);
                    modal.hide();
                }
              });
            
        } else {
            alert('Por favor, proporcione una justificación para eliminar el pedido.');
        }
    });
}

function eliminarPedido(pedidoId, justificacion) {
    fetch(`/eliminarPedidos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            pedidoId: pedidoId,
            justificacion: justificacion
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        return response.json();
    })
    .then(data => {
        if (data.estado ==="ok") {
            Swal.fire({
                icon: "success",
                title: "Pedido eliminado con exito",
                text: data.message
            });
            const elmentoBorrar = document.getElementById(`contenedor-${pedidoId}`);
                if (elmentoBorrar) {
                    elmentoBorrar.remove();
                }
                // cierra el modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('detallePedidoModal'));
                modal.hide();
        } else {
            Swal.fire({
                icon: "warning",
                title: "ERROR",
                text: data.message
            });
        }

    })
    .catch(error => console.error('Error al eliminar el pedido:', error));
}