# سایت تینا ERP

سایت معرفی استاتیک **تینا ERP** با [Eleventy](https://www.11ty.dev/) — فارسی، RTL، فونت پلاک (PelakFA).

## پیش‌نیاز

- Node.js 18 یا بالاتر

## اجرا در لوکال

```bash
cd website
npm install
npm start
```

سایت روی [http://localhost:8080](http://localhost:8080) بالا می‌آید.

## ساخت خروجی

```bash
cd website
npm run build
```

خروجی در پوشهٔ `website/_site` است.

## ساختار

```
website/
  src/
    _data/site.json      # عنوان، ناوبری، pathPrefix
    _includes/           # header، footer
    _layouts/            # base، page، post، news
    assets/              # css، js، fonts (PelakFA)، img
    content/blog|news/   # پست‌های Markdown
    *.njk                # صفحات ثابت
  .eleventy.js
  package.json
```

## GitHub Pages

1. در `src/_data/site.json` مقدار `pathPrefix` را روی مسیر ریپو تنظیم کنید؛ مثلاً اگر ریپو `tina-erp` است: `"/tina-erp"`. برای دامنهٔ ریشه خالی بگذارید: `""`.
2. Workflow در `.github/workflows/deploy-pages.yml` با هر push به `main` خروجی را از `website/` می‌سازد و روی Pages منتشر می‌کند.
3. در تنظیمات ریپو: Settings → Pages → Source = GitHub Actions.

## افزودن مطلب

- بلاگ: فایل Markdown در `src/content/blog/` با `layout: post.njk`
- اخبار: فایل در `src/content/news/` با `layout: news.njk`

permalink تمیز بدون `.html` (مثلاً `/blog/getting-started/`).
