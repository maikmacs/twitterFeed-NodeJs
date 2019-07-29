const express = require('express');
const app = express();

require('dotenv').config();

app.set('port', process.env.PORT || 3001);

var config = require('./config');
var Twit = require('twit');
var T = new Twit(config);

app.get('/api/tweets', function(req, res) {
  const param = req.query.q;
  const max_id = req.query.max_id;

  if (!param && !max_id) {
    res.json({
      error: 'Missing required parameter `q` and `max_id`',
    });
  } else if (!max_id) {
    searchTweets(param, res);
  } else {
    fetchMoreTweets(param, max_id, res);
  }
});

function searchTweets(param, res) {
  T.get(
    'search/tweets',
    { q: '#' + param, count: 30, result_type: 'recent' },
    function(err, reply) {
      let response = reply.statuses
        .filter(tweet => tweet.in_reply_to_status_id === null)
        .map(tweet => ({
          id: tweet.id,
          text: tweet.text,
          date: tweet.created_at,
        }));

      res.json(response);
    },
  );
}

function fetchMoreTweets(param, max_id, res) {
  T.get(
    'search/tweets',
    { q: param, max_id: max_id, include_entities: 1, count: 20 },
    function(err, reply) {
      res.json(reply);
    },
  );
}

app.get('/api/trends', function(req, res) {
  searchTrends(res);
});

function searchTrends(res) {
  T.get('trends/place', { id: 1 }, function(err, reply) {
    res.json(reply);
  });
}

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
