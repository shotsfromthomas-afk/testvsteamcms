
exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO = 'shotsfromthomas-afk/testvsteamcms';
  const BRANCH = 'main';
  const IMAGES_PATH = 'images/';

  if (!GITHUB_TOKEN) {
    return {
      statusCode: 500,
      body: 'GitHub Token fehlt',
    };
  }

  // Multipart-Parsing (nur für ein einzelnes Bild, jpg/png)
  const boundary = event.headers['content-type'].split('boundary=')[1];
  if (!boundary) {
    return { statusCode: 400, body: 'No boundary found' };
  }
  const bodyBuffer = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
  const parts = bodyBuffer.toString().split('--' + boundary);
  let filePart = parts.find(p => p.includes('Content-Disposition: form-data; name="file"'));
  if (!filePart) {
    return { statusCode: 400, body: 'No file found' };
  }
  // Dateiname extrahieren
  const filenameMatch = /filename="([^"]+)"/.exec(filePart);
  let origFilename = filenameMatch ? filenameMatch[1] : 'upload.jpg';
  const ext = origFilename.split('.').pop().toLowerCase();
  const filename = IMAGES_PATH + Date.now() + '-' + Math.random().toString(36).substring(2, 8) + '.' + ext;
  // Dateiinhalt extrahieren
  const match = /\r\n\r\n([\s\S]*)\r\n--/.exec(filePart + '--');
  if (!match) {
    return { statusCode: 400, body: 'No file content found' };
  }
  const fileContent = Buffer.from(match[1], 'binary');
  const contentBase64 = fileContent.toString('base64');

  // GitHub API: Datei als Blob ins Repo schreiben
  const apiBase = `https://api.github.com/repos/${REPO}`;
  const headers = {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  // Hole aktuellen Commit SHA und tree SHA
  const refRes = await fetch(`${apiBase}/git/refs/heads/${BRANCH}`, { headers });
  if (!refRes.ok) {
    return { statusCode: 500, body: 'Fehler beim Lesen des Branch-Refs' };
  }
  const refData = await refRes.json();
  const latestCommitSha = refData.object.sha;
  const commitRes = await fetch(`${apiBase}/git/commits/${latestCommitSha}`, { headers });
  if (!commitRes.ok) {
    return { statusCode: 500, body: 'Fehler beim Lesen des Commits' };
  }
  const commitData = await commitRes.json();
  const baseTreeSha = commitData.tree.sha;

  // Erstelle neuen Blob für das Bild
  const blobRes = await fetch(`${apiBase}/git/blobs`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      content: contentBase64,
      encoding: 'base64',
    }),
  });
  if (!blobRes.ok) {
    return { statusCode: 500, body: 'Fehler beim Erstellen des Blobs' };
  }
  const blobData = await blobRes.json();

  // Erstelle neuen Tree mit dem Bild
  const treeRes = await fetch(`${apiBase}/git/trees`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: [
        {
          path: filename,
          mode: '100644',
          type: 'blob',
          sha: blobData.sha,
        },
      ],
    }),
  });
  if (!treeRes.ok) {
    return { statusCode: 500, body: 'Fehler beim Erstellen des Trees' };
  }
  const treeData = await treeRes.json();

  // Erstelle neuen Commit
  const commitMsg = 'Bild-Upload via Admin';
  const newCommitRes = await fetch(`${apiBase}/git/commits`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message: commitMsg,
      tree: treeData.sha,
      parents: [latestCommitSha],
    }),
  });
  if (!newCommitRes.ok) {
    return { statusCode: 500, body: 'Fehler beim Erstellen des Commits' };
  }
  const newCommitData = await newCommitRes.json();

  // Update Branch-Ref
  const updateRefRes = await fetch(`${apiBase}/git/refs/heads/${BRANCH}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      sha: newCommitData.sha,
      force: false,
    }),
  });
  if (!updateRefRes.ok) {
    return { statusCode: 500, body: 'Fehler beim Aktualisieren des Branch-Refs' };
  }

  // Rückgabe der Bild-URL (relativ im Repo)
  return {
    statusCode: 200,
    body: JSON.stringify({ url: filename }),
    headers: { 'Content-Type': 'application/json' }
  };
};
