import React, { useEffect, useState, useMemo } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/apiClient";
import {
  Loader2,
  RefreshCcw,
  Users,
  FileText,
  ToggleLeft,
  ToggleRight,
  Search,
} from "lucide-react";

const AdminDashboardPage = () => {
  const { toast } = useToast();
  const [summary, setSummary] = useState(null);
  const [builders, setBuilders] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [builderFilter, setBuilderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, buildersRes, leadsRes] = await Promise.all([
        apiClient.get("/admin/summary"),
        apiClient.get("/admin/builders"),
        apiClient.get("/admin/leads"),
      ]);
      setSummary(summaryRes.summary);
      setBuilders(buildersRes.builders || []);
      setLeads(leadsRes.leads || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error loading admin data",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredBuilders = useMemo(() => {
    let filtered = builders;
    if (subscriptionFilter !== "all") {
      filtered = filtered.filter((b) => b.subscriptionStatus === subscriptionFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.businessName?.toLowerCase().includes(term) ||
          b.email?.toLowerCase().includes(term)
      );
    }
    return filtered;
  }, [builders, subscriptionFilter, searchTerm]);

  const filteredLeads = useMemo(() => {
    let filtered = leads;
    if (builderFilter !== "all") {
      filtered = filtered.filter(
        (l) => l.builder?._id?.toString() === builderFilter
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((l) => l.status === statusFilter);
    }
    return filtered;
  }, [leads, builderFilter, statusFilter]);

  const toggleBuilderAccess = async (builderId, currentStatus) => {
    try {
      await apiClient.patch(`/admin/builders/${builderId}/access`, {
        isAccessDisabled: !currentStatus,
      });
      toast({
        title: "Access updated",
        description: `Builder access ${!currentStatus ? "disabled" : "enabled"}`,
      });
      await fetchData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating access",
        description: error.message,
      });
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      trialing: "bg-blue-100 text-blue-800",
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      past_due: "bg-yellow-100 text-yellow-800",
    };
    return colors[status] || colors.inactive;
  };

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
        <title>Admin Dashboard - EstiMate Pro</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage builders, view platform activity, and monitor subscriptions.
            </p>
          </div>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Builders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                {summary?.builderCount || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Active Builders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                {summary?.activeBuilders || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                {summary?.leadCount || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Builders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search builders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <select
                  className="rounded-md border border-gray-200 px-3 py-2"
                  value={subscriptionFilter}
                  onChange={(e) => setSubscriptionFilter(e.target.value)}
                >
                  <option value="all">All statuses</option>
                  <option value="trialing">Trialing</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="past_due">Past Due</option>
                </select>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                        Business
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                        Access
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredBuilders.map((builder) => (
                      <tr key={builder._id || builder.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">
                          {builder.businessName || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {builder.email}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={getStatusBadge(builder.subscriptionStatus)}
                          >
                            {builder.subscriptionStatus || "inactive"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              toggleBuilderAccess(
                                builder._id || builder.id,
                                builder.isAccessDisabled
                              )
                            }
                          >
                            {builder.isAccessDisabled ? (
                              <ToggleLeft className="h-5 w-5 text-red-600" />
                            ) : (
                              <ToggleRight className="h-5 w-5 text-green-600" />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Leads</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <select
                  className="rounded-md border border-gray-200 px-3 py-2 flex-1"
                  value={builderFilter}
                  onChange={(e) => setBuilderFilter(e.target.value)}
                >
                  <option value="all">All builders</option>
                  {builders.map((b) => (
                    <option key={b._id || b.id} value={b._id || b.id}>
                      {b.businessName}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-md border border-gray-200 px-3 py-2"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All statuses</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Quote Sent">Quote Sent</option>
                  <option value="Quote Accepted">Quote Accepted</option>
                </select>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                        Client
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                        Builder
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredLeads.map((lead) => (
                      <tr key={lead._id || lead.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">
                          {lead.clientName || "Unknown"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {lead.builder?.businessName || "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{lead.status || "New"}</Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {lead.createdAt
                            ? new Date(lead.createdAt).toLocaleDateString()
                            : "--"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </>
  );
};

export default AdminDashboardPage;



