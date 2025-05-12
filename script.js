// DOM Elements
const addressDisplay = document.getElementById("address-display");
const optionsContainer = document.getElementById("options");
const optionButtons = document.querySelectorAll(".option");
const hintBtn = document.getElementById("hint-btn");
const hintPanel = document.getElementById("hint-panel");
const feedbackCorrect = document.getElementById("feedback-correct");
const feedbackIncorrect = document.getElementById("feedback-incorrect");
const correctType = document.getElementById("correct-type");
const actualType = document.getElementById("actual-type");
const nextBtn = document.getElementById("next-btn");
const streakCount = document.getElementById("streak-count");
const streakDucks = document.getElementById("streak-ducks");

// Game state
let currentAddress = "";
let currentType = "";
let currentInvalidType = "";
let currentInvalidReason = "";
let streak = 0;

// Address generation functions
function generateIPv4() {
	// Create a valid IPv4 address: four numbers from 0-255 separated by dots
	return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join(
		".",
	);
}

function generateIPv6() {
	// Occasionally add some zero compression (::) to make it more realistic
	const useCompression = Math.random() > 0.8;

	// if (useCompression) {
	// 	// Create segments, with some potential for zero compression
	// 	const numSegments = Math.floor(Math.random() * 6) + 2; // 2-7 segments
	// 	const segments = Array.from({ length: numSegments }, () =>
	// 		Math.floor(Math.random() * 65536)
	// 			.toString(16)
	// 			.padStart(4, "0"),
	// 	);

	// 	// Add zero compression
	// 	const compressionPoint = Math.floor(Math.random() * (numSegments - 1)) + 1;
	// 	segments.splice(compressionPoint, 0, "");

	// 	// Join with colons and replace empty segment with double colon
	// 	return segments.join(":").replace("::", "::");
	// }
	// Standard IPv6 format without compression
	return Array.from({ length: 8 }, () =>
		Math.floor(Math.random() * 65536)
			.toString(16)
			.padStart(4, "0"),
	).join(":");
}

function generateMAC() {
	// Randomly choose between colon and dash format
	const separator = Math.random() > 0.5 ? ":" : "-";

	// Create a valid MAC address: six pairs of hex digits (0-9, A-F)
	return Array.from({ length: 6 }, () =>
		Math.floor(Math.random() * 256)
			.toString(16)
			.padStart(2, "0")
			.toUpperCase(),
	).join(separator);
}

