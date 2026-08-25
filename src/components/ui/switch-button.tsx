import { Label } from "@/src/components/ui/label";
import { Switch } from "@/src/components/ui/switch";

interface SwitchDemoProps {
    text: string;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    id?: string;
}

export function SwitchDemo({ text, checked, onCheckedChange, id = "switch" }: SwitchDemoProps) {
    return (
        <div className="flex items-center space-x-2">
            <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
            <Label htmlFor={id}>{text}</Label>
        </div>
    );
}