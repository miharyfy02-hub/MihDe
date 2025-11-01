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

    // Confirm it's a page event
    if (body.object === 'page') {
      body.entry.forEach(async (entry) => {
        // There may be multiple changes. We loop.
        if (entry.changes) {
          // For Page feed/comments changes (new comments)
          entry.changes.forEach(async (change) => {
            // Example structure: change.field == "feed" and change.value has verb/type
            // But safer: inspect change.value
            const value = change.value || {};

            // If it's a comment on a post, Facebook often provides item: "comment"
            if (value.item === 'comment' && value.verb === 'add') {
              const commentId = value.comment_id || value.id || (value.comment && value.comment.id);
              const postId = value.post_id || value.post || value.parent_id;
              const senderId = value.from ? value.from.id : null;
              const messageText = value.message || null;

              console.log(`New comment detected: commentId=${commentId}, postId=${postId}, from=${senderId}, message=${messageText}`);

              if (commentId) {
                // Decide reply text (simple keyword logic)
                const replyText = decideReply(messageText);

                // Send reply
                await replyToComment(commentId, replyText);
              }
            }
          });
        }

        // Also check 'messaging' or 'changes' alternative formats (older versions).
        if (entry.messaging) {
          // not used here
        }
      });

      // Respond 200 to Facebook quickly
      res.status(200).send('EVENT_RECEIVED');
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.error('Webhook handling error:', err);
    res.sendStatus(500);
  }
});

// Function: decide reply based on comment text (simple demo)
function decideReply(message) {
  if (!message) return REPLY_DEFAULT;

  const text = message.toLowerCase();

  if (text.includes('misaotra') || text.includes('merci')) {
    return "Tsy misy fisaorana! Raha mila fanazavana hafa azafady manorata eto. 😊";
  }
  if (text.includes('vidy') || text.includes('price') || text.includes('prix')) {
    return "Azafady, ny vidin'ny entana dia: manatona ny pejy 'Entana' na manorata DM ho an'ny antsipiriany.";
  }
  if (text.includes('miasa') || text.includes('asa')) {
    return "Eny, misokatra izahay — manorata DM na mailaka ho an'ny fampahalalana misimisy kokoa.";
  }

  // Default
  return REPLY_DEFAULT;
}

// Function: reply to comment via Graph API
async function replyToComment(commentId, message) {
  try {
    const url = `https://graph.facebook.com/v17.0/${commentId}/comments`;
    // note: /v17.0/ may be updated by Facebook later; Graph API version used here is example
    const res = await axios.post(url, null, {
      params: {
        message,
        access_token: PAGE_ACCESS_TOKEN
      }
    });
    console.log('Reply sent:', res.data);
    return res.data;
  } catch (err) {
    // Log full error message for debugging
    if (err.response) {
      console.error('FB API error:', err.response.status, err.response.data);
    } else {
      console.error('Error sending reply:', err.message);
    }
    throw err;
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Ensure your webhook URL is configured in Facebook Developer console.');
});
