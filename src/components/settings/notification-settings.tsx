import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export function NotificationSettings() {
  const handleChange = (key: string, value: boolean) => {
    // Update notification preferences logic here
    toast.success('Notification preferences updated');
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive email notifications for important updates
            </p>
          </div>
          <Switch
            defaultChecked
            onCheckedChange={checked => handleChange('email_notifications', checked)}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Survey Responses</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when you receive new survey responses
            </p>
          </div>
          <Switch
            defaultChecked
            onCheckedChange={checked => handleChange('survey_notifications', checked)}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Weekly Summary</Label>
            <p className="text-sm text-muted-foreground">
              Receive a weekly summary of your feedback
            </p>
          </div>
          <Switch
            defaultChecked
            onCheckedChange={checked => handleChange('weekly_summary', checked)}
          />
        </div>
      </div>
    </Card>
  );
}
