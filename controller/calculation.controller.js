const pool = require('../config/db');
const calculationEngine = require('../service/calculationEngine.service');

// POST /calcul
const calculate = async (req, res, next) => {
  const { category_id, longueur, largeur, hauteur, project_id, save } = req.body;

  // Validation
  if (!category_id || longueur == null || largeur == null || hauteur == null) {
    return res.status(400).json({
      error: 'BAD_REQUEST',
      message: 'Les champs category_id, longueur, largeur et hauteur sont requis.',
    });
  }

  if (longueur <= 0 || largeur <= 0 || hauteur <= 0) {
    return res.status(422).json({
      error: 'UNPROCESSABLE',
      message: 'Les dimensions doivent être strictement positives.',
    });
  }

  try {
    // Vérifier que la catégorie est une feuille
    const catResult = await pool.query(
      `SELECT * FROM categories WHERE category_id = $1 AND is_leaf = TRUE`,
      [category_id]
    );

    if (catResult.rows.length === 0) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Catégorie feuille introuvable.',
      });
    }

    // Lancer le Calculation Engine
    const result = await calculationEngine.run({
      category_id,
      longueur: parseFloat(longueur),
      largeur: parseFloat(largeur),
      hauteur: parseFloat(hauteur),
      project_id: project_id || null,
      save: save === true,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// GET /formulas
const getFormulas = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT f.formula_id, f.output_label, f.expression, f.unit_id, f.output_unit
      FROM formulas f
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// GET /formulas/:id/fields
const getFormulaFields = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT field_id, label, field_type, unit, required, default_value
      FROM formula_fields
      WHERE formula_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Formule introuvable.' });
    }

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

module.exports = { calculate, getFormulas, getFormulaFields };