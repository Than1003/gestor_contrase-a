// Definir una constante global para la URL base
const BASE_URL = "http://127.0.0.1:5000";

function showSuccessToast(message = 'Guardado correctamente') {
    if (window.Swal) {
        Swal.fire({
            title: message,
            text: 'Tu cambio se aplicó correctamente.',
            icon: 'success',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false,
            customClass: {
                popup: 'success-toast'
            }
        });
        return;
    }

    if (window.swal) {
        swal('Éxito', message, 'success');
        return;
    }

    alert(message);
}

// Función para visualizar datos en la tabla
function visualizar(data) {
    let tabla = ""; // Inicializa la variable para almacenar el HTML de la tabla
    
    // Recorre cada elemento en el array "baul" y crea una fila de tabla
    data.baul.forEach(item => {
        tabla += `
        <tr data-id="${item.id_baul}">
            <td>${item.id_baul}</td>
            <td>${item.Plataforma}</td>
            <td>${item.usuario}</td>
            <td>${item.clave}</td>
            <td>
                <button type='button' class="table-action edit" onclick="location.href = 'edit.html?variable1=${item.id_baul}'" title="Actualizar">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm14.71-9.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                </button>
            </td>
            <td>
                <button type='button' class="table-action delete" onclick="eliminar(${item.id_baul})" title="Eliminar">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M16 9v10H8V9h8zm-1.5-6h-5l-1 1H5v2h14V4h-4.5l-1-1zM18 7H6v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7z"/>
                    </svg>
                </button>
            </td>
        </tr>`;
    });
    
    // Inserta las filas generadas en el cuerpo de la tabla
    document.getElementById('data').innerHTML = tabla;
}

// Función para realizar una consulta general (GET)
function consulta_general() {
    fetch(`${BASE_URL}/`) // Realiza una solicitud GET al endpoint
        .then(response => {
            if (!response.ok) throw new Error(`Error: ${response.status}`); // Manejo de errores HTTP
            return response.json(); // Convierte la respuesta en JSON
        })
        .then(data => visualizar(data)) // Muestra los datos en la tabla
        .catch(error => console.error('Error:', error)); // Captura y muestra errores en la consola
}

// Función para eliminar un registro (DELETE)
function eliminar(id) {
    fetch(`${BASE_URL}/eliminar/${id}`, { method: 'DELETE' }) // Solicitud DELETE
        .then(response => {
            if (!response.ok) throw new Error(`Error: ${response.status}`); // Manejo de errores HTTP
            return response.json();
        })
        .then(res => {
            actualizarDOM(id); // Elimina el elemento directamente del DOM
            swal("Mensaje", `Registro ${res.mensaje} exitosamente`, "success"); // Notificación de éxito
        })
        .catch(error => console.error('Error:', error)); // Captura y muestra errores en la consola
}

// Función para actualizar el DOM después de eliminar un elemento
function actualizarDOM(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) row.remove(); // Elimina directamente la fila del DOM
}

// Función para registrar un nuevo registro (POST)
function registrar() {
    // Obtiene los valores de los campos de entrada
    const plat = document.getElementById("plataforma").value;
    const usua = document.getElementById("usuario").value;
    const clav = document.getElementById("clave").value;
    
    // Crea el objeto de datos
    const data = {
        plataforma: plat,
        usuario: usua,
        clave: clav
    };
    
    fetch(`${BASE_URL}/registro/`, {
        method: "POST", // Método HTTP POST para registrar
        body: JSON.stringify(data), // Convierte el objeto a JSON
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return response.json();
    })
    .then(response => {
        if (response.mensaje === "Duplicado") {
            Swal.fire({
                title: 'Ya existe',
                text: response.detalle || 'La plataforma ya existe',
                icon: 'warning',
                timer: 1600,
                showConfirmButton: false
            });
        } else if (response.mensaje === "Error") {
            Swal.fire({
                title: 'Error',
                text: response.detalle || 'Error en el registro',
                icon: 'error',
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            consulta_general(); // Refresca la tabla de datos sin recargar la página
            showSuccessToast('Registro guardado correctamente');
        }
    })
    .catch(error => console.error('Error:', error)); // Captura errores
}

// Función para consultar un registro individual (GET)
function consulta_individual(id) {
    fetch(`${BASE_URL}/consulta_individual/${id}`) // Solicitud GET al endpoint
        .then(response => {
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            return response.json(); // Convierte la respuesta en JSON
        })
        .then(data => {
            // Rellena los campos de entrada con los valores obtenidos
            document.getElementById("plataforma").value = data.baul.Plataforma;
            document.getElementById("usuario").value = data.baul.usuario;
            document.getElementById("clave").value = data.baul.clave;
        })
        .catch(error => console.error('Error:', error)); // Captura errores
}

// Función para modificar un registro existente (PUT)
function modificar(id) {
    // Obtiene los valores de los campos de entrada
    const plat = document.getElementById("plataforma").value;
    const usua = document.getElementById("usuario").value;
    const clav = document.getElementById("clave").value;
    
    // Crea el objeto de datos
    const data = {
        plataforma: plat,
        usuario: usua,
        clave: clav
    };
    
    fetch(`${BASE_URL}/actualizar/${id}`, {
        method: "PUT", // Método HTTP PUT para actualizar
        body: JSON.stringify(data), // Convierte el objeto a JSON
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return response.json();
    })
    .then(response => {
        if (response.mensaje === "Duplicado") {
            Swal.fire({
                title: 'Ya existe',
                text: response.detalle || 'La plataforma ya existe',
                icon: 'warning',
                timer: 1600,
                showConfirmButton: false
            });
        } else if (response.mensaje === "Error") {
            Swal.fire({
                title: 'Error',
                text: response.detalle || 'Error al actualizar el registro',
                icon: 'error',
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            consulta_general(); // Refresca la tabla de datos sin recargar la página
            showSuccessToast('Registro actualizado correctamente');
        }
    })
    .catch(error => console.error('Error:', error)); // Captura errores
}
