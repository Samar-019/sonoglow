# Velvanoct — Official Site & Subdomain Architecture Guide

This guide details how your **Apex Domain** (Official Site), **Subdomain Site** (Interactive Web Player), and **GitHub Pages** are configured and mapped.

---

## 1. Domain Structure

| Domain / Subdomain | Target Location | Purpose |
| :--- | :--- | :--- |
| **`velvanoct.io`** (or `www.velvanoct.io`) | `docs/index.html` | **Official Landing Page** (Showcase, Downloads, Features) |
| **`play.velvanoct.io`** (or `app.velvanoct.io`) | `docs/play/index.html` | **Interactive Web Player Demo** (In-browser atmospheric player) |
| **`samar-019.github.io/afterglow-/`** | `docs/` | Default GitHub Pages URL |

---

## 2. DNS Settings (Cloudflare, Namecheap, GoDaddy, Hostinger)

### For the Apex / Official Site (`velvanoct.io`):
Add the 4 GitHub Pages A records to your DNS:

```dns
Type: A     Name: @     Value: 185.199.108.153     TTL: Auto
Type: A     Name: @     Value: 185.199.109.153     TTL: Auto
Type: A     Name: @     Value: 185.199.110.153     TTL: Auto
Type: A     Name: @     Value: 185.199.111.153     TTL: Auto
Type: CNAME Name: www   Value: samar-019.github.io. TTL: Auto
```

### For the Subdomain (`play.velvanoct.io`):

#### Option A: Cloudflare Redirect / Worker (Recommended):
Point `play.velvanoct.io` to forward directly to:
```
https://velvanoct.io/play/
```

#### Option B: Dedicated Subdomain GitHub Pages Repo:
If you want `play.velvanoct.io` hosted completely separately:
1. Create a repo `velvanoct-web` with the contents of `docs/play/`.
2. Add a `CNAME` file containing:
   ```
   play.velvanoct.io
   ```
3. Add a DNS CNAME record:
   ```dns
   Type: CNAME Name: play Value: samar-019.github.io.
   ```

---

## 3. GitHub Pages Settings

1. In your GitHub repository:
   * Go to **Settings** $\rightarrow$ **Pages**
   * **Source:** Select `Deploy from a branch`
   * **Branch:** `main` $\rightarrow$ Folder `/docs`
   * Save.
2. In **Custom domain**, enter `velvanoct.io` (if you own the domain) and check **Enforce HTTPS**.
