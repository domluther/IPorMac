/**
 * GCSE CS Reusable Component Library
 * Export all reusable components for easy importing
 */

export { Footer } from "./Footer";
export { Header } from "./Header";
export type {
	QuizButtonProps,
	QuizButtonSize,
	QuizButtonVariant,
} from "./QuizButton";
export { QuizButton } from "./QuizButton";
// Layout Components
export { QuizLayout } from "./QuizLayout";
// Utility Components
export { ScoreButton } from "./ScoreButton";
export type { QuizAnswer, SimpleQuizBodyProps } from "./SimpleQuizBody";
// Quiz Body Components
export { SimpleQuizBody } from "./SimpleQuizBody";
export { SiteNavigation } from "./SiteNavigation";
// Modal Components
export { StatsModal } from "./StatsModal";

/**
 * Usage Example:
 *
 * import {
 *   QuizLayout,
 *   SimpleQuizBody,
 *   StatsModal,
 *   QuizButton,
 *   ScoreButton,
 *   HintPanel,
 *   Header,
 *   Footer
 * } from "@/components";
 */
