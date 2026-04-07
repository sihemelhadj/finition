const pool = require('./config/db');

// Utilitaires réutilisables pour les catégories
const categorieService = {

  async findById(category_id) {
    const result = await pool.query(
      'SELECT * FROM categories WHERE category_id = $1',
      [category_id]
    );
    return result.rows[0] || null;
  },

  async findRoots() {
    const result = await pool.query(`
      SELECT *, EXISTS (
        SELECT 1 FROM categories c2 WHERE c2.parent_id = c.category_id
      ) AS has_children
      FROM categories c
      WHERE parent_id IS NULL AND is_active = TRUE
      ORDER BY sort_order ASC
    `);
    return result.rows;
  },

  async findChildren(parent_id) {
    const result = await pool.query(`
      SELECT category_id, name, icon, is_active, is_leaf
      FROM categories
      WHERE parent_id = $1 AND is_active = TRUE
      ORDER BY sort_order ASC
    `, [parent_id]);
    return result.rows;
  },
};

module.exports = categorieService;