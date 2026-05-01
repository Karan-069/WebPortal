import React, { useState, useEffect } from "react";
import { useFeatures } from "../../hooks/useFeatures";
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
import { useDispatch, useSelector } from "react-redux";
import { setLoading as setGlobalLoading } from "../../store/features/uiSlice";
import Button from "../../components/ui/Button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/Table";

export default function VendorInviteManager() {
  const dispatch = useDispatch();
  const { isEnabled } = useFeatures();
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
        `/vendor-invites?page=${pageNum}&limit=${pagination.limit}&search=${search}`,
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
    <div className="w-full space-y-8">
      {/* Premium Subtle Plate Header */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-sky-500/20 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/80 backdrop-blur-xl border border-slate-200/60 p-6 rounded-2xl shadow-sm overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600" />

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex w-12 h-12 items-center justify-center bg-indigo-50 rounded-xl text-indigo-600 shadow-inner">
              <Mail size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Vendor Invitations
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Onboard new partners securely via{" "}
                <span className="text-indigo-600 font-bold">
                  Encrypted Registration Links
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isEnabled("WF_VENDOR") && (
              <Button
                onClick={() => setShowModal(true)}
                leftIcon={<Plus className="w-4 h-4" />}
                className="px-6 shadow-lg shadow-indigo-100"
              >
                Invite New Vendor
              </Button>
            )}
          </div>
        </div>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsRefreshing(true);
                fetchInvites(page);
              }}
              className={`p-2 h-9 w-9 shadow-none ${isRefreshing ? "animate-spin" : ""}`}
            >
              <RefreshCw className="w-4 h-4 text-slate-400" />
            </Button>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <p className="text-xs text-slate-500 font-medium">
              Total Records:{" "}
              <span className="text-slate-900 font-bold">
                {pagination.totalDocs}
              </span>
            </p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>PAN No</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires / Registered At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan="5" className="text-center text-slate-400">
                  Loading invitations...
                </TableCell>
              </TableRow>
            ) : invites.length === 0 ? (
              <TableRow>
                <TableCell colSpan="5" className="text-center text-slate-400">
                  No invitations found.
                </TableCell>
              </TableRow>
            ) : (
              invites.map((invite) => (
                <TableRow key={invite._id} className="group">
                  <TableCell>
                    <div className="font-medium text-slate-900">
                      {invite.companyName}
                    </div>
                    <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3" /> {invite.email}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-slate-600">
                    {invite.panNo}
                  </TableCell>
                  <TableCell>
                    {invite.status === "Registered" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5" /> Registered
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                        <Clock className="w-3.5 h-3.5" /> {invite.status}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {new Date(invite.expiresAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {invite.status !== "Registered" && (
                      <Button
                        variant="soft"
                        size="xs"
                        onClick={() => handleReinitiate(invite._id)}
                        leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                        className="ml-auto opacity-0 group-hover:opacity-100"
                      >
                        Re-send
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

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
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em] mb-1">
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
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em] mb-1">
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
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em] mb-1">
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
                <Button
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-10 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                >
                  Send Invite
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
