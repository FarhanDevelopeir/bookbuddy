"use client";

import React, { useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Clock,
  Eye,
  Filter,
  Info,
  MessageCircle,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const UserWarningsContent = ({
  warnings,
  statusFilter,
  setStatusFilter,
  searchTerm,
  setSearchTerm,
  showFilters,
  setShowFilters,
  handleViewDetails,
  handleContactAdmin,
}) => {
  const filteredWarnings = useMemo(() => {
    let filtered = warnings;

    if (statusFilter !== "all") {
      filtered = filtered.filter((w) => w.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.message?.toLowerCase().includes(searchLower) ||
          w.title?.toLowerCase().includes(searchLower) ||
          w.bookId?.title?.toLowerCase().includes(searchLower) ||
          w.severity?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [warnings, statusFilter, searchTerm]);

  const getSeverityIcon = (severity) => {
    const classes = "h-5 w-5";
    switch (severity) {
      case "high":
        return <AlertTriangle className={`${classes} text-red-500`} />;
      case "medium":
        return <AlertTriangle className={`${classes} text-yellow-500`} />;
      case "low":
        return <AlertTriangle className={`${classes} text-blue-500`} />;
      default:
        return <AlertTriangle className={`${classes} text-gray-500`} />;
    }
  };

  const getSeverityBadge = (severity) => {
    const base =
      "px-2 py-0.5 rounded-full text-xs font-medium border flex items-center";
    switch (severity) {
      case "high":
        return `${base} bg-red-100 text-red-800 border-red-200`;
      case "medium":
        return `${base} bg-yellow-100 text-yellow-800 border-yellow-200`;
      case "low":
        return `${base} bg-blue-100 text-blue-800 border-blue-200`;
      default:
        return `${base} bg-gray-100 text-gray-800 border-gray-200`;
    }
  };

  const getStatusBadge = (status) =>
    status === "resolved" ? (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Resolved
      </span>
    ) : (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Active
      </span>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Warnings & Notices
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Review warnings and notices about your account activity
          </p>
        </div>

        <div className="flex flex-row justify-between item-center text-xs md:text-sm text-gray-600">
          <div className="flex gap-3 mt-2">
            <span>Total: {warnings.length}</span>
            <span>
              Active: {warnings.filter((w) => w.status === "active").length}
            </span>
          </div>
          <div className="sm:hidden mb-0">
            <Input
              placeholder="Search warnings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 text-xs w-full"
            />
          </div>
        </div>
      </div>

      {/* Card Container */}
      <Card className="!pt-0 h-[calc(100vh-160px)] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between gap-1 border-b p-3  md:p-4 bg-gray-50">
          <CardTitle className="text-sm md:text-base font-medium text-gray-700">
            Your Warnings
          </CardTitle>

          {/* Desktop filters */}
          <div className="hidden sm:flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Search warnings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 text-xs w-32 md:w-44"
            />
          </div>
          <div className="sm:hidden">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        {/* Warnings List */}
        <CardContent className="flex-1 overflow-y-auto p-2 pt-0 space-y-2">
          {filteredWarnings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="bg-blue-50 p-4 rounded-full mb-4">
                <Info className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-gray-600 font-medium text-sm md:text-base">
                No warnings found
              </p>
              <p className="text-gray-400 text-xs md:text-sm mt-1">
                {statusFilter === "resolved"
                  ? "You don't have any resolved warnings"
                  : "You're all caught up! No active warnings"}
              </p>
            </div>
          ) : (
            filteredWarnings.map((warning) => (
              <Card
                key={warning._id}
                className="border border-gray-200 !py-4 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <CardContent className="flex flex-col sm:flex-row items-start justify-between gap-3 px-3">
                  {/* Left side */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50">
                      {getSeverityIcon(warning.severity)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xs font-semibold text-gray-900">
                          {warning.title || "System Warning"}
                        </h3>
                        <span className={getSeverityBadge(warning.severity)}>
                          {warning.severity.charAt(0).toUpperCase() +
                            warning.severity.slice(1)}
                        </span>
                        {getStatusBadge(warning.status)}
                        {warning?.response && warning?.status === "active" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-100 text-green-700 border border-green-200">
                            Responded
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-700 line-clamp-2">
                        {warning.message}
                      </p>
                    </div>
                  </div>

                  {/* Right side actions */}
                  <div className="shrink-0 flex gap-2 w-full sm:w-auto justify-end">
                    {warning.status === "active" ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs font-medium h-7 px-2"
                          >
                            Action <ChevronDown className="h-3 w-3 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-44" align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(warning)}
                          >
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleContactAdmin(warning)}
                            disabled={warning.response}
                          >
                            <MessageCircle className="mr-2 h-4 w-4" /> 
                            {warning.response ? "Already Responded" : "Notify Admin"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(warning)}
                        className="text-xs font-medium h-7 px-2"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserWarningsContent;
