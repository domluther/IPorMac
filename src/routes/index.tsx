import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { QuizLayout, SimpleQuizBody } from "@/components";
import { ScoreButton } from "@/components/ScoreButton";
import { StatsModal } from "@/components/StatsModal";
import { useQuizLogic } from "@/hooks/useQuizLogic";
import type { AddressType } from "@/lib/addressGenerator";
import { generateRandomAddress } from "@/lib/addressGenerator";
import { ScoreManager } from "@/lib/scoreManager";
import { SITE_CONFIG } from "@/lib/siteConfig";

export const Route = createFileRoute("/")({
	component: Index,
});

// Define question type for our quiz
interface NetworkAddressQuestion {
	address: string;
	type: AddressType;
	invalidType?: string;
	invalidReason?: string;
}

// Quiz answer options
const QUIZ_ANSWERS = [
	{ id: 1, text: "IPv4", shortcut: "1" },
	{ id: 2, text: "IPv6", shortcut: "2" },
	{ id: 3, text: "MAC", shortcut: "3" },
	{ id: 4, text: "None", shortcut: "4" },
];

// Map answer IDs to address types
const ANSWER_TO_TYPE: Record<number, AddressType> = {
	1: "IPv4",
	2: "IPv6",
	3: "MAC",
	4: "none",
};

