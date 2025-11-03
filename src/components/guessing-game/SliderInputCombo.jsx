import React from "react";
import "../styles/SetAnswerPhase.css";

const SetAnswerPhase = ({
  question,
  correctAnswer,
  setCorrectAnswer,
  onSetCorrectAnswer,
  questionRange,
  onNextPhase,
}) => {
  const handleInputChange = (e) => {
    const val = e.target.value;
    setCorrectAnswer(val);
  };

  const handleInputBlur = (e) => {
    const val = Number(e.target.value);

    if (questionRange && val > questionRange.max) {
      setCorrectAnswer("");
    }
  };

  const handleTextInputChange = (e, min, max) => {
    const val = e.target.value;

    if (val === "") {
      setCorrectAnswer("");
      return;
    }

    const numericVal = Number(val);
    if (isNaN(numericVal)) {
      return;
    }

    let newVal = numericVal;
    if (numericVal > max) {
      newVal = max;
    }
    setCorrectAnswer(newVal);
  };

  return (
    <div className="set-answer-phase">
      <h3>Fase 3: Sett riktig svar</h3>
      <p>
        <strong>Spørsmål:</strong> {question ? question : "Loading..."}
      </p>
      <input
        className="answer-input"
        type="number"
        placeholder={
          questionRange
            ? `${questionRange.min} - ${questionRange.max}`
            : "Enter a number"
        }
        value={correctAnswer}
        onChange={(e) =>
          handleTextInputChange(e, questionRange.min, questionRange.max)
        }
        onBlur={handleInputBlur}
      />
      <button onClick={onSetCorrectAnswer}>Sett Svar</button>
    </div>
  );
};

export default SetAnswerPhase;
