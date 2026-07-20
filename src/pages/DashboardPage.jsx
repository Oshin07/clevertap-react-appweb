import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  isCleverTapInitialized,
  pushEvent,
  pushProfile,
  pushChargedEvent,
  requestPushPermission,
  getCleverTapId
} from '../services/clevertap';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [log, setLog] = useState([]);
  const [ctId, setCtId] = useState(null);
  const ctOn = isCleverTapInitialized();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const record = (label, fn) => {
    const timestamp = new Date().toLocaleTimeString();
    let status = 'sent';
    try {
      const ok = fn();
      if (ok === false) status = 'error';
    } catch (e) {
      status = 'error';
    }
    setLog((prev) => [{ label, timestamp, status }, ...prev].slice(0, 30));
  };

  const actions = [
    {
      label: 'Track "Product Viewed"',
      run: () =>
        record('event.push → Product Viewed', () =>
          pushEvent('Product Viewed', { Category: 'Shoes', Price: 2499, Currency: 'INR' })
        )
    },
    {
      label: 'Track "Added to Cart"',
      run: () =>
        record('event.push → Added to Cart', () =>
          pushEvent('Added to Cart', { Item: 'Trail Runner', Qty: 1 })
        )
    },
    {
      label: 'Update profile (preferences)',
      run: () =>
        record('profile.push → preferences', () =>
          pushProfile({ 'Preferred Category': 'Outdoor', 'Loyalty Tier': 'Gold' })
        )
    },
    {
      label: 'Record a charge (Charged event)',
      run: () =>
        record('event.push → Charged', () =>
          pushChargedEvent(
            { Amount: 2499, 'Payment Mode': 'UPI', 'Charged ID': `ORD-${Date.now()}` },
            [{ Category: 'Shoes', Item: 'Trail Runner', Qty: 1, Price: 2499 }]
          )
        )
    },
    {
      label: 'Request push permission',
      run: () => record('notifications.push → permission prompt', () => requestPushPermission())
    },
    {
      label: 'Fetch CleverTap ID',
      run: () =>
        record('getCleverTapID()', () => {
          getCleverTapId((id) => setCtId(id));
          return true;
        })
    }
  ];

  return (
    <div className="dashboard-screen">
      <header className="dash-header">
        <div>
          <div className="eyebrow">signalhouse / dashboard</div>
          <h1 className="dash-title">Hey, {user?.name}</h1>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Log out</button>
      </header>

      <div className="status-row">
        <span className={`dot${ctOn ? ' on' : ''}`}></span>
        CleverTap session: <strong>{ctOn ? 'initialized' : 'inactive'}</strong>
        {ctId && <span className="ct-id">· ID {ctId}</span>}
      </div>

      <div className="grid">
        <section className="panel">
          <h2 className="panel-title">Fire an event</h2>
          <p className="panel-sub">
            Each button below calls a real CleverTap Web SDK method. Check your browser network
            tab or CleverTap dashboard to see it land.
          </p>
          <div className="action-list">
            {actions.map((a) => (
              <button key={a.label} className="action-btn" onClick={a.run}>
                {a.label}
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title">Activity stream</h2>
          <p className="panel-sub">Local log of calls made from this tab, most recent first.</p>
          {log.length === 0 ? (
            <div className="empty">Nothing fired yet — try an action on the left.</div>
          ) : (
            <ul className="log">
              {log.map((entry, i) => (
                <li key={i} className="log-row">
                  <span className={`log-dot${entry.status === 'error' ? ' error' : ''}`}></span>
                  <span className="log-label">{entry.label}</span>
                  <span className="log-time">{entry.timestamp}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
