const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO = process.env.REPO || 'shotsfromthomas-afk/testvsteamcms';
  const FILE_PATH = 'sponsors.json';
  const BRANCH = process.env.BRANCH || 'main';

  if (!GITHUB_TOKEN) {
    return {
      statusCode: 500,
      body: 'GitHub token not configured',
    };
  }

  const body = event.body;
  const content = Buffer.from(body).toString('base64');

  // Get the current file SHA
  const getRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`, {
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  const getData = await getRes.json();
  const sha = getData.sha;

  // Commit the new file
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      message: 'Update sponsors.json via Netlify Function',
      content,
      sha,
      branch: BRANCH,
    }),
  });

  if (res.ok) {
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } else {
    const error = await res.text();
    return {
      statusCode: 500,
      body: error,
    };
  }
};
