const express = require("express");
const mqtt = require("mqtt");
const path = require("path");

const app = express();
const port = 62350;

// Serve static files from "public"
app.use(express.static(path.join(__dirname, "public")));

// MQTT connection
const mqttClient = mqtt.connect("mqtt://157.90.174.166:1883", {}); // Replace with your broker URL

const relayTopic = "home/device/relay";
const statusTopic = "home/device/status";

mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker");
});

// API to handle ON/OFF requests
app.get("/api/control", async (req, res) => {
  const { state } = req.query; // Get "state" from query parameters
  if (state === "on" || state === "off") {
    mqttClient.publish(relayTopic, state.toLocaleUpperCase());
    res.json({ message: `Device turned ${state}` });
  } else if (state === "status") {
    // Subscribe to the status topic
    mqttClient.subscribe(statusTopic, (err) => {
      if (err) {
        console.error("Failed to subscribe to status topic:", err);
        res.status(500).json({ error: "Failed to subscribe to status topic" });
        return;
      }

      console.log(`Subscribed to topic: ${statusTopic}`);

      // Publish the status request
      mqttClient.publish(statusTopic, "", (err) => {
        if (err) {
          console.error("Failed to publish status request:", err);
          res.status(500).json({ error: "Failed to publish status request" });
          return;
        }
        console.log("Status request sent");

        // Wait for the status response
        const handleMessage = (topic, message) => {
          console.log(topic , message);
          if (topic === statusTopic) {
            console.log(`Received status: ${message.toString()}`);
            res.json({ message: message.toString() });

            // Unsubscribe and clean up the listener
            mqttClient.unsubscribe(statusTopic, () => {
              console.log(`Unsubscribed from topic: ${statusTopic}`);
            });
            mqttClient.removeListener("message", handleMessage);
          }
        };

        mqttClient.on("message", handleMessage);
      });
    });
  } else {
    res.status(400).json({ error: 'Invalid state. Use "on", "off", or "status".' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
