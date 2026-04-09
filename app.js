import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// middleware
app.use(express.json());

/* =========================
   FORMULAS (ديناميكية)
========================= */
const formulas = {
  peinture: {
    rendement: 10, // 1L = 10m²
    couches: 2     // عدد الطبقات
  }
};

/* =========================
   ROOT
========================= */
app.get('/', (req, res) => {
  res.send('Server is working 🚀');
});

/* =========================
   GET /categories
========================= */
app.get('/categories', (req, res) => {
  res.json([
    {
      category_id: "1",
      name: "Travaux de Finition",
      description: "Finition works",
      is_active: true,
      parent_id: null,
      has_children: true
    }
  ]);
});

/* =========================
   GET /categories/:id
========================= */
app.get('/categories/:id', (req, res) => {
  const id = req.params.id;

  res.json({
    category_id: id,
    name: "Peinture",
    description: "Paint works",
    is_leaf: true,
    children: [],
    formulas: [
      {
        formula_id: "f1",
        output_label: "Base Area Yield",
        expression: "surface_nette / rendement"
      }
    ]
  });
});

/* =========================
   POST /calcul 🔥
========================= */
app.post('/calcul', (req, res) => {
  const { longueur, largeur, hauteur, portes, fenetres } = req.body;

  // ✅ Validation
  if (!longueur || !largeur || !hauteur) {
    return res.status(400).json({
      error: "Missing dimensions"
    });
  }

  // 1️⃣ surface sol
  const surface_brute = longueur * largeur;

  // 2️⃣ surface murs
  const surface_murs = 2 * (longueur + largeur) * hauteur;

  // 3️⃣ ouvertures
  const nb_portes = portes || 0;
  const nb_fenetres = fenetres || 0;

  const surface_porte = 2;     // m²
  const surface_fenetre = 1.5; // m²

  const surface_ouvertures =
    (nb_portes * surface_porte) +
    (nb_fenetres * surface_fenetre);

  // 4️⃣ surface nette
  const surface_nette = surface_murs - surface_ouvertures;

  // 5️⃣ FORMULE 🔥
  const formule = formulas.peinture;

  const rendement = formule.rendement;
  const couches = formule.couches;

  // 6️⃣ quantité théorique
  const quantite_theorique = (surface_nette / rendement) * couches;

  // 7️⃣ marge perte
  const marge_perte = 0.05;

  // 8️⃣ quantité finale
  const quantite_totale = quantite_theorique * (1 + marge_perte);

  // 9️⃣ arrondi
  const quantite_arrondie = Math.ceil(quantite_theorique);

  res.json({
    surface_brute,
    surface_murs,
    surface_ouvertures,
    surface_nette,
    quantite_theorique,
    quantite_arrondie,
    quantite_totale,
    unite: "Litres",
    formulas_applied: ["Peinture Formula"],
    detail: {
      portes: nb_portes,
      fenetres: nb_fenetres,
      rendement,
      couches,
      marge_perte
    }
  });
});

export default app;