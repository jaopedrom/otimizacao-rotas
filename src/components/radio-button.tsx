import { Label } from "@/src/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"

type RadioOption = {
    value: string
    label: string
}

interface RadioButtonProps {
    options: RadioOption[]
    value?: string
    defaultValue?: string
    name?: string // útil se você tiver mais de um RadioGroup na mesma tela
    onValueChange?: (value: string) => void
}

export function RadioButton({
    options,
    value,
    defaultValue,
    name = "radio-group",
    onValueChange,
}: RadioButtonProps) {
    return (
        <RadioGroup
            value={value}
            defaultValue={defaultValue ?? (!value ? options[0]?.value : undefined)}
            onValueChange={onValueChange}
            className="w-fit"
        >
            {options.map((option, index) => {
                const id = `${name}-${index}`
                return (
                    <div key={option.value} className="flex items-center gap-3">
                        <RadioGroupItem value={option.value} id={id} />
                        <Label htmlFor={id}>{option.label}</Label>
                    </div>
                )
            })}
        </RadioGroup>
    )
}