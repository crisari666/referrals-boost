import { useTranslation } from 'react-i18next';

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

const SUGGESTED_KEYS = [
  'assistant.suggested1',
  'assistant.suggested2',
  'assistant.suggested3',
  'assistant.suggested4',
] as const;

const SuggestedQuestions = ({ onSelect }: SuggestedQuestionsProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex-shrink-0 px-4 md:px-8 pb-2">
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_KEYS.map((key) => {
          const label = t(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(label)}
              className="text-xs px-3 py-2 rounded-xl border border-border bg-card text-foreground hover:bg-secondary transition-colors"
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SuggestedQuestions;
