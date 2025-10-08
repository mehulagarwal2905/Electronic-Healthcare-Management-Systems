import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Upload } from 'lucide-react';
import { normalizePrescription, NormalizedPrescription, Issue } from '@/lib/normalizePrescription';

interface ApplyMLOutputModalProps {
  onApply: (normalized: NormalizedPrescription, issues: Issue[]) => void;
  children: React.ReactNode;
}

export function ApplyMLOutputModal({ onApply, children }: ApplyMLOutputModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rawJson, setRawJson] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    if (!rawJson.trim()) {
      setError('Please paste the ML output JSON');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const parsed = JSON.parse(rawJson);
      const result = normalizePrescription(parsed);
      
      onApply(result, result.issues);
      setIsOpen(false);
      setRawJson('');
    } catch (err) {
      setError('Invalid JSON format. Please check your input.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setRawJson('');
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Apply ML Output
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ml-json">Paste ML Output JSON</Label>
            <Textarea
              id="ml-json"
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
              placeholder="Paste the raw ML output JSON here..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleApply}
              disabled={isProcessing || !rawJson.trim()}
              className="bg-medconnect-primary hover:bg-medconnect-secondary"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Apply ML Output
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
