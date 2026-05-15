import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const STATUS = {
  pending:   { label: "Menunggu",   color: "#f59e0b", bg: "#fffbeb", next: "preparing", nextLabel: "Mula Sediakan" },
  preparing: { label: "Disediakan", color: "#3b82f6", bg: "#eff6ff", next: "ready",     nextLabel: "Sedia Hantar" },
  ready:     { label: "Sedia",      color: "#8b5cf6", bg: "#f5f3ff", next: "completed", nextLabel: "Tandakan Selesai" },
  completed: { label: "Selesai",    color: "#10b981", bg: "#ecfdf5", next: null,         nextLabel: null },
};
const STATUS_ORDER = ["pending", "preparing", "ready", "completed"];

function timeAgo(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  return `${Math.floor(diff / 3600)}j`;
}
function fmtTime(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" });
}
function fmtDate(d) {
  return d.toLocaleDateString("ms-MY", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

const TEMP_LABEL = { hot: "Panas", cold: "Sejuk", iced: "Ais" };

export default function Admin() {
  const [orders, setOrders]       = useState([]);
  const [filter, setFilter]       = useState("all");
  const [search, setSearch]       = useState("");
  const [now, setNow]             = useState(Date.now());
  const [confirmDel, setConfirmDel] = useState(null);
  const [updating, setUpdating]   = useState({});
  const [view, setView]           = useState("kanban"); // kanban | list

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), snap => {
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

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);

  const updateStatus = async (id, newStatus) => {
    setUpdating(p => ({ ...p, [id]: true }));
    await updateDoc(doc(db, "orders", id), { status: newStatus });
    setUpdating(p => ({ ...p, [id]: false }));
  };
  const deleteOrder = async (id) => { await deleteDoc(doc(db, "orders", id)); setConfirmDel(null); };

  const filtered = orders.filter(o => {
    const mf = filter === "all" || o.status === filter;
    const ms = !search || String(o.table).includes(search) || o.items?.some(i => i.name?.toLowerCase().includes(search.toLowerCase()));
    return mf && ms;
  });

  const counts  = STATUS_ORDER.reduce((a, s) => { a[s] = orders.filter(o => o.status === s).length; return a; }, {});
  const revenue = orders.filter(o => o.status === "completed").reduce((s, o) => s + (o.total || 0), 0);
  const activeC = orders.filter(o => o.status !== "completed").length;
  const avgOrder = orders.length > 0 ? (orders.reduce((s, o) => s + (o.total || 0), 0) / orders.length) : 0;
  const urgentC = orders.filter(o => {
    if (o.status === "completed") return false;
    const mins = o.createdAt ? Math.floor((Date.now() - (o.createdAt.toDate?.() ?? new Date(o.createdAt)).getTime()) / 60000) : 0;
    return mins > 15;
  }).length;

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .order-card { transition: box-shadow 0.2s; }
        .order-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeIn 0.25s ease both; }
      `}</style>

      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.sideHead}>
          <div style={s.logoMark}>WS</div>
          <div>
            <div style={s.logoName}>Warung Selera</div>
            <div style={s.logoRole}>Papan Pemantauan</div>
          </div>
        </div>

        {/* Metrics */}
        <div style={s.metricsGrid}>
          <div style={s.metric}>
            <div style={s.metricVal}>{activeC}</div>
            <div style={s.metricLbl}>Aktif</div>
          </div>
          <div style={s.metric}>
            <div style={{ ...s.metricVal, color: urgentC > 0 ? "#ef4444" : "#fff" }}>{urgentC}</div>
            <div style={s.metricLbl}>Lambat</div>
          </div>
          <div style={{ ...s.metric, gridColumn: "1 / -1" }}>
            <div style={{ ...s.metricVal, fontSize: 22 }}>RM {revenue.toFixed(2)}</div>
            <div style={s.metricLbl}>Hasil Hari Ini</div>
          </div>
          <div style={s.metric}>
            <div style={{ ...s.metricVal, fontSize: 18 }}>RM {avgOrder.toFixed(0)}</div>
            <div style={s.metricLbl}>Purata Order</div>
          </div>
          <div style={s.metric}>
            <div style={{ ...s.metricVal, fontSize: 18 }}>{orders.length}</div>
            <div style={s.metricLbl}>Jumlah Order</div>
          </div>
        </div>

        {/* Nav */}
        <div style={s.navSection}>
          <div style={s.navLabel}>PAPARAN</div>
          <button onClick={() => setFilter("all")} style={{ ...s.navBtn, ...(filter === "all" ? s.navBtnActive : {}) }}>
            <span style={s.navDot("#64748b")} />
            <span style={s.navText}>Semua</span>
            <span style={s.navBadge}>{orders.length}</span>
          </button>
          {STATUS_ORDER.map(st => {
            const cfg = STATUS[st];
            const act = filter === st;
            return (
              <button key={st} onClick={() => setFilter(st)}
                style={{ ...s.navBtn, ...(act ? { ...s.navBtnActive, background: cfg.color + "15" } : {}) }}>
                <span style={s.navDot(cfg.color)} />
                <span style={{ ...s.navText, color: act ? cfg.color : "rgba(255,255,255,0.55)" }}>{cfg.label}</span>
                <span style={{ ...s.navBadge, background: cfg.color + "22", color: cfg.color }}>{counts[st]}</span>
              </button>
            );
          })}
        </div>

        <div style={s.sideFooter}>
          <div style={s.clock}>
            {new Date(now).toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div style={s.clockDate}>{fmtDate(new Date())}</div>
        </div>
      </aside>

      {/* Main */}
      <div style={s.main}>
        {/* Topbar */}
        <div style={s.topbar}>
          <div>
            <h1 style={s.pageTitle}>{filter === "all" ? "Semua Pesanan" : STATUS[filter]?.label}</h1>
            <div style={s.pageSub}>{filtered.length} pesanan · Dikemaskini setiap 15s</div>
          </div>
          <div style={s.topbarRight}>
            <div style={s.searchBox}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari meja atau item..." style={s.searchInput} />
            </div>
            <div style={s.viewToggle}>
              <button onClick={() => setView("kanban")} style={{ ...s.viewBtn, ...(view === "kanban" ? s.viewBtnActive : {}) }} title="Kanban">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="18"/><rect x="14" y="3" width="7" height="18"/></svg>
              </button>
              <button onClick={() => setView("list")} style={{ ...s.viewBtn, ...(view === "list" ? s.viewBtnActive : {}) }} title="Senarai">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Pipeline strip */}
        <div style={s.pipeline}>
          {STATUS_ORDER.map((st, i) => {
            const cfg = STATUS[st];
            return (
              <div key={st} style={s.pipeStep} onClick={() => setFilter(st)}>
                <div style={{ ...s.pipeNum, color: cfg.color, borderColor: cfg.color + "50", background: cfg.bg, cursor: "pointer" }}>
                  {counts[st]}
                </div>
                <div style={s.pipeLbl}>{cfg.label}</div>
                {i < 3 && <div style={s.pipeArrow}>›</div>}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div style={s.content}>
          {filtered.length === 0 ? (
            <div style={s.emptyState}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="1"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              <div style={s.emptyTitle}>Tiada pesanan ditemui</div>
              <div style={s.emptySub}>Tiada rekod dalam kategori ini buat masa ini</div>
            </div>
          ) : view === "kanban" ? (
            <div style={s.grid}>
              {filtered.map((order, idx) => {
                const cfg = STATUS[order.status] || STATUS.pending;
                const isUpd = updating[order.id];
                const mins = order.createdAt
                  ? Math.floor((Date.now() - (order.createdAt.toDate?.() ?? new Date(order.createdAt)).getTime()) / 60000)
                  : 0;
                const isUrgent = order.status !== "completed" && mins > 15;
                return (
                  <div key={order.id} className="order-card fade-in"
                    style={{ ...s.card, ...(isUrgent ? s.cardUrgent : {}), animationDelay: `${idx * 30}ms`, borderTop: `3px solid ${cfg.color}` }}>
                    
                    {/* Card header */}
                    <div style={s.cardTop}>
                      <div style={s.tableTag}>
                        <span style={s.tableTagTxt}>Meja {order.table}</span>
                      </div>
                      <div style={s.cardTopRight}>
                        {isUrgent && <span style={s.urgentTag}>Lambat</span>}
                        <span style={{ ...s.statusTag, color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                      </div>
                    </div>

                    {/* Time */}
                    <div style={s.timeRow}>
                      <span style={s.timeTxt}>{fmtTime(order.createdAt)}</span>
                      <span style={s.agoBadge}>
                        {timeAgo(order.createdAt)} lepas
                        {isUrgent && <span style={{ color: "#ef4444", marginLeft: 4 }}>· {mins}m</span>}
                      </span>
                    </div>

                    {/* Items */}
                    <div style={s.itemBlock}>
                      {order.items?.map((item, i) => (
                        <div key={i} style={s.itemRow}>
                          <span style={s.itemQty}>{item.qty}×</span>
                          <span style={s.itemName}>{item.name}</span>
                          {item.temp && <span style={s.itemTemp}>{TEMP_LABEL[item.temp] || item.temp}</span>}
                          <span style={s.itemPrice}>RM {(item.price * item.qty).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Note */}
                    {order.note && (
                      <div style={s.noteBox}>
                        <span style={s.noteIcon}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </span>
                        <span style={s.noteTxt}>{order.note}</span>
                      </div>
                    )}

                    {/* Total */}
                    <div style={s.totalRow}>
                      <span style={s.totalLbl}>Jumlah</span>
                      <span style={s.totalAmt}>RM {Number(order.total).toFixed(2)}</span>
                    </div>

                    {/* Actions */}
                    <div style={s.actions}>
                      {cfg.next ? (
                        <button disabled={isUpd} onClick={() => updateStatus(order.id, cfg.next)}
                          style={{ ...s.actionBtn, background: cfg.color, opacity: isUpd ? 0.6 : 1 }}>
                          {isUpd ? "Mengemas..." : cfg.nextLabel}
                        </button>
                      ) : (
                        <div style={s.completedTag}>Pesanan Selesai</div>
                      )}
                      <button onClick={() => setConfirmDel(order.id)} style={s.delBtn} title="Padam">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* LIST VIEW */
            <div style={s.listWrap}>
              <table style={s.table}>
                <thead>
                  <tr style={s.thead}>
                    <th style={s.th}>Meja</th>
                    <th style={s.th}>Masa</th>
                    <th style={s.th}>Item</th>
                    <th style={s.th}>Nota</th>
                    <th style={s.th}>Jumlah</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(order => {
                    const cfg = STATUS[order.status] || STATUS.pending;
                    const isUpd = updating[order.id];
                    const mins = order.createdAt
                      ? Math.floor((Date.now() - (order.createdAt.toDate?.() ?? new Date(order.createdAt)).getTime()) / 60000)
                      : 0;
                    const isUrgent = order.status !== "completed" && mins > 15;
                    return (
                      <tr key={order.id} style={{ ...s.tr, background: isUrgent ? "#fff5f5" : "#fff" }}>
                        <td style={s.td}><span style={s.tableTagSm}>Meja {order.table}</span></td>
                        <td style={s.td}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{fmtTime(order.createdAt)}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>{timeAgo(order.createdAt)} lepas</div>
                        </td>
                        <td style={{ ...s.td, maxWidth: 200 }}>
                          {order.items?.map((item, i) => (
                            <div key={i} style={{ fontSize: 12, color: "#374151" }}>
                              {item.qty}× {item.name}{item.temp ? ` (${TEMP_LABEL[item.temp]||item.temp})` : ""}
                            </div>
                          ))}
                        </td>
                        <td style={s.td}><span style={{ fontSize: 12, color: "#64748b" }}>{order.note || "—"}</span></td>
                        <td style={s.td}><span style={{ fontSize: 14, fontWeight: 700 }}>RM {Number(order.total).toFixed(2)}</span></td>
                        <td style={s.td}><span style={{ ...s.statusTag, color: cfg.color, background: cfg.bg }}>{cfg.label}</span></td>
                        <td style={s.td}>
                          <div style={{ display: "flex", gap: 6 }}>
                            {cfg.next && (
                              <button disabled={isUpd} onClick={() => updateStatus(order.id, cfg.next)}
                                style={{ ...s.actionBtnSm, background: cfg.color }}>
                                {isUpd ? "..." : "→ " + cfg.nextLabel}
                              </button>
                            )}
                            <button onClick={() => setConfirmDel(order.id)} style={s.delBtnSm}>Padam</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete modal */}
      {confirmDel && (
        <div style={s.modalBg} onClick={() => setConfirmDel(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalTitle}>Padam Pesanan?</div>
            <div style={s.modalSub}>Tindakan ini tidak boleh dibatalkan dan rekod akan dipadamkan secara kekal.</div>
            <div style={s.modalBtns}>
              <button onClick={() => setConfirmDel(null)} style={s.modalCancel}>Batal</button>
              <button onClick={() => deleteOrder(confirmDel)} style={s.modalDel}>Padam</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const s = {
  root:         { display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "'DM Sans', sans-serif", color: "#0f172a" },

  sidebar:      { width: 248, background: "#0f172a", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto" },
  sideHead:     { display: "flex", alignItems: "center", gap: 12, padding: "24px 20px 20px" },
  logoMark:     { width: 38, height: 38, background: "#e8334a", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Playfair Display', serif", letterSpacing: -0.5, flexShrink: 0 },
  logoName:     { fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: "'Playfair Display', serif", letterSpacing: -0.3 },
  logoRole:     { fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 1.2, marginTop: 1 },

  metricsGrid:  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "0 16px 20px" },
  metric:       { background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.07)" },
  metricVal:    { fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: -0.5 },
  metricLbl:    { fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 3, letterSpacing: 0.5 },

  navSection:   { padding: "0 12px", flex: 1 },
  navLabel:     { fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: 1.5, padding: "0 10px", marginBottom: 8 },
  navBtn:       { display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "9px 12px", borderRadius: 9, border: "none", background: "transparent", cursor: "pointer", textAlign: "left", marginBottom: 2 },
  navBtnActive: { background: "rgba(255,255,255,0.09)" },
  navDot:       (c) => ({ width: 7, height: 7, borderRadius: "50%", background: c, flexShrink: 0 }),
  navText:      { flex: 1, fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.55)" },
  navBadge:     { fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "1px 8px", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" },

  sideFooter:   { padding: "16px 20px 24px", borderTop: "1px solid rgba(255,255,255,0.07)", marginTop: "auto" },
  clock:        { fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: -1, fontFamily: "'Playfair Display', serif" },
  clockDate:    { fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4, lineHeight: 1.5 },

  main:         { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  topbar:       { background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "18px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  pageTitle:    { fontSize: 20, fontWeight: 700, fontFamily: "'Playfair Display', serif", letterSpacing: -0.4 },
  pageSub:      { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  topbarRight:  { display: "flex", gap: 10, alignItems: "center" },
  searchBox:    { display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 9, padding: "9px 14px", minWidth: 220 },
  searchInput:  { background: "transparent", border: "none", outline: "none", fontSize: 13, color: "#0f172a", width: "100%", fontFamily: "inherit" },
  viewToggle:   { display: "flex", background: "#f1f5f9", borderRadius: 9, padding: 3, border: "1px solid #e2e8f0" },
  viewBtn:      { background: "transparent", border: "none", borderRadius: 7, padding: "7px 10px", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center" },
  viewBtnActive:{ background: "#fff", color: "#0f172a", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },

  pipeline:     { background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "12px 28px", display: "flex", alignItems: "center", gap: 4 },
  pipeStep:     { display: "flex", alignItems: "center", gap: 8 },
  pipeNum:      { width: 36, height: 36, borderRadius: "50%", border: "2px solid", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, transition: "transform 0.15s" },
  pipeLbl:      { fontSize: 12, fontWeight: 600, color: "#64748b" },
  pipeArrow:    { fontSize: 18, color: "#cbd5e1", padding: "0 10px" },

  content:      { flex: 1, overflowY: "auto", padding: "20px 28px" },

  grid:         { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14 },
  card:         { background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: 16, display: "flex", flexDirection: "column", gap: 10 },
  cardUrgent:   { border: "1px solid #fca5a5", background: "#fff7f7" },
  cardTop:      { display: "flex", justifyContent: "space-between", alignItems: "center" },
  tableTag:     { background: "#0f172a", borderRadius: 7, padding: "4px 10px" },
  tableTagTxt:  { fontSize: 12, fontWeight: 700, color: "#fff" },
  cardTopRight: { display: "flex", gap: 6, alignItems: "center" },
  urgentTag:    { fontSize: 10, fontWeight: 700, color: "#ef4444", background: "#fef2f2", border: "1px solid #fecdd3", borderRadius: 20, padding: "2px 8px" },
  statusTag:    { fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "3px 10px" },
  timeRow:      { display: "flex", justifyContent: "space-between" },
  timeTxt:      { fontSize: 12, fontWeight: 600, color: "#374151" },
  agoBadge:     { fontSize: 11, color: "#94a3b8" },
  itemBlock:    { background: "#f8fafc", borderRadius: 9, padding: "8px 10px", display: "flex", flexDirection: "column", gap: 5, border: "1px solid #e8e8e8" },
  itemRow:      { display: "flex", alignItems: "center", gap: 8 },
  itemQty:      { fontSize: 13, fontWeight: 800, color: "#e8334a", minWidth: 22 },
  itemName:     { flex: 1, fontSize: 12, color: "#0f172a" },
  itemTemp:     { fontSize: 10, fontWeight: 600, color: "#3b82f6", background: "#eff6ff", borderRadius: 5, padding: "1px 6px" },
  itemPrice:    { fontSize: 11, color: "#64748b", fontWeight: 600 },
  noteBox:      { display: "flex", gap: 7, background: "#fefce8", border: "1px solid #fef08a", borderRadius: 8, padding: "7px 10px", alignItems: "flex-start" },
  noteIcon:     { color: "#a16207", flexShrink: 0, marginTop: 1 },
  noteTxt:      { fontSize: 12, color: "#854d0e", lineHeight: 1.45 },
  totalRow:     { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e8e8e8", paddingTop: 9 },
  totalLbl:     { fontSize: 12, color: "#64748b" },
  totalAmt:     { fontSize: 17, fontWeight: 700, fontFamily: "'Playfair Display', serif" },
  actions:      { display: "flex", gap: 8 },
  actionBtn:    { flex: 1, color: "#fff", border: "none", borderRadius: 9, padding: "10px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: 0.2, transition: "opacity 0.15s" },
  completedTag: { flex: 1, textAlign: "center", fontSize: 12, fontWeight: 600, color: "#10b981", background: "#ecfdf5", borderRadius: 9, padding: "10px", border: "1px solid #a7f3d0" },
  delBtn:       { width: 36, height: 36, background: "#fff1f2", border: "1px solid #fecdd3", color: "#ef4444", borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },

  // List view
  listWrap:     { background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" },
  table:        { width: "100%", borderCollapse: "collapse" },
  thead:        { background: "#f8fafc" },
  th:           { padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: 0.8, borderBottom: "1px solid #e2e8f0" },
  tr:           { borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" },
  td:           { padding: "12px 16px", verticalAlign: "middle" },
  tableTagSm:   { background: "#0f172a", borderRadius: 6, padding: "3px 9px", fontSize: 11, fontWeight: 700, color: "#fff" },
  actionBtnSm:  { color: "#fff", border: "none", borderRadius: 7, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" },
  delBtnSm:     { background: "#fff1f2", border: "1px solid #fecdd3", color: "#ef4444", borderRadius: 7, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" },

  // Empty
  emptyState:   { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 80, gap: 12 },
  emptyTitle:   { fontSize: 16, fontWeight: 600, color: "#374151" },
  emptySub:     { fontSize: 13, color: "#94a3b8" },

  // Modal
  modalBg:      { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" },
  modal:        { background: "#fff", borderRadius: 16, padding: "28px 32px", width: 340, textAlign: "center" },
  modalTitle:   { fontSize: 17, fontWeight: 700, fontFamily: "'Playfair Display', serif", marginBottom: 8 },
  modalSub:     { fontSize: 13, color: "#64748b", marginBottom: 24, lineHeight: 1.5 },
  modalBtns:    { display: "flex", gap: 10 },
  modalCancel:  { flex: 1, background: "#f1f5f9", border: "none", borderRadius: 10, padding: 13, fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#374151" },
  modalDel:     { flex: 1, background: "#ef4444", border: "none", borderRadius: 10, padding: 13, fontSize: 14, fontWeight: 700, cursor: "pointer", color: "#fff" },
};