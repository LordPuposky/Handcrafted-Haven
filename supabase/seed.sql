-- Handcrafted Haven (Supabase) seed data
--
-- Inserts the sample rows from `src/data/marketplace.ts`.
-- Safe to re-run: existing rows are matched by stable fields and IDs are only
-- generated when a record does not already exist.
begin;
-- Sellers
with seller_seed (
  name,
  location,
  specialty,
  bio,
  story,
  "avatarEmoji"
) as (
  values (
      'Lia Ceramics',
      'Belo Horizonte, MG',
      'Artistic ceramics',
      $seed$Functional
      and decorative pieces shaped
      and fired in small batches.$seed$,
      $seed$Lia turns local clay into collections inspired by organic forms.Every piece goes through hand shaping
      and glazes developed in her own studio.$seed$,
      '🏺'
    ),
    (
      'Trama Viva Studio',
      'Florianopolis, SC',
      'Weaving and macrame',
      $seed$Natural home textures made with responsibly sourced fibers.$seed$,
      $seed$At Trama Viva,
      Ana
      and Joana create textile pieces with recycled cotton
      and plant fibers.Their focus is to combine visual comfort with conscious production.$seed$,
      '🧶'
    ),
    (
      'Dourado Workshop',
      'Salvador, BA',
      'Metal and leather accessories',
      $seed$Durable accessories with hand - finished details
      and original design.$seed$,
      $seed$Dourado Workshop was born
      from the desire to craft everyday accessories with long - lasting materials
        and Brazilian identity.$seed$,
        '👜'
    ),
    (
      'Paper and Bloom',
      'Curitiba, PR',
      'Handmade stationery',
      $seed$Notebooks,
      cards,
      and gifts made with hand - binding techniques.$seed$,
      $seed$Using classic binding techniques,
      Paper
      and Bloom creates small collections for gifting
      and daily use,
      always with certified paper.$seed$,
      '📒'
    ),
    (
      'Atelie da Serra',
      'Campos do Jordao, SP',
      'Wood decor and carving',
      $seed$Rustic wooden accents handcrafted for cozy interiors.$seed$,
      $seed$Atelie da Serra blends traditional carving methods with contemporary silhouettes to create warm,
      tactile home pieces.$seed$,
      '🪵'
    ),
    (
      'Casa Aurora Textiles',
      'Recife, PE',
      'Hand-dyed textiles',
      $seed$Soft household linens colored with artisanal dye techniques.$seed$,
      $seed$Inspired by the coastline
      and tropical gardens,
      Casa Aurora Textiles produces small - batch fabrics designed to bring softness
      and color into everyday life.$seed$,
      '🪡'
    ),
    (
      'Studio Vento',
      'Porto Alegre, RS',
      'Minimalist decor',
      $seed$Clean - lined decorative objects with handcrafted finishing touches.$seed$,
      $seed$Studio Vento focuses on calming shapes,
      neutral palettes,
      and thoughtful material combinations that elevate modern living spaces.$seed$,
      '🕯️'
    )
)
insert into public.sellers (
    id,
    name,
    location,
    specialty,
    bio,
    story,
    "avatarEmoji"
  )
select coalesce(existing.id, gen_random_uuid()::text),
  seed.name,
  seed.location,
  seed.specialty,
  seed.bio,
  seed.story,
  seed."avatarEmoji"
from seller_seed as seed
  left join public.sellers as existing on existing.name = seed.name on conflict (id) do
update
set name = excluded.name,
  location = excluded.location,
  specialty = excluded.specialty,
  bio = excluded.bio,
  story = excluded.story,
  "avatarEmoji" = excluded."avatarEmoji";
