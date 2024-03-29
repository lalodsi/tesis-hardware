/**
 * Activa o desactiva el botón para comenzar el envío de datos según el parámetro entrante que determina el estado del arduino
 * @param {boolean} data bandera para activar o desactivar el boton comenzar
 */
 const activarBotonComenzar = function (state) {
    const botonStart =document.getElementById('startMonitoreo');
    if (state === "start") {
        botonStart.className = "botonStart start";
        botonStart.setAttribute('style', 'display: block;')
    }
    else if (state === "stop") {
        botonStart.className = "botonStart stop";
        botonStart.setAttribute('style', 'display: block;')
    }
    else if(state === "desactivado"){
        botonStart.className = "botonStart";
        botonStart.setAttribute('style', 'display: none;')
    }
};

let contenidoSection = "home";

const ponerIconoCargandoEnSeccionPrincipal = function (message) {
    const contenedor = document.getElementsByClassName("principal")[0];
    contenedor.innerHTML = "";
    contenedor.className = "section principal centrado";
    contenedor.append(getLoadingElement(message));
}

const activarModoMonitoreo = async function (event) {
    if (actualState === "home") {
        ponerIconoCargandoEnSeccionPrincipal("Activando modo monitoreo");
        socket.emit(
            eventos.enviarPalabra,
            {
                word: "monitorear",
                message: "Se envio la palabra monitorear"
            }
        );
        bloquearBotones(2, 3);
    }
    // Se actualizará el valor del contenido que debe tener la sección
    // y se cambiará en caso de que el usuario se encuentre en el estado de monitorear
    switch (event.target.textContent) {
        case "Informacion Monitoreo":
            contenidoSection = "Informacion Monitoreo";
            if (actualState === "monitorear") {
                const seccionPrincipal = document.getElementsByClassName("principal")[0];
                seccionPrincipal.innerHTML = await requestMenu(1);
            }
            break;
            
        case "Graficas":
            contenidoSection = "Graficas"
            if (actualState === "monitorear") {
                const seccionPrincipal = document.getElementsByClassName("principal")[0];
                seccionPrincipal.innerHTML = await requestMenu(2);
            }
            break;
    }
}

const botonRegresar = function () {
    ponerIconoCargandoEnSeccionPrincipal("Regresando al menu Home");
    socket.emit(
        eventos.enviarPalabra,
        {
            word: "salir",
            message: "Se envio la palabra salir"
        }
    );
    bloquearBotones(4);
}

const getInformacionMonitoreoSection = function () {
    // request(0);
    copiarAlPortapapeles();
    bloquearBotones();
};

const getGraficasSection = function () {
    // request(1);
    bloquearBotones();
};

const getControlManualSection = function () {
    contenidoSection = "Modo de Control Manual"
    ponerIconoCargandoEnSeccionPrincipal("Activando el control manual");
    socket.emit(
        eventos.enviarPalabra,
        {
            word: "controlar",
            message: "Se envio la palabra controlar"
        }
    );
    interactuarInputConRuedaDelMouse( ()=>{
        const azimut = document.getElementById("azimut").value;
        const elevacion = document.getElementById("elevacion").value;
        socket.emit(
            eventos.enviarPalabra,
            {
                word: `${azimut},${elevacion}`,
                message: "Se envio la informacion"
            }
        );
    } );
    bloquearBotones(0,1,2,3);
}

const getPanelDeControlSection = function () {
    contenidoSection = "Modo de Calibración"
    ponerIconoCargandoEnSeccionPrincipal("Activando el modo calibración");
    activarCalibracion();
    bloquearBotones(0,1,2,3);
}

/**
 * Bloquea el contenido
 */
const bloquearBotones = function (...arr) {
    if(arr.length){
        const botones = document.querySelectorAll(".boton");
        const arrBotones = devolverArrayHTML(botones);
        arrBotones.map(boton => boton.className = "boton");
        arr.map( (index) => {
            arrBotones[index].className = "boton botonDesactivado";
        });
    }
}
/**
 * Agrega funcionalidad a los botones para mostrar las diferentes vistas de la sección para información principal
 * Los botones realizarán una consulta GET a través de la ruta 'api/v1/menu/contenido/:id' para recibir el menu correspondiente y añadirlo a la aplicación
 */
const btnShowContent = function() {
    const botones = document.querySelectorAll(".boton");
    const arrBotones = devolverArrayHTML(botones);
    
    arrBotones[0].addEventListener('click', activarModoMonitoreo);
    arrBotones[1].addEventListener('click', activarModoMonitoreo);
    arrBotones[2].addEventListener('click', getControlManualSection);
    arrBotones[3].addEventListener('click', getPanelDeControlSection);
    arrBotones[4].addEventListener('click', botonRegresar);
};

const traerContenidoALaSeccion = async function (menu) {
    // Traer el menu adecuado
    console.log(`El menu es ${menu} ${menu === "monitorear"}`);
    console.log(`La sección es ${contenidoSection}`);
    const seccionPrincipal = document.getElementsByClassName("principal")[0];
    if (menu === "home")
        seccionPrincipal.innerHTML = "";
    if (menu === "monitorear"){
        switch (contenidoSection) {
            case "Informacion Monitoreo":
                seccionPrincipal.innerHTML = await requestMenu(1);
                break;
    
            case "Graficas":
                seccionPrincipal.innerHTML = await requestMenu(2);                
                break;
        }
    }
    if (menu === "controlar" && contenidoSection === "Modo de Control Manual"){
        seccionPrincipal.innerHTML = await requestMenu(3);
        interactuarInputConRuedaDelMouse();
    }

    if (menu === "calibrar" && contenidoSection === "Modo de Calibración"){
        seccionPrincipal.innerHTML = await requestMenu(4);
        activarForms();
        interactuarInputConRuedaDelMouse();
    }
}