function generateInvalidAddress() {
	const invalidTypes = [
		// IPv4 with 5 chunks
		{
			generator: () =>
				Array.from({ length: 5 }, () => Math.floor(Math.random() * 256)).join(
					".",
				),
			invalidType: "IPv4",
			reason: "has too many segments (5 not 4)",
		},

		// IPv4 with 3 chunks
		{
			generator: () =>
				Array.from({ length: 3 }, () => Math.floor(Math.random() * 256)).join(
					".",
				),
			invalidType: "IPv4",
			reason: "has too few segments (3 not 4)",
		},

		// IPv4 with colons instead of dots
		{
			generator: () =>
				Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join(
					":",
				),
			invalidType: "IPv4",
			reason: "has wrong separators (colons instead of dots)",
		},

		// IPv4 with at least one number out of range (> 255)
		{
			generator: () => {
				const segments = Array.from({ length: 4 }, () =>
					Math.floor(Math.random() * 256),
				);
				const outOfRangeIndex = Math.floor(Math.random() * 4);
				segments[outOfRangeIndex] = 256 + Math.floor(Math.random() * 744); // 256-999
				return segments.join(".");
			},
			invalidType: "IPv4",
			reason: "contains out-of-range numbers (over 255)",
		},

		// IPv4 with negative numbers
		{
			generator: () => {
				const segments = Array.from({ length: 4 }, () =>
					Math.floor(Math.random() * 256),
				);
				const negativeIndex = Math.floor(Math.random() * 4);
				segments[negativeIndex] = -Math.floor(Math.random() * 100) - 1; // -1 to -100
				return segments.join(".");
			},
			invalidType: "IPv4",
			reason: "contains negative number",
		},

		// IPv4 with letter characters mixed in
		{
			generator: () => {
				const segments = Array.from({ length: 4 }, () =>
					Math.floor(Math.random() * 256),
				);
				const letterIndex = Math.floor(Math.random() * 4);
				const letters = "abcdefghijklmnopqrstuvwxyz";
				segments[letterIndex] =
					segments[letterIndex].toString() +
					letters.charAt(Math.floor(Math.random() * letters.length));
				return segments.join(".");
			},
			invalidType: "IPv4",
			reason: "contains non-numeric characters",
		},

		// IPv6 with 7 groups
		{
			generator: () =>
				Array.from({ length: 7 }, () =>
					Math.floor(Math.random() * 65536)
						.toString(16)
						.padStart(4, "0"),
				).join(":"),
			invalidType: "IPv6",
			reason: "has too few segments (7 not 8)",
		},

		// IPv6 with 9 groups
		{
			generator: () =>
				Array.from({ length: 9 }, () =>
					Math.floor(Math.random() * 65536)
						.toString(16)
						.padStart(4, "0"),
				).join(":"),
			invalidType: "IPv6",
			reason: "has too many segments (9 not 8)",
		},

		// IPv6 with invalid hex characters
		{
			generator: () => {
				const segments = Array.from({ length: 8 }, () =>
					Math.floor(Math.random() * 65536)
						.toString(16)
						.padStart(4, "0"),
				);
				const invalidIndex = Math.floor(Math.random() * 8);
				const invalidChars = "ghijklmnopqrstuvwxyz";
				const position = Math.floor(Math.random() * 4);
				const chars = segments[invalidIndex].split("");
				chars[position] = invalidChars.charAt(
					Math.floor(Math.random() * invalidChars.length),
				);
				segments[invalidIndex] = chars.join("");
				return segments.join(":");
			},
			invalidType: "IPv6",
			reason: "contains non-hexadecimal characters",
		},

		// IPv6 with dots instead of colons
		{
			generator: () =>
				Array.from({ length: 8 }, () =>
					Math.floor(Math.random() * 65536)
						.toString(16)
						.padStart(4, "0"),
				).join("."),
			invalidType: "IPv6",
			reason: "has wrong separators (dots instead of colons)",
		},

		// MAC with 7 pairs
		{
			generator: () =>
				Array.from({ length: 7 }, () =>
					Math.floor(Math.random() * 256)
						.toString(16)
						.padStart(2, "0")
						.toUpperCase(),
				).join(":"),
			invalidType: "MAC",
			reason: "has too many segments (7 not 6)",
		},

		// MAC with 5 pairs
		{
			generator: () =>
				Array.from({ length: 5 }, () =>
					Math.floor(Math.random() * 256)
						.toString(16)
						.padStart(2, "0")
						.toUpperCase(),
				).join(":"),
			invalidType: "MAC",
			reason: "has too few segments (5 not 6)",
		},

		// MAC with invalid hex characters
		{
			generator: () => {
				const segments = Array.from({ length: 6 }, () =>
					Math.floor(Math.random() * 256)
						.toString(16)
						.padStart(2, "0")
						.toUpperCase(),
				);
				const invalidIndex = Math.floor(Math.random() * 6);
				const invalidChars = "GHIJKLMNOPQRSTUVWXYZ";
				const position = Math.floor(Math.random() * 2);
				const chars = segments[invalidIndex].split("");
				chars[position] = invalidChars.charAt(
					Math.floor(Math.random() * invalidChars.length),
				);
				segments[invalidIndex] = chars.join("");
				return segments.join(":");
			},
			invalidType: "MAC",
			reason: "contains non-hexadecimal characters",
		},

		// MAC with dots instead of colons
		{
			generator: () =>
				Array.from({ length: 6 }, () =>
					Math.floor(Math.random() * 256)
						.toString(16)
						.padStart(2, "0")
						.toUpperCase(),
				).join("."),
			invalidType: "MAC",
			reason: "has wrong separators (dots instead of colons or hyphens)",
		},
	];

	const selectedInvalid =
		invalidTypes[Math.floor(Math.random() * invalidTypes.length)];
	const address = selectedInvalid.generator();
	return {
		address,
		invalidType: selectedInvalid.invalidType,
		reason: selectedInvalid.reason,
	};
}

function generateRandomAddress() {
	// Slight more weight to invalid addresses for better learning experience
	const types = [
		"IPv4",
		"IPv4",
		"IPv6",
		"IPv6",
		"MAC",
		"MAC",
		"none",
		"none",
		"none",
	];
	const randomType = types[Math.floor(Math.random() * types.length)];

	let address;
	let invalidType;
	let invalidReason;

	switch (randomType) {
		case "IPv4":
			address = generateIPv4();
			break;
		case "IPv6":
			address = generateIPv6();
			break;
		case "MAC":
			address = generateMAC();
			break;
		case "none": {
			const invalidData = generateInvalidAddress();
			address = invalidData.address;
			invalidType = invalidData.invalidType;
			invalidReason = invalidData.reason;
			break;
		}
	}

	return {
		address,
		type: randomType,
		invalidType,
		invalidReason,
	};
}

function updateStreakDisplay() {
	streakCount.textContent = streak;
	streakDucks.textContent = "🐤".repeat(streak);
}

function showNextQuestion() {
	try {
		// Reset UI
		optionButtons.forEach((button) => {
			button.classList.remove("disabled", "correct-option", "wrong-option");
		});

		feedbackCorrect.style.display = "none";
		feedbackIncorrect.style.display = "none";
		hintPanel.style.display = "none";
		nextBtn.style.display = "none";

		// Generate new address
		const { address, type, invalidType, invalidReason } =
			generateRandomAddress();
		currentAddress = address;
		currentType = type;
		currentInvalidType = invalidType;
		currentInvalidReason = invalidReason;

		// Update display
		if (addressDisplay) {
			addressDisplay.textContent = currentAddress;
		} else {
			console.error("Address display element not found");
		}
	} catch (error) {
		console.error("Error generating question:", error);
		addressDisplay.textContent = "Error generating question";
	}
}

