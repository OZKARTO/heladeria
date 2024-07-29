window.addEventListener("load", () => {
    let usuarios = [];

    // Fetch inicial para obtener todos los usuarios
    fetch("/usuarios")
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                usuarios = data;
                mostrarUsuarios(usuarios);
            } else {
                console.log("Tipo de dato incorrecto, se esperaba un array");
            }
        })
        .catch(error => {
            console.error("Error al obtener los usuarios:", error);
        });

    const mostrarUsuarios = (usuarios) => {
        const contenedor = document.getElementById("tablaUsuarios");
        contenedor.innerHTML = '';
        usuarios.forEach(datos => {
            const elemento = `
                <tr>
                    <th scope="row" id="id">${datos.id}</th>
                    <td>${datos.nombre}</td>
                    <td>${datos.apellidos}</td>
                    <td>${datos.user}</td>
                    <td>${datos.rol}</td>
                    <td>
                        <i class="fa-solid fa-pen-to-square fa-xl" data-id="${datos.id}" data-bs-toggle="modal" data-bs-target="#editarUsuario" style="color: #FFD43B;"></i>
                        <i class="fa-solid fa-trash fa-xl" style="color: #e90707;"></i>
                    </td>
                </tr>
            `;
            contenedor.insertAdjacentHTML("beforeend", elemento);
        });

        // Agregar evento de clic a los iconos de edición
        document.querySelectorAll('.fa-pen-to-square').forEach(icon => {
            icon.addEventListener('click', () => {
                const userId = icon.getAttribute('data-id');
                // Ahora puedes usar userId en tu fetch para obtener los datos del usuario
                fetch(`/detalleUsuarios?valor=${userId}`)
         .then(response => response.json())
        .then(data => {
            data.forEach(datos=>{
                const editarUsuarioContent = document.getElementById('editarUsuarioContent');
                editarUsuarioContent.innerHTML = `
                    <div class="mb-3">
                        <label class="form-label">ID</label>
                        <input type="number" class="form-control" id="editId" value="${datos.id}" disabled>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">NOMBRES</label>
                        <input type="text" class="form-control" id="editNombre" value="${datos.nombre}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">APELLIDOS</label>
                        <input type="text" class="form-control" id="editApellidos" value="${datos.apellidos}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">USER</label>
                        <input type="text" class="form-control" id="editUser" value="${datos.user}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">CONTRASEÑA</label>
                        <input type="password" class="form-control" id="editPassword" value="${datos.password}">
                    </div>
                    <div class="mb-3">
                        <select class="form-select mt-3" aria-label="rol" id="editRol">
                            <option value="1" ${datos.rol === "1" ? "selected" : ""}>administrador</option>
                            <option value="2" ${datos.rol === "2" ? "selected" : ""}>mesera</option>
                            <option value="3" ${datos.rol === "3" ? "selected" : ""}>cajera</option>
                        </select>
                    </div>
                    <button type="button" class="btn btn-success" id="editarUsuarioBtn">EDITAR</button>
                `;
    

            })
           
            document.getElementById('editarUsuarioBtn').addEventListener('click', () => {
                const id = document.getElementById('editId').value;
                const nombre = document.getElementById('editNombre').value;
                const apellidos = document.getElementById('editApellidos').value;
                const user = document.getElementById('editUser').value;
                const password = document.getElementById('editPassword').value;
                const rol = document.getElementById('editRol').value;

              // Expresiones regulares para validación
                const nombreRegex = /^[a-zA-Z\s]+$/; // Solo letras y espacios
                const userRegex = /^[a-zA-Z0-9]+$/; // Letras y números, sin espacios
                const passwordRegex = /^.{3,}$/; // Al menos 8 caracteres            
     // Validación de campos
  
      if (!nombre || !nombreRegex.test(nombre)) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "El nombre no es valido",
        });
          return;
      }
  
      if (!apellidos || !nombreRegex.test(apellidos)) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Los apellidos  no son validos",
        });
          return;
      }
  
      if (!user || !userRegex.test(user)) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "El usuario no es valido",
        });
          return;
      }
  
      if (!password || !passwordRegex.test(password)) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "La contraseña no es valida",
        });
          return;
      }
  
      if (!rol || isNaN(rol) || parseInt(rol) < 1 || parseInt(rol) > 3) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "El rol no es valido",
        });
         return;
      }


        fetch("/editarUsuario", {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({id, nombre, apellidos, user, password, rol  })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message ==="Usuario editado correctamente") {
                Swal.fire({
                    title: "Guardado!",
                    text: data.message,
                    icon: "success"
                });
                  // Actualizar la lista de usuarios
                  const index = usuarios.findIndex(usuario => usuario.id === userId);
                  if (index !== -1) {
                      usuarios[index] = { id: userId, nombre, apellidos, user, rol };
                      mostrarUsuarios(usuarios);
                  }
                const modal = bootstrap.Modal.getInstance(document.getElementById('editarUsuario'));
                modal.hide();
              
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: data.message,
                });
            }
        })
        .catch(error => console.error('Error al editar el usuario:', error.message));
            });
        })
        .catch(error => {
            console.error("Error al cargar los datos del usuario:", error);
        });
            });
        });
    };

  


