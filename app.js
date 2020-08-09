const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));
let clients = 0;

io.on("connection", function (socket, data) {
  socket.on("NewClient", function () {
    if (clients < 2) {
      if (clients == 1) {
        this.emit("CreatePeer");
      }
    } else {
      this.emit("SessionActive");
      this.broadcast.emit("Intruder Alert");
    }
    clients++;
  });
  socket.on("Offer", function (offer) {
    console.log(offer.type);
    this.broadcast.emit("BackOffer", offer);
  });
  socket.on("Answer", function (data) {
    console.log(data.type);
    this.broadcast.emit("BackAnswer", data);
  });
  if (clients < 2) {
    socket.on("disconnect", function () {
      if (clients > 0) {
        if (clients <= 2) this.broadcast.emit("Disconnect");
        clients--;
      }
      io.emit("User Left");
    });
  }
});

app.get("/close", (req, res) => {
  res.sendFile(__dirname + "/public/closescreen.html");
});

http.listen(port, () => console.log(`Server started on ${port} port`));
