var server = require("http").createServer();
var options = {
  cors: true,
};

var io = require("socket.io")(server, options);

// List of players
var players = {};

function Player(id, posX, posY, posZ, rotX, rotY, rotZ) {
  this.id = id;

  this.posX = posX !== undefined ? posX : 0;
  this.posY = posY !== undefined ? posY : 0;
  this.posZ = posZ !== undefined ? posZ : 0;

  this.rotX = rotX !== undefined ? rotX : 0; // 회전 X
  this.rotY = rotY !== undefined ? rotY : 0; // 회전 Y
  this.rotZ = rotZ !== undefined ? rotZ : 0; // 회전 Z

  this.entity = null;
}

io.sockets.on("connection", function (socket) {
  const socketId = socket.id;
  console.log("Client has connected! : " + socketId);

  socket.on("disconnect", function () {
    delete players[socketId];
    console.log("Client has disconnected! : " + socketId);
    socket.broadcast.emit("playerDisconnected", { id: socketId });
  });

  socket.on("initialize", function (data) {
    // Create Unique ID
    var id = socket.id;

    var pos = data.pos;
    var rot = data.rot;

    // Create a new player and store it into the players list
    var newPlayer = new Player(id, pos.x, pos.y, pos.z, rot.x, rot.y, rot.z);
    players[id] = newPlayer;

    // Send the connecting client his unique ID, and data about the other players already connected.
    socket.emit("playerData", { id: id, players: players });

    // Send the new player to all the other clients
    socket.broadcast.emit("playerJoined", newPlayer);
  });

  socket.on("playerMoved", function (data) {
    var id = data.id;
    var pos = data.pos;
    var rot = data.rot;

    // Update player position in the server
    players[id].x = pos.x;
    players[id].y = pos.y;
    players[id].z = pos.z;

    // Update player rotation in the server
    players[id].rotationX = rot.x;
    players[id].rotationY = rot.y;
    players[id].rotationZ = rot.z;

    // Broadcast the new position to all the other clients
    socket.broadcast.emit("updatePlayerTransform", data);
  });

  socket.on("playerMovedCollision", function (data) {
    var id = data.id;
    var pos = data.pos;
    var rot = data.rot;

    // Update player position in the server
    players[id].x = pos.x;
    players[id].y = pos.y;
    players[id].z = pos.z;

    // Update player rotation in the server
    players[id].rotationX = rot.x;
    players[id].rotationY = rot.y;
    players[id].rotationZ = rot.z;

    // Broadcast the new position to all the other clients
    socket.broadcast.emit("updatePlayerPositionCollision", data);
  });
});

// 5초마다 players 객체를 체크하고 플레이어 아이디 로그에 기록
setInterval(function () {
  var playerIds = Object.keys(players);
  console.log("Current Player IDs: ", playerIds);

  //   console.log("players : ", players);
}, 5000); // 5000밀리초(5초) 간격으로 설정

console.log("Server started.");
server.listen(3000);
