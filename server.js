import mongoose from "mongoose";

let isConnected = false;

// DB Connection
async function connectDB() {
  if (isConnected) return;
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = conn.connections[0].readyState === 1;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
}

// Schema + Model
const PostSchema = new mongoose.Schema(
  {
    content: String,
    image: String,
    video: String,
    link: String,
  },
  { timestamps: true }
);

const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);

// API Handler
export default async function handler(req, res) {
  await connectDB();
  const { method, query, body } = req;

  try {
    if (method === "GET") {
      if (query.id) {
        const post = await Post.findById(query.id);
        if (!post) return res.status(404).json({ success: false, error: "Not found" });
        return res.json({ success: true, data: post });
      }
      const posts = await Post.find().sort({ createdAt: -1 });
      return res.json({ success: true, data: posts });
    }

    if (method === "POST") {
      const post = new Post(body);
      await post.save();
      return res.status(201).json({ success: true, data: post });
    }

    if (method === "PUT") {
      const post = await Post.findByIdAndUpdate(query.id, body, { new: true });
      return res.json({ success: true, data: post });
    }

    if (method === "DELETE") {
      await Post.findByIdAndDelete(query.id);
      return res.json({ success: true });
    }

    return res.status(405).json({ success: false, error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
