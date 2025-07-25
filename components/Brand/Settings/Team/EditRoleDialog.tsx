
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EditRoleDialogProps {
  member: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (member: any) => void;
}

const EditRoleDialog = ({ member, open, onOpenChange, onUpdate }: EditRoleDialogProps) => {
  const handleUpdateRole = () => {
    onUpdate(member);
    onOpenChange(false);
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
          <DialogDescription>
            Change the role for {member.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-role">Role</Label>
            <Select 
              value={member.role?.toLowerCase()} 
              onValueChange={(value) => member.role = value.charAt(0).toUpperCase() + value.slice(1)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex space-x-3">
            <Button onClick={handleUpdateRole}>
              Update Role
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditRoleDialog;
