import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SurveyTemplateEditor } from '@/components/surveys/survey-template-editor';
import { useSurveys } from '@/lib/hooks/use-surveys';
import { Card } from '@/components/ui/card';
import { SurveyLinkGenerator } from '@/components/surveys/survey-link-generator';
import { useUsers } from '@/lib/hooks/use-users';
import { Pencil, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SurveyTemplatesPage() {
  const [open, setOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const { templates, isLoading, updateTemplate, deleteTemplate } = useSurveys();
  const { users } = useUsers();

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setOpen(true);
  };

  const handleDelete = async (templateId) => {
    try {
      await deleteTemplate.mutateAsync(templateId);
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Survey Templates</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTemplate(null)}>
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Edit Survey Template' : 'Create Survey Template'}
              </DialogTitle>
            </DialogHeader>
            <SurveyTemplateEditor 
              onSuccess={() => setOpen(false)} 
              initialData={editingTemplate}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{template.name}</h3>
                {template.description && (
                  <p className="text-muted-foreground">{template.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(template)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Template</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this template? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(template.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Rating Type:</span>{' '}
                {template.rating_type}
              </div>
              <div className="text-sm">
                <span className="font-medium">Scale:</span>{' '}
                {template.scale_min} - {template.scale_max}
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Share Template</h4>
              <div className="space-y-2">
                {users.map((user) => (
                  <SurveyLinkGenerator
                    key={user.id}
                    templateId={template.id}
                    assigneeName={`${user.first_name} ${user.last_name}`}
                  />
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
