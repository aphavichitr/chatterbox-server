/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var fs = require('fs');
var filePath = '';
var results = [];

fs.readFile('./data.txt', 'utf-8', function(err, data) {
  if (err) {
    throw err;
  } else {
    data = data.split('}');
    data = data.map(function(element) {
      if (element !== '') {
        element = JSON.stringify(element.concat('}'));
        return JSON.parse(JSON.parse(element));
      }
    });
    data.splice(data.length - 1, 1);
    results = data;
    return data;
  }
});

var displayWebpage = function(response, filePath, contentType) {
  fs.readFile(filePath, function(error, content) {
    if (error) {
      throw err;
      //return '404 Not found';
    } else {
      response.writeHead(200, contentType);
      response.write(content);
      response.end();
    }
  });
};

var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.

  var method = request.method;
  var url = request.url;
  console.log('Serving request type ' + method + ' for url ' + url);
  var statusCode = 200;
  var body = [];

  var responses = function() {
    // The outgoing status.
    
    // See the note below about CORS headers.
    var headers = defaultCorsHeaders;

    // Tell the client we are sending them plain text.
    //
    // You will need to change this if you are sending something
    // other than plain text, like JSON or HTML.
    headers['Content-Type'] = 'application/json';

    // .writeHead() writes to the request line and headers of the response,
    // which includes the status and all headers.
    response.writeHead(statusCode, headers);

    if (method === 'POST') {
      fs.appendFile('data.txt', body, function(err) {
        if (err) {
          throw err;
        }
      });
    }
    var responseBody = {
      headers: headers,
      method: method,
      url: url,
      body: body,
      results: results
    };

    // Make sure to always call response.end() - Node may not send
    // anything back to the client until you do. The string you pass to
    // response.end() will be the body of the response - i.e. what shows
    // up in the browser.
    //
    // Calling .end "flushes" the response's internal buffer, forcing
    // node to actually send all the data over to the client.
    response.end(JSON.stringify(responseBody));
  };
  var contentType;
  if (url === '/scripts/app.js') {
    filePath = process.cwd() + '/client/scripts/app.js';
    contentType = {'Content-Type': 'text/javascript'};
    displayWebpage(response, filePath, contentType);
  } else if (url === '/') {
    filePath = process.cwd() + '/client/index.html';
    contentType = {'Content-Type': 'text/html'};
    displayWebpage(response, filePath, contentType);
  } else if (url === '/styles/styles.css') {
    filePath = process.cwd() + '/client/styles/styles.css';
    contentType = {'Content-Type': 'text/css'};
    displayWebpage(response, filePath, contentType);
  } else if (url === '/bower_components/jquery/dist/jquery.js') {
    filePath = process.cwd() + '/client/bower_components/jquery/dist/jquery.js';
    contentType = {'Content-Type': 'text/javascript'};
    displayWebpage(response, filePath, contentType);
  } else if (url === '/images/spiffygif_46x46.gif') {
    filePath = process.cwd() + '/client/images/spiffygif_46x46.gif';
    contentType = {'Content-Type': 'image/gif'};
    displayWebpage(response, filePath, contentType);
  } else if (url === '/classes/messages' || url === '/classes/messages?order=-createdAt') {
    if (method === 'OPTIONS') {
      responses();
    } else if (method === 'GET') {
      responses();
    } else {
      statusCode = 201;
      request.on('data', function(data) {
        body.push(data);
      });
      request.on('end', function() {
        body = body.join('').toString();
        responses();
      });
    }
  } else {
    statusCode = 404;
    responses();
  }



};


exports.requestHandler = requestHandler;