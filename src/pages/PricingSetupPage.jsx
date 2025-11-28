import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Save,
  Info,
  Settings,
  FileText,
  Ruler,
  Plus,
  Pencil,
  Percent,
  Trash2,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";

const PricingSetupPage = () => {
  const { builder } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tableSaving, setTableSaving] = useState(false);

  const [calcMethod, setCalcMethod] = useState("fixed_price");
  const [fixedPrice, setFixedPrice] = useState("");
  const [markup, setMarkup] = useState("");
  const [pricingItems, setPricingItems] = useState([]);
  const [serviceItems, setServiceItems] = useState([]);

  const applicabilityOptions = [
    "All estimates",
    "Budget",
    "Standard",
    "Premium",
    "If customer selects same layout",
    "If customer selects toilet will change",
    "If customer selects yes for tiles",
    "If client selects lives in apartment",
    "If client selects yes to wall layout change",
  ];

  const blankServiceRow = {
    itemName: "",
    applicability: "All estimates",
    priceType: "fixed",
    priceValue: "",
    markupPercent: "",
    isActive: true,
  };

  const deserializeServiceItem = (item = {}) => ({
    itemName: item.itemName || "",
    applicability: item.applicability || "All estimates",
    priceType: item.priceType || "fixed",
    priceValue: (
      item.finalPrice ??
      item.baseCost ??
      0
    ).toString(),
    markupPercent: item.markupPercent ? item.markupPercent.toString() : "",
    isActive: item.isActive !== false,
  });

  const serializeServiceItems = (items) =>
    items
      .filter((item) => item.itemName.trim())
      .map((item) => ({
        itemName: item.itemName.trim(),
        applicability: item.applicability,
        priceType: item.priceType,
        finalPrice: Number(item.priceValue) || 0,
        markupPercent: Number(item.markupPercent) || 0,
        isActive: item.isActive !== false,
      }));

  const buildBaseItem = useCallback(
    (pricingModeValue, amountValue, markupValue) => ({
      itemName: "Base Default",
      applicability: "all",
      priceType: calcMethod === "fixed_price" ? "fixed" : "sqm",
      finalPrice:
        pricingModeValue === "final" ? Number(amountValue) || 0 : undefined,
      baseCost:
        pricingModeValue === "base" ? Number(amountValue) || 0 : undefined,
      markupPercent: Number(markupValue) || 0,
      isActive: true,
    }),
    [calcMethod]
  );

  const fetchPricingProfile = useCallback(async () => {
    if (!builder) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.get("/builders/pricing");
      const mode = response.pricingMode === "base" ? "per_sqm" : "fixed_price";
      setCalcMethod(mode);
      const items = response.pricingItems || [];
      setPricingItems(items);
      const defaultItem = items[0];
      if (defaultItem) {
        setFixedPrice(
          (defaultItem.finalPrice || defaultItem.baseCost || "").toString()
        );
        setMarkup((defaultItem.markupPercent || "").toString());
      } else {
        setFixedPrice("");
        setMarkup("");
      }
      const formattedServices = items.slice(1).map(deserializeServiceItem);
      setServiceItems(formattedServices);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching pricing data",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [builder, toast]);

  useEffect(() => {
    fetchPricingProfile();
  }, [fetchPricingProfile]);

  const persistPricingProfile = useCallback(
    async (serviceRows) => {
      const pricingMode = calcMethod === "fixed_price" ? "final" : "base";
      const amount = parseFloat(fixedPrice) || 0;
      const markupValue = parseFloat(markup) || 0;
      const baseItem = buildBaseItem(pricingMode, amount, markupValue);
      const servicePayload = serializeServiceItems(serviceRows);
      const updatedItems = [baseItem, ...servicePayload];
      await apiClient.put("/builders/pricing", {
        pricingMode,
        pricingItems: updatedItems,
      });
      setPricingItems(updatedItems);
      setServiceItems(serviceRows);
    },
    [calcMethod, fixedPrice, markup, buildBaseItem]
  );

  const handleSaveChanges = async () => {
    if (!builder) return;
    setSaving(true);
    try {
      await persistPricingProfile(serviceItems);
      toast({
        title: "Success!",
        description: "Your pricing settings have been saved.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error saving changes",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleAddServiceRow = () => {
    setServiceItems((prev) => [...prev, { ...blankServiceRow }]);
  };

  const handleServiceChange = (index, field, value) => {
    setServiceItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const handleDeleteRule = async (serviceIndex) => {
    if (!builder) return;
    setTableSaving(true);
    try {
      const filteredServiceItems = serviceItems.filter(
        (_, idx) => idx !== serviceIndex
      );
      await persistPricingProfile(filteredServiceItems);
      toast({
        title: "Rule removed",
        description: "The pricing rule has been deleted.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unable to delete rule",
        description: error.message,
      });
    } finally {
      setTableSaving(false);
    }
  };

  const handleSaveServiceTable = async () => {
    if (!builder) return;
    setTableSaving(true);
    try {
      await persistPricingProfile(serviceItems);
      toast({
        title: "Service pricing saved",
        description: "Your service-specific rules have been updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unable to save table",
        description: error.message,
      });
    } finally {
      setTableSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!builder) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">
          Sign in to configure your pricing profile.
        </p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Pricing Setup - EstiMate Pro</title>
        <meta name="description" content="Fine-tune your pricing strategy for accurate and competitive estimates." />
      </Helmet>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Pricing Setup</h1>
          <p className="text-muted-foreground mt-1">Fine-tune your pricing strategy for accurate and competitive estimates.</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Core Pricing Configuration</CardTitle>
              <p className="text-sm text-muted-foreground pt-1">Set your default base prices and markup. These will apply unless overridden by service-specific pricing.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Base Price Calculation Method</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-w-md">
                  <Button variant={calcMethod === 'fixed_price' ? 'default' : 'outline'} onClick={() => setCalcMethod('fixed_price')} className={calcMethod === 'fixed_price' ? 'bg-orange-500 hover:bg-orange-600' : ''}>
                    <FileText className="mr-2 h-4 w-4" /> Fixed Project Price
                  </Button>
                  <Button variant={calcMethod === 'per_sqm' ? 'default' : 'outline'} onClick={() => setCalcMethod('per_sqm')} className={calcMethod === 'per_sqm' ? 'bg-orange-500 hover:bg-orange-600' : ''}>
                    <Ruler className="mr-2 h-4 w-4" /> Price per m²
                  </Button>
                </div>
              </div>
              
              <div className="max-w-xs space-y-2">
                <Label htmlFor="base-fixed-price">Base Fixed Price</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                  <Input id="base-fixed-price" type="number" value={fixedPrice} onChange={(e) => setFixedPrice(e.target.value)} className="pl-7" placeholder="500" />
                </div>
              </div>

              <div className="max-w-xs space-y-2">
                <Label htmlFor="default-markup">Default Markup Percentage</Label>
                <div className="relative">
                  <Percent className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground h-full w-4" />
                  <Input id="default-markup" type="number" value={markup} onChange={(e) => setMarkup(e.target.value)} className="pl-9 pr-8" placeholder="20" />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">%</span>
                </div>
              </div>

              <Button onClick={handleSaveChanges} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Pricing Changes
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-900">
                <Info className="mr-2 h-5 w-5" />
                Key Pricing Logic Explained
              </CardTitle>
            </CardHeader>
            <CardContent className="text-orange-800 text-sm space-y-3">
              <p>Your estimates are calculated to provide a Low and High range, offering flexibility to your clients:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><span className="font-semibold">Low Estimate:</span> Base Price + (Base Price × Markup Percentage / 100)</li>
                <li><span className="font-semibold">High Estimate:</span> Low Estimate × 1.25 (This multiplier is configurable in advanced settings)</li>
              </ul>
              <p>This ensures your costs and profit margins are covered while providing a clear range.</p>
              <p className="text-sm text-orange-700 mt-2">
                Advanced settings like custom multipliers and service-specific rules are available in the pricing items table below.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Service-Specific Pricing</CardTitle>
                <p className="text-sm text-muted-foreground pt-1">
                  Define custom pricing for individual services to override general settings.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button variant="outline" onClick={handleAddServiceRow}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Row
                </Button>
                <Button
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={handleSaveServiceTable}
                  disabled={tableSaving}
                >
                  {tableSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Table"
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Each row is persisted through{" "}
                <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
                  /api/builders/pricing
                </code>
                . To load the Excel-based defaults, run{" "}
                <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
                  npm run create-dummy-data
                </code>{" "}
                inside <code className="text-xs">NodeExpressVercel-master</code>.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border rounded-md">
                  <thead className="bg-gray-100 text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium text-gray-700">
                        Service Name
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-700">
                        Applicability
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-700">
                        Price Type
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-700">
                        Value
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-700">
                        Markup %
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-muted-foreground"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Pencil className="h-8 w-8 text-gray-300" />
                            <p>No service-specific pricing rules yet.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      serviceItems.map((item, index) => (
                        <tr key={`service-row-${index}`} className="border-t">
                          <td className="px-4 py-3 align-top">
                            <Input
                              value={item.itemName}
                              onChange={(e) =>
                                handleServiceChange(index, "itemName", e.target.value)
                              }
                              placeholder="e.g. Demolition (labour)"
                            />
                          </td>
                          <td className="px-4 py-3 align-top">
                            <select
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                              value={item.applicability}
                              onChange={(e) =>
                                handleServiceChange(index, "applicability", e.target.value)
                              }
                            >
                              {applicabilityOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <select
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                              value={item.priceType}
                              onChange={(e) =>
                                handleServiceChange(index, "priceType", e.target.value)
                              }
                            >
                              <option value="fixed">Fixed</option>
                              <option value="sqm">Per m²</option>
                              <option value="percentage">Percentage</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                {item.priceType === "percentage" ? "%" : "$"}
                              </span>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                className="pl-8"
                                value={item.priceValue}
                                placeholder={
                                  item.priceType === "percentage" ? "30" : "1500"
                                }
                                onChange={(e) =>
                                  handleServiceChange(index, "priceValue", e.target.value)
                                }
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <Input
                              type="number"
                              min="0"
                              step="0.1"
                              placeholder="Optional"
                              value={item.markupPercent}
                              onChange={(e) =>
                                handleServiceChange(
                                  index,
                                  "markupPercent",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td className="px-4 py-3 align-top">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteRule(index)}
                              disabled={tableSaving}
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Tip: These rules map directly to the Excel items (Demolition, Plumbing, Tiles, etc.). Keeping the table up to date ensures the estimate engine uses the right sqm formulas.
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </>
  );
};

export default PricingSetupPage;