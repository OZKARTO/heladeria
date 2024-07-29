let chartVentas; // Variable global para el gráfico de ventas
let chartCeo; // Variable global para el gráfico de CEO
let chartProductos; // Variable global para el gráfico de productos

function filtrarReportes() {
  const fechaInicio = document.getElementById('fechaInicio').value;
  const fechaFin = document.getElementById('fechaFin').value;
  const tipoPago = document.getElementById('tipoPago').value;

  if (fechaFin ==="" || fechaInicio ==="") {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Debe seleccionar un campo de fecha ",
    });
  } else {
    // Llamada al backend para obtener los datos filtrados
  fetch(`/detalleVentaFecha?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&tipoPago=${tipoPago}`)
  .then(response => response.json())
  .then(data => {
    mostrarDatos(data);
    generarGrafica(data);
  });
  }

  
}

function mostrarDatos(data) {
  const tbody = document.getElementById('reportTableBody');
  tbody.innerHTML = ''; // Limpiar tabla

  const formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }); // Formato de moneda sin decimales

  // Mostrar datos en la tabla
  data.results.forEach(venta => {
    const tr = document.createElement('tr');
    const fechaVenta = venta.fecha_venta ? new Date(venta.fecha_venta).toISOString().split('T')[0] : ''; // Formato YYYY-MM-DD
    tr.innerHTML = `
      <td>${venta.id || ''}</td>
      <td>${venta.pedido_id || ''}</td>
      <td>${formatter.format(venta.total || 0)}</td>
      <td>${venta.tipo_pago || ''}</td>
      <td>${fechaVenta}</td>
    `;
    tbody.appendChild(tr);
  });

  // Agregar fila de total
  const trTotal = document.createElement('tr');
  trTotal.innerHTML = `
    <td colspan="4">Total:</td>
    <td>${formatter.format(data.total || 0)}</td>
  `;
  tbody.appendChild(trTotal);
}

function filtrarReportesCeo() {
  const fechaInicio = document.getElementById('fechaInicio').value;
  const fechaFin = document.getElementById('fechaFin').value;
  const ceo = document.getElementById('ceo').value;

  if (fechaFin ==="" || fechaInicio ==="") {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Debe seleccionar un campo de fecha ",
    });
  } else {
    fetch(`/detalleVentaCeo?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&ceo=${ceo}`)
    .then(response => response.json())
    .then(data => {
      mostrarDatosCeo(data);
      generarGraficaCeo(data);
    });
  }
}

function mostrarDatosCeo(data) {
  const tbody = document.getElementById('reportTableBodyCeo');
  tbody.innerHTML = '';

  const formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

  data.results.forEach(venta => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${venta.ceo || ''}</td>
      <td>${venta.cantidad_vendida || 0}</td>
      <td>${formatter.format(venta.total_ganancias || 0)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function generarGraficaCeo(data) {
  const ctx = document.getElementById('ceoChart').getContext('2d');

  if (chartCeo) {
    chartCeo.destroy();
  }

  const chartData = {
    labels: data.results.map(venta => venta.ceo),
    datasets: [{
      label: 'Total de Ganancias',
      data: data.results.map(venta => venta.total_ganancias),
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  };

  chartCeo = new Chart(ctx, {
    type: 'bar',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value)
          }
        }
      }
    }
  });
}

function filtrarProductosMasVendidos() {
  const fechaInicio = document.getElementById('fechaInicio').value;
  const fechaFin = document.getElementById('fechaFin').value;
  if (fechaFin ==="" || fechaInicio ==="") {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Debe seleccionar un campo de fecha ",
    });
  } else {
    fetch(`/productosMasVendidos?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
    .then(response => response.json())
    .then(data => {
      mostrarDatosProductos(data);
      generarGraficaProductos(data);
    });
  }
  
}

function mostrarDatosProductos(data) {
  const tbody = document.getElementById('reportTableBodyProductos');
  tbody.innerHTML = '';

  data.results.forEach(producto => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${producto.nombre || ''}</td>
      <td>${producto.cantidad_vendida || 0}</td>
    `;
    tbody.appendChild(tr);
  });
}

function generarGraficaProductos(data) {
  const ctx = document.getElementById('productosChart').getContext('2d');

  if (chartProductos) {
    chartProductos.destroy();
  }

  const chartData = {
    labels: data.results.map(producto => producto.nombre),
    datasets: [{
      label: 'Cantidad Vendida',
      data: data.results.map(producto => producto.cantidad_vendida),
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  };

  chartProductos = new Chart(ctx, {
    type: 'bar',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        }
      }
    }
  });
}

function generarGrafica(data) {
  const ctx = document.getElementById('ventasChart').getContext('2d');
  
  // Si el gráfico ya existe, destrúyelo
  if (chartVentas) {
    chartVentas.destroy();
  }

  const chartData = {
    labels: [], // Aquí irán las fechas
    datasets: [{
      label: 'Total de Ventas',
      data: [], // Aquí irán los totales
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  };

  const formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }); // Formato de moneda sin decimales

  data.results.forEach(venta => {
    if (venta.fecha_venta) {
      const fecha = new Date(venta.fecha_venta);
      const fechaFormateada = fecha.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      chartData.labels.push(fechaFormateada);
      chartData.datasets[0].data.push(venta.total);
    }
  });

  // Crear el gráfico y almacenarlo en la variable global
  chartVentas = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false, // Permitir ajustar la altura y anchura
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => formatter.format(value) // Formato de moneda en el eje Y
          }
        }
      }
    }
  });
}
