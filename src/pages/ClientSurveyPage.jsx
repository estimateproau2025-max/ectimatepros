import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Home, UploadCloud, Check, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const surveyConfig = {
  welcome_title: "Hi there! Welcome to EstiMate",
  welcome_subtitle: "Let's get started on your bathroom renovation estimate",
  welcome_info: "Your builder wants to provide you with an estimate and needs to collect some basic information about your bathroom renovation.",
  steps: [
    {
      step: 1,
      title: "Contact Information",
      fields: [
        { id: "full_name", label: "Your Name *", type: "text", placeholder: "Enter your full name" },
        { id: "phone_number", label: "Your Contact Number *", type: "text", placeholder: "Enter your phone number" }
      ]
    },
    {
      step: 2,
      title: "Bathroom Measurements",
      fields: [
        { 
          id: "measurement_type", type: "radio_toggle", options: [
            { value: "direct", label: "Enter total size directly", sublabel: "If you know the total square meters" },
            { value: "calculate", label: "Let us calculate it for you", sublabel: "Enter individual measurements" }
          ],
          width: "full"
        },
        { id: "total_size", label: "Total Size (square meters) *", type: "text", placeholder: "e.g., 12.5", condition: { field: "measurement_type", value: "direct" }, width: "full" }
      ]
    },
    {
      step: 3,
      title: "Property Details",
      fields: [
        { id: "property_type", label: "Please select one option *", type: "radio", options: ["House or Unit", "Apartment", "Other / Not sure"], width: "full" },
        { id: "home_age", label: "Age of Home *", type: "radio", options: ["Less than 10 years old", "10-30 years old", "30-50 years old", "Over 50 years old", "Not sure"], width: "full" }
      ]
    },
    {
      step: 4,
      title: "Tile Preference and Design Choices",
      fields: [
        { id: "tile_preference", label: "Please select one option *", type: "radio", options: [
            { value: "budget", label: "Budget", "sublabel": "Tiles in wet areas only" },
            { value: "standard", label: "Standard", "sublabel": "Tiles in wet areas PLUS certain areas as feature wall" },
            { value: "premium", label: "Premium", "sublabel": "Floor to ceiling tiles" }
        ], width: "full"},
        { id: "include_tiles", label: "Would you like for the tiles to be included in the estimate? *", type: "radio_toggle", options: [
            { value: "no", label: "No, thank you", "sublabel": "I will supply my own tiles" },
            { value: "yes", label: "Yes, please!", "sublabel": "Include in the estimate" }
        ], width: "full"}
      ]
    },
    {
      step: 5,
      title: "Structural Changes",
      fields: [
        { id: "toilet_move", label: "Will the toilet stay where it is, or be moved? *", type: "radio", options: [
            { value: "stay", label: "Toilet will remain the same location" },
            { value: "move", label: "Toilet will change location", "sublabel": "Moving plumbing may affect estimate accuracy and require additional consultation." }
        ], width: "full"},
        { id: "wall_change", label: "Will you be knocking down or shifting a wall? *", type: "radio", options: [
            { value: "no", label: "No" },
            { value: "yes", label: "Yes", "sublabel": "Structural changes may require additional permits and engineering consultation." }
        ], width: "full"}
      ]
    },
    {
      step: 6,
      title: "Photo/Video Upload",
      fields: [
        { id: "file_upload", label: "Please upload your photos/video (max 10 photos, no larger than 20MB per file)", type: "file_drop", width: "full" }
      ]
    }
  ],
  submit_button_text: "Get My Estimate"
};

const SurveyStep = ({ step, title, children }) => (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-start mb-6">
        <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white font-bold mr-4">{step}</div>
        <h2 className="text-2xl font-semibold text-gray-800 pt-1">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children}
      </div>
    </div>
  );

const RadioToggle = ({ options, value, onValueChange, fieldId }) => (
  <RadioGroup value={value} onValueChange={onValueChange} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {options.map(option => (
      <Label key={option.value} htmlFor={`${fieldId}-${option.value}`} className={`flex flex-col items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${value === option.value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
        <div className="flex items-center justify-between w-full">
          <div className="text-sm font-semibold">{option.label}</div>
          <RadioGroupItem value={option.value} id={`${fieldId}-${option.value}`} className="hidden" />
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${value === option.value ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
            {value === option.value && <Check className="w-3 h-3 text-white" />}
          </div>
        </div>
        {option.sublabel && <div className="text-xs text-muted-foreground mt-1">{option.sublabel}</div>}
      </Label>
    ))}
  </RadioGroup>
);

const ClientSurveyPage = () => {
    const { builder } = useAuth();
    const { toast } = useToast();
    const [formData, setFormData] = useState(() => {
        const initialData = {};
        surveyConfig.steps.forEach(step => {
          step.fields.forEach(field => {
            if (field.type === 'radio_toggle') initialData[field.id] = field.options[0].value;
            else if (field.type === 'radio') initialData[field.id] = null;
            else initialData[field.id] = '';
          });
        });
        return initialData;
    });

  const surveyLink = useMemo(() => {
    if (!builder?.surveySlug) return '';
    return `${window.location.origin}/survey/${builder.surveySlug}`;
  }, [builder]);

  const copySurveyLink = async () => {
    if (!surveyLink) {
      toast({
        variant: 'destructive',
        title: 'No survey link yet',
        description: 'Generate a survey link from your dashboard first.',
      });
      return;
    }
    await navigator.clipboard.writeText(surveyLink);
    toast({ title: 'Survey link copied', description: surveyLink });
  };

  const openSurveyLink = () => {
    if (!surveyLink) {
      toast({
        variant: 'destructive',
        title: 'No survey link yet',
        description: 'Generate a survey link from your dashboard first.',
      });
      return;
    }
    window.open(surveyLink, '_blank', 'noopener');
  };

  const handleInputChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "📋 Preview Mode",
      description: "This is a preview of your client survey. Form submissions are disabled.",
    });
  };
  
  const renderField = (field) => {
    const isVisible = !field.condition || formData[field.condition.field] === field.condition.value;
    if (!isVisible) return null;

    const widthClass = field.width === 'full' ? 'md:col-span-2' : '';

    return (
      <div key={field.id} className={widthClass}>
        {(() => {
          switch (field.type) {
            case 'text':
              return (
                <div>
                  <Label htmlFor={field.id} className="font-semibold text-gray-700">{field.label}</Label>
                  <Input id={field.id} type="text" placeholder={field.placeholder} value={formData[field.id]} onChange={(e) => handleInputChange(field.id, e.target.value)} className="mt-1" />
                </div>
              );
            case 'radio_toggle':
                return (
                    <div>
                      {field.label && <Label className="mb-2 block font-semibold text-gray-700">{field.label}</Label>}
                      <RadioToggle fieldId={field.id} options={field.options} value={formData[field.id]} onValueChange={(value) => handleInputChange(field.id, value)} />
                    </div>
                );
            case 'radio':
              return (
                <div>
                  <Label className="font-semibold text-gray-700">{field.label}</Label>
                  <RadioGroup value={formData[field.id]} onValueChange={(value) => handleInputChange(field.id, value)} className="mt-2 space-y-3">
                    {field.options.map((option, index) => {
                      const optionValue = typeof option === 'string' ? option : option.value;
                      const optionLabel = typeof option === 'string' ? option : option.label;
                      const optionSublabel = typeof option === 'string' ? null : option.sublabel;
                      return (
                        <Label key={index} htmlFor={`${field.id}_${index}`} className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50 transition-colors">
                          <RadioGroupItem value={optionValue} id={`${field.id}_${index}`} />
                          <div className="ml-3 -mt-1">
                            <span className="font-medium text-gray-800">{optionLabel}</span>
                            {optionSublabel && <p className="text-sm text-muted-foreground">{optionSublabel}</p>}
                          </div>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                </div>
              );
            case 'file_drop':
              return (
                <div>
                  <Label className="font-semibold text-gray-700">{field.label}</Label>
                  <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-10">
                    <div className="text-center">
                      <UploadCloud className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                      <div className="mt-4 flex text-sm leading-6 text-gray-600">
                        <Label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-orange-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-600 focus-within:ring-offset-2 hover:text-orange-500">
                          <span>Drop your files here or click to browse</span>
                          <Input id="file-upload" name="file-upload" type="file" className="sr-only" multiple disabled />
                        </Label>
                      </div>
                      <p className="text-xs leading-5 text-gray-600">Supports images and videos up to 20MB each</p>
                    </div>
                  </div>
                </div>
              );
            default: return null;
          }
        })()}
      </div>
    );
  };
  
  return (
    <>
      <Helmet>
        <title>Client Survey Preview - EstiMate Pro</title>
        <meta name="description" content="This is a preview of the survey your clients will fill out to generate an estimate." />
      </Helmet>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="bg-gray-50 -m-4 sm:-m-6 p-4 sm:p-6 lg:p-8 flex justify-center">
        <div className="max-w-4xl w-full bg-white rounded-lg p-6 sm:p-10">
          <div className="text-center mb-10">
            <div className="inline-block p-3 bg-orange-100 rounded-full mb-4">
                <Home className="h-8 w-8 text-orange-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{surveyConfig.welcome_title}</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">{surveyConfig.welcome_subtitle}</p>
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm max-w-3xl mx-auto">
                {surveyConfig.welcome_info}
            </div>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Client-facing link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Share this link with clients so they can complete the live survey. You can also open it in a new tab to test the experience.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input value={surveyLink || 'Generate a survey link on the dashboard first'} readOnly />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={copySurveyLink}>
                    <LinkIcon className="mr-2 h-4 w-4" /> Copy
                  </Button>
                  <Button type="button" onClick={openSurveyLink} disabled={!surveyLink}>
                    <ExternalLink className="mr-2 h-4 w-4" /> Open
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-8">
            {surveyConfig.steps.map(step => (
                <SurveyStep key={step.step} step={step.step} title={step.title}>
                    {step.fields.map(field => renderField(field))}
                </SurveyStep>
            ))}
            <div className="text-center pt-6">
                <Button type="submit" size="lg" className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto" disabled>
                    <Check className="mr-2 h-5 w-5" />
                    {surveyConfig.submit_button_text}
                </Button>
                <p className="text-xs text-muted-foreground mt-3">Please complete all required fields to submit your estimate request.</p>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
};

export default ClientSurveyPage;