// Event handlers
function handleOptionClick(event) {
	if (!event.target.classList.contains("option")) return;
	if (event.target.classList.contains("disabled")) return;

	const selectedType = event.target.dataset.type;

	// Disable all options
	optionButtons.forEach((button) => {
		button.classList.add("disabled");
	});

	// Show correct option
	document
		.querySelector(`[data-type="${currentType}"]`)
		.classList.add("correct-option");

	// If selected option is wrong, highlight it
	if (selectedType !== currentType) {
		event.target.classList.add("wrong-option");
	}

	// Update feedback
	if (selectedType === currentType) {
		// Correct answer
		feedbackCorrect.style.display = "block";

		const article = currentType === "MAC" ? "a" : "an";
		if (currentType === "none") {
			// Show specific information about why the address is invalid
			if (currentInvalidType && currentInvalidReason) {
				correctType.textContent = ` This is an invalid ${currentInvalidType} address. It ${currentInvalidReason}`;
			} else {
				correctType.textContent = " This is not a valid IP or MAC address";
			}
		} else {
			correctType.textContent = `This is ${article} ${currentType} address`;
		}

		streak++;

		updateStreakDisplay();
	} else {
		// Wrong answer
		feedbackIncorrect.style.display = "block";

		const article = currentType === "MAC" ? "a" : "an";
		if (currentType === "none") {
			// Use the stored invalid type and reason if available
			if (currentInvalidType && currentInvalidReason) {
				actualType.textContent = `This is an invalid ${currentInvalidType} address. It ${currentInvalidReason}`;
			} else {
				actualType.textContent = "This is not a valid IP or MAC address.";
				// Fallback to detection in case we don't have stored information
				const invalidReason = detectInvalidReason(currentAddress);
				if (invalidReason) {
					actualType.textContent += `: ${invalidReason}`;
				}
			}
		} else {
			actualType.textContent = `This is ${article} ${currentType} address.`;
		}

		streak = 0;
		updateStreakDisplay();
	}

	// Show next button
	nextBtn.style.display = "block";
}

// Helper function to detect what's wrong with an invalid address (fallback)
function detectInvalidReason(address) {
	// Check for IPv4-like with out of range numbers
	if (/^\d+\.\d+\.\d+\.\d+$/.test(address)) {
		const parts = address.split(".");
		for (let i = 0; i < parts.length; i++) {
			const num = Number.parseInt(parts[i], 10);
			if (num < 0 || num > 255) {
				return `Contains out-of-range number (${parts[i]})`;
			}
		}
	}

	// Check for IPv4 with wrong segment count
	if (/^(\d+\.)+\d+$/.test(address)) {
		const parts = address.split(".");
		if (parts.length !== 4) {
			return `Wrong number of segments (${parts.length}, should be 4)`;
		}
	}

	// Check for MAC address with wrong segment count (before checking for invalid characters)
	if (/^([0-9A-Fa-f]{1,2}[:\-])+[0-9A-Fa-f]{1,2}$/.test(address)) {
		const parts = address.split(/[:\-]/);
		if (parts.length !== 6) {
			return `Wrong number of segments (${parts.length}, should be 6)`;
		}
	}

	// Check for MAC address with invalid characters
	if (
		/^([0-9A-F]{2}[:\-]){5}[0-9A-F]{2}$/.test(address.toUpperCase()) ===
			false &&
		/^([0-9A-Z]{2}[:\-]){5}[0-9A-Z]{2}$/.test(address.toUpperCase())
	) {
		return "Contains non-hexadecimal characters";
	}

	// Check for IPv4-like with wrong separators (colons instead of dots)
	if (/^\d+:\d+:\d+:\d+$/.test(address)) {
		return "IPv4 with wrong separators (colons instead of dots)";
	}

	// IPv6 with invalid segment count
	if (/^([0-9a-f]{1,4}:)+[0-9a-f]{1,4}$/i.test(address)) {
		const parts = address.split(":");
		if (parts.length !== 8) {
			return `Wrong number of segments (${parts.length}, should be 8)`;
		}
	}

	// IPv6 with invalid characters
	if (
		/^([0-9a-f]{1,4}:)+[0-9a-z]{1,4}$/i.test(address) &&
		!/^([0-9a-f]{1,4}:)+[0-9a-f]{1,4}$/i.test(address)
	) {
		return "Contains non-hexadecimal characters";
	}

	// Default
	return "Format does not match any valid address type";
}

function toggleHintPanel() {
	hintPanel.style.display =
		hintPanel.style.display === "none" ? "block" : "none";
}

// Event listeners
optionsContainer.addEventListener("click", handleOptionClick);
hintBtn.addEventListener("click", toggleHintPanel);
nextBtn.addEventListener("click", showNextQuestion);

// Initialize quiz
function initializeQuiz() {
	console.log("Initializing quiz");
	showNextQuestion();
	updateStreakDisplay();
}

// Start quiz when DOM is ready
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initializeQuiz);
} else {
	initializeQuiz();
}

// Fallback initialization for window load
window.addEventListener("load", () => {
	console.log("Window loaded, ensuring quiz is initialized");
	if (!currentAddress) {
		initializeQuiz();
	}
});
