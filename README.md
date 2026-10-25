# Script Line Studio

Source code for [scriptlinestudio.com](https://scriptlinestudio.com), the website of my web development and social media studio.

## What's on the site

- Selected client work
- Services, plus a quick project estimator
- How we work, from first message to launch
- Contact form
- English, Albanian and German

## Stack

- React and Vite
- Tailwind CSS
- GSAP for animations
- Three.js (React Three Fiber) for the 3D robot and globe
- Formspree for the contact form

## Folder layout

The source lives in `react-app/`. The repo root holds the built site, because that's what GitHub Pages serves.

```
react-app/     source code
assets/        built JS/CSS and images
index.html     built entry page
CNAME          custom domain
```

## Running it locally

```bash
git clone https://github.com/eljonenesi123/WebDev.git
cd WebDev/react-app
npm install
npm run dev
```

## Deploying

```bash
cd react-app
npm run build
```

Copy the contents of `react-app/dist` into the repo root, then commit and push.

---

© Script Line Studio. The code is public so you can see how it's built, but the design, text and images aren't free to reuse.
