// Schema + Model
const PostSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
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


