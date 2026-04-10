const pool = require('../config/db');

// GET /categories — Liste des catégories racines actives
const getRootCategories = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        category_id,
        name,
        description,
        icon,
        is_active,
        parent_id,
        sort_order,
        EXISTS (
          SELECT 1 FROM categories c2 WHERE c2.parent_id = c.category_id
        ) AS has_children
      FROM categories c
      WHERE parent_id IS NULL AND is_active = TRUE
      ORDER BY sort_order ASC
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// GET /categories/:id — Détail d'une catégorie
const getCategoryById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const catResult = await pool.query(
      `SELECT * FROM categories WHERE category_id = $1`,
      [id]
    );

    if (catResult.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Catégorie introuvable.' });
    }

    const category = catResult.rows[0];

    if (category.is_leaf) {
      // Charger les formules associées
      const formulasResult = await pool.query(`
        SELECT f.formula_id, f.output_label, f.expression, f.unit_id
        FROM formulas f
        JOIN category_formulas cf ON cf.formula_id = f.formula_id
        WHERE cf.category_id = $1
      `, [id]);

      return res.json({
        ...category,
        children: [],
        formulas: formulasResult.rows,
      });
    } else {
      // Charger les sous-catégories
      const childrenResult = await pool.query(
        `SELECT category_id, name, icon, is_active, is_leaf FROM categories WHERE parent_id = $1 AND is_active = TRUE ORDER BY sort_order ASC`,
        [id]
      );

      return res.json({
        ...category,
        children: childrenResult.rows,
        formulas: [],
      });
    }
  } catch (err) {
    next(err);
  }
};

// GET /categories/:id/children — Enfants directs
const getCategoryChildren = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT category_id, name, icon, is_active, is_leaf
      FROM categories
      WHERE parent_id = $1 AND is_active = TRUE
      ORDER BY sort_order ASC
    `, [id]);

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

module.exports = { getRootCategories, getCategoryById, getCategoryChildren };