const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

/* ===============================
   CORS CONFIG (ÇOK KRİTİK)
================================ */
app.use(
  cors({
    origin: [
      "https://www.sssound.com.tr",
      "https://sssound.com.tr"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Preflight (OPTIONS) request fix
app.options("*", cors());

/* ===============================
   MIDDLEWARE
================================ */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

/* ===============================
   API ROUTES
================================ */
app.use("/api/events", require("./routes/events"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/gallery", require("./routes/gallery"));
app.use("/api/content", require("./routes/content"));
app.use("/api/contact", require("./routes/contact"));

/* ===============================
   TEST ROUTE
================================ */
app.get("/", (req, res) => {
  res.json({
    message: "✅ SS Sound API çalışıyor (Render)",
  });
});

/* ===============================
   MONGODB CONNECTION
================================ */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB bağlantısı başarılı");
  } catch (err) {
    console.error("❌ MongoDB bağlantı hatası:", err.message);
    process.exit(1);
  }
};

/* ===============================
   SERVER START
================================ */
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server ${PORT} portunda çalışıyor`);
  });
});
