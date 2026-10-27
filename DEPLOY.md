# Titan Pro Gym — deploy notes

Live site: https://tushar0612.github.io/titan-pro-gym/
Hosted on GitHub Pages from the `main` branch of `tushar0612/titan-pro-gym`.

## Updating the site
1. Edit the files and push to `main`. GitHub Pages republishes in about a minute.
2. If you changed `assets/css/style.css` or `assets/js/main.js`, bump the `?v=` number on
   its link in `index.html` so returning visitors don't get the old cached file.

## Still to do
1. Copy the remaining photos from the original S3 site into `assets/img/`:
   `gallery-training.jpg`, `gallery-weights.jpg`, `gallery-dumbbells.jpg`,
   `gallery-supplements.jpg`, `gallery-sign.jpg` and the `full/` folder.
   Then change the gallery links in `index.html` from the S3 URLs to `assets/img/...`.
2. Ask a native Hindi speaker to proofread the Hindi text in `assets/js/main.js` (the `HI` block).
3. If the site moves to a custom domain, replace `tushar0612.github.io/titan-pro-gym`
   in `index.html` (canonical, og:url, og:image, JSON-LD).

## After going live
- Test a real booking on Android, iPhone and from an Instagram link: WhatsApp should open
  to +91 81027 07440 with the details filled in.
- Add the site URL to the gym's Google Business Profile.
