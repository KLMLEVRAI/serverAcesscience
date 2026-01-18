// Server.js pour le backend
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const crypto = require('crypto');
const https = require('https');

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

// Configuration Brevo pour les emails
const brevoApiKey = process.env.BREVO_API_KEY || '';
const brevoApiUrl = 'https://api.brevo.com/v3/smtp/email';

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

// Route pour incrémenter les vues d'un article
app.put('/articles/:id/view', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('articles')
      .update({ views: supabase.raw('views + 1') })
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

// Authentification gérée par Firebase (email/mot de passe) et Supabase (Google OAuth)

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

// Update user profile
app.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, profile_pic, description } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({ username, email, profile_pic, description })
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

// Routes pour les favoris
// Ajouter un favori
app.post('/favorites', async (req, res) => {
  try {
    const { user_id, article_id } = req.body;

    const { data, error } = await supabase
      .from('favorites')
      .insert([{ user_id, article_id }])
      .select();

    if (error) {
      throw new Error(error.message);
    }

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get favorites for user
app.get('/favorites/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('favorites')
      .select('*, articles(*)')
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete favorite
app.delete('/favorites/:userId/:articleId', async (req, res) => {
  try {
    const { userId, articleId } = req.params;

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('article_id', articleId);

    if (error) {
      throw new Error(error.message);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes pour les commentaires
// Ajouter un commentaire
app.post('/comments', async (req, res) => {
  try {
    const { user_id, article_id, content } = req.body;

    const { data, error } = await supabase
      .from('comments')
      .insert([{ user_id, article_id, content }])
      .select('*, users(username)');

    if (error) {
      throw new Error(error.message);
    }

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get comments for article
app.get('/comments/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;

    const { data, error } = await supabase
      .from('comments')
      .select('*, users(username, profile_pic)')
      .eq('article_id', articleId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete comment
app.delete('/comments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('comments')
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

// Routes pour les notations
// Ajouter ou mettre à jour une notation
app.post('/ratings', async (req, res) => {
  try {
    const { user_id, article_id, rating } = req.body;

    const { data, error } = await supabase
      .from('ratings')
      .upsert([{ user_id, article_id, rating }])
      .select();

    if (error) {
      throw new Error(error.message);
    }

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get average rating for article
app.get('/ratings/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;

    const { data, error } = await supabase
      .from('ratings')
      .select('rating')
      .eq('article_id', articleId);

    if (error) {
      throw new Error(error.message);
    }

    const average = data.length > 0 ? data.reduce((sum, r) => sum + r.rating, 0) / data.length : 0;
    res.json({ average: Math.round(average * 10) / 10, count: data.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
