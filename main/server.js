import express from 'express'
import http from 'http'
import socketio from 'socket.io'
import createGame from './public/game.js'

const app = express();
const server = http.createServer(app);
const sockets = socketio(server);

app.use(express.static('public'));

const game = createGame();

game.subscribe((command)=> {
    sockets.emit(command.type, command)
})

game.movePlayer({ playerId: 'player1', keyPressed: 'ArrowRight'})

sockets.on('connection', (socket) => {
    const playerId = socket.id;
    console.log(`Player ${playerId} connected to server`)
    game.addPlayer({playerId})
    
    socket.emit('setup', game.state)

    socket.on('disconnect', ()=> {
        game.removePlayer({ playerId })
    })

    socket.on('move-player', (command)=> {
        command.playerId = playerId // por segurança, garantimos que o playerId e o command type são os corretos
        command.type = 'move-player'
        game.movePlayer(command)
    })
})

game.start();

const port = process.env.PORT || '3000'

server.listen(port, ()=> {
    console.log('Server running on port 3000.');
})