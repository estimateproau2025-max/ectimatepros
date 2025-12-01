import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Map,
  Phone,
  Home,
  Ruler,
  FileImage,
  Sparkles,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";

const tilingLevels = [
  { value: "Budget", label: "Budget – floor plus splash-zones" },
  { value: "Standard", label: "Standard – feature walls + wet areas" },
  { value: "Premium", label: "Premium – floor to ceiling" },
];

const bathroomTypes = ["House / Unit", "Apartment", "Other"];

const homeAgeOptions = [
  "Less than 10 years",
  "10-30 years",
  "30-50 years",
  "Over 50 years",
  "Not sure",
];

const tilesSupplyOptions = [
  { value: "no_supply_own", label: "No, thank you", sublabel: "I will supply my own tiles" },
  { value: "yes_include", label: "Yes, please!", sublabel: "Include in the estimate" }
];

const toiletOptions = [
  { value: "same_location", label: "Toilet will remain the same location" },
  { value: "change_location", label: "Toilet will change location" }
];

const wallOptions = [
  { value: "no", label: "No" },
  { value: "yes", label: "Yes" }
];

const MAX_FILES = 5;
const CLOUDINARY_CLOUD_NAME = "dgmjg9zr4";
const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "gptimages";

const defaultFormState = {
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  clientSuburb: "",
  floorLength: "",
  floorWidth: "",
  wallHeight: "",
  bathroomType: "",
  tilingLevel: "",
  tilesSupply: "",
  toiletLocation: "",
  wallChanges: "",
  designStyle: "",
  homeAgeCategory: "",
};

const PublicSurveyPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [builder, setBuilder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(defaultFormState);
  const [media, setMedia] = useState([]);

  const hasPendingUploads = media.some((item) => item.status === "uploading");

  const title = useMemo(() => {
    if (!builder) return "Bathroom Estimate Request";
    return `${builder.businessName} • Bathroom Estimate Request`;
  }, [builder]);

  // Calculate areas based on dimensions
  const calculatedAreas = useMemo(() => {
    const floorLength = parseFloat(formData.floorLength) || 0;
    const floorWidth = parseFloat(formData.floorWidth) || 0;
    const wallHeight = parseFloat(formData.wallHeight) || 0;

    const floorArea = floorLength * floorWidth;
    const wallArea = 2 * (floorLength * wallHeight) + 2 * (floorWidth * wallHeight);
    const totalArea = floorArea + wallArea;

    return {
      floorArea: floorArea.toFixed(2),
      wallArea: wallArea.toFixed(2),
      totalArea: totalArea.toFixed(2),
    };
  }, [formData.floorLength, formData.floorWidth, formData.wallHeight]);

  useEffect(() => {
    const fetchBuilder = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/surveys/${slug}`, {
          skipAuth: true,
        });
        setBuilder(response.builder);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Survey unavailable",
          description:
            error.message ||
            "We could not find this survey. Please contact your builder.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchBuilder();
  }, [slug, toast]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const uploadFileToCloudinary = async (file) => {
    // if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    //   throw new Error("Cloudinary configuration missing");
    // }
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    form.append("folder", "estimate-pro/surveys");

    const response = await fetch(url, {
      method: "POST",
      body: form,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || "Cloud upload failed");
    }
    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  };

  const handleFilesChange = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;
    if (selectedFiles.length + media.length > MAX_FILES) {
      toast({
        variant: "destructive",
        title: `Max ${MAX_FILES} files`,
        description: "Please remove a file before adding another.",
      });
      return;
    }
    for (const file of selectedFiles) {
      const tempId = `${file.name}-${Date.now()}`;
      setMedia((prev) => [
        ...prev,
        { id: tempId, name: file.name, status: "uploading" },
      ]);
      try {
        const result = await uploadFileToCloudinary(file);
        setMedia((prev) =>
          prev.map((item) =>
            item.id === tempId
              ? { ...item, status: "ready", url: result.url }
              : item
          )
        );
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: error.message,
        });
        setMedia((prev) => prev.filter((item) => item.id !== tempId));
      }
    }
  };

  const removeFile = (id) => {
    setMedia((prev) => prev.filter((item) => item.id !== id));
  };

  const buildPayload = () => {
    const payload = {
      clientName: formData.clientName,
      clientPhone: formData.clientPhone,
      clientSuburb: formData.clientSuburb,

      bathroomType: formData.bathroomType,
      tilingLevel: formData.tilingLevel,
      tilesSupply: formData.tilesSupply,
      toiletLocation: formData.toiletLocation,
      wallChanges: formData.wallChanges,
      designStyle: formData.designStyle,
      homeAgeCategory: formData.homeAgeCategory,
      photoUrls: media.filter((item) => item.url).map((item) => item.url),
      floorLength: formData.floorLength,
      floorWidth: formData.floorWidth,
      wallHeight: formData.wallHeight,
    };
    if (formData.clientEmail) {
      payload.clientEmail = formData.clientEmail;
    }
    return payload;
  };

  const isFormValid = () => {
    if (!formData.clientName || !formData.clientPhone || !formData.bathroomType) {
      return false;
    }
    if (!formData.tilingLevel || !formData.homeAgeCategory || !formData.tilesSupply) {
      return false;
    }
    if (!formData.toiletLocation || !formData.wallChanges) {
      return false;
    }
    if (!formData.floorLength || !formData.floorWidth || !formData.wallHeight) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isFormValid()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please complete the required fields before submitting.",
      });
      return;
    }
    if (hasPendingUploads) {
      toast({
        variant: "destructive",
        title: "Uploads in progress",
        description: "Please wait for files to finish uploading.",
      });
      return;
    }
    try {
      setSubmitting(true);
      const payload = buildPayload();
      await apiClient.post(`/surveys/${slug}`, payload, { skipAuth: true });
      toast({
        title: "Submission received!",
        description: "Thanks for sharing the details. Your builder will be in touch.",
      });
      navigate("/thank-you");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error submitting survey",
        description: error.message || "Please try again soon.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!builder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle>Survey unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We couldn&apos;t locate this survey link. Please contact your builder directly.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-5xl space-y-8"
        >
          <div className="text-center space-y-3">
            <div className="inline-flex items-center rounded-full bg-orange-100 px-4 py-1 text-orange-700 text-sm font-semibold">
              <Sparkles className="mr-2 h-4 w-4" />
              {builder.businessName}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Bathroom Renovation Estimate
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Share a few details below so we can prepare an accurate quote for your project.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tell us about your space</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-10" onSubmit={handleSubmit}>
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Map className="h-5 w-5 text-orange-500" /> Contact Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Your Name *</Label>
                      <Input
                        value={formData.clientName}
                        onChange={(e) =>
                          handleInputChange("clientName", e.target.value)
                        }
                        // placeholder="Jane Builder"
                        required
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) =>
                          handleInputChange("clientEmail", e.target.value)
                        }
                        // placeholder="you@email.com"
                      />
                    </div>
                    <div>
                      <Label>Phone *</Label>
                      <Input
                        value={formData.clientPhone}
                        onChange={(e) =>
                          handleInputChange("clientPhone", e.target.value)
                        }
                        placeholder="04xx xxx xxx"
                        required
                      />
                    </div>
                    <div>
                      <Label>Suburb *</Label>
                      <Input
                        value={formData.clientSuburb}
                        onChange={(e) =>
                          handleInputChange("clientSuburb", e.target.value)
                        }
                        placeholder="Suburb"
                        required
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Ruler className="h-5 w-5 text-orange-500" /> Measurements
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Floor Length (m) *</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={formData.floorLength}
                          onChange={(e) =>
                            handleInputChange("floorLength", e.target.value)
                          }
                          placeholder="e.g., 3.5"
                          required
                        />
                      </div>
                      <div>
                        <Label>Floor Width (m) *</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={formData.floorWidth}
                          onChange={(e) =>
                            handleInputChange("floorWidth", e.target.value)
                          }
                          placeholder="e.g., 2.8"
                          required
                        />
                      </div>
                      <div>
                        <Label>Wall Height (m) *</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={formData.wallHeight}
                          onChange={(e) =>
                            handleInputChange("wallHeight", e.target.value)
                          }
                          placeholder="e.g., 2.4"
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-base font-semibold text-gray-900 mb-4">
                        Calculated Measurements
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <div className="text-2xl font-bold text-blue-600">
                            {calculatedAreas.floorArea} m²
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Floor Area</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <div className="text-2xl font-bold text-blue-600">
                            {calculatedAreas.wallArea} m²
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Wall Area</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <div className="text-2xl font-bold text-blue-600">
                            {calculatedAreas.totalArea} m²
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Total Area</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Estimate Calculation
                      </h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>Your builder will calculate estimates based on:</p>
                        <ul className="list-disc list-inside ml-2 space-y-1">
                          <li>Base estimate = Sum of all applicable line items</li>
                          <li>High estimate = Base estimate × 1.30</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Home className="h-5 w-5 text-orange-500" /> Home & Style
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Bathroom location *</Label>
                      <div className="mt-2 space-y-2">
                        {bathroomTypes.map((type) => (
                          <label
                            key={type}
                            className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 cursor-pointer has-[:checked]:border-orange-500"
                          >
                            <input
                              type="radio"
                              className="accent-orange-500"
                              checked={formData.bathroomType === type}
                              onChange={() => handleInputChange("bathroomType", type)}
                              required
                            />
                            <span>{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Tiling preference *</Label>
                      <div className="mt-2 space-y-2">
                        {tilingLevels.map((option) => (
                          <label
                            key={option.value}
                            className="flex items-start space-x-3 rounded-lg border border-gray-200 p-3 cursor-pointer has-[:checked]:border-orange-500"
                          >
                            <input
                              type="radio"
                              className="mt-1 accent-orange-500"
                              checked={formData.tilingLevel === option.value}
                              onChange={() =>
                                handleInputChange("tilingLevel", option.value)
                              }
                              required
                            />
                            <div>
                              <p className="font-medium text-gray-900">{option.value}</p>
                              <p className="text-sm text-muted-foreground">
                                {option.label}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Label>Would you like for the tiles to be included in the estimate? *</Label>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {tilesSupplyOptions.map((option) => (
                        <label
                          key={option.value}
                          className={`flex flex-col items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            formData.tilesSupply === option.value
                              ? "border-orange-500 bg-orange-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="text-sm font-semibold">{option.label}</div>
                            <input
                              type="radio"
                              className="accent-orange-500"
                              checked={formData.tilesSupply === option.value}
                              onChange={() =>
                                handleInputChange("tilesSupply", option.value)
                              }
                              required
                            />
                          </div>
                          {option.sublabel && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {option.sublabel}
                            </div>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <Label>Age of home *</Label>
                      <select
                        className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2"
                        value={formData.homeAgeCategory}
                        onChange={(e) =>
                          handleInputChange("homeAgeCategory", e.target.value)
                        }
                        required
                      >
                        <option value="">Select one</option>
                        {homeAgeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Design notes</Label>
                      <Input
                        placeholder="Preferred colours, fittings, style..."
                        value={formData.designStyle}
                        onChange={(e) =>
                          handleInputChange("designStyle", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Home className="h-5 w-5 text-orange-500" /> Structural Changes
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <Label>Will the toilet stay where it is, or be moved? *</Label>
                      <div className="mt-2 space-y-2">
                        {toiletOptions.map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 cursor-pointer has-[:checked]:border-orange-500"
                          >
                            <input
                              type="radio"
                              className="accent-orange-500"
                              checked={formData.toiletLocation === option.value}
                              onChange={() =>
                                handleInputChange("toiletLocation", option.value)
                              }
                              required
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
                        <span className="inline-block mt-0.5">ⓘ</span> Moving plumbing may affect estimate accuracy and require additional consultation.
                      </p>
                    </div>

                    <div>
                      <Label>Will you be knocking down or shifting a wall? *</Label>
                      <div className="mt-2 space-y-2">
                        {wallOptions.map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 cursor-pointer has-[:checked]:border-orange-500"
                          >
                            <input
                              type="radio"
                              className="accent-orange-500"
                              checked={formData.wallChanges === option.value}
                              onChange={() =>
                                handleInputChange("wallChanges", option.value)
                              }
                              required
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
                        <span className="inline-block mt-0.5">ⓘ</span> Structural changes may require additional permits and engineering consultation.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileImage className="h-5 w-5 text-orange-500" /> Photos & videos
                  </h3>
                  <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                    <input
                      id="photos"
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={handleFilesChange}
                    />
                    <label
                      htmlFor="photos"
                      className="cursor-pointer text-orange-600 font-medium"
                    >
                      Click to upload or drag files here
                    </label>
                    <p className="text-xs text-muted-foreground mt-2">
                      Up to {MAX_FILES} files. Each up to 20MB.
                    </p>
                    {media.length > 0 && (
                      <ul className="mt-4 text-left space-y-2">
                        {media.map((file) => (
                          <li
                            key={file.id}
                            className="flex items-center justify-between rounded-md bg-gray-100 px-3 py-2 text-sm"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium truncate">{file.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {file.status === "uploading"
                                  ? "Uploading..."
                                  : "Ready"}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="text-xs text-red-500"
                              onClick={() => removeFile(file.id)}
                              disabled={file.status === "uploading"}
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>

                <div className="sticky bottom-0 bg-white border-t border-gray-100 py-4">
                  <Button
                    type="submit"
                    disabled={submitting || hasPendingUploads}
                    className="w-full bg-orange-500 hover:bg-orange-600"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending details...
                      </>
                    ) : (
                      "Send details to builder"
                    )}
                  </Button>
                  <p className="mt-2 text-xs text-center text-muted-foreground">
                    We&apos;ll email or call you if we need more info.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default PublicSurveyPage;

