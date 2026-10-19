# Vivek Sahu — Neon Cyber Portfolio

An original responsive developer portfolio inspired by futuristic black-and-cyan interfaces, with green hacker day mode, interactive cursor effects, 3D project cards and a Google Search-inspired profile panel.

## Features
- Neon cyan night mode and Matrix-green hacker day mode with cursor parallax, glowing trails and floating particles.
- Google-inspired search panel answers common questions **locally from Vivek's own portfolio and official GitHub/LinkedIn identity**. External Google is a separately labeled optional link scoped with the distinct GitHub username `viveksahu1974`. The panel is **not** an official Google product and cannot control Google AI answers. This avoids misleading on-site results for unrelated people also named Vivek Sahu.
- Five featured project **illustrations** in `assets/`, each clearly marked *illustrated preview*, not genuine screenshots.
- Featured project GitHub source and demo links. TEJA AI links to a **sample UI preview** in `teja-demo/`; full AI inference needs a properly configured backend.
- Public GitHub repository Auto-Sync and featured project carousel; incomplete repositories listed by name.
- Separate internships, academic history, skills and contact.
- Eleven certificate titles with **Google search links only** (not credential verification links).
- Feedback form UI (requires Apps Script authorization and endpoint to send).

## Identity / Search metadata
`index.html` includes canonical URL, social profile links and a Person JSON-LD identity for `Vivek Sahu` at MSIT Delhi. Search engines may take time to index it and can still confuse people with the same name. The live answer panel is first-party rather than Google AI-generated.

## Hosting
GitHub Pages: **Settings → Pages → Deploy from a branch → main → /(root)**.

Website: https://viveksahu1974.github.io/portfolio/

## Assets and remaining setup
The project illustrations are tracked in `assets/`. The portfolio still links to `VIVEKRESUME.pdf`; **upload the authorized public resume PDF** to that root path separately for View/Download to work. Review personal details before making a resume public.

Certificates no longer link to missing PDF/image uploads; their Google buttons are topical searches and do **not** display original certificates.

For feedback delivery, configure `APPS_SCRIPT_URL` in `index.html` with a deployed and authorized Apps Script web app. Never commit secrets or credentials.

## About
Developer: Vivek Sahu · B.Tech Information Technology (MSIT, Delhi).
GitHub: https://github.com/viveksahu1974
LinkedIn: https://www.linkedin.com/in/vivek-sahu-1657a8268/