-- Products
with product_seed (
  seller_name,
  title,
  category,
  description,
  price,
  "imageEmoji",
  featured
) as (
  values (
      'Lia Ceramics',
      'Aurora Vase',
      'Ceramics',
      $seed$Ceramic vase with matte glaze in earthy tones.$seed$,
      189,
      '🏺',
      true
    ),
    (
      'Trama Viva Studio',
      'Serra Macrame Wall Panel',
      'Textile',
      $seed$Wall macrame panel made with natural fibers.$seed$,
      229,
      '🧵',
      true
    ),
    (
      'Dourado Workshop',
      'Pathway Bag',
      'Accessories',
      $seed$Plant - based leather bag with gold - tone hardware.$seed$,
      319,
      '👜',
      true
    ),
    (
      'Paper and Bloom',
      'Botanical Notebook',
      'Stationery',
      $seed$Hand - stitched notebook with textured paper cover.$seed$,
      89,
      '📔',
      false
    ),
    (
      'Lia Ceramics',
      'Sun Plate',
      'Ceramics',
      $seed$Hand - painted decorative plate,
      ideal for table centerpieces.$seed$,
      142,
      '🍽️',
      false
    ),
    (
      'Trama Viva Studio',
      'Valley Throw',
      'Textile',
      $seed$Light throw made of recycled cotton for sofa
      or bed.$seed$,
      259,
      '🧣',
      false
    ),
    (
      'Dourado Workshop',
      'Breeze Bracelet',
      'Accessories',
      $seed$Handcrafted bracelet with leather
      and brushed metal clasp.$seed$,
      74,
      '📿',
      false
    ),
    (
      'Paper and Bloom',
      'Earth Card Set',
      'Stationery',
      $seed$Set of handmade cards for thoughtful messages.$seed$,
      52,
      '💌',
      false
    ),
    (
      'Trama Viva Studio',
      'Nest Cushion',
      'Decor',
      $seed$Embroidered cushion with hypoallergenic filling.$seed$,
      136,
      '🛋️',
      false
    ),
    (
      'Atelie da Serra',
      'Cedro Candle Holder',
      'Decor',
      $seed$Hand - carved wooden candle holder with a satin finish.$seed$,
      118,
      '🪵',
      true
    ),
    (
      'Atelie da Serra',
      'Mantiqueira Tray',
      'Decor',
      $seed$Solid wood serving tray crafted for coffee rituals
      and table styling.$seed$,
      164,
      '🧺',
      false
    ),
    (
      'Casa Aurora Textiles',
      'Lagoon Table Runner',
      'Textile',
      $seed$Naturally dyed table runner designed to soften everyday dining spaces.$seed$,
      149,
      '🪡',
      true
    ),
    (
      'Casa Aurora Textiles',
      'Breeze Napkin Set',
      'Textile',
      $seed$Set of reusable cloth napkins with hand - finished hems.$seed$,
      96,
      '🌿',
      false
    ),
    (
      'Studio Vento',
      'Luma Incense Dish',
      'Decor',
      $seed$Minimal handcrafted dish for incense rituals
      and small keepsakes.$seed$,
      84,
      '🕊️',
      false
    ),
    (
      'Studio Vento',
      'Arc Desktop Organizer',
      'Stationery',
      $seed$Desk organizer designed to keep paper tools
      and essentials beautifully arranged.$seed$,
      132,
      '🗂️',
      false
    )
)
insert into public.products (
    id,
    "sellerId",
    title,
    category,
    description,
    price,
    "imageEmoji",
    featured
  )
select coalesce(existing.id, gen_random_uuid()::text),
  seller.id,
  seed.title,
  seed.category,
  seed.description,
  seed.price,
  seed."imageEmoji",
  seed.featured
from product_seed as seed
  join public.sellers as seller on seller.name = seed.seller_name
  left join public.products as existing on existing.title = seed.title
  and existing."sellerId" = seller.id on conflict (id) do
update
set "sellerId" = excluded."sellerId",
  title = excluded.title,
  category = excluded.category,
  description = excluded.description,
  price = excluded.price,
  "imageEmoji" = excluded."imageEmoji",
  featured = excluded.featured;
-- Reviews
with review_seed (product_title, author, rating, comment) as (
  values (
      'Aurora Vase',
      'Carla M.',
      5,
      $seed$Impeccable finish
      and very careful packaging.$seed$
    ),
    (
      'Aurora Vase',
      'Rafael N.',
      4,
      $seed$Beautiful
      and exactly as shown in photos.Fast delivery.$seed$
    ),
    (
      'Serra Macrame Wall Panel',
      'Aline G.',
      5,
      $seed$It made my living room so cozy.I loved it.$seed$
    ),
    (
      'Pathway Bag',
      'Patricia L.',
      5,
      $seed$Excellent material,
      it feels like it will last for years.$seed$
    ),
    (
      'Valley Throw',
      'Joao T.',
      4,
      $seed$Very comfortable
      and a beautiful color combination.$seed$
    ),
    (
      'Cedro Candle Holder',
      'Marina S.',
      5,
      $seed$It looks beautiful on my dining table
      and feels very well made.$seed$
    ),
    (
      'Lagoon Table Runner',
      'Helena P.',
      5,
      $seed$The texture
      and color are stunning.It completely elevated my table setting.$seed$
    ),
    (
      'Luma Incense Dish',
      'Bruno A.',
      4,
      $seed$Simple,
      elegant,
      and exactly the understated piece I was looking for.$seed$
    ),
    (
      'Arc Desktop Organizer',
      'Camila R.',
      5,
      $seed$Keeps my workspace tidy
      and still looks decorative on the desk.$seed$
    ),
    (
      'Mantiqueira Tray',
      'Daniel F.',
      4,
      $seed$Great weight
      and finish.Perfect for serving coffee to guests.$seed$
    )
)
insert into public.reviews (id, "productId", author, rating, comment)
select coalesce(existing.id, gen_random_uuid()::text),
  product.id,
  seed.author,
  seed.rating,
  seed.comment
from review_seed as seed
  join public.products as product on product.title = seed.product_title
  left join public.reviews as existing on existing."productId" = product.id
  and existing.author = seed.author
  and existing.comment = seed.comment on conflict (id) do
update
set "productId" = excluded."productId",
  author = excluded.author,
  rating = excluded.rating,
  comment = excluded.comment;
commit;