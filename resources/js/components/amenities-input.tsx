import { X } from 'lucide-react';
import { useId, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

type AmenitiesInputProps = {
    value: string[];
    onChange: (next: string[]) => void;
    suggestions?: string[];
    id?: string;
    disabled?: boolean;
};

export function AmenitiesInput({
    value,
    onChange,
    suggestions = [],
    id,
    disabled,
}: AmenitiesInputProps) {
    const [draft, setDraft] = useState('');
    const generatedId = useId();
    const listId = `${id ?? generatedId}-suggestions`;

    function addAmenity(name: string) {
        const trimmed = name.trim();

        if (!trimmed) {
            return;
        }

        const exists = value.some(
            (amenity) => amenity.toLowerCase() === trimmed.toLowerCase(),
        );

        if (!exists) {
            onChange([...value, trimmed]);
        }

        setDraft('');
    }

    function removeAmenity(name: string) {
        onChange(value.filter((amenity) => amenity !== name));
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            addAmenity(draft);
        } else if (
            event.key === 'Backspace' &&
            draft === '' &&
            value.length > 0
        ) {
            removeAmenity(value[value.length - 1]);
        }
    }

    const availableSuggestions = suggestions.filter(
        (suggestion) =>
            !value.some(
                (amenity) => amenity.toLowerCase() === suggestion.toLowerCase(),
            ),
    );

    return (
        <div className="space-y-2">
            {value.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {value.map((amenity) => (
                        <Badge
                            key={amenity}
                            variant="secondary"
                            className="gap-1 py-1 pr-1 pl-2"
                        >
                            {amenity}
                            <button
                                type="button"
                                onClick={() => removeAmenity(amenity)}
                                disabled={disabled}
                                className="rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                                aria-label={`Remove ${amenity}`}
                            >
                                <X className="size-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            <Input
                id={id}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => addAmenity(draft)}
                list={listId}
                disabled={disabled}
                placeholder="Type an amenity and press Enter"
                autoComplete="off"
            />

            <datalist id={listId}>
                {availableSuggestions.map((suggestion) => (
                    <option key={suggestion} value={suggestion} />
                ))}
            </datalist>
        </div>
    );
}
