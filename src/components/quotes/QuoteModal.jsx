import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Download, X, Plus, Trash2 } from "lucide-react";
import html2pdf from "html2pdf.js/dist/html2pdf.bundle.min.js";

const QuoteModal = ({ lead, open, onClose }) => {
  const { builder } = useAuth();
  const [quoteItems, setQuoteItems] = useState([]);
  const [terms, setTerms] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lead && lead.estimate?.lineItems) {
      // Initialize quote items from estimate line items
      const wallChangeOn = lead.wallChanges === "yes" || lead.wallChanges === true;
      const items = lead.estimate.lineItems
        .filter(item => {
          const name = (item.itemName || "").toLowerCase();
          // Drop wall knock/shift labour when client said no wall changes
          if (!wallChangeOn && (name.includes("wall knock") || name.includes("wall shift") || name.includes("knock/shift"))) {
            return false;
          }
          return true;
        })
        .map(item => ({
          ...item,
          editableAmount: item.total,
        }));
      setQuoteItems(items);
    }
  }, [lead]);

  useEffect(() => {
    if (builder?.quoteTerms !== undefined) {
      setTerms("");
    }
  }, [builder]);

  const recalcCustomItems = (items) => {
    // Base subtotal excludes custom percentage items so they can calculate on top
    const baseSubtotal = items.reduce((sum, item) => {
      if (item.isCustom && item.priceType === "percentage") return sum;
      return sum + (Number(item.editableAmount) || 0);
    }, 0);

    let changed = false;

    const updated = items.map((item) => {
      if (!item.isCustom) return item;

      if (item.priceType === "percentage") {
        const pct = Number(item.markupPercent) || 0;
        const amount = baseSubtotal * (pct / 100);
        if (amount !== item.editableAmount) changed = true;
        return { ...item, editableAmount: amount };
      }

      if (item.priceType === "sqm") {
        const qty = Number(item.quantity) || 0;
        const unit = Number(item.unitPrice) || 0;
        const amount = qty * unit;
        if (amount !== item.editableAmount) changed = true;
        return { ...item, editableAmount: amount };
      }

      // fixed
      const unit = Number(item.unitPrice) || 0;
      if (unit !== item.editableAmount) changed = true;
      return { ...item, editableAmount: unit };
    });

    return changed ? updated : items;
  };

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
    setQuoteItems(prev => {
      const updated = prev.map((item, idx) =>
        idx === index ? { ...item, editableAmount: value } : item
      );
      return recalcCustomItems(updated);
    });
  };

  const handleCustomFieldChange = (index, field, value) => {
    setQuoteItems(prev => {
      const updated = prev.map((item, idx) => {
        if (idx !== index) return item;

        const next = { ...item };
        if (field === "priceType") {
          next.priceType = value;
          // reset related fields when switching type
          if (value === "percentage") {
            next.markupPercent = next.markupPercent ?? 0;
            next.quantity = undefined;
            next.unitPrice = undefined;
          } else if (value === "sqm") {
            next.quantity = next.quantity ?? 0;
            next.unitPrice = next.unitPrice ?? 0;
            next.markupPercent = undefined;
          } else {
            next.unitPrice = next.unitPrice ?? 0;
            next.quantity = undefined;
            next.markupPercent = undefined;
          }
        } else if (field === "itemName") {
          next.itemName = value;
        } else if (field === "quantity") {
          next.quantity = value;
        } else if (field === "unitPrice") {
          next.unitPrice = value;
        } else if (field === "markupPercent") {
          next.markupPercent = value;
        } else if (field === "editableAmount") {
          next.editableAmount = value;
        }

        return next;
      });

      return recalcCustomItems(updated);
    });
  };

  const handleAddCustomItem = () => {
    setQuoteItems(prev => {
      const updated = [
        ...prev,
        {
          itemName: "Custom item",
          priceType: "fixed",
          unitPrice: 0,
          quantity: undefined,
          markupPercent: undefined,
          editableAmount: 0,
          isCustom: true,
        },
      ];
      return recalcCustomItems(updated);
    });
  };

  const handleRemoveCustomItem = (index) => {
    setQuoteItems(prev => {
      const updated = prev.filter((_, idx) => idx !== index);
      return recalcCustomItems(updated);
    });
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
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Itemised Quote</h2>
              <Button variant="outline" size="sm" onClick={handleAddCustomItem}>
                <Plus className="h-4 w-4 mr-1" />
                Add custom item
              </Button>
            </div>
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
                    if (item.isCustom) {
                      return (
                        <tr key={`custom-${index}`} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2">
                            <Input
                              value={item.itemName}
                              onChange={(e) => handleCustomFieldChange(index, "itemName", e.target.value)}
                              placeholder="Custom item"
                            />
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <select
                              className="w-full border border-input rounded-md h-9 px-2 text-sm"
                              value={item.priceType}
                              onChange={(e) => handleCustomFieldChange(index, "priceType", e.target.value)}
                            >
                              <option value="fixed">Fixed</option>
                              <option value="sqm">per m²</option>
                              <option value="percentage">Percentage</option>
                            </select>
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            {item.priceType === "sqm" && (
                              <div className="flex flex-col gap-2">
                                <div className="relative">
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.quantity || ""}
                                    onChange={(e) => handleCustomFieldChange(index, "quantity", e.target.value)}
                                    placeholder="0.00"
                                  />
                                  <span className="absolute inset-y-0 right-2 flex items-center text-muted-foreground text-xs">m²</span>
                                </div>
                                <div className="relative">
                                  <span className="absolute inset-y-0 left-2 flex items-center text-muted-foreground">$</span>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.unitPrice ?? ""}
                                    onChange={(e) => handleCustomFieldChange(index, "unitPrice", e.target.value)}
                                    placeholder="Unit price"
                                    className="pl-6"
                                  />
                                </div>
                              </div>
                            )}
                            {item.priceType === "percentage" && (
                              <div className="relative">
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={item.markupPercent ?? ""}
                                  onChange={(e) => handleCustomFieldChange(index, "markupPercent", e.target.value)}
                                  placeholder="0"
                                />
                                <span className="absolute inset-y-0 right-2 flex items-center text-muted-foreground">%</span>
                              </div>
                            )}
                            {item.priceType === "fixed" && <span>-</span>}
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-muted-foreground">$</span>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.editableAmount || 0}
                                onChange={(e) => handleCustomFieldChange(index, "editableAmount", e.target.value)}
                                className="w-24 text-right"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveCustomItem(index)}
                                title="Remove item"
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

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

