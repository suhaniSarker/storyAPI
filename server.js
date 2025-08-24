import mongoose from "mongoose";
import { connectDB } from "./connectDB"; // make sure connectDB.js exists

// ---------------- Schema + Model ----------------
const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author_code: String,
    tags: [String],
    blog_code: String,
    meta_title: String,
    meta_description: String,
    meta_keywords: String,
    status: { type: String, default: "draft" },
    image: String,
    video: String,
    link: String
  },
  { timestamps: true }
);

// Force collection name = "mature"
const Post = mongoose.models.storyDB || mongoose.model("storyDB", PostSchema, "mature");

// ---------------- API Handler ----------------
export default async function handler(req, res) {
  try {
    await connectDB(); // Safe DB connection
  } catch (err) {
    console.error("DB Connection Error:", err);
    return res.status(500).json({ success: false, error: "Database connection failed" });
  }

  const { method, query, body } = req;

  try {
    switch (method) {
      case "GET":
        if (query.id) {
          const post = await Post.findById(query.id);
          if (!post) return res.status(404).json({ success: false, error: "Post not found" });
          return res.json({ success: true, data: post });
        }
        const posts = await Post.find().sort({ createdAt: -1 });
        return res.json({ success: true, data: posts });

      case "POST":
        if (!body.title || !body.content) {
          return res.status(400).json({ success: false, error: "Title and content are required" });
        }
        const newPost = new Post(body);
        await newPost.save();
        return res.status(201).json({ success: true, data: newPost });

      case "PUT":
        if (!query.id) return res.status(400).json({ success: false, error: "ID is required" });
        const updatedPost = await Post.findByIdAndUpdate(query.id, body, { new: true });
        if (!updatedPost) return res.status(404).json({ success: false, error: "Post not found" });
        return res.json({ success: true, data: updatedPost });

      case "DELETE":
        if (!query.id) return res.status(400).json({ success: false, error: "ID is required" });
        const deletedPost = await Post.findByIdAndDelete(query.id);
        if (!deletedPost) return res.status(404).json({ success: false, error: "Post not found" });
        return res.json({ success: true, data: deletedPost });

      default:
        return res.status(405).json({ success: false, error: "Method not allowed" });
    }
  } catch (err) {
    console.error("Function Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
