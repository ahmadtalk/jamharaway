-- ============================================================
-- Jamhara — Migration 002: Seed Categories
-- 24 main categories + 120 subcategories
-- ============================================================

-- Helper: insert main categories first, then subs referencing them
DO $$
DECLARE
  -- Main category IDs
  c_philosophy   UUID := uuid_generate_v4();
  c_religions    UUID := uuid_generate_v4();
  c_history      UUID := uuid_generate_v4();
  c_geography    UUID := uuid_generate_v4();
  c_politics     UUID := uuid_generate_v4();
  c_economics    UUID := uuid_generate_v4();
  c_business     UUID := uuid_generate_v4();
  c_law          UUID := uuid_generate_v4();
  c_ai           UUID := uuid_generate_v4();
  c_computing    UUID := uuid_generate_v4();
  c_mathematics  UUID := uuid_generate_v4();
  c_physics      UUID := uuid_generate_v4();
  c_space        UUID := uuid_generate_v4();
  c_chemistry    UUID := uuid_generate_v4();
  c_biology      UUID := uuid_generate_v4();
  c_medicine     UUID := uuid_generate_v4();
  c_environment  UUID := uuid_generate_v4();
  c_sociology    UUID := uuid_generate_v4();
  c_psychology   UUID := uuid_generate_v4();
  c_linguistics  UUID := uuid_generate_v4();
  c_literature   UUID := uuid_generate_v4();
  c_arts         UUID := uuid_generate_v4();
  c_design       UUID := uuid_generate_v4();
  c_media        UUID := uuid_generate_v4();
BEGIN

-- ============================================================
-- MAIN CATEGORIES
-- ============================================================
INSERT INTO categories (id, name_ar, name_en, slug, color, sort_order) VALUES
  (c_philosophy,  'الفلسفة',   'Philosophy',           'philosophy',   '#7C3AED', 1),
  (c_religions,   'الأديان',   'Religions',            'religions',    '#B45309', 2),
  (c_history,     'التاريخ',   'History',              'history',      '#92400E', 3),
  (c_geography,   'الجغرافيا', 'Geography',            'geography',    '#065F46', 4),
  (c_politics,    'السياسة',   'Politics',             'politics',     '#1D4ED8', 5),
  (c_economics,   'الاقتصاد',  'Economics',            'economics',    '#047857', 6),
  (c_business,    'الأعمال',   'Business',             'business',     '#0369A1', 7),
  (c_law,         'القانون',   'Law',                  'law',          '#6B21A8', 8),
  (c_ai,          'الذكاء الاصطناعي', 'Artificial Intelligence', 'ai', '#0F172A', 9),
  (c_computing,   'الحوسبة',   'Computing',            'computing',    '#1E3A5F', 10),
  (c_mathematics, 'الرياضيات', 'Mathematics',          'mathematics',  '#7E22CE', 11),
  (c_physics,     'الفيزياء',  'Physics',              'physics',      '#1E40AF', 12),
  (c_space,       'الفضاء',    'Space',                'space',        '#0C0A3E', 13),
  (c_chemistry,   'الكيمياء',  'Chemistry',            'chemistry',    '#14532D', 14),
  (c_biology,     'الأحياء',   'Biology',              'biology',      '#166534', 15),
  (c_medicine,    'الطب',      'Medicine',             'medicine',     '#BE123C', 16),
  (c_environment, 'البيئة',    'Environment',          'environment',  '#4CB36C', 17),
  (c_sociology,   'الاجتماع',  'Sociology',            'sociology',    '#9D174D', 18),
  (c_psychology,  'علم النفس', 'Psychology',           'psychology',   '#6D28D9', 19),
  (c_linguistics, 'اللسانيات', 'Linguistics',          'linguistics',  '#0891B2', 20),
  (c_literature,  'الأدب',     'Literature',           'literature',   '#92400E', 21),
  (c_arts,        'الفنون',    'Arts',                 'arts',         '#BE185D', 22),
  (c_design,      'التصميم',   'Design',               'design',       '#7C3AED', 23),
  (c_media,       'الإعلام',   'Media',                'media',        '#1D4ED8', 24);

