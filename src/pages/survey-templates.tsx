import { useState, useEffect } from 'react';
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
import { EmailSignatureGenerator } from '@/components/surveys/email-signature-generator';
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
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function SurveyTemplatesPage() {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<SurveyTemplate | null>(null);
  const { templates, isLoading, deleteTemplate } = useSurveys();
  const { users } = useUsers();

  const handleEdit = (template: SurveyTemplate) => {
    const preparedTemplate = {
      ...template,
      assigned_users: template.assigned_users || [],
      assigned_groups: template.assigned_groups || [],
      assigned_locations: template.assigned_locations || [],
    };
    setEditingTemplate(preparedTemplate);
    setOpen(true);
  };

  const handleDelete = async (templateId: string) => {
    try {
      await deleteTemplate.mutateAsync(templateId);
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Survey Templates</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create Template</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] sm:max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create Template'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <SurveyTemplateEditor
                key={editingTemplate?.id || 'new'} // Force re-render on template change
                initialData={editingTemplate}
                onSuccess={() => {
                  setOpen(false);
                  setEditingTemplate(null);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map(template => (
          <Card key={template.id} className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{template.name}</h3>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(template)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog open={deleteDialogOpen && templateToDelete === template.id}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deleteTemplate.isPending}
                      onClick={() => {
                        setTemplateToDelete(template.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Template</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this template? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={() => {
                          setDeleteDialogOpen(false);
                          setTemplateToDelete(null);
                        }}
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        disabled={deleteTemplate.isPending}
                        onClick={() => handleDelete(template.id)}
                      >
                        {deleteTemplate.isPending ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Share Template</div>
              <div className="space-y-2">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {user.first_name} {user.last_name}
                    </span>
                    <EmailSignatureGenerator templateId={template.id} userId={user.id} />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
