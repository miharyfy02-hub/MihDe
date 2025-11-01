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
  console.error("Error: PAGE_ACCESS_TOKEN tsy hita. Ataovy ao amin'ny .env ny token.");
  process.exit(1);
}

app.use(bodyParser.json());

// 1) Verification endpoint (Facebook will GET to verify webhook)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// 2) Webhook event receiver (Facebook POSTs events here)
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    if (body.object === 'page') {
      for (const entry of body.entry) {
        if (entry.changes) {
          for (const change of entry.changes) {
            const value = change.value || {};

            // Listen to all comments (new comments on any post)
            if (value.item === 'comment' && value.verb === 'add') {
              const commentId = value.comment_id || value.id;
              const senderName = value.from?.name || "mpampiasa";
              const messageText = value.message || "";

              console.log(`🟢 Comment vaovao: ${senderName} nilaza hoe "${messageText}"`);

              // Mamaly avy hatrany
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
    console.error('Webhook handling error:', err);
    res.sendStatus(500);
  }
});
