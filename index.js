import dotenv from "dotenv";
import express from "express";
import axios from "axios";

dotenv.config({});

const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN.trim();
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const AVIATIONSTACK_KEY = process.env.AVIATIONSTACK_KEY?.trim();

async function sendMessage(chatId, text) {
  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
  });
}

app.post("/new-message", async (req, res) => {
  const { message } = req.body;

  if (!message || !message.text) {
    return res.sendStatus(200);
  }

  const text = message.text.trim();
  const chatId = message.chat.id;

  // Trigger: /flight AI101  or  flight AI101
  const flightMatch = text.match(/^\/?flight\s+([A-Za-z0-9]+)/i);

  if (flightMatch) {
    const flightNumber = flightMatch[1].toUpperCase();

    try {
      const { data } = await axios.get("http://api.aviationstack.com/v1/flights", {
        params: {
          access_key: AVIATIONSTACK_KEY,
          flight_iata: flightNumber,
        },
      });

      const flight = data.data?.[0];

      if (!flight) {
        await sendMessage(chatId, `No live data found for flight ${flightNumber} ✈️`);
        return res.sendStatus(200);
      }

      const reply = `*${flight.airline.name} ${flight.flight.iata}*
From: ${flight.departure.airport} (${flight.departure.iata})
To: ${flight.arrival.airport} (${flight.arrival.iata})
Status: ${flight.flight_status}
Departure: ${flight.departure.scheduled}
Arrival: ${flight.arrival.scheduled}
Aircraft: ${flight.aircraft?.registration || "N/A"}`;

      await sendMessage(chatId, reply);
    } catch (err) {
      console.error("Flight lookup error:", err.message);
      await sendMessage(chatId, "Couldn't fetch flight data right now ✈️");
    }

    return res.sendStatus(200);
  }

  // Original marco/polo trigger
  if (text.toLowerCase().includes("marco")) {
    try {
      await sendMessage(chatId, "Polo!!");
      console.log("Message sent");
    } catch (err) {
      console.error("Error sending message:", err.message);
      return res.sendStatus(500);
    }
  }

  res.sendStatus(200);
});

app.get("/", (req, res) => {
  res.send("Bot is running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});