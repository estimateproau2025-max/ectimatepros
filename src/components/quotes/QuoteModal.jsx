import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Download, X } from "lucide-react";
import html2pdf from "html2pdf.js/dist/html2pdf.bundle.min.js";

const QuoteModal = ({ lead, open, onClose }) => {
  const { builder } = useAuth();
  const [quoteItems, setQuoteItems] = useState([]);
  const [terms, setTerms] = useState("Payment terms: 30% deposit required upon acceptance of quote. Balance due upon completion of work.\n\nWarranty: All workmanship guaranteed for 12 months.\n\nValidity: This quote is valid for 30 days from the date of issue.");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lead && lead.estimate?.lineItems) {
      // Initialize quote items from estimate line items
      const items = lead.estimate.lineItems.map(item => ({
        ...item,
        editableAmount: item.total,
      }));
      setQuoteItems(items);
    }
  }, [lead]);

  const subtotal = useMemo(() => {
    return quoteItems.reduce((sum, item) => sum + (Number(item.editableAmount) || 0), 0);
  }, [quoteItems]);

  const gst = useMemo(() => {
    return subtotal * 0.1;
  }, [subtotal]);

  const total = useMemo(() => {
    return subtotal + gst;
  }, [subtotal, gst]);

  const handleAmountChange = (index, value) => {
    setQuoteItems(prev => 
      prev.map((item, idx) => 
        idx === index ? { ...item, editableAmount: value } : item
      )
    );
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date || new Date()).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTilingDescription = () => {
    if (!lead.tilingLevel) return "Not specified";
    const level = lead.tilingLevel.toLowerCase();
    if (level === "budget") return "Budget – floor plus splash zones";
    if (level === "standard") return "Standard – feature walls + wet areas";
    if (level === "premium") return "Premium – floor to ceiling";
    return lead.tilingLevel;
  };

  const getTilesIncludeText = () => {
    if (lead.tilesSupply === "yes_include") return "Yes";
    if (lead.tilesSupply === "no_supply_own") return "No";
    return lead.tilesSupply || "Not specified";
  };

  const getToiletLocationText = () => {
    if (lead.toiletLocation === "same_location") return "No";
    if (lead.toiletLocation === "change_location") return "Yes";
    return lead.toiletLocation || "Not specified";
  };

  const getWallChangesText = () => {
    if (lead.wallChanges === "yes") return "Yes";
    if (lead.wallChanges === "no") return "No";
    return lead.wallChanges || "Not specified";
  };

  const getPropertyType = () => {
    if (!lead.bathroomType) return "Not specified";
    const type = lead.bathroomType.toLowerCase();
    if (type.includes("apartment")) return "Apartment (access fee applies)";
    if (type.includes("house") || type.includes("unit")) return "House/Unit";
    return lead.bathroomType;
  };

  const getItemType = (item) => {
    if (item.priceType === "sqm") return "per m²";
    if (item.priceType === "percentage") return "Percentage";
    return "Fixed";
  };

  const getItemQuantity = (item) => {
    if (item.priceType === "sqm") {
      // For tiling items, show the tiled area based on tiling level
      if (item.itemName?.toLowerCase().includes("tiling") || item.itemName?.toLowerCase().includes("tiles")) {
        const tilingLevel = lead.tilingLevel?.toLowerCase() || "standard";
        const areaKey = `${tilingLevel}Area`;
        const area = lead.calculatedAreas?.[areaKey] || lead.calculatedAreas?.totalArea || 0;
        return `${area.toFixed(2)} m²`;
      }
      return `${item.quantity || 0} m²`;
    }
    if (item.priceType === "percentage") {
      return `${item.unitPrice || 0}%`;
    }
    return "-";
  };

  const handleSavePDF = async () => {
    setSaving(true);
    try {
      const element = document.getElementById("quote-content");
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Quote_${lead.clientName}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      await html2pdf().set(opt).from(element).save();
      
      // You could also save the quote to backend here if needed
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Bathroom Renovation Quote</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div id="quote-content" className="p-6 bg-white">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-4">🔨 Bathroom Renovation Quote</h1>
            <div className="space-y-1 text-sm">
              <p><strong>Prepared by:</strong> {builder?.businessName || builder?.contactName || "Builder"}</p>
              <p><strong>ABN:</strong> {builder?.abn || "Not set"}</p>
              <p><strong>Client:</strong> {lead.clientName}</p>
              <p><strong>Date:</strong> {formatDate(new Date())}</p>
            </div>
          </div>

          {/* Job Summary */}
          <div className="mb-6 border-t pt-4">
            <h2 className="text-lg font-semibold mb-3">📏 Job Summary</h2>
            <ul className="space-y-1 text-sm list-disc list-inside">
              <li><strong>Bathroom measurements:</strong> Floor length: {lead.measurements?.floorLength || "-"} m, Floor width: {lead.measurements?.floorWidth || "-"} m, Wall height: {lead.measurements?.wallHeight || "-"} m</li>
              <li><strong>Calculated measurements:</strong> Floor area: {lead.calculatedAreas?.floorArea?.toFixed(2) || "-"} m², Wall area: {lead.calculatedAreas?.wallArea?.toFixed(2) || "-"} m², Total area: {lead.calculatedAreas?.totalArea?.toFixed(2) || "-"} m²</li>
              <li><strong>Tiling option:</strong> {getTilingDescription()}</li>
              <li><strong>Tiles to be included:</strong> {getTilesIncludeText()}</li>
              <li><strong>Toilet location change:</strong> {getToiletLocationText()}</li>
              <li><strong>Wall changes:</strong> {getWallChangesText()}</li>
              <li><strong>Property type:</strong> {getPropertyType()}</li>
            </ul>
          </div>

          {/* Itemized Quote */}
          <div className="mb-6 border-t pt-4">
            <h2 className="text-lg font-semibold mb-3">Itemised Quote</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Item</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Type</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Quantity</th>
                    <th className="border border-gray-300 px-3 py-2 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteItems.map((item, index) => {
                    // Handle percentage items separately
                    if (item.priceType === "percentage") {
                      // Builder labour/PM/admin
                      if (item.itemName?.toLowerCase().includes("builder") || item.itemName?.toLowerCase().includes("labour") || item.itemName?.toLowerCase().includes("project management") || item.itemName?.toLowerCase().includes("administration")) {
                        return (
                          <tr key={index} className="bg-gray-50">
                            <td className="border border-gray-300 px-3 py-2 font-medium">Project Management - All labour, project management & administration costs</td>
                            <td className="border border-gray-300 px-3 py-2">Fixed</td>
                            <td className="border border-gray-300 px-3 py-2">-</td>
                            <td className="border border-gray-300 px-3 py-2">
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-muted-foreground">$</span>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.editableAmount || 0}
                                  onChange={(e) => handleAmountChange(index, e.target.value)}
                                  className="w-24 text-right"
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      }
                      // Access fee
                      if (item.applicability?.toLowerCase().includes("apartment")) {
                        return (
                          <tr key={index}>
                            <td className="border border-gray-300 px-3 py-2">Access/difficult site</td>
                            <td className="border border-gray-300 px-3 py-2">Percentage</td>
                            <td className="border border-gray-300 px-3 py-2">-</td>
                            <td className="border border-gray-300 px-3 py-2">
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-muted-foreground">$</span>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.editableAmount || 0}
                                  onChange={(e) => handleAmountChange(index, e.target.value)}
                                  className="w-24 text-right"
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      }
                      return null;
                    }
                    
                    // Handle regular items
                    // Special handling for tiles material - show "Not Included" if client said no
                    if (item.itemName?.toLowerCase().includes("tiles") && item.itemName?.toLowerCase().includes("material")) {
                      const shouldInclude = lead.tilesSupply === "yes_include";
                      if (!shouldInclude) {
                        return (
                          <tr key={index} className="opacity-60">
                            <td className="border border-gray-300 px-3 py-2">{item.itemName}</td>
                            <td className="border border-gray-300 px-3 py-2">{getItemType(item)}</td>
                            <td className="border border-gray-300 px-3 py-2">Not Included</td>
                            <td className="border border-gray-300 px-3 py-2 text-right">$0.00</td>
                          </tr>
                        );
                      }
                    }
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2">{item.itemName}</td>
                        <td className="border border-gray-300 px-3 py-2">{getItemType(item)}</td>
                        <td className="border border-gray-300 px-3 py-2">{getItemQuantity(item)}</td>
                        <td className="border border-gray-300 px-3 py-2">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-muted-foreground">$</span>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.editableAmount || 0}
                              onChange={(e) => handleAmountChange(index, e.target.value)}
                              className="w-24 text-right"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="mb-6 border-t pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">10% GST</span>
                  <span>{formatPrice(gst)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="mb-6 border-t pt-4">
            <h2 className="text-lg font-semibold mb-3">Terms</h2>
            <Textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="min-h-[100px]"
              placeholder="Enter terms and conditions..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={handleSavePDF}
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Save as PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteModal;

