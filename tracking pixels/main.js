const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./User");
const ipinfo = require("ipinfo");
const path = require("path");

dotenv.config({ path: "./config.env" });

const app = express();

const DB = process.env.DATABASE;

mongoose
  .connect(DB)
  .then((con) => console.log("DB connected successfully"))
  .catch((error) => {
    console.log(error);
  });

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/newuser", async (req, res) => {
  try {
    const NewUser = await User.create({
      name: req.body.name,
      email: req.body.email,
    });

    res.status(201).json({
      status: "success",
      data: NewUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occured" });
  }
});

app.get("/pikachu.jpeg/:id", async (req, res) => {
  const userId = req.params.id;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const imagePath = path.join(__dirname, "public/images/pikachu.jpeg");

  const updateUser = async (userId, ip, geoLoc) => {
    try {
      await User.findByIdAndUpdate(userId, {
        ip: ip,
        location: JSON.stringify(geoLoc),
        $inc: { counter: 1 },
        openedDate: Date.now()
      });
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  try {
    ipinfo(ip, async (err, geoLoc) => {
      if (err) {
        console.error('Error fetching geolocation:', err);
        return res.status(500).json({ error: "Error fetching geolocation" });
      }

      await updateUser(userId, ip, geoLoc);

      res.sendFile(imagePath, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          res.status(404).send("Image not found");
        }
      });
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
