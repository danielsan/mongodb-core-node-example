const
  Server = require('mongodb-core').Server,
  assert = require('assert');

// Set up server connection
const server = new Server({
    host: 'localhost'
  , port: 27017
  , reconnect: true
  , reconnectInterval: 50
});

// Add event listeners
server.on('connect', function serverOnConnect(_server) {
  console.log('connected');

  // Execute the ismaster command
  const syscmd   = 'system.$cmd';
  const ismaster = {ismaster: true};

  console.log('trying to check if it is master', {syscmd});
  _server.command(syscmd, ismaster, (err, result) => {
    // ismastersyscnt insert
    var docs = [{a:1}, {a:2}];
    const options = {writeConcern: {w:1}, ordered:true};
    const dbName  = 'myproject';
    const coll    = 'inserts1';
    const ns      = dbName + '.' + coll; // namespace

    console.log('trying to insert docs into', {ns});
    _server.insert(ns, docs, options, (err, results) => {
      // console.log('insert results', {err, result: results.result && results.result.n});
      assert(err === null, 'ERROR happened: ' + err);
      assert(results.result.n === 2, 'ERROR: results.result.n != 2 | ' + results.result.n);

      // Perform a document update
      docs = [{q: {a: 1}, u: {'$set': {b:1}} }];
      console.log('trying to update a doc in', {ns});
      _server.update(ns, docs, options, (err, results) => {
        // console.log('update results', {err, result: results.result && results.result.n});
        assert(err === null, 'ERROR happened: ' + err);
        assert(results.result.n === 1, 'ERROR: results.result.n != 2 | ' + results.result.n);

        // Remove a document
        docs = [{q: {a: 1}, limit: 1}];
        console.log('trying to remove doc from', {ns});
        _server.remove(ns, docs, options, (err, results) => {
          // console.log('remove results', {err, result: results.result && results.result.n});
          assert(err === null, 'ERROR happened: ' + err);
          assert(results.result.n === 1, 'ERROR: results.result.n != 2 | ' + results.result.n);

          // Get a document
          const cursor = _server.cursor(ns, {find: ns, query: {a: 2}});

          // Get the first document
          console.log('querying a doc in', {ns});
          cursor.next((err, doc) => {
            // console.log('cursor.next', doc);
            assert(err === null, 'ERROR happened: ' + err);
            assert(doc.a === 2, 'ERROR: doc.a != 2 | ' + doc.a);

            // Execute the ismaster command
            _server.command(syscmd, ismaster, (err, result) => {
              assert(err === null, 'ismaster failed: ' + err);
              console.log('disconnecting');
              // _server.disconnect();
              // _server.close();
              _server.destroy();
            });
          });
        });
      });
    });
  });
});

server.on('close', function() {
  console.log('closed');
});

server.on('reconnect', function() {
  console.log('reconnect');
});

// Start connection
server.connect();