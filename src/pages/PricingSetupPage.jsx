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
  const [tableSaving, setTableSaving] = useState(false);

  const [pricingTable, setPricingTable] = useState([]);

  // Fixed pricing table structure - organized by calculation type
  const defaultPricingTable = [
    // Fixed-price items
    { section: "Fixed-price items", itemName: "Fixed-price items", whenApplies: "", priceType: "", price: "", isSectionHeader: true },
    { section: "Fixed-price items", itemName: "Demolition labour", whenApplies: "All estimates", priceType: "fixed", price: "", isSectionHeader: false },
    { section: "Fixed-price items", itemName: "Waste disposal", whenApplies: "All estimates", priceType: "fixed", price: "", isSectionHeader: false },
    { section: "Fixed-price items", itemName: "Plumbing labour (layout same)", whenApplies: "If customer selects same layout", priceType: "fixed", price: "", isSectionHeader: false },
    { section: "Fixed-price items", itemName: "Plumbing labour (layout change)", whenApplies: "If customer selects toilet will change", priceType: "fixed", price: "", isSectionHeader: false },
    { section: "Fixed-price items", itemName: "Electrical labour", whenApplies: "All estimates", priceType: "fixed", price: "", isSectionHeader: false },
    { section: "Fixed-price items", itemName: "Electrical material", whenApplies: "All estimates", priceType: "fixed", price: "", isSectionHeader: false },
    { section: "Fixed-price items", itemName: "Waterproofing", whenApplies: "All estimates", priceType: "fixed", price: "", isSectionHeader: false },
    { section: "Fixed-price items", itemName: "Niche (fixed cost)", whenApplies: "All estimates", priceType: "fixed", price: "", isSectionHeader: false },
    { section: "Fixed-price items", itemName: "Consumables", whenApplies: "All estimates", priceType: "fixed", price: "", isSectionHeader: false },
    { section: "Fixed-price items", itemName: "Shower base + screen", whenApplies: "All estimates", priceType: "fixed", price: "", isSectionHeader: false },
    { section: "Fixed-price items", itemName: "Gap filling & painting", whenApplies: "All estimates", priceType: "fixed", price: "", isSectionHeader: false },
    { section: "Fixed-price items", itemName: "Builder labour for wall knock/shift", whenApplies: "If customer selects yes to changes to wall layout", priceType: "fixed", price: "", isSectionHeader: false },
    
    // Per-m² items
    { section: "Per-m² items", itemName: "Per-m² items", whenApplies: "", priceType: "", price: "", isSectionHeader: true },
    { section: "Per-m² items", itemName: "Tiling labour", whenApplies: "All estimates", priceType: "sqm", price: "", isSectionHeader: false },
    { section: "Per-m² items", itemName: "Tiles material", whenApplies: "If customer selects yes for tiles", priceType: "sqm", price: "", isSectionHeader: false },
    
    // Percentage-based items
    { section: "Percentage-based items", itemName: "Percentage-based items", whenApplies: "", priceType: "", price: "", isSectionHeader: true },
    { section: "Percentage-based items", itemName: "Builder labour / PM / admin", whenApplies: "All estimates", priceType: "percentage", price: "", isSectionHeader: false },
    { section: "Percentage-based items", itemName: "Access/difficult site fee", whenApplies: "If client selects lives in apartment", priceType: "percentage", price: "", isSectionHeader: false },
  ];

  const fetchPricingProfile = useCallback(async () => {
    if (!builder) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.get("/builders/pricing");
      const items = response.pricingItems || [];
      
      // Map existing pricing items to the fixed table structure
      const tableData = defaultPricingTable.map((row) => {
        if (row.isSectionHeader) return row;
        
        // Find matching item from backend
        const existingItem = items.find(
          (item) => {
            const nameMatch = item.itemName === row.itemName || 
              item.itemName?.toLowerCase().includes(row.itemName.toLowerCase()) ||
              row.itemName.toLowerCase().includes(item.itemName?.toLowerCase());
            const applicabilityMatch = item.applicability === row.whenApplies || 
              item.applicability?.toLowerCase() === row.whenApplies?.toLowerCase() ||
              (!item.applicability && row.whenApplies === "All estimates");
            const priceTypeMatch = (item.priceType === row.priceType) ||
              (item.priceType === "sqm" && row.priceType === "sqm") ||
              (item.priceType === "percentage" && row.priceType === "percentage") ||
              (item.priceType === "fixed" && row.priceType === "fixed");
            
            return nameMatch && (applicabilityMatch || !row.whenApplies) && priceTypeMatch;
          }
        );
        
        const priceValue = existingItem 
          ? (existingItem.priceType === "percentage" 
              ? (existingItem.markupPercent || 0).toString() 
              : (existingItem.finalPrice || 0).toString())
          : "";
        
        return {
          ...row,
          price: priceValue,
          id: existingItem?._id || existingItem?.id,
        };
      });
      
      setPricingTable(tableData);
    } catch (error) {
      // If no pricing data exists, use default table
      setPricingTable(defaultPricingTable);
    } finally {
      setLoading(false);
    }
  }, [builder, toast]);

  useEffect(() => {
    fetchPricingProfile();
  }, [fetchPricingProfile]);

  const handlePriceChange = (index, value) => {
    setPricingTable((prev) =>
      prev.map((row, idx) =>
        idx === index ? { ...row, price: value } : row
      )
    );
  };

  const handleSavePricingTable = async () => {
    if (!builder) return;
    setTableSaving(true);
    try {
      // Convert table data to pricing items format
      const pricingItems = pricingTable
        .filter((row) => !row.isSectionHeader && row.price)
        .map((row) => {
          return {
            itemName: row.itemName,
            applicability: row.whenApplies || "All estimates",
            priceType: row.priceType,
            finalPrice: row.priceType === "percentage" ? 0 : Number(row.price) || 0,
            markupPercent: row.priceType === "percentage" ? Number(row.price) || 0 : 0,
            isActive: true,
            ...(row.id && { _id: row.id }),
          };
        });

      await apiClient.put("/builders/pricing", {
        pricingMode: "final",
        pricingItems: pricingItems,
      });

      toast({
        title: "Success!",
        description: "Your pricing table has been saved.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error saving pricing",
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
                <div className="flex w-full justify-end mb-4">
                <Button
                  className="bg-orange-500 hover:bg-orange-600 shrink-0"
                  onClick={handleSavePricingTable}
                  disabled={tableSaving}
                >
                  {tableSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Pricing
                    </>
                  )}
                </Button>
              </div>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  Look back at a few past bathroom quotes to help guide your pricing or your Excel pricing set up.
                </p>
                <p>
                  A good starting point is the average amount you've charged for similar items across 3–4 typical bathroom renos.
                </p>
                <div>
                  <p className="font-semibold text-gray-900 mb-2">How it works:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>You'll enter your price (including your margin) for each job item.</li>
                    <li>When a client fills out the survey, EstiMate Pro will calculate an estimate based on your pricing. This estimate will only be visible to you in your dashboard.</li>
                    <li>To give you a realistic quote range, EstiMate Pro calculates:</li>
                    <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                      <li>Low estimate = based on your price</li>
                      <li>High estimate = your price + 30% (as a buffer for unknowns or variation)</li>
                    </ul>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-2">How to fill your pricing template in:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2 mb-2 text-gray-800">
                    <li>
                      Tiling is automatically calculated based on the option your client selects:
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Budget = floor area + approx. 30% of wall area (splash zones)</li>
                        <li>Standard = floor area + approx. 50% of wall area (feature wall & wet areas)</li>
                        <li>Premium = floor area + 100% of wall area (floor to ceiling)</li>
                      </ul>
                    </li>
                  </ul>
                  <p className="mb-1">In the "Enter your price (including margin)" column:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Enter a fixed price or $ per m², depending on what the row says.</li>
                    <li>If a line says "if customer selects…" – price what you'd usually charge when that situation applies (e.g. layout change, niche, apartment access).</li>
                  </ul>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {["Fixed-price items", "Per-m² items", "Percentage-based items"].map((sectionName) => {
                  const sectionRows = pricingTable.filter(row => row.section === sectionName);
                  if (sectionRows.length === 0) return null;
                  
                  return (
                    <div key={sectionName} className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                        {sectionName}
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border rounded-md">
                          <thead className="bg-gray-100 text-left">
                            <tr>
                              <th className="px-4 py-3 font-medium text-gray-700 border-r w-1/3">
                                Item
                              </th>
                              <th className="px-4 py-3 font-medium text-gray-700 border-r w-1/3">
                                When it applies
                              </th>
                              <th className="px-4 py-3 font-medium text-gray-700 w-1/3">
                                Enter your price (including margin)
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {sectionRows.map((row, index) => {
                              const globalIndex = pricingTable.findIndex(r => r === row);
                              if (row.isSectionHeader) return null;
                              
                              return (
                                <tr key={`row-${globalIndex}`} className="border-t hover:bg-gray-50">
                                  <td className="px-4 py-3 text-gray-900 border-r">
                                    {row.itemName}
                                  </td>
                                  <td className="px-4 py-3 text-gray-700 border-r">
                                    {row.whenApplies || "All estimates"}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="relative">
                                      {row.priceType === "percentage" ? (
                                        <>
                                          <Input
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            value={row.price}
                                            onChange={(e) => handlePriceChange(globalIndex, e.target.value)}
                                            placeholder="0"
                                            className="pr-8"
                                          />
                                          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                                            %
                                          </span>
                                        </>
                                      ) : row.priceType === "sqm" ? (
                                        <>
                                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                            $
                                          </span>
                                          <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={row.price}
                                            onChange={(e) => handlePriceChange(globalIndex, e.target.value)}
                                            placeholder="0.00"
                                            className="pl-7 pr-12"
                                          />
                                          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">
                                            /m²
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                            $
                                          </span>
                                          <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={row.price}
                                            onChange={(e) => handlePriceChange(globalIndex, e.target.value)}
                                            placeholder="0.00"
                                            className="pl-7"
                                          />
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-6 p-3 bg-blue-50 rounded-md">
                <strong>Note:</strong> Only the "Enter your price (including margin)" column can be edited. 
                {pricingTable.some(r => r.priceType === "sqm") && " For per-m² items, enter the price per square meter."}
                {pricingTable.some(r => r.priceType === "percentage") && " For percentage items, enter the percentage (e.g., 30 for 30%)."}
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </>
  );
};

export default PricingSetupPage;