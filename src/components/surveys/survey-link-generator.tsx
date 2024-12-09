import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CopyIcon, MailIcon } from 'lucide-react';

type SurveyLinkGeneratorProps = {
  templateId: string;
  assigneeName: string;
};

export function SurveyLinkGenerator({ templateId, assigneeName }: SurveyLinkGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const baseUrl = window.location.origin;
  const surveyUrl = `${baseUrl}/survey/${templateId}`;

  const emailSignature = `
<table>
  <tr>
    <td style="padding-top: 20px; border-top: 1px solid #eee;">
      <p style="margin: 0; font-size: 14px; color: #666;">How was your experience with ${assigneeName}?</p>
      <div style="margin-top: 10px;">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" style="padding: 6px 0;">
              <a href="${surveyUrl}" style="text-decoration: none; color: #0066cc;">Share your feedback</a>
            </td>
          </tr>
        </table>
      </div>
    </td>
  </tr>
</table>
  `.trim();

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-6">
      <Tabs defaultValue="link">
        <TabsList className="mb-4">
          <TabsTrigger value="link">Survey Link</TabsTrigger>
          <TabsTrigger value="signature">Email Signature</TabsTrigger>
        </TabsList>

        <TabsContent value="link">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input value={surveyUrl} readOnly />
              <Button
                variant="outline"
                onClick={() => handleCopy(surveyUrl)}
                className="flex-shrink-0"
              >
                <CopyIcon className="h-4 w-4 mr-2" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                window.open(`mailto:?body=${encodeURIComponent(surveyUrl)}`);
              }}
            >
              <MailIcon className="h-4 w-4 mr-2" />
              Share via Email
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="signature">
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <div dangerouslySetInnerHTML={{ __html: emailSignature }} />
            </div>
            <Button
              variant="outline"
              onClick={() => handleCopy(emailSignature)}
              className="w-full"
            >
              <CopyIcon className="h-4 w-4 mr-2" />
              Copy HTML Signature
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}