require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'verify_token_example';
const REPLY_DEFAULT = process.env.REPLY_DEFAULT || "Misaotra tamin'ny commentaire! ✅";

if (!PAGE_ACCESS_TOKEN) {
  console.error("❌ ERROR: PAGE_ACCESS_TOKEN tsy hita. Ataovy ao amin'ny .env ny token.");
  process.exit(1);
}

app.use(bodyParser.json());

// --- 1) Webhook Verification (GET) ---
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// --- 2) Webhook Event Handler (POST) ---
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    if (body.object === 'page') {
      for (const entry of body.entry) {
        if (entry.changes) {
          for (const change of entry.changes) {
            const value = change.value || {};

            // Raha misy commentaire vaovao amin'ny post rehetra
            if (value.item === 'comment' && value.verb === 'add') {
              const commentId = value.comment_id || value.id;
              const senderName = value.from?.name || "mpampiasa";
              const messageText = value.message || "";

              console.log(`💬 Comment vaovao: ${senderName} nilaza hoe "${messageText}"`);

              // Mamaritra izay valiny
              const replyText = decideReply(messageText);
              await replyToComment(commentId, replyText);
            }
          }
        }
      }

      res.status(200).send('EVENT_RECEIVED');
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.error('❌ Webhook handling error:', err);
    res.sendStatus(500);
  }
});

// --- 3) Logic: Fanapahan-kevitra amin'ny valiny ---
function decideReply(message) {
  if (!message) return REPLY_DEFAULT;

  const text = message.toLowerCase();

  if (text.includes('misaotra') || text.includes('merci')) {
    return "Tsy misy fisaorana! 😊 Raha mila fanazavana fanampiny dia manorata DM.";
  }
  if (text.includes('vidy') || text.includes('price') || text.includes('prix')) {
    return "Ny vidiny dia hita ao amin’ny pejy 'Entana'. Azafady jereo ao na manorata DM ho an’ny antsipiriany 💬";
  }
  if (text.includes('miasa') || text.includes('asa')) {
    return "Eny, misokatra izahay ankehitriny. Tongava mitsidika na manorata hafatra!";
  }

  // Default auto reply
  return REPLY_DEFAULT;
}

// --- 4) Mampandefa valiny amin'ny commentaire ---
async function replyToComment(commentId, message) {
  try {
    const url = `https://graph.facebook.com/v17.0/${commentId}/comments`;

    const response = await axios.post(url, null, {
      params: {
        message,
        access_token: PAGE_ACCESS_TOKEN,
      },
    });

    console.log(`✅ Nandefa valiny tamin’ny commentId=${commentId}: ${message}`);
    return response.data;
  } catch (err) {
    if (err.response) {
      console.error('❌ FB API error:', err.response.status, err.response.data);
    } else {
      console.error('❌ Error:', err.message);
    }
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Server mandeha amin'ny port ${PORT}`);
  console.log('➡️  Webhook URL: https://your-app-name.onrender.com/webhook');
});
