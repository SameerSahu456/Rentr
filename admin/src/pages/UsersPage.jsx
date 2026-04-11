import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Plus, Shield, Search } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } },
};

const ROLES = ['admin', 'manager', 'agent', 'finance', 'support', 'viewer'];

const ROLE_DESCRIPTIONS = {
  admin: 'Full system access. Can manage users, settings, and all platform data.',
  manager: 'Oversee operations, approve orders, manage assets and contracts.',
  agent: 'Handle day-to-day tasks: create orders, manage deliveries and returns.',
  finance: 'Access invoices, payments, reconciliation and financial reports.',
  support: 'Manage support tickets, customer queries and escalations.',
  viewer: 'Read-only access to dashboards and reports. Cannot modify data.',
};

const ROLE_COLORS = {
  admin: 'bg-red-500/10 text-red-400 border-red-500/15',
  manager: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/15',
  agent: 'bg-blue-500/10 text-blue-400 border-blue-500/15',
  finance: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15',
  support: 'bg-amber-500/10 text-amber-400 border-amber-500/15',
  viewer: 'bg-foreground/[0.05] text-foreground/40 border-foreground/[0.08]',
};

const TABS = ['all', ...ROLES];

const MOCK_USERS = [
  { id: 1, name: 'Arjun Mehta', email: 'arjun@rentr.in', role: 'admin', status: 'active', last_login: '2026-04-11T09:30:00Z' },
  { id: 2, name: 'Priya Sharma', email: 'priya@rentr.in', role: 'manager', status: 'active', last_login: '2026-04-10T14:22:00Z' },
  { id: 3, name: 'Rahul Verma', email: 'rahul@rentr.in', role: 'agent', status: 'active', last_login: '2026-04-11T08:15:00Z' },
  { id: 4, name: 'Sneha Iyer', email: 'sneha@rentr.in', role: 'finance', status: 'active', last_login: '2026-04-09T17:45:00Z' },
  { id: 5, name: 'Karan Patel', email: 'karan@rentr.in', role: 'support', status: 'active', last_login: '2026-04-10T11:00:00Z' },
  { id: 6, name: 'Ananya Desai', email: 'ananya@rentr.in', role: 'viewer', status: 'inactive', last_login: '2026-03-28T10:00:00Z' },
  { id: 7, name: 'Vikram Singh', email: 'vikram@rentr.in', role: 'agent', status: 'active', last_login: '2026-04-11T07:50:00Z' },
  { id: 8, name: 'Meera Nair', email: 'meera@rentr.in', role: 'manager', status: 'inactive', last_login: '2026-03-15T16:30:00Z' },
];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'agent', password: '' });
  const [saving, setSaving] = useState(false);
  const [editRole, setEditRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.get('/auth/users');
      setUsers(data.items || data || []);
    } catch {
      setUsers(MOCK_USERS);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!formData.name || !formData.email || !formData.password) return;
    setSaving(true);
    try {
      await api.post('/auth/users', formData);
      await fetchUsers();
    } catch {
      // Fallback: add to local state
      setUsers((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...formData,
          status: 'active',
          last_login: null,
        },
      ]);
    } finally {
      setSaving(false);
      setShowAddModal(false);
      setFormData({ name: '', email: '', role: 'agent', password: '' });
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || editRole === selectedUser.role) return;
    setSaving(true);
    try {
      await api.patch(`/auth/users/${selectedUser.id}`, { role: editRole });
      await fetchUsers();
    } catch {
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, role: editRole } : u))
      );
    } finally {
      setSaving(false);
      setShowDetailModal(false);
      setSelectedUser(null);
    }
  };

  const formatDate = (d) => {
    if (!d) return '--';
    const date = new Date(d);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  // Filtering
  const filtered = users.filter((u) => {
    const matchesTab = activeTab === 'all' || u.role === activeTab;
    const matchesSearch =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const inactiveCount = users.filter((u) => u.status === 'inactive').length;

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (v, row) => (
        <div>
          <div className="font-medium text-foreground">{v || '--'}</div>
          <div className="text-[10px] text-foreground/20 mt-0.5">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (v) => <span className="text-foreground/40">{v}</span>,
    },
    {
      key: 'role',
      label: 'Role',
      render: (v) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${ROLE_COLORS[v] || ROLE_COLORS.viewer}`}
        >
          <Shield className="w-2.5 h-2.5" />
          {v}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <StatusBadge status={v} />,
    },
    {
      key: 'last_login',
      label: 'Last Login',
      render: (v) => (
        <span className="text-foreground/30 text-xs">{formatDate(v)}</span>
      ),
    },
  ];

  const inputClasses =
    'w-full bg-foreground/[0.02] border border-foreground/[0.08] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-rentr-primary/50 transition-colors';

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <motion.div variants={item} className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-rentr-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">
              Access Control
            </span>
          </motion.div>
          <motion.h1
            variants={item}
            className="text-3xl sm:text-4xl lg:text-6xl font-brand font-black tracking-tighter text-foreground uppercase"
          >
            Users
          </motion.h1>
        </div>

        <motion.div variants={item} className="flex items-center flex-wrap gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-rentr-primary transition-colors" />
            <input
              type="text"
              placeholder="SEARCH USERS"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-full py-3 pl-12 pr-6 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all w-full sm:w-72 placeholder:text-foreground/10"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            Add User
          </button>
        </motion.div>
      </div>

      {/* Stats */}
      <motion.div
        variants={item}
        className="grid grid-cols-2 lg:grid-cols-4 border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] overflow-hidden"
      >
        {[
          { label: 'Total Users', value: totalUsers, icon: Users },
          { label: 'Active', value: activeUsers, icon: Users },
          { label: 'Admins', value: adminCount, icon: Shield },
          { label: 'Inactive', value: inactiveCount, icon: Users },
        ].map((s, i) => (
          <div
            key={s.label}
            className={`p-4 sm:p-6 lg:p-8 flex flex-col gap-3 sm:gap-4 lg:gap-6 group hover:bg-foreground/[0.02] transition-colors duration-700 ${
              i < 3 ? 'border-r border-foreground/[0.05]' : ''
            }`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/20 group-hover:text-foreground/40 transition-colors">
                {s.label}
              </span>
              <s.icon className="w-4 h-4 text-foreground/10 group-hover:text-rentr-primary transition-colors" />
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-brand font-black tracking-tighter text-foreground group-hover:text-rentr-primary transition-colors duration-500">
              {s.value}
            </h3>
          </div>
        ))}
      </motion.div>

      {/* Role Tabs */}
      <motion.div variants={item} className="flex items-center gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-foreground text-background'
                : 'text-foreground/30 hover:text-foreground/60 hover:bg-foreground/[0.03]'
            }`}
          >
            {tab}
            {tab !== 'all' && (
              <span className="ml-1.5 text-[9px] opacity-50">
                {users.filter((u) => u.role === tab).length}
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Table */}
      <div className="border-t border-foreground/[0.05]">
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          onRowClick={(row) => {
            setSelectedUser(row);
            setEditRole(row.role);
            setShowDetailModal(true);
          }}
          emptyMessage="No users found."
          emptyIcon={<Users size={40} className="text-foreground/10" />}
          exportFilename="rentr-users"
        />
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setFormData({ name: '', email: '', role: 'agent', password: '' });
        }}
        title="Add New User"
        footer={
          <>
            <button
              onClick={() => {
                setShowAddModal(false);
                setFormData({ name: '', email: '', role: 'agent', password: '' });
              }}
              className="px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddUser}
              disabled={saving || !formData.name || !formData.email || !formData.password}
              className="px-6 py-2.5 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating...' : 'Create User'}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Arjun Mehta"
              className={inputClasses}
            />
          </div>
          <div>
            <label className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. arjun@rentr.in"
              className={inputClasses}
            />
          </div>
          <div>
            <label className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className={inputClasses}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
            {formData.role && (
              <p className="mt-2 text-[10px] text-foreground/30 leading-relaxed">
                {ROLE_DESCRIPTIONS[formData.role]}
              </p>
            )}
          </div>
          <div>
            <label className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Min 8 characters"
              className={inputClasses}
            />
          </div>
        </div>
      </Modal>

      {/* User Detail / Edit Role Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedUser(null);
        }}
        title="User Details"
        footer={
          <>
            <button
              onClick={() => {
                setShowDetailModal(false);
                setSelectedUser(null);
              }}
              className="px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 hover:text-foreground transition-colors"
            >
              Close
            </button>
            {editRole !== selectedUser?.role && (
              <button
                onClick={handleUpdateRole}
                disabled={saving}
                className="px-6 py-2.5 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-opacity disabled:opacity-30"
              >
                {saving ? 'Saving...' : 'Update Role'}
              </button>
            )}
          </>
        }
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* User info */}
            <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-foreground/[0.05] flex items-center justify-center text-foreground/30 text-lg font-brand font-bold uppercase">
                  {selectedUser.name?.charAt(0) || '?'}
                </div>
                <div>
                  <div className="font-medium text-foreground">{selectedUser.name}</div>
                  <div className="text-xs text-foreground/30">{selectedUser.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-foreground/[0.05]">
                <StatusBadge status={selectedUser.status} />
                <span className="text-[10px] text-foreground/20">
                  Last login: {formatDate(selectedUser.last_login)}
                </span>
              </div>
            </div>

            {/* Role editor */}
            <div>
              <label className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block mb-3">
                Assigned Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setEditRole(r)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      editRole === r
                        ? 'border-rentr-primary/50 bg-rentr-primary/5'
                        : 'border-foreground/[0.05] hover:border-foreground/[0.12] bg-foreground/[0.02]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className={`w-3 h-3 ${editRole === r ? 'text-rentr-primary' : 'text-foreground/20'}`} />
                      <span className={`text-xs font-bold uppercase tracking-wider ${editRole === r ? 'text-rentr-primary' : 'text-foreground/50'}`}>
                        {r}
                      </span>
                    </div>
                    <p className="text-[9px] text-foreground/25 leading-relaxed">
                      {ROLE_DESCRIPTIONS[r]}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
