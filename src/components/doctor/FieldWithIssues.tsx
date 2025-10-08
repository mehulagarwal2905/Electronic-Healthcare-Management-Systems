import React from 'react';
import { cn } from '@/lib/utils';
import { Issue, hasIssues, getIssuesForField } from '@/lib/normalizePrescription';

interface FieldWithIssuesProps {
  children: React.ReactElement;
  issues: Issue[];
  fieldPath: string;
  className?: string;
}

export function FieldWithIssues({ children, issues, fieldPath, className }: FieldWithIssuesProps) {
  const fieldIssues = getIssuesForField(issues, fieldPath);
  const hasFieldIssues = fieldIssues.length > 0;

  return (
    <div className="space-y-1">
      {React.cloneElement(children, {
        className: cn(
          children.props.className,
          hasFieldIssues && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )
      })}
      {hasFieldIssues && (
        <div className="text-xs text-red-600 space-y-1">
          {fieldIssues.map((issue, index) => (
            <div key={index}>{issue.note}</div>
          ))}
        </div>
      )}
    </div>
  );
}
