exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const boundary = event.headers['content-type'].split('boundary=')[1];
  if (!boundary) {
    return { statusCode: 400, body: 'No boundary found' };
  }

  // Buffer auslesen
  const bodyBuffer = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
  const parts = bodyBuffer.toString().split('--' + boundary);
  let filePart = parts.find(p => p.includes('Content-Disposition: form-data; name="file"'));
  if (!filePart) {
    return { statusCode: 400, body: 'No file found' };
  }
  // Extrahiere Dateiinhalt
  const match = /\r\n\r\n([\s\S]*)\r\n--/.exec(filePart + '--');
  if (!match) {
    return { statusCode: 400, body: 'No file content found' };
  }
  const fileContent = Buffer.from(match[1], 'binary');

  // Dateiname generieren
  const filename = 'uploads/' + Date.now() + '-' + Math.random().toString(36).substring(2, 8) + '.jpg';
  const fs = require('fs');
  fs.writeFileSync(filename, fileContent);

  // Rückgabe der URL (relativ)
  return {
    statusCode: 200,
    body: JSON.stringify({ url: filename }),
    headers: { 'Content-Type': 'application/json' }
  };
};
