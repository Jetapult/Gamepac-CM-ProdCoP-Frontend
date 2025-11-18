import { FragmentCode } from './FragmentCode';
import { FragmentPreview } from './FragmentPreview';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getTemplateId } from '@/lib/templates';
import { ChevronsRight, LoaderCircle } from 'lucide-react';

export function Preview({
  selectedTab,
  onSelectedTabChange,
  isChatLoading,
  isPreviewLoading,
  fragment,
  result,
  onClose,
}) {
  if (!fragment) {
    return null;
  }

  const isLinkAvailable =
    result?.template && getTemplateId(result?.template) !== 'code-interpreter-v1';

  return (
    <div className="absolute md:relative z-10 top-0 left-0 shadow-2xl md:rounded-tl-3xl md:rounded-bl-3xl md:border-l md:border-y bg-popover h-full w-full overflow-auto">
      <Tabs
        value={selectedTab}
        onValueChange={(value) => onSelectedTabChange(value)}
        className="h-full flex flex-col items-start justify-start"
      >
        <div className="w-full p-2 grid grid-cols-3 items-center border-b">
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  onClick={onClose}
                >
                  <ChevronsRight className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Close sidebar</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex justify-center">
            <TabsList className="px-1 py-0 border h-8">
              <TabsTrigger
                className="font-normal text-xs py-1 px-2 gap-1 flex items-center"
                value="code"
              >
                {isChatLoading && (
                  <LoaderCircle strokeWidth={3} className="h-3 w-3 animate-spin" />
                )}
                Code
              </TabsTrigger>
              <TabsTrigger
                disabled={!result}
                className="font-normal text-xs py-1 px-2 gap-1 flex items-center"
                value="fragment"
              >
                Preview
                {isPreviewLoading && (
                  <LoaderCircle strokeWidth={3} className="h-3 w-3 animate-spin" />
                )}
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        {fragment && (
          <div className="overflow-y-auto w-full h-full">
            <TabsContent value="code" className="h-full">
              {fragment.code && fragment.file_path && (
                <FragmentCode
                  files={[
                    {
                      name: fragment.file_path,
                      content: fragment.code,
                    },
                  ]}
                />
              )}
            </TabsContent>
            <TabsContent value="fragment" className="h-full">
              {result && <FragmentPreview result={result} />}
            </TabsContent>
          </div>
        )}
      </Tabs>
    </div>
  );
}
