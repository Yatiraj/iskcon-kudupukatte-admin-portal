import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import * as XLSX from 'xlsx';
import Navbar from '../components/Navbar';

const initialForm = {
  phone: '',
  name: '',
  email: '',
  address: '',
  donor_type: '',
  association_status: '',
};

const donorTypes = ['HNI', 'Regular', 'One-time'];
const associationStatuses = ['Congregation', 'New Devotee', 'Well-wisher'];

const Devotees = () => {
  const [devotees, setDevotees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editPhone, setEditPhone] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, phone: null });
  // Import state
  const [showImport, setShowImport] = useState(false);
  const [importRows, setImportRows] = useState([]);
  const [importError, setImportError] = useState('');
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState('');
  const [importValidation, setImportValidation] = useState([]); // [{row, error}]

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (!error && data) setRole(data.role);
      }
    };
    fetchRole();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const fetchDevotees = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('devotees')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setDevotees(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDevotees();
  }, []);

  // Filter devotees by phone or name
  const filtered = devotees.filter(
    d =>
      d.phone.toLowerCase().includes(search.toLowerCase()) ||
      d.name.toLowerCase().includes(search.toLowerCase())
  );

  // Modal form handlers
  const openModal = (devotee = null) => {
    if (devotee) {
      setForm({ ...devotee });
      setEditMode(true);
      setEditPhone(devotee.phone);
    } else {
      setForm(initialForm);
      setEditMode(false);
      setEditPhone(null);
    }
    setFormError('');
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setFormError('');
    setEditMode(false);
    setEditPhone(null);
  };
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async e => {
    e.preventDefault();
    setFormError('');
    if (!form.phone.trim() || !form.name.trim()) {
      setFormError('Phone and Name are required.');
      return;
    }
    setSubmitting(true);
    if (editMode) {
      // Edit devotee
      const { error } = await supabase
        .from('devotees')
        .update({
          name: form.name.trim(),
          email: form.email.trim() || null,
          address: form.address.trim() || null,
          donor_type: form.donor_type || null,
          association_status: form.association_status || null,
        })
        .eq('phone', editPhone);
      setSubmitting(false);
      if (error) {
        setFormError(error.message);
      } else {
        closeModal();
        fetchDevotees();
      }
    } else {
      // Add devotee
      const { error } = await supabase.from('devotees').insert([
        {
          phone: form.phone.trim(),
          name: form.name.trim(),
          email: form.email.trim() || null,
          address: form.address.trim() || null,
          donor_type: form.donor_type || null,
          association_status: form.association_status || null,
        },
      ]);
      setSubmitting(false);
      if (error) {
        setFormError(error.message);
      } else {
        closeModal();
        fetchDevotees();
      }
    }
  };

  // Delete devotee
  const handleDelete = async () => {
    if (!deleteConfirm.phone) return;
    setSubmitting(true);
    const { error } = await supabase.from('devotees').delete().eq('phone', deleteConfirm.phone);
    setSubmitting(false);
    setDeleteConfirm({ show: false, phone: null });
    if (!error) fetchDevotees();
  };

  // Import handlers
  const openImport = () => {
    setShowImport(true);
    setImportRows([]);
    setImportError('');
    setImportSuccess('');
    setImportValidation([]);
  };
  const closeImport = () => {
    setShowImport(false);
    setImportRows([]);
    setImportError('');
    setImportSuccess('');
    setImportValidation([]);
  };
  const handleFile = async e => {
    setImportError('');
    setImportSuccess('');
    setImportValidation([]);
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async evt => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      // Validate required fields
      const validRows = rows.filter(row => row.phone && row.name);
      if (validRows.length === 0) {
        setImportError('No valid rows found. Each row must have at least phone and name.');
        setImportRows([]);
        setImportValidation([]);
        return;
      }
      // Check for duplicates within the file
      const phoneCounts = {};
      validRows.forEach(row => {
        const phone = String(row.phone).trim();
        phoneCounts[phone] = (phoneCounts[phone] || 0) + 1;
      });
      // Fetch all existing phone numbers from DB
      const { data: dbRows, error: dbError } = await supabase
        .from('devotees')
        .select('phone');
      const dbPhones = dbRows ? dbRows.map(d => String(d.phone).trim()) : [];
      // Validate each row
      const validation = validRows.map((row, idx) => {
        const phone = String(row.phone).trim();
        let error = '';
        if (phoneCounts[phone] > 1) {
          error = 'Duplicate phone in file';
        } else if (dbPhones.includes(phone)) {
          error = 'Phone already exists in database';
        }
        return { row, error, idx };
      });
      setImportRows(validRows);
      setImportValidation(validation);
    };
    reader.readAsArrayBuffer(file);
  };
  const handleImport = async () => {
    setImporting(true);
    setImportError('');
    setImportSuccess('');
    // Prepare rows for insert
    const rows = importValidation.filter(v => !v.error).map(v => ({
      phone: String(v.row.phone).trim(),
      name: String(v.row.name).trim(),
      email: v.row.email ? String(v.row.email).trim() : null,
      address: v.row.address ? String(v.row.address).trim() : null,
      donor_type: v.row.donor_type || null,
      association_status: v.row.association_status || null,
    }));
    const { error } = await supabase.from('devotees').insert(rows);
    setImporting(false);
    if (error) {
      setImportError(error.message);
    } else {
      setImportSuccess(`Imported ${rows.length} devotees successfully!`);
      setImportRows([]);
      setImportValidation([]);
      fetchDevotees();
    }
  };

  const hasImportErrors = importValidation.some(v => v.error);

  // Download Excel handler
  const handleDownloadExcel = () => {
    // Prepare data for export
    const exportRows = devotees.map(({ phone, name, email, address, donor_type, association_status, created_at }) => ({
      phone,
      name,
      email,
      address,
      donor_type,
      association_status,
      created_at,
    }));
    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Devotees');
    XLSX.writeFile(wb, 'devotees.xlsx');
  };

  return (
    <>
      <Navbar role={role} onLogout={handleLogout} />
      <div className="p-8">
      <h2 className="text-xl font-bold mb-4">Devotee Management</h2>
      <input
        type="text"
        placeholder="Search by phone or name"
        className="mb-4 p-2 border rounded w-full max-w-md"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {/* Add Devotee and Import buttons for admin only */}
      {role === 'admin' && (
        <div className="mb-4 flex gap-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => openModal()}
          >
            Add Devotee
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={openImport}
          >
            Import from Excel
          </button>
          <button
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            onClick={handleDownloadExcel}
          >
            Download Excel
          </button>
        </div>
      )}
      {/* Modal Popup for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={closeModal}
            >
              &times;
            </button>
            <h3 className="text-lg font-bold mb-4">{editMode ? 'Edit Devotee' : 'Add Devotee'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-medium">Phone<span className="text-red-500">*</span></label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="border rounded p-2 w-full"
                  required
                  disabled={editMode}
                />
              </div>
              <div>
                <label className="block font-medium">Name<span className="text-red-500">*</span></label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="border rounded p-2 w-full"
                  required
                />
              </div>
              <div>
                <label className="block font-medium">Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="border rounded p-2 w-full"
                  type="email"
                />
              </div>
              <div>
                <label className="block font-medium">Address</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="border rounded p-2 w-full"
                />
              </div>
              <div>
                <label className="block font-medium">Donor Type</label>
                <select
                  name="donor_type"
                  value={form.donor_type}
                  onChange={handleChange}
                  className="border rounded p-2 w-full"
                >
                  <option value="">Select</option>
                  {donorTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium">Association Status</label>
                <select
                  name="association_status"
                  value={form.association_status}
                  onChange={handleChange}
                  className="border rounded p-2 w-full"
                >
                  <option value="">Select</option>
                  {associationStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              {formError && <div className="text-red-600">{formError}</div>}
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                disabled={submitting}
              >
                {submitting ? (editMode ? 'Saving...' : 'Adding...') : (editMode ? 'Save Changes' : 'Add Devotee')}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={closeImport}
            >
              &times;
            </button>
            <h3 className="text-lg font-bold mb-4">Import Devotees from Excel/CSV</h3>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFile}
              className="mb-4"
            />
            {importError && <div className="text-red-600 mb-2">{importError}</div>}
            {importSuccess && <div className="text-green-600 mb-2">{importSuccess}</div>}
            {importRows.length > 0 && (
              <>
                <div className="mb-2">Preview ({importRows.length} rows):</div>
                <div className="max-h-40 overflow-y-auto border mb-2">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr>
                        <th className="px-2 py-1 border">Phone</th>
                        <th className="px-2 py-1 border">Name</th>
                        <th className="px-2 py-1 border">Email</th>
                        <th className="px-2 py-1 border">Address</th>
                        <th className="px-2 py-1 border">Donor Type</th>
                        <th className="px-2 py-1 border">Association Status</th>
                        <th className="px-2 py-1 border">Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importValidation.map((v, i) => (
                        <tr key={i}>
                          <td className="px-2 py-1 border">{v.row.phone}</td>
                          <td className="px-2 py-1 border">{v.row.name}</td>
                          <td className="px-2 py-1 border">{v.row.email}</td>
                          <td className="px-2 py-1 border">{v.row.address}</td>
                          <td className="px-2 py-1 border">{v.row.donor_type}</td>
                          <td className="px-2 py-1 border">{v.row.association_status}</td>
                          <td className="px-2 py-1 border text-red-600">{v.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  onClick={handleImport}
                  disabled={importing || hasImportErrors}
                >
                  {importing ? 'Importing...' : 'Import All'}
                </button>
                {hasImportErrors && (
                  <div className="text-red-600 mt-2">Fix all errors before importing.</div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-sm relative">
            <h3 className="text-lg font-bold mb-4">Delete Devotee</h3>
            <p>Are you sure you want to delete this devotee?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setDeleteConfirm({ show: false, phone: null })}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={handleDelete}
                disabled={submitting}
              >
                {submitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Phone</th>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Address</th>
                <th className="px-4 py-2 border">Donor Type</th>
                <th className="px-4 py-2 border">Association Status</th>
                <th className="px-4 py-2 border">Created At</th>
                {role === 'admin' && <th className="px-4 py-2 border">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(devotee => (
                <tr key={devotee.phone}>
                  <td className="px-4 py-2 border">{devotee.phone}</td>
                  <td className="px-4 py-2 border">{devotee.name}</td>
                  <td className="px-4 py-2 border">{devotee.email}</td>
                  <td className="px-4 py-2 border">{devotee.address}</td>
                  <td className="px-4 py-2 border">{devotee.donor_type}</td>
                  <td className="px-4 py-2 border">{devotee.association_status}</td>
                  <td className="px-4 py-2 border">{new Date(devotee.created_at).toLocaleString()}</td>
                  {role === 'admin' && (
                    <td className="px-4 py-2 border flex gap-2">
                      <button
                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                        onClick={() => openModal(devotee)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        onClick={() => setDeleteConfirm({ show: true, phone: devotee.phone })}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={role === 'admin' ? 8 : 7} className="text-center py-4">No devotees found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </>
  );
};

export default Devotees;
