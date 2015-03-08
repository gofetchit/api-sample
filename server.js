var express = require('express'),
    app = express();

app.set('view engine', 'jade');

var oauth2 = require('simple-oauth2')({
  clientID: 'c5cc4c8a1da708ba688e4d304fdbf0352142c4dd797068a4c4c9606800815c2e',
  clientSecret: '02ba4165b59ef4f307a0007b5f7e11e9716f1ea198c0a225656f118e90e55dbb',
  site: 'http://localhost:5000',
  tokenPath: '/oauth/token'
});

// Authorization uri definition
var authorization_uri = oauth2.authCode.authorizeURL({
  redirect_uri: 'http://localhost:3000/callback'
});

// Initial page redirecting to Github
app.get('/auth', function (req, res) {
    res.redirect(authorization_uri);
});

// Callback service parsing the authorization token and asking for the access token
app.get('/callback', function (req, res) {
  var code = req.query.code;
  console.log('/callback');
  oauth2.authCode.getToken({
    code: code,
    redirect_uri: 'http://localhost:3000/callback'
  }, saveToken);

  function saveToken(error, result) {
    if (error) { console.log('Access Token Error', error.message); }
    token = oauth2.accessToken.create(result);
    res.redirect('/overview');
  }
});

app.get('/overview', function(req, res) {
  oauth2.api('GET', '/api/v2/fetches', {
    access_token: token.token.access_token
  }, function (err, data) {
    if (data.fetches) {
      console.log(data.fetches);
      res.render('overview', data);
    }

  });
});

app.get('/', function (req, res) {
  res.send('Hello<br><a href="/auth">Log in with rogr.io</a>');
});

app.listen(3000);

console.log('Express server started on port 3000');
