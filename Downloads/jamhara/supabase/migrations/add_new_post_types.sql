ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_type_check;
ALTER TABLE posts ADD CONSTRAINT posts_type_check CHECK (type IN ('article','chart','quiz','comparison','ranking','numbers','scenarios','timeline','factcheck','profile','briefing','quotes','explainer','debate','guide','network','interview','map'));
