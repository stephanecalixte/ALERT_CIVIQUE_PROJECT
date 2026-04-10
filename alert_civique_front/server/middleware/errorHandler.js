const multer = require('multer');

const errorHandler = (err, req, res, next) => {
  console.error('❌ Global error handler:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Fichier trop volumineux. Maximum 100MB' });
    }
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: err.message
  });
};

const notFound = (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.path,
    method: req.method
  });
};

module.exports = { errorHandler, notFound };