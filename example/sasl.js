var LDAP = require('ldap-gssapi');

var ldap = new LDAP(
  {
    uri:  'ldap://ldap.stanford.edu'
  },
  function (err) {
    var rc;
    if (err) {
      console.error('LDAP ERROR:', err);
      process.exit(1);
    } else {
      ldap.saslbind('GSSAPI', function (err) {
      if (err) {
        console.error('SASL BIND FAILED:', err);
        process.exit(1);
      } else {
        ldap.search(
          {
            base: 'cn=people,dc=stanford,dc=edu',
            filter: '(uid=swl)',
//            attrs: 'modifyTimestamp'
          },
          function (err, data) {
            if (err) {
              console.error('SEARCH ERROR:', err);
              process.exit(1);
            } else {
              console.dir(data, {depth:null,colors:true});
              ldap.close();
            }
          }
        );
      }
    });
  }
});