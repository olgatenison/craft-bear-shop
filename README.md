подключение корзины к шопифай

Оставляем CartContext как есть.

Добавляем API-роут /api/shopify/checkout, который:
принимает items из корзины,
создаёт cart/checkout в Shopify через Storefront API,
возвращает checkoutUrl.

На странице корзины на кнопку Checkout вешаем handleCheckout, который:
берёт items из useCart(),
вызывает /api/shopify/checkout,
чистит локальную корзину,
редиректит на checkoutUrl.

1 - добавить // app/api/shopify/checkout/route.ts
2 - исправить кнопку // app/components/ShoppingCardOverviews.tsx
поправить квери на продукт чтобы там был правильный айди
поправить кнопку addToCard
FlattenedProduct и flattenMetafields в мапперс

📦 Варианты реализации
Вариант 1: Hybrid (самый простой)
Твой UI → Shopify Storefront API → Redirect на Shopify Checkout
Плюсы: Быстро, безопасно, PCI compliance из коробки
Минусы: Редирект на Shopify на этапе оплаты

📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦
npm install @supabase/supabase-js
Шаг 2: Настройка Supabase
Зайдите на supabase.com и создайте проект
В разделе SQL Editor выполните:

```
-- Создание таблицы отзывов
create table reviews (
  id bigserial primary key,
  shopify_product_id text not null,
  clerk_user_id text not null,
  user_name text not null,
  user_email text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  status text default 'approved' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default now()
);

-- Индекс для быстрого поиска
create index reviews_product_id_idx on reviews(shopify_product_id);
create index reviews_status_idx on reviews(status);

-- RLS политики (Row Level Security)
alter table reviews enable row level security;

-- Все могут читать одобренные отзывы
create policy "Anyone can read approved reviews"
  on reviews for select
  using (status = 'approved');

-- Аутентифицированные пользователи могут создавать отзывы
create policy "Authenticated users can create reviews"
  on reviews for insert
  with check (true);
```

Скопируйте из Settings → API:

Project URL (NEXT_PUBLIC_SUPABASE_URL)
anon/public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
service_role key (SUPABASE_SERVICE_KEY) - используется только на сервере

Добавьте в .env.local:

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

app\[lang]\api\reviews\route.ts
app\[lang]\product\[handle]\page.tsx
app\lib\supabase.ts
app\lib\getReviews.ts
app\components\CustomerReviews.tsx
app\components\LeaveReviewModal.tsx
📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦
