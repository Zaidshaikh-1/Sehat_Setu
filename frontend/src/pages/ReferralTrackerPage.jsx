import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { api } from "../utils/api.js";
import { getSocket } from "../utils/socket.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Share2,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

const COLUMNS = [
  { id: "issued", title: "1. Issued Ticket", subtitle: "Awaiting Departure", color: "border-slate-200 bg-slate-50" },
  { id: "traveling", title: "2. Patient Traveling", subtitle: "En-Route to Facility", color: "border-amber-200 bg-amber-50/30" },
  { id: "arrived", title: "3. Arrived at Facility", subtitle: "Triage & Queue Intact", color: "border-purple-200 bg-purple-50/30" },
  { id: "seen", title: "4. Seen & Feedback Closed", subtitle: "Milestone Verified", color: "border-emerald-200 bg-emerald-50/30" },
];

export function ReferralTrackerPage() {
  const [kanbanData, setKanbanData] = useState({
    issued: [],
    traveling: [],
    arrived: [],
    seen: [],
  });
  const [stats, setStats] = useState({
    total: 0,
    completionRate: 84,
    emergencyCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const { user } = useAuth();

  const fetchKanban = async () => {
    try {
      const res = await api.get("/referrals/kanban");
      if (res.data?.data) {
        setKanbanData(res.data.data.kanban);
        setStats(res.data.data.stats);
      }
    } catch (e) {
      console.error("Failed to fetch referral kanban", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKanban();

    const socket = getSocket();
    const handleReferralUpdate = () => {
      fetchKanban();
    };

    socket.on("referralUpdated", handleReferralUpdate);
    return () => {
      socket.off("referralUpdated", handleReferralUpdate);
    };
  }, []);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceColId = source.droppableId;
    const destColId = destination.droppableId;

    const sourceList = [...kanbanData[sourceColId]];
    const destList = [...kanbanData[destColId]];
    const [movedItem] = sourceList.splice(source.index, 1);

    movedItem.status = destColId;
    destList.splice(destination.index, 0, movedItem);

    setKanbanData({
      ...kanbanData,
      [sourceColId]: sourceList,
      [destColId]: destList,
    });

    setUpdatingId(draggableId);
    try {
      await api.patch(`/referrals/${draggableId}/status`, {
        newStatus: destColId,
        note: `Kanban transition to ${destColId} by ${user?.name || "Staff"}`,
      });
    } catch (err) {
      console.error("Status update error", err);
      fetchKanban();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAdvanceStatus = async (referral, nextStatus) => {
    setUpdatingId(referral._id);
    try {
      await api.patch(`/referrals/${referral._id}/status`, {
        newStatus: nextStatus,
        note: `Fast advanced to ${nextStatus} by ${user?.name || "Medical Officer"}`,
      });
      fetchKanban();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const getUrgencyPill = (urgency) => {
    switch (urgency) {
      case "emergency":
        return "bg-rose-600 text-white font-bold";
      case "urgent":
        return "bg-amber-600 text-white font-bold";
      case "routine":
      default:
        return "bg-slate-100 text-slate-700 font-semibold";
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto text-left font-sans text-slate-800">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-700">
            Module 3.5 · Closed-Loop Tracking
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Referral State Machine Board
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time inter-facility status transitions ensuring patients do not drop out between sub-centres and district hospitals.
          </p>
        </div>

        {/* Stats Strip */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col text-left">
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Referral Completion</span>
            <span className="text-xl font-bold text-slate-900">{stats.completionRate}%</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col text-left">
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Active In-Transit</span>
            <span className="text-xl font-bold text-slate-900">{stats.issued + stats.traveling + stats.arrived}</span>
          </div>
          <button
            onClick={fetchKanban}
            className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-colors cursor-pointer border-none"
            title="Refresh Board"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start min-h-[500px]">
          {COLUMNS.map((col) => {
            const cards = kanbanData[col.id] || [];

            return (
              <div
                key={col.id}
                className={`rounded-2xl border ${col.color} p-4 flex flex-col gap-3 min-h-[480px] shadow-xs`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex flex-col text-left">
                    <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-tight">
                      {col.title}
                    </h3>
                    <span className="text-[10px] text-slate-500">{col.subtitle}</span>
                  </div>
                  <span className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700 font-mono">
                    {cards.length}
                  </span>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 flex flex-col gap-2.5 transition-colors rounded-xl p-1 ${
                        snapshot.isDraggingOver ? "bg-teal-50/50" : ""
                      }`}
                    >
                      {cards.map((refItem, index) => {
                        const isEmergency = refItem.urgency === "emergency";
                        const isUrgent = refItem.urgency === "urgent";

                        return (
                          <Draggable key={refItem._id} draggableId={refItem._id} index={index}>
                            {(providedDrag, snapshotDrag) => (
                              <div
                                ref={providedDrag.innerRef}
                                {...providedDrag.draggableProps}
                                {...providedDrag.dragHandleProps}
                                onClick={() => setSelectedReferral(refItem)}
                                className={`bg-white border rounded-xl p-4 flex flex-col gap-2.5 text-left cursor-grab transition-all select-none ${
                                  snapshotDrag.isDragging
                                    ? "shadow-xl ring-2 ring-teal-600"
                                    : "shadow-xs hover:shadow-md"
                                } ${
                                  isEmergency
                                    ? "border-rose-300"
                                    : isUrgent
                                    ? "border-amber-300"
                                    : "border-slate-200"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-900 hover:text-teal-800">
                                      {refItem.patient?.name || "Patient"}
                                    </span>
                                    <span className="text-[10px] font-mono text-teal-700 font-semibold">
                                      {refItem.referralCode}
                                    </span>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded text-[9px] uppercase ${getUrgencyPill(refItem.urgency)}`}>
                                    {refItem.urgency}
                                  </span>
                                </div>

                                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-[10px] font-medium text-slate-700">
                                  <span className="truncate max-w-[45%] text-slate-600 font-mono">
                                    {refItem.fromFacility?.name?.split(" ")[0] || "PHC"}
                                  </span>
                                  <ArrowRight className="w-3 h-3 text-teal-600 shrink-0" />
                                  <span className="truncate max-w-[45%] font-bold text-slate-900 font-mono">
                                    {refItem.toFacility?.name?.split(" ")[0] || "Hospital"}
                                  </span>
                                </div>

                                <p className="text-[11px] text-slate-600 leading-tight line-clamp-2">
                                  {refItem.reason}
                                </p>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                                  <span>{refItem.transportMode}</span>

                                  {col.id === "issued" && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAdvanceStatus(refItem, "traveling");
                                      }}
                                      className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded cursor-pointer border-none"
                                    >
                                      Move Traveling
                                    </button>
                                  )}
                                  {col.id === "traveling" && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAdvanceStatus(refItem, "arrived");
                                      }}
                                      className="px-2 py-0.5 bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold rounded cursor-pointer border-none"
                                    >
                                      Move Arrived
                                    </button>
                                  )}
                                  {col.id === "arrived" && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAdvanceStatus(refItem, "seen");
                                      }}
                                      className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded cursor-pointer border-none"
                                    >
                                      Close Feedback
                                    </button>
                                  )}
                                  {col.id === "seen" && (
                                    <span className="text-emerald-700 font-bold">Closed</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Detail Modal */}
      {selectedReferral && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 text-left animate-fadeIn">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase font-bold text-teal-700">
                  Closed-Loop Feedback Audit History
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Referral #{selectedReferral.referralCode}
                </h3>
                <span className="text-xs text-slate-500">
                  Patient: <strong>{selectedReferral.patient?.name}</strong> (ABHA: {selectedReferral.patient?.abhaId})
                </span>
              </div>
              <button
                onClick={() => setSelectedReferral(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold cursor-pointer border-none"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Referring Centre:</span>
                <strong className="text-slate-900">{selectedReferral.fromFacility?.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Receiving Hospital:</span>
                <strong className="text-slate-900">{selectedReferral.toFacility?.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Urgency Tier:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getUrgencyPill(selectedReferral.urgency)}`}>
                  {selectedReferral.urgency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Clinical Reason:</span>
                <span className="text-slate-900 font-semibold">{selectedReferral.reason}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Verifiable Status Milestones</span>
              <div className="flex flex-col gap-2">
                {selectedReferral.statusHistory?.map((step, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 uppercase font-mono">{step.status}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(step.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-0.5">By: {step.updatedByName || "Staff"} · {step.note}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedReferral(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg cursor-pointer border-none"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
