import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ArrowLeft, Save } from "lucide-react";

const AdminBuilderViewPage = () => {
  const { builder: currentBuilder } = useAuth();
  const { builderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [savingPricing, setSavingPricing] = useState(false);
  const [builderInfo, setBuilderInfo] = useState(null);
  const [pricingItems, setPricingItems] = useState([]);
  const [pricingMode, setPricingMode] = useState("final");
  const [leads, setLeads] = useState([]);

  const computeAccountStatus = (builder) => {
    const now = new Date();
    if (builder?.isAccessDisabled) return "Disabled";
    if (builder?.subscriptionStatus === "active") return "Active (Paid)";
    if (builder?.subscriptionStatus === "trialing") {
      if (builder?.trialEndsAt && new Date(builder.trialEndsAt) < now) {
        return "Expired";
      }
      return "Trial";
    }
    return "Expired";
  };

  const formatDate = (value) => {
    if (!value) return "--";
    const date = new Date(value);
    return isNaN(date.getTime())
      ? "--"
      : date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [builderRes, pricingRes, leadsRes] = await Promise.all([
        apiClient.get(`/admin/builders/${builderId}`),
        apiClient.get(`/admin/builders/${builderId}/pricing`),
        apiClient.get(`/admin/leads?builderId=${builderId}`),
      ]);
      setBuilderInfo(builderRes.builder);
      setPricingItems(pricingRes.pricingItems || []);
      setPricingMode(pricingRes.pricingMode || "final");
      setLeads(leadsRes.leads || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unable to load builder data",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentBuilder) return;
    if (currentBuilder.role !== "admin") {
      setLoading(false);
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBuilder, builderId]);

  const handlePricingChange = (index, field, value) => {
    setPricingItems((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleToggleActive = (index) => {
    setPricingItems((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, isActive: item.isActive === false ? true : !item.isActive } : item
      )
    );
  };

  const handleSavePricing = async () => {
    try {
      setSavingPricing(true);
      await apiClient.put(`/admin/builders/${builderId}/pricing`, {
        pricingMode,
        pricingItems,
      });
      toast({ title: "Pricing updated", description: "Changes saved for builder." });
      await fetchData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unable to save pricing",
        description: error.message,
      });
    } finally {
      setSavingPricing(false);
    }
  };

  const filteredLeads = useMemo(() => leads, [leads]);

  if (currentBuilder && currentBuilder.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Builder Admin View - EstiMate Pro</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Viewing Builder Account
            </h1>
            <p className="text-muted-foreground">
              Viewing as Admin – changes will affect builder’s account.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/dashboard/admin")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={handleSavePricing}
              disabled={savingPricing}
            >
              {savingPricing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Pricing
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
          Viewing in admin mode. You can help set pricing, fix errors, and review
          estimates. Builder email/password and payment details are not editable here.
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Builder Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Business</span>
                <span className="font-medium">{builderInfo?.businessName || "N/A"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Contact</span>
                <span className="font-medium">{builderInfo?.contactName || "N/A"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium break-all">{builderInfo?.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium">{builderInfo?.phone || "—"}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline">
                  {computeAccountStatus(builderInfo)}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Signup</span>
                <span className="font-medium">{formatDate(builderInfo?.createdAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Trial Ends</span>
                <span className="font-medium">{formatDate(builderInfo?.trialEndsAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Login</span>
                <span className="font-medium">{formatDate(builderInfo?.lastLoginAt)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Pricing Setup (Admin)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3 items-center">
                <span className="text-sm text-muted-foreground">Pricing Mode:</span>
                <select
                  className="rounded-md border border-gray-200 px-3 py-2 text-sm"
                  value={pricingMode}
                  onChange={(e) => setPricingMode(e.target.value)}
                >
                  <option value="final">Final (client-facing)</option>
                  <option value="base">Base cost</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-200 px-2 py-2 text-left">Item</th>
                      <th className="border border-gray-200 px-2 py-2 text-left">Type</th>
                      <th className="border border-gray-200 px-2 py-2 text-right">Price / %</th>
                      <th className="border border-gray-200 px-2 py-2 text-right">Base Cost</th>
                      <th className="border border-gray-200 px-2 py-2 text-right">Markup %</th>
                      <th className="border border-gray-200 px-2 py-2 text-center">Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingItems.map((item, idx) => (
                      <tr key={`${item.itemName}-${idx}`} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-2 py-2">
                          <div className="font-medium">{item.itemName}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.applicability || "all"}
                          </div>
                        </td>
                        <td className="border border-gray-200 px-2 py-2 capitalize">
                          {item.priceType}
                        </td>
                        <td className="border border-gray-200 px-2 py-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={item.finalPrice ?? 0}
                            onChange={(e) =>
                              handlePricingChange(idx, "finalPrice", Number(e.target.value))
                            }
                            className="text-right"
                          />
                        </td>
                        <td className="border border-gray-200 px-2 py-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={item.baseCost ?? 0}
                            onChange={(e) =>
                              handlePricingChange(idx, "baseCost", Number(e.target.value))
                            }
                            className="text-right"
                          />
                        </td>
                        <td className="border border-gray-200 px-2 py-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={item.markupPercent ?? 0}
                            onChange={(e) =>
                              handlePricingChange(idx, "markupPercent", Number(e.target.value))
                            }
                            className="text-right"
                          />
                        </td>
                        <td className="border border-gray-200 px-2 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={item.isActive !== false}
                            onChange={() => handleToggleActive(idx)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Leads (Read-only)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Client</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLeads.map((lead) => (
                    <tr key={lead._id || lead.id}>
                      <td className="px-3 py-2 font-medium">
                        {lead.clientName || "Unknown"}
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant="outline">{lead.status || "New"}</Badge>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {lead.createdAt
                          ? new Date(lead.createdAt).toLocaleDateString()
                          : "--"}
                      </td>
                    </tr>
                  ))}
                  {!filteredLeads.length && (
                    <tr>
                      <td className="px-3 py-4 text-center text-muted-foreground" colSpan={3}>
                        No leads for this builder yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default AdminBuilderViewPage;

