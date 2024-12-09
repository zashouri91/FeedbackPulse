import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useUsers } from '@/lib/hooks/use-users';
import { useSurveys } from '@/lib/hooks/use-surveys';
import { User } from '@/lib/types';

interface EmailSignatureGeneratorProps {
  templateId: string;
  userId?: string;
}

export function EmailSignatureGenerator({ templateId, userId }: EmailSignatureGeneratorProps) {
  const [open, setOpen] = useState(false);
  const { users } = useUsers();
  const { templates } = useSurveys();
  const user = users.find(u => u.id === userId) || users[0];
  const template = templates?.find(t => t.id === templateId);

  // Force re-render when template changes
  const [signatureKey, setSignatureKey] = useState(0);
  useEffect(() => {
    setSignatureKey(prev => prev + 1);
  }, [template?.rating_type, template?.updated_at]);

  const generateSignatureHtml = (user: User) => {
    if (!template) {
      console.warn('No template found for ID:', templateId);
      return '';
    }

    const baseUrl = window.location.origin;
    const surveyUrl = `${baseUrl}/survey/${templateId}?userId=${user.id}`;

    // Build contact info section only if data exists
    const contactInfo = [
      user.email && `<div>Email: ${user.email}</div>`,
      user.phone && `<div>Phone: ${user.phone}</div>`,
    ]
      .filter(Boolean)
      .join('\n          ');

    // Generate rating options based on template type
    const getRatingOptions = () => {
      console.log('Generating rating options for type:', template.rating_type);

      switch (template.rating_type) {
        case 'stars':
          return Array.from({ length: 5 }, (_, i) => i + 1)
            .map(
              rating => `
            <a href="${surveyUrl}&rating=${rating}" style="text-decoration: none; margin-right: 5px;">
              <span style="font-size: 20px; color: #f59e0b;">★</span>
            </a>
          `
            )
            .join('');
        case 'numeric':
          return Array.from({ length: 5 }, (_, i) => i + 1)
            .map(
              rating => `
            <a href="${surveyUrl}&rating=${rating}" style="text-decoration: none; margin-right: 5px;">
              <span style="font-size: 20px; color: #6b7280;">${rating}</span>
            </a>
          `
            )
            .join('');
        case 'emoji':
        default:
          return `
            <a href="${surveyUrl}&rating=1" style="text-decoration: none; margin-right: 5px;">
              <span style="font-size: 20px; color: #ef4444;">☹</span>
            </a>
            <a href="${surveyUrl}&rating=3" style="text-decoration: none; margin-right: 5px;">
              <span style="font-size: 20px; color: #f59e0b;">😐</span>
            </a>
            <a href="${surveyUrl}&rating=5" style="text-decoration: none;">
              <span style="font-size: 20px; color: #22c55e;">😊</span>
            </a>
          `;
      }
    };

    return `
      <div style="font-family: Arial, sans-serif; margin-top: 20px; border-left: 3px solid #22c55e; padding-left: 10px;">
        <div style="margin-bottom: 10px;">
          <div style="font-weight: bold; color: #333;">${user.first_name} ${user.last_name}</div>
          <div style="color: #666; font-size: 14px;">${user.title || 'Team Member'}</div>
        </div>
        
        ${
          contactInfo
            ? `
        <div style="margin-bottom: 10px; font-size: 14px; color: #666;">
          ${contactInfo}
        </div>
        `
            : ''
        }

        <div style="margin-top: 15px;">
          <div style="font-size: 14px; color: #666; margin-bottom: 5px;">How did I do?</div>
          <div>
            ${getRatingOptions()}
          </div>
        </div>
      </div>
    `;
  };

  const copySignature = async () => {
    const signatureHtml = generateSignatureHtml(user);

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([signatureHtml], { type: 'text/html' }),
          'text/plain': new Blob([(document.createElement('div').innerHTML = signatureHtml)], {
            type: 'text/plain',
          }),
        }),
      ]);

      toast.success('Signature copied to clipboard!');
      setOpen(false);
    } catch (err) {
      console.error('Failed to copy signature:', err);

      // Fallback for browsers that don't support clipboard.write
      try {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = signatureHtml;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        toast.success('Signature copied to clipboard!');
        setOpen(false);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
        toast.error('Failed to copy signature. Please try a different browser.');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Generate Email Signature
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Email Signature Preview</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card key={signatureKey} className="p-4">
            <div dangerouslySetInnerHTML={{ __html: generateSignatureHtml(user) }} />
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={copySignature}>Copy Signature</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
