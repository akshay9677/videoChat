let Peer = require("simple-peer");
let socket = io("http://localhost:3000/");
const video = document.querySelector("video");
let client = {};
let close = document.querySelector(".close");
let hide = false;

navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then((stream) => {
    socket.emit("NewClient");
    video.srcObject = stream;
    video.play();

    function webRtcInit(type) {
      let peer = new Peer({
        initiator: type == "init" ? true : false,
        stream: stream,
        trickle: false,
      });

      peer.on("stream", function (stream) {
        GenerateVideo(stream);
      });
      return peer;
    }
    socket.on("CreatePeer", function () {
      client.gotAnswer = false;
      let peer = webRtcInit("init");
      peer.on("signal", function (data) {
        if (!client.gotAnswer) {
          socket.emit("Offer", data);
        }
      });
      client.peer = peer;
    });

    socket.on("BackOffer", function (offer) {
      let peer = webRtcInit("notInit");
      peer.on("signal", (data) => {
        socket.emit("Answer", data);
      });
      peer.signal(offer);
      client.peer = peer;
    });

    socket.on("BackAnswer", function (answer) {
      client.gotAnswer = true;
      let peer = client.peer;
      peer.signal(answer);
    });

    function GenerateVideo(stream) {
      let video = document.createElement("video");
      video.id = "peerVideo";
      video.srcObject = stream;
      video.setAttribute("class", "embed-responsive-item");
      document.querySelector("#peerDiv").appendChild(video);
      video.play();
    }

    socket.on("SessionActive", function () {
      document.write(" Room is full");
    });

    socket.on("Disconnect", function () {
      document.getElementById("peerVideo").remove();
      if (client.peer) {
        client.peer.destroy();
      }
    });

    socket.on("User Left", () => {
      alert("User Left!!");
    });

    socket.on("Intruder Alert", () => {
      alert("Intruder Alert!");
    });
  })
  .catch((err) => document.write(err));
