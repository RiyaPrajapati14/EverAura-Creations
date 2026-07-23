import React, { useState, useEffect, useCallback, useRef } from 'react';

/* ── Status config ─────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  'Received':                     { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', emoji: '📥' },
  'In Production':                 { color: '#d97706', bg: '#fffbeb', border: '#fde68a', emoji: '🎨' },
  'Ready for Delivery in Nadiad': { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', emoji: '📦' },
  'Completed':                    { color: '#6b21a8', bg: '#faf5ff', border: '#e9d5ff', emoji: '✅' },
  'Cancelled':                    { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', emoji: '❌' },
};

/* ── Order Status Flow Steps for Visual Pipeline Timeline ── */
const STATUS_STEPS = [
  'Received',
  'In Production',
  'Ready for Delivery in Nadiad',
  'Completed'
];

/* ── Preset Customer Message Templates ─────────────────────────────────── */
const QUICK_CUSTOMER_TEMPLATES = [
  { label: '✨ Select Quick Message Template...', text: '' },
  { label: '📐 Design Preview Ready', text: 'Hello! Your design preview is ready. Please check back here to confirm your approval!' },
  { label: '🎨 Order in Production', text: 'Great news! Our artisans have started crafting your order in our Nadiad studio.' },
  { label: '📦 Ready for Nadiad Pickup', text: 'Your order is ready! You can pick it up from our Nadiad studio or confirm your delivery window.' },
  { label: '❓ Customization Detail Query', text: 'We have a quick question about your customization request. Please drop a message in the chat!' },
  { label: '✅ Order Completed', text: 'Thank you for choosing EverAura Creations! Your order has been completed.' }
];

