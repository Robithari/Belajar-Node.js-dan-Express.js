const express = require("express");
const router = express.Router();
const db = require("../config/firebase"); // Pastikan ini ditambahkan!
const articleController = require("../controllers/articleController");

// Rute untuk menambahkan artikel baru (POST /api/articles)
router.post("/", articleController.addArticle);

// Rute untuk mengambil semua artikel (GET /api/articles)
router.get("/", articleController.getAllArticles);

// Rute untuk mengambil artikel berdasarkan slug (GET /api/articles/:slug)
router.get("/:slug", articleController.getArticleBySlug);

// Rute untuk memperbarui artikel berdasarkan ID (PUT /api/articles/:id)
router.put("/:id", articleController.updateArticle);

// Rute untuk menghapus artikel berdasarkan ID (DELETE /api/articles/:id)
router.delete("/:id", articleController.deleteArticle);

// ✅ **Rute tambahan: Tampilkan artikel berdasarkan slug di website**
router.get("/view/:slug", async (req, res) => {
  try {
    const q = db.collection("articles").where("slug", "==", req.params.slug);
    const snapshot = await q.get();

    if (snapshot.empty) {
      return res.status(404).send("<h1>Artikel tidak ditemukan!</h1>");
    }

    const article = snapshot.docs[0].data();
    res.render("article", { article });
  } catch (error) {
    res.status(500).send(`<h1>Terjadi kesalahan: ${error.message}</h1>`);
  }
});

// **JANGAN letakkan `module.exports = router;` sebelum rute ini!**
module.exports = router;
