import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getTemplateId } from '@/lib/templates';
import { Sparkles } from 'lucide-react';

export function ChatPicker({
  templates,
  selectedTemplate,
  onSelectedTemplateChange,
  models,
  languageModel,
  onLanguageModelChange,
}) {
  // Group models by provider
  const groupedModels = models.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {});

  return (
    <div className="flex items-center space-x-2">
      <div className="flex flex-col">
        <Select
          name="template"
          defaultValue={selectedTemplate}
          onValueChange={onSelectedTemplateChange}
        >
          <SelectTrigger className="whitespace-nowrap border-none shadow-none focus:ring-0 px-0 py-0 h-6 text-xs">
            <SelectValue placeholder="Select a persona" />
          </SelectTrigger>
          <SelectContent side="top">
            <SelectGroup>
              <SelectLabel>Persona</SelectLabel>
              <SelectItem value="auto">
                <div className="flex items-center space-x-2">
                  <Sparkles className="flex text-[#a1a1aa]" width={14} height={14} />
                  <span>Auto</span>
                </div>
              </SelectItem>
              {Object.entries(templates).map(([templateId, template]) => (
                <SelectItem key={templateId} value={templateId}>
                  <div className="flex items-center space-x-2">
                    <span>{template.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col">
        <Select
          name="languageModel"
          defaultValue={languageModel.model}
          onValueChange={(e) => onLanguageModelChange({ model: e })}
        >
          <SelectTrigger className="whitespace-nowrap border-none shadow-none focus:ring-0 px-0 py-0 h-6 text-xs">
            <SelectValue placeholder="Language model" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(groupedModels).map(([provider, models]) => (
              <SelectGroup key={provider}>
                <SelectLabel>{provider}</SelectLabel>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center space-x-2">
                      <span>{model.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
