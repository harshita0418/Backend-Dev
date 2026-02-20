// Exercise 5: Photo gallery


const express = require('express');
const router  = express.Router();

const allPhotos = [
  { id: 1, src: '/images/nature1.jpg',   alt: 'Mountain Sunrise', tag: 'Nature'   },
  { id: 2, src: '/images/nature2.jpg',   alt: 'Forest Path',      tag: 'Nature'   },
  { id: 3, src: '/images/city1.jpg',     alt: 'City Skyline',     tag: 'Urban'    },
  { id: 4, src: '/images/city2.jpg',     alt: 'Night Market',     tag: 'Urban'    },
  { id: 5, src: '/images/animal1.jpg',   alt: 'Fox in Snow',      tag: 'Animals'  },
  { id: 6, src: '/images/abstract1.jpg', alt: 'Neon Reflections', tag: 'Abstract' },
];

const tags = [...new Set(allPhotos.map(p => p.tag))].sort();

router.get('/gallery', (req, res) => {
  const { tag } = req.query;
  const photos = tag ? allPhotos.filter(p => p.tag.toLowerCase() === tag.toLowerCase()) : allPhotos;
  res.render('gallery', { photos, tags, activeTag: tag || null });
});

module.exports = router;
