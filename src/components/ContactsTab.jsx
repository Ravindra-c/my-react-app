import React, { useState, useEffect, useRef } from 'react';
import { Users, UserPlus, Mail, Phone, Trash2, Loader2, Search, Upload, ArrowUpDown } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function ContactsTab() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Personal');
  const [search, setSearch] = useState('');
  const [sortAscending, setSortAscending] = useState(true);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('name', { ascending: sortAscending });

    if (!error) setContacts(data || []);
    setLoading(false);
  }

  // Toggle sorting order
  function toggleSort() {
    const nextSort = !sortAscending;
    setSortAscending(nextSort);
    const sorted = [...contacts].sort((a, b) => {
      return nextSort
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });
    setContacts(sorted);
  }

  async function addContact(e) {
    e.preventDefault();
    if (!name.trim()) return;

    const { data, error } = await supabase
      .from('contacts')
      .insert([{ name: name.trim(), email: email.trim(), phone: phone.trim(), category }])
      .select();

    if (!error && data) {
      setContacts([...contacts, data[0]]);
      setName('');
      setEmail('');
      setPhone('');
      setShowAddForm(false);
    }
  }

  async function deleteContact(id) {
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (!error) {
      setContacts(contacts.filter((c) => c.id !== id));
    }
  }

  // Handle CSV File Upload & Parsing with Strict Filtering
  function handleCSVUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n');
      if (lines.length < 2) {
        setImporting(false);
        return;
      }

      // Parse Headers
      const headers = lines[0].split(',').map((h) => h.replace(/"/g, '').trim().toLowerCase());
      
      const nameIndex = headers.findIndex((h) => h.includes('name'));
      const emailIndex = headers.findIndex((h) => h.includes('email') || h.includes('e-mail'));
      const phoneIndex = headers.findIndex((h) => h.includes('phone') || h.includes('mobile'));

      const newContactsToInsert = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        // Match CSV line fields (handling quoted strings)
        const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
        const cleanRow = row.map((val) => val.replace(/^"|"$/g, '').trim());

        const contactName = nameIndex !== -1 && cleanRow[nameIndex] ? cleanRow[nameIndex].trim() : '';
        const contactEmail = emailIndex !== -1 && cleanRow[emailIndex] ? cleanRow[emailIndex].trim() : '';
        const contactPhone = phoneIndex !== -1 && cleanRow[phoneIndex] ? cleanRow[phoneIndex].trim() : '';

        // Strict Filter: Must have a valid non-empty Name AND at least an Email or Phone number
        const hasValidName = contactName.length > 0 && contactName.toLowerCase() !== 'unnamed';
        const hasContactInfo = contactEmail.length > 0 || contactPhone.length > 0;

        if (hasValidName && hasContactInfo) {
          newContactsToInsert.push({
            name: contactName,
            email: contactEmail,
            phone: contactPhone,
            category: 'Google Import',
          });
        }
      }

      if (newContactsToInsert.length > 0) {
        const { data, error } = await supabase
          .from('contacts')
          .insert(newContactsToInsert)
          .select();

        if (!error && data) {
          fetchContacts();
        }
      }

      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsText(file);
  }

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.phone && c.phone.includes(search))
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Users className="w-7 h-7 text-indigo-500" />
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Contacts Directory</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage your network and contact list</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Sort Button */}
          <button
            onClick={toggleSort}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm"
            title="Sort Contacts"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
            Sort ({sortAscending ? 'A-Z' : 'Z-A'})
          </button>

          {/* Hidden File Input */}
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleCSVUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            {importing ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            ) : (
              <Upload className="w-4 h-4 text-indigo-400" />
            )}
            {importing ? 'Importing...' : 'Import CSV'}
          </button>

          {/* Add Contact Button */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
          >
            <UserPlus className="w-4 h-4" />
            {showAddForm ? 'Cancel' : 'Add Contact'}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search contacts by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 placeholder-slate-500"
        />
      </div>

      {/* Manual Add Contact Form */}
      {showAddForm && (
        <form onSubmit={addContact} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">New Contact Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Full Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="Personal">Personal</option>
              <option value="Work">Work</option>
              <option value="Family">Family</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Save Contact
          </button>
        </form>
      )}

      {/* Contacts Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mr-2" />
          <span>Loading contacts...</span>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
          <p className="text-sm text-slate-400">No contacts found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-start justify-between gap-3 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Full name display with text-wrap */}
                  <h3 className="font-semibold text-slate-100 text-sm whitespace-normal break-words">
                    {contact.name}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium flex-shrink-0">
                    {contact.category}
                  </span>
                </div>
                {contact.email && (
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 break-all">
                    <Mail className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    {contact.email}
                  </p>
                )}
                {contact.phone && (
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    {contact.phone}
                  </p>
                )}
              </div>

              <button
                onClick={() => deleteContact(contact.id)}
                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex-shrink-0"
                title="Delete Contact"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}