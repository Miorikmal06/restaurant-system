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

const CAT_EMOJI = {
  Semua: "🍽️", Nasi: "🍚", Mee: "🍜", Western: "🍔",
  Roti: "🫓", Lauk: "🐟", Minuman: "🧃", Dessert: "🍮",
};

const BADGE_CONFIG = {
  "Terlaris":     { bg: "#C0392B", txt: "#FFF5F0" },
  "Baru":         { bg: "#1A6B4A", txt: "#F0FFF8" },
  "Pedas":        { bg: "#B7410E", txt: "#FFF3EE" },
  "Pilihan Chef": { bg: "#5C3317", txt: "#FDF0E6" },
  "Bermusim":     { bg: "#7B3F8C", txt: "#FAF0FF" },
  "Semulajadi":   { bg: "#2E7D32", txt: "#F1FFF3" },
};

const TEMP_OPTS = [
  { val: "hot",  label: "☕ Panas" },
  { val: "cold", label: "🧊 Sejuk" },
  { val: "iced", label: "🥤 Ais" },
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

// ─── ETA PROGRESS BAR ────────────────────────────────────────────────────────
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

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
function Customer() {
  const { tableId } = useParams();

  const [cart, setCart]             = useState({});
  const [activeCat, setActiveCat]   = useState("Semua");
  const [screen, setScreen]         = useState("menu");
  const [note, setNote]             = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tempPref, setTempPref]     = useState({});
  const catBarRef                   = useRef(null);

  const [orderId, setOrderId]       = useState(null);
  const [orderDoc, setOrderDoc]     = useState(null);
  const [lastTotal, setLastTotal]   = useState(0);

  useEffect(() => {
    if (!orderId) return;
    const unsub = onSnapshot(doc(db, "orders", orderId), snap => {
      if (snap.exists()) setOrderDoc({ id: snap.id, ...snap.data() });
    });
    return unsub;
  }, [orderId]);

  const countdown = useCountdown(orderDoc?.readyAt ?? null);

  const filtered  = activeCat === "Semua" ? foods : foods.filter(f => f.cat === activeCat);
  const total     = foods.reduce((s, f) => s + f.price * (cart[f.id] || 0), 0);
  const totalQty  = Object.values(cart).reduce((s, v) => s + v, 0);
  const cartItems = foods.filter(f => cart[f.id]);

  const getTemp = (id) => tempPref[id] || "hot";
  const setTemp = (id, val) => setTempPref(p => ({ ...p, [id]: val }));

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
      setOrderId(ref.id);
      setOrderDoc(null);
      setCart({}); setNote("");
      setScreen("success");
    } catch (e) { console.error(e); }
    setSubmitting(false);
  };

  // ── SUCCESS SCREEN ─────────────────────────────────────────────────────────
  if (screen === "success") {
    const readyAt = orderDoc?.readyAt ?? null;
    const etaMins = orderDoc?.etaMins ?? null;
    const fmtReadyTime = (ts) => {
      if (!ts) return null;
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" });
    };

    return (
      <div style={ss.successPage}>
        <style>{globalCss}</style>
        <div style={ss.successBox}>

          {/* Decorative top strip */}
          <div style={ss.successTopAccent} />

          {/* Icon circle */}
          {countdown?.done ? (
            <div style={{ ...ss.checkCircle, background: "#1A6B4A" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#F0FFF8" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          ) : (
            <div style={{ ...ss.checkCircle, background: "#5C3317" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FDF0E6" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          )}

          <div style={ss.successTitle}>
            {countdown?.done ? "Pesanan Siap! 🎉" : "Pesanan Dihantar!"}
          </div>
          <div style={ss.successTableTag}>Meja {tableId}</div>
          <div style={ss.successAmt}>RM {lastTotal.toFixed(2)}</div>

          {readyAt && countdown && !countdown.done && (
            <div style={ss.etaCard}>
              <div style={ss.etaCardLabel}>⏱ Masa Anggaran Siap</div>
              <div style={ss.etaCountdown}>{countdown.label}</div>
              <div style={ss.etaReadyAt}>Dijangka siap: {fmtReadyTime(readyAt)}</div>
              <EtaProgressBar readyAt={readyAt} etaMins={etaMins} />
              <div style={ss.etaHint}>Dikemaskini secara automatik</div>
            </div>
          )}

          {countdown?.done && (
            <div style={{ ...ss.etaCard, background: "#F0FFF8", borderColor: "#6FCF97" }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#1A6B4A", lineHeight: 1.7, textAlign: "center" }}>
                🍽️ Pesanan anda sedang dibawa ke meja.<br />Selamat menjamu selera!
              </div>
            </div>
          )}

          {!readyAt && (
            <div style={ss.waitingCard}>
              <div style={ss.waitingDots}>
                <span className="dot" /><span className="dot" /><span className="dot" />
              </div>
              <div style={ss.waitingTxt}>Menunggu pengesahan dari dapur...</div>
            </div>
          )}

          <div style={ss.successNote}>Staf kami sedang menyediakan pesanan anda dengan penuh kasih sayang 🌿</div>

          <button onClick={() => setScreen("menu")} style={ss.backToMenuBtn}>
            ← Kembali ke Menu
          </button>
        </div>
      </div>
    );
  }

  // ── CART SCREEN ────────────────────────────────────────────────────────────
  if (screen === "cart") {
    return (
      <div style={ss.page}>
        <style>{globalCss}</style>

        <div style={ss.cartHdr}>
          <button onClick={() => setScreen("menu")} style={ss.backBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5C3317" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div>
            <div style={ss.cartHdrTitle}>Pesanan Anda</div>
            <div style={ss.cartHdrSub}>Meja {tableId}</div>
          </div>
          <div style={ss.cartHdrBadge}>{totalQty}</div>
        </div>

        <div style={ss.cartBody}>
          {cartItems.length === 0 ? (
            <div style={ss.emptyState}>
              <div style={ss.emptyIco}>🛒</div>
              <div style={ss.emptyTxt}>Keranjang Kosong</div>
              <div style={ss.emptyHint}>Pilih hidangan dari menu kami</div>
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
                ? <span style={{ opacity: 0.7 }}>Menghantar pesanan...</span>
                : <><span>Hantar Pesanan</span><span style={ss.confirmAmt}>RM {total.toFixed(2)}</span></>
              }
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── MENU SCREEN ────────────────────────────────────────────────────────────
  return (
    <div style={ss.page}>
      <style>{globalCss}</style>

      {/* Header */}
      <div style={ss.hdr}>
        <div style={ss.hdrLeft}>
          <div style={ss.brandMark}>
            <span style={ss.brandMarkText}>WS</span>
          </div>
          <div>
            <div style={ss.brandName}>Warung Selera</div>
            <div style={ss.brandSub}>✦ Ipoh, Perak ✦</div>
          </div>
        </div>
        <div style={ss.tablePill}>
          <span style={ss.tablePillLbl}>Meja</span>
          <span style={ss.tablePillNum}>{tableId}</span>
        </div>
      </div>

      {/* Hero Banner */}
      <div style={ss.heroBanner}>
        <div style={ss.heroBannerInner}>
          <div style={ss.heroText}>Lapar? Kami ada <em>hidangan istimewa</em> untuk anda 🌿</div>
        </div>
      </div>

      {/* Category Bar */}
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
                ...(active ? ss.catChipActive : {}),
              }}
            >
              <span style={ss.catEmoji}>{CAT_EMOJI[cat]}</span>
              <span>{cat}</span>
              <span style={{
                ...ss.catChipCount,
                ...(active ? ss.catChipCountActive : {}),
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Section Head */}
      <div style={ss.sectionHead}>
        <span style={ss.sectionHeadTxt}>{activeCat === "Semua" ? "Semua Menu" : activeCat}</span>
        <span style={ss.sectionHeadCount}>{filtered.length} hidangan</span>
      </div>

      {/* Food List */}
      <div style={ss.foodList}>
        {filtered.map(food => {
          const q = cart[food.id] || 0;
          const temp = getTemp(food.id);
          const badgeCfg = food.badge ? BADGE_CONFIG[food.badge] : null;

          return (
            <div key={food.id} style={ss.foodCard} className="food-card">
              {/* Image */}
              <div style={ss.foodImgWrap}>
                <img src={food.img} alt={food.name} style={ss.foodImg} loading="lazy"
                  onError={e => e.target.style.display = "none"} />
                <div style={ss.foodImgOverlay} />
                {badgeCfg && (
                  <span style={{ ...ss.foodBadge, background: badgeCfg.bg, color: badgeCfg.txt }}>
                    {food.badge}
                  </span>
                )}
                <div style={ss.foodPriceTag}>
                  RM {food.price.toFixed(2)}
                </div>
              </div>

              {/* Info */}
              <div style={ss.foodInfo}>
                <div style={ss.foodName}>{food.name}</div>
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
                            ? o.val === "hot" ? ss.tempHotActive : ss.tempColdActive
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
        <div style={{ height: 120 }} />
      </div>

      {/* Bottom Bar */}
      <div style={ss.bottomBar}>
        <div style={ss.bottomLeft}>
          <div style={ss.bottomQty}>{totalQty === 0 ? "Tiada item dipilih" : `${totalQty} item dipilih`}</div>
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

// ─── GLOBAL CSS ──────────────────────────────────────────────────────────────
const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body {
    font-family: 'DM Sans', sans-serif;
    background: #FBF6F0;
    -webkit-font-smoothing: antialiased;
  }
  ::-webkit-scrollbar { display: none; }

  .food-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
  .food-card:active { transform: scale(0.985); box-shadow: 0 2px 8px rgba(92,51,23,0.10); }
  .tap-btn:active { opacity: 0.82; transform: scale(0.97); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes popIn {
    0%   { transform: scale(0.6); opacity: 0; }
    80%  { transform: scale(1.06); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes blink {
    0%, 100% { opacity: 0.2; transform: scale(0.8); }
    50%       { opacity: 1;   transform: scale(1.2); }
  }
  .dot {
    display: inline-block;
    width: 7px; height: 7px;
    background: #C8A27A;
    border-radius: 50%;
    margin: 0 3px;
    animation: blink 1.4s ease-in-out infinite;
  }
  .dot:nth-child(2) { animation-delay: 0.2s; }
  .dot:nth-child(3) { animation-delay: 0.4s; }
`;

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
// Warm terracotta-cream Malaysian warung palette
const T = {
  bg:          "#FBF6F0",       // warm cream page bg
  surface:     "#FFFFFF",       // card surface
  surfaceWarm: "#FDF8F3",       // slightly warm surface
  border:      "#EDE3D9",       // warm border
  borderMid:   "#D4BEA8",       // mid border
  primary:     "#5C3317",       // deep coffee brown (primary)
  primaryHover:"#7A4520",
  accent:      "#C0392B",       // terracotta red accent
  accentLight: "#FAE8E7",
  gold:        "#B8862A",       // warm gold for highlights
  goldLight:   "#FDF4E0",
  textDark:    "#2C1A0E",       // darkest text
  textMid:     "#6B4226",       // mid brown text
  textMuted:   "#A07850",       // muted warm text
  textLight:   "#C8A27A",       // lightest text
  green:       "#1A6B4A",
  greenLight:  "#F0FFF8",
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const ss = {
  page: {
    minHeight: "100dvh",
    background: T.bg,
    display: "flex",
    flexDirection: "column",
    fontFamily: "'DM Sans', sans-serif",
    maxWidth: 480,
    margin: "0 auto",
    position: "relative",
  },

  // ── Header ──────────────────────────────────────────────────────────────
  hdr: {
    background: T.primary,
    padding: "14px 18px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  hdrLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  brandMark: {
    width: 44,
    height: 44,
    background: T.gold,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  brandMarkText: {
    fontFamily: "'Lora', serif",
    fontSize: 16,
    fontWeight: 700,
    color: T.primary,
    letterSpacing: 0.5,
  },
  brandName: {
    fontFamily: "'Lora', serif",
    fontSize: 18,
    fontWeight: 700,
    color: "#FDF8F3",
    letterSpacing: 0.2,
    lineHeight: 1.2,
  },
  brandSub: {
    fontSize: 10,
    color: T.gold,
    marginTop: 1,
    letterSpacing: 1.5,
    fontWeight: 600,
  },
  tablePill: {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: "6px 14px",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  tablePillLbl: {
    fontSize: 10,
    color: T.gold,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  tablePillNum: {
    fontFamily: "'Lora', serif",
    fontSize: 20,
    fontWeight: 700,
    color: "#FDF8F3",
  },

  // ── Hero banner ─────────────────────────────────────────────────────────
  heroBanner: {
    background: `linear-gradient(135deg, #7A4520 0%, #5C3317 60%, #3D1F0A 100%)`,
    padding: "14px 20px",
    borderBottom: `3px solid ${T.gold}`,
  },
  heroBannerInner: {},
  heroText: {
    fontFamily: "'Lora', serif",
    fontSize: 14,
    color: "#FDE8C8",
    lineHeight: 1.6,
    fontStyle: "normal",
  },

  // ── Category Bar ────────────────────────────────────────────────────────
  catBar: {
    display: "flex",
    gap: 8,
    padding: "14px 18px",
    overflowX: "auto",
    background: T.surface,
    borderBottom: `1px solid ${T.border}`,
    position: "sticky",
    top: 70,
    zIndex: 40,
  },
  catChip: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "8px 14px",
    borderRadius: 50,
    border: `1.5px solid ${T.border}`,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: "nowrap",
    background: T.surfaceWarm,
    color: T.textMid,
    transition: "all 0.2s ease",
    flexShrink: 0,
    fontFamily: "'DM Sans', sans-serif",
  },
  catChipActive: {
    background: T.primary,
    borderColor: T.primary,
    color: "#FDE8C8",
    fontWeight: 700,
    boxShadow: `0 2px 8px rgba(92,51,23,0.28)`,
  },
  catEmoji: {
    fontSize: 14,
  },
  catChipCount: {
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 20,
    padding: "1px 7px",
    background: T.border,
    color: T.textMuted,
  },
  catChipCountActive: {
    background: "rgba(255,255,255,0.18)",
    color: "#FDE8C8",
  },

  // ── Section head ────────────────────────────────────────────────────────
  sectionHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 18px 10px",
  },
  sectionHeadTxt: {
    fontFamily: "'Lora', serif",
    fontSize: 22,
    fontWeight: 700,
    color: T.textDark,
    letterSpacing: -0.3,
  },
  sectionHeadCount: {
    fontSize: 13,
    color: T.textMuted,
    fontWeight: 500,
  },

  // ── Food Cards ──────────────────────────────────────────────────────────
  foodList: {
    padding: "0 16px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  foodCard: {
    background: T.surface,
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(92,51,23,0.08)",
    border: `1px solid ${T.border}`,
  },
  foodImgWrap: {
    position: "relative",
    height: 200,
    overflow: "hidden",
    background: "#EDE3D9",
  },
  foodImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transition: "transform 0.4s ease",
  },
  foodImgOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    background: "linear-gradient(to top, rgba(44,26,14,0.55) 0%, transparent 100%)",
  },
  foodBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    fontSize: 11,
    fontWeight: 700,
    padding: "4px 11px",
    borderRadius: 20,
    letterSpacing: 0.3,
    fontFamily: "'DM Sans', sans-serif",
  },
  foodPriceTag: {
    position: "absolute",
    bottom: 12,
    right: 12,
    background: T.gold,
    color: T.primary,
    fontSize: 15,
    fontWeight: 700,
    padding: "5px 12px",
    borderRadius: 10,
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: 0.2,
  },
  foodInfo: {
    padding: "14px 16px 16px",
  },
  foodName: {
    fontFamily: "'Lora', serif",
    fontSize: 17,
    fontWeight: 700,
    color: T.textDark,
    lineHeight: 1.3,
    marginBottom: 6,
  },
  foodDesc: {
    fontSize: 13,
    color: T.textMuted,
    lineHeight: 1.65,
    marginBottom: 14,
  },

  // Temperature options
  tempRow: {
    display: "flex",
    gap: 6,
    marginBottom: 14,
  },
  tempBtn: {
    flex: 1,
    fontSize: 12,
    fontWeight: 600,
    padding: "8px 4px",
    borderRadius: 10,
    border: `1.5px solid ${T.border}`,
    background: T.surfaceWarm,
    color: T.textMid,
    cursor: "pointer",
    transition: "all 0.15s",
    textAlign: "center",
    fontFamily: "'DM Sans', sans-serif",
  },
  tempHotActive: {
    background: "#FFF3EE",
    borderColor: "#E07050",
    color: "#B7410E",
    fontWeight: 700,
  },
  tempColdActive: {
    background: "#EFF6FF",
    borderColor: "#93C5FD",
    color: "#1D4ED8",
    fontWeight: 700,
  },

  // Add to cart
  foodAction: {
    display: "flex",
    justifyContent: "flex-end",
  },
  addBtn: {
    background: T.primary,
    color: "#FDE8C8",
    border: "none",
    borderRadius: 12,
    padding: "12px 20px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: 0.2,
    width: "100%",
    fontFamily: "'DM Sans', sans-serif",
    transition: "background 0.15s",
  },
  qtyRow: {
    display: "flex",
    alignItems: "center",
    background: T.goldLight,
    borderRadius: 12,
    overflow: "hidden",
    width: "100%",
    border: `1.5px solid ${T.gold}`,
  },
  qbLg: {
    background: "transparent",
    border: "none",
    flex: 1,
    height: 46,
    fontSize: 22,
    fontWeight: 700,
    cursor: "pointer",
    color: T.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  qnLg: {
    fontFamily: "'Lora', serif",
    fontSize: 18,
    fontWeight: 700,
    color: T.primary,
    minWidth: 40,
    textAlign: "center",
  },

  // ── Bottom Bar ──────────────────────────────────────────────────────────
  bottomBar: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 480,
    background: T.surface,
    borderTop: `2px solid ${T.border}`,
    padding: "12px 18px 22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    zIndex: 60,
    boxShadow: "0 -4px 24px rgba(92,51,23,0.10)",
  },
  bottomLeft: {},
  bottomQty: {
    fontSize: 11,
    fontWeight: 600,
    color: T.textMuted,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  bottomTotal: {
    fontFamily: "'Lora', serif",
    fontSize: 26,
    fontWeight: 700,
    color: T.textDark,
    letterSpacing: -0.5,
  },
  viewCartBtn: {
    background: T.accent,
    color: "#FFF5F0",
    border: "none",
    borderRadius: 14,
    padding: "14px 22px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: 0.1,
    whiteSpace: "nowrap",
    transition: "all 0.15s",
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: "0 4px 14px rgba(192,57,43,0.30)",
  },
  viewCartBtnOff: {
    background: T.border,
    color: T.textLight,
    cursor: "not-allowed",
    boxShadow: "none",
  },

  // ── Cart Screen ─────────────────────────────────────────────────────────
  cartHdr: {
    background: T.surface,
    padding: "16px 18px 14px",
    borderBottom: `1px solid ${T.border}`,
    position: "sticky",
    top: 0,
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    background: T.surfaceWarm,
    border: `1px solid ${T.border}`,
    borderRadius: 10,
    cursor: "pointer",
    color: T.primary,
    padding: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cartHdrTitle: {
    fontFamily: "'Lora', serif",
    fontSize: 20,
    fontWeight: 700,
    color: T.textDark,
    letterSpacing: -0.3,
    flex: 1,
  },
  cartHdrSub: {
    fontSize: 13,
    color: T.textMuted,
    marginTop: 2,
  },
  cartHdrBadge: {
    background: T.accent,
    color: "#FFF5F0",
    borderRadius: "50%",
    width: 30,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 700,
    flexShrink: 0,
  },
  cartBody: {
    flex: 1,
    overflowY: "auto",
    paddingBottom: 120,
  },
  cartSection: {
    padding: "16px 18px 0",
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: T.textMuted,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  cartRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: T.surface,
    borderRadius: 16,
    padding: "12px",
    marginBottom: 10,
    border: `1px solid ${T.border}`,
  },
  cartThumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    objectFit: "cover",
    flexShrink: 0,
    background: T.border,
  },
  cartRowInfo: { flex: 1 },
  cartRowName: {
    fontFamily: "'Lora', serif",
    fontSize: 14,
    fontWeight: 700,
    color: T.textDark,
    marginBottom: 3,
    lineHeight: 1.3,
  },
  cartRowTemp: {
    fontSize: 12,
    color: "#1D4ED8",
    fontWeight: 600,
    marginBottom: 4,
  },
  cartRowPrice: {
    fontSize: 15,
    fontWeight: 700,
    color: T.gold,
  },
  qRow: {
    display: "flex",
    alignItems: "center",
    background: T.surfaceWarm,
    borderRadius: 10,
    border: `1px solid ${T.border}`,
    overflow: "hidden",
  },
  qbCart: {
    background: "transparent",
    border: "none",
    width: 34,
    height: 34,
    fontSize: 18,
    fontWeight: 800,
    cursor: "pointer",
    color: T.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  qnCart: {
    fontSize: 15,
    fontWeight: 700,
    color: T.textDark,
    minWidth: 28,
    textAlign: "center",
    fontFamily: "'Lora', serif",
  },
  noteInput: {
    width: "100%",
    background: T.surfaceWarm,
    border: `1.5px solid ${T.border}`,
    borderRadius: 14,
    padding: "12px 14px",
    fontSize: 14,
    resize: "none",
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    color: T.textDark,
    lineHeight: 1.6,
    marginTop: 4,
  },
  summaryCard: {
    background: T.surfaceWarm,
    borderRadius: 16,
    padding: "16px",
    border: `1px solid ${T.border}`,
    marginTop: 4,
  },
  summaryLine: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryKey: {
    fontSize: 14,
    color: T.textMuted,
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: 600,
    color: T.textDark,
  },
  summaryKeyBold: {
    fontSize: 15,
    fontWeight: 700,
    color: T.textDark,
  },
  summaryBig: {
    fontFamily: "'Lora', serif",
    fontSize: 24,
    fontWeight: 700,
    color: T.primary,
    letterSpacing: -0.5,
  },
  divider: {
    height: 1,
    background: T.border,
    margin: "10px 0",
  },
  cartFooter: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 480,
    background: T.surface,
    padding: "12px 18px 26px",
    borderTop: `1px solid ${T.border}`,
    zIndex: 60,
  },
  confirmBtn: {
    width: "100%",
    background: T.primary,
    color: "#FDE8C8",
    border: "none",
    borderRadius: 16,
    padding: "16px 20px",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    letterSpacing: 0.1,
    fontFamily: "'DM Sans', sans-serif",
  },
  confirmAmt: {
    fontFamily: "'Lora', serif",
    fontSize: 17,
    fontWeight: 700,
    color: T.gold,
  },

  // Empty state
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "70px 20px",
    gap: 12,
  },
  emptyIco: {
    fontSize: 52,
    marginBottom: 8,
  },
  emptyTxt: {
    fontFamily: "'Lora', serif",
    fontSize: 20,
    fontWeight: 700,
    color: T.textDark,
  },
  emptyHint: {
    fontSize: 14,
    color: T.textMuted,
  },
  goMenuBtn: {
    marginTop: 10,
    background: T.primary,
    color: "#FDE8C8",
    border: "none",
    borderRadius: 12,
    padding: "13px 30px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },

  // ── Success Screen ──────────────────────────────────────────────────────
  successPage: {
    minHeight: "100dvh",
    background: T.bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', sans-serif",
    padding: 24,
  },
  successBox: {
    background: T.surface,
    borderRadius: 28,
    overflow: "hidden",
    width: "100%",
    maxWidth: 380,
    boxShadow: "0 8px 40px rgba(92,51,23,0.14)",
    animation: "fadeUp 0.4s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    paddingBottom: 28,
  },
  successTopAccent: {
    width: "100%",
    height: 6,
    background: `linear-gradient(90deg, ${T.gold}, ${T.accent}, ${T.primary})`,
    marginBottom: 20,
  },
  checkCircle: {
    width: 76,
    height: 76,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    animation: "popIn 0.5s ease",
    marginBottom: 4,
  },
  successTitle: {
    fontFamily: "'Lora', serif",
    fontSize: 26,
    fontWeight: 700,
    color: T.textDark,
    letterSpacing: -0.4,
    textAlign: "center",
    padding: "0 24px",
  },
  successTableTag: {
    background: T.goldLight,
    border: `1px solid ${T.gold}`,
    borderRadius: 20,
    padding: "4px 16px",
    fontSize: 12,
    fontWeight: 700,
    color: T.gold,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  successAmt: {
    fontFamily: "'Lora', serif",
    fontSize: 38,
    fontWeight: 700,
    color: T.primary,
    letterSpacing: -1,
    margin: "4px 0 8px",
  },
  successNote: {
    fontSize: 13,
    color: T.textMuted,
    lineHeight: 1.7,
    textAlign: "center",
    padding: "0 28px",
  },

  // ETA Card
  etaCard: {
    width: "calc(100% - 48px)",
    background: "#EFF8FF",
    border: "1.5px solid #93C5FD",
    borderRadius: 18,
    padding: "16px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    margin: "0 0 4px",
  },
  etaCardLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#1D4ED8",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  etaCountdown: {
    fontFamily: "'Lora', serif",
    fontSize: 44,
    fontWeight: 700,
    color: T.textDark,
    letterSpacing: -2,
    lineHeight: 1,
    fontVariantNumeric: "tabular-nums",
  },
  etaReadyAt: {
    fontSize: 13,
    color: T.textMid,
    fontWeight: 600,
  },
  progressTrack: {
    height: 6,
    background: "#DBEAFE",
    borderRadius: 99,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #60A5FA, #2563EB)",
    borderRadius: 99,
    transition: "width 1s linear",
  },
  etaHint: {
    fontSize: 11,
    color: T.textLight,
    textAlign: "center",
  },

  // Waiting dots
  waitingCard: {
    width: "calc(100% - 48px)",
    background: T.surfaceWarm,
    border: `1px solid ${T.border}`,
    borderRadius: 18,
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },
  waitingDots: { display: "flex", alignItems: "center" },
  waitingTxt: {
    fontSize: 13,
    color: T.textMuted,
    textAlign: "center",
  },

  backToMenuBtn: {
    marginTop: 8,
    background: "transparent",
    border: `1.5px solid ${T.border}`,
    color: T.textMid,
    borderRadius: 14,
    padding: "13px 28px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    width: "calc(100% - 48px)",
    fontFamily: "'DM Sans', sans-serif",
  },
};

export default Customer;