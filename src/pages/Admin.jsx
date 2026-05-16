import { useEffect, useState, useCallback } from "react";
import {
  collection, onSnapshot, doc, updateDoc, deleteDoc,
  query, where, Timestamp, writeBatch
} from "firebase/firestore";
import { db } from "../firebase";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function todayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return Timestamp.fromDate(d);
}

function fmtTime(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" });
}

function timeAgo(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s lalu`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min lalu`;
  return `${Math.floor(diff / 3600)}j lalu`;
}

function fmtDate(d) {
  return d.toLocaleDateString("ms-MY", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

// Returns { label, urgent } for countdown display
function getCountdown(readyAt) {
  if (!readyAt) return null;
  const target = readyAt.toDate ? readyAt.toDate() : new Date(readyAt);
  const diff = Math.floor((target.getTime() - Date.now()) / 1000);
  if (diff <= 0) return { label: "Dah siap!", urgent: true, done: true };
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  const urgent = diff <= 120; // red when ≤ 2 min left
  return { label: m > 0 ? `${m}m ${s}s lagi` : `${s}s lagi`, urgent, done: false };
}

const TEMP_LABEL = { hot: "Panas", cold: "Sejuk", iced: "Ais" };

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function Admin() {
  const [orders, setOrders]         = useState([]);
  const [filter, setFilter]         = useState("active");
  const [search, setSearch]         = useState("");
  const [now, setNow]               = useState(Date.now());
  const [confirmDel, setConfirmDel] = useState(null);
  const [updating, setUpdating]     = useState({});
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [sideOpen, setSideOpen]     = useState(true);
  // { [orderId]: minuteString }
  const [etaInputs, setEtaInputs]   = useState({});
  // { [orderId]: true } when setting ETA
  const [etaSetting, setEtaSetting] = useState({});

  // ── Real-time listener ───────────────────────────────────────────────────
  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("createdAt", ">=", todayStart())
    );
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => {
        const ta = a.createdAt?.toDate?.() ?? new Date(0);
        const tb = b.createdAt?.toDate?.() ?? new Date(0);
        return tb - ta;
      });
      setOrders(data);
    });
    return unsub;
  }, []);

  // ── Clock tick (every second for countdown) ──────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Auto-clear yesterday completed orders ────────────────────────────────
  useEffect(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);
    const q = query(
      collection(db, "orders"),
      where("status", "==", "completed"),
      where("createdAt", "<", Timestamp.fromDate(yesterday))
    );
    import("firebase/firestore").then(({ getDocs, writeBatch: wb }) => {
      getDocs(q).then(snap => {
        if (snap.empty) return;
        const batch = wb(db);
        snap.docs.forEach(d => batch.delete(d.ref));
        batch.commit();
      });
    });
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────
  const completeOrder = async (id) => {
    setUpdating(p => ({ ...p, [id]: true }));
    await updateDoc(doc(db, "orders", id), {
      status: "completed",
      completedAt: Timestamp.now(),
    });
    setUpdating(p => ({ ...p, [id]: false }));
  };

  const deleteOrder = async (id) => {
    await deleteDoc(doc(db, "orders", id));
    setConfirmDel(null);
  };

  const clearAllCompleted = async () => {
    const completed = orders.filter(o => o.status === "completed");
    const { writeBatch: wb } = await import("firebase/firestore");
    const batch = wb(db);
    completed.forEach(o => batch.delete(doc(db, "orders", o.id)));
    await batch.commit();
    setShowClearConfirm(false);
  };

  // ── Set ETA ───────────────────────────────────────────────────────────────
  const setEta = async (orderId) => {
    const mins = parseInt(etaInputs[orderId], 10);
    if (!mins || mins < 1 || mins > 120) return;
    setEtaSetting(p => ({ ...p, [orderId]: true }));
    const readyAt = new Date(Date.now() + mins * 60 * 1000);
    await updateDoc(doc(db, "orders", orderId), {
      readyAt: Timestamp.fromDate(readyAt),
      etaMins: mins,
    });
    setEtaSetting(p => ({ ...p, [orderId]: false }));
    setEtaInputs(p => ({ ...p, [orderId]: "" }));
  };

  const clearEta = async (orderId) => {
    await updateDoc(doc(db, "orders", orderId), {
      readyAt: null,
      etaMins: null,
    });
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const active    = orders.filter(o => o.status !== "completed");
  const completed = orders.filter(o => o.status === "completed");
  const revenue   = completed.reduce((s, o) => s + (o.total || 0), 0);
  const urgent    = active.filter(o => {
    const mins = o.createdAt
      ? Math.floor((Date.now() - (o.createdAt.toDate?.() ?? new Date(o.createdAt)).getTime()) / 60000)
      : 0;
    return mins > 15;
  });

  const filtered = orders.filter(o => {
    const mf =
      filter === "all"       ? true :
      filter === "active"    ? o.status !== "completed" :
      o.status === "completed";
    const ms = !search ||
      String(o.table).includes(search) ||
      o.items?.some(i => i.name?.toLowerCase().includes(search.toLowerCase()));
    return mf && ms;
  });

  return (
    <div style={css.root}>
      <style>{globalCSS}</style>

      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <aside style={{ ...css.sidebar, ...(sideOpen ? {} : css.sidebarCollapsed) }}>
        <div style={css.brand}>
          <div style={css.brandMark}>W</div>
          {sideOpen && (
            <div style={css.brandText}>
              <div style={css.brandName}>Warung Selera</div>
              <div style={css.brandSub}>Sistem Pesanan</div>
            </div>
          )}
          <button style={css.collapseBtn} onClick={() => setSideOpen(p => !p)}>
            {sideOpen ? "‹" : "›"}
          </button>
        </div>

        {sideOpen && (
          <div style={css.statsBlock}>
            <div style={css.statCard}>
              <div style={css.statVal}>{active.length}</div>
              <div style={css.statLabel}>Pesanan Aktif</div>
            </div>
            <div style={{ ...css.statCard, ...(urgent.length > 0 ? css.statCardUrgent : {}) }}>
              <div style={{ ...css.statVal, color: urgent.length > 0 ? "#dc6939" : "inherit" }}>
                {urgent.length}
              </div>
              <div style={css.statLabel}>Menunggu Lama</div>
            </div>
            <div style={css.statCardWide}>
              <div style={{ ...css.statVal, fontSize: 22 }}>RM {revenue.toFixed(2)}</div>
              <div style={css.statLabel}>Hasil Hari Ini · {completed.length} selesai</div>
            </div>
          </div>
        )}

        <nav style={css.nav}>
          {[
            { key: "active",    icon: "⬡", label: "Pesanan Aktif",   count: active.length },
            { key: "completed", icon: "✓", label: "Selesai",          count: completed.length },
            { key: "all",       icon: "≡", label: "Semua",            count: orders.length },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              style={{ ...css.navItem, ...(filter === item.key ? css.navItemActive : {}) }}
            >
              <span style={css.navIcon}>{item.icon}</span>
              {sideOpen && (
                <>
                  <span style={css.navLabel}>{item.label}</span>
                  <span style={{ ...css.navCount, ...(filter === item.key ? css.navCountActive : {}) }}>
                    {item.count}
                  </span>
                </>
              )}
            </button>
          ))}
        </nav>

        {sideOpen && completed.length > 0 && (
          <button style={css.clearBtn} onClick={() => setShowClearConfirm(true)}>
            Kosongkan Selesai
          </button>
        )}

        {sideOpen && (
          <div style={css.clockBlock}>
            <div style={css.clockTime}>
              {new Date(now).toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div style={css.clockDate}>{fmtDate(new Date())}</div>
          </div>
        )}
      </aside>

      {/* ── MAIN ────────────────────────────────────────────────────────── */}
      <main style={css.main}>
        <header style={css.topbar}>
          <div>
            <h1 style={css.pageTitle}>
              {filter === "active" ? "Pesanan Aktif" : filter === "completed" ? "Pesanan Selesai" : "Semua Pesanan"}
            </h1>
            <p style={css.pageSub}>{filtered.length} pesanan · dikemaskini masa nyata</p>
          </div>
          <div style={css.topbarRight}>
            <div style={css.searchWrap}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9a8878" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari meja atau hidangan..."
                style={css.searchInput}
              />
            </div>
          </div>
        </header>

        <div style={css.strip}>
          <div style={css.stripItem}>
            <span style={css.stripDot("#dc6939")} />
            <span style={css.stripLabel}>Aktif</span>
            <span style={{ ...css.stripCount, color: "#dc6939" }}>{active.length}</span>
          </div>
          <span style={css.stripDiv}>·</span>
          <div style={css.stripItem}>
            <span style={css.stripDot("#5a9e6f")} />
            <span style={css.stripLabel}>Selesai</span>
            <span style={{ ...css.stripCount, color: "#5a9e6f" }}>{completed.length}</span>
          </div>
          {urgent.length > 0 && (
            <>
              <span style={css.stripDiv}>·</span>
              <div style={css.urgentPill}>
                ⚠ {urgent.length} pesanan menunggu melebihi 15 minit
              </div>
            </>
          )}
        </div>

        <div style={css.content}>
          {filtered.length === 0 ? (
            <div style={css.empty}>
              <div style={css.emptyIcon}>◌</div>
              <div style={css.emptyTitle}>Tiada pesanan</div>
              <div style={css.emptySub}>Tiada rekod buat masa ini</div>
            </div>
          ) : (
            <div style={css.grid}>
              {filtered.map((order, idx) => {
                const isActive  = order.status !== "completed";
                const isUpd     = updating[order.id];
                const mins = order.createdAt
                  ? Math.floor((Date.now() - (order.createdAt.toDate?.() ?? new Date(order.createdAt)).getTime()) / 60000)
                  : 0;
                const isUrgent   = isActive && mins > 15;
                const countdown  = order.readyAt ? getCountdown(order.readyAt) : null;
                const etaVal     = etaInputs[order.id] ?? "";

                return (
                  <div
                    key={order.id}
                    className="order-card"
                    style={{
                      ...css.card,
                      ...(isUrgent ? css.cardUrgent : {}),
                      ...(!isActive ? css.cardDone : {}),
                      animationDelay: `${idx * 25}ms`,
                    }}
                  >
                    {/* Card top */}
                    <div style={css.cardHead}>
                      <div style={css.tableChip}>
                        <span style={css.tableNum}>{order.table}</span>
                        <span style={css.tableLbl}>Meja</span>
                      </div>
                      <div style={css.cardHeadRight}>
                        {isUrgent && <span style={css.urgentTag}>Lambat</span>}
                        <span style={{ ...css.statusPill, ...(isActive ? css.pillActive : css.pillDone) }}>
                          {isActive ? "Aktif" : "Selesai"}
                        </span>
                      </div>
                    </div>

                    {/* Time */}
                    <div style={css.timeRow}>
                      <span style={css.timeFmt}>{fmtTime(order.createdAt)}</span>
                      <span style={css.timeAgo}>{timeAgo(order.createdAt)}</span>
                    </div>

                    <div style={css.divider} />

                    {/* Items */}
                    <div style={css.items}>
                      {order.items?.map((item, i) => (
                        <div key={i} style={css.itemRow}>
                          <span style={css.itemQty}>{item.qty}×</span>
                          <span style={css.itemName}>{item.name}</span>
                          {item.temp && (
                            <span style={css.itemTemp}>{TEMP_LABEL[item.temp] || item.temp}</span>
                          )}
                          <span style={css.itemPrice}>RM {(item.price * item.qty).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Note */}
                    {order.note && (
                      <div style={css.note}>
                        <span style={css.noteQ}>"</span>
                        <span style={css.noteTxt}>{order.note}</span>
                      </div>
                    )}

                    {/* ── ETA SECTION (active orders only) ── */}
                    {isActive && (
                      <div style={css.etaBox}>
                        {/* Countdown display */}
                        {countdown ? (
                          <div style={{
                            ...css.countdownRow,
                            ...(countdown.done ? css.countdownDone : countdown.urgent ? css.countdownUrgent : css.countdownNormal),
                          }}>
                            <span style={css.countdownIcon}>
                              {countdown.done ? "✓" : "⏱"}
                            </span>
                            <div style={css.countdownInfo}>
                              <span style={css.countdownLabel}>
                                {countdown.done ? "Sudah boleh dihidang!" : "Siap dalam"}
                              </span>
                              {!countdown.done && (
                                <span style={css.countdownTime}>{countdown.label}</span>
                              )}
                              <span style={css.countdownSiap}>
                                Siap: {fmtTime(order.readyAt)} · {order.etaMins} min ditetapkan
                              </span>
                            </div>
                            <button
                              onClick={() => clearEta(order.id)}
                              style={css.etaClearBtn}
                              title="Buang masa"
                            >✕</button>
                          </div>
                        ) : (
                          <div style={css.etaSetRow}>
                            <span style={css.etaSetIcon}>🕐</span>
                            <span style={css.etaSetLabel}>Tetapkan masa siap:</span>
                            <input
                              type="number"
                              min="1"
                              max="120"
                              placeholder="min"
                              value={etaVal}
                              onChange={e => setEtaInputs(p => ({ ...p, [order.id]: e.target.value }))}
                              onKeyDown={e => e.key === "Enter" && setEta(order.id)}
                              style={css.etaInput}
                            />
                            <button
                              onClick={() => setEta(order.id)}
                              disabled={!etaVal || etaSetting[order.id]}
                              style={{
                                ...css.etaSetBtn,
                                opacity: (!etaVal || etaSetting[order.id]) ? 0.5 : 1,
                              }}
                            >
                              {etaSetting[order.id] ? "..." : "Set"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Total */}
                    <div style={css.totalRow}>
                      <span style={css.totalLbl}>Jumlah</span>
                      <span style={css.totalAmt}>RM {Number(order.total).toFixed(2)}</span>
                    </div>

                    {/* Actions */}
                    <div style={css.actions}>
                      {isActive ? (
                        <button
                          disabled={isUpd}
                          onClick={() => completeOrder(order.id)}
                          style={{ ...css.doneBtn, opacity: isUpd ? 0.6 : 1 }}
                        >
                          {isUpd ? "Mengemas..." : "✓  Tandakan Selesai"}
                        </button>
                      ) : (
                        <div style={css.doneTag}>Pesanan Selesai</div>
                      )}
                      <button
                        onClick={() => setConfirmDel(order.id)}
                        style={css.delBtn}
                        title="Padam pesanan"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── DELETE MODAL ────────────────────────────────────────────────── */}
      {confirmDel && (
        <div style={css.modalBg} onClick={() => setConfirmDel(null)}>
          <div style={css.modal} onClick={e => e.stopPropagation()}>
            <div style={css.modalIcon}>✕</div>
            <div style={css.modalTitle}>Padam Pesanan?</div>
            <div style={css.modalSub}>Rekod ini akan dipadamkan secara kekal dan tidak boleh dipulihkan.</div>
            <div style={css.modalBtns}>
              <button onClick={() => setConfirmDel(null)} style={css.btnCancel}>Batal</button>
              <button onClick={() => deleteOrder(confirmDel)} style={css.btnDel}>Padam</button>
            </div>
          </div>
        </div>
      )}

      {/* ── CLEAR COMPLETED MODAL ───────────────────────────────────────── */}
      {showClearConfirm && (
        <div style={css.modalBg} onClick={() => setShowClearConfirm(false)}>
          <div style={css.modal} onClick={e => e.stopPropagation()}>
            <div style={css.modalIcon}>⊘</div>
            <div style={css.modalTitle}>Kosongkan Semua Selesai?</div>
            <div style={css.modalSub}>
              {completed.length} pesanan selesai akan dipadamkan. Hasil akan tetap dikira.
            </div>
            <div style={css.modalBtns}>
              <button onClick={() => setShowClearConfirm(false)} style={css.btnCancel}>Batal</button>
              <button onClick={clearAllCompleted} style={css.btnDel}>Kosongkan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── GLOBAL CSS ──────────────────────────────────────────────────────────────
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(180,160,140,0.25); border-radius: 3px; }
  .order-card { animation: rise 0.3s ease both; }
  .order-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(90,60,30,0.1) !important; transition: transform 0.2s, box-shadow 0.2s; }
  @keyframes rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input[type=number] { -moz-appearance: textfield; }
`;

// ─── STYLES ──────────────────────────────────────────────────────────────────
const CREAM  = "#faf7f2";
const PAPER  = "#f5f0e8";
const SAND   = "#ede7db";
const DARK   = "#1c1410";
const BROWN  = "#3d2b1f";
const MID    = "#7a6050";
const MUTED  = "#a89080";
const ACCENT = "#b85c38";
const GREEN  = "#5a9e6f";
const GOLD   = "#c49a3c";

const css = {
  root: {
    display: "flex", minHeight: "100vh",
    background: CREAM, fontFamily: "'DM Sans', sans-serif", color: DARK,
  },

  sidebar: {
    width: 260, background: BROWN,
    display: "flex", flexDirection: "column", flexShrink: 0,
    position: "sticky", top: 0, height: "100vh", overflowY: "auto",
    transition: "width 0.25s ease",
  },
  sidebarCollapsed: { width: 64 },

  brand: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "24px 16px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
  },
  brandMark: {
    width: 36, height: 36, background: ACCENT, borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700,
    color: "#fff", flexShrink: 0, letterSpacing: -0.5,
  },
  brandText:  { flex: 1, overflow: "hidden" },
  brandName:  { fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 600, color: "#fff", letterSpacing: 0.2, whiteSpace: "nowrap" },
  brandSub:   { fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1.5, marginTop: 1, textTransform: "uppercase" },
  collapseBtn:{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 18, padding: "2px 4px", lineHeight: 1, flexShrink: 0, marginLeft: "auto" },

  statsBlock:    { padding: "16px 14px", display: "flex", flexDirection: "column", gap: 8 },
  statCard:      { background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.06)" },
  statCardUrgent:{ borderColor: "rgba(220,105,57,0.4)", background: "rgba(220,105,57,0.08)" },
  statCardWide:  { background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.06)" },
  statVal:       { fontSize: 26, fontWeight: 700, color: "#fff", fontFamily: "'Cormorant Garamond', serif", letterSpacing: -0.5 },
  statLabel:     { fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 3, letterSpacing: 0.8 },

  nav:           { padding: "8px 10px", flex: 1 },
  navItem:       { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 9, border: "none", background: "transparent", cursor: "pointer", color: "rgba(255,255,255,0.45)", marginBottom: 2, textAlign: "left", transition: "background 0.15s, color 0.15s" },
  navItemActive: { background: "rgba(255,255,255,0.1)", color: "#fff" },
  navIcon:       { fontSize: 14, flexShrink: 0, width: 16, textAlign: "center" },
  navLabel:      { flex: 1, fontSize: 13, fontWeight: 500 },
  navCount:      { fontSize: 11, fontWeight: 700, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)", borderRadius: 20, padding: "1px 8px" },
  navCountActive:{ background: "rgba(255,255,255,0.15)", color: "#fff" },

  clearBtn: {
    margin: "0 14px 12px", background: "rgba(220,105,57,0.12)",
    border: "1px solid rgba(220,105,57,0.2)", color: "#dc6939",
    borderRadius: 9, padding: "9px 14px", fontSize: 11, fontWeight: 600,
    cursor: "pointer", letterSpacing: 0.3,
  },

  clockBlock: { padding: "16px 18px 24px", borderTop: "1px solid rgba(255,255,255,0.07)", marginTop: "auto" },
  clockTime:  { fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 600, color: "#fff", letterSpacing: -1, lineHeight: 1 },
  clockDate:  { fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 6, lineHeight: 1.6 },

  main:      { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },

  topbar:    { background: "#fff", borderBottom: `1px solid ${SAND}`, padding: "18px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  pageTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 600, color: DARK, letterSpacing: -0.3 },
  pageSub:   { fontSize: 12, color: MUTED, marginTop: 3 },
  topbarRight:{ display: "flex", alignItems: "center", gap: 10 },
  searchWrap: { display: "flex", alignItems: "center", gap: 8, background: CREAM, border: `1px solid ${SAND}`, borderRadius: 10, padding: "9px 14px", minWidth: 240 },
  searchInput:{ background: "transparent", border: "none", outline: "none", fontSize: 13, color: DARK, width: "100%", fontFamily: "inherit" },

  strip:      { background: "#fff", borderBottom: `1px solid ${SAND}`, padding: "10px 28px", display: "flex", alignItems: "center", gap: 12, fontSize: 12 },
  stripItem:  { display: "flex", alignItems: "center", gap: 6 },
  stripDot:   (c) => ({ width: 7, height: 7, borderRadius: "50%", background: c, display: "inline-block" }),
  stripLabel: { color: MID, fontWeight: 500 },
  stripCount: { fontWeight: 700 },
  stripDiv:   { color: SAND, fontSize: 16 },
  urgentPill: { background: "#fff4ee", border: "1px solid #f5c9b0", color: ACCENT, borderRadius: 20, padding: "2px 12px", fontSize: 11, fontWeight: 600 },

  content:   { flex: 1, overflowY: "auto", padding: "22px 28px" },

  grid:      { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(288px, 1fr))", gap: 14 },
  card:      { background: "#fff", borderRadius: 16, border: `1px solid ${SAND}`, padding: 18, display: "flex", flexDirection: "column", gap: 11, boxShadow: "0 2px 12px rgba(90,60,30,0.04)", borderTop: `3px solid ${ACCENT}` },
  cardUrgent:{ borderColor: "#f5c9b0", borderTop: `3px solid ${ACCENT}`, background: "#fff9f6" },
  cardDone:  { borderTop: `3px solid ${GREEN}`, opacity: 0.82 },

  cardHead:     { display: "flex", justifyContent: "space-between", alignItems: "center" },
  tableChip:    { display: "flex", flexDirection: "column", alignItems: "center", background: DARK, borderRadius: 10, padding: "4px 12px", minWidth: 44 },
  tableNum:     { fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Cormorant Garamond', serif", lineHeight: 1 },
  tableLbl:     { fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: 1.2, textTransform: "uppercase", marginTop: 1 },
  cardHeadRight:{ display: "flex", gap: 6, alignItems: "center" },
  urgentTag:    { fontSize: 10, fontWeight: 700, color: ACCENT, background: "#fff4ee", border: "1px solid #f5c9b0", borderRadius: 20, padding: "2px 9px" },
  statusPill:   { fontSize: 11, fontWeight: 600, borderRadius: 20, padding: "3px 10px" },
  pillActive:   { color: ACCENT, background: "#fff4ee", border: "1px solid #f5c9b0" },
  pillDone:     { color: GREEN, background: "#eef6f0", border: "1px solid #b8dfc3" },

  timeRow:   { display: "flex", justifyContent: "space-between", alignItems: "center" },
  timeFmt:   { fontSize: 13, fontWeight: 600, color: DARK },
  timeAgo:   { fontSize: 11, color: MUTED },

  divider:   { height: 1, background: SAND, margin: "0 -2px" },

  items:     { background: CREAM, borderRadius: 10, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6, border: `1px solid ${SAND}` },
  itemRow:   { display: "flex", alignItems: "center", gap: 8 },
  itemQty:   { fontSize: 13, fontWeight: 700, color: ACCENT, minWidth: 22 },
  itemName:  { flex: 1, fontSize: 12, color: DARK },
  itemTemp:  { fontSize: 10, fontWeight: 600, color: "#3b7abf", background: "#eef3fb", borderRadius: 5, padding: "1px 7px" },
  itemPrice: { fontSize: 11, color: MID, fontWeight: 600 },

  note:      { background: "#fefbf0", border: "1px solid #f0e5b5", borderRadius: 9, padding: "8px 12px", display: "flex", gap: 6, alignItems: "flex-start" },
  noteQ:     { color: GOLD, fontSize: 20, lineHeight: 0.8, fontFamily: "'Cormorant Garamond', serif" },
  noteTxt:   { fontSize: 12, color: "#7a6520", lineHeight: 1.5, fontStyle: "italic" },

  // ── ETA Box ──────────────────────────────────────────────────────────────
  etaBox: {
    borderRadius: 10,
    overflow: "hidden",
    border: `1px solid ${SAND}`,
  },

  // Row when no ETA set — let admin input minutes
  etaSetRow: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "10px 12px",
    background: CREAM,
    flexWrap: "wrap",
  },
  etaSetIcon:  { fontSize: 14 },
  etaSetLabel: { fontSize: 11, color: MID, fontWeight: 600, flex: 1, minWidth: 120 },
  etaInput: {
    width: 54, padding: "6px 8px",
    border: `1.5px solid ${SAND}`, borderRadius: 8,
    fontSize: 13, fontWeight: 700, color: DARK,
    textAlign: "center", outline: "none",
    background: "#fff", fontFamily: "inherit",
  },
  etaSetBtn: {
    padding: "6px 14px", borderRadius: 8,
    background: BROWN, color: "#fff",
    border: "none", fontSize: 12, fontWeight: 700,
    cursor: "pointer", letterSpacing: 0.3,
    transition: "opacity 0.15s",
  },

  // Countdown display rows
  countdownRow: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 12px",
  },
  countdownNormal: { background: "#eef6f0", borderColor: "#b8dfc3" },
  countdownUrgent: { background: "#fff4ee" },
  countdownDone:   { background: "#eef6f0" },

  countdownIcon: { fontSize: 18, flexShrink: 0 },
  countdownInfo: { flex: 1, display: "flex", flexDirection: "column", gap: 1 },
  countdownLabel:{ fontSize: 11, fontWeight: 700, color: DARK },
  countdownTime: { fontSize: 20, fontWeight: 800, color: DARK, fontFamily: "'Cormorant Garamond', serif", letterSpacing: -0.5, lineHeight: 1.1 },
  countdownSiap: { fontSize: 10, color: MUTED, marginTop: 2 },

  etaClearBtn: {
    background: "none", border: "none",
    color: MUTED, cursor: "pointer",
    fontSize: 13, padding: "2px 4px", flexShrink: 0,
  },

  totalRow:  { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${SAND}`, paddingTop: 10 },
  totalLbl:  { fontSize: 12, color: MUTED },
  totalAmt:  { fontSize: 18, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", color: DARK, letterSpacing: -0.3 },

  actions:   { display: "flex", gap: 8 },
  doneBtn:   { flex: 1, background: GREEN, color: "#fff", border: "none", borderRadius: 10, padding: "11px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: 0.4, transition: "opacity 0.15s, transform 0.1s" },
  doneTag:   { flex: 1, textAlign: "center", fontSize: 12, fontWeight: 600, color: GREEN, background: "#eef6f0", borderRadius: 10, padding: "11px", border: "1px solid #b8dfc3" },
  delBtn:    { width: 38, height: 38, background: "#fff5f5", border: "1px solid #fdd5d5", color: "#cc4444", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },

  empty:      { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 100, gap: 12 },
  emptyIcon:  { fontSize: 48, color: SAND },
  emptyTitle: { fontSize: 16, fontWeight: 600, color: MID },
  emptySub:   { fontSize: 13, color: MUTED },

  modalBg:    { position: "fixed", inset: 0, background: "rgba(28,20,16,0.55)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" },
  modal:      { background: "#fff", borderRadius: 20, padding: "32px 36px", width: 360, textAlign: "center", boxShadow: "0 24px 80px rgba(28,20,16,0.2)" },
  modalIcon:  { width: 48, height: 48, borderRadius: "50%", background: "#fff5f5", color: "#cc4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, margin: "0 auto 16px", border: "1px solid #fdd5d5" },
  modalTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: DARK, marginBottom: 8 },
  modalSub:   { fontSize: 13, color: MID, lineHeight: 1.6, marginBottom: 24 },
  modalBtns:  { display: "flex", gap: 10 },
  btnCancel:  { flex: 1, background: CREAM, border: `1px solid ${SAND}`, borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 600, cursor: "pointer", color: MID },
  btnDel:     { flex: 1, background: "#cc4444", border: "none", borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, cursor: "pointer", color: "#fff" },
};