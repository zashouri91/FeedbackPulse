import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusIcon, SaveIcon } from 'lucide-react';
import { useState } from 'react';

const defaultTemplates = [
  {
    id: 'customer-satisfaction',
    name: 'Customer Satisfaction',
    description: 'Basic customer satisfaction survey',
  },
  {
    id: 'service-feedback',
    name: 'Service Feedback',
    description: 'Collect feedback about service quality',
  },
  {
    id: 'product-feedback',
    name: 'Product Feedback',
    description: 'Gather feedback about product experience',
  },
];

export function SurveyTemplates() {
  const [templates, setTemplates] = useState(defaultTemplates);
  const [newTemplate, setNewTemplate] = useState({ name: '', description: '' });

  const handleSaveTemplate = () => {
    if (!newTemplate.name) return;

    setTemplates([
      ...templates,
      {
        id: `template-${Date.now()}`,
        ...newTemplate,
      },
    ]);
    setNewTemplate({ name: '', description: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Survey Templates</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={newTemplate.name}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newTemplate.description}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, description: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleSaveTemplate} className="w-full">
                <SaveIcon className="h-4 w-4 mr-2" />
                Save Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {templates.map((template) => (
          <Card
            key={template.id}
            className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h4 className="font-medium mb-2">{template.name}</h4>
            <p className="text-sm text-muted-foreground">
              {template.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}