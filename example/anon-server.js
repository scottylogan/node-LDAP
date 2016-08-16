var http = require('http'),
    url  = require('url'),
    LDAP = require('ldap-gssapi');



function serve () {
  var ldap = this,
      server = http.createServer(function (req, res) {
        var who;

        res.setHeader('Content-Type', 'application/json');

        function end (code, message) {
          res.status = code;
          res.statusMessage = message;
          res.end();
          console.log('%d %s %s', res.status || 200, req.method, req.url);
        }

        if (req.method !== 'GET') {
          end(406, 'Method not supported');
        } else if (!req.url) {
          end (400, 'Bad request');
        } else {
          who = url.parse(req.url).pathname.split('/')[1];
          if (!who || who === '' || !who.match(/^[a-z][a-z0-9]+$/)) {
            end (400, 'Bad request');
          } else {
            ldap.search({filter: '(uid=' + who + ')' }, function (err, data) {
              if (err) {
                end (500, 'Internal error: ' + err.toString());
              } else {
                if (data.length !== 1) {
                  end (404, 'Not found');
                } else {
                  res.write(JSON.stringify(data[0]));
                  res.end();
                  end(res.status, req.method, req.url);
                }
              }
            });
          }
        }
      });

  server.listen(3000, function () {
    console.log('Started on http://localhost:3000/');
  });
}

new LDAP(
  {
    uri:  'ldap://ldap.stanford.edu',
    base: 'cn=people,dc=stanford,dc=edu',
    attrs: [ '*', 'createTimestamp', 'modifyTimestamp' ],
    scope: LDAP.SUBTREE,
    connect: serve,
    disconnect: function () { process.exit(0); }
  },
  function (err) {
    if (err) {
      console.error('LDAP ERROR:', err);
      process.exit(1);
    }
  }
);
