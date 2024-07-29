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
                    <div class="col-4 pedido-container" id="${pedido.id}">
                        <button type="button" class="btn btn1 btn-ver-pedido" id="btnpedido" data-pedido-id="${pedido.id}" data-mesa="${pedido.mesa}" data-usuario="${pedido.usuario}" data-bs-toggle="modal" data-bs-target="#detallePedidoModal">${pedido.mesa}</button>
                    </div>
                    `;
                    // Insertar el elemento en el contenedor
                    contenedor.insertAdjacentHTML('beforeend', element);
                });

                // Agregar event listener a todos los botones
                document.querySelectorAll('.btn-ver-pedido').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const pedidoId = event.target.getAttribute('data-pedido-id');
                        const mesa = event.target.getAttribute('data-mesa');
                        const usuario = event.target.getAttribute('data-usuario');
                        mostrarDetallesPedido(pedidoId, mesa, usuario);
                    });
                });
            } else {
                console.error('El formato de los datos no es el esperado, se esperaba un array.');
            }
        })
        .catch(error => console.error('Error al obtener los pedidos:', error));
});

function mostrarDetallesPedido(pedidoId) {
    fetch(`/detallePedidosPreparar?valor=${pedidoId}`)
        .then(response => response.json())
        .then(data => {
            const modalBody = document.getElementById('detallePedidoModalBody');
            modalBody.innerHTML = '';
            let precioTotal = 0;
            const mesa = data[0]?.mesa || 'N/A'; // Asume que todos los detalles tienen la misma mesa
            const usuario = data.detalle_id	 || 'N/A'; // Asume que todos los detalles tienen el mismo usuario

            data.forEach(detalle => {
                const subtotal = detalle.precio * detalle.cantidad;
                precioTotal += subtotal;

                let observacionHTML = '';
                if (detalle.observacion.trim() !== "") {
                    observacionHTML = `
                    <div class="form-group mb-3">
                      <label for="observacion-${detalle.id}" class="form-label">Observación</label>
                      <textarea class="form-control" id="observacion-${detalle.id}" rows="3">${detalle.observacion}</textarea>
                    </div>
                    `;
                }

                const detalleElement = `
                <div class="card mb-1">
                    <div class="card-body">
                        <div class="row g-3 align-items-center">
                            <div class="col-12">
                                <h2 >${detalle.producto}</h2>
                                <h1 id="idpedido-${detalle.pedido_id}" hidden>${detalle.pedido_id}</h1>
                            </div>
                            <div class="col-12">
                                <h3 class="h3">CANTIDAD: ${detalle.cantidad}</h3>
                            </div>
                        </div>
                        ${observacionHTML}
                        <div class="form-group mb-3">
                            <h5>Precio del Producto: <span id="precio-${detalle.id}">${detalle.precio.toLocaleString('es-CO', { 
                                style: 'currency', 
                                currency: 'COP',
                                minimumFractionDigits: 0, 
                                maximumFractionDigits: 0 
                            })}</span></h5>
                        </div>
                    </div>
                </div>
                `;
                modalBody.insertAdjacentHTML('beforeend', detalleElement);
            });

            const precioTotalFormateado = precioTotal.toLocaleString('es-CO', { 
                style: 'currency', 
                currency: 'COP',
                minimumFractionDigits: 0, 
                maximumFractionDigits: 0 
            });

            const btnHTML = `
            <div>
                <button class="btn btn-success mt-2 btn-imprimir-comanda" id="btn-imprimir-comanda">IMPRIMIR COMANDA</button>
                <button class="btn btn-danger mt-2 btn-empezar-pedido" id="btn-empezar" disabled>EMPEZAR</button>
            </div>
            `;

            const totalElement = `
                <div class="card mb-3">
                    <div class="card-body">
                       <div> 
                       <h5 class="card-title">Precio Total del Pedido: <span id="precioTotal">${precioTotalFormateado}</span></h5>
                       </div>
                       ${btnHTML}
                   </div>
                </div>
            `;
            modalBody.insertAdjacentHTML('beforeend', totalElement);

            document.getElementById('btn-imprimir-comanda').addEventListener('click', () => {
                fetch("/imprimirComanda", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        pedidoId, 
                        detallesPedido: data, 
                        mesa: mesa,
                        usuario: usuario
                    })
                })
                .then(response => response.blob())
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    window.open(url);
                    
                    document.getElementById('btn-empezar').disabled = false;
                });
            });

            document.getElementById('btn-empezar').addEventListener('click', () => {
                btn = document.getElementById("btnpedido")
                id = btn.getAttribute("data-pedido-id")
                fetch("/cambiarEstadoPedido", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ pedidoId })
                })
                .then(response => response.json())
                .then(data => {
                    Swal.fire({
                        position: "top-end",
                        icon: "success",
                        title: "Pedido iniciado",
                        showConfirmButton: false,
                        timer: 1500
                    });
                    document.getElementById('btn-empezar').disabled = true;
                    const elmentoBorrar = document.getElementById(id);
                    if (elmentoBorrar) {
                        elmentoBorrar.remove();
                    }
                    // cierra el modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('detallePedidoModal'));
                    modal.hide();
                });
            });
        })
        .catch(error => console.error('Error al obtener los detalles del pedido:', error));
}