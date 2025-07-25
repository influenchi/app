
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface DeleteMemberDialogProps {
  member: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (member: any) => void;
}

const DeleteMemberDialog = ({ member, open, onOpenChange, onDelete }: DeleteMemberDialogProps) => {
  const handleDeleteMember = () => {
    onDelete(member);
    onOpenChange(false);
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Team Member</DialogTitle>
          <DialogDescription>
            This action will permanently remove {member.name} from your team
          </DialogDescription>
        </DialogHeader>
        <Alert className="border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-3">
              <p className="font-medium">Are you sure you want to remove this member?</p>
              <p className="text-sm">
                {member.name} will lose access to all campaigns and data immediately. 
                This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <Button variant="destructive" onClick={handleDeleteMember}>
                  Yes, remove member
                </Button>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteMemberDialog;
