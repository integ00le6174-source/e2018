// ここにPDFの情報を追加していきます。
// file には pdfs フォルダ内のPDFファイル名を指定してください。

const PAPERS = [
    {
    id: "rep-2026-001",
    title: "線型代数の基礎：行列から行列式へ",
    authors: "e 2018",
    date: "2026-05-29",
    category: "Linear Algebra",
    version: "v1",
    abstract: "行列の基本操作、連立一次方程式、階数、正則性を中心に、行列式へ進む前段階を整理した準論文型レポート。",
    keywords: ["matrix", "rank", "linear algebra"],
    file: "pdfs/linear_algebra_basic_report.pdf"
  },
  {
    id: "rep-2026-002",
    title: "関数解析におけるHilbert空間の基礎:完備性・直行性・射影・表現定理から見るHilbert空間",
    authors: "e 2018",
    date: "2026-05-29",
    category: "Functional Analysis",
    version: "v1",
    abstract: "Hilbert空間の基本概念、完備性、直行性、射影、表現定理について解説した準論文型レポート。",
    keywords: ["Hilbert space", "complete space", "orthogonality", "projection", "representation theorem"],
    file: "pdfs/hilbert_space_report.pdf"
  },
  {
    id: "rep-2026-003",
    title: "微分積分学の基礎：極限・連続・微分から見る関数の性質",
    authors: "e 2018",
    date: "2026-05-29",
    category: "Calculus",
    version: "v1",
    abstract: "関数の極限、連続性、微分について解説した準論文型レポート。",
    keywords: ["limit", "continuity", "differentiation"],
    file: "pdfs/limits_continuity_differentiation_report.pdf"
  },
  {
    id: "rep-2026-004",
    title: "確率論の基礎：確率空間・確率変数・期待値から見る確率の性質",
    authors: "e 2018",
    date: "2026-05-29",
    category: "Probability Theory",
    version: "v1",
    abstract: "確率空間、確率変数、期待値について解説した準論文型レポート。",
    keywords: ["probability space", "random variable", "expectation"],
    file: "pdfs/probability_theory_report.pdf"  
  },
  {
    id: "rep-2026-005",
    title: "数値解析の基礎：数値計算・誤差解析・数値線形代数から見る数値解析の基本概念",
    authors: "e 2018",
    date: "2026-05-29",
    category: "Numerical Analysis",
    version: "v1",
    abstract: "数値計算、誤差解析、数値線形代数について解説した準論文型レポート。",
    keywords: ["numerical computation", "error analysis", "numerical linear algebra"],
    file: "pdfs/numerical_analysis_report.pdf" 
  },
  {
    id: "rep-2026-006",
    title: "微分方程式の基礎：常微分方程式・偏微分方程式から見る微分方程式の基本概念",
    authors: "e 2018",
    date: "2026-05-29",
    category: "Differential Equations",
    version: "v1",
    abstract: "常微分方程式、偏微分方程式について解説した準論文型レポート。",
    keywords: ["ordinary differential equations", "partial differential equations"],
    file: "pdfs/differential_equations_report.pdf"  
  },
  {
    id: "rep-2026-007",
    title: "複素解析の基礎：複素関数・正則関数・留数定理から見る複素解析の基本概念",
    authors: "e 2018",
    date: "2026-05-29",
    category: "Complex Analysis",
    version: "v1",
    abstract: "複素関数、正則関数、留数定理について解説した準論文型レポート。",
    keywords: ["complex function", "holomorphic function", "residue theorem"],
    file: "pdfs/complex_analysis_report.pdf"
  },
  {
    id: "rep-2026-008",
    title: "位相空間の基礎：開集合・閉集合・連続写像から見る位相空間の基本概念",
    authors: "e 2018",
    date: "2026-05-29",
    category: "Topology",
    version: "v1",
    abstract: "開集合、閉集合、連続写像について解説した準論文型レポート。",
    keywords: ["open set", "closed set", "continuous map"],
    file: "pdfs/topology_report.pdf"
  },
  {
    id: "rep-2026-009",
    title: "数理論理学の基礎：命題論理・述語論理・証明論から見る数理論理学の基本概念",
    authors: "e 2018",
    date: "2026-05-29",
    category: "Mathematical Logic",
    version: "v1",
    abstract: "命題論理、述語論理、証明論について解説した準論文型レポート。",
    keywords: ["propositional logic", "predicate logic", "proof theory"],
    file: "pdfs/mathematical_logic_report.pdf"
  },
  {
    id: "rep-2026-010",
    title: "数論の基礎：整数論・素数・合同式から見る数論の基本概念",
    authors: "e 2018",
    date: "2026-05-29",
    category: "Number Theory",
    version: "v1",
    abstract: "整数論、素数、合同式について解説した準論文型レポート。",
    keywords: ["integer theory", "prime numbers", "congruences"],
    file: "pdfs/number_theory_report.pdf"
  },
  {
    id: "rep-2026-011",
    title: "組合せ論の基礎：順列・組合せ・グラフ理論から見る組合せ論の基本概念",
    authors: "e 2018",
    date: "2026-05-29",
    category: "Combinatorics",
    version: "v1",
    abstract: "順列、組合せ、グラフ理論について解説した準論文型レポート。",
    keywords: ["permutations", "combinations", "graph theory"],
    file: "pdfs/combinatorics_report.pdf"
  },
  {
    id: "rep-2026-012",
    title: "代数幾何の基礎：多様体・射影空間・シェーマから見る代数幾何の基本概念",
    authors: "e 2018",
    date: "2026-05-29",
    category: "Algebraic Geometry",
    version: "v1",
    abstract: "多様体、射影空間、シェーマについて解説した準論文型レポート。",
    keywords: ["variety", "projective space", "scheme"],
    file: "pdfs/algebraic_geometry_report.pdf"
  },
  {
    id: "rep-2026-013",
    title: "微分幾何の基礎：曲率・接続・リーマン幾何から見る微分幾何の基本概念",
    authors: "e 2018",
    date: "2026-05-29",
    category: "Differential Geometry",
    version: "v1",
    abstract: "曲率、接続、リーマン幾何について解説した準論文型レポート。",
    keywords: ["curvature", "connection", "Riemannian geometry"],
    file: "pdfs/differential_geometry_report.pdf"
  },
  {
    id: "rep-2026-014",
    title: "代数トポロジーの基礎：ホモロジー・コホモロジー・基本群から見る代数トポロジーの基本概念",
    authors: "e 2018",
    date: "2026-05-29",
    category: "Algebraic Topology",
    version: "v1",
    abstract: "ホモロジー、コホモロジー、基本群について解説した準論文型レポート。",
    keywords: ["homology", "cohomology", "fundamental group"],
    file: "pdfs/algebraic_topology_report.pdf"
  },
  {
    id: "rep-2026-015",
    title: "数値線形代数の基礎：行列分解・固有値問題・反復法から見る数値線形代数の基本概念",
    authors: "e 2018",
    date: "2026-05-29",
    category: "Numerical Linear Algebra",
    version: "v1",
    abstract: "行列分解、固有値問題、反復法について解説した準論文型レポート。",
    keywords: ["matrix decomposition", "eigenvalue problem", "iterative methods"],
    file: "pdfs/numerical_linear_algebra_report.pdf"
  },
  {
    id: "rep-2026-016",
    title: "最適化の基礎：線形計画法・非線形最適化・整数計画法から見る最適化の基本概念",
    authors: "e 2018",
    date: "2026-05-29",
    category: "Optimization",
    version: "v1",
    abstract: "線形計画法、非線形最適化、整数計画法について解説した準論文型レポート。",
    keywords: ["linear programming", "nonlinear optimization", "integer programming"],
    file: "pdfs/optimization_report.pdf"
  },
  {
    id: "rep-2026-017",
    title: "確率過程の基礎：マルコフ過程・ブラウン運動・確率微分方程式から見る確率過程の基本概念",
    authors: "e 2018",
    date: "2026-05-29",
    category: "Stochastic Processes",
    version: "v1",
    abstract: "マルコフ過程、ブラウン運動、確率微分方程式について解説した準論文型レポート。",
    keywords: ["Markov process", "Brownian motion", "stochastic differential equations"],
    file: "pdfs/stochastic_processes_report.pdf"
  },
  {
    id: "rep-2026-018",
    title: "数理物理学の基礎：量子力学・統計力学・場の理論から見る数理物理学の基本概念",
    authors: "e 2018",
    date: "2026-05-29",
    category: "Mathematical Physics",
    version: "v1",
    abstract: "量子力学、統計力学、場の理論について解説した準論文型レポート。",
    keywords: ["quantum mechanics", "statistical mechanics", "field theory"],
    file: "pdfs/mathematical_physics_report.pdf"
  },
  {
    id: "rep-2026-019",
    title: "数理生物学の基礎：人口動態・進化・生態系から見る数理生物学の基本概念",
    authors: "e 2018",
    date: "2026-05-29",
    category: "Mathematical Biology",
    version: "v1",
    abstract: "人口動態、進化、生態系について解説した準論文型レポート。",
    keywords: ["population dynamics", "evolution", "ecosystems"],
    file: "pdfs/mathematical_biology_report.pdf"
  },
  {
    id: "rep-2026-020",
    title: "数理経済学の基礎：ゲーム理論・一般均衡・最適成長から見る数理経済学の基本概念",
    authors: "e 2018",
    date: "2026-05-29",
    category: "Mathematical Economics",
    version: "v1",
    abstract: "ゲーム理論、一般均衡、最適成長について解説した準論文型レポート。",
    keywords: ["game theory", "general equilibrium", "optimal growth"],
    file: "pdfs/mathematical_economics_report.pdf"
  },
  {
    id: "rep-2026-021",
    title: "数理金融の基礎：オプション価格・リスク管理・ポートフォリオ理論から見る数理金融の基本概念",
    authors: "e 2018",
    date: "2026-05-29",
    category: "Mathematical Finance",
    version: "v1",
    abstract: "オプション価格、リスク管理、ポートフォリオ理論について解説した準論文型レポート。",
    keywords: ["option pricing", "risk management", "portfolio theory"],
    file: "pdfs/mathematical_finance_report.pdf"
  },
  {
    id: "rep-2026-022",
    title: "数理統計学の基礎：推定・検定・回帰分析から見る数理統計学の基本概念",
    authors: "e 2018",
    date: "2026-05-29",
    category: "Mathematical Statistics",
    version: "v1",
    abstract: "推定、検定、回帰分析について解説した準論文型レポート。",
    keywords: ["estimation", "hypothesis testing", "regression analysis"],
    file: "pdfs/mathematical_statistics_report.pdf"
  },
  {
    id: "rep-2026-023",
    title: "数理情報学の基礎：アルゴリズム・データ構造・計算複雑性から見る数理情報学の基本概念",
    authors: "e 2018",
    date: "2026-05-29",
    category: "Mathematical Informatics",
    version: "v1",
    abstract: "アルゴリズム、データ構造、計算複雑性について解説した準論文型レポート。",
    keywords: ["algorithms", "data structures", "computational complexity"],
    file: "pdfs/mathematical_informatics_report.pdf"
  },
  {
    id: "rep-2026-024",
    title: "数理工学の基礎：制御理論・信号処理・情報理論から見る数理工学の基本概念",
    authors: "e 2018",
    date: "2026-05-29",
    category: "Mathematical Engineering",
    version: "v1",
    abstract: "制御理論、信号処理、情報理論について解説した準論文型レポート。",
    keywords: ["control theory", "signal processing", "information theory"],
    file: "pdfs/mathematical_engineering_report.pdf"
  }
];
