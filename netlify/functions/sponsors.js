const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO = 'shotsfromthomas-afk/testvsteamcms';
  const FILE_PATH = 'sponsors.json';
  const BRANCH = 'main';

  if (!GITHUB_TOKEN) {
    return {
      statusCode: 500,
      body: 'GitHub Token fehlt',
    };
  }

  // Stelle sicher, dass der Body als JSON gespeichert wird
  let sponsorsData;
  try {
    sponsorsData = JSON.stringify(JSON.parse(event.body), null, 2);
  } catch (e) {
    return {
      statusCode: 400,
      body: 'Ungültiges JSON im Request-Body',
    };
  }

  // 1. Hole den aktuellen Commit SHA und tree SHA
  const apiBase = `https://api.github.com/repos/${REPO}`;
  const headers = {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  // Hole den aktuellen Commit SHA
  const refRes = await fetch(`${apiBase}/git/refs/heads/${BRANCH}`, { headers });
  if (!refRes.ok) {
    return { statusCode: 500, body: 'Fehler beim Lesen des Branch-Refs' };
  }
  const refData = await refRes.json();
  const latestCommitSha = refData.object.sha;

  // Hole den Commit selbst (um tree SHA zu bekommen)
  const commitRes = await fetch(`${apiBase}/git/commits/${latestCommitSha}`, { headers });
  if (!commitRes.ok) {
    return { statusCode: 500, body: 'Fehler beim Lesen des Commits' };
  }
  const commitData = await commitRes.json();
  const baseTreeSha = commitData.tree.sha;

  // 2. Erstelle einen neuen Blob für die Datei
  const blobRes = await fetch(`${apiBase}/git/blobs`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      content: sponsorsData,
      encoding: 'utf-8',
    }),
  });
  if (!blobRes.ok) {
    return { statusCode: 500, body: 'Fehler beim Erstellen des Blobs' };
  }
  const blobData = await blobRes.json();

  // 3. Erstelle einen neuen Tree mit dem neuen Blob
  const treeRes = await fetch(`${apiBase}/git/trees`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: [
        {
          path: FILE_PATH,
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

  // 4. Erstelle einen neuen Commit
  const commitMsg = 'Sponsoren via Netlify CMS aktualisiert';
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

  // 5. Update den Branch-Ref
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

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true }),
  };
};
