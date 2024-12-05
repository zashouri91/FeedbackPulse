import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTemplates } from '@/lib/hooks/use-templates';
import { TemplateEditor } from './template-editor';
import { PlusIcon, Pencil2Icon, TrashIcon } from '@radix-ui/react-icons';
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

export function TemplateList() {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const { templates, createTemplate, updateTemplate, deleteTemplate } = useTemplates();

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setEditorOpen(true);
  };

  const handleSave = async (data: any) => {
    if (editingTemplate) {
      await updateTemplate.mutateAsync({ id: editingTemplate.id, ...data });
    } else {
      await createTemplate.mutateAsync(data);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteTemplate.mutateAsync(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Survey Templates</h3>
        <Button onClick={() => {
          setEditingTemplate(null);
          setEditorOpen(true);
        }}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium">{template.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(template)}
                >
                  <Pencil2Icon className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <TrashIcon className="h-4 w-4" />
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
            <div className="text-sm text-muted-foreground">
              {template.questions?.length ?? 0} questions
            </div>
          </Card>
        ))}
      </div>

      <TemplateEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSave={handleSave}
        initialData={editingTemplate}
      />
    </div>
  );
}