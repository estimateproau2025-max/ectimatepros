import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const LeadsPage = () => {
  const { toast } = useToast();
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState("");
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/leads");
      const data = response.leads || [];
      setLeads(data);
      if (data.length && !selectedLead) {
        setSelectedLead(data[0]);
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
  }, []);

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
                        const estimateText = lead.estimate
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
                            onClick={() => setSelectedLead(lead)}
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

                  {selectedLead.estimate && (
                    <div className="rounded-lg bg-orange-50 p-4">
                      <p className="text-xs uppercase text-orange-600">
                        Internal estimate
                      </p>
                      <p className="text-xl font-semibold text-gray-900">
                        {new Intl.NumberFormat("en-AU", {
                          style: "currency",
                          currency: "AUD",
                          maximumFractionDigits: 0,
                        }).format(selectedLead.estimate.baseEstimate)}{" "}
                        –{" "}
                        {new Intl.NumberFormat("en-AU", {
                          style: "currency",
                          currency: "AUD",
                          maximumFractionDigits: 0,
                        }).format(selectedLead.estimate.highEstimate)}
                      </p>
                    </div>
                  )}

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
                    <Input
                      placeholder="Coming soon"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Notes sync is on the roadmap.
                    </p>
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

