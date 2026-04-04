# Bling Bling Baku — Website

Pink & white luxury accessories store website.

## 🌐 Live Site (GitHub Pages)

Once deployed, your site will be at:
`https://YOUR-USERNAME.github.io/blingblingbaku/`

---

## 🚀 How to Deploy on GitHub Pages (Free)

### Step 1 — Create a GitHub Account
Go to [github.com](https://github.com) and sign up (it's free).

### Step 2 — Create a New Repository
1. Click the **+** button → **New repository**
2. Name it: `blingblingbaku`
3. Set to **Public**
4. Click **Create repository**

### Step 3 — Upload Your Files
1. On the repository page, click **Upload files**
2. Drag ALL the files from this folder
3. Click **Commit changes**

### Step 4 — Enable GitHub Pages
1. Go to **Settings** → **Pages**
2. Under "Source", select **main** branch
3. Click **Save**
4. Your site will be live in 1-2 minutes! ✦

---

## 🔐 Admin Panel

Access: `yoursite.com/admin/`

Default login:
- **Username:** `admin`
- **Password:** `bling2025`

> ⚠️ Change the password! Open `admin/index.html`, find `ADMIN_PASS` and update.

---

## ➕ Adding Products

Use the Admin Panel to:
- Add products with photos, price, quantity, colors
- Set badges (New, Sale, Bestseller)
- Hide/show products instantly
- Monitor low stock

---

## 📱 WhatsApp Integration

All orders go through WhatsApp to **+994 70 200 33 35**. Customers click "Order via WhatsApp" and their cart is automatically formatted as a message.

---

## 🎨 Customization

| File | What to change |
|------|---------------|
| `css/style.css` | Colors, fonts, layout |
| `js/products.js` | Default product data |
| `index.html` | Homepage content |
| `admin/index.html` | Admin password |

### Change Colors
In `css/style.css`, edit these variables:
```css
--pink: #e8879e;
--pink-deep: #d4637a;
```

---

## 📂 Folder Structure

```
blingblingbaku/
├── index.html          ← Homepage
├── shop/
│   └── shop.html       ← Full shop page
├── admin/
│   └── index.html      ← Admin panel
├── css/
│   └── style.css       ← All styles
├── js/
│   ├── products.js     ← Product data & cards
│   └── main.js         ← Cart, modals, interactions
└── README.md
```

---

## 🌍 Custom Domain (Later)

When you're ready:
1. Buy a domain (e.g. `blingblingbaku.az` or `.com`)
2. In GitHub Pages settings → add your custom domain
3. At your domain registrar → point DNS to GitHub Pages

---

Built with 💕 for Bling Bling Baku, Baku, Azerbaijan
