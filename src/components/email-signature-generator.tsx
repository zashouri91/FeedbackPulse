import React, { useState, useEffect } from 'react';
import { useEnhancedSurveys } from '../lib/hooks/use-enhanced-surveys';
import { User, SurveyTemplate } from '../lib/types';
import { toast } from 'react-hot-toast';

interface EmailSignatureGeneratorProps {
  user: User;
}

export default function EmailSignatureGenerator({ user }: EmailSignatureGeneratorProps) {
  const { templates, templatesLoading, generateSignature } = useEnhancedSurveys();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Filter templates that this user has access to
  const availableTemplates = templates?.filter(
    template =>
      template.assigned_users.includes(user.id) ||
      template.assigned_groups.some(group => user.groups.includes(group)) ||
      template.assigned_locations.some(location => user.locations.includes(location))
  );

  useEffect(() => {
    if (selectedTemplate) {
      generateSignatureHTML();
    }
  }, [selectedTemplate]);

  const generateSignatureHTML = async () => {
    try {
      const { signature: generatedSignature } = await generateSignature(selectedTemplate, user.id);
      setSignature(generatedSignature);
    } catch (error) {
      toast.error('Failed to generate signature');
      console.error('Signature generation error:', error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(signature);
      toast.success('Signature copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy signature');
      console.error('Copy error:', error);
    }
  };

  if (templatesLoading) {
    return <div className="p-4">Loading templates...</div>;
  }

  if (!availableTemplates?.length) {
    return (
      <div className="p-4 text-gray-500">No survey templates are currently assigned to you.</div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Email Signature Generator</h2>

        {/* Template Selection */}
        <div>
          <label htmlFor="template" className="block text-sm font-medium text-gray-700">
            Select Survey Template
          </label>
          <select
            id="template"
            value={selectedTemplate}
            onChange={e => setSelectedTemplate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a template...</option>
            {availableTemplates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        {/* Preview Controls */}
        {signature && (
          <div className="flex items-center space-x-4">
            <div className="flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setPreviewMode('desktop')}
                className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                  previewMode === 'desktop'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('mobile')}
                className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                  previewMode === 'mobile'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Mobile
              </button>
            </div>

            <button
              onClick={copyToClipboard}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Copy to Clipboard
            </button>
          </div>
        )}

        {/* Signature Preview */}
        {signature && (
          <div className="border rounded-lg p-4 bg-white">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
            <div
              className={`border p-4 rounded ${previewMode === 'mobile' ? 'max-w-[320px]' : ''}`}
            >
              <style>
                {`
                  .signature-preview button {
                    cursor: pointer !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    text-decoration: none !important;
                  }
                  .signature-preview button:hover {
                    transform: scale(1.1) !important;
                  }
                  .signature-preview .rating-btn.numeric {
                    width: 36px !important;
                    height: 36px !important;
                    border-radius: 50% !important;
                    background: #f5f5f5 !important;
                    color: #666 !important;
                  }
                  .signature-preview .rating-btn.star {
                    color: #ffd700 !important;
                  }
                  .signature-preview .rating-btn.emoji {
                    font-size: 20px !important;
                  }
                `}
              </style>
              <div dangerouslySetInnerHTML={{ __html: signature }} className="signature-preview" />
            </div>
          </div>
        )}

        {/* Instructions */}
        {signature && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">How to use this signature</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Click the "Copy to Clipboard" button above</li>
              <li>Open your email client settings</li>
              <li>Navigate to the signature settings</li>
              <li>Create a new signature or edit an existing one</li>
              <li>Paste the copied signature</li>
              <li>Save your changes</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