// Evento de búsqueda en tiempo real
const searchBox = document.getElementById("searchBox");
searchBox.addEventListener("input", () => {
        const searchTerm = searchBox.value.toLowerCase();
        const resultadosFiltrados = usuarios.filter(usuario =>
            usuario.id.toString().includes(searchTerm) || // Filtro por id
            usuario.nombre.toLowerCase().includes(searchTerm) ||
            usuario.apellidos.toLowerCase().includes(searchTerm) ||
            usuario.user.toLowerCase().includes(searchTerm) ||
            usuario.rol.toLowerCase().includes(searchTerm)
        );
        mostrarUsuarios(resultadosFiltrados);
    });
});

//Funcion que crea un usuario 
const btnRegistrar = document.getElementById("crearUsuario");
btnRegistrar.addEventListener("click", () => {
    // Obtener los valores de los campos
    const id = document.getElementById("idUser").value;
    const nombre = document.getElementById("nombre").value;
    const apellidos = document.getElementById("apellidos").value;
    const user = document.getElementById("user").value;
    const password = document.getElementById("password").value;
    const rol = document.getElementById("rol").value;
     console.log(id,nombre,apellidos,user,password,rol)
      // Expresiones regulares para validación
      const idRegex = /^\d+$/; // Solo números enteros positivos
      const nombreRegex = /^[a-zA-Z\s]+$/; // Solo letras y espacios
      const userRegex = /^[a-zA-Z0-9]+$/; // Letras y números, sin espacios
      const passwordRegex = /^.{3,}$/; // Al menos 8 caracteres
  
      // Validación de campos
      if (!id || !idRegex.test(id)) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "El id no es valido",
        });          
        return;
      }
  
      if (!nombre || !nombreRegex.test(nombre)) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "El nombre no es valido",
        });
          return;
      }
  
      if (!apellidos || !nombreRegex.test(apellidos)) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Los apellidos  no son validos",
        });
          return;
      }
  
      if (!user || !userRegex.test(user)) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "El usuario no es valido",
        });
          return;
      }
  
      if (!password || !passwordRegex.test(password)) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "La contraseña no es valida",
        });
          return;
      }
  
      if (!rol || isNaN(rol) || parseInt(rol) < 1 || parseInt(rol) > 3) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "El rol no es valido",
        });
                  return;
      }

    Swal.fire({
        title: "¿Desea crear el usuario?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, crear"
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/crearUsuario`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, nombre, apellidos, user, password, rol })
            })
            .then(response => response.json())
            .then(data => {
                if (data.estado=== "ok") {
                    Swal.fire({
                        title: "Guardado!",
                        text: data.message,
                        icon: "success"
                    });
                    // Cierra el modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('usuario'));
                    modal.hide();
                    // Actualizar la lista de usuarios
                    usuarios.push({ id, nombre, apellidos, user, rol });
                    mostrarUsuarios(usuarios);
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: data.message,
                    });
                }
            })
            .catch(error => console.error('Error al crear el usuario:', error.message));
        }
    });
});
