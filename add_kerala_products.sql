-- Adds the new Kerala masala/spice + vegetable products to YOUR existing
-- account without touching anything else you already have.
--
-- HOW TO USE:
-- 1. In the Supabase dashboard, go to Authentication -> Users, and copy your
--    own User UID (a long uuid, e.g. 8f14e45f-ceea-...).
-- 2. Go to the SQL Editor, paste this whole script, replace
--    'PASTE-YOUR-USER-ID-HERE' below with that UID, and click Run.
-- 3. Refresh the app -- the new products will appear in Product Master.

do $$
declare
  p_user_id uuid := 'PASTE-YOUR-USER-ID-HERE';
begin
  insert into public.products (id, user_id, name, brand, category_id, default_unit, is_favorite, is_active, created_at)
  values
  ('prod-kl-turmericpowder', p_user_id, 'Turmeric Powder (Manjal Podi)', 'Eastern', 'cat-spices', 'pack', true, true, now()),
  ('prod-kl-chillipowder', p_user_id, 'Chilli Powder (Molaka Podi)', 'Eastern', 'cat-spices', 'pack', true, true, now()),
  ('prod-kl-kashmirichilli', p_user_id, 'Kashmiri Chilli Powder', 'Eastern', 'cat-spices', 'pack', false, true, now()),
  ('prod-kl-corianderpowder', p_user_id, 'Coriander Powder (Malli Podi)', 'Eastern', 'cat-spices', 'pack', true, true, now()),
  ('prod-kl-pepperwhole', p_user_id, 'Black Pepper Whole (Kurumulaku)', 'Local', 'cat-spices', 'pack', false, true, now()),
  ('prod-kl-pepperpowder', p_user_id, 'Black Pepper Powder', 'Eastern', 'cat-spices', 'pack', false, true, now()),
  ('prod-kl-cumin', p_user_id, 'Cumin Seeds (Jeerakam)', 'Generic', 'cat-spices', 'pack', false, true, now()),
  ('prod-kl-fennel', p_user_id, 'Fennel Seeds (Perinjeerakam)', 'Generic', 'cat-spices', 'pack', false, true, now()),
  ('prod-kl-cardamom', p_user_id, 'Cardamom (Elakka)', 'Local', 'cat-spices', 'pack', false, true, now()),
  ('prod-kl-cloves', p_user_id, 'Cloves (Grambu)', 'Generic', 'cat-spices', 'pack', false, true, now()),
  ('prod-kl-cinnamon', p_user_id, 'Cinnamon (Karugapatta)', 'Generic', 'cat-spices', 'pack', false, true, now()),
  ('prod-kl-staranise', p_user_id, 'Star Anise (Thakkolam)', 'Generic', 'cat-spices', 'pack', false, true, now()),
  ('prod-kl-bayleaf', p_user_id, 'Bay Leaf (Karuvapatta)', 'Generic', 'cat-spices', 'pack', false, true, now()),
  ('prod-kl-asafoetida', p_user_id, 'Asafoetida (Kayam)', 'Eastern', 'cat-spices', 'pcs', false, true, now()),
  ('prod-kl-driedchilli', p_user_id, 'Dry Red Chilli (Vattal Mulaku)', 'Local', 'cat-spices', 'pack', false, true, now()),
  ('prod-kl-rasampowder', p_user_id, 'Rasam Powder', 'Eastern', 'cat-spices', 'pack', false, true, now()),
  ('prod-kl-biryanimasala', p_user_id, 'Biryani Masala', 'Eastern', 'cat-spices', 'pack', false, true, now()),
  ('prod-kl-chickenmasala', p_user_id, 'Chicken Masala', 'Eastern', 'cat-spices', 'pack', true, true, now()),
  ('prod-kl-currypowder', p_user_id, 'Kerala Curry Powder', 'Eastern', 'cat-spices', 'pack', false, true, now()),
  ('prod-kl-spinach', p_user_id, 'Spinach / Amaranthus (Cheera)', 'Local', 'cat-veg', 'pack', true, true, now()),
  ('prod-kl-capsicum', p_user_id, 'Capsicum / Bell Pepper', 'Local', 'cat-veg', 'kg', false, true, now()),
  ('prod-kl-greenpeas', p_user_id, 'Green Peas', 'Local', 'cat-veg', 'kg', false, true, now()),
  ('prod-kl-beans', p_user_id, 'Cowpea / Beans (Achinga Payar)', 'Local', 'cat-veg', 'kg', false, true, now())
  on conflict (id, user_id) do nothing;
end $$;
