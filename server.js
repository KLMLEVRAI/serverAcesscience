// Server.js pour le backend
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configuration de Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Route pour créer un nouvel article
app.post('/articles', async (req, res) => {
  try {
    const { title, summary, content, category, tags, sources, published } = req.body;
    
    const { data, error } = await supabase
      .from('articles')
      .insert([{ title, summary, content, category, tags, sources, published }])
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
    const { title, summary, content, category, tags, sources, published } = req.body;
    
    const { data, error } = await supabase
      .from('articles')
      .update({ title, summary, content, category, tags, sources, published })
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

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
