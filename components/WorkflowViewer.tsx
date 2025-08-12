import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface WorkflowViewerProps {
  isOpen: boolean;
  onClose: () => void;
  workflowImage: string | null;
}

export function WorkflowViewer({ isOpen, onClose, workflowImage }: WorkflowViewerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>워크플로우 상세보기</DialogTitle>
        </DialogHeader>
        
        {workflowImage && (
          <div className="flex justify-center items-center">
            <ImageWithFallback
              src={workflowImage}
              alt="워크플로우 상세"
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}