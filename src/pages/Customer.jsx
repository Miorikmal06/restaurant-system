import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import { useState } from "react";
import { useParams } from "react-router-dom";

function Customer() {

  const { tableId } = useParams();

  const foods = [

// ─── DATA ────────────────────────────────────────────────────────────────────

  // Nasi
  { id: 1,  name: "Nasi Goreng Kampung",     price: 8.50,  cat: "Nasi",      desc: "Sambal belacan wangi, telur mata, ikan bilis & keropok rangup",           badge: "Bestseller", img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80" },
  { id: 2,  name: "Nasi Lemak Special",      price: 10.50, cat: "Nasi",      desc: "Nasi santan pandan, sambal sotong, rendang ayam & acar timun",             img: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400&q=80" },
  { id: 3,  name: "Nasi Ayam Hainan",        price: 9.50,  cat: "Nasi",      desc: "Nasi minyak wangi, ayam rebus lembut dengan sos halia & kicap",           badge: "New",        img: "https://images.unsplash.com/photo-1598515213692-30cb7cca5bc0?w=400&q=80" },
  { id: 4,  name: "Nasi Briyani Kambing",    price: 15.00, cat: "Nasi",      desc: "Basmati rempah ratus, daging kambing empuk & acar dalca",                  badge: "Chef's Pick",img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80" },
  { id: 5,  name: "Nasi Kandar Beratur",     price: 11.00, cat: "Nasi",      desc: "Pilihan lauk 3 jenis, kuah banjir campur & papadom",                       img: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&q=80" },

  // Mee
  { id: 6,  name: "Mee Goreng Mamak",        price: 7.00,  cat: "Mee",       desc: "Pedas rangup dengan tauhu, sotong, udang & beansprout",                    badge: "Pedas",      img: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80" },
  { id: 7,  name: "Laksa Assam Perak",       price: 9.00,  cat: "Mee",       desc: "Kuah asam segar, ikan kembung, daun kesum & bunga kantan",                 img: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80" },
  { id: 8,  name: "Char Kuey Teow",          price: 8.50,  cat: "Mee",       desc: "Wok hei tinggi, udang besar, telur, tauge & kucai",                        badge: "Bestseller", img: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&q=80" },
  { id: 9,  name: "Mee Rebus Johor",         price: 8.00,  cat: "Mee",       desc: "Kuah pekat manis, tauhu goreng, telur rebus & sambal",                     img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80" },
  { id: 10, name: "Mee Sup Tulang",          price: 10.00, cat: "Mee",       desc: "Sup tulang rusuk pekat, mee kuning, bawang goreng & daun sup",             img: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80" },

  // Western
  { id: 11, name: "Burger Ramly Double",     price: 12.00, cat: "Western",   desc: "Double beef patty, cheese leleh, sayur & sos istimewa warung",             badge: "New",        img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80" },
  { id: 12, name: "Chicken Chop Grill",      price: 14.00, cat: "Western",   desc: "Ayam percik grill, mushroom cream sauce, mashed potato & coleslaw",        img: "https://images.unsplash.com/photo-1598515213692-30cb7cca5bc0?w=400&q=80" },
  { id: 13, name: "Fish & Chips",            price: 13.00, cat: "Western",   desc: "Ikan dori salut tepung rangup, kentang goreng, tartare sauce & lemon",     img: "https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=400&q=80" },
  { id: 14, name: "Spaghetti Aglio Olio",   price: 12.00, cat: "Western",   desc: "Olive oil, bawang putih, chili flakes, parsley & parmesan",                img: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80" },

  // Roti
  { id: 15, name: "Roti Canai Banjir",       price: 5.50,  cat: "Roti",      desc: "Rangup garing, kuah dal pekat & kari ayam banjir",                         img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80" },
  { id: 16, name: "Tosai Telur",             price: 6.00,  cat: "Roti",      desc: "Tipis rangup, kuah sambal & coconut chutney hijau",                        img: "https://images.unsplash.com/photo-1630409351241-e90e7f6b4e05?w=400&q=80" },
  { id: 17, name: "Roti Bakar Kaya",         price: 4.50,  cat: "Roti",      desc: "Kaya pandan wangi, mentega salted & telur separuh masak",                  img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80" },
  { id: 18, name: "Capati Tandoor",          price: 5.00,  cat: "Roti",      desc: "Lembut gebu dari tandoor, dihidang dengan dhal & achar",                   img: "https://images.unsplash.com/photo-1604152135912-04a022e23696?w=400&q=80" },

  // Lauk
  { id: 19, name: "Ayam Goreng Berempah",    price: 7.00,  cat: "Lauk",      desc: "Rangup berempah 12 rempah, dihidang dengan sambal & timun",                img: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&q=80" },
  { id: 20, name: "Ikan Bakar Stingray",     price: 16.00, cat: "Lauk",      desc: "Ikan pari bakar, sambal kicap, bawang & limau nipis",                      badge: "Chef's Pick",img: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&q=80" },
  { id: 21, name: "Udang Masak Lemak",       price: 14.00, cat: "Lauk",      desc: "Santan lemak manis, kunyit, cili api & daun kesum",                        img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80" },
  { id: 22, name: "Sotong Goreng Tepung",    price: 10.00, cat: "Lauk",      desc: "Rangup golden, dipping sauce pedas manis & salad timun",                   img: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80" },

  // Minuman
  { id: 23, name: "Teh Tarik",               price: 2.50,  cat: "Minuman",   desc: "Susu pekat buih tebal, direndam rempah pilihan",           tempOpts: true,  img: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80" },
  { id: 24, name: "Kopi O",                  price: 2.00,  cat: "Minuman",   desc: "Kopi robusta pekat, gula batu tradisional",                tempOpts: true,  img: "https://images.unsplash.com/photo-1495774856032-8b90bbb32b32?w=400&q=80" },
  { id: 25, name: "Milo",                    price: 3.00,  cat: "Minuman",   desc: "Classic Malaysian favourite, creamy dan berkhasiat",       tempOpts: true,  img: "https://images.unsplash.com/photo-1610721254726-ffd46f740d16?w=400&q=80" },
  { id: 26, name: "Bandung Rose",            price: 3.50,  cat: "Minuman",   desc: "Susu evap dengan rose syrup, segar & manis",               tempOpts: true,  img: "https://images.unsplash.com/photo-1554043823-d5a8a7d5f87f?w=400&q=80" },
  { id: 27, name: "Sirap Selasih",           price: 2.50,  cat: "Minuman",   desc: "Manis segar dengan biji selasih mengembang",               tempOpts: true,  img: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80" },
  { id: 28, name: "Air Kelapa Muda",         price: 5.00,  cat: "Minuman",   desc: "Segar semula jadi, isi kelapa muda lembut",                tempOpts: false, badge: "Natural", img: "https://images.unsplash.com/photo-1536708880921-03a9306ec47d?w=400&q=80" },
  { id: 29, name: "Jus Mangga",              price: 5.50,  cat: "Minuman",   desc: "Mangga harum manis segar, tanpa gula tambah",              tempOpts: false, img: "https://images.unsplash.com/photo-1546173159-315724a31696?w=400&q=80" },
  { id: 30, name: "Lemon Honey",             price: 5.00,  cat: "Minuman",   desc: "Madu asli, lemon segar, halia & pinch of salt",            tempOpts: true,  img: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80" },

  // Dessert
  { id: 31, name: "Cendol Durian",           price: 7.50,  cat: "Dessert",   desc: "Santan segar, gula melaka, cendol pandan & isi durian",    badge: "Seasonal", img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80" },
  { id: 32, name: "ABC Special",             price: 6.00,  cat: "Dessert",   desc: "Ais batu campur, jelly, kacang merah, jagung & seri kaya",  img: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400&q=80" },
  { id: 33, name: "Kuih Lapis",              price: 3.50,  cat: "Dessert",   desc: "Berlapis-lapis pandan & kelapa, gebu lembut tradisional",  img: "https://images.unsplash.com/photo-1582716401301-b2407dc7563d?w=400&q=80" },
  { id: 34, name: "Puding Roti",             price: 5.00,  cat: "Dessert",   desc: "Lembut custard vanilla, raisin & caramel drizzle",          img: "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=400&q=80" },
];

const catConfig = {
  Semua:   { icon: "◈", color: "#64748b" },
  Nasi:    { icon: "◈", color: "#d97706" },
  Mee:     { icon: "◈", color: "#dc2626" },
  Western: { icon: "◈", color: "#7c3aed" },
  Roti:    { icon: "◈", color: "#b45309" },
  Lauk:    { icon: "◈", color: "#059669" },
  Minuman: { icon: "◈", color: "#0284c7" },
  Dessert: { icon: "◈", color: "#db2777" },
};

const cats = ["Semua", ...Object.keys(catConfig).filter(k => k !== "Semua")];

const BADGE_COLORS = {
  "Bestseller": { bg: "#1a1a2e", text: "#fff" },
  "New":        { bg: "#0284c7", text: "#fff" },
  "Pedas":      { bg: "#dc2626", text: "#fff" },
  "Chef's Pick":{ bg: "#059669", text: "#fff" },
  "Seasonal":   { bg: "#db2777", text: "#fff" },
  "Natural":    { bg: "#16a34a", text: "#fff" },
};

  const [cart, setCart]           = useState({});
  const [activeCat, setActiveCat] = useState("Semua");
  const [cartOpen, setCartOpen]   = useState(false);
  const [note, setNote]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]         = useState(null);
  const [flashId, setFlashId]     = useState(null);
  const [tempPref, setTempPref]   = useState({});

  const filtered = activeCat === "Semua" ? foods : foods.filter(f => f.cat === activeCat);
  const total    = foods.reduce((s, f) => s + f.price * (cart[f.id] || 0), 0);
  const totalQty = Object.values(cart).reduce((s, v) => s + v, 0);

  const getTemp = (id) => tempPref[id] || "hot";
  const setTemp = (id, val) => setTempPref(p => ({ ...p, [id]: val }));

  const add = (id) => {
    setFlashId(id);
    setTimeout(() => setFlashId(null), 400);
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const dec = (id) => {
    setCart(prev => {
      const next = { ...prev, [id]: (prev[id] || 1) - 1 };
      if (next[id] <= 0) delete next[id];
      return next;
    });
  };

  const submitOrder = async () => {
    if (totalQty === 0) return;
    setSubmitting(true);
    const items = foods.filter(f => cart[f.id]).map(f => ({
      id: f.id, name: f.name, price: f.price, qty: cart[f.id],
      ...(f.tempOpts ? { temp: getTemp(f.id) } : {}),
    }));
    try {
      await addDoc(collection(db, "orders"), {
        table: tableId, items, total, note, status: "pending", createdAt: new Date(),
      });
      setCart({}); setNote(""); setCartOpen(false);
      setToast("Pesanan anda telah dihantar. Sila tunggu sebentar.");
      setTimeout(() => setToast(null), 4000);
    } catch (e) { console.error(e); }
    setSubmitting(false);
  };

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } 
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }
        @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.03); } }
        .food-card { transition: box-shadow 0.2s, transform 0.2s; }
        .food-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.10); transform: translateY(-2px); }
        .add-btn:hover { background: #111 !important; }
        .cat-btn:hover { background: #f8f8f8; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={s.toast}>
          <span style={s.toastIcon}>✓</span>
          {toast}
        </div>
      )}

      {/* Header */}
      <header style={s.hdr}>
        <div style={s.brand}>
          <div style={s.brandMark}>WS</div>
          <div>
            <div style={s.brandName}>Warung Selera</div>
            <div style={s.brandSub}>Ipoh, Perak · Est. 2010</div>
          </div>
        </div>
        <div style={s.hdrCenter}>
<div style={s.tableRow}>
  <span style={s.tableLbl}>MEJA</span>

  <span style={s.tableNumber}>
    {tableId}
  </span>
</div>
        </div>
        <button onClick={() => setCartOpen(true)} style={s.cartBtn} className="add-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <span>Pesanan</span>
          {totalQty > 0 && <span style={s.cartCount}>{totalQty}</span>}
        </button>
      </header>

      {/* Body */}
      <div style={s.body}>
        {/* Sidebar */}
        <aside style={s.sidebar}>
          <div style={s.sideLabel}>KATEGORI</div>
          {cats.map(cat => {
            const count = cat === "Semua" ? foods.length : foods.filter(f => f.cat === cat).length;
            const active = activeCat === cat;
            const cfg = catConfig[cat];
            return (
              <button key={cat} onClick={() => setActiveCat(cat)}
                className="cat-btn"
                style={{ ...s.catBtn, ...(active ? { ...s.catBtnActive, borderLeftColor: cfg.color } : {}) }}>
                <span style={{ ...s.catDot, background: active ? cfg.color : "#e2e8f0" }} />
                <span style={{ ...s.catLabel, color: active ? "#111" : "#64748b", fontWeight: active ? 700 : 500 }}>{cat}</span>
                <span style={{ ...s.catCount, background: active ? cfg.color + "18" : "#f1f5f9", color: active ? cfg.color : "#94a3b8" }}>{count}</span>
              </button>
            );
          })}
        </aside>

        {/* Menu */}
        <main style={s.menuWrap}>
          <div style={s.menuHeader}>
            <div>
              <h2 style={s.menuTitle}>{activeCat === "Semua" ? "Semua Menu" : activeCat}</h2>
              <p style={s.menuSub}>{filtered.length} pilihan tersedia</p>
            </div>
          </div>

          <div style={s.grid}>
            {filtered.map(food => {
              const q = cart[food.id] || 0;
              const temp = getTemp(food.id);
              const badgeCfg = food.badge ? BADGE_COLORS[food.badge] : null;
              return (
                <div key={food.id} className="food-card"
                  style={{ ...s.card, ...(flashId === food.id ? { boxShadow: "0 0 0 2px #111" } : {}) }}>
                  {/* Food image */}
                  <div style={s.imgWrap}>
                    <img src={food.img} alt={food.name} style={s.foodImg} loading="lazy"
                      onError={e => { e.target.style.display = "none"; }} />
                    {food.badge && badgeCfg && (
                      <span style={{ ...s.badge, background: badgeCfg.bg, color: badgeCfg.text }}>{food.badge}</span>
                    )}
                  </div>
                  <div style={s.cardTop}>
                    <div style={s.catTag}>{food.cat}</div>
                  </div>
                  <div style={s.cardBody}>
                    <div style={s.foodName}>{food.name}</div>
                    <div style={s.foodDesc}>{food.desc}</div>

                    {/* Hot/Cold toggle for drinks */}
                    {food.tempOpts && (
                      <div style={s.tempRow}>
                        <button onClick={() => setTemp(food.id, "hot")}
                          style={{ ...s.tempBtn, ...(temp === "hot" ? s.tempBtnActive : {}) }}>
                          Panas
                        </button>
                        <button onClick={() => setTemp(food.id, "cold")}
                          style={{ ...s.tempBtn, ...(temp === "cold" ? s.tempBtnActiveBlue : {}) }}>
                          Sejuk
                        </button>
                        <button onClick={() => setTemp(food.id, "iced")}
                          style={{ ...s.tempBtn, ...(temp === "iced" ? s.tempBtnActiveBlue : {}) }}>
                          Ais
                        </button>
                      </div>
                    )}

                    <div style={s.cardFooter}>
                      <div>
                        <span style={s.price}>RM {food.price.toFixed(2)}</span>
                      </div>
                      {q === 0
                        ? <button onClick={() => add(food.id)} className="add-btn" style={s.addBtn}>+ Tambah</button>
                        : (
                          <div style={s.qtyCtrl}>
                            <button onClick={() => dec(food.id)} style={s.qBtn}>−</button>
                            <span style={s.qNum}>{q}</span>
                            <button onClick={() => add(food.id)} style={s.qBtn}>+</button>
                          </div>
                        )
                      }
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Footer bar */}
      <div style={s.footerBar}>
        <div style={s.footerInfo}>
          <div style={s.footerLbl}>{totalQty} item dipilih</div>
          <div style={s.footerTotal}>RM {total.toFixed(2)}</div>
        </div>
        <button onClick={() => setCartOpen(true)} disabled={totalQty === 0}
          style={{ ...s.orderBtn, ...(totalQty === 0 ? { background: "#e2e8f0", color: "#94a3b8", cursor: "not-allowed" } : {}) }}>
          Lihat Pesanan →
        </button>
      </div>

      {/* Cart Drawer */}
      {cartOpen && (
        <div style={s.overlay} onClick={() => setCartOpen(false)}>
          <div style={s.drawer} onClick={e => e.stopPropagation()}>
            <div style={s.drawerHdr}>
              <div>
                <div style={s.drawerTitle}>Pesanan Anda</div>
                const { tableId } = useParams();
              </div>
              <button onClick={() => setCartOpen(false)} style={s.closeBtn}>✕</button>
            </div>

            <div style={s.drawerBody}>
              {totalQty === 0 ? (
                <div style={s.empty}>
                  <div style={s.emptyIcon}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  </div>
                  <div style={s.emptyTxt}>Belum ada item dalam pesanan</div>
                  <div style={s.emptySub}>Pilih hidangan dari menu untuk memulakan</div>
                </div>
              ) : (
                foods.filter(f => cart[f.id]).map(f => {
                  const temp = getTemp(f.id);
                  return (
                    <div key={f.id} style={s.drawerItem}>
                      <img src={f.img} alt={f.name} style={s.drawerImg} loading="lazy"
                        onError={e => { e.target.style.display = "none"; }} />
                      <div style={s.drawerItemInfo}>
                        <div style={s.drawerItemName}>{f.name}</div>
                        {f.tempOpts && <div style={s.drawerItemTemp}>{temp === "hot" ? "Panas" : temp === "cold" ? "Sejuk" : "Ais"}</div>}
                        <div style={s.drawerItemPrice}>RM {(f.price * cart[f.id]).toFixed(2)}</div>
                      </div>
                      <div style={s.qtyCtrl}>
                        <button onClick={() => dec(f.id)} style={s.qBtn}>−</button>
                        <span style={s.qNum}>{cart[f.id]}</span>
                        <button onClick={() => add(f.id)} style={s.qBtn}>+</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {totalQty > 0 && (
              <div style={s.drawerFooter}>
                <div style={s.noteSec}>
                  <label style={s.noteLabel}>Nota Khas</label>
                  <textarea placeholder="Contoh: kurang pedas, tanpa bawang..." value={note}
                    onChange={e => setNote(e.target.value)} rows={2} style={s.noteInput} />
                </div>
                <div style={s.summaryRow}>
                  <div style={s.summaryItem}>
                    <span style={s.summaryLbl}>Subtotal</span>
                    <span style={s.summaryVal}>RM {total.toFixed(2)}</span>
                  </div>
                  <div style={s.summaryItem}>
                    <span style={s.summaryLbl}>Item</span>
                    <span style={s.summaryVal}>{totalQty}</span>
                  </div>
                </div>
                <div style={s.divider} />
                <div style={s.summaryTotal}>
                  <span>Jumlah</span>
                  <span>RM {total.toFixed(2)}</span>
                </div>
                <button onClick={submitOrder} disabled={submitting}
                  style={{ ...s.confirmBtn, ...(submitting ? { background: "#94a3b8" } : {}) }}>
                  {submitting ? "Menghantar pesanan..." : "Sahkan Pesanan"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const s = {
  root:      { minHeight: "100vh", background: "#fafaf9", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif", color: "#0f172a" },
  toast:     { position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, background: "#0f172a", color: "#fff", padding: "14px 24px", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 10, animation: "slideDown 0.3s ease", letterSpacing: 0.2 },
  toastIcon: { width: 22, height: 22, background: "#16a34a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 },

  hdr:        { background: "#fff", borderBottom: "1px solid #e8e8e8", padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 },
  brand:      { display: "flex", alignItems: "center", gap: 12 },
  brandMark:  { width: 38, height: 38, background: "#0f172a", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: -0.5, fontFamily: "'Playfair Display', serif" },
  brandName:  { fontSize: 16, fontWeight: 700, color: "#0f172a", fontFamily: "'Playfair Display', serif", letterSpacing: -0.3 },
  brandSub:   { fontSize: 11, color: "#94a3b8", marginTop: 1, letterSpacing: 0.3 },
  hdrCenter:  { position: "absolute", left: "50%", transform: "translateX(-50%)" },
  tableRow:   { display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 14px" },
  tableLbl:   { fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: 1.2 },
  tableSelect:{ background: "transparent", border: "none", fontSize: 14, fontWeight: 700, color: "#0f172a", cursor: "pointer", outline: "none" },
  cartBtn:    { display: "flex", alignItems: "center", gap: 8, background: "#0f172a", color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", position: "relative", transition: "background 0.15s", letterSpacing: 0.2 },
  cartCount:  { position: "absolute", top: -6, right: -6, background: "#ef4444", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" },

  body:       { display: "flex", flex: 1, overflow: "hidden" },

  sidebar:    { width: 200, flexShrink: 0, background: "#fff", borderRight: "1px solid #e8e8e8", padding: "24px 12px", overflowY: "auto" },
  sideLabel:  { fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: 1.5, padding: "0 10px", marginBottom: 10 },
  catBtn:     { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 10px", borderRadius: 9, border: "none", borderLeft: "3px solid transparent", background: "transparent", cursor: "pointer", marginBottom: 2, transition: "all 0.15s", textAlign: "left" },
  catBtnActive:{ background: "#f8fafc" },
  catDot:     { width: 7, height: 7, borderRadius: "50%", flexShrink: 0, transition: "background 0.2s" },
  catLabel:   { flex: 1, fontSize: 13, transition: "color 0.15s" },
  catCount:   { fontSize: 11, fontWeight: 600, borderRadius: 6, padding: "1px 7px", transition: "all 0.15s" },

  menuWrap:   { flex: 1, overflowY: "auto", padding: "28px 28px 0" },
  menuHeader: { marginBottom: 20 },
  menuTitle:  { fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: "#0f172a", letterSpacing: -0.5 },
  menuSub:    { fontSize: 12, color: "#94a3b8", marginTop: 3 },
  grid:       { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14, paddingBottom: 120 },

  card:       { background: "#fff", borderRadius: 14, border: "1px solid #e8e8e8", overflow: "hidden", display: "flex", flexDirection: "column" },
  imgWrap:    { position: "relative", height: 150, overflow: "hidden", background: "#f0ece8", flexShrink: 0 },
  foodImg:    { width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.3s" },
  cardTop:    { padding: "8px 14px 0", display: "flex", justifyContent: "flex-end", alignItems: "flex-start" },
  badge:      { position: "absolute", top: 10, left: 10, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, letterSpacing: 0.3, zIndex: 1 },
  catTag:     { fontSize: 10, color: "#94a3b8", fontWeight: 500 },
  cardBody:   { padding: "10px 14px 14px", flex: 1, display: "flex", flexDirection: "column" },
  foodName:   { fontSize: 14, fontWeight: 700, color: "#0f172a", lineHeight: 1.3, marginBottom: 5 },
  foodDesc:   { fontSize: 11.5, color: "#64748b", lineHeight: 1.55, flex: 1, marginBottom: 12 },
  tempRow:    { display: "flex", gap: 5, marginBottom: 12 },
  tempBtn:    { flex: 1, fontSize: 10, fontWeight: 600, padding: "5px 0", borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", cursor: "pointer", letterSpacing: 0.2, transition: "all 0.15s" },
  tempBtnActive:     { background: "#fef3c7", borderColor: "#f59e0b", color: "#92400e" },
  tempBtnActiveBlue: { background: "#eff6ff", borderColor: "#3b82f6", color: "#1d4ed8" },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" },
  price:      { fontSize: 16, fontWeight: 700, color: "#0f172a" },
  addBtn:     { background: "#0f172a", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: 0.2, transition: "background 0.15s" },
  qtyCtrl:    { display: "flex", alignItems: "center", gap: 0, background: "#f1f5f9", borderRadius: 8, overflow: "hidden", border: "1px solid #e2e8f0" },
  qBtn:       { background: "transparent", border: "none", width: 30, height: 30, fontSize: 16, cursor: "pointer", color: "#374151", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" },
  qNum:       { fontSize: 13, fontWeight: 700, color: "#0f172a", minWidth: 24, textAlign: "center" },

  footerBar:  { position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #e8e8e8", padding: "14px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 99 },
  footerInfo: {},
  footerLbl:  { fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: 0.5 },
  footerTotal:{ fontSize: 22, fontWeight: 700, color: "#0f172a" },
  orderBtn:   { background: "#0f172a", color: "#fff", border: "none", borderRadius: 11, padding: "13px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: 0.2, transition: "all 0.15s" },

  overlay:    { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", justifyContent: "flex-end" },
  drawer:     { width: "min(400px, 100vw)", background: "#fff", height: "100%", display: "flex", flexDirection: "column", animation: "slideUp 0.25s ease" },
  drawerHdr:  { padding: "22px 24px", borderBottom: "1px solid #e8e8e8", display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  drawerTitle:{ fontSize: 18, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: "#0f172a" },
  drawerSub:  { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  closeBtn:   { background: "#f1f5f9", border: "none", borderRadius: 7, width: 30, height: 30, cursor: "pointer", fontSize: 13, color: "#64748b", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" },
  drawerBody: { flex: 1, overflowY: "auto", padding: "8px 0" },
  empty:      { display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px", gap: 12 },
  emptyIcon:  { width: 64, height: 64, background: "#f8fafc", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" },
  emptyTxt:   { fontSize: 14, fontWeight: 600, color: "#374151" },
  emptySub:   { fontSize: 12, color: "#94a3b8", textAlign: "center" },
  drawerItem: { display: "flex", alignItems: "center", gap: 12, padding: "12px 24px", borderBottom: "1px solid #f1f5f9" },
  drawerImg:  { width: 52, height: 52, borderRadius: 10, objectFit: "cover", flexShrink: 0, background: "#f0ece8" },
  drawerItemInfo:{ flex: 1 },
  drawerItemName:{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 2 },
  drawerItemTemp:{ fontSize: 11, color: "#3b82f6", fontWeight: 500, marginBottom: 2 },
  drawerItemPrice:{ fontSize: 13, fontWeight: 700, color: "#0f172a" },
  drawerFooter:{ padding: "16px 24px 24px", borderTop: "1px solid #e8e8e8" },
  noteSec:    { marginBottom: 16 },
  noteLabel:  { fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: 0.5, display: "block", marginBottom: 7 },
  noteInput:  { width: "100%", border: "1px solid #e2e8f0", borderRadius: 9, padding: "9px 12px", fontSize: 12, resize: "none", outline: "none", fontFamily: "inherit", color: "#0f172a", background: "#fafaf9" },
  summaryRow: { display: "flex", gap: 0, flexDirection: "column", gap: 6, marginBottom: 12 },
  summaryItem:{ display: "flex", justifyContent: "space-between" },
  summaryLbl: { fontSize: 12, color: "#64748b" },
  summaryVal: { fontSize: 12, fontWeight: 600, color: "#0f172a" },
  divider:    { height: 1, background: "#e8e8e8", margin: "12px 0" },
  summaryTotal:{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 700, color: "#0f172a", fontFamily: "'Playfair Display', serif", marginBottom: 16 },
  confirmBtn: { width: "100%", background: "#0f172a", color: "#fff", border: "none", borderRadius: 11, padding: 14, fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: 0.2, transition: "background 0.15s" },
  tableNumber: {
  fontSize: 14,
  fontWeight: 700,
  color: "#0f172a",
},
};
export default Customer;