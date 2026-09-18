require("dotenv").config();

const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "CRM to Plannit integration is running" });
});

app.post("/webhook/lead", async (req, res) => {
  try {
    const lead = req.body;
    console.log("BODY COMPLET:");
    console.log(JSON.stringify(lead, null, 2));

    console.log("Lead reçu:", lead);

    const payload = {
      contact: {
        firstName: lead.firstName || lead.first_name || "",
        lastName: lead.lastName || lead.last_name || "",
        email: lead.email || "",
        phone: {
          number: lead.phone || lead.phoneNumber || lead.phone_number || ""
        }
      },
      job: {
        description: `
Nouveau lead reçu

Nom: ${lead.firstName || lead.first_name || ""} ${lead.lastName || lead.last_name || ""}
Email: ${lead.email || ""}
Téléphone: ${lead.phone || lead.phoneNumber || lead.phone_number || ""}
Service demandé: ${lead.service || lead.serviceName || lead.service_name || lead.customData?.service || ""}
Délai: ${lead.delai || lead.customData?.delai || ""}
Message: ${lead.message || lead.description || ""}
        `.trim()
      }
    };

    const response = await fetch("https://partner.plannit.io/api/jobs", {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.PLANNIT_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();

    console.log("Payload envoyé à Plannit:", JSON.stringify(payload, null, 2));
    console.log("Réponse Plannit:", text);

    res.status(response.status).json({
      success: response.ok,
      plannitStatus: response.status,
      plannitResponse: text
    });

  } catch (error) {
    console.error("Erreur:", error);

    res.status(500).json({
      success: false,
      error: "Erreur serveur"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});