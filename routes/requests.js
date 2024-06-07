const express = require('express');
const { ensureAuth } = require('../middleware/auth');
const Request = require('../models/Request');
const axios = require('axios');
require('dotenv').config();
const router = express.Router();

router.post('/add', ensureAuth, async (req, res) => {
  try {
    const { category, comments } = req.body;
    const newRequest = new Request({
      user: req.user.id,
      category,
      comments
    });
    await newRequest.save();

    // Intercom API Integration
    await axios.post('https://api.intercom.io/messages', {
      message_type: 'inapp',
      body: `New ${category}: ${comments}`,
      from: { type: 'user', id: req.user.id }
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.INTERCOM_ACCESS_TOKEN}`,
        'Accept': 'application/json'
      }
    });

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

router.get('/', ensureAuth, async (req, res) => {
  try {
    const requests = await Request.find({ user: req.user.id }).lean();
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

module.exports = router;
