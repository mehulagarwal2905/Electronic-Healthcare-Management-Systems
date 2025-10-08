import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Issue } from '@/lib/normalizePrescription';

interface IssueBannerProps {
  issues: Issue[];
}

export function IssueBanner({ issues }: IssueBannerProps) {
  if (issues.length === 0) return null;

  const criticalIssues = issues.filter(issue => issue.code === 'missing' || issue.code === 'invalid');
  const warningIssues = issues.filter(issue => issue.code === 'ambiguous');

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-1">
          <p className="font-semibold">
            Some fields have low confidence or are incomplete—please review before creating the prescription.
          </p>
          {criticalIssues.length > 0 && (
            <div>
              <p className="text-sm font-medium">Critical issues:</p>
              <ul className="text-sm list-disc list-inside ml-2">
                {criticalIssues.slice(0, 3).map((issue, index) => (
                  <li key={index}>{issue.note}</li>
                ))}
                {criticalIssues.length > 3 && (
                  <li>...and {criticalIssues.length - 3} more</li>
                )}
              </ul>
            </div>
          )}
          {warningIssues.length > 0 && (
            <div>
              <p className="text-sm font-medium">Warnings:</p>
              <ul className="text-sm list-disc list-inside ml-2">
                {warningIssues.slice(0, 2).map((issue, index) => (
                  <li key={index}>{issue.note}</li>
                ))}
                {warningIssues.length > 2 && (
                  <li>...and {warningIssues.length - 2} more</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
