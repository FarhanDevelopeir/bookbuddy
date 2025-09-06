import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { X, Mail, CheckCircle, MessageCircle, Eye } from 'lucide-react';
import { AlertTriangle, BookOpen, Clock, User, CheckCircle2 } from 'lucide-react';

const UserWarningDialog = ({
  isDialogOpen,
  setIsDialogOpen,
  selectedWarning,
  handleContactAdmin,
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <AlertTriangle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (severity) {
      case 'high':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'medium':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'low':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusBadge = (warning) => {
    if (warning.status === 'resolved') {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Resolved
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
        <Clock className="h-3 w-3 mr-1" />
        Active
      </Badge>
    );
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-2xl w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {selectedWarning && (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  {getSeverityIcon(selectedWarning.severity)}
                </div>
              )}
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Warning Details
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mt-1">
                  Review this warning about your account
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {selectedWarning && (
          <div className="space-y-4 sm:space-y-6 pt-2 max-h-[60vh] overflow-y-auto">
            {/* Warning Message */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-gray-900">Warning Message</h4>
              </div>
              <div className="rounded-lg border bg-gray-50 p-3 sm:p-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selectedWarning.message}
                </p>
              </div>
            </div>

            {/* Warning Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-gray-500" />
                  <h4 className="text-sm font-medium text-gray-900">Warning Information</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Severity:</span>
                    <Badge variant="outline" className={`${getSeverityBadge(selectedWarning.severity)} text-xs`}>
                      {selectedWarning.severity}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    {getStatusBadge(selectedWarning)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Issued:</span>
                    <span className="text-gray-900">{formatDate(selectedWarning.createdAt)}</span>
                  </div>
                  {selectedWarning.status === 'resolved' && selectedWarning.resolvedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Resolved:</span>
                      <span className="text-gray-900">{formatDate(selectedWarning.resolvedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Related Book Information */}
              {selectedWarning.bookId && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    <h4 className="text-sm font-medium text-gray-900">Related Book</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Book Title:</span>
                      <span className="font-medium text-gray-900 text-right">
                        {selectedWarning.bookId?.title || 'Unknown Book'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-mono text-xs text-gray-700">
                        ${selectedWarning.bookId.price}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Year:</span>
                      <span className="font-mono text-xs text-gray-700">
                        {selectedWarning.bookId.year}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span className="font-mono text-xs text-gray-700">
                        {selectedWarning.bookId.department}
                      </span>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* Action Required Section */}
            {selectedWarning.status !== 'resolved' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <Eye className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">Action Required</h4>
                    <p className="text-sm text-blue-700">
                      {selectedWarning.bookId
                        ? "Please review the issue with your book and make the necessary corrections. Once you've fixed the problem, notify admin."
                        : "Please review this warning and take the necessary action. Once you've addressed the issue, notify admin."
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedWarning.response && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">Your Response</h4>
                <div className="rounded-lg border bg-green-50 p-3">
                  <p className="text-sm text-green-700 leading-relaxed">
                    {selectedWarning.response}
                  </p>
                  {selectedWarning.respondedAt && (
                    <p className="text-xs text-green-600 mt-2">
                      Submitted: {formatDate(selectedWarning.respondedAt)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 pt-4 flex flex-row overflow-x-auto py-2">
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            className="shrink-0 text-xs px-3 py-1 h-8 sm:text-sm sm:px-4 sm:py-2 sm:h-9"
          >
            <X className="h-3 w-3 mr-1 sm:h-4 sm:w-4 sm:mr-2" />
            Close
          </Button>

          {selectedWarning?.status !== 'resolved' && (
            <>
              <Button
                onClick={() => {
                  handleContactAdmin(selectedWarning);
                  setIsDialogOpen(false);
                }}
                className="bg-green-600 hover:bg-green-700 shrink-0 text-xs px-3 py-1 h-8 sm:text-sm sm:px-4 sm:py-2 sm:h-9"
              >
                <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                {selectedWarning?.response ? "Already Responded" : "Contact Admin"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserWarningDialog;