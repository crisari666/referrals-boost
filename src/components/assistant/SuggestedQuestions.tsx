interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

const questions = [
  "¿Cuáles son los proyectos con mayor comisión?",
  "¿Qué financiamiento ofrece Residencial Las Palmas?",
  "¿Cuántos lotes quedan en Costa Esmeralda?",
  "Dame tips para cerrar una venta",
];

const SuggestedQuestions = ({ onSelect }: SuggestedQuestionsProps) => (
  <div className="flex-shrink-0 px-4 md:px-8 pb-2">
    <div className="flex flex-wrap gap-2">
      {questions.map((q, i) => (
        <button
          key={i}
          onClick={() => onSelect(q)}
          className="text-xs px-3 py-2 rounded-xl border border-border bg-card text-foreground hover:bg-secondary transition-colors"
        >
          {q}
        </button>
      ))}
    </div>
  </div>
);

export default SuggestedQuestions;
