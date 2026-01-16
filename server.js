// Server.js pour le backend
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Configuration de Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Route pour créer un nouvel article
app.post('/articles', async (req, res) => {
  try {
    const { title, summary, content, category, tags, sources, image, published } = req.body;

    const { data, error } = await supabase
      .from('articles')
      .insert([{ title, summary, content, category, tags, sources, image, published }])
      .select();

    if (error) {
      throw new Error(error.message);
    }

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour récupérer tous les articles publiés
app.get('/articles/published', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour récupérer tous les articles (y compris les brouillons)
app.get('/articles/all', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour mettre à jour un article
app.put('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, summary, content, category, tags, sources, image, published } = req.body;

    const { data, error } = await supabase
      .from('articles')
      .update({ title, summary, content, category, tags, sources, image, published })
      .eq('id', id)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour supprimer un article
app.delete('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes pour les images
// Upload image
app.post('/images', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

    // Save to database
    const { data: dbData, error: dbError } = await supabase
      .from('images')
      .insert([{ name: file.originalname, url: imageUrl }])
      .select();

    if (dbError) {
      throw new Error(dbError.message);
    }

    res.status(201).json(dbData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all images
app.get('/images', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete image
app.delete('/images/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete from db
    const { error } = await supabase
      .from('images')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes pour les utilisateurs
// Créer un utilisateur
app.post('/users', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const { data, error } = await supabase
      .from('users')
      .insert([{ username, email, password }])
      .select();

    if (error) {
      throw new Error(error.message);
    }

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
app.get('/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
