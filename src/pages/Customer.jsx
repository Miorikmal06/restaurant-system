import { addDoc, collection, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";

// ─── DATA ────────────────────────────────────────────────────────────────────
const foods = [
  { id: 1,  name: "Nasi Goreng Kampung",   price: 8.50,  cat: "Nasi",    desc: "Sambal belacan wangi, telur mata, ikan bilis & keropok rangup",          badge: "Terlaris", img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80" },
  { id: 2,  name: "Nasi Lemak Special",    price: 10.50, cat: "Nasi",    desc: "Nasi santan pandan, sambal sotong, rendang ayam & acar timun",            img: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&q=80" },
  { id: 3,  name: "Nasi Ayam Hainan",      price: 9.50,  cat: "Nasi",    desc: "Nasi minyak wangi, ayam rebus lembut dengan sos halia & kicap",          badge: "Baru",     img: "https://images.unsplash.com/photo-1598515213692-30cb7cca5bc0?w=600&q=80" },
  { id: 4,  name: "Nasi Briyani Kambing",  price: 15.00, cat: "Nasi",    desc: "Basmati rempah ratus, daging kambing empuk & acar dalca",                 badge: "Pilihan Chef", img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80" },
  { id: 5,  name: "Nasi Kandar Beratur",   price: 11.00, cat: "Nasi",    desc: "Pilihan lauk 3 jenis, kuah banjir campur & papadom",                      img: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&q=80" },
  { id: 6,  name: "Mee Goreng Mamak",      price: 7.00,  cat: "Mee",     desc: "Pedas rangup dengan tauhu, sotong, udang & beansprout",                   badge: "Pedas",    img: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&q=80" },
  { id: 7,  name: "Laksa Assam Perak",     price: 9.00,  cat: "Mee",     desc: "Kuah asam segar, ikan kembung, daun kesum & bunga kantan",                img: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&q=80" },
  { id: 8,  name: "Char Kuey Teow",        price: 8.50,  cat: "Mee",     desc: "Wok hei tinggi, udang besar, telur, tauge & kucai",                       badge: "Terlaris", img: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=600&q=80" },
  { id: 9,  name: "Mee Rebus Johor",       price: 8.00,  cat: "Mee",     desc: "Kuah pekat manis, tauhu goreng, telur rebus & sambal",                    img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80" },
  { id: 10, name: "Mee Sup Tulang",        price: 10.00, cat: "Mee",     desc: "Sup tulang rusuk pekat, mee kuning, bawang goreng & daun sup",            img: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80" },
  { id: 11, name: "Burger Ramly Double",   price: 12.00, cat: "Western", desc: "Double beef patty, cheese leleh, sayur & sos istimewa warung",            badge: "Baru",     img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80" },
  { id: 12, name: "Chicken Chop Grill",    price: 14.00, cat: "Western", desc: "Ayam percik grill, mushroom cream sauce, mashed potato & coleslaw",       img: "https://images.unsplash.com/photo-1598515213692-30cb7cca5bc0?w=600&q=80" },
  { id: 13, name: "Fish & Chips",          price: 13.00, cat: "Western", desc: "Ikan dori salut tepung rangup, kentang goreng & tartare sauce",            img: "https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=600&q=80" },
  { id: 14, name: "Spaghetti Aglio Olio",  price: 12.00, cat: "Western", desc: "Olive oil, bawang putih, chili flakes, parsley & parmesan",               img: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80" },
  { id: 15, name: "Roti Canai Banjir",     price: 5.50,  cat: "Roti",   desc: "Rangup garing, kuah dal pekat & kari ayam banjir",                         img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80" },
  { id: 16, name: "Tosai Telur",           price: 6.00,  cat: "Roti",   desc: "Tipis rangup, kuah sambal & coconut chutney hijau",                        img: "https://images.unsplash.com/photo-1630409351241-e90e7f6b4e05?w=600&q=80" },
  { id: 17, name: "Roti Bakar Kaya",       price: 4.50,  cat: "Roti",   desc: "Kaya pandan wangi, mentega salted & telur separuh masak",                  img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80" },
  { id: 18, name: "Capati Tandoor",        price: 5.00,  cat: "Roti",   desc: "Lembut gebu dari tandoor, dihidang dengan dhal & achar",                   img: "https://images.unsplash.com/photo-1604152135912-04a022e23696?w=600&q=80" },
  { id: 19, name: "Ayam Goreng Berempah",  price: 7.00,  cat: "Lauk",   desc: "Rangup berempah 12 rempah, dihidang dengan sambal & timun",                img: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&q=80" },
  { id: 20, name: "Ikan Bakar Stingray",   price: 16.00, cat: "Lauk",   desc: "Ikan pari bakar, sambal kicap, bawang & limau nipis",                      badge: "Pilihan Chef", img: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&q=80" },
  { id: 21, name: "Udang Masak Lemak",     price: 14.00, cat: "Lauk",   desc: "Santan lemak manis, kunyit, cili api & daun kesum",                        img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80" },
  { id: 22, name: "Sotong Goreng Tepung",  price: 10.00, cat: "Lauk",   desc: "Rangup golden, dipping sauce pedas manis & salad timun",                   img: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80" },
  { id: 23, name: "Teh Tarik",             price: 2.50,  cat: "Minuman", desc: "Susu pekat buih tebal, harum rempah pilihan",            tempOpts: true,  img: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&q=80" },
  { id: 24, name: "Kopi O",               price: 2.00,  cat: "Minuman", desc: "Kopi robusta pekat, gula batu tradisional",              tempOpts: true,  img: "https://images.unsplash.com/photo-1495774856032-8b90bbb32b32?w=600&q=80" },
  { id: 25, name: "Milo",                 price: 3.00,  cat: "Minuman", desc: "Classic Malaysian favourite, creamy dan berkhasiat",     tempOpts: true,  img: "https://images.unsplash.com/photo-1610721254726-ffd46f740d16?w=600&q=80" },
  { id: 26, name: "Bandung Rose",         price: 3.50,  cat: "Minuman", desc: "Susu evap dengan rose syrup, segar & manis",             tempOpts: true,  img: "https://images.unsplash.com/photo-1554043823-d5a8a7d5f87f?w=600&q=80" },
  { id: 27, name: "Sirap Selasih",        price: 2.50,  cat: "Minuman", desc: "Manis segar dengan biji selasih mengembang",             tempOpts: true,  img: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&q=80" },
  { id: 28, name: "Air Kelapa Muda",      price: 5.00,  cat: "Minuman", desc: "Segar semula jadi, isi kelapa muda lembut",              tempOpts: false, badge: "Semulajadi", img: "https://images.unsplash.com/photo-1536708880921-03a9306ec47d?w=600&q=80" },
  { id: 29, name: "Jus Mangga",           price: 5.50,  cat: "Minuman", desc: "Mangga harum manis segar, tanpa gula tambah",            tempOpts: false, img: "https://images.unsplash.com/photo-1546173159-315724a31696?w=600&q=80" },
  { id: 30, name: "Lemon Honey",          price: 5.00,  cat: "Minuman", desc: "Madu asli, lemon segar & halia",                        tempOpts: true,  img: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&q=80" },
  { id: 31, name: "Cendol Durian",        price: 7.50,  cat: "Dessert", desc: "Santan segar, gula melaka, cendol pandan & isi durian",  badge: "Bermusim", img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80" },
  { id: 32, name: "ABC Special",          price: 6.00,  cat: "Dessert", desc: "Ais batu campur, jelly, kacang merah, jagung & seri kaya", img: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=600&q=80" },
  { id: 33, name: "Kuih Lapis",           price: 3.50,  cat: "Dessert", desc: "Berlapis-lapis pandan & kelapa, gebu lembut tradisional",  img: "https://images.unsplash.com/photo-1582716401301-b2407dc7563d?w=600&q=80" },
  { id: 34, name: "Puding Roti",          price: 5.00,  cat: "Dessert", desc: "Lembut custard vanilla, raisin & caramel drizzle",         img: "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=600&q=80" },
];

const CATS = ["Semua", "Nasi", "Mee", "Western", "Roti", "Lauk", "Minuman", "Dessert"];

const CAT_COLOR = {
  Semua: "#1e293b", Nasi: "#b45309", Mee: "#dc2626",
  Western: "#6d28d9", Roti: "#92400e", Lauk: "#065f46",
  Minuman: "#1d4ed8", Dessert: "#be185d",
};

const BADGE_STYLE = {
  "Terlaris":    { bg: "#1e293b", txt: "#fff" },
  "Baru":        { bg: "#2563eb", txt: "#fff" },
  "Pedas":       { bg: "#dc2626", txt: "#fff" },
  "Pilihan Chef":{ bg: "#065f46", txt: "#fff" },
  "Bermusim":    { bg: "#be185d", txt: "#fff" },
  "Semulajadi":  { bg: "#15803d", txt: "#fff" },
};

const TEMP_OPTS = [
  { val: "hot",  label: "Panas ☕" },
  { val: "cold", label: "Sejuk 🧊" },
  { val: "iced", label: "Ais 🥤" },
];

// ─── ETA COUNTDOWN HOOK ──────────────────────────────────────────────────────
function useCountdown(readyAt) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!readyAt) return;
    const t = setInterval(() => setTick(p => p + 1), 1000);
    return () => clearInterval(t);
  }, [readyAt]);

  if (!readyAt) return null;
  const target = readyAt.toDate ? readyAt.toDate() : new Date(readyAt);
  const diff   = Math.floor((target.getTime() - Date.now()) / 1000);
  if (diff <= 0) return { done: true, label: "Dah siap!", mins: 0, secs: 0, pct: 100 };
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  return { done: false, label: `${m}:${String(s).padStart(2, "0")}`, mins: m, secs: s, pct: null };
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
function Customer() {
  const { tableId } = useParams();

  const [cart, setCart]             = useState({});
  const [activeCat, setActiveCat]   = useState("Semua");
  const [screen, setScreen]         = useState("menu"); // menu | cart | success
  const [note, setNote]             = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tempPref, setTempPref]     = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const catBarRef                   = useRef(null);

  // Track the last submitted order doc for real-time ETA
  const [orderId, setOrderId]       = useState(null);
  const [orderDoc, setOrderDoc]     = useState(null);
  const [lastTotal, setLastTotal]   = useState(0);

  // Live listener for the submitted order (ETA updates from admin)
  useEffect(() => {
    if (!orderId) return;
    const unsub = onSnapshot(doc(db, "orders", orderId), snap => {
      if (snap.exists()) setOrderDoc({ id: snap.id, ...snap.data() });
    });
    return unsub;
  }, [orderId]);

  const countdown = useCountdown(orderDoc?.readyAt ?? null);

  const filtered   = activeCat === "Semua" ? foods : foods.filter(f => f.cat === activeCat);
  const total      = foods.reduce((s, f) => s + f.price * (cart[f.id] || 0), 0);
  const totalQty   = Object.values(cart).reduce((s, v) => s + v, 0);
  const cartItems  = foods.filter(f => cart[f.id]);

  const getTemp  = (id) => tempPref[id] || "hot";
  const setTemp  = (id, val) => setTempPref(p => ({ ...p, [id]: val }));

  const add = (id) => setCart(p => ({ ...p, [id]: (p[id] || 0) + 1 }));
  const dec = (id) => setCart(p => {
    const n = { ...p, [id]: (p[id] || 1) - 1 };
    if (n[id] <= 0) delete n[id];
    return n;
  });

  const selectCat = (cat) => {
    setActiveCat(cat);
    setTimeout(() => {
      const el = catBarRef.current?.querySelector(`[data-cat="${cat}"]`);
      el?.scrollIntoView({ inline: "center", behavior: "smooth" });
    }, 50);
  };

  const submitOrder = async () => {
    if (!totalQty) return;
    setSubmitting(true);
    const items = foods.filter(f => cart[f.id]).map(f => ({
      id: f.id, name: f.name, price: f.price, qty: cart[f.id],
      ...(f.tempOpts ? { temp: getTemp(f.id) } : {}),
    }));
    try {
      const ref = await addDoc(collection(db, "orders"), {
        table: tableId, items, total, note, status: "pending", createdAt: new Date(),
      });
      setLastTotal(total);
      setOrderId(ref.id);     // start listening to this order
      setOrderDoc(null);      // reset (listener will populate)
      setCart({}); setNote("");
      setScreen("success");
    } catch (e) { console.error(e); }
    setSubmitting(false);
  };

  // ── SUCCESS SCREEN ──────────────────────────────────────────────────────────
  if (screen === "success") {
    const etaMins = orderDoc?.etaMins ?? null;
    const readyAt = orderDoc?.readyAt ?? null;

    // Format ready time
    const fmtReadyTime = (ts) => {
      if (!ts) return null;
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" });
    };

    return (
      <div style={ss.successPage}>
        <style>{globalCss}</style>
        <div style={ss.successBox}>

          {/* Check / clock icon */}
          {countdown?.done ? (
            <div style={{ ...ss.checkCircle, background: "#16a34a" }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          ) : (
            <div style={{ ...ss.checkCircle, background: "#1e293b" }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
          )}

          <div style={ss.successTitle}>
            {countdown?.done ? "Pesanan Dah Siap! 🎉" : "Pesanan Dihantar!"}
          </div>
          <div style={ss.successSub}>Meja {tableId} · Sila tunggu sebentar</div>
          <div style={ss.successAmt}>RM {lastTotal.toFixed(2)}</div>

          {/* ETA Block — shows when admin sets it */}
          {readyAt && countdown && !countdown.done && (
            <div style={ss.etaCard}>
              <div style={ss.etaCardTop}>
                <span style={ss.etaCardIcon}>⏱</span>
                <span style={ss.etaCardTitle}>Masa Anggaran Siap</span>
              </div>
              {/* Big countdown */}
              <div style={ss.etaCountdown}>{countdown.label}</div>
              <div style={ss.etaReadyAt}>Dijangka siap pada {fmtReadyTime(readyAt)}</div>
              <div style={ss.etaBarWrap}>
                <EtaProgressBar readyAt={readyAt} etaMins={etaMins} />
              </div>
              <div style={ss.etaHint}>Halaman ini dikemaskini secara automatik</div>
            </div>
          )}

          {/* Done state */}
          {countdown?.done && (
            <div style={{ ...ss.etaCard, background: "#f0fdf4", border: "1.5px solid #86efac" }}>
              <div style={ss.etaDoneMsg}>
                🍽️ Pesanan anda sedang dibawa ke meja.<br />Selamat menjamu selera!
              </div>
            </div>
          )}

          {/* Waiting — no ETA yet */}
          {!readyAt && (
            <div style={ss.waitingCard}>
              <div style={ss.waitingDots}>
                <span className="dot" /><span className="dot" /><span className="dot" />
              </div>
              <div style={ss.waitingTxt}>Menunggu pengesahan masa dari dapur...</div>
            </div>
          )}

          <div style={ss.successNote}>Staf kami sedang menyediakan pesanan anda</div>

          <button onClick={() => setScreen("menu")} style={ss.backToMenuBtn}>
            Kembali ke Menu
          </button>
        </div>
      </div>
    );
  }

  // ── CART SCREEN ─────────────────────────────────────────────────────────────
  if (screen === "cart") {
    return (
      <div style={ss.page}>
        <style>{globalCss}</style>

        <div style={ss.cartHdr}>
          <button onClick={() => setScreen("menu")} style={ss.backBtn}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style={ss.cartHdrTitle}>Pesanan Anda</div>
          <div style={ss.cartHdrSub}>Meja {tableId}</div>
        </div>

        <div style={ss.cartBody}>
          {cartItems.length === 0 ? (
            <div style={ss.emptyState}>
              <div style={ss.emptyIco}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </div>
              <div style={ss.emptyTxt}>Keranjang kosong</div>
              <div style={ss.emptyHint}>Pilih hidangan dari menu</div>
              <button onClick={() => setScreen("menu")} style={ss.goMenuBtn}>Lihat Menu</button>
            </div>
          ) : (
            <>
              <div style={ss.cartSection}>
                <div style={ss.sectionLabel}>Item Dipilih</div>
                {cartItems.map(f => {
                  const temp = getTemp(f.id);
                  return (
                    <div key={f.id} style={ss.cartRow}>
                      <img src={f.img} alt={f.name} style={ss.cartThumb} onError={e => e.target.style.display = "none"} />
                      <div style={ss.cartRowInfo}>
                        <div style={ss.cartRowName}>{f.name}</div>
                        {f.tempOpts && (
                          <div style={ss.cartRowTemp}>
                            {temp === "hot" ? "☕ Panas" : temp === "cold" ? "🧊 Sejuk" : "🥤 Ais"}
                          </div>
                        )}
                        <div style={ss.cartRowPrice}>RM {(f.price * cart[f.id]).toFixed(2)}</div>
                      </div>
                      <div style={ss.qRow}>
                        <button onClick={() => dec(f.id)} style={ss.qbCart}>−</button>
                        <span style={ss.qnCart}>{cart[f.id]}</span>
                        <button onClick={() => add(f.id)} style={ss.qbCart}>+</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={ss.cartSection}>
                <div style={ss.sectionLabel}>Nota Khas (Pilihan)</div>
                <textarea
                  placeholder="Contoh: kurang pedas, tanpa bawang, extra sambal..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={3}
                  style={ss.noteInput}
                />
              </div>

              <div style={ss.cartSection}>
                <div style={ss.sectionLabel}>Ringkasan</div>
                <div style={ss.summaryCard}>
                  <div style={ss.summaryLine}>
                    <span style={ss.summaryKey}>Bilangan item</span>
                    <span style={ss.summaryVal}>{totalQty} item</span>
                  </div>
                  <div style={ss.summaryLine}>
                    <span style={ss.summaryKey}>Subtotal</span>
                    <span style={ss.summaryVal}>RM {total.toFixed(2)}</span>
                  </div>
                  <div style={ss.divider} />
                  <div style={ss.summaryLine}>
                    <span style={ss.summaryKeyBold}>Jumlah Bayaran</span>
                    <span style={ss.summaryBig}>RM {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {cartItems.length > 0 && (
          <div style={ss.cartFooter}>
            <button onClick={submitOrder} disabled={submitting} style={ss.confirmBtn}>
              {submitting
                ? <span>Menghantar pesanan...</span>
                : <><span>Hantar Pesanan</span><span style={ss.confirmAmt}>RM {total.toFixed(2)}</span></>
              }
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── MENU SCREEN ─────────────────────────────────────────────────────────────
  return (
    <div style={ss.page}>
      <style>{globalCss}</style>

      <div style={ss.hdr}>
        <div style={ss.hdrLeft}>
          <div style={ss.brandMark}>WS</div>
          <div>
            <div style={ss.brandName}>Warung Selera</div>
            <div style={ss.brandSub}>Ipoh, Perak</div>
          </div>
        </div>
        <div style={ss.tablePill}>
          <span style={ss.tablePillLbl}>Meja</span>
          <span style={ss.tablePillNum}>{tableId}</span>
        </div>
      </div>

      <div style={ss.catBar} ref={catBarRef}>
        {CATS.map(cat => {
          const active = activeCat === cat;
          const count  = cat === "Semua" ? foods.length : foods.filter(f => f.cat === cat).length;
          return (
            <button
              key={cat}
              data-cat={cat}
              onClick={() => selectCat(cat)}
              style={{
                ...ss.catChip,
                background: active ? CAT_COLOR[cat] : "#f1f5f9",
                color: active ? "#fff" : "#475569",
                fontWeight: active ? 700 : 500,
              }}
            >
              {cat}
              <span style={{
                ...ss.catChipCount,
                background: active ? "rgba(255,255,255,0.25)" : "#e2e8f0",
                color: active ? "#fff" : "#94a3b8",
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      <div style={ss.sectionHead}>
        <span style={ss.sectionHeadTxt}>{activeCat === "Semua" ? "Semua Menu" : activeCat}</span>
        <span style={ss.sectionHeadCount}>{filtered.length} hidangan</span>
      </div>

      <div style={ss.foodList}>
        {filtered.map(food => {
          const q        = cart[food.id] || 0;
          const temp     = getTemp(food.id);
          const expanded = expandedId === food.id;
          const badgeCfg = food.badge ? BADGE_STYLE[food.badge] : null;

          return (
            <div key={food.id} style={ss.foodCard} className="food-card">
              <div style={ss.foodImgWrap} onClick={() => setExpandedId(expanded ? null : food.id)}>
                <img src={food.img} alt={food.name} style={ss.foodImg} loading="lazy"
                  onError={e => e.target.style.display = "none"} />
                {badgeCfg && (
                  <span style={{ ...ss.foodBadge, background: badgeCfg.bg, color: badgeCfg.txt }}>
                    {food.badge}
                  </span>
                )}
                {food.cat === "Minuman" && (
                  <span style={ss.drinkTag}>Minuman</span>
                )}
              </div>

              <div style={ss.foodInfo}>
                <div style={ss.foodInfoTop}>
                  <div style={ss.foodName}>{food.name}</div>
                  <div style={ss.foodPrice}>RM {food.price.toFixed(2)}</div>
                </div>
                <div style={ss.foodDesc}>{food.desc}</div>

                {food.tempOpts && (
                  <div style={ss.tempRow}>
                    {TEMP_OPTS.map(o => (
                      <button
                        key={o.val}
                        onClick={() => setTemp(food.id, o.val)}
                        style={{
                          ...ss.tempBtn,
                          ...(temp === o.val
                            ? o.val === "hot" ? ss.tempHot : ss.tempCold
                            : {}),
                        }}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                )}

                <div style={ss.foodAction}>
                  {q === 0 ? (
                    <button onClick={() => add(food.id)} style={ss.addBtn} className="tap-btn">
                      + Tambah ke Pesanan
                    </button>
                  ) : (
                    <div style={ss.qtyRow}>
                      <button onClick={() => dec(food.id)} style={ss.qbLg}>−</button>
                      <span style={ss.qnLg}>{q}</span>
                      <button onClick={() => add(food.id)} style={ss.qbLg}>+</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div style={{ height: 100 }} />
      </div>

      <div style={ss.bottomBar}>
        <div style={ss.bottomLeft}>
          <div style={ss.bottomQty}>{totalQty === 0 ? "Tiada item" : `${totalQty} item dipilih`}</div>
          <div style={ss.bottomTotal}>RM {total.toFixed(2)}</div>
        </div>
        <button
          onClick={() => setScreen("cart")}
          disabled={totalQty === 0}
          style={{ ...ss.viewCartBtn, ...(totalQty === 0 ? ss.viewCartBtnOff : {}) }}
          className="tap-btn"
        >
          Lihat Pesanan →
        </button>
      </div>
    </div>
  );
}

// ─── ETA PROGRESS BAR ────────────────────────────────────────────────────────
// Animated progress bar from 0→100% as time counts down
function EtaProgressBar({ readyAt, etaMins }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const update = () => {
      const target  = (readyAt?.toDate ? readyAt.toDate() : new Date(readyAt)).getTime();
      const total   = (etaMins || 1) * 60 * 1000;
      const start   = target - total;
      const elapsed = Date.now() - start;
      setPct(Math.min(100, Math.max(0, (elapsed / total) * 100)));
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [readyAt, etaMins]);

  return (
    <div style={ss.progressTrack}>
      <div style={{ ...ss.progressFill, width: `${pct}%` }} />
    </div>
  );
}

// ─── GLOBAL CSS ──────────────────────────────────────────────────────────────
const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f8fafc; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { display: none; }

  .food-card { transition: transform 0.15s ease; }
  .food-card:active { transform: scale(0.985); }
  .tap-btn:active { opacity: 0.8; transform: scale(0.97); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes popIn {
    0%   { transform: scale(0.7); opacity: 0; }
    80%  { transform: scale(1.05); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes blink {
    0%, 100% { opacity: 0.2; transform: scale(0.8); }
    50%       { opacity: 1;   transform: scale(1.2); }
  }
  .dot {
    display: inline-block;
    width: 8px; height: 8px;
    background: #94a3b8;
    border-radius: 50%;
    margin: 0 3px;
    animation: blink 1.4s ease-in-out infinite;
  }
  .dot:nth-child(2) { animation-delay: 0.2s; }
  .dot:nth-child(3) { animation-delay: 0.4s; }
`;

// ─── STYLES ──────────────────────────────────────────────────────────────────
const ss = {
  page:         { minHeight: "100dvh", background: "#f8fafc", display: "flex", flexDirection: "column", fontFamily: "'Plus Jakarta Sans', sans-serif", maxWidth: 480, margin: "0 auto", position: "relative" },

  hdr:          { background: "#fff", padding: "14px 18px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, zIndex: 50 },
  hdrLeft:      { display: "flex", alignItems: "center", gap: 10 },
  brandMark:    { width: 40, height: 40, background: "#1e293b", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", letterSpacing: -0.5, flexShrink: 0 },
  brandName:    { fontSize: 16, fontWeight: 800, color: "#1e293b", letterSpacing: -0.3, lineHeight: 1.2 },
  brandSub:     { fontSize: 11, color: "#94a3b8", marginTop: 1 },
  tablePill:    { background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 10, padding: "6px 14px", display: "flex", alignItems: "center", gap: 6 },
  tablePillLbl: { fontSize: 11, color: "#94a3b8", fontWeight: 600, letterSpacing: 0.5 },
  tablePillNum: { fontSize: 16, fontWeight: 800, color: "#1e293b" },

  catBar:       { display: "flex", gap: 8, padding: "14px 18px", overflowX: "auto", background: "#fff", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 66, zIndex: 40 },
  catChip:      { display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 50, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", transition: "all 0.2s ease", flexShrink: 0 },
  catChipCount: { fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "1px 7px", transition: "all 0.2s" },

  sectionHead:      { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px 8px" },
  sectionHeadTxt:   { fontSize: 20, fontWeight: 800, color: "#1e293b", letterSpacing: -0.4 },
  sectionHeadCount: { fontSize: 13, color: "#94a3b8", fontWeight: 500 },

  foodList:    { padding: "0 18px", display: "flex", flexDirection: "column", gap: 14 },
  foodCard:    { background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" },
  foodImgWrap: { position: "relative", height: 190, overflow: "hidden", background: "#f0ece8" },
  foodImg:     { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  foodBadge:   { position: "absolute", top: 12, left: 12, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, letterSpacing: 0.2 },
  drinkTag:    { position: "absolute", bottom: 10, right: 10, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 20, letterSpacing: 0.3 },

  foodInfo:    { padding: "14px 16px 16px" },
  foodInfoTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 6 },
  foodName:    { fontSize: 16, fontWeight: 700, color: "#1e293b", lineHeight: 1.3, flex: 1 },
  foodPrice:   { fontSize: 17, fontWeight: 800, color: "#1e293b", flexShrink: 0 },
  foodDesc:    { fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 12 },

  tempRow:  { display: "flex", gap: 6, marginBottom: 14 },
  tempBtn:  { flex: 1, fontSize: 12, fontWeight: 600, padding: "8px 4px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#64748b", cursor: "pointer", transition: "all 0.15s", textAlign: "center" },
  tempHot:  { background: "#fff7ed", borderColor: "#fb923c", color: "#c2410c", fontWeight: 700 },
  tempCold: { background: "#eff6ff", borderColor: "#60a5fa", color: "#1d4ed8", fontWeight: 700 },

  foodAction: { display: "flex", justifyContent: "flex-end" },
  addBtn:     { background: "#1e293b", color: "#fff", border: "none", borderRadius: 12, padding: "11px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: 0.1, transition: "all 0.15s", width: "100%" },
  qtyRow:     { display: "flex", alignItems: "center", gap: 0, background: "#f1f5f9", borderRadius: 12, overflow: "hidden", width: "100%" },
  qbLg:       { background: "transparent", border: "none", flex: 1, height: 46, fontSize: 22, fontWeight: 700, cursor: "pointer", color: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center" },
  qnLg:       { fontSize: 18, fontWeight: 800, color: "#1e293b", minWidth: 40, textAlign: "center" },

  bottomBar:    { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#fff", borderTop: "1px solid #f1f5f9", padding: "12px 18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, zIndex: 60, boxShadow: "0 -4px 20px rgba(0,0,0,0.06)" },
  bottomLeft:   {},
  bottomQty:    { fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: 0.3 },
  bottomTotal:  { fontSize: 22, fontWeight: 800, color: "#1e293b", letterSpacing: -0.5 },
  viewCartBtn:  { background: "#1e293b", color: "#fff", border: "none", borderRadius: 14, padding: "13px 22px", fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: 0.1, whiteSpace: "nowrap", transition: "all 0.15s" },
  viewCartBtnOff:{ background: "#e2e8f0", color: "#94a3b8", cursor: "not-allowed" },

  // Cart
  cartHdr:     { background: "#fff", padding: "16px 18px 14px", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, zIndex: 50 },
  backBtn:     { background: "none", border: "none", cursor: "pointer", color: "#1e293b", padding: "0 0 2px", marginBottom: 4, display: "flex", alignItems: "center" },
  cartHdrTitle:{ fontSize: 22, fontWeight: 800, color: "#1e293b", letterSpacing: -0.4 },
  cartHdrSub:  { fontSize: 13, color: "#94a3b8", marginTop: 2 },
  cartBody:    { flex: 1, overflowY: "auto", paddingBottom: 120 },
  cartSection: { padding: "16px 18px 0" },
  sectionLabel:{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 },
  cartRow:     { display: "flex", alignItems: "center", gap: 12, background: "#fff", borderRadius: 14, padding: "12px", marginBottom: 10, border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  cartThumb:   { width: 60, height: 60, borderRadius: 10, objectFit: "cover", flexShrink: 0, background: "#f0ece8" },
  cartRowInfo: { flex: 1 },
  cartRowName: { fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 2, lineHeight: 1.3 },
  cartRowTemp: { fontSize: 12, color: "#2563eb", fontWeight: 600, marginBottom: 3 },
  cartRowPrice:{ fontSize: 15, fontWeight: 800, color: "#1e293b" },
  qRow:        { display: "flex", alignItems: "center", gap: 0, background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden" },
  qbCart:      { background: "transparent", border: "none", width: 34, height: 34, fontSize: 18, fontWeight: 800, cursor: "pointer", color: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center" },
  qnCart:      { fontSize: 15, fontWeight: 800, color: "#1e293b", minWidth: 28, textAlign: "center" },
  noteInput:   { width: "100%", background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "12px 14px", fontSize: 14, resize: "none", outline: "none", fontFamily: "inherit", color: "#1e293b", lineHeight: 1.6, marginTop: 4 },
  summaryCard: { background: "#fff", borderRadius: 14, padding: "16px", border: "1px solid #f1f5f9", marginTop: 4, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  summaryLine: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  summaryKey:  { fontSize: 14, color: "#64748b" },
  summaryVal:  { fontSize: 14, fontWeight: 600, color: "#1e293b" },
  summaryKeyBold:{ fontSize: 15, fontWeight: 700, color: "#1e293b" },
  summaryBig:  { fontSize: 22, fontWeight: 800, color: "#1e293b", letterSpacing: -0.5 },
  divider:     { height: 1, background: "#f1f5f9", margin: "10px 0" },
  cartFooter:  { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#fff", padding: "12px 18px 24px", borderTop: "1px solid #f1f5f9", zIndex: 60 },
  confirmBtn:  { width: "100%", background: "#1e293b", color: "#fff", border: "none", borderRadius: 16, padding: "16px 20px", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", letterSpacing: 0.1, transition: "opacity 0.15s" },
  confirmAmt:  { fontSize: 16, fontWeight: 800 },

  emptyState:  { display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px", gap: 12 },
  emptyIco:    { width: 80, height: 80, background: "#f8fafc", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #f1f5f9", marginBottom: 4 },
  emptyTxt:    { fontSize: 18, fontWeight: 700, color: "#1e293b" },
  emptyHint:   { fontSize: 14, color: "#94a3b8" },
  goMenuBtn:   { marginTop: 8, background: "#1e293b", color: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer" },

  // ── SUCCESS screen ────────────────────────────────────────────────────────
  successPage:  { minHeight: "100dvh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 24 },
  successBox:   { background: "#fff", borderRadius: 24, padding: "36px 28px 28px", textAlign: "center", width: "100%", maxWidth: 380, boxShadow: "0 4px 32px rgba(0,0,0,0.08)", animation: "fadeUp 0.4s ease", display: "flex", flexDirection: "column", gap: 8, alignItems: "center" },
  checkCircle:  { width: 80, height: 80, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", animation: "popIn 0.5s ease", marginBottom: 4 },
  successTitle: { fontSize: 24, fontWeight: 800, color: "#1e293b", letterSpacing: -0.5 },
  successSub:   { fontSize: 14, color: "#64748b" },
  successAmt:   { fontSize: 36, fontWeight: 800, color: "#1e293b", letterSpacing: -1, margin: "4px 0 8px" },
  successNote:  { fontSize: 13, color: "#94a3b8", lineHeight: 1.6, marginTop: 4 },

  // ETA card on success screen
  etaCard: {
    width: "100%",
    background: "#f0f9ff",
    border: "1.5px solid #bae6fd",
    borderRadius: 16,
    padding: "16px 18px",
    textAlign: "left",
    display: "flex", flexDirection: "column", gap: 8,
  },
  etaCardTop:   { display: "flex", alignItems: "center", gap: 8 },
  etaCardIcon:  { fontSize: 18 },
  etaCardTitle: { fontSize: 12, fontWeight: 700, color: "#0369a1", letterSpacing: 0.3, textTransform: "uppercase" },
  etaCountdown: { fontSize: 42, fontWeight: 800, color: "#1e293b", letterSpacing: -2, lineHeight: 1, fontVariantNumeric: "tabular-nums" },
  etaReadyAt:   { fontSize: 13, color: "#475569", fontWeight: 600 },
  etaBarWrap:   { marginTop: 4 },
  progressTrack:{ height: 6, background: "#e0f2fe", borderRadius: 99, overflow: "hidden" },
  progressFill: { height: "100%", background: "linear-gradient(90deg, #38bdf8, #0ea5e9)", borderRadius: 99, transition: "width 1s linear" },
  etaHint:      { fontSize: 11, color: "#94a3b8", textAlign: "center" },

  etaDoneMsg:   { fontSize: 15, fontWeight: 600, color: "#15803d", lineHeight: 1.7, textAlign: "center" },

  // Waiting dots card
  waitingCard:  { width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16, padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  waitingDots:  { display: "flex", alignItems: "center" },
  waitingTxt:   { fontSize: 13, color: "#94a3b8", textAlign: "center" },

  backToMenuBtn: { marginTop: 8, background: "transparent", border: "1.5px solid #e2e8f0", color: "#64748b", borderRadius: 12, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%" },
};

export default Customer;