import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Send, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { toast } from "sonner";

const ContactAdminDialog = ({
  isOpen,
  onClose,
  warning,
  onSubmit
}) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!message.trim()) return;
  setIsSubmitting(true);
  try {
    if (!warning || !warning._id) {
      throw new Error("Cannot submit response: Invalid warning data");
    }
    
    await onSubmit(warning, message.trim());
    setMessage('');
    onClose();
  } catch (error) {
    toast.error(error.message);
  } finally {
    setIsSubmitting(false);
  }
};

  const handleClose = () => {
    setMessage('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Respond to Warning
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Submit your response to this warning
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium text-gray-900">
              Your Message
            </label>
            <Textarea
              id="message"
              placeholder="Explain your situation or provide additional context about this warning..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] resize-none"
              required
            />
            <p className="text-xs text-gray-500">
              Please be specific about which warning you're referring to and what assistance you need.
            </p>
          </div>

          {warning && (
            <div className="rounded-lg bg-gray-50 p-3">
              <h4 className="text-xs font-medium text-gray-700 mb-1">Regarding Warning:</h4>
              <p className="text-sm text-gray-600">
                {warning.message}
              </p>
              {warning.bookId && (
                <p className="text-xs text-gray-500 mt-1">
                  Book: {typeof warning.bookId === 'object' ? warning.bookId.title : 'Related Book'}
                </p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="shrink-0"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!message.trim() || isSubmitting}
              className="shrink-0"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactAdminDialog;