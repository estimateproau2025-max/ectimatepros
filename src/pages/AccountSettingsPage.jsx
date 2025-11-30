import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Save,
  Edit,
  KeyRound,
  Building,
  User,
  Mail,
  Phone,
  Bell,
  CreditCard,
  XCircle,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";

const InfoField = ({ icon, label, value }) => (
  <div>
    <Label className="text-xs text-muted-foreground">{label}</Label>
    <div className="flex items-center mt-1">
      {icon}
      <p className="ml-3 text-sm">{value || "Not set"}</p>
    </div>
  </div>
);

const AccountSettingsPage = () => {
  const { builder, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profile, setProfile] = useState({
    business_name: "",
    full_name: "",
    phone_number: "",
  });
  const [subscription, setSubscription] = useState({
    status: "",
    trial_ends_at: null,
  });

  const fetchProfile = useCallback(async () => {
    if (!builder) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.get("/builders/me");
      const builderData = response.builder;
      setProfile({
        full_name: builderData.contactName || builderData.businessName || "",
        business_name: builderData.businessName || "",
        phone_number: builderData.phone || "",
      });
      setSubscription({
        status: builderData.subscriptionStatus,
        trial_ends_at: builderData.trialEndsAt,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching profile",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [builder, toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put("/builders/me", {
        businessName: profile.business_name,
        phone: profile.phone_number,
        contactName: profile.full_name,
      });
      await refreshProfile();
      toast({ title: "Profile updated successfully!" });
      setIsEditingProfile(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const openCheckout = async () => {
    try {
      const response = await apiClient.post("/billing/checkout");
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unable to start checkout",
        description: error.message,
      });
    }
  };

  const openPortal = async () => {
    try {
      const response = await apiClient.post("/billing/portal");
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unable to open billing portal",
        description: error.message,
      });
    }
  };

  const handlePasswordEmail = async (e) => {
    e.preventDefault();
    if (!builder?.email) return;
    setSaving(true);
    try {
      await apiClient.post(
        "/auth/request-password-reset",
        { email: builder.email },
        { skipAuth: true }
      );
      toast({
        title: "Password reset email sent",
        description: "Check your inbox for the reset link.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error sending reset email",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e, setStateFunc) => {
    const { id, value } = e.target;
    setStateFunc(prev => ({...prev, [id]: value}));
  };

  const handleCancelSubscription = async () => {
    try {
      await openPortal();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );

  if (!builder) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-muted-foreground">
          Sign in to manage your account settings.
        </p>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Account Settings - EstiMate Pro</title></Helmet>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {new URLSearchParams(window.location.search).get("checkout") === "success" && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ Payment method added successfully! Your card is now on file.
            </p>
          </div>
        )}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your personal details, security settings, and subscription plan.</p>
        </div>
        <div className="space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Keep your business and contact details up to date.</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setIsEditingProfile(!isEditingProfile)}>
                {isEditingProfile ? <XCircle className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
                {isEditingProfile ? 'Cancel' : 'Edit Profile'}
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {isEditingProfile ? (
                    <>
                      <div><Label htmlFor="business_name">Business Name</Label><Input id="business_name" value={profile.business_name} onChange={(e) => handleInputChange(e, setProfile)} placeholder="Builder Co. Construction" /></div>
                      <div><Label htmlFor="full_name">Your Name</Label><Input id="full_name" value={profile.full_name} onChange={(e) => handleInputChange(e, setProfile)} placeholder="John Builder" /></div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" value={builder.email} disabled />
                      </div>
                      <div><Label htmlFor="phone_number">Phone Number</Label><Input id="phone_number" value={profile.phone_number} onChange={(e) => handleInputChange(e, setProfile)} placeholder="+1 (555) 123-4567" /></div>
                    </>
                  ) : (
                    <>
                      <InfoField icon={<Building className="h-4 w-4 text-muted-foreground" />} label="Business Name" value={profile.business_name} />
                      <InfoField icon={<User className="h-4 w-4 text-muted-foreground" />} label="Your Name" value={profile.full_name} />
                      <InfoField
                        icon={<Mail className="h-4 w-4 text-muted-foreground" />}
                        label="Email Address"
                        value={builder.email}
                      />
                      <InfoField icon={<Phone className="h-4 w-4 text-muted-foreground" />} label="Phone Number" value={profile.phone_number} />
                    </>
                  )}
                </div>
                {isEditingProfile && (
                  <div className="mt-6">
                    <Button type="submit" disabled={saving} className="bg-orange-500 hover:bg-orange-600">
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Changes
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Request a secure link to update your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handlePasswordEmail}
                className="space-y-4 max-w-sm"
              >
                <div>
                  <Label>Email</Label>
                  <Input value={builder.email} disabled />
                </div>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <KeyRound className="mr-2 h-4 w-4" />
                  )}
                  Send Reset Email
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader><CardTitle>Billing & Subscription</CardTitle><CardDescription>Manage your payment details and subscription plan.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-800">
                    Current Plan:{" "}
                    <span className="font-bold text-orange-600">
                      {subscription.status === "trialing"
                        ? "Trial Period"
                        : "Builder Pro"}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {subscription.status === "trialing"
                      ? `Trial ends on: ${
                          subscription.trial_ends_at
                            ? new Date(
                                subscription.trial_ends_at
                              ).toLocaleDateString()
                            : "TBC"
                        }`
                      : "Billing details available in Stripe portal"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Price: {subscription.status === "trialing" ? "$0/mo" : "$49/mo"}
                  </p>
                </div>
                <Button variant="outline" className="w-full justify-start" onClick={openCheckout}><CreditCard className="mr-2 h-4 w-4"/> Add / Update Card</Button>
                <Button variant="outline" className="w-full justify-start" onClick={openPortal}><CreditCard className="mr-2 h-4 w-4"/> Manage Billing in Stripe</Button>
                <Button variant="outline" className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200" onClick={handleCancelSubscription}><XCircle className="mr-2 h-4 w-4"/> Cancel Subscription</Button>
              </CardContent>
            </Card>

             <Card>
              <CardHeader><CardTitle>Notification Preferences</CardTitle><CardDescription>Choose how you receive updates and alerts.</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Email notifications for new leads are automatically enabled. You'll receive an email whenever a client submits a survey.
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      SMS alerts and in-app summaries are coming soon. For now, check your email and dashboard for updates.
                    </p>
                  </div>
              </CardContent>
            </Card>
          </div> */}
        </div>
      </motion.div>
    </>
  );
};

export default AccountSettingsPage;