function Index() {
	// Site configuration
	const siteConfig = SITE_CONFIG;

	// Score manager
	const [scoreManager] = useState(
		() => new ScoreManager(siteConfig.siteKey, siteConfig.scoring.customLevels),
	);

	// Quiz state - Network Address specific
	const [currentQuestion, setCurrentQuestion] =
		useState<NetworkAddressQuestion | null>(null);
	const [showStatsModal, setShowStatsModal] = useState(false);

	// Quiz state management using reusable hook
	const quizLogic = useQuizLogic({
		scoreManager,
		onQuestionGenerate: () => {
			// Generate new Network Address question when needed
			const addressData = generateRandomAddress();
			setCurrentQuestion({
				address: addressData.address,
				type: addressData.type,
				invalidType: addressData.invalidType,
				invalidReason: addressData.invalidReason,
			});
		},
	});

	// Extract state for UI components
	const { overallStats } = quizLogic;

	/**
	 * Site-specific customization functions for Network Address Practice
	 * These functions define the unique behavior for this quiz type
	 */

	// Generate initial question (hook handles subsequent ones via onQuestionGenerate)
	const generateNewQuestion = useCallback(() => {
		const addressData = generateRandomAddress();
		setCurrentQuestion({
			address: addressData.address,
			type: addressData.type,
			invalidType: addressData.invalidType,
			invalidReason: addressData.invalidReason,
		});
	}, []);

	/**
	 * Renders a network address question with distinctive styling
	 * Uses monospace font and semantic color variables for address visibility
	 */
	const questionRenderer = useCallback(
		(question: NetworkAddressQuestion) => (
			<div className="p-6 font-mono text-2xl font-semibold tracking-wider text-center break-all shadow-lg sm:text-3xl sm:p-8 rounded-xl border-3 bg-question-prompt-bg text-question-prompt-text border-hint-card-border">
				{question.address}
			</div>
		),
		[],
	);

	/**
	 * Determines if the selected answer matches the correct address type
	 * Maps answer IDs to address types for validation
	 */
	const isCorrectAnswer = useCallback(
		(answerId: number, question: NetworkAddressQuestion) => {
			const selectedType = ANSWER_TO_TYPE[answerId];
			return selectedType === question.type;
		},
		[],
	);

	/**
	 * Generates contextual feedback messages based on answer correctness
	 * Provides specific explanations for each address type and invalid addresses
	 */
	const generateFeedback = useCallback(
		(
			isCorrect: boolean,
			_answerId: number, // Unused in Network Address logic
			question: NetworkAddressQuestion,
		) => {
			let message: string;
			let explanation: string | undefined;

			if (isCorrect) {
				if (question.type === "none") {
					message = "Correct! This is an invalid address. 🎉";
					explanation = question.invalidReason
						? `This ${question.invalidType || "address"} ${question.invalidReason}.`
						: `This is an invalid ${question.invalidType || "address"}.`;
				} else {
					const article =
						question.type === "IPv4" || question.type === "IPv6" ? "an" : "a";
					message = `Correct! This is ${article} ${question.type} address. 🎉`;
					explanation = `Great job identifying the ${question.type} format!`;
				}
			} else {
				message = "Incorrect. Try again! ❌";
				if (question.type === "none") {
					explanation = question.invalidReason
						? `This is actually an invalid ${question.invalidType || "address"}. It ${question.invalidReason}.`
						: `This is actually an invalid ${question.invalidType || "address"}.`;
				} else {
					const article =
						question.type === "IPv4" || question.type === "IPv6" ? "an" : "a";
					explanation = `This is actually ${article} ${question.type} address.`;
				}
			}

			return { message, explanation };
		},
		[],
	);

	// Initialize first question when component mounts
	useEffect(() => {
		generateNewQuestion();
	}, [generateNewQuestion]);

	// Generate hint content from siteConfig.hints
	const getHintContent = useCallback(() => {
		const hints = siteConfig.hints || [];
		return (
			<div className="space-y-3">
				{hints.map((hint) => (
					<div
						key={hint.title}
						className="p-3 border-l-4 rounded-lg bg-hint-card-bg border-hint-card-border shadow-sm"
					>
						<div className="mb-1 font-bold text-hint-card-title">
							{hint.title}
						</div>
						<div className="mb-2 text-hint-card-text">{hint.description}</div>
						<div className="space-y-1">
							{hint.examples.map((example) => (
								<div
									key={example}
									className="px-2 py-1 font-mono text-sm rounded text-hint-card-code-text bg-hint-card-code-bg"
								>
									{example}
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		);
	}, [siteConfig.hints]);

	// Help section with toggleable address format reference
	const helpSection = (
		<details className="group">
			<summary className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-button-primary focus:ring-offset-2 rounded-lg px-4 py-3 bg-hint-summary-bg border border-hint-summary-border hover:bg-hint-summary-bg-hover transition-all duration-200 shadow-sm hover:shadow-md list-none [&::-webkit-details-marker]:hidden">
				<span className="flex items-center font-semibold text-hint-summary-text">
					<span className="mr-2 text-lg">💡</span>
					Get help with this question
					<span className="ml-auto transition-transform duration-200 group-open:rotate-180">
						▼
					</span>
				</span>
			</summary>
			<div className="p-5 mt-3 border rounded-lg border-hint-summary-border shadow-sm bg-hint-content-bg">
				<div className="text-base">{getHintContent()}</div>
			</div>
		</details>
	);

	return (
		<QuizLayout
			title={siteConfig.title}
			subtitle={siteConfig.subtitle}
			titleIcon={siteConfig.icon}
			scoreButton={
				<ScoreButton
					levelEmoji={overallStats.currentLevel.emoji}
					levelTitle={overallStats.currentLevel.title}
					points={overallStats.totalPoints}
					onClick={() => setShowStatsModal(true)}
				/>
			}
		>
			{/* Network Address Practice Quiz Interface */}
			<SimpleQuizBody
				quizLogic={quizLogic}
				currentQuestion={currentQuestion}
				answers={QUIZ_ANSWERS}
				questionRenderer={questionRenderer}
				isCorrectAnswer={isCorrectAnswer}
				generateFeedback={generateFeedback}
				title="IP or MAC?"
				showStreakEmojis={true}
				helpSection={helpSection}
			/>

			<StatsModal
				isOpen={showStatsModal}
				onClose={() => setShowStatsModal(false)}
				scoreManager={scoreManager}
				title="Your Network Mastery"
			/>
		</QuizLayout>
	);
}
