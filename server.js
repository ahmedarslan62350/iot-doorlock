const express = require("express");
const mqtt = require("mqtt");
const path = require("path");

const app = express();
const port = 3000;

// Serve static files from "public"
app.use(express.static(path.join(__dirname, "public")));

// MQTT connection
const mqttClient = mqtt.connect("mqtt://157.90.174.166:1883", {
}); // Replace with your broker URL

const topic = "home/device/relay";

mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker");
});

// API to handle ON/OFF requests
app.get("/api/control", (req, res) => {
  const { state } = req.query; // Get "state" from query parameters
  if (state === "on" || state === "off") {
    mqttClient.publish(topic, state.toLocaleUpperCase());
    res.json({ message: `Device turned ${state}` });
  } else {
    res.status(400).json({ error: 'Invalid state. Use "on" or "off".' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
