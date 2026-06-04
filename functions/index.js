const { onRequest } = require("firebase-functions/v2/https");
const nodemailer = require("nodemailer");

// Configuration de ton compte Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "autopasseport@gmail.com",
    pass: "zqntamsmxommxafu" // Ton mot de passe d'application
  }
});

exports.sendWelcomeEmail = onRequest((req, res) => {
  const mailOptions = {
    from: "Auto-Kinzanza <autopasseport@gmail.com>",
    to: req.query.email || "ton-email-perso@gmail.com",
    subject: "Bienvenue sur Auto-Kinzanza",
    text: "Bonjour ! Votre carnet de bord numérique est prêt."
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send("Erreur : " + error.toString());
    }
    res.status(200).send("Email envoyé avec succès !");
  });
});