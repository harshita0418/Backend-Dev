const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

mongoose
.connect("mongodb://localhost:27017/ecommerce")
.then(()=> console.log("Connected to MongoDB"))
.catch((err) => console.error("Could not connect to MongoDB", err));

const softDeletePlugin = (schema) => {
  schema.add({
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: String, default: null },
  });

  const filterDeleted = function (next) {
    if (!this._withDeleted) {
      this.where({ isDeleted: false });
    }
    next();
  };

  schema.pre('find', filterDeleted);
  schema.pre('findOne', filterDeleted);
  schema.pre('countDocuments', filterDeleted);
  schema.pre('findOneAndUpdate', filterDeleted);

  schema.statics.findWithDeleted = function (filter = {}) {
    const query = this.find(filter);
    query._withDeleted = true;
    return query;
  };

  schema.statics.findOneWithDeleted = function (filter = {}) {
    const query = this.findOne(filter);
    query._withDeleted = true;
    return query;
  };

  schema.methods.softDelete = async function (deletedBy = null) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
    return this.save();
  };

  schema.methods.restore = async function () {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    return this.save();
  };
};

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
}, { timestamps: true });

postSchema.plugin(softDeletePlugin);

const Post = mongoose.model('Post', postSchema);

app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json({ total: posts.length, data: posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/posts/deleted', async (req, res) => {
  try {
    const posts = await Post.findWithDeleted({ isDeleted: true });
    res.json({ total: posts.length, data: posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/posts', async (req, res) => {
  try {
    const { title, content, author } = req.body;
    if (!title || !content || !author)
      return res.status(400).json({ error: 'title, content, and author are required' });
    const post = await Post.create({ title, content, author });
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const { title, content, author } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;
    if (author) post.author = author;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const deletedBy = req.headers['x-user'] || 'anonymous';
    await post.softDelete(deletedBy);
    res.json({
      message: 'Post soft-deleted',
      deletedAt: post.deletedAt,
      deletedBy: post.deletedBy,
      restore: `POST /posts/${post._id}/restore`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/posts/:id/restore', async (req, res) => {
  try {
    const post = await Post.findOneWithDeleted({ _id: req.params.id, isDeleted: true });
    if (!post) return res.status(404).json({ error: 'Deleted post not found' });
    await post.restore();
    res.json({ message: 'Post restored', post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3004, () => {
  console.log('port running on 3004');
});