const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// JSON file-based storage
const DATA_FILE = process.env.DATA_FILE || './data.json';

// Initialize data structure
let data = {
  articles: [],
  users: [],
  subscribers: []
};

// Load data from file
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
      data = JSON.parse(fileContent);
      console.log('Data loaded from file');
    } else {
      initializeDefaultData();
      saveData();
    }
  } catch (error) {
    console.error('Error loading data:', error);
    initializeDefaultData();
  }
}

// Save data to file
function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Initialize with default data
function initializeDefaultData() {
  data.articles = [
    {
      id: '1',
      title: 'La photosynthèse : le secret de la vie végétale',
      summary: 'Découvrez comment les plantes transforment la lumière du soleil en énergie chimique.',
      content: [
        { id: '1', type: 'paragraph', content: 'La photosynthèse est un processus biologique fondamental qui permet aux plantes de convertir l\'énergie lumineuse en énergie chimique.' },
        { id: '2', type: 'heading', content: 'Le processus en détail', level: 2 },
        { id: '3', type: 'paragraph', content: 'La photosynthèse se déroule dans les chloroplastes des cellules végétales.' },
      ],
      category: 'Biologie',
      tags: ['photosynthèse', 'plantes', 'oxygène'],
      sources: [
        { id: '1', type: 'url', value: 'https://www.cea.fr/comprendre/Pages/physique-chimie/photosynthese.aspx', title: 'CEA - La photosynthèse' },
      ],
      status: 'published',
      createdAt: '2024-11-15T10:00:00Z',
      updatedAt: '2024-11-15T10:00:00Z',
      imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
    },
    {
      id: '2',
      title: 'Les énergies renouvelables : un avenir durable',
      summary: 'Explorez les différentes sources d\'énergies renouvelables.',
      content: [
        { id: '1', type: 'paragraph', content: 'Les énergies renouvelables sont des sources d\'énergie qui se renouvellent naturellement.' },
        { id: '2', type: 'heading', content: 'Les principales sources', level: 2 },
        { id: '3', type: 'list', content: 'Types d\'énergies renouvelables', items: ['Énergie solaire', 'Énergie éolienne', 'Énergie hydraulique'] },
      ],
      category: 'Environnement',
      tags: ['énergies renouvelables', 'climat'],
      sources: [
        { id: '1', type: 'url', value: 'https://www.ademe.fr/', title: 'ADEME' },
      ],
      status: 'published',
      createdAt: '2024-11-20T14:30:00Z',
      updatedAt: '2024-11-20T14:30:00Z',
      imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80',
    },
    {
      id: '3',
      title: 'L\'ADN : le code de la vie',
      summary: 'Plongez dans le monde fascinant de l\'ADN.',
      content: [
        { id: '1', type: 'paragraph', content: 'L\'acide désoxyribonucléique (ADN) est une molécule présente dans toutes les cellules vivantes.' },
        { id: '2', type: 'heading', content: 'Structure de la double hélice', level: 2 },
        { id: '3', type: 'paragraph', content: 'Découverte en 1953 par James Watson et Francis Crick.' },
      ],
      category: 'Génétique',
      tags: ['ADN', 'génétique'],
      sources: [
        { id: '1', type: 'url', value: 'https://www.inserm.fr/', title: 'INSERM' },
      ],
      status: 'published',
      createdAt: '2024-11-25T09:15:00Z',
      updatedAt: '2024-11-25T09:15:00Z',
      imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80',
    }
  ];

  data.users = [
    { id: '1', name: 'Élève 1 - 3eB', role: 'admin', active: true, createdAt: '2024-09-01T08:00:00Z' },
    { id: '2', name: 'Élève 2 - 3eB', role: 'admin', active: true, createdAt: '2024-09-01T08:00:00Z' },
    { id: '3', name: 'Élève 3 - 3eB', role: 'admin', active: true, createdAt: '2024-09-01T08:00:00Z' },
  ];

  data.subscribers = [];
  console.log('Default data initialized');
}

// Middleware
app.use(cors());
app.use(express.json());

// API Routes

// Articles
app.get('/api/articles', (req, res) => {
  const sortedArticles = [...data.articles].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json(sortedArticles);
});

app.get('/api/articles/:id', (req, res) => {
  const article = data.articles.find(a => a.id === req.params.id);
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }
  res.json(article);
});

app.post('/api/articles', (req, res) => {
  const now = new Date().toISOString();
  const newArticle = {
    id: Date.now().toString(),
    title: req.body.title,
    summary: req.body.summary,
    content: req.body.content,
    category: req.body.category,
    tags: req.body.tags,
    sources: req.body.sources,
    imageUrl: req.body.imageUrl || null,
    status: req.body.status || 'draft',
    createdAt: now,
    updatedAt: now,
  };
  
  data.articles.push(newArticle);
  saveData();
  res.status(201).json(newArticle);
});

app.put('/api/articles/:id', (req, res) => {
  const index = data.articles.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Article not found' });
  }
  
  data.articles[index] = {
    ...data.articles[index],
    title: req.body.title,
    summary: req.body.summary,
    content: req.body.content,
    category: req.body.category,
    tags: req.body.tags,
    sources: req.body.sources,
    imageUrl: req.body.imageUrl || null,
    status: req.body.status,
    updatedAt: new Date().toISOString(),
  };
  
  saveData();
  res.json(data.articles[index]);
});

app.delete('/api/articles/:id', (req, res) => {
  const index = data.articles.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Article not found' });
  }
  
  data.articles.splice(index, 1);
  saveData();
  res.json({ message: 'Article deleted successfully' });
});

// Users
app.get('/api/users', (req, res) => {
  const sortedUsers = [...data.users].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json(sortedUsers);
});

app.put('/api/users/:id', (req, res) => {
  const index = data.users.findIndex(u => u.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  data.users[index].active = !data.users[index].active;
  saveData();
  res.json(data.users[index]);
});

// Subscribers
app.get('/api/subscribers', (req, res) => {
  const sortedSubscribers = [...data.subscribers].sort((a, b) => 
    new Date(b.subscribedAt) - new Date(a.subscribedAt)
  );
  res.json(sortedSubscribers);
});

app.post('/api/subscribers', (req, res) => {
  const newSubscriber = {
    id: Date.now().toString(),
    email: req.body.email,
    frequency: req.body.frequency,
    active: true,
    subscribedAt: new Date().toISOString(),
  };
  
  data.subscribers.push(newSubscriber);
  saveData();
  res.status(201).json(newSubscriber);
});

// Export data
app.get('/api/export', (req, res) => {
  res.json({
    articles: data.articles,
    users: data.users,
    subscribers: data.subscribers,
    exportedAt: new Date().toISOString(),
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Load data and start server
loadData();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
