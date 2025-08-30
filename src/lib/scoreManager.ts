export interface LevelInfo {
	emoji: string;
	title: string;
	description: string;
	minPoints: number;
	minAccuracy: number;
}

export interface ScoreData {
	attempts: number;
	correct: number;
	byType: Record<string, { attempts: number; correct: number }>;
	history: Array<{
		timestamp: number;
		correct: boolean;
		addressType: string;
		address: string;
	}>;
	streak: number;
}

const blankScoreData = {
	attempts: 0,
	correct: 0,
	byType: {
		IPv4: { attempts: 0, correct: 0 },
		IPv6: { attempts: 0, correct: 0 },
		MAC: { attempts: 0, correct: 0 },
		none: { attempts: 0, correct: 0 },
	},
	history: [],
	streak: 0,
};

export class ScoreManager {
	private siteKey: string;
	private storageKey: string;
	private scores: ScoreData = blankScoreData;
	private levels: LevelInfo[];

	// Default generic levels that can be used as fallback
	private static readonly DEFAULT_LEVELS: LevelInfo[] = [
		{
			emoji: "🥚",
			title: "Beginner",
			description: "Just getting started!",
			minPoints: 0,
			minAccuracy: 0,
		},
		{
			emoji: "🐣",
			title: "Novice",
			description: "Making progress!",
			minPoints: 5,
			minAccuracy: 0,
		},
		{
			emoji: "🐤",
			title: "Learner",
			description: "Building confidence!",
			minPoints: 12,
			minAccuracy: 60,
		},
		{
			emoji: "🦆",
			title: "Skilled",
			description: "Getting the hang of it!",
			minPoints: 25,
			minAccuracy: 70,
		},
		{
			emoji: "🦆✨",
			title: "Expert",
			description: "Impressive skills!",
			minPoints: 50,
			minAccuracy: 80,
		},
		{
			emoji: "🪿👑",
			title: "Master",
			description: "Absolute mastery achieved!",
			minPoints: 75,
			minAccuracy: 90,
		},
	];

	constructor(siteKey = "generic-quiz", customLevels?: LevelInfo[]) {
		this.siteKey = siteKey;
		this.storageKey = `gcse-cs-scores-${this.siteKey}`;
		this.levels = customLevels || ScoreManager.DEFAULT_LEVELS;
		this.scores = this.loadScores();
	}

	private loadScores(): ScoreData {
		try {
			const stored = localStorage.getItem(this.storageKey);
			return stored ? JSON.parse(stored) : blankScoreData;
		} catch (error) {
			console.warn("Error loading scores:", error);
			return blankScoreData;
		}
	}

	private saveScores(): void {
		try {
			localStorage.setItem(this.storageKey, JSON.stringify(this.scores));
		} catch (error) {
			console.warn("Error saving scores:", error);
		}
	}

	getStreak(): number {
		return this.scores.streak;
	}

	resetStreak(): void {
		this.scores.streak = 0;
		this.saveScores();
	}

	recordScore(
		isCorrect: boolean,
		addressType: string | null = null,
		address = "",
	): void {
		if (!this.scores) {
			this.scores = blankScoreData;
		}

		const scoreData = this.scores;
		console.log(this.scores);
		scoreData.attempts++;
		if (isCorrect) {
			scoreData.correct++;
			scoreData.streak++;
		} else {
			scoreData.streak = 0;
		}

		if (addressType && scoreData.byType[addressType]) {
			scoreData.byType[addressType].attempts++;
			if (isCorrect) {
				scoreData.byType[addressType].correct++;
			}
		}

		// Add to history (keep last 50 entries)
		scoreData.history.unshift({
			timestamp: Date.now(),
			correct: isCorrect,
			addressType: addressType || "unknown",
			address,
		});

		if (scoreData.history.length > 50) {
			scoreData.history = scoreData.history.slice(0, 50);
		}

		this.saveScores();
	}

	getOverallStats(): {
		totalAttempts: number;
		totalCorrect: number;
		accuracy: number;
		totalPoints: number;
		level: LevelInfo;
		progress: number;
		nextLevel: LevelInfo | null;
		streak: number;
	} {
		const totalAttempts = this.scores.attempts;
		const totalCorrect = this.scores.correct;
		const streak = this.scores.streak;
		const totalPoints = totalCorrect;
		const accuracy =
			totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;

		// Find current level
		let currentLevel = this.levels[0];
		for (let i = this.levels.length - 1; i >= 0; i--) {
			const level = this.levels[i];
			if (totalPoints >= level.minPoints && accuracy >= level.minAccuracy) {
				currentLevel = level;
				break;
			}
		}

		// Find next level
		const currentLevelIndex = this.levels.indexOf(currentLevel);
		const nextLevel =
			currentLevelIndex < this.levels.length - 1
				? this.levels[currentLevelIndex + 1]
				: null;

		// Calculate progress to next level
		let progress = 100;
		if (nextLevel) {
			const pointsProgress = Math.min(
				100,
				(totalPoints / nextLevel.minPoints) * 100,
			);
			const accuracyProgress = Math.min(
				100,
				(accuracy / nextLevel.minAccuracy) * 100,
			);
			progress = Math.min(pointsProgress, accuracyProgress);
		}

		return {
			totalAttempts,
			totalCorrect,
			accuracy,
			totalPoints,
			level: currentLevel,
			progress,
			nextLevel,
			streak,
		};
	}

	getScoresByType(): Record<
		string,
		{ attempts: number; correct: number; accuracy: number }
	> {
		const typeStats: Record<
			string,
			{ attempts: number; correct: number; accuracy: number }
		> = {};

		Object.entries(this.scores.byType).forEach(([type, stats]) => {
			if (!typeStats[type]) {
				typeStats[type] = { attempts: 0, correct: 0, accuracy: 0 };
			}
			typeStats[type].attempts += stats.attempts;
			typeStats[type].correct += stats.correct;
		});

		// Calculate accuracy for each type
		Object.keys(typeStats).forEach((type) => {
			const stats = typeStats[type];
			stats.accuracy =
				stats.attempts > 0 ? (stats.correct / stats.attempts) * 100 : 0;
		});

		return typeStats;
	}

	resetAllScores(): void {
		this.scores = blankScoreData;
		this.saveScores();
	}

	formatStreakEmojis(streak: number): string {
		if (streak === 0) return "";

		const denominations = [
			{ value: 50, emoji: "🪿" }, // Golden Goose for 50s
			{ value: 25, emoji: "🦅" }, // Eagle for 25s
			{ value: 10, emoji: "🦢" }, // Swan for 10s
			{ value: 5, emoji: "🦆" }, // Duck for 5s
			{ value: 1, emoji: "🐤" }, // Duckling for 1s
		];

		let result = "";
		let remaining = streak;

		for (const { value, emoji } of denominations) {
			const count = Math.floor(remaining / value);
			if (count > 0) {
				result += emoji.repeat(count);
				remaining -= count * value;
			}
		}

		return result;
	}
}
