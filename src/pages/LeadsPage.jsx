import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/apiClient";
import { Loader2, RefreshCcw, Phone, Mail, Calendar, Trash2, FileText } from "lucide-react";
import QuoteModal from "@/components/quotes/QuoteModal";

const leadStatuses = [
  "New",
  "Contacted",
  "Site Visit Done",
  "Quote Sent",
  "Quote Accepted",
  "Quote Unsuccessful",
  "Client Not Interested",
  "Client Uncontactable",
];

// Derive an estimate from stored line items so display always matches quote logic
const deriveEstimate = (lead) => {
  if (!lead?.estimate?.lineItems) return null;

  const wallChangeOn = lead.wallChanges === "yes" || lead.wallChanges === true;

  const filtered = lead.estimate.lineItems.filter((item) => {
    const name = (item.itemName || "").toLowerCase();
    if (!wallChangeOn && (name.includes("wall knock") || name.includes("wall shift") || name.includes("knock/shift"))) {
      return false;
    }
    return true;
  });

  const subtotal = filtered
    .filter((item) => item.priceType !== "percentage")
    .reduce((sum, item) => sum + (Number(item.total) || 0), 0);

  const percentageTotal = filtered
    .filter((item) => item.priceType === "percentage")
    .reduce((sum, item) => {
      const pct = Number(item.unitPrice ?? item.markupPercent ?? 0);
      const amount = (subtotal * pct) / 100;
      return sum + amount;
    }, 0);

  const baseEstimate = subtotal + percentageTotal;
  const highEstimate = baseEstimate * 1.3;

  return {
    subtotal,
    percentageTotal,
    baseEstimate,
    highEstimate,
  };
};

const LeadsPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { leadId: leadIdParam } = useParams();
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/leads");
      const data = response.leads || [];
      setLeads(data);
      if (data.length) {
        const target = leadIdParam
          ? data.find(
              (lead) => (lead._id || lead.id || "").toString() === leadIdParam
            )
          : null;
        if (target) {
          setSelectedLead(target);
          setNotes(target.notes || "");
        } else if (!selectedLead) {
          setSelectedLead(data[0]);
          setNotes(data[0]?.notes || "");
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unable to load leads",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [leadIdParam]);

  // Sync selection when URL param changes after leads are loaded
  useEffect(() => {
    if (!leadIdParam || !leads.length) return;
    const target = leads.find(
      (lead) => (lead._id || lead.id || "").toString() === leadIdParam
    );
    if (target) {
      setSelectedLead(target);
      setNotes(target.notes || "");
    }
  }, [leadIdParam, leads]);

  const filteredLeads = useMemo(() => {
    if (filterStatus === "all") return leads;
    return leads.filter((lead) => lead.status === filterStatus);
  }, [leads, filterStatus]);

  const handleStatusChange = async (leadId, status) => {
    try {
      setUpdating(true);
      await apiClient.patch(`/leads/${leadId}/status`, { status });
      toast({ title: "Lead updated", description: `Status set to ${status}` });
      await fetchLeads();
      if (selectedLead?._id === leadId) {
        setSelectedLead((prev) => ({ ...prev, status }));
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unable to update lead",
        description: error.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedLead?._id && !selectedLead?.id) return;
    try {
      setSavingNotes(true);
      const leadId = selectedLead._id || selectedLead.id;
      await apiClient.patch(`/leads/${leadId}/notes`, { notes });
      toast({ title: "Notes saved", description: "Internal notes updated." });
      await fetchLeads();
      setSelectedLead((prev) => (prev ? { ...prev, notes } : prev));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unable to save notes",
        description: error.message,
      });
    } finally {
      setSavingNotes(false);
    }
  };

  const handleRefresh = () => {
    fetchLeads();
  };

  const handleDeleteLead = async (leadId) => {
    if (!confirm("Are you sure you want to delete this lead? This action cannot be undone.")) {
      return;
    }
    try {
      setUpdating(true);
      await apiClient.delete(`/leads/${leadId}`);
      toast({ title: "Lead deleted", description: "The lead has been removed." });
      await fetchLeads();
      if (selectedLead?._id === leadId || selectedLead?.id === leadId) {
        setSelectedLead(null);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unable to delete lead",
        description: error.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Leads - EstiMate Pro</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
            <p className="text-muted-foreground">
              Track every submission, update status, and review details.
            </p>
          </div>
          <div className="flex gap-2">
            <select
              className="rounded-md border border-gray-200 px-3 py-2"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All statuses</option>
              {leadStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Lead list</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                </div>
              ) : (
                <div className="max-h-[70vh] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Client
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Submitted
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Estimate
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredLeads.map((lead) => {
                        const leadId = lead._id || lead.id;
                        const date = lead.submittedAt || lead.createdAt;
                        const derived = deriveEstimate(lead);
                        const estimateText = derived
                          ? `${new Intl.NumberFormat("en-AU", {
                              style: "currency",
                              currency: "AUD",
                              maximumFractionDigits: 0,
                            }).format(derived.baseEstimate)} - ${new Intl.NumberFormat("en-AU", {
                              style: "currency",
                              currency: "AUD",
                              maximumFractionDigits: 0,
                            }).format(derived.highEstimate)}`
                          : lead.estimate
                          ? `${new Intl.NumberFormat("en-AU", {
                              style: "currency",
                              currency: "AUD",
                              maximumFractionDigits: 0,
                            }).format(lead.estimate.baseEstimate)} - ${new Intl.NumberFormat("en-AU", {
                              style: "currency",
                              currency: "AUD",
                              maximumFractionDigits: 0,
                            }).format(lead.estimate.highEstimate)}`
                          : "--";
                        const isSelected = selectedLead?._id === leadId || selectedLead?.id === leadId;
                        return (
                          <tr
                            key={leadId}
                            className={`cursor-pointer hover:bg-orange-50 ${
                              isSelected ? "bg-orange-50" : ""
                            }`}
                            onClick={() => {
                              setSelectedLead(lead);
                              const id = leadId || lead.id;
                              if (id) navigate(`/dashboard/leads/${id}`);
                            }}
                          >
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900">
                                {lead.clientName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {lead.clientPhone}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {date ? new Date(date).toLocaleString() : "--"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {estimateText}
                            </td>
                            <td className="px-4 py-3">
                              <Badge>{lead.status}</Badge>
                            </td>
                          </tr>
                        );
                      })}
                      {!filteredLeads.length && (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-8 text-center text-muted-foreground"
                          >
                            No leads available for this filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Lead details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedLead ? (
                <>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      Client
                    </p>
                    <p className="text-lg font-semibold">{selectedLead.clientName}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {selectedLead.clientPhone}
                    </div>
                    {selectedLead.clientEmail && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {selectedLead.clientEmail}
                      </div>
                    )}
                    {selectedLead.clientSuburb && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="text-muted-foreground">📍</span>
                        {selectedLead.clientSuburb}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {selectedLead.submittedAt
                        ? new Date(selectedLead.submittedAt).toLocaleString()
                        : "--"}
                    </div>
                  </div>

                  {(selectedLead.measurements?.floorLength || 
                    selectedLead.measurements?.floorWidth || 
                    selectedLead.measurements?.wallHeight) && (
                    <div>
                      <p className="text-xs uppercase text-muted-foreground mb-1">
                        Measurements
                      </p>
                      <div className="text-sm space-y-1">
                        {selectedLead.measurements?.floorLength && (
                          <p>Floor Length: {selectedLead.measurements.floorLength} m</p>
                        )}
                        {selectedLead.measurements?.floorWidth && (
                          <p>Floor Width: {selectedLead.measurements.floorWidth} m</p>
                        )}
                        {selectedLead.measurements?.wallHeight && (
                          <p>Wall Height: {selectedLead.measurements.wallHeight} m</p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedLead.calculatedAreas && (
                    <div>
                      <p className="text-xs uppercase text-muted-foreground mb-1">
                        Calculated Measurements
                      </p>
                      <div className="text-sm space-y-1">
                        {selectedLead.calculatedAreas.floorArea && (
                          <p>Floor Area: {selectedLead.calculatedAreas.floorArea.toFixed(2)} m²</p>
                        )}
                        {selectedLead.calculatedAreas.wallArea && (
                          <p>Wall Area: {selectedLead.calculatedAreas.wallArea.toFixed(2)} m²</p>
                        )}
                        {selectedLead.calculatedAreas.totalArea && (
                          <p>Total Area: {selectedLead.calculatedAreas.totalArea.toFixed(2)} m²</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs uppercase text-muted-foreground mb-1">
                      Bathroom type / tiling
                    </p>
                    <p className="text-sm">
                      {selectedLead.bathroomType} · {selectedLead.tilingLevel}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Home age: {selectedLead.homeAgeCategory || "Unknown"}
                    </p>
                  </div>

                  {selectedLead.tilesSupply && (
                    <div>
                      <p className="text-xs uppercase text-muted-foreground mb-1">
                        Tiles to be included
                      </p>
                      <p className="text-sm text-gray-700">
                        {selectedLead.tilesSupply === "yes_include" 
                          ? "Yes, please! Include in the estimate" 
                          : selectedLead.tilesSupply === "no_supply_own"
                          ? "No, thank you - I will supply my own tiles"
                          : selectedLead.tilesSupply}
                      </p>
                    </div>
                  )}

                  {(selectedLead.toiletLocation || selectedLead.wallChanges) && (
                    <div>
                      <p className="text-xs uppercase text-muted-foreground mb-1">
                        Structural Changes
                      </p>
                      <div className="text-sm space-y-1">
                        {selectedLead.toiletLocation && (
                          <p>
                            Toilet location: {
                              selectedLead.toiletLocation === "same_location"
                                ? "Toilet will remain the same location"
                                : selectedLead.toiletLocation === "change_location"
                                ? "Toilet will change location"
                                : selectedLead.toiletLocation
                            }
                          </p>
                        )}
                        {selectedLead.wallChanges && (
                          <p>
                            Wall changes: {
                              selectedLead.wallChanges === "yes"
                                ? "Yes - knocking down or shifting a wall"
                                : selectedLead.wallChanges === "no"
                                ? "No"
                                : selectedLead.wallChanges
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedLead.designStyle && (
                    <div>
                      <p className="text-xs uppercase text-muted-foreground mb-1">
                        Design notes
                      </p>
                      <p className="text-sm text-gray-700">{selectedLead.designStyle}</p>
                    </div>
                  )}

                {(() => {
                  const derived = deriveEstimate(selectedLead);
                  if (!derived && !selectedLead.estimate) return null;
                  const base =
                    derived?.baseEstimate ??
                    selectedLead.estimate?.baseEstimate ??
                    0;
                  const high =
                    derived?.highEstimate ??
                    selectedLead.estimate?.highEstimate ??
                    0;

                  return (
                    <div className="rounded-lg bg-orange-50 p-4">
                      <p className="text-xs uppercase text-orange-600">
                        Internal estimate
                      </p>
                      <p className="text-xl font-semibold text-gray-900">
                        {`${new Intl.NumberFormat("en-AU", {
                          style: "currency",
                          currency: "AUD",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(base)} – ${new Intl.NumberFormat("en-AU", {
                          style: "currency",
                          currency: "AUD",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(high)}`}
                      </p>
                    </div>
                  );
                })()}

                  <div>
                    <Label className="text-xs uppercase text-muted-foreground">
                      Status
                    </Label>
                    <select
                      className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2"
                      value={selectedLead.status}
                      onChange={(e) =>
                        handleStatusChange(
                          selectedLead._id || selectedLead.id,
                          e.target.value
                        )
                      }
                      disabled={updating}
                    >
                      {leadStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-xs uppercase text-muted-foreground">
                      Internal notes
                    </Label>
                    <Textarea
                      placeholder="Add internal notes (visible only to your team)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[90px]"
                      disabled={savingNotes || updating}
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveNotes}
                        disabled={savingNotes || updating}
                      >
                        {savingNotes ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save notes"
                        )}
                      </Button>
                    </div>
                  </div>

                  {selectedLead.photoPaths?.length > 0 && (
                    <div>
                      <Label className="text-xs uppercase text-muted-foreground">
                        Files
                      </Label>
                      <ul className="mt-2 space-y-2">
                        {selectedLead.photoPaths.map((file, idx) => {
                          const sanitizedPath = file.replace(/\\/g, "/");
                          const url = sanitizedPath.startsWith("http")
                            ? sanitizedPath
                            : `/${sanitizedPath}`;
                          return (
                            <li key={`${file}-${idx}`}>
                            <a
                                href={url}
                              className="text-sm text-orange-600 hover:underline"
                              target="_blank"
                              rel="noreferrer"
                            >
                              View upload {idx + 1}
                            </a>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {selectedLead.estimate && (
                    <div>
                      <Button
                        onClick={() => setShowQuoteModal(true)}
                        className="w-full bg-orange-500 hover:bg-orange-600"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Create Quote
                      </Button>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteLead(selectedLead._id || selectedLead.id)}
                      disabled={updating}
                      className="w-full"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Lead
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Select a lead from the list to view details.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <QuoteModal
          lead={selectedLead}
          open={showQuoteModal}
          onClose={() => setShowQuoteModal(false)}
        />
      </motion.div>
    </>
  );
};

export default LeadsPage;

