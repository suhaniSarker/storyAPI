const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

// ================== DATABASE CONNECTION ==================
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ================== SCHEMA & MODEL ==================
const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  image: String,
  video: String,
  link: String
}, { timestamps: true });

const Post = mongoose.model("Post", PostSchema);

// ================== CRUD ROUTES ==================

// CREATE a post
app.post('/api/posts', async (req, res) => {
  try {
    const post = new Post(req.body);
    await post.save();
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// READ ALL posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// READ ONE post by ID
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: "Post not found" });
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE a post
app.put('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!post) return res.status(404).json({ success: false, error: "Post not found" });
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE a post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: "Post not found" });
    res.json({ success: true, message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================== START SERVER ==================
// (In Vercel, this part is ignored, only used in local dev)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));