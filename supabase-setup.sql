-- ============================================================
-- Zlatna Lopta - Supabase Setup
-- Pokrenite ovaj SQL u Supabase > SQL Editor
-- ============================================================

-- Tabela zauzetih termina (svaki sat = 1 red)
CREATE TABLE IF NOT EXISTS booked_slots (
  id         uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  date       date    NOT NULL,
  hour       integer NOT NULL CHECK (hour >= 9 AND hour < 24),
  label      text    DEFAULT 'Zauzeto',
  created_at timestamptz DEFAULT now(),
  UNIQUE(date, hour)
);

-- Ukljuci Row Level Security
ALTER TABLE booked_slots ENABLE ROW LEVEL SECURITY;

-- Svi mogu da CITAJU zauzete termine (javno)
CREATE POLICY "Javno citanje"
  ON booked_slots FOR SELECT
  USING (true);

-- Samo ulogovani admin moze da DODAJE termine
CREATE POLICY "Admin unos"
  ON booked_slots FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Samo ulogovani admin moze da BRISE termine
CREATE POLICY "Admin brisanje"
  ON booked_slots FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================
-- POSLE POKRETANJA SQL-a:
-- 1. Idi na Authentication > Users > Add user
-- 2. Unesi email i lozinku za admin nalog
-- 3. Kopiraj Project URL i anon key iz Settings > API
-- 4. Paste ih u admin.js i booking.js (SUPABASE_URL, SUPABASE_ANON_KEY)
-- ============================================================
