/**
 * Score Manager for GCSE CS Practice Sites
 * Handles scoring, levels, and progress tracking across all sites
 * Duck-themed level system for consistent branding
 */

class ScoreManager {
    constructor(siteKey = 'template-site') {
        this.siteKey = siteKey; // Unique identifier for this site's scores
        this.storageKey = `gcse-cs-scores-${this.siteKey}`;
        this.streakKey = `${this.storageKey}-streak`;
        this.scores = this.loadScores();
        this.streak = this.loadStreak(); // Load saved streak
        
        // Duck-themed level system (points will vary by site)
        this.levels = [
            { emoji: '🥚', title: 'Network Newbie', description: 'Just hatched into networking!', minPoints: 0, minAccuracy: 0 },
            { emoji: '🐣', title: 'Address Apprentice', description: 'Taking your first paddle through IP waters!', minPoints: 5, minAccuracy: 0 },
            { emoji: '🐤', title: 'Protocol Paddler', description: 'Your address recognition is making waves!', minPoints: 12, minAccuracy: 60 },
            { emoji: '🦆', title: 'Network Navigator', description: 'Swimming confidently through address formats!', minPoints: 25, minAccuracy: 70 },
            { emoji: '🦆✨', title: 'Packet Pond Master', description: 'Soaring above the subnet with elegant identification!', minPoints: 50, minAccuracy: 80 },
            { emoji: '🪿👑', title: 'Golden Gateway Guru', description: 'The legendary address whisperer of the network!', minPoints: 75, minAccuracy: 90 }
        ];
    }

