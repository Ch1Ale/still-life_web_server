const { json } = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const osc = require('osc')

const PORT = 3001;

const oscRemoteIp = "127.0.0.1"
const oscRemotePort = 57120

app = new express();

// Set-up logging
app.use(morgan('tiny'));

// Process body content
app.use(express.json());


/****************
 * OSC Over UDP *
 ****************/

 const getIPAddresses = function () {
  const os = require("os"),
      interfaces = os.networkInterfaces(),
      ipAddresses = [];

  for (let deviceName in interfaces) {
      let addresses = interfaces[deviceName];
      for (let i = 0; i < addresses.length; i++) {
          let addressInfo = addresses[i];
          if (addressInfo.family === "IPv4" && !addressInfo.internal) {
              ipAddresses.push(addressInfo.address);
          }
      }
  }

  return ipAddresses;
};

let udpPort = new osc.UDPPort({
  // This is the port we're listening on.
  localAddress: "0.0.0.0",
  localPort: 57121,

  // This is where sclang is listening for OSC messages.
  remoteAddress: oscRemoteIp,
  remotePort: oscRemotePort,
  metadata: true
});

udpPort.on("ready", function () {
  const ipAddresses = getIPAddresses();

  console.log("Listening for OSC over UDP.");
  ipAddresses.forEach(function (address) {
      console.log(" Host:", address + ", Port:", udpPort.options.localPort);
  });
});

udpPort.on("message", function (oscMessage) {
  console.log(oscMessage);
});

udpPort.on("error", function (err) {
  console.log(err);
});

udpPort.open();

/****************
 * REST handlers *
 ****************/

app.get('/api', (req, res) => {

  const msg = {
    address: "/hello/from/oscjs",
    args: [
        {
            type: "s",
            value: "TEST hello"
        },
        {
            type: "f",
            value: Math.random()
        }
    ]
};
console.log("Sending message", msg.address, msg.args, "to", udpPort.options.remoteAddress + ":" + udpPort.options.remotePort);
udpPort.send(msg).then()

return res.json(0);
  /* userDAO.getDJ().then(
      (dj) => {
          res.json(dj);
      }
  ).catch(
      (err) => {
          res.status(500).json({
              errors: [{ 'message': err }],
          });
      }
  ) */
});

app.listen(PORT, ()=>console.log(`Server running on http://localhost:${PORT}/`));