-- ============================================================
-- SUBCATEGORIES
-- ============================================================
INSERT INTO categories (id, name_ar, name_en, slug, parent_id, color, sort_order) VALUES
  -- 1. الفلسفة
  (uuid_generate_v4(), 'الميتافيزيقا',  'Metaphysics',    'metaphysics',    c_philosophy,  '#7C3AED', 1),
  (uuid_generate_v4(), 'الإبستمولوجيا', 'Epistemology',   'epistemology',   c_philosophy,  '#7C3AED', 2),
  (uuid_generate_v4(), 'المنطق',         'Logic',          'logic',          c_philosophy,  '#7C3AED', 3),
  (uuid_generate_v4(), 'الأخلاقيات',    'Ethics',         'ethics',         c_philosophy,  '#7C3AED', 4),
  (uuid_generate_v4(), 'الجماليات',     'Aesthetics',     'aesthetics',     c_philosophy,  '#7C3AED', 5),

  -- 2. الأديان
  (uuid_generate_v4(), 'اللاهوت',       'Theology',       'theology',       c_religions,   '#B45309', 1),
  (uuid_generate_v4(), 'الميثولوجيا',   'Mythology',      'mythology',      c_religions,   '#B45309', 2),
  (uuid_generate_v4(), 'الإبراهيميات',  'Abrahamic',      'abrahamic',      c_religions,   '#B45309', 3),
  (uuid_generate_v4(), 'الشرقيات',      'Eastern',        'eastern',        c_religions,   '#B45309', 4),
  (uuid_generate_v4(), 'الطقوس',        'Rituals',        'rituals',        c_religions,   '#B45309', 5),

  -- 3. التاريخ
  (uuid_generate_v4(), 'القديم',        'Antiquity',      'antiquity',      c_history,     '#92400E', 1),
  (uuid_generate_v4(), 'الوسيط',        'Middle-Ages',    'middle-ages',    c_history,     '#92400E', 2),
  (uuid_generate_v4(), 'الحديث',        'Modernity',      'modernity',      c_history,     '#92400E', 3),
  (uuid_generate_v4(), 'المعاصر',       'Contemporary',   'contemporary',   c_history,     '#92400E', 4),
  (uuid_generate_v4(), 'الآثار',        'Archaeology',    'archaeology',    c_history,     '#92400E', 5),

  -- 4. الجغرافيا
  (uuid_generate_v4(), 'التضاريس',      'Topography',     'topography',     c_geography,   '#065F46', 1),
  (uuid_generate_v4(), 'المناخ',        'Climate',        'climate',        c_geography,   '#065F46', 2),
  (uuid_generate_v4(), 'الديموغرافيا',  'Demography',     'demography',     c_geography,   '#065F46', 3),
  (uuid_generate_v4(), 'الجيوبوليتيك',  'Geopolitics',    'geopolitics',    c_geography,   '#065F46', 4),
  (uuid_generate_v4(), 'الخرائطيات',    'Cartography',    'cartography',    c_geography,   '#065F46', 5),

  -- 5. السياسة
  (uuid_generate_v4(), 'النظم',         'Systems',        'systems',        c_politics,    '#1D4ED8', 1),
  (uuid_generate_v4(), 'الدبلوماسية',   'Diplomacy',      'diplomacy',      c_politics,    '#1D4ED8', 2),
  (uuid_generate_v4(), 'الاستراتيجية',  'Strategy',       'strategy',       c_politics,    '#1D4ED8', 3),
  (uuid_generate_v4(), 'السياسات',      'Policies',       'policies',       c_politics,    '#1D4ED8', 4),
  (uuid_generate_v4(), 'الحوكمة',       'Governance',     'governance',     c_politics,    '#1D4ED8', 5),

  -- 6. الاقتصاد
  (uuid_generate_v4(), 'الكلي',         'Macroeconomics', 'macroeconomics', c_economics,   '#047857', 1),
  (uuid_generate_v4(), 'الجزئي',        'Microeconomics', 'microeconomics', c_economics,   '#047857', 2),
  (uuid_generate_v4(), 'المالية',       'Finance',        'finance',        c_economics,   '#047857', 3),
  (uuid_generate_v4(), 'الضرائب',       'Taxation',       'taxation',       c_economics,   '#047857', 4),
  (uuid_generate_v4(), 'التجارة',       'Commerce',       'commerce',       c_economics,   '#047857', 5),

  -- 7. الأعمال
  (uuid_generate_v4(), 'الريادة',       'Entrepreneurship','entrepreneurship',c_business,  '#0369A1', 1),
  (uuid_generate_v4(), 'الإدارة',       'Management',     'management',     c_business,    '#0369A1', 2),
  (uuid_generate_v4(), 'التسويق',       'Marketing',      'marketing',      c_business,    '#0369A1', 3),
  (uuid_generate_v4(), 'المبيعات',      'Sales',          'sales',          c_business,    '#0369A1', 4),
  (uuid_generate_v4(), 'الموارد',       'Resources',      'resources',      c_business,    '#0369A1', 5),

  -- 8. القانون
  (uuid_generate_v4(), 'الدستوري',      'Constitutional', 'constitutional', c_law,         '#6B21A8', 1),
  (uuid_generate_v4(), 'الجنائي',       'Criminal',       'criminal',       c_law,         '#6B21A8', 2),
  (uuid_generate_v4(), 'المدني',        'Civil',          'civil',          c_law,         '#6B21A8', 3),
  (uuid_generate_v4(), 'الدولي',        'International',  'international',  c_law,         '#6B21A8', 4),
  (uuid_generate_v4(), 'التشريع',       'Legislation',    'legislation',    c_law,         '#6B21A8', 5),

  -- 9. الذكاء الاصطناعي
  (uuid_generate_v4(), 'الخوارزميات',   'Algorithms',     'algorithms',     c_ai,          '#0F172A', 1),
  (uuid_generate_v4(), 'النماذج',       'Models',         'models',         c_ai,          '#0F172A', 2),
  (uuid_generate_v4(), 'الرؤية',        'Vision',         'vision',         c_ai,          '#0F172A', 3),
  (uuid_generate_v4(), 'التوليد',       'Generation',     'generation',     c_ai,          '#0F172A', 4),
  (uuid_generate_v4(), 'الروبوتات',     'Robotics',       'robotics',       c_ai,          '#0F172A', 5),

  -- 10. الحوسبة
  (uuid_generate_v4(), 'البرمجة',       'Programming',    'programming',    c_computing,   '#1E3A5F', 1),
  (uuid_generate_v4(), 'الشبكات',       'Networks',       'networks',       c_computing,   '#1E3A5F', 2),
  (uuid_generate_v4(), 'السيبرانية',    'Cybersecurity',  'cybersecurity',  c_computing,   '#1E3A5F', 3),
  (uuid_generate_v4(), 'البيانات',      'Data',           'data',           c_computing,   '#1E3A5F', 4),
  (uuid_generate_v4(), 'العتاد',        'Hardware',       'hardware',       c_computing,   '#1E3A5F', 5),

  -- 11. الرياضيات
  (uuid_generate_v4(), 'الجبر',         'Algebra',        'algebra',        c_mathematics, '#7E22CE', 1),
  (uuid_generate_v4(), 'التحليل',       'Analysis',       'analysis',       c_mathematics, '#7E22CE', 2),
  (uuid_generate_v4(), 'الهندسة',       'Geometry',       'geometry',       c_mathematics, '#7E22CE', 3),
  (uuid_generate_v4(), 'الإحصاء',       'Statistics',     'statistics',     c_mathematics, '#7E22CE', 4),
  (uuid_generate_v4(), 'الاحتمالات',    'Probabilities',  'probabilities',  c_mathematics, '#7E22CE', 5),

  -- 12. الفيزياء
  (uuid_generate_v4(), 'الكلاسيكية',    'Classical',      'classical',      c_physics,     '#1E40AF', 1),
  (uuid_generate_v4(), 'الكمية',        'Quantum',        'quantum',        c_physics,     '#1E40AF', 2),
  (uuid_generate_v4(), 'الديناميكا',    'Dynamics',       'dynamics',       c_physics,     '#1E40AF', 3),
  (uuid_generate_v4(), 'البصريات',      'Optics',         'optics',         c_physics,     '#1E40AF', 4),
  (uuid_generate_v4(), 'الفلكية',       'Astrophysics',   'astrophysics',   c_physics,     '#1E40AF', 5),

  -- 13. الفضاء
  (uuid_generate_v4(), 'الكونيات',      'Cosmology',      'cosmology',      c_space,       '#0C0A3E', 1),
  (uuid_generate_v4(), 'الكواكب',       'Planetology',    'planetology',    c_space,       '#0C0A3E', 2),
  (uuid_generate_v4(), 'الملاحة',       'Astronautics',   'astronautics',   c_space,       '#0C0A3E', 3),
  (uuid_generate_v4(), 'الأقمار',       'Satellites',     'satellites',     c_space,       '#0C0A3E', 4),
  (uuid_generate_v4(), 'المجرات',       'Galaxies',       'galaxies',       c_space,       '#0C0A3E', 5),

  -- 14. الكيمياء
  (uuid_generate_v4(), 'العضوية',       'Organic',        'organic',        c_chemistry,   '#14532D', 1),
  (uuid_generate_v4(), 'التحليلية',     'Analytical',     'analytical',     c_chemistry,   '#14532D', 2),
  (uuid_generate_v4(), 'الفيزيائية',    'Physical',       'physical',       c_chemistry,   '#14532D', 3),
  (uuid_generate_v4(), 'الحيوية',       'Biochemistry',   'biochemistry',   c_chemistry,   '#14532D', 4),
  (uuid_generate_v4(), 'البوليمرات',    'Polymers',       'polymers',       c_chemistry,   '#14532D', 5),

  -- 15. الأحياء
  (uuid_generate_v4(), 'الجينوم',       'Genomics',       'genomics',       c_biology,     '#166534', 1),
  (uuid_generate_v4(), 'التطور',        'Evolution',      'evolution',      c_biology,     '#166534', 2),
  (uuid_generate_v4(), 'الخلية',        'Cytology',       'cytology',       c_biology,     '#166534', 3),
  (uuid_generate_v4(), 'النبات',        'Botany',         'botany',         c_biology,     '#166534', 4),
  (uuid_generate_v4(), 'الحيوان',       'Zoology',        'zoology',        c_biology,     '#166534', 5),

  -- 16. الطب
  (uuid_generate_v4(), 'التشريح',       'Anatomy',        'anatomy',        c_medicine,    '#BE123C', 1),
  (uuid_generate_v4(), 'الجراحة',       'Surgery',        'surgery',        c_medicine,    '#BE123C', 2),
  (uuid_generate_v4(), 'الأدوية',       'Pharmacology',   'pharmacology',   c_medicine,    '#BE123C', 3),
  (uuid_generate_v4(), 'المناعة',       'Immunology',     'immunology',     c_medicine,    '#BE123C', 4),
  (uuid_generate_v4(), 'الأوبئة',       'Epidemiology',   'epidemiology',   c_medicine,    '#BE123C', 5),

  -- 17. البيئة
  (uuid_generate_v4(), 'الإيكولوجيا',   'Ecology',        'ecology',        c_environment, '#4CB36C', 1),
  (uuid_generate_v4(), 'الاستدامة',     'Sustainability', 'sustainability', c_environment, '#4CB36C', 2),
  (uuid_generate_v4(), 'التلوث',        'Pollution',      'pollution',      c_environment, '#4CB36C', 3),
  (uuid_generate_v4(), 'المحيطات',      'Oceanography',   'oceanography',   c_environment, '#4CB36C', 4),
  (uuid_generate_v4(), 'الغابات',       'Forestry',       'forestry',       c_environment, '#4CB36C', 5),

  -- 18. الاجتماع
  (uuid_generate_v4(), 'الأسرة',        'Family',         'family',         c_sociology,   '#9D174D', 1),
  (uuid_generate_v4(), 'الطبقات',       'Classes',        'classes',        c_sociology,   '#9D174D', 2),
  (uuid_generate_v4(), 'الجريمة',       'Criminology',    'criminology',    c_sociology,   '#9D174D', 3),
  (uuid_generate_v4(), 'العمران',       'Urbanism',       'urbanism',       c_sociology,   '#9D174D', 4),
  (uuid_generate_v4(), 'الثقافة',       'Culture',        'culture',        c_sociology,   '#9D174D', 5),

  -- 19. علم النفس
  (uuid_generate_v4(), 'الإدراك',       'Cognition',      'cognition',      c_psychology,  '#6D28D9', 1),
  (uuid_generate_v4(), 'السلوك',        'Behavior',       'behavior',       c_psychology,  '#6D28D9', 2),
  (uuid_generate_v4(), 'التحليل',       'Psychoanalysis', 'psychoanalysis', c_psychology,  '#6D28D9', 3),
  (uuid_generate_v4(), 'السريري',       'Clinical',       'clinical',       c_psychology,  '#6D28D9', 4),
  (uuid_generate_v4(), 'النمو',         'Development',    'development',    c_psychology,  '#6D28D9', 5),

  -- 20. اللسانيات
  (uuid_generate_v4(), 'الدلالة',       'Semantics',      'semantics',      c_linguistics, '#0891B2', 1),
  (uuid_generate_v4(), 'النحو',         'Syntax',         'syntax',         c_linguistics, '#0891B2', 2),
  (uuid_generate_v4(), 'الصرف',         'Morphology',     'morphology',     c_linguistics, '#0891B2', 3),
  (uuid_generate_v4(), 'الصوتيات',      'Phonetics',      'phonetics',      c_linguistics, '#0891B2', 4),
  (uuid_generate_v4(), 'التداولية',     'Pragmatics',     'pragmatics',     c_linguistics, '#0891B2', 5),

  -- 21. الأدب
  (uuid_generate_v4(), 'الشعر',         'Poetry',         'poetry',         c_literature,  '#92400E', 1),
  (uuid_generate_v4(), 'السرد',         'Narrative',      'narrative',      c_literature,  '#92400E', 2),
  (uuid_generate_v4(), 'النقد',         'Criticism',      'criticism',      c_literature,  '#92400E', 3),
  (uuid_generate_v4(), 'المسرح',        'Drama',          'drama',          c_literature,  '#92400E', 4),
  (uuid_generate_v4(), 'البلاغة',       'Rhetoric',       'rhetoric',       c_literature,  '#92400E', 5),

  -- 22. الفنون
  (uuid_generate_v4(), 'التشكيل',       'Plastic Arts',   'plastic-arts',   c_arts,        '#BE185D', 1),
  (uuid_generate_v4(), 'العمارة',       'Architecture',   'architecture',   c_arts,        '#BE185D', 2),
  (uuid_generate_v4(), 'الموسيقى',      'Music',          'music',          c_arts,        '#BE185D', 3),
  (uuid_generate_v4(), 'الخط',          'Calligraphy',    'calligraphy',    c_arts,        '#BE185D', 4),
  (uuid_generate_v4(), 'السينما',       'Cinema',         'cinema',         c_arts,        '#BE185D', 5),

  -- 23. التصميم
  (uuid_generate_v4(), 'الجرافيك',      'Graphics',       'graphics',       c_design,      '#7C3AED', 1),
  (uuid_generate_v4(), 'الواجهات',      'Interfaces',     'interfaces',     c_design,      '#7C3AED', 2),
  (uuid_generate_v4(), 'الصناعي',       'Industrial',     'industrial',     c_design,      '#7C3AED', 3),
  (uuid_generate_v4(), 'الداخلي',       'Interior',       'interior',       c_design,      '#7C3AED', 4),
  (uuid_generate_v4(), 'الأزياء',       'Fashion',        'fashion',        c_design,      '#7C3AED', 5),

  -- 24. الإعلام
  (uuid_generate_v4(), 'الصحافة',       'Journalism',     'journalism',     c_media,       '#1D4ED8', 1),
  (uuid_generate_v4(), 'التلفزة',       'Television',     'television',     c_media,       '#1D4ED8', 2),
  (uuid_generate_v4(), 'الإذاعة',       'Radio',          'radio',          c_media,       '#1D4ED8', 3),
  (uuid_generate_v4(), 'الإعلان',       'Advertising',    'advertising',    c_media,       '#1D4ED8', 4),
  (uuid_generate_v4(), 'النشر',         'Publishing',     'publishing',     c_media,       '#1D4ED8', 5);

END $$;

-- Seed a few trusted sources
INSERT INTO sources (name, domain, badge_letter, badge_color, language) VALUES
  ('ناشيونال جيوغرافيك عربية', 'nationalgeographic.com', 'ن', '#FFCC00', 'ar'),
  ('MIT Technology Review',    'technologyreview.com',   'M',  '#A31F34', 'en'),
  ('Nature',                    'nature.com',             'N',  '#2196F3', 'en'),
  ('BBC Arabic',                'bbc.com',                'B',  '#BB1919', 'ar'),
  ('الجزيرة',                  'aljazeera.net',          'ج',  '#AF0000', 'ar'),
  ('DW Arabic',                 'dw.com',                 'D',  '#00A1E0', 'ar');
