# رکاد / GameKAD

پلتفرم رزرو رویداد، آمار بازیکن و میزبانی نشست. ظاهر مرجع کپی نشده. نظرات عمومی وجود ندارد.

## اجرا

```bash
# PostgreSQL 17 روی 5432 با کاربر/دیتابیس rokad
cp .env.example apps/api/.env   # JWT_SECRET و ADMIN_BOOTSTRAP_PASSWORD را عوض کن
cd apps/api && npx prisma generate && npx prisma db push && npx prisma db seed
cd ../..
npm install
npm run api    # :3001  swagger /api/docs
npm run web    # :8080
```

نمونهٔ seed (غیر پروداکشن): `player` / `player-pass-9` (عضو رکاد)، `host` / `host-pass-9`، `sara` خارج از رکاد. مدیر: `ADMIN_BOOTSTRAP_PASSWORD`.

## قرارداد

- API: `/api/v1` — Swagger: `/api/docs`
- عضویت: `ROKAD` | `EXTERNAL` — نشان PNG کنار نام فقط برای رکاد
- پول: تومان صحیح
- UI: فارسی RTL، تقویم جلالی، `Asia/Tehran`
