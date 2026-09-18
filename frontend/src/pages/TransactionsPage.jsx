import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import apiService from '../services/apiService.js';
import SectionTitle from '../components/SectionTitle.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const escapeCsv = (value) => {
  const text = String(value ?? '');
  const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
};

const TransactionsPage = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({ search: '', type: '', category: '', from: '', to: '', sort: 'newest' });
  const [searchInput, setSearchInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await apiService.get(`/transactions?${params}`);
      setTransactions(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, [filters]);
  useEffect(() => {
    const timer = setTimeout(() => setFilters((current) => ({ ...current, search: searchInput })), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => value && !(key === 'sort' && value === 'newest')).length;
  const resetFilters = () => {
    setSearchInput('');
    setFilters({ search: '', type: '', category: '', from: '', to: '', sort: 'newest' });
  };

  const exportLabel = filters.search || filters.from || filters.to || filters.type || filters.category ? 'filtered' : 'all';
  const handleExportCsv = () => {
    if (!transactions.length) {
      setError('There are no transactions to export with the current filters');
      return;
    }
    const headers = ['Description', 'Category', 'Type', 'Date', 'Amount', 'Payment method'];
    const rows = transactions.map((transaction) => [
      transaction.description || '-',
      transaction.category,
      transaction.type,
      new Date(transaction.date).toISOString().slice(0, 10),
      transaction.amount,
      transaction.paymentMethod || '-',
    ]);
    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `smartspend-transactions-${exportLabel}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    if (!transactions.length) {
      setError('There are no transactions to export with the current filters');
      return;
    }
    const documentPdf = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = documentPdf.internal.pageSize.getWidth();
    const pageHeight = documentPdf.internal.pageSize.getHeight();
    let y = 48;
    const drawHeader = () => {
      documentPdf.setFont('helvetica', 'bold');
      documentPdf.setFontSize(18);
      documentPdf.text('SmartSpend Transactions', 40, y);
      y += 20;
      documentPdf.setFont('helvetica', 'normal');
      documentPdf.setFontSize(9);
      documentPdf.setTextColor(100, 116, 139);
      const filterText = `Export: ${exportLabel} | ${transactions.length} transaction${transactions.length === 1 ? '' : 's'}${filters.from ? ` | From ${filters.from}` : ''}${filters.to ? ` | To ${filters.to}` : ''}`;
      documentPdf.text(filterText, 40, y);
      y += 24;
      documentPdf.setDrawColor(203, 213, 225);
      documentPdf.line(40, y, pageWidth - 40, y);
      y += 18;
      documentPdf.setTextColor(15, 23, 42);
    };
    const drawFooter = () => {
      documentPdf.setFontSize(8);
      documentPdf.setTextColor(100, 116, 139);
      documentPdf.text(`Generated ${new Date().toLocaleString()}`, 40, pageHeight - 28);
      documentPdf.text(`Page ${documentPdf.getNumberOfPages()}`, pageWidth - 75, pageHeight - 28);
    };

    drawHeader();
    documentPdf.setFontSize(9);
    transactions.forEach((transaction, index) => {
      const description = documentPdf.splitTextToSize(transaction.description || '-', 190);
      const rowHeight = Math.max(28, description.length * 11 + 12);
      if (y + rowHeight > pageHeight - 48) {
        drawFooter();
        documentPdf.addPage();
        y = 48;
        drawHeader();
      }
      if (index % 2 === 0) {
        documentPdf.setFillColor(248, 250, 252);
        documentPdf.rect(40, y - 12, pageWidth - 80, rowHeight, 'F');
      }
      documentPdf.setFont('helvetica', 'normal');
      documentPdf.text(description, 48, y);
      documentPdf.text(String(transaction.category), 245, y);
      documentPdf.text(String(transaction.type), 335, y);
      documentPdf.text(new Date(transaction.date).toLocaleDateString(), 405, y);
      documentPdf.text(`Rs. ${Number(transaction.amount).toLocaleString()}`, 490, y);
      y += rowHeight;
    });
    drawFooter();
    documentPdf.save(`smartspend-transactions-${exportLabel}.pdf`);
  };

  const handleEdit = (tx) => {
    navigate(`/dashboard/add-expense?edit=${tx._id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    await apiService.delete(`/transactions/${id}`);
    fetchTransactions();
  };

  return (
    <div>
      <div className="page-body expense-page">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="card card-spaced filter-panel">
          <div className="filter-header">
            <div>
              <SectionTitle title="Search and Filters" />
              <p className="filter-copy">Search descriptions, filter by category or type, and sort results instantly.</p>
            </div>
            <div className="filter-actions">
              <button type="button" className="btn btn-export btn-small" onClick={handleExportCsv} disabled={loading}>Export CSV</button>
              <button type="button" className="btn btn-export btn-small" onClick={handleExportPdf} disabled={loading}>Export PDF</button>
              <button type="button" className="btn btn-secondary btn-small" onClick={resetFilters} disabled={!activeFilterCount}>Clear filters{activeFilterCount ? ` (${activeFilterCount})` : ''}</button>
            </div>
          </div>

          <div className="filter-grid">
            <div className="filter-field filter-search-field">
              <label htmlFor="transaction-search">Search transactions</label>
              <input id="transaction-search" type="search" placeholder="Description or category" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
            </div>
            <div className="filter-field">
              <label htmlFor="transaction-type">Type</label>
              <select id="transaction-type" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
              <option value="">All types</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
              </select>
            </div>
            <div className="filter-field">
              <label htmlFor="transaction-category">Category</label>
              <select id="transaction-category" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
              <option value="">All categories</option>
              {['Food','Transport','Shopping','Education','Bills','Healthcare','Entertainment','Travel','Rent','Subscriptions','Other'].map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
              </select>
            </div>
          </div>
          <div className="filter-grid filter-grid-gap">
            <div className="filter-field">
              <label htmlFor="transaction-from">From date</label>
              <input id="transaction-from" type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
            </div>
            <div className="filter-field">
              <label htmlFor="transaction-to">To date</label>
              <input id="transaction-to" type="date" min={filters.from || undefined} value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
            </div>
            <div className="filter-field">
              <label htmlFor="transaction-sort">Sort by</label>
              <select id="transaction-sort" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest">Highest amount</option>
              <option value="lowest">Lowest amount</option>
              </select>
            </div>
          </div>
          <div className="filter-result-row"><span>{loading ? 'Updating results...' : `${transactions.length} transaction${transactions.length === 1 ? '' : 's'} found`}</span>{activeFilterCount > 0 && <strong>{activeFilterCount} active filter{activeFilterCount === 1 ? '' : 's'}</strong>}</div>
        </div>

        <div className="card table-card card-spaced">
          <SectionTitle title="Transactions" />
          {loading ? <LoadingSpinner /> : (
            <table className="table">
              <thead>
                <tr>
                    <th>S.No.</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr><td colSpan="7" className="empty-table-state">No transactions match these filters. Try clearing a filter or broadening the date range.</td></tr>
                ) : transactions.map((tx, index) => (
                  <tr key={tx._id}>
                    <td>{index + 1}</td>
                    <td>{tx.description || '-'}</td>
                    <td>{tx.category}</td>
                    <td>{tx.type}</td>
                    <td>{new Date(tx.date).toLocaleDateString()}</td>
                    <td className={tx.type === 'Income' ? 'status-positive' : 'status-negative'}>
                      {tx.type === 'Income' ? '+' : '-'}₹{tx.amount}
                    </td>
                    <td>
                      <button type="button" className="btn btn-secondary btn-split" onClick={() => handleEdit(tx)}>Edit</button>
                      <button type="button" className="btn btn-danger" onClick={() => handleDelete(tx._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
