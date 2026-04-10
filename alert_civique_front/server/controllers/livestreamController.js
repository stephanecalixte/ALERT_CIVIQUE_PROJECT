const LiveStream = require('../models/livestream');

// Démarrer un live stream
const startStream = async (req, res) => {
  try {
    const { userId, facing } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId requis' });
    }

    // Vérifier s'il y a déjà un stream actif pour cet utilisateur
    const existingStream = await LiveStream.findOne({ userId, status: 'active' });
    if (existingStream) {
      console.log(`⚠️ User ${userId} already has an active stream: ${existingStream.livestreamId}`);
      return res.json({
        success: true,
        livestreamId: existingStream.livestreamId,
        startedAt: existingStream.startedAt,
        existing: true
      });
    }

    // Générer un nouvel ID unique
    const lastStream = await LiveStream.findOne().sort({ livestreamId: -1 });
    const livestreamId = lastStream ? lastStream.livestreamId + 1 : 1;

    const liveStream = new LiveStream({
      livestreamId,
      userId,
      facing: facing || 'back',
      startedAt: new Date(),
      status: 'active'
    });

    await liveStream.save();

    console.log(`✅ Live stream started: ${livestreamId} for user ${userId}`);

    res.json({
      success: true,
      livestreamId,
      startedAt: liveStream.startedAt
    });
  } catch (error) {
    console.error('❌ Error starting stream:', error);
    res.status(500).json({ error: 'Erreur lors du démarrage du stream' });
  }
};

// Terminer un live stream
const endStream = async (req, res) => {
  try {
    const { livestreamId, endedAt, duration } = req.body;

    if (!livestreamId) {
      return res.status(400).json({ error: 'livestreamId requis' });
    }

    const liveStream = await LiveStream.findOneAndUpdate(
      { livestreamId },
      {
        endedAt: endedAt ? new Date(endedAt) : new Date(),
        duration: duration || 0,
        status: 'ended'
      },
      { new: true }
    );

    if (!liveStream) {
      return res.status(404).json({ error: 'Stream non trouvé' });
    }

    console.log(`✅ Live stream ended: ${livestreamId} for user ${liveStream.userId}`);

    res.json({
      success: true,
      liveStream
    });
  } catch (error) {
    console.error('❌ Error ending stream:', error);
    res.status(500).json({ error: 'Erreur lors de l\'arrêt du stream' });
  }
};

// Mettre à jour un live stream
const updateStream = async (req, res) => {
  try {
    const { livestreamId, videoUrl, videoId } = req.body;

    if (!livestreamId) {
      return res.status(400).json({ error: 'livestreamId requis' });
    }

    const liveStream = await LiveStream.findOneAndUpdate(
      { livestreamId },
      { videoUrl, videoId },
      { new: true }
    );

    if (!liveStream) {
      return res.status(404).json({ error: 'Stream non trouvé' });
    }

    console.log(`✅ Live stream updated: ${livestreamId} with video ${videoId}`);

    res.json({
      success: true,
      liveStream
    });
  } catch (error) {
    console.error('❌ Error updating stream:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
};

// Lister les streams
const listStreams = async (req, res) => {
  try {
    const { userId, status, limit = 50 } = req.query;
    let query = {};

    if (userId) query.userId = userId;
    if (status) query.status = status;

    const streams = await LiveStream.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(streams);
  } catch (error) {
    console.error('Error listing streams:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des streams' });
  }
};

// Récupérer le stream actif d'un utilisateur
const getActiveStream = async (req, res) => {
  try {
    const stream = await LiveStream.findOne({
      userId: req.params.userId,
      status: 'active'
    });

    if (!stream) {
      return res.status(404).json({ error: 'Aucun stream actif trouvé' });
    }

    res.json(stream);
  } catch (error) {
    console.error('Error fetching active stream:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du stream actif' });
  }
};

// Récupérer un stream par ID
const getStreamById = async (req, res) => {
  try {
    const stream = await LiveStream.findOne({ livestreamId: parseInt(req.params.livestreamId) });
    if (!stream) {
      return res.status(404).json({ error: 'Stream non trouvé' });
    }
    res.json(stream);
  } catch (error) {
    console.error('Error fetching stream:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du stream' });
  }
};

module.exports = {
  startStream,
  endStream,
  updateStream,
  listStreams,
  getActiveStream,
  getStreamById
};