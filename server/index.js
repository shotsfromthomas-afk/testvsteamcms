import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import simpleGit from 'simple-git';
import path from 'path';

const app = express();
const PORT = 3001;
const git = simpleGit({ baseDir: path.resolve('../') });
const TEAM_FILE = path.resolve('../team.json');

app.use(cors());
app.use(bodyParser.json());

// Teamdaten abrufen
app.get('/api/team', (req, res) => {
  fs.readFile(TEAM_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Fehler beim Lesen der Teamdaten.' });
    res.json(JSON.parse(data));
  });
});

// Teamdaten speichern und pushen
app.post('/api/team', async (req, res) => {
  const team = req.body;
  try {
    fs.writeFileSync(TEAM_FILE, JSON.stringify(team, null, 2), 'utf8');
    await git.add('team.json');
    await git.commit('Teamdaten aktualisiert (CMS)');
    await git.push();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Fehler beim Speichern oder Pushen.' });
  }
});

app.listen(PORT, () => {
  console.log(`Team CMS Server läuft auf http://localhost:${PORT}`);
});
