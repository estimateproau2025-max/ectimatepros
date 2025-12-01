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

  // Fixed pricing table structure
  const defaultPricingTable = [
    { category: "Demolition", itemName: "Demolition", estimateOptions: "", priceType: "", price: "", isHeader: true },
    { category: "Demolition", itemName: "Demolition (labour)", estimateOptions: "All estimates", priceType: "Fixed price estimate", price: "", isHeader: false },
    { category: "Demolition", itemName: "Waste disposal", estimateOptions: "All estimates", priceType: "Fixed price estimate", price: "", isHeader: false },
    { category: "Plumbing", itemName: "Plumbing", estimateOptions: "", priceType: "", price: "", isHeader: true },
    { category: "Plumbing", itemName: "Plumbing (labour) if layout stays the same", estimateOptions: "If customer selects same layout", priceType: "Fixed price estimate", price: "", isHeader: false },
    { category: "Plumbing", itemName: "Plumbing (labour) if changes to layout", estimateOptions: "If customer selects toilet will change", priceType: "Fixed price estimate", price: "", isHeader: false },
    { category: "Electrical", itemName: "Electrical", estimateOptions: "", priceType: "", price: "", isHeader: true },
    { category: "Electrical", itemName: "Electrical (labour)", estimateOptions: "All estimates", priceType: "Fixed price estimate", price: "", isHeader: false },
    { category: "Electrical", itemName: "Electrical (material)", estimateOptions: "All estimates", priceType: "Fixed price estimate", price: "", isHeader: false },
    { category: "Tiling", itemName: "Tiling", estimateOptions: "", priceType: "", price: "", isHeader: true },
    { category: "Tiling", itemName: "Waterproofing", estimateOptions: "All estimates", priceType: "Fixed price estimate", price: "", isHeader: false },
    { category: "Tiling", itemName: "Tiling (labour)", estimateOptions: "All estimates", priceType: "per M2", price: "", isHeader: false },
    { category: "Tiling", itemName: "Tiles (material)", estimateOptions: "If customer selects yes for tiles", priceType: "per M2", price: "", isHeader: false },
    { category: "Tiling", itemName: "Niche extra cost + builder labour to frame", estimateOptions: "If customer selects yes for niche", priceType: "Fixed price estimate", price: "", isHeader: false },
    { category: "Consumables", itemName: "Consumables", estimateOptions: "", priceType: "", price: "", isHeader: true },
    { category: "Consumables", itemName: "Consumables: Timber, Floor Protection, plaster, insulation, caulking, cornice, fixing materials, etc", estimateOptions: "All estimates", priceType: "Fixed price estimate", price: "", isHeader: false },
    { category: "Consumables", itemName: "Supply & installation of shower base & shower screen based on 900x900", estimateOptions: "All estimates", priceType: "Fixed price estimate", price: "", isHeader: false },
    { category: "Finishes & Builder's labour", itemName: "Finishes & Builder's labour", estimateOptions: "", priceType: "", price: "", isHeader: true },
    { category: "Finishes & Builder's labour", itemName: "Gap filling & painting", estimateOptions: "All estimates", priceType: "Fixed price estimate", price: "", isHeader: false },
    { category: "Finishes & Builder's labour", itemName: "Builder's labour, project management & administration costs", estimateOptions: "All estimates", priceType: "% of all above line items", price: "", isHeader: false },
    { category: "Finishes & Builder's labour", itemName: "Access/difficult site fee", estimateOptions: "If client selects lives in apartment", priceType: "% margin of all above line items", price: "", isHeader: false },
    // { category: "Finishes & Builder's labour", itemName: "Gap filling & painting", estimateOptions: "All estimates", priceType: "Fixed price estimate per room", price: "", isHeader: false },
    { category: "Finishes & Builder's labour", itemName: "Builder's labour for knocking down/shift wall", estimateOptions: "If customer selects yes to changes to wall layout", priceType: "Fixed price estimate", price: "", isHeader: false },
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
        if (row.isHeader) return row;
        
        // Find matching item from backend
        const existingItem = items.find(
          (item) => 
            item.itemName === row.itemName && 
            (item.applicability === row.estimateOptions || 
             item.applicability?.toLowerCase() === row.estimateOptions?.toLowerCase() ||
             (!item.applicability && row.estimateOptions === "All estimates"))
        );
        
        return {
          ...row,
          price: existingItem ? (existingItem.finalPrice || 0).toString() : "",
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
        .filter((row) => !row.isHeader && row.price)
        .map((row) => {
          const priceType = row.priceType.includes("per M2") ? "sqm" : 
                          row.priceType.includes("%") ? "percentage" : 
                          "fixed";
          
          return {
            itemName: row.itemName,
            applicability: row.estimateOptions || "All estimates",
            priceType: priceType,
            finalPrice: priceType === "percentage" ? 0 : Number(row.price) || 0,
            markupPercent: priceType === "percentage" ? Number(row.price) || 0 : 0,
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
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-4">
                <CardTitle>Pricing Setup</CardTitle>
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
                  <p className="mb-1">In the "Enter your price (including margin)" column:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Enter a fixed price or $ per m², depending on what the row says.</li>
                    <li>If a line says "if customer selects…" – price what you'd usually charge when that situation applies (e.g. layout change, niche, apartment access).</li>
                  </ul>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border rounded-md">
                  <thead className="bg-gray-100 text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium text-gray-700 border-r">
                        Item
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-700 border-r">
                        Estimate options
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-700 border-r">
                        Price Type
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-700">
                        Enter your price (including margin)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingTable.map((row, index) => {
                      if (row.isHeader) {
                        return (
                          <tr key={`header-${index}`} className="bg-gray-50 border-t">
                            <td colSpan={4} className="px-4 py-3 font-semibold text-gray-900">
                              {row.itemName}
                            </td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={`row-${index}`} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900 border-r">
                            {row.itemName}
                          </td>
                          <td className="px-4 py-3 text-gray-700 border-r">
                            {row.estimateOptions || "-"}
                          </td>
                          <td className="px-4 py-3 text-gray-700 border-r">
                            {row.priceType || "-"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="relative">
                              {row.priceType?.includes("%") ? (
                                <>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={row.price}
                                    onChange={(e) => handlePriceChange(index, e.target.value)}
                                    placeholder="0"
                                    className="pr-8"
                                  />
                                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                                    %
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
                                    onChange={(e) => handlePriceChange(index, e.target.value)}
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
              <p className="text-xs text-muted-foreground mt-4">
                Note: Only the "Enter your price (including margin)" column can be edited. All other columns are fixed.
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </>
  );
};

export default PricingSetupPage;