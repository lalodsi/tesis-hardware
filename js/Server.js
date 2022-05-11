const socketIo = require("socket.io")
const express = require('express');
const routerApi = require("./routes");

class Server{
    sockets = {
        estadoArduino: 'arduinoConnectionState',
        iniciarConexion: 'connect-to-arduino',
        monitorear: "startSendingData",
        intercambiarDatos: "data",
        enviarPalabra: "sendString",
        cambiarFechaYHora: "setDate",
        cambiarPosicion: "setPosition",
        cambiarOrientacion: "setOrientation",
    }

    constructor(){
        this.http = require('http')
        this.app = express();
        this.server = this.http.createServer(this.app); 
        // Socket IO
        this.io = socketIo(this.server);

        this.app.use(express.json())
    }

    /**
     * Despliega el servidor y envía la carpeta public al cliente que se conecte
     */
    start = function() {
        this.app.set('port', process.env.PORT || 3000)
        this.server.listen(this.app.get('port'), ()=>{
            console.log('Servidor conectado en el puerto: ' + this.app.get('port'));
        })
        // Enviar la carpeta public al servidor
        this.app.use(express.static('public'))
        routerApi(this.app);
        // this.app.get('/menu/:id', function (req, res) {
        //     const { id } = req.params;
        //     console.log(`Se realizó una peticion con el id: ${id}`);
        //     res.json({estado: "excelente"});
        // })
    }

    /**
     * Establece un websocket
     * @param {function} callback funcion a ejecutar cuando se conecte el socket
     */
    socket = function(callback) {
        this.io.on('connection', (socket)=>{
            console.log('Tenemos una nueva conexión, Id: '+ socket.id);
            callback(socket);
        })
    }

}

module.exports = Server