    loadScores() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.warn('Error loading scores:', error);
            return {};
        }
    }

    saveScores() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.scores));
        } catch (error) {
            console.warn('Error saving scores:', error);
        }
    }

    loadStreak() {
        try {
            const stored = localStorage.getItem(this.streakKey);
            return stored ? parseInt(stored, 10) : 0;
        } catch (error) {
            console.warn('Error loading streak:', error);
            return 0;
        }
    }

    saveStreak() {
        try {
            localStorage.setItem(this.streakKey, this.streak.toString());
        } catch (error) {
            console.warn('Error saving streak:', error);
        }
    }

    updateStreak(isCorrect) {
        if (isCorrect) {
            this.streak++;
        } else {
            this.streak = 0;
        }
        this.saveStreak();
        return this.streak;
    }

    getStreak() {
        return this.streak;
    }

    resetStreak() {
        this.streak = 0;
        this.saveStreak();
    }

    recordScore(itemKey, score, maxScore = 100, addressType = null) {
        const percentage = Math.round((score / maxScore) * 100);
        
        // Record overall score for the quiz
        if (!this.scores[itemKey]) {
            this.scores[itemKey] = {
                attempts: 0,
                correct: 0,
                totalScore: 0,
                byType: {
                    'IPv4': { attempts: 0, correct: 0 },
                    'IPv6': { attempts: 0, correct: 0 },
                    'MAC': { attempts: 0, correct: 0 },
                    'none': { attempts: 0, correct: 0 }
                },
                history: []
            };
        }

        // Update overall stats
        this.scores[itemKey].attempts++;
        this.scores[itemKey].totalScore += percentage;
        if (percentage === 100) {
            this.scores[itemKey].correct++;
        }

        // Update by address type if provided
        if (addressType && this.scores[itemKey].byType[addressType]) {
            this.scores[itemKey].byType[addressType].attempts++;
            if (percentage === 100) {
                this.scores[itemKey].byType[addressType].correct++;
            }
        }

        this.saveScores();
        this.updateScoreButton();
    }

    getScore(itemKey) {
        return this.scores[itemKey] || { 
            attempts: 0, 
            correct: 0, 
            totalScore: 0,
            byType: {
                'IPv4': { attempts: 0, correct: 0 },
                'IPv6': { attempts: 0, correct: 0 },
                'MAC': { attempts: 0, correct: 0 },
                'none': { attempts: 0, correct: 0 }
            }
        };
    }

    getScoreDisplay(itemKey) {
        const score = this.getScore(itemKey);
        if (score.attempts === 0) {
            return { text: 'Not Attempted', className: 'score-na' };
        }

        const percentage = Math.round((score.correct / score.attempts) * 100);
        let className = 'score-poor';
        
        if (percentage >= 90) className = 'score-excellent';
        else if (percentage >= 70) className = 'score-good';
        else if (percentage >= 50) className = 'score-fair';

        return { text: `${percentage}%`, className };
    }

    getTotalPoints() {
        // Return total correct answers across all categories
        return Object.values(this.scores).reduce((total, score) => {
            return total + score.correct;
        }, 0);
    }

    getCurrentLevel() {
        const points = this.getTotalPoints();
        const totalAttempts = Object.values(this.scores).reduce((sum, score) => sum + score.attempts, 0);
        const totalCorrect = Object.values(this.scores).reduce((sum, score) => sum + score.correct, 0);
        const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
        
        let currentLevel = this.levels[0];
        
        // Find the highest level that meets both point and accuracy requirements
        for (const level of this.levels) {
            if (points >= level.minPoints && accuracy >= level.minAccuracy) {
                currentLevel = level;
            }
        }
        
        return currentLevel;
    }

    getNextLevel() {
        const currentLevel = this.getCurrentLevel();
        const currentIndex = this.levels.indexOf(currentLevel);
        return currentIndex < this.levels.length - 1 ? this.levels[currentIndex + 1] : null;
    }

    updateScoreButton() {
        const button = document.getElementById('scoreButton');
        if (!button) return;

        const totalAttempts = Object.values(this.scores).reduce((sum, score) => sum + score.attempts, 0);
        const totalCorrect = Object.values(this.scores).reduce((sum, score) => sum + score.correct, 0);
        const percentage = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
        const currentLevel = this.getCurrentLevel();

        // Show level emoji, title, and points like the other site
        button.textContent = `${currentLevel.emoji} ${currentLevel.title} (${totalCorrect} pts)`;

        // Update button class based on performance
        button.className = 'score-button';
        if (percentage >= 90) button.classList.add('excellent');
        else if (percentage >= 70) button.classList.add('good');
        else if (percentage >= 50) button.classList.add('fair');
        else if (totalAttempts > 0) button.classList.add('needs-work');
    }

    showScoreModal() {
        const modal = document.getElementById('scoreModal');
        if (!modal) return;

        this.populateScoreModal();
        modal.style.display = 'flex';
        
        // Add click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideScoreModal();
            }
        });
    }

    hideScoreModal() {
        const modal = document.getElementById('scoreModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    populateScoreModal() {
        this.populateLevelInfo();
        this.populateOverallStats();
        this.populateIndividualScores();
        // this.populateHistory();
    }

    populateLevelInfo() {
        const levelContainer = document.getElementById('levelInfo');
        if (!levelContainer) return;

        const totalCorrect = Object.values(this.scores).reduce((sum, score) => sum + score.correct, 0);
        const currentLevel = this.getCurrentLevel();
        const nextLevel = this.getNextLevel();

        let html = `
            <div class="current-level">
                <div class="level-display">
                    <div class="level-emoji">${currentLevel.emoji}</div>
                    <div class="level-details">
                        <div class="level-title">${currentLevel.title}</div>
                        <div class="level-description">${currentLevel.description}</div>
                    </div>
                </div>
            </div>
        `;

        if (nextLevel) {
            const pointsNeeded = Math.max(nextLevel.minPoints - totalCorrect, 0);
            const totalAttempts = Object.values(this.scores).reduce((sum, score) => sum + score.attempts, 0);
            const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
            
            // Calculate progress percentage
            const currentLevelIndex = this.levels.indexOf(currentLevel);
            const nextLevelIndex = this.levels.indexOf(nextLevel);
            const pointsFromPrevious = currentLevelIndex > 0 ? this.levels[currentLevelIndex].minPoints : 0;
            const pointsToNext = nextLevel.minPoints - pointsFromPrevious;
            const currentProgress = totalCorrect - pointsFromPrevious;
            const progressPercentage = Math.min(100, Math.max(0, (currentProgress / pointsToNext) * 100));

            html += `
                <div class="level-progress">
                    <div class="progress-info">
                        <span>Progress to ${nextLevel.emoji} ${nextLevel.title}</span>
                        <span>${pointsNeeded} points needed`;
            
            // Add accuracy requirement if the next level has one
            if (nextLevel.minAccuracy > 0 && accuracy < nextLevel.minAccuracy) {
                const accuracyNeeded = nextLevel.minAccuracy - accuracy;
                html += `, ${accuracyNeeded}% accuracy needed`;
            }
            
            html += `</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="level-maxed">
                    <div class="max-level-message">🎉 Maximum level achieved! You are the master of the pond! 🎉</div>
                </div>
            `;
        }

        levelContainer.innerHTML = html;
    }    populateOverallStats() {
        const statGrid = document.getElementById('statGrid');
        if (!statGrid) return;

        const totalAttempts = Object.values(this.scores).reduce((sum, score) => sum + score.attempts, 0);
        const totalCorrect = Object.values(this.scores).reduce((sum, score) => sum + score.correct, 0);
        const percentage = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

        statGrid.innerHTML = `
            <div class="stat-item">
                <div class="stat-value">${totalAttempts}</div>
                <div class="stat-label">Total Attempts</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${totalCorrect}</div>
                <div class="stat-label">Correct Answers</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${percentage}%</div>
                <div class="stat-label">Success Rate</div>
            </div>
        `;
    }

    populateIndividualScores() {
        const programList = document.getElementById('programList');
        const noScores = document.getElementById('noScores');
        if (!programList || !noScores) return;

        const scoreEntries = Object.entries(this.scores);
        
        if (scoreEntries.length === 0) {
            programList.style.display = 'none';
            noScores.style.display = 'block';
            return;
        }

        programList.style.display = 'block';
        noScores.style.display = 'none';

        // Show breakdown by address type
        programList.innerHTML = scoreEntries.map(([key, score]) => {
            const addressTypes = ['IPv4', 'IPv6', 'MAC', 'none'];
            const typeBreakdown = addressTypes.map(type => {
                // Safety check - ensure byType exists and has the type
                const typeData = score.byType && score.byType[type] ? score.byType[type] : { attempts: 0, correct: 0 };
                const attempts = typeData.attempts;
                const correct = typeData.correct;
                const percentage = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
                
                let className = 'score-na';
                if (attempts > 0) {
                    if (percentage >= 90) className = 'score-excellent';
                    else if (percentage >= 70) className = 'score-good';
                    else if (percentage >= 50) className = 'score-fair';
                    else className = 'score-poor';
                }
                
                const displayText = attempts > 0 ? `${correct}/${attempts} (${percentage}%)` : '0/0 (0%)';
                const displayType = type === 'none' ? 'Invalid' : type;
                
                return `
                    <div class="type-breakdown">
                        <span class="type-label">${displayType}:</span>
                        <span class="type-score ${className}">${displayText}</span>
                    </div>
                `;
            }).join('');

            return `
                <div class="program-item">
                    <div class="address-type-breakdown">
                        ${typeBreakdown}
                    </div>
                </div>
            `;
        }).join('');
    }

    //TODO Needs implementing
    // populateHistory() {
    //     const questionHistory = document.getElementById('questionHistory');
    //     const noHistory = document.getElementById('noHistory');
    //     if (!questionHistory || !noHistory) return;

    //     const historyEntries = Object.entries(this.scores);
        
    //     if (historyEntries.length === 0) {
    //         questionHistory.style.display = 'none';
    //         noHistory.style.display = 'block';
    //         return;
    //     }

    //     questionHistory.style.display = 'block';
    //     noHistory.style.display = 'none';

    //     // Show breakdown by address type
    //     questionHistory.innerHTML = historyEntries.map(([key, score]) => {
    //         const addressTypes = ['IPv4', 'IPv6', 'MAC', 'none'];
    //         const typeBreakdown = addressTypes.map(type => {
    //             // Safety check - ensure byType exists and has the type
    //             const typeData = score.byType && score.byType[type] ? score.byType[type] : { attempts: 0, correct: 0 };
    //             const attempts = typeData.attempts;
    //             const correct = typeData.correct;
    //             const percentage = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
                
    //             let className = 'score-na';
    //             if (attempts > 0) {
    //                 if (percentage >= 90) className = 'score-excellent';
    //                 else if (percentage >= 70) className = 'score-good';
    //                 else if (percentage >= 50) className = 'score-fair';
    //                 else className = 'score-poor';
    //             }
                
    //             const displayText = attempts > 0 ? `${correct}/${attempts} (${percentage}%)` : '0/0 (0%)';
    //             const displayType = type === 'none' ? 'Invalid' : type;
                
    //             return `
    //                 <div class="type-breakdown">
    //                     <span class="type-label">${displayType}:</span>
    //                     <span class="type-score ${className}">${displayText}</span>
    //                 </div>
    //             `;
    //         }).join('');

    //         return `
    //             <div class="program-item">
    //                 <div class="address-type-breakdown">
    //                     ${typeBreakdown}
    //                 </div>
    //             </div>
    //         `;
    //     }).join('');
    // }

    formatItemName(key) {
        // Convert key to readable name (override in site-specific implementations)
        return key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    resetAllScores() {
        if (confirm('Are you sure you want to reset all scores and streak? This cannot be undone.')) {
            this.scores = {};
            this.resetStreak();
            this.saveScores();
            this.updateScoreButton();
            this.populateScoreModal();
        }
    }

    // Method to enable score system display
    enableScoreSystem() {
        const scoreButton = document.querySelector('.score-button');
        const levelInfo = document.querySelector('.level-info');
        
        if (scoreButton) scoreButton.style.display = 'block';
        if (levelInfo) levelInfo.style.display = 'block';
        
        this.updateScoreButton();
    }

    // Method to disable score system display
    disableScoreSystem() {
        const scoreButton = document.querySelector('.score-button');
        const levelInfo = document.querySelector('.level-info');
        
        if (scoreButton) scoreButton.style.display = 'none';
        if (levelInfo) levelInfo.style.display = 'none';
    }
}

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScoreManager;
}
