import { useCallback, useEffect } from "react";
import { QuizButton } from "@/components/QuizButton";
import type { useQuizLogic } from "@/hooks/useQuizLogic";

/**
 * Reusable quiz body component for GCSE CS practice sites
 *
 * Provides standard quiz UI with:
 * - Streak display with animated emojis
 * - Question rendering area
 * - Multiple choice answer buttons with keyboard shortcuts
 * - Feedback display with explanations
 * - Optional help section
 *
 * Usage: Pass quiz logic hook, question data, and customization functions.
 * The component handles all UI state and interactions automatically.
 */

export interface QuizAnswer {
	id: number;
	text: string;
	shortcut: string;
}

export interface SimpleQuizBodyProps<TQuestion> {
	/** Quiz logic hook return value - manages all quiz state */
	quizLogic: ReturnType<typeof useQuizLogic>;

	/** Current question data (null while loading) */
	currentQuestion: TQuestion | null;
	/** Available answer options with keyboard shortcuts */
	answers: QuizAnswer[];

	/** Site-specific customization functions */
	questionRenderer: (question: TQuestion) => React.ReactNode;
	isCorrectAnswer: (answerId: number, question: TQuestion) => boolean;
	generateFeedback: (
		isCorrect: boolean,
		answerId: number,
		question: TQuestion,
	) => {
		message: string;
		explanation?: string;
	};

	// Display configuration
	title: string;
	instructions?: string;
	showStreakEmojis?: boolean;

	// Optional help section
	helpSection?: React.ReactNode;
}

/**
 * Reusable quiz body component for simple multiple-choice GCSE CS practice sites.
 *
 * Handles common functionality:
 * - Streak display with emoji formatting
 * - Question display area with custom renderer
 * - Grid of answer buttons with feedback states
 * - Success/error feedback messages
 * - Next question button
 * - Keyboard shortcuts (1-4 for answers, Enter/Space for next)
 */
export function SimpleQuizBody<TQuestion>({
	quizLogic,
	currentQuestion,
	answers,
	questionRenderer,
	isCorrectAnswer,
	generateFeedback,
	title,
	instructions,
	showStreakEmojis = true,
	helpSection,
}: SimpleQuizBodyProps<TQuestion>) {
	// Extract quiz state from hook
	const {
		streak,
		feedback,
		selectedAnswerId,
		handleAnswerSelect: quizHandleAnswerSelect,
		handleNextQuestion: quizHandleNextQuestion,
		setFeedback: setQuizFeedback,
		scoreManager,
	} = quizLogic;

	/**
	 * Handles answer selection by combining site-specific logic with quiz hook
	 * Generates feedback and updates quiz state when user selects an answer
	 */
	const handleAnswerSelect = useCallback(
		(answerId: number) => {
			if (!currentQuestion) return;

			// Evaluate answer using site-specific logic
			const isCorrect = isCorrectAnswer(answerId, currentQuestion);

			// Generate contextual feedback message
			const feedbackData = generateFeedback(
				isCorrect,
				answerId,
				currentQuestion,
			);

			// Update scoring and streaks via quiz logic hook
			quizHandleAnswerSelect(answerId, isCorrect, currentQuestion);

			// Display feedback to user
			setQuizFeedback({
				isCorrect,
				message: feedbackData.message,
				explanation: feedbackData.explanation,
			});
		},
		[
			currentQuestion,
			isCorrectAnswer,
			generateFeedback,
			quizHandleAnswerSelect,
			setQuizFeedback,
		],
	);

	// Keyboard shortcuts - matches original Network Address implementation
	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			// Next question on Enter/Space when feedback is shown
			if (feedback) {
				if (event.key === "Enter" || event.key === " ") {
					quizHandleNextQuestion();
					return;
				}
			}

			// Answer selection shortcuts
			const key = event.key;
			if (key >= "1" && key <= "4") {
				const answerId = parseInt(key, 10);
				if (answerId <= answers.length && !feedback) {
					handleAnswerSelect(answerId);
				}
			}
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, [feedback, handleAnswerSelect, quizHandleNextQuestion, answers.length]);

	return (
		<div className="mx-auto space-y-6">
			{/* Main Quiz Section */}
			<div className="p-6 border-l-4 rounded-lg bg-card/80 border-quiz-body-border">
				<h2 className="mb-4 text-xl font-semibold text-quiz-body-title">
					{title}
				</h2>

				{instructions && (
					<p className="mb-4 text-quiz-body-text">{instructions}</p>
				)}

				{/* Question Display */}
				{currentQuestion && (
					<div className="mb-6">{questionRenderer(currentQuestion)}</div>
				)}

				{/* Answer Options */}
				{currentQuestion && (
					<div className="grid grid-cols-2 gap-4 mb-6">
						{answers.map((answer) => {
							const isSelected = feedback && selectedAnswerId === answer.id;
							const isCorrect = currentQuestion
								? isCorrectAnswer(answer.id, currentQuestion)
								: false;
							const showingFeedback = !!feedback;

							// Determine button variant based on state
							let variant:
								| "answer"
								| "answer-selected"
								| "answer-correct"
								| "answer-incorrect" = "answer";

							if (showingFeedback) {
								if (isSelected && feedback.isCorrect) {
									variant = "answer-correct";
								} else if (isSelected && !feedback.isCorrect) {
									variant = "answer-incorrect";
								} else if (isCorrect && !isSelected) {
									variant = "answer-correct";
								}
							}

							return (
								<QuizButton
									key={answer.id}
									variant={variant}
									size="lg"
									shortcut={answer.shortcut}
									disabled={showingFeedback}
									onClick={() => !feedback && handleAnswerSelect(answer.id)}
								>
									{answer.text}
								</QuizButton>
							);
						})}
					</div>
				)}

				{/* Streak Display */}
				{showStreakEmojis && (
					<div className="max-w-md p-3 m-auto my-6 text-lg font-semibold text-center rounded-lg border-2 text-streak-text bg-streak-bg border-streak-border">
						Streak:{" "}
						<span className="text-streak-emoji">
							{scoreManager.formatStreakEmojis(streak)}
						</span>{" "}
						({streak})
					</div>
				)}

				{/* Feedback Display */}
				{feedback && (
					<>
						<div
							className={`
						p-5 rounded-lg mb-6 text-center font-semibold
						${
							feedback.isCorrect
								? "bg-feedback-success-bg text-feedback-success-text border border-stats-accuracy-high"
								: "bg-feedback-error-bg text-feedback-error-text border border-stats-accuracy-low"
						}
					`}
						>
							<div className="mb-2">{feedback.message}</div>
							{feedback.explanation && (
								<div className="text-sm opacity-90">{feedback.explanation}</div>
							)}
						</div>

						<div className="text-center">
							<QuizButton variant="action" onClick={quizHandleNextQuestion}>
								Next Question
							</QuizButton>
						</div>
					</>
				)}

				{helpSection}
			</div>
		</div>
	);
}
