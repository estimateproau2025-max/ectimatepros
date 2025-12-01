import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/apiClient";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Users,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Link as LinkIcon,
  Wrench,
  PlusCircle,
  BarChart2,
  Bell,
  Loader2,
} from "lucide-react";

const StatCard = ({ title, value, change, changeType, icon, loading }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{value}</div>}
        {!loading && change !== null && (
          <p className="text-xs text-muted-foreground flex items-center">
            <span className={`mr-1 flex items-center ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
              {changeType === 'increase' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              {change}%
            </span>
            vs last month
          </p>
        )}
      </CardContent>
    </Card>
);

const RecentLeadsTable = ({ leads, loading }) => {
  const { toast } = useToast();
  const formatEstimateRange = (estimate) => {
    if (!estimate?.baseEstimate) return "--";
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
    });
    return `${formatter.format(estimate.baseEstimate)} – ${formatter.format(
      estimate.highEstimate
    )}`;
  };
  const getStatusBadge = (status) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Contacted":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Quote Sent":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Quote Accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "Client Not Interested":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <Card className="col-span-1 lg:col-span-3 flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>Recent Lead Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {leads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Client</th>
                    <th className="hidden md:table-cell text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Phone</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Estimate</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map((lead) => {
                    const submitted =
                      lead.submittedAt || lead.createdAt || lead.created_at;
                    const status = lead.status || "New";
                    return (
                      <tr key={lead._id || lead.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 whitespace-nowrap">
                          {submitted
                            ? new Date(submitted).toLocaleDateString()
                            : "--"}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-800 whitespace-nowrap">
                          {lead.clientName || lead.client_name || "Unknown"}
                        </td>
                        <td className="hidden md:table-cell py-3 px-4 text-muted-foreground whitespace-nowrap">
                          {lead.clientPhone || lead.client_phone || "--"}
                        </td>
                        <td className="py-3 px-4 text-orange-600 font-medium whitespace-nowrap">
                          {formatEstimateRange(lead.estimate)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={`${getStatusBadge(
                              status
                            )} whitespace-nowrap`}
                          >
                            {status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate("/dashboard/leads")}
                          >
                            Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-800">No leads yet!</h3>
            <p className="text-sm text-muted-foreground mt-1">Share your estimate link to get your first lead.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { builder, refreshProfile } = useAuth();
  const [builderProfile, setBuilderProfile] = useState(null);
  const [stats, setStats] = useState({ leadsCount: 0 });
  const [recentLeads, setRecentLeads] = useState([]);
  const [estimateLink, setEstimateLink] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!builder) return;
    setLoading(true);
    try {
      setBuilderProfile(builder);
      if (builder.surveySlug) {
        setEstimateLink(`${window.location.origin}/survey/${builder.surveySlug}`);
      }

      const leadsResponse = await apiClient.get("/leads");
      const leads = leadsResponse.leads || [];
      const today = new Date();
      const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      const leadsThisMonth = leads.filter((lead) => {
        const submitted = new Date(lead.submittedAt || lead.createdAt);
        return submitted >= firstDayOfMonth;
      }).length;
      setStats({ leadsCount: leadsThisMonth });
      setRecentLeads(leads.slice(0, 5));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching dashboard data",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [builder, toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const generateLink = async () => {
    try {
      if (estimateLink) {
        await navigator.clipboard.writeText(estimateLink);
        toast({
          title: "Link copied to clipboard!",
          description: estimateLink,
        });
        return;
      }
      const response = await apiClient.post("/builders/survey-link/regenerate");
      const slug = response.surveySlug;
      await refreshProfile();
      const newLink = `${window.location.origin}/survey/${slug}`;
      setEstimateLink(newLink);
      await navigator.clipboard.writeText(newLink);
      toast({
        title: "✅ Link Generated & Copied!",
        description: newLink,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error generating link",
        description: error.message,
      });
    }
  };

  const testEstimateTool = () => {
    toast({ 
      title: '⚙️ Test Estimate Tool', 
      description: 'Use the pricing setup page to configure your pricing, then test with the public survey link.' 
    });
  };

  const statsCards = [
    {
      title: "Total Leads This Month",
      value: stats.leadsCount,
      change: null,
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      loading: loading,
    },
    {
      title: "Estimates Generated",
      value: "--",
      change: null,
      icon: <FileText className="h-4 w-4 text-muted-foreground" />,
      loading: loading,
    },
    {
      title: "Pending Follow-ups",
      value: "--",
      change: null,
      icon: <Bell className="h-4 w-4 text-muted-foreground" />,
      loading: loading,
    },
    {
      title: "Conversion Rate",
      value: "--",
      change: null,
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      loading: loading,
    },
  ];

  const builderName =
    builderProfile?.contactName ||
    builderProfile?.businessName ||
    builderProfile?.email;

  return (
    <>
      <Helmet><title>Dashboard - EstiMate Pro</title><meta name="description" content="Manage your leads and estimates." /></Helmet>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {builderName}!</h1>
        </div>
        image.png  {/* <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">{statsCards.map((stat, index) => (<StatCard key={index} {...stat} />))}</div> */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader><CardTitle>Lead Generation Tools</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Generate a unique link to your estimate form or test your current pricing setup.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={generateLink} className="bg-orange-500 hover:bg-orange-600 text-white"><LinkIcon className="mr-2 h-4 w-4" /> {estimateLink ? 'Copy Link' : 'Generate Link'}</Button>
                {/* <Button onClick={testEstimateTool} variant="outline"><Wrench className="mr-2 h-4 w-4" /> Test Tool</Button> */}
              </div>
              {estimateLink && (<div className="mt-4 p-3 bg-gray-100 rounded-md text-sm break-words"><p className="font-medium text-gray-800">Your Link:</p><a href={estimateLink} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">{estimateLink}</a></div>)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button onClick={() => navigate("/dashboard/leads")} variant="secondary" className="justify-start"><PlusCircle className="mr-2 h-4 w-4" />View All Leads</Button>
              <Button onClick={() => navigate("/dashboard/pricing-setup")} variant="secondary" className="justify-start"><BarChart2 className="mr-2 h-4 w-4" />Pricing Setup</Button>
            </CardContent>
          </Card>
        </div>
        <RecentLeadsTable leads={recentLeads} loading={loading} />
      </motion.div>
    </>
  );
};

export default DashboardPage;