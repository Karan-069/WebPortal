import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageContext } from "../../store/features/uiSlice";
import DynamicTable from "../../components/ui/DynamicTable";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal, Edit, Clock, CheckCircle } from "lucide-react";

export default function TransactionList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(
      setPageContext({
        title: "Bills & Transactions",
        actions: [
          {
            label: "+ Create Bill",
            onClick: () => navigate("/transactions/new"),
          },
        ],
      }),
    );
  }, [dispatch, navigate]);

  const {
    data: bills,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["bills"],
    queryFn: async () => {
      const res = await api.get("/bills");
      return res.data?.data || [];
    },
  });

  const columns = [
    { header: "Transaction ID", accessor: "transactionId" },
    { header: "Vendor", accessor: "vendor.description" },
    {
      header: "Total Amount",
      render: (row) => (
        <span className="font-medium">
          ${row.billTotalAmount?.$numberDecimal || "0.00"}
        </span>
      ),
      className: "text-right",
    },
    {
      header: "Status",
      accessor: "transactionStatus",
      className: "hidden md:table-cell",
    },
    {
      header: "Status",
      render: (row) => (
        <span
          className={`px-2.5 py-1 text-xs rounded-md font-medium border ${
            row.status === "Approved"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
              : row.status === "Pending"
                ? "bg-amber-50 text-amber-700 border-amber-200/60"
                : "bg-slate-50 text-slate-700 border-slate-200/60"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors focus:outline-none">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[160px] bg-white rounded-md shadow-lg border border-slate-200 p-1 animate-in fade-in zoom-in-95 z-50"
              sideOffset={5}
              align="end"
            >
              <DropdownMenu.Item
                onClick={() => navigate(`/transactions/${row.id}`)}
                className="flex items-center text-sm px-2 py-1.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-sm cursor-pointer outline-none transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" /> Edit
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="h-px bg-slate-200 my-1" />
              <DropdownMenu.Item className="flex items-center text-sm px-2 py-1.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-sm cursor-pointer outline-none transition-colors">
                <Clock className="w-4 h-4 mr-2 text-sky-500" /> History
              </DropdownMenu.Item>
              <DropdownMenu.Item className="flex items-center text-sm px-2 py-1.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-sm cursor-pointer outline-none transition-colors">
                <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />{" "}
                Approvals
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      ),
    },
  ];

  if (error)
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded">
        Error loading transactions.
      </div>
    );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <DynamicTable data={bills} columns={columns} isLoading={isLoading} />
    </div>
  );
}
