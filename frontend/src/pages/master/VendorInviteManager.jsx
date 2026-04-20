import React, { useState, useEffect } from "react";
import {
  Mail,
  Plus,
  Search,
  RefreshCw,
  CheckCircle,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import Pagination from "../../components/ui/Pagination";
import { useDispatch } from "react-redux";
import { setLoading as setGlobalLoading } from "../../store/features/uiSlice";

export default function VendorInviteManager() {
  const dispatch = useDispatch();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [panNo, setPanNo] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalDocs: 0,
    limit: 10,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fetchInvites = async (pageNum = 1) => {
    setLoading(true);
    dispatch(setGlobalLoading(true));
    try {
      const res = await api.get(
        `/vendor-invites?page=${pageNum}&limit=10&search=${search}`,
      );
      const result = res.data.data;
      if (result.docs) {
        setInvites(result.docs);
        setPagination({
          totalPages: result.totalPages || 1,
          totalDocs: result.totalDocs || 0,
          limit: result.limit || 10,
        });
      } else {
        setInvites(Array.isArray(result) ? result : [result]);
      }
      setPage(pageNum);
    } catch (err) {
      toast.error(err.message || "Failed to fetch invites");
    } finally {
      setLoading(false);
      dispatch(setGlobalLoading(false));
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInvites(1);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInvites(1);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!companyName || !email || !panNo)
      return toast.error("Please fill all fields");

    try {
      dispatch(setGlobalLoading(true));
      await api.post("/vendor-invites/initiate", { companyName, email, panNo });
      toast.success("Invitation sent to " + email);
      setShowModal(false);
      setCompanyName("");
      setEmail("");
      setPanNo("");
      fetchInvites(1);
    } catch (err) {
      toast.error(err.message || "Failed to send invite");
    }
  };

  const handleReinitiate = async (id) => {
    try {
      await api.post(`/vendor-invites/re-initiate/${id}`);
      toast.success("Invitation re-initiated and sent.");
      fetchInvites(page);
    } catch (err) {
      toast.error(err.message || "Failed to re-initiate");
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Vendor Invitations
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Manage and send secure registration links to your vendors.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Invite Vendor
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company name, email or pan..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </form>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsRefreshing(true);
                fetchInvites(page);
              }}
              className={`p-2 hover:bg-slate-100 rounded-lg transition-colors ${isRefreshing ? "animate-spin-once" : ""}`}
            >
              <RefreshCw className="w-4 h-4 text-slate-400" />
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <p className="text-xs text-slate-500 font-medium">
              Total Records:{" "}
              <span className="text-slate-900 font-bold">
                {pagination.totalDocs}
              </span>
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 tracking-wider">
                <th className="p-4 uppercase">Company</th>
                <th className="p-4 uppercase">PAN No</th>
                <th className="p-4 uppercase">Status</th>
                <th className="p-4 uppercase">Expires / Registered At</th>
                <th className="p-4 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    Loading invitations...
                  </td>
                </tr>
              ) : invites.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    No invitations found.
                  </td>
                </tr>
              ) : (
                invites.map((invite) => (
                  <tr
                    key={invite._id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="font-medium text-slate-900">
                        {invite.companyName}
                      </div>
                      <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" /> {invite.email}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-600">
                      {invite.panNo}
                    </td>
                    <td className="p-4">
                      {invite.status === "Registered" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" /> Registered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5" /> {invite.status}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(invite.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      {invite.status !== "Registered" && (
                        <button
                          onClick={() => handleReinitiate(invite._id)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-xs px-3 py-1.5 rounded bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center gap-1.5 ml-auto opacity-0 group-hover:opacity-100"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Re-send
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={pagination.totalPages}
          totalDocs={pagination.totalDocs}
          limit={pagination.limit}
          onPageChange={fetchInvites}
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                Invite Vendor
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                They will receive a secure 72-hour registration link.
              </p>
            </div>
            <form onSubmit={handleInvite} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Company Name
                </label>
                <input
                  required
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Acme Logistics Ltd"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Contact Email
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  placeholder="vendor@acme.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  PAN Number
                </label>
                <input
                  required
                  type="text"
                  value={panNo}
                  onChange={(e) => setPanNo(e.target.value.toUpperCase())}
                  maxLength={10}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 font-mono uppercase focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  placeholder="ABCDE1234F"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-[0_0_15px_rgba(79,70,229,0.3)] rounded-lg transition-colors"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