/* ── Inline styles shared ─────────────────────────────────────────────── */
const S = {
  card: { background: '#fff', border: '1px solid rgba(184,115,74,0.18)', borderRadius: '18px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 4px 16px rgba(44,24,16,0.04)' },
  label: { fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9e7a5f', display: 'block', marginBottom: '4px' },
  value: { fontWeight: 700, color: '#3d2b1a', fontSize: '0.95rem' },
  btn: (bg, color, border) => ({ background: bg, color, border: border || 'none', borderRadius: '10px', padding: '8px 18px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.18s', fontFamily: 'inherit' }),
};

/* ── Custom Modal ──────────────────────────────────────────────────────── */
const Modal = ({ title, children, onClose, width = '500px' }) => (
  <div
    onClick={onClose}
    style={{ position: 'fixed', inset: 0, background: 'rgba(20,10,5,0.7)', backdropFilter: 'blur(8px)', zIndex: 9999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
  >
    <div
      onClick={e => e.stopPropagation()}
      style={{ background: '#fff', width: '100%', maxWidth: width, borderRadius: '22px', border: '1.5px solid rgba(184,115,74,0.35)', boxShadow: '0 28px 72px rgba(0,0,0,0.35)', overflow: 'hidden', animation: 'adminModalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)' }}
    >
      <div style={{ background: 'linear-gradient(135deg, #5c2d0e, #b8734a)', padding: '16px 24px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>{title}</span>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
      </div>
      <div style={{ padding: '24px' }}>{children}</div>
    </div>
  </div>
);

/* ── Confirm Dialog ─────────────────────────────────────────────────────── */
const ConfirmDialog = ({ message, onConfirm, onCancel, confirmText = 'Confirm', confirmColor = '#b8734a', extra }) => (
  <Modal title="Confirm Action" onClose={onCancel}>
    <p style={{ color: '#3d2b1a', lineHeight: 1.6, marginBottom: '12px', fontSize: '0.95rem' }}>{message}</p>
    {extra}
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
      <button onClick={onCancel} style={S.btn('#fdf3eb', '#6b4c32', '1px solid rgba(184,115,74,0.3)')}>Cancel</button>
      <button onClick={onConfirm} style={{ ...S.btn(confirmColor, '#fff'), boxShadow: `0 4px 14px ${confirmColor}55` }}>{confirmText}</button>
    </div>
  </Modal>
);

/* ── Status Badge ───────────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Received'];
  return (
    <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
      <span>{cfg.emoji}</span> {status}
    </span>
  );
};

/* ── Order Workflow Step Progress Bar ──────────────────────────────────── */
const OrderWorkflowTimeline = ({ currentStatus }) => {
  if (currentStatus === 'Cancelled') {
    return (
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '8px 14px', borderRadius: '10px', fontSize: '0.8rem', color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>❌</span> Order has been cancelled.
      </div>
    );
  }

  const activeIndex = STATUS_STEPS.indexOf(currentStatus);
  const currentStep = activeIndex === -1 ? 0 : activeIndex;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '4px 0 8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        {/* Background track line */}
        <div style={{ position: 'absolute', top: '50%', left: '16px', right: '16px', height: '3px', background: '#e2d4c9', transform: 'translateY(-50%)', zIndex: 1 }} />
        
        {/* Completed track line */}
        <div style={{ position: 'absolute', top: '50%', left: '16px', width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%`, height: '3px', background: 'linear-gradient(90deg, #b8734a, #16a34a)', transform: 'translateY(-50%)', zIndex: 2, transition: 'width 0.3s' }} />

        {STATUS_STEPS.map((step, idx) => {
          const isDone = idx <= currentStep;
          const isCurrent = idx === currentStep;
          return (
            <div key={step} style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: isCurrent ? '26px' : '20px',
                height: isCurrent ? '26px' : '20px',
                borderRadius: '50%',
                background: isCurrent ? '#16a34a' : isDone ? '#b8734a' : '#fff',
                border: `2px solid ${isDone ? '#b8734a' : '#c49a72'}`,
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 800,
                boxShadow: isCurrent ? '0 0 0 4px rgba(22,163,74,0.2)' : 'none',
                transition: 'all 0.2s'
              }}>
                {isDone ? '✓' : idx + 1}
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: isCurrent ? 800 : 600, color: isCurrent ? '#16a34a' : isDone ? '#8b4513' : '#9e7a5f', marginTop: '4px' }}>
                {step.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── Hero Metric Stat Tiles Bar ───────────────────────────────────────── */
const HeroStatsBar = ({ orders, filterStatus, setFilterStatus }) => {
  const stats = [
    { key: 'All',                          label: 'Total Orders',  value: orders.length,                                          color: '#b8734a', bg: 'linear-gradient(135deg, #fdf3eb, #faf0e6)', icon: '📋' },
    { key: 'In Production',                label: 'In Production', value: orders.filter(o => o.status === 'In Production').length, color: '#d97706', bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)', icon: '🎨' },
    { key: 'Ready for Delivery in Nadiad', label: 'Ready for Nadiad',value: orders.filter(o => o.status === 'Ready for Delivery in Nadiad').length, color: '#16a34a', bg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', icon: '📦' },
    { key: 'Completed',                    label: 'Completed',     value: orders.filter(o => o.status === 'Completed').length,     color: '#6b21a8', bg: 'linear-gradient(135deg, #faf5ff, #f3e8ff)', icon: '✅' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '22px' }}>
      {stats.map(s => {
        const isActive = filterStatus === s.key;
        return (
          <div
            key={s.key}
            onClick={() => setFilterStatus(s.key)}
            style={{
              background: s.bg,
              border: `2px solid ${isActive ? s.color : 'transparent'}`,
              borderRadius: '16px',
              padding: '16px',
              cursor: 'pointer',
              boxShadow: isActive ? `0 6px 20px ${s.color}33` : '0 2px 10px rgba(0,0,0,0.03)',
              transition: 'transform 0.18s, box-shadow 0.18s',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1.8rem' }}>{s.icon}</span>
              <span style={{ fontSize: '1.85rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#5c2d0e', marginTop: '8px', fontWeight: 700 }}>
              {s.label}
            </div>
            {isActive && (
              <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', height: '4px', background: s.color }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   MAIN ADMIN COMPONENT
══════════════════════════════════════════════════════════════════════════ */
const StudioAdmin = ({ isOpen, onClose }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [toast, setToast] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [noteInputs, setNoteInputs] = useState({});
  const [customerMessageInputs, setCustomerMessageInputs] = useState({});
  const [dbStatus, setDbStatus] = useState('Checking...');
  const pinRef = useRef(null);

  /* ── Query-related state ── */
  const [queries, setQueries] = useState([]);
  const [queriesLoading, setQueriesLoading] = useState(false);
  const [unreadQueryCount, setUnreadQueryCount] = useState(0);
  const [expandedQuery, setExpandedQuery] = useState(null);
  const [replyInputs, setReplyInputs] = useState({});
  const [sendingReply, setSendingReply] = useState({});

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  /* ── Fetch DB Health ── */
  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setDbStatus(data.database || 'Online');
    } catch {
      setDbStatus('Local JSON Fallback');
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.status === 'success') {
        setOrders(data.orders || []);
      }
    } catch (err) {
      showToast('Failed to load orders.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchQueries = useCallback(async () => {
    setQueriesLoading(true);
    try {
      const res = await fetch('/api/queries');
      const data = await res.json();
      if (Array.isArray(data)) setQueries(data);
    } catch {
      showToast('Failed to load queries.', 'error');
    } finally {
      setQueriesLoading(false);
    }
  }, [showToast]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/queries/unread-count');
      const data = await res.json();
      if (typeof data.count === 'number') setUnreadQueryCount(data.count);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      fetchHealth();
      fetchOrders();
      fetchQueries();
      fetchUnreadCount();
    }
  }, [isAuthenticated, isOpen, fetchHealth, fetchOrders, fetchQueries, fetchUnreadCount]);

  useEffect(() => {
    if (!isAuthenticated || !isOpen) return;
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, isOpen, fetchUnreadCount]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        if (dialog) { setDialog(null); return; }
        onClose();
      }
    };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose, dialog]);

  useEffect(() => {
    if (isOpen && !isAuthenticated) setTimeout(() => pinRef.current?.focus(), 100);
  }, [isOpen, isAuthenticated]);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (['nadiad2026', 'everaura', 'admin'].includes(pin)) {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('❌ Incorrect PIN. Try: nadiad2026');
      setTimeout(() => setPinError(''), 3000);
    }
  };

  const requestStatusChange = (orderId, newStatus) => {
    setDialog({ type: 'status', orderId, newStatus });
  };

  const confirmStatusChange = async () => {
    const { orderId, newStatus } = dialog;
    setDialog(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o));
        showToast(`✅ Status updated to "${newStatus}"`);
      } else {
        showToast('Failed: ' + (data.message || 'Error'), 'error');
      }
    } catch {
      showToast('Network error updating status.', 'error');
    }
  };

  const requestDelete = (orderId) => {
    setDialog({ type: 'delete', orderId });
  };

  const confirmDelete = async () => {
    const { orderId } = dialog;
    setDialog(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'success') {
        setOrders(prev => prev.filter(o => o.order_id !== orderId));
        showToast('🗑️ Order deleted.');
      } else {
        showToast('Delete failed.', 'error');
      }
    } catch {
      showToast('Network error deleting order.', 'error');
    }
  };

  const saveNote = async (orderId) => {
    const note = noteInputs[orderId] || '';
    try {
      const res = await fetch(`/api/orders/${orderId}/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, admin_notes: note } : o));
        showToast('📝 Note saved!');
      }
    } catch {
      showToast('Failed to save note.', 'error');
    }
  };

  const saveCustomerMessage = async (orderId) => {
    const message = customerMessageInputs[orderId] || '';
    try {
      const res = await fetch(`/api/orders/${orderId}/customer-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, customer_message: message } : o));
        showToast('💬 Customer message saved & active on tracker!');
      }
    } catch {
      showToast('Failed to save customer message.', 'error');
    }
  };

  const markQueryRead = async (queryId) => {
    try {
      await fetch(`/api/queries/${queryId}/read`, { method: 'PATCH' });
      setQueries(prev => prev.map(q => q.queryId === queryId ? { ...q, isReadByAdmin: true } : q));
      setUnreadQueryCount(prev => Math.max(0, prev - 1));
    } catch { /* silent */ }
  };

  const sendQueryReply = async (queryId) => {
    const text = (replyInputs[queryId] || '').trim();
    if (!text) return showToast('Please type a reply first.', 'error');
    setSendingReply(prev => ({ ...prev, [queryId]: true }));
    try {
      const res = await fetch(`/api/queries/${queryId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (data.success) {
        setQueries(prev => prev.map(q => q.queryId === queryId ? data.query : q));
        setReplyInputs(prev => ({ ...prev, [queryId]: '' }));
        showToast('📨 Reply sent!');
      } else {
        showToast(data.error || 'Failed to send reply.', 'error');
      }
    } catch {
      showToast('Network error sending reply.', 'error');
    } finally {
      setSendingReply(prev => ({ ...prev, [queryId]: false }));
    }
  };

  const filteredOrders = orders.filter(o => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      (o.customer_name || '').toLowerCase().includes(q) ||
      (o.phone || '').includes(q) ||
      (o.order_id || '').includes(q) ||
      (o.product_required || '').toLowerCase().includes(q);
    const matchStatus = filterStatus === 'All' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes adminModalIn {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes adminSlideIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes adminToastIn {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .admin-tab-btn {
          padding: 10px 18px; border: none; cursor: pointer;
          font-weight: 700; font-size: 0.88rem; border-radius: 12px;
          background: transparent; color: #9e7a5f;
          transition: all 0.2s; font-family: inherit;
          display: flex; alignItems: center; gap: 8px;
        }
        .admin-tab-btn.active {
          background: #fdf3eb; color: #8b4513;
          box-shadow: inset 0 0 0 1.5px rgba(184,115,74,0.3);
        }
        .admin-tab-btn:hover:not(.active) { background: #faf0e6; color: #5c2d0e; }
        .admin-card-hover { transition: transform 0.2s, box-shadow 0.2s; }
        .admin-card-hover:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(44,24,16,0.08); }
        .admin-input { padding: 10px 14px; border: 1.5px solid rgba(184,115,74,0.25); border-radius: 12px; font-size: 0.88rem; outline: none; background: #fffcf9; color: #3d2b1a; font-family: inherit; transition: border-color 0.18s, box-shadow 0.18s; }
        .admin-input:focus { border-color: #b8734a; box-shadow: 0 0 0 3px rgba(184,115,74,0.12); }
        .admin-select { padding: 8px 14px; border: 1.5px solid rgba(184,115,74,0.25); border-radius: 12px; font-size: 0.85rem; background: #fffcf9; color: #3d2b1a; cursor: pointer; font-family: inherit; font-weight: 700; outline: none; }
        .admin-select:focus { border-color: #b8734a; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '28px', left: '28px', zIndex: 9999999,
          background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: toast.type === 'error' ? '#dc2626' : '#16a34a',
          border: `1.5px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          padding: '13px 22px', borderRadius: '16px', fontWeight: 700, fontSize: '0.9rem',
          boxShadow: '0 12px 32px rgba(0,0,0,0.16)', animation: 'adminToastIn 0.25s ease',
          maxWidth: '380px'
        }}>
          {toast.msg}
        </div>
      )}

      {/* Confirmation Dialogs */}
      {dialog?.type === 'status' && (
        <ConfirmDialog
          message={`Update order #${dialog.orderId} status to:`}
          extra={<div style={{ marginTop: '10px' }}><StatusBadge status={dialog.newStatus} /></div>}
          onConfirm={confirmStatusChange}
          onCancel={() => setDialog(null)}
          confirmText="Update Status"
        />
      )}
      {dialog?.type === 'delete' && (
        <ConfirmDialog
          message={`Permanently delete order #${dialog.orderId}? This cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDialog(null)}
          confirmText="Delete Order"
          confirmColor="#dc2626"
        />
      )}

      {/* Main Overlay Modal */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(20,10,5,0.78)', backdropFilter: 'blur(10px)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'Jost', system-ui, sans-serif" }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{ background: '#faf6f0', width: '100%', maxWidth: '1050px', maxHeight: '92vh', borderRadius: '26px', border: '2px solid rgba(184,115,74,0.35)', boxShadow: '0 36px 90px rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'adminSlideIn 0.28s cubic-bezier(0.34,1.56,0.64,1)' }}
        >
          {/* Dashboard Header Bar */}
          <div style={{ background: 'linear-gradient(135deg, #422006 0%, #78350f 45%, #b8734a 100%)', padding: '18px 28px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                🎨
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.01em', color: '#fff' }}>
                  EverAura Studio — Executive Command Center
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', fontSize: '0.76rem', opacity: 0.9 }}>
                  <span>Nadiad Studio Hub</span>
                  <span>·</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.18)', padding: '2px 8px', borderRadius: '10px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} />
                    {dbStatus}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', color: '#fff', width: '38px', height: '38px', borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >✕</button>
          </div>

          {/* Body Content */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {!isAuthenticated ? (
              /* ── PIN Authentication Screen ── */
              <div style={{ maxWidth: '400px', margin: 'auto', padding: '50px 20px', textAlign: 'center' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#fdf3eb', border: '2px solid rgba(184,115,74,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', margin: '0 auto 18px' }}>
                  🔐
                </div>
                <h3 style={{ fontWeight: 900, color: '#3d2b1a', marginBottom: '8px', fontSize: '1.35rem' }}>Studio Access Lock</h3>
                <p style={{ color: '#9e7a5f', fontSize: '0.88rem', marginBottom: '24px', lineHeight: 1.5 }}>
                  Enter your studio admin PIN to access Nadiad order operations.
                </p>
                <form onSubmit={handlePinSubmit} style={{ display: 'flex', gap: '10px' }}>
                  <input
                    ref={pinRef}
                    type="password"
                    className="admin-input"
                    placeholder="Enter PIN..."
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    style={{ flex: 1, textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.25em', fontWeight: 800 }}
                  />
                  <button type="submit" style={{ ...S.btn('linear-gradient(135deg,#78350f,#b8734a)', '#fff'), padding: '10px 22px', boxShadow: '0 4px 16px rgba(184,115,74,0.4)', borderRadius: '12px' }}>
                    Unlock
                  </button>
                </form>
                {pinError && <p style={{ color: '#dc2626', marginTop: '14px', fontSize: '0.88rem', fontWeight: 700 }}>{pinError}</p>}
              </div>
            ) : (
              /* ── Authenticated Dashboard Content ── */
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                
                {/* Dashboard Tab Navigation Bar */}
                <div style={{ display: 'flex', borderBottom: '1.5px solid rgba(184,115,74,0.18)', padding: '10px 24px', background: '#fff', flexShrink: 0, gap: '6px', alignItems: 'center' }}>
                  {[
                    { key: 'orders',    label: '📦 Orders', badge: orders.length },
                    { key: 'queries',   label: '📬 Queries', badge: unreadQueryCount, isUrgent: unreadQueryCount > 0 },
                    { key: 'analytics', label: '📊 Analytics' },
                    { key: 'prices',    label: '💰 Catalog Prices' },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      className={`admin-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                      onClick={() => { setActiveTab(tab.key); if (tab.key === 'queries') fetchQueries(); }}
                    >
                      <span>{tab.label}</span>
                      {tab.badge !== undefined && (
                        <span style={{
                          background: tab.isUrgent ? '#dc2626' : activeTab === tab.key ? '#b8734a' : 'rgba(184,115,74,0.15)',
                          color: tab.isUrgent || activeTab === tab.key ? '#fff' : '#8b4513',
                          padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800
                        }}>{tab.badge}</span>
                      )}
                    </button>
                  ))}

                  <button
                    onClick={() => { fetchOrders(); fetchQueries(); }}
                    disabled={loading}
                    style={{ marginLeft: 'auto', ...S.btn('#fdf3eb', '#8b4513', '1px solid rgba(184,115,74,0.3)'), fontSize: '0.8rem', padding: '7px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {loading ? '🔄 Syncing...' : '🔄 Refresh Data'}
                  </button>
                </div>

                {/* Main Scrollable View Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

                  {/* ═══ 1. ORDERS TAB ═══ */}
                  {activeTab === 'orders' && (
                    <div>
                      {/* Hero Stats */}
                      <HeroStatsBar orders={orders} filterStatus={filterStatus} setFilterStatus={setFilterStatus} />

                      {/* Search & Quick Filter Pills */}
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                          <input
                            className="admin-input"
                            style={{ width: '100%', paddingLeft: '38px', boxSizing: 'border-box' }}
                            placeholder="Search orders by customer name, phone, order ID..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                          />
                          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', color: '#9e7a5f' }}>🔍</span>
                        </div>

                        {/* Fast Filter Pills */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {['All', 'Received', 'In Production', 'Ready for Delivery in Nadiad', 'Completed', 'Cancelled'].map(st => {
                            const isSel = filterStatus === st;
                            const label = st === 'Ready for Delivery in Nadiad' ? 'Ready' : st;
                            return (
                              <button
                                key={st}
                                onClick={() => setFilterStatus(st)}
                                style={{
                                  padding: '6px 14px',
                                  borderRadius: '20px',
                                  fontSize: '0.78rem',
                                  fontWeight: 800,
                                  border: `1.5px solid ${isSel ? '#b8734a' : 'rgba(184,115,74,0.25)'}`,
                                  background: isSel ? '#b8734a' : '#fff',
                                  color: isSel ? '#fff' : '#6b4c32',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s'
                                }}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Order List Cards */}
                      {filteredOrders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '20px', border: '1px solid rgba(184,115,74,0.2)' }}>
                          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
                          <h4 style={{ color: '#3d2b1a', margin: '0 0 6px', fontWeight: 800 }}>No matching orders found</h4>
                          <p style={{ color: '#9e7a5f', fontSize: '0.88rem' }}>
                            {orders.length === 0 ? 'Orders placed via the website or AI Chatbot will automatically appear here.' : 'Try adjusting your search keywords or status filter.'}
                          </p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {filteredOrders.map(order => {
                            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['Received'];
                            const isExpanded = expandedOrder === order.order_id;
                            return (
                              <div key={order.order_id} className="admin-card-hover" style={{ background: '#fff', border: `1.5px solid ${isExpanded ? '#b8734a' : 'rgba(184,115,74,0.2)'}`, borderRadius: '20px', overflow: 'hidden' }}>
                                
                                {/* Card Header Summary Bar */}
                                <div
                                  onClick={() => setExpandedOrder(isExpanded ? null : order.order_id)}
                                  style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: '12px', flexWrap: 'wrap', background: isExpanded ? '#fdf8f2' : '#fff', borderBottom: isExpanded ? '1px solid rgba(184,115,74,0.15)' : 'none' }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                    <span style={{
                                      background: order.source === 'AI_CHATBOT' ? '#dcfce7' : '#eff6ff',
                                      color: order.source === 'AI_CHATBOT' ? '#15803d' : '#1d4ed8',
                                      padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800
                                    }}>
                                      {order.source === 'AI_CHATBOT' ? '🤖 AI Chatbot' : '🌐 Web Form'}
                                    </span>
                                    <span style={{ fontWeight: 900, color: '#3d2b1a', fontSize: '0.98rem' }}>#{order.order_id}</span>
                                    <span style={{ fontWeight: 700, color: '#8b4513', fontSize: '0.95rem' }}>{order.customer_name}</span>
                                    <span style={{ color: '#9e7a5f', fontSize: '0.8rem' }}>
                                      {order.timestamp ? new Date(order.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                                    </span>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <StatusBadge status={order.status || 'Received'} />
                                    <span style={{ color: '#9e7a5f', fontSize: '0.9rem', fontWeight: 800 }}>{isExpanded ? '▲' : '▼'}</span>
                                  </div>
                                </div>

                                {/* Card Body (Expanded Details) */}
                                {isExpanded && (
                                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px', background: '#fff' }}>
                                    
                                    {/* Workflow Timeline Progress */}
                                    <div>
                                      <span style={S.label}>Order Progress Workflow</span>
                                      <OrderWorkflowTimeline currentStatus={order.status || 'Received'} />
                                    </div>

                                    {/* Key Details Grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                      <div style={{ background: '#faf6f0', padding: '12px 14px', borderRadius: '14px' }}>
                                        <span style={S.label}>Customer Name</span>
                                        <span style={{ ...S.value, color: '#3d2b1a' }}>{order.customer_name}</span>
                                      </div>
                                      <div style={{ background: '#faf6f0', padding: '12px 14px', borderRadius: '14px' }}>
                                        <span style={S.label}>Mobile Number</span>
                                        <span style={{ ...S.value, color: '#b8734a' }}>+91 {order.phone}</span>
                                      </div>
                                      <div style={{ background: '#faf6f0', padding: '12px 14px', borderRadius: '14px' }}>
                                        <span style={S.label}>Product Requested</span>
                                        <span style={{ ...S.value, color: '#78350f' }}>{order.product_required}</span>
                                      </div>
                                      <div style={{ background: '#faf6f0', padding: '12px 14px', borderRadius: '14px' }}>
                                        <span style={S.label}>Event / Delivery Date</span>
                                        <span style={{ ...S.value, color: '#3d2b1a' }}>{order.event_date || 'Not specified'}</span>
                                      </div>
                                    </div>

                                    {/* Customization Details Box */}
                                    <div style={{ background: '#fffdfa', border: '1px solid rgba(184,115,74,0.25)', padding: '14px 16px', borderRadius: '14px', lineHeight: 1.6 }}>
                                      <span style={{ ...S.label, marginBottom: '6px' }}>📝 Customization Notes & Requirements</span>
                                      <div style={{ color: '#422006', fontSize: '0.9rem', fontWeight: 500 }}>
                                        {order.customization_details}
                                      </div>
                                    </div>

                                    {/* Reference Image Attachment */}
                                    {order.reference_image && (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fdf3eb', padding: '10px 16px', borderRadius: '12px' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#8b4513', fontWeight: 700 }}>📎 Reference File Attached:</span>
                                        <a href={order.reference_image} target="_blank" rel="noreferrer"
                                          style={{ ...S.btn('#b8734a', '#fff'), fontSize: '0.8rem', padding: '6px 14px', borderRadius: '8px', textDecoration: 'none', boxShadow: '0 2px 8px rgba(184,115,74,0.3)' }}>
                                          View Image ➔
                                        </a>
                                      </div>
                                    )}

                                    {/* Status Workflow Selector */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '14px 16px', background: `${cfg.bg}`, borderRadius: '16px', border: `1.5px solid ${cfg.border}` }}>
                                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: cfg.color }}>Change Workflow Status:</span>
                                      <select
                                        className="admin-select"
                                        value={order.status || 'Received'}
                                        onChange={e => requestStatusChange(order.order_id, e.target.value)}
                                        style={{ background: '#fff', color: cfg.color, borderColor: cfg.border, fontWeight: 800 }}
                                      >
                                        {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{STATUS_CONFIG[s].emoji} {s}</option>)}
                                      </select>
                                    </div>

                                    {/* Message for Customer Section (with 1-click Quick Templates) */}
                                    <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', padding: '16px', borderRadius: '16px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ ...S.label, color: '#166534' }}>💬 Message for Customer (Visible on live tracking)</span>
                                        
                                        {/* Template selector dropdown */}
                                        <select
                                          className="admin-select"
                                          style={{ fontSize: '0.78rem', padding: '4px 10px', background: '#fff', borderColor: '#bbf7d0' }}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            if (val) {
                                              setCustomerMessageInputs(prev => ({ ...prev, [order.order_id]: val }));
                                            }
                                          }}
                                        >
                                          {QUICK_CUSTOMER_TEMPLATES.map(t => (
                                            <option key={t.label} value={t.text}>{t.label}</option>
                                          ))}
                                        </select>
                                      </div>

                                      <div style={{ display: 'flex', gap: '10px' }}>
                                        <textarea
                                          className="admin-input"
                                          style={{ flex: 1, resize: 'vertical', background: '#fff' }}
                                          rows={2}
                                          placeholder="Type an update or instruction for the customer to see when they track their order..."
                                          value={customerMessageInputs[order.order_id] !== undefined ? customerMessageInputs[order.order_id] : (order.customer_message || '')}
                                          onChange={e => setCustomerMessageInputs(prev => ({ ...prev, [order.order_id]: e.target.value }))}
                                        />
                                        <button
                                          onClick={() => saveCustomerMessage(order.order_id)}
                                          style={{ ...S.btn('#16a34a', '#fff'), padding: '10px 18px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(22,163,74,0.3)', whiteSpace: 'nowrap' }}
                                        >
                                          Save Message
                                        </button>
                                      </div>
                                    </div>

                                    {/* Private Admin Notes */}
                                    <div style={{ background: '#faf6f0', border: '1px solid rgba(184,115,74,0.2)', padding: '14px 16px', borderRadius: '14px' }}>
                                      <span style={S.label}>🔐 Private Studio Admin Notes (Not visible to customer)</span>
                                      <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                                        <input
                                          className="admin-input"
                                          style={{ flex: 1, background: '#fff' }}
                                          placeholder="Internal notes (e.g. material cost, artisan assigned, delivery notes)..."
                                          value={noteInputs[order.order_id] !== undefined ? noteInputs[order.order_id] : (order.admin_notes || '')}
                                          onChange={e => setNoteInputs(prev => ({ ...prev, [order.order_id]: e.target.value }))}
                                          onKeyDown={e => e.key === 'Enter' && saveNote(order.order_id)}
                                        />
                                        <button onClick={() => saveNote(order.order_id)} style={{ ...S.btn('#fdf3eb', '#8b4513', '1px solid rgba(184,115,74,0.3)'), padding: '9px 16px', borderRadius: '10px' }}>Save Note</button>
                                      </div>
                                    </div>

                                    {/* Action Bar / Delete */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
                                      <button
                                        onClick={() => requestDelete(order.order_id)}
                                        style={{ ...S.btn('#fef2f2', '#dc2626', '1px solid #fecaca'), fontSize: '0.8rem', padding: '7px 14px', borderRadius: '10px' }}
                                      >
                                        🗑️ Delete Order Record
                                      </button>
                                    </div>

                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ═══ 2. QUERIES TAB (HELPDESK) ═══ */}
                  {activeTab === 'queries' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                          <h3 style={{ margin: 0, color: '#3d2b1a', fontSize: '1.15rem', fontWeight: 900 }}>
                            📬 Customer Query Helpdesk
                          </h3>
                          <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#9e7a5f' }}>
                            {queries.length} total tickets · {unreadQueryCount} unread · Real-time chatbot thread support
                          </p>
                        </div>
                        <button
                          onClick={fetchQueries}
                          disabled={queriesLoading}
                          style={{ ...S.btn('#fdf3eb', '#8b4513', '1px solid rgba(184,115,74,0.3)'), fontSize: '0.8rem', padding: '7px 16px', borderRadius: '10px' }}
                        >
                          {queriesLoading ? '🔄 Syncing...' : '🔄 Refresh Queries'}
                        </button>
                      </div>

                      {queriesLoading && queries.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9e7a5f' }}>Loading tickets...</div>
                      ) : queries.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '20px', border: '1px solid rgba(184,115,74,0.2)' }}>
                          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
                          <h4 style={{ color: '#3d2b1a', margin: '0 0 6px', fontWeight: 800 }}>No customer queries yet</h4>
                          <p style={{ color: '#9e7a5f', fontSize: '0.88rem' }}>
                            Queries submitted by visitors via the AI Chatbot will be organized here as support tickets.
                          </p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          {queries.map(q => {
                            const isExpanded = expandedQuery === q.queryId;
                            const statusColors = {
                              open:    { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', emoji: '🟡' },
                              replied: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', emoji: '✅' },
                              closed:  { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe', emoji: '🔒' },
                            };
                            const sc = statusColors[q.status] || statusColors.open;
                            return (
                              <div
                                key={q.queryId}
                                style={{
                                  background: q.isReadByAdmin ? '#fff' : '#fff5f5',
                                  border: `1.5px solid ${q.isReadByAdmin ? 'rgba(184,115,74,0.2)' : '#fca5a5'}`,
                                  borderRadius: '20px',
                                  overflow: 'hidden',
                                  boxShadow: isExpanded ? '0 8px 24px rgba(44,24,16,0.08)' : 'none'
                                }}
                              >
                                <div
                                  onClick={() => {
                                    setExpandedQuery(isExpanded ? null : q.queryId);
                                    if (!q.isReadByAdmin) markQueryRead(q.queryId);
                                  }}
                                  style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: '12px', flexWrap: 'wrap', borderBottom: isExpanded ? '1px solid rgba(184,115,74,0.12)' : 'none' }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
                                    {!q.isReadByAdmin && (
                                      <span style={{ background: '#dc2626', color: '#fff', borderRadius: '8px', padding: '3px 9px', fontSize: '0.7rem', fontWeight: 900 }}>NEW TICKET</span>
                                    )}
                                    <span style={{ fontWeight: 800, color: '#3d2b1a', fontSize: '0.92rem' }}>{q.customerName}</span>
                                    <span style={{ color: '#9e7a5f', fontSize: '0.82rem' }}>+91 {q.phone}</span>
                                    <span style={{ color: '#b8734a', fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 800 }}>ID: {q.queryId}</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, padding: '4px 10px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 800 }}>
                                      {sc.emoji} {q.status}
                                    </span>
                                    <span style={{ color: '#9e7a5f', fontSize: '0.9rem' }}>{isExpanded ? '▲' : '▼'}</span>
                                  </div>
                                </div>

                                {isExpanded && (
                                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#fff' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                      <div style={{ background: '#faf6f0', padding: '14px 16px', borderRadius: '14px', borderLeft: '4px solid #b8734a' }}>
                                        <span style={{ ...S.label, marginBottom: '4px' }}>💬 Original Query</span>
                                        <p style={{ margin: 0, color: '#3d2b1a', lineHeight: 1.6, fontSize: '0.92rem' }}>{q.queryText}</p>
                                      </div>

                                      {/* Thread History */}
                                      {(() => {
                                        const allReplies = [
                                          ...(q.adminReplies || []).map(r => ({ ...r, sender: 'admin' })),
                                          ...(q.customerReplies || []).map(r => ({ ...r, sender: 'customer' }))
                                        ].sort((a, b) => new Date(a.repliedAt) - new Date(b.repliedAt));

                                        if (allReplies.length === 0) return null;

                                        return allReplies.map((r, ri) => (
                                          <div key={ri} style={{ 
                                            background: r.sender === 'admin' ? '#f0fdf4' : '#faf6f0', 
                                            border: `1px solid ${r.sender === 'admin' ? '#bbf7d0' : 'rgba(184,115,74,0.25)'}`, 
                                            borderRadius: '14px', padding: '12px 16px',
                                            marginLeft: r.sender === 'admin' ? '24px' : '0',
                                            marginRight: r.sender === 'customer' ? '24px' : '0'
                                          }}>
                                            <div style={{ fontSize: '0.78rem', color: r.sender === 'admin' ? '#15803d' : '#8b4513', fontWeight: 800, marginBottom: '4px' }}>
                                              {r.sender === 'admin' ? '🎨 Studio Response' : '👤 Customer Follow-up'} · {new Date(r.repliedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <p style={{ margin: 0, color: '#3d2b1a', fontSize: '0.9rem', lineHeight: 1.55 }}>{r.text}</p>
                                          </div>
                                        ));
                                      })()}
                                    </div>

                                    {/* Reply Composer */}
                                    <div style={{ background: '#f5f3ff', border: '1.5px solid #ddd6fe', borderRadius: '16px', padding: '16px' }}>
                                      <span style={{ ...S.label, color: '#6d28d9', marginBottom: '8px' }}>✏️ Reply to Customer Ticket</span>
                                      <textarea
                                        className="admin-input"
                                        rows={3}
                                        placeholder="Type your response here..."
                                        value={replyInputs[q.queryId] || ''}
                                        onChange={e => setReplyInputs(prev => ({ ...prev, [q.queryId]: e.target.value }))}
                                        style={{ width: '100%', resize: 'vertical', marginBottom: '12px', background: '#fff', boxSizing: 'border-box' }}
                                      />
                                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                        <button
                                          onClick={() => sendQueryReply(q.queryId)}
                                          disabled={sendingReply[q.queryId]}
                                          style={{ ...S.btn('linear-gradient(135deg,#7c3aed,#9333ea)', '#fff'), fontSize: '0.85rem', padding: '9px 22px', borderRadius: '12px', boxShadow: '0 4px 14px rgba(124,58,237,0.35)', opacity: sendingReply[q.queryId] ? 0.6 : 1 }}
                                        >
                                          {sendingReply[q.queryId] ? 'Sending...' : '📨 Send Reply'}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ═══ 3. ANALYTICS TAB ═══ */}
                  {activeTab === 'analytics' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <HeroStatsBar orders={orders} filterStatus={filterStatus} setFilterStatus={setFilterStatus} />

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
                        {/* Order Source Breakdown */}
                        <div style={S.card}>
                          <h4 style={{ margin: 0, color: '#3d2b1a', fontSize: '1.05rem', fontWeight: 800 }}>📊 Order Acquisition Channel</h4>
                          {[
                            { label: '🤖 AI Chatbot Assistant', count: orders.filter(o => o.source === 'AI_CHATBOT').length, color: '#15803d', bg: '#f0fdf4' },
                            { label: '🌐 Website Order Form',   count: orders.filter(o => o.source === 'WEB_FORM').length,   color: '#1d4ed8', bg: '#eff6ff' },
                          ].map(row => (
                            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: row.bg, borderRadius: '14px' }}>
                              <span style={{ fontWeight: 700, color: '#3d2b1a' }}>{row.label}</span>
                              <span style={{ fontWeight: 900, color: row.color, fontSize: '1.2rem' }}>{row.count}</span>
                            </div>
                          ))}
                        </div>

                        {/* Status Breakdown */}
                        <div style={S.card}>
                          <h4 style={{ margin: 0, color: '#3d2b1a', fontSize: '1.05rem', fontWeight: 800 }}>🔄 Workflow Distribution</h4>
                          {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                            const count = orders.filter(o => o.status === status).length;
                            return (
                              <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: cfg.bg, borderRadius: '12px', border: `1px solid ${cfg.border}` }}>
                                <span style={{ fontWeight: 700, color: cfg.color, fontSize: '0.88rem' }}>{cfg.emoji} {status}</span>
                                <span style={{ fontWeight: 900, color: cfg.color }}>{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ═══ 4. CATALOG PRICES TAB ═══ */}
                  {activeTab === 'prices' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {[
                        { title: '🎨 Handmade & Resin Art Catalog', items: [
                          { name: 'Wedding Welcome Board (Calligraphy, A2)',    range: '₹800 – ₹1,800' },
                          { name: 'Wedding Welcome Board (Resin + Floral, A2)', range: '₹1,500 – ₹2,800' },
                          { name: 'Ring Ceremony Platter (Thaal)',              range: '₹1,200 – ₹2,400' },
                          { name: 'Resin Floral Keepsake / Preserved Flowers', range: '₹600 – ₹1,400' },
                          { name: 'Resin Art Round Coaster Set (4 pcs)',        range: '₹400 – ₹700' },
                          { name: 'Resin Serving Tray (Large)',                 range: '₹900 – ₹1,800' },
                          { name: 'Personalized Name Frame (A4)',               range: '₹450 – ₹900' },
                          { name: 'Personalized Gift Box / Hamper',             range: '₹700 – ₹1,500' },
                          { name: 'Calligraphy Wall Art (A3)',                  range: '₹500 – ₹1,000' },
                          { name: 'Custom Resin Keychain / Magnet Set',         range: '₹150 – ₹350 / pc' },
                        ]},
                        { title: '🖥️ Digital & Video Creations Catalog', items: [
                          { name: 'Pre-Wedding Video Poster (Animated)',        range: '₹300 – ₹700' },
                          { name: 'Instagram Reel & Story Design (set of 5)',   range: '₹250 – ₹600' },
                          { name: 'Digital Wedding Invitation (Animated)',      range: '₹400 – ₹900' },
                          { name: 'Custom Logo & Brand Identity Design',       range: '₹500 – ₹1,200' },
                          { name: 'Birthday / Anniversary Invitation Card',    range: '₹200 – ₹500' },
                          { name: 'Social Media Post Design (set of 10)',       range: '₹400 – ₹800' },
                        ]},
                      ].map(section => (
                        <div key={section.title} style={S.card}>
                          <h4 style={{ margin: '0 0 14px', color: '#3d2b1a', fontSize: '1.05rem', fontWeight: 800 }}>{section.title}</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {section.items.map((item, i) => (
                              <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 16px', background: i % 2 ? '#faf6f0' : '#fff', borderRadius: '10px' }}>
                                <span style={{ fontSize: '0.9rem', color: '#3d2b1a', fontWeight: 600 }}>{item.name}</span>
                                <span style={{ fontWeight: 800, color: '#b8734a', fontSize: '0.95rem' }}>{item.range}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default StudioAdmin;
