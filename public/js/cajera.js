window.addEventListener("load", () => {
    fetch("/pedidosCaja")
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        return response.json();
    })
    .then(data => {
        if (Array.isArray(data)) {
            const contenedor = document.getElementById("contenedorMesas");
            contenedor.innerHTML = ''; // Limpiar contenido anterior
            data.forEach(pedido => {
                // Crear el elemento HTML para cada pedido
                const element = `
                <div class="col-4 pedido-container" id="contenedor-${pedido.id}">
                    <button type="button" class="mesa-button" data-pedido-id="${pedido.id}" data-bs-toggle="modal" data-bs-target="#detallePedidoModal">MESA NUM: ${pedido.mesa}</button>
                </div>
                `;
                // Insertar el elemento en el contenedor
                contenedor.insertAdjacentHTML('beforeend', element);
            });

            // Agregar event listener a todos los botones
            document.querySelectorAll('.mesa-button').forEach(button => {
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
    fetch(`/detallePedidosCaja?valor=${pedidoId}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        return response.json();
    })
    .then(data => {
        const modalBody = document.getElementById('detallePedidoModalBody');
        modalBody.innerHTML = ''; // Limpiar contenido anterior
        console.log(data);

        if (Array.isArray(data)) {
            let precioTotal = 0;

            data.forEach(detalle => {
                const subtotal = detalle.precio * detalle.cantidad;
                precioTotal += subtotal;
                const detalleElement = `
                <div class="card mb-1">
                    <div class="card-body">
                        <div class="row g-3 align-items-center">
                            <div class="col-auto">
                                <label class="col-form-label" id="producto">${detalle.producto}</label>
                                 <h1  id="idpedido" hidden>${detalle.pedido_id}</h1>
                            </div>
                            <div class="col-auto">
                                <input type="number" id="cantidad" class="form-control"  value="${detalle.cantidad}" disabled>
                            </div>
                            
                        </div>
                        <div class="form-group mb-3">
                            <h5>Precio del Producto: <span id="precio">${detalle.precio.toLocaleString('es-CO', { 
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
                    <div class="form-group mb-3">
                        <label for="tipoPago">Tipo de Pago</label>
                        <select class="form-control" id="tipoPago">
                            <option value="efectivo">Efectivo</option>
                            <option value="nequi">Nequi</option>
                            <option value="transferencia">Transferencia</option>
                        </select>
                    </div>
                    <div class="form-group mb-3">
                        <label for="montoCliente">Monto Recibido</label>
                        <input type="number" class="form-control" id="montoCliente" placeholder="Ingrese el monto recibido">
                    </div>
                    <div class="form-group mb-3">
                        <label for="cambio">Cambio</label>
                        <input type="text" class="form-control" id="cambio" disabled>
                    </div>
                    <button type="button" class="btn btn-primary btn-imprimir-factura">Imprimir Factura</button>
                    <button type="button" class="btn btn-success btn-caja" id="btn-caja" disabled>Pagar</button>
                </div>
            </div>
            `;
            modalBody.insertAdjacentHTML('beforeend', totalElement);

            // Calcular el cambio
            const montoClienteInput = document.getElementById("montoCliente");
            montoClienteInput.addEventListener("input", () => {
                const montoCliente = parseFloat(montoClienteInput.value);
                const cambio = montoCliente - precioTotal;
                document.getElementById("cambio").value = cambio.toLocaleString('es-CO', { 
                    style: 'currency', 
                    currency: 'COP',
                    minimumFractionDigits: 0, 
                    maximumFractionDigits: 0 
                });
            });

           // Event listeners para botón de imprimir factura
                document.querySelector('.btn-imprimir-factura').addEventListener('click', imprimirFactura);

                // Event listeners para botón de pagar
                document.querySelectorAll('.btn-caja').forEach(button => {
                    button.addEventListener('click', () => {
                        const tipoPago = document.getElementById("tipoPago").value;
                        const montoCliente = parseFloat(document.getElementById("montoCliente").value);
                        const cambio = montoCliente - precioTotal;
                        if (montoCliente < precioTotal) {
                            Swal.fire({
                                icon: "error",
                                title: "Oops...",
                                text: "El monto recibido es menor al total del pedido.",
                            });
                            return;
                        }else{
                            idPedido = document.getElementById("idpedido").textContent
                            venta(idPedido,cambio)
                           
                        }
                        
                    });
                });

        } 
    })
    .catch(error => console.error('Error al obtener los detalles del pedido:', error));
}
function imprimirFactura() {
    const pedidoId = document.querySelector("#idpedido").textContent;
    const detallesProductos = document.querySelectorAll("#detallePedidoModalBody #producto");
    const cantidad = document.querySelectorAll("#detallePedidoModalBody #cantidad");
    const precio = document.querySelectorAll("#detallePedidoModalBody #precio");

    // Objeto para almacenar los detalles del pedido
    const detallesPedido = {
        productos: [],
        cantidades: [],
        precios: []
    };

    // Iterar sobre los productos para obtener sus nombres
    detallesProductos.forEach(producto => {
        detallesPedido.productos.push(producto.textContent);
    });

    // Iterar sobre las cantidades para obtener sus valores
    cantidad.forEach(cantidad => {
        detallesPedido.cantidades.push(cantidad.value);
    });

    // Iterar sobre los precios para obtener sus valores
    precio.forEach(precio => {
        detallesPedido.precios.push(parseFloat(precio.textContent.replace(/[^\d.-]/g, '')));
    });

    //const total = parseFloat(document.getElementById("precioTotal").textContent.replace(/[^\d.-]/g, ''));
    const precioTotalFormateado = document.getElementById("precioTotal").textContent;
    // Eliminar el símbolo de moneda $ y el punto
    const totalSinSimbolos = precioTotalFormateado.replace(/[$.]/g, '');
    // Convertir a número entero
    const total = parseInt(totalSinSimbolos, 10);
    const tipoPago = document.getElementById("tipoPago").value;
    const montoRecibido = parseFloat(document.getElementById("montoCliente").value);
    const cambio = montoRecibido - total;
     
    const datosPedido = {
        pedidoId,
        detallesPedido,
        total,
        tipoPago,
        montoRecibido,
        cambio
    };
    if (montoRecibido < 0 || isNaN(montoRecibido)) {
        Swal.fire({
            icon: "error",
            title: "error",
            text: "Ingrese el monto recibido" ,
        });
    } else {
    fetch('/imprimirFactura', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosPedido)
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const nuevaVentana = window.open(url, '_blank');
        nuevaVentana.focus();
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
        }, 120000);
        document.querySelector('.btn-caja').disabled = false;
    })
    .catch(error => console.error('Error al imprimir la factura:', error));

    }
}

function venta(id,cambio) {
    //const total = parseFloat(document.getElementById("precioTotal").textContent.replace(/[^\d.-]/g, ''));
    const precioTotalFormateado = document.getElementById("precioTotal").textContent;
    // Eliminar el símbolo de moneda $ y el punto
    const totalSinSimbolos = precioTotalFormateado.replace(/[$.]/g, '');
    // Convertir a número entero
    const total = parseInt(totalSinSimbolos, 10);    const tipoPago = document.getElementById("tipoPago").value;
     // Obtener la fecha y hora actual en el formato deseado
     const now = new Date();
     const year = now.getFullYear();
     const month = String(now.getMonth() + 1).padStart(2, '0');
     const day = String(now.getDate()).padStart(2, '0');
     const fecha = `${year}-${month}-${day} `;
 
     fetch("/venta", {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ id, total, tipoPago, fecha })
     })
     .then(response => {
         if (!response.ok) {
             throw new Error('Error en la respuesta del servidor');
         }
         return response.json();
     })
     .then(data => {
         if (data.estado === "ok") {
            Swal.fire({
                icon: "success",
                title: "Pago exitoso",
                text: `C-ambio: ${cambio.toLocaleString('es-CO', { 
                    style: 'currency', 
                    currency: 'COP',
                    minimumFractionDigits: 0, 
                    maximumFractionDigits: 0 
                })}`,
            });
             
            const elmentoBorrar = document.getElementById(`contenedor-${id}`);
            if (elmentoBorrar) {
                elmentoBorrar.remove();
            }
            // cierra el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('detallePedidoModal'));
            modal.hide();
         } else {
            Swal.fire({
                icon: "success",
                title: "Error al ingresar el pago ",
                text: data.message
            });
         }
     })
     .catch(error => console.error("error al insertar la venta", error));
}
