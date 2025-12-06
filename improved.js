"use strict";

// Store contestant numbers and names
let contestants = [];
let contestantNames = {};

// Store judge numbers
let judges = [];

// Store category names
let categories = [];
let categoryNames = {};

// Store all scores
const scoresData = {};

// Check if we should remove high and low scores
let dropOutliers = false;

// Carousel variables for winners
let currentCarouselIndex = 0;

// DEMO DATA - Load all demo data from example.json using AJAX
function loadAllDemo() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "example.json", true);
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                const data = JSON.parse(xhr.responseText);

                // Load contestants
                contestants = [];
                contestantNames = {};
                data.contestants.forEach(c => {
                    contestants.push(c.number);
                    contestantNames[c.number] = c.name;
                });

                // Load judges
                judges = [];
                data.judges.forEach(j => {
                    judges.push(j);
                });

                // Load categories
                categories = [];
                categoryNames = {};
                data.categories.forEach(cat => {
                    categories.push(cat.id);
                    categoryNames[cat.id] = cat.name;
                });

                // Clear existing scores
                for (const key in scoresData) {
                    delete scoresData[key];
                }

                // Initialize category arrays in scoresData
                categories.forEach(cat => {
                    scoresData[cat] = [];
                });

                // Load scores into scoresData structured by category
                data.scores.forEach(score => {
                    scoresData[score.category].push({
                        contestantNumber: score.contestant,
                        judgeNumber: score.judge,
                        score: score.score
                    });
                });

                // Save to localStorage
                localStorage.setItem("pageantContestants", JSON.stringify(contestants));
                localStorage.setItem("pageantContestantNames", JSON.stringify(contestantNames));
                localStorage.setItem("pageantJudges", JSON.stringify(judges));
                localStorage.setItem("pageantCategories", JSON.stringify(categories));
                localStorage.setItem("pageantCategoryNames", JSON.stringify(categoryNames));
                localStorage.setItem("pageantScores", JSON.stringify(scoresData));

                // Update displays
                updateContestantDisplay();
                updateJudgeDisplay();
                updateCategoryDisplay();
                generateScoreTables();

                // Calculate final scores automatically
                setTimeout(() => {
                    calculateFinalScores();
                    alert("Demo data loaded successfully! Scores have been calculated.");
                }, 300);

            } catch (err) {
                console.error("Error parsing JSON:", err);
                alert("Could not parse demo JSON. Check console for details.");
            }
        } else {
            console.error("Error loading file. Status:", xhr.status);
            alert("Could not load demo JSON file. Make sure example.json exists in the same directory.");
        }
    };

    xhr.onerror = function() {
        console.error("XMLHttpRequest error occurred");
        alert("Network error when loading demo JSON.");
    };

    xhr.send();
}

// Helper function to update contestant display
function updateContestantDisplay() {
    const display = document.getElementById('contestantListDisplay');
    if (display) {
        let html = '<h4>Demo Contestants Loaded</h4>';
        html += '<table style="border-collapse: collapse; width: 100%;">';
        html += '<thead><tr style="background-color: #000; color: #fff;"><th style="border: 1px solid #000; padding: 8px;">Contestant #</th><th style="border: 1px solid #000; padding: 8px;">Name</th></tr></thead>';
        html += '<tbody>';
        contestants.forEach(c => {
            html += `<tr><td style="border: 1px solid #000; padding: 8px;"><strong>${c}</strong></td><td style="border: 1px solid #000; padding: 8px;">${contestantNames[c]}</td></tr>`;
        });
        html += '</tbody></table>';
        display.innerHTML = html;
    }
}

// Helper function to update judge display
function updateJudgeDisplay() {
    const display = document.getElementById('judgeListDisplay');
    if (display) {
        let html = '<h4>Demo Judges Loaded</h4>';
        html += '<table style="border-collapse: collapse; width: 100%;">';
        html += '<thead><tr style="background-color: #000; color: #fff;"><th style="border: 1px solid #000; padding: 8px;">Judge Number</th></tr></thead>';
        html += '<tbody>';
        judges.forEach(j => {
            html += `<tr><td style="border: 1px solid #000; padding: 8px;"><strong>Judge #${j}</strong></td></tr>`;
        });
        html += '</tbody></table>';
        display.innerHTML = html;
    }
}

// Helper function to update category display
function updateCategoryDisplay() {
    const display = document.getElementById('categoryInputsDisplay');
    if (display) {
        let html = '<h4>Demo Categories Loaded</h4>';
        html += '<table style="border-collapse: collapse; width: 100%;">';
        html += '<thead><tr style="background-color: #000; color: #fff;"><th style="border: 1px solid #000; padding: 8px;">Category ID</th><th style="border: 1px solid #000; padding: 8px;">Category Name</th></tr></thead>';
        html += '<tbody>';
        categories.forEach(c => {
            html += `<tr><td style="border: 1px solid #000; padding: 8px;">${c}</td><td style="border: 1px solid #000; padding: 8px;">${categoryNames[c]}</td></tr>`;
        });
        html += '</tbody></table>';
        display.innerHTML = html;
    }
}

// Save and Load Functions
function saveToStorage() {
    try {
        localStorage.setItem('pageantScores', JSON.stringify(scoresData));
    } catch (e) {
        console.error('Error saving scores to storage:', e);
    }
}

function loadFromStorage() {
    const storedContestants = localStorage.getItem('pageantContestants');
    if (storedContestants) {
        contestants = JSON.parse(storedContestants);
        contestantNames = {};
        for (let i = 0; i < contestants.length; i++) {
            contestantNames[contestants[i]] = 'Contestant #' + contestants[i];
        }
        const display = document.getElementById('contestantListDisplay');
        if (display) {
            let html = '<p><strong>Contestants loaded:</strong> ' + contestants.length + ' contestants</p>';
            display.innerHTML = html;
        }
    }

    const storedCategories = localStorage.getItem('pageantCategories');
    if (storedCategories) {
        categories = JSON.parse(storedCategories);
        const storedCategoryNames = localStorage.getItem('pageantCategoryNames');
        if (storedCategoryNames) {
            categoryNames = JSON.parse(storedCategoryNames);
        }
    }

    const storedJudges = localStorage.getItem('pageantJudges');
    if (storedJudges) {
        judges = JSON.parse(storedJudges);
        const display = document.getElementById('judgeListDisplay');
        if (display) {
            let html = '<p><strong>Judges loaded:</strong> ' + judges.length + ' judges</p>';
            display.innerHTML = html;
        }
    }

    const stored = localStorage.getItem('pageantScores');
    if (stored) {
        const parsed = JSON.parse(stored);
        for (const key in parsed) {
            scoresData[key] = parsed[key];
        }
    }
}

// SETUP FUNCTIONS - Contestants
function setupContestants() {
    console.log('setupContestants called');
    const numInput = document.getElementById('numContestants');
    
    if (!numInput) {
        console.error('numContestants element not found!');
        alert('Error: numContestants element not found');
        return;
    }
    
    const num = parseInt(numInput.value);
    console.log('Number entered:', num);

    if (isNaN(num) || num < 1) {
        alert('Please enter a valid number of contestants (must be 1 or more)');
        return;
    }

    contestants = [];
    contestantNames = {};
    for (let i = 1; i <= num; i++) {
        contestants.push(i);
        contestantNames[i] = 'Contestant #' + i;
    }

    console.log('Contestants array:', contestants);

    const display = document.getElementById('contestantListDisplay');
    if (display) {
        let html = '<p><strong>Contestants created:</strong> ' + num + ' contestants</p>';
        display.innerHTML = html;
        console.log('Display updated successfully');
    } else {
        console.error('contestantListDisplay element not found!');
    }

    localStorage.setItem('pageantContestants', JSON.stringify(contestants));
    console.log('Saved to localStorage');
}

// SETUP FUNCTIONS - Categories
function setupCategories() {
    console.log('setupCategories called');
    const numInput = document.getElementById('numCategories');
    
    if (!numInput) {
        console.error('numCategories element not found!');
        alert('Error: numCategories element not found');
        return;
    }
    
    const num = parseInt(numInput.value);
    console.log('Number of categories entered:', num);

    if (isNaN(num) || num < 1) {
        alert('Please enter a valid number of categories (must be 1 or more)');
        return;
    }

    categories = [];
    categoryNames = {};
    for (let i = 1; i <= num; i++) {
        categories.push('category_' + i);
        categoryNames['category_' + i] = 'Category #' + i;
    }

    console.log('Categories array:', categories);

    const display = document.getElementById('categoryInputsDisplay');
    if (display) {
        let html = '<h4>Enter Category Names</h4>';

        for (let i = 0; i < categories.length; i++) {
            const catKey = categories[i];
            html += '<div style="margin-bottom: 1.5rem;">';
            html += '<label for="categoryName' + i + '" style="display: block; color: #000; font-weight: bold; margin-bottom: 0.5rem;">Category #' + (i + 1) + ' Name:</label>';
            html += '<input type="text" id="categoryName' + i + '" style="width: 100%; padding: 8px; border: 1px solid #000;" placeholder="Enter category name" value="' + categoryNames[catKey] + '">';
            html += '</div>';
        }

        html += '<button style="background-color: #000; color: #fff; border: 2px solid #000; padding: 0.75rem 1.5rem; font-size: 1rem; font-weight: bold; cursor: pointer;" id="saveCatBtn">Save Category Names</button>';
        display.innerHTML = html;

        document.getElementById('saveCatBtn').addEventListener('click', saveCategoryNames);
    }

    localStorage.setItem('pageantCategories', JSON.stringify(categories));
    localStorage.setItem('pageantCategoryNames', JSON.stringify(categoryNames));
}

// Save category names
function saveCategoryNames() {
    for (let i = 0; i < categories.length; i++) {
        const catKey = categories[i];
        const nameInput = document.getElementById('categoryName' + i);
        const name = nameInput.value.trim();
        
        if (name) {
            categoryNames[catKey] = name;
        }
    }

    for (let i = 0; i < categories.length; i++) {
        scoresData[categories[i]] = [];
    }

    localStorage.setItem('pageantCategoryNames', JSON.stringify(categoryNames));
    alert('Category names saved!');
}

// SETUP FUNCTIONS - Judges
function setupJudges() {
    console.log('setupJudges called');
    const numInput = document.getElementById('numJudges');
    
    if (!numInput) {
        console.error('numJudges element not found!');
        alert('Error: numJudges element not found');
        return;
    }
    
    const num = parseInt(numInput.value);
    console.log('Number of judges entered:', num);

    if (isNaN(num) || num < 1) {
        alert('Please enter a valid number of judges (must be 1 or more)');
        return;
    }

    judges = [];
    for (let i = 1; i <= num; i++) {
        judges.push(i);
    }

    console.log('Judges array:', judges);

    const display = document.getElementById('judgeListDisplay');
    if (display) {
        let html = '<p><strong>Judges created:</strong> ' + num + ' judges</p>';
        display.innerHTML = html;
        console.log('Judges display updated successfully');
    } else {
        console.error('judgeListDisplay element not found!');
    }

    generateScoreTables();
    localStorage.setItem('pageantJudges', JSON.stringify(judges));
    console.log('Judges saved to localStorage');
}

// Generate score entry tables
function generateScoreTables() {
    const scoreTableSection = document.getElementById('scoreTableSection');
    const scoreTableContainer = document.getElementById('scoreTableContainer');
    
    if (!scoreTableSection || !scoreTableContainer) {
        console.error('Score table section or container not found');
        return;
    }

    if (!contestants || contestants.length === 0) {
        alert('Please create contestants first');
        return;
    }

    if (!categories || categories.length === 0) {
        alert('Please create categories first');
        return;
    }

    if (!judges || judges.length === 0) {
        alert('Please create judges first');
        return;
    }

    let html = '';

    for (let cat = 0; cat < categories.length; cat++) {
        const category = categories[cat];
        const categoryName = categoryNames[category];

        html += '<div style="background: #fff; border: 2px solid #000; padding: 1.5rem; margin-bottom: 2rem;">';
        html += '<div style="background-color: #000; color: #fff; padding: 1rem; margin: -1.5rem -1.5rem 1rem -1.5rem; font-weight: bold; border-bottom: 2px solid #000;">' + categoryName + '</div>';
        html += '<table style="width: 100%; border-collapse: collapse; border: 1px solid #000;">';
        html += '<thead>';
        html += '<tr>';
        html += '<th style="background-color: #000; color: #fff; padding: 10px; text-align: left; font-weight: bold; border: 1px solid #000;">Contestant #</th>';

        for (let j = 0; j < judges.length; j++) {
            html += '<th style="background-color: #000; color: #fff; padding: 10px; text-align: left; font-weight: bold; border: 1px solid #000;">Judge #' + judges[j] + '</th>';
        }

        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';

        for (let c = 0; c < contestants.length; c++) {
            const contestantNum = contestants[c];
            html += '<tr>';
            html += '<td style="padding: 10px; border: 1px solid #000;"><strong>Contestant #' + contestantNum + '</strong></td>';

            for (let j = 0; j < judges.length; j++) {
                const judgeNum = judges[j];
                const inputId = 'score_' + category + '_' + contestantNum + '_' + judgeNum;
                
                // Check if score already exists in scoresData
                let existingScore = '';
                if (scoresData[category]) {
                    const found = scoresData[category].find(s => s.contestantNumber === contestantNum && s.judgeNumber === judgeNum);
                    if (found) {
                        existingScore = found.score;
                    }
                }
                
                html += '<td style="padding: 10px; border: 1px solid #000;">';
                html += '<input type="number" id="' + inputId + '" style="width: 100%; padding: 8px; border: 1px solid #000;" min="1" max="1000" value="' + existingScore + '">';
                html += '</td>';
            }

            html += '</tr>';
        }

        html += '</tbody>';
        html += '</table>';
        html += '<button style="background-color: #000; color: #fff; border: 2px solid #000; padding: 0.75rem 1.5rem; font-size: 1rem; font-weight: bold; cursor: pointer; margin-top: 1rem;" onclick="saveScoresForCategory(\'' + category + '\')">Save ' + categoryName + ' Scores</button>';
        html += '</div>';
    }

    html += '<button style="background-color: #000; color: #fff; border: 2px solid #000; padding: 0.75rem 1.5rem; font-size: 1rem; font-weight: bold; cursor: pointer;" onclick="calculateFinalScores()">Calculate Final Scores</button>';

    scoreTableContainer.innerHTML = html;
    scoreTableSection.style.display = 'block';
}

// Save scores for a category
function saveScoresForCategory(category) {
    scoresData[category] = [];

    let savedCount = 0;

    for (let c = 0; c < contestants.length; c++) {
        const contestantNum = contestants[c];

        for (let j = 0; j < judges.length; j++) {
            const judgeNum = judges[j];
            const inputId = 'score_' + category + '_' + contestantNum + '_' + judgeNum;
            const input = document.getElementById(inputId);

            if (input && input.value) {
                const score = parseFloat(input.value);
                if (!isNaN(score) && score >= 1 && score <= 1000) {
                    scoresData[category].push({
                        contestantNumber: contestantNum,
                        judgeNumber: judgeNum,
                        score: score
                    });
                    savedCount++;
                }
            }
        }
    }

    alert('Saved ' + savedCount + ' scores for ' + categoryNames[category]);
    saveToStorage();
}

// Toggle outliers
function toggleOutliers() {
    dropOutliers = !dropOutliers;
    const toggle = document.getElementById('outlierToggle');
    if (toggle) {
        toggle.checked = dropOutliers;
    }
}

// Clear all data
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        contestants = [];
        contestantNames = {};
        judges = [];
        categories = [];
        categoryNames = {};
        for (const key in scoresData) {
            delete scoresData[key];
        }
        dropOutliers = false;
        currentCarouselIndex = 0;
      
        localStorage.removeItem('pageantContestants');
        localStorage.removeItem('pageantJudges');
        localStorage.removeItem('pageantCategories');
        localStorage.removeItem('pageantCategoryNames');
        localStorage.removeItem('pageantScores');
        
        document.getElementById('contestantListDisplay').innerHTML = '';
        document.getElementById('categoryInputsDisplay').innerHTML = '';
        document.getElementById('judgeListDisplay').innerHTML = '';
        document.getElementById('scoreTableSection').style.display = 'none';
        document.getElementById('scoreTableContainer').innerHTML = '';
        document.getElementById('finalScoresDisplay').innerHTML = '';
        
        document.getElementById('numContestants').value = '';
        document.getElementById('numCategories').value = '';
        document.getElementById('numJudges').value = '';
        
        alert('All data has been cleared!');
    }
}

// Export to CSV
function exportToCSV() {
    if (Object.keys(scoresData).length === 0) {
        alert('No scores to export. Please enter some scores first.');
        return;
    }

    let csv = 'Contestant,Judge,Category,Score\n';

    for (const category in scoresData) {
        const categoryName = categoryNames[category] || category;
        for (const scoreObj of scoresData[category]) {
            csv += scoreObj.contestantNumber + ',' + scoreObj.judgeNumber + ',' + categoryName + ',' + scoreObj.score + '\n';
        }
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pageant-scores-' + new Date().toISOString().split('T')[0] + '.csv';
    link.click();
    window.URL.revokeObjectURL(url);
    
    alert('Scores exported successfully!');
}

// Get adjusted scores (remove high and low)
function getAdjustedScores(scores) {
    if (scores.length <= 2) {
        return scores;
    }

    const sorted = [];
    for (let i = 0; i < scores.length; i++) {
        sorted.push(scores[i]);
    }

    for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
            if (sorted[j] < sorted[i]) {
                const temp = sorted[i];
                sorted[i] = sorted[j];
                sorted[j] = temp;
            }
        }
    }

    const adjusted = [];
    for (let i = 1; i < sorted.length - 1; i++) {
        adjusted.push(sorted[i]);
    }

    return adjusted;
}

// CAROUSEL FOR WINNERS
function carouselNext() {
    const slides = document.querySelectorAll('.carousel-slide-inline');
    if (slides.length === 0) return;
    currentCarouselIndex = (currentCarouselIndex + 1) % slides.length;
    carouselShow(currentCarouselIndex);
}

function carouselPrev() {
    const slides = document.querySelectorAll('.carousel-slide-inline');
    if (slides.length === 0) return;
    currentCarouselIndex = (currentCarouselIndex - 1 + slides.length) % slides.length;
    carouselShow(currentCarouselIndex);
}

function carouselShow(n) {
    const slides = document.querySelectorAll('.carousel-slide-inline');
    const dots = document.querySelectorAll('.dot-inline');
    
    if (slides.length === 0) return;
    if (n >= slides.length) currentCarouselIndex = 0;
    if (n < 0) currentCarouselIndex = slides.length - 1;
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    slides[currentCarouselIndex].classList.add('active');
    dots[currentCarouselIndex].classList.add('active');
}

// CALCULATE FINAL SCORES
function calculateFinalScores() {
    const contestantScores = {};

    for (let i = 0; i < contestants.length; i++) {
        contestantScores[contestants[i]] = {};
        for (let c = 0; c < categories.length; c++) {
            contestantScores[contestants[i]][categories[c]] = [];
        }
    }

    for (let c = 0; c < categories.length; c++) {
        const category = categories[c];
        if (scoresData[category]) {
            for (let i = 0; i < scoresData[category].length; i++) {
                const item = scoresData[category][i];
                if (contestantScores[item.contestantNumber]) {
                    contestantScores[item.contestantNumber][category].push(item.score);
                }
            }
        }
    }

    const results = [];
    for (const contestantNum in contestantScores) {
        let allScores = [];
        const categoryBreakdown = {};
        const categoryAverages = {};

        for (let i = 0; i < categories.length; i++) {
            const category = categories[i];
            let categoryScores = contestantScores[contestantNum][category];

            categoryBreakdown[category] = categoryScores.slice();

            if (dropOutliers && categoryScores.length > 0) {
                categoryScores = getAdjustedScores(categoryScores);
            }

            if (categoryScores.length > 0) {
                let categoryTotal = 0;
                for (let j = 0; j < categoryScores.length; j++) {
                    categoryTotal += categoryScores[j];
                }
                categoryAverages[category] = (categoryTotal / categoryScores.length).toFixed(2);
            } else {
                categoryAverages[category] = '0.00';
            }

            for (let j = 0; j < categoryScores.length; j++) {
                allScores.push(categoryScores[j]);
            }
        }

        if (allScores.length === 0) {
            continue;
        }

        let total = 0;
        for (let i = 0; i < allScores.length; i++) {
            total += allScores[i];
        }
        const average = (total / allScores.length).toFixed(2);
        
        results.push({
            contestantNumber: contestantNum,
            average: average,
            total: total.toFixed(2),
            categoryBreakdown: categoryBreakdown,
            categoryAverages: categoryAverages
        });
    }

    for (let i = 0; i < results.length; i++) {
        for (let j = i + 1; j < results.length; j++) {
            if (parseFloat(results[j].total) > parseFloat(results[i].total)) {
                const temp = results[i];
                results[i] = results[j];
                results[j] = temp;
            }
        }
    }

    displayFinalScores(results);
}

// DISPLAY FINAL SCORES
function displayFinalScores(results) {
    const display = document.getElementById('finalScoresDisplay');
    let html = '';
    
    if (dropOutliers) {
        html += '<p><em>Outliers Removed (Highest and Lowest scores per category)</em></p>';
    }

    html += '<div style="background: #fff; border: 2px solid #000; padding: 1.5rem; margin-bottom: 2rem;">';
    html += '<div style="background-color: #000; color: #fff; padding: 1rem; margin: -1.5rem -1.5rem 1rem -1.5rem; font-weight: bold; border-bottom: 2px solid #000;">WINNERS & SUMMARY</div>';

    html += '<p><strong>Ranking Method:</strong> Total Scores</p>';

    html += '<h5>Highest Total Score:</h5>';
    let highestTotal = -Infinity;
    let highestTotalContestant = null;
    for (let i = 0; i < results.length; i++) {
        if (parseFloat(results[i].total) > highestTotal) {
            highestTotal = parseFloat(results[i].total);
            highestTotalContestant = results[i];
        }
    }
    html += '<p><strong>Contestant #' + highestTotalContestant.contestantNumber + '</strong> - Total: ' + highestTotalContestant.total + '</p>';

    html += '<h5>Category Winners (by total score):</h5>';
    for (let c = 0; c < categories.length; c++) {
        const category = categories[c];
        const categoryName = categoryNames[category];
        
        let highestCatTotal = -Infinity;
        let totalWinnerContestant = null;
        
        for (let i = 0; i < results.length; i++) {
            let categoryTotal = 0;
            const categoryScores = results[i].categoryBreakdown[category];
            if (categoryScores && categoryScores.length > 0) {
                for (let j = 0; j < categoryScores.length; j++) {
                    categoryTotal += categoryScores[j];
                }
            }
            
            if (categoryTotal > highestCatTotal) {
                highestCatTotal = categoryTotal;
                totalWinnerContestant = results[i].contestantNumber;
            }
        }
        
        html += '<p><strong>' + categoryName + ':</strong> Contestant #' + totalWinnerContestant + ' - Total: ' + highestCatTotal.toFixed(2) + '</p>';
    }

    html += '</div>';

    if (results.length >= 1) {
        html += '<div style="background: #fff; border: 2px solid #000; padding: 1.5rem; margin-bottom: 2rem;">';
        html += '<div style="background-color: #000; color: #fff; padding: 1rem; margin: -1.5rem -1.5rem 1rem -1.5rem; font-weight: bold; border-bottom: 2px solid #000;">TOP 3 WINNERS CAROUSEL</div>';
        html += '<div class="carousel-container-inline">';
        html += '<div class="carousel-wrapper-inline">';

        for (let i = 2; i >= 0; i--) {
            if (i >= results.length) continue;
            
            const result = results[i];
            const isActive = i === 2 ? ' active' : '';
            let medal = '';

            if (i === 0) {
                medal = 'Photos/1st.png';
            } else if (i === 1) {
                medal = 'Photos/2nd.png';
            } else if (i === 2) {
                medal = 'Photos/3rd.png';
            }

            html += '<div class="carousel-slide-inline' + isActive + '">';
            html += '<img src="' + medal + '" alt="Contestant" class="medal-image-inline">';
            html += '<div class="winner-name-inline">Contestant #' + result.contestantNumber + '</div>';
            html += '<p>Total Score: ' + result.total + '</p>';
            html += '</div>';
        }

        html += '</div>';
        html += '<div class="carousel-controls-inline">';
        html += '<button onclick="carouselPrev()">Prev</button>';
        html += '<div class="dots-container-inline">';
        
        for (let i = 0; i < Math.min(3, results.length); i++) {
            const dotActive = i === 0 ? ' active' : '';
            html += '<span class="dot-inline' + dotActive + '" onclick="carouselShow(' + i + ')"></span>';
        }
        
        html += '</div>';
        html += '<button onclick="carouselNext()">Next</button>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
    }

    html += '<div style="background: #fff; border: 2px solid #000; padding: 1.5rem; margin-bottom: 2rem;">';
    html += '<div style="background-color: #000; color: #fff; padding: 1rem; margin: -1.5rem -1.5rem 1rem -1.5rem; font-weight: bold; border-bottom: 2px solid #000;">Detailed Breakdown by Contestant</div>';

    const rankLabels = ['WINNER', '1ST ALTERNATE', '2ND ALTERNATE'];

    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const rankLabel = rankLabels[i] || 'Rank #' + (i + 1);
        
        html += '<div style="margin-bottom: 2rem;">';
        html += '<h5>' + rankLabel + ' - Contestant #' + result.contestantNumber + '</h5>';
      
        html += '<h6>Category Breakdown:</h6>';
        html += '<table style="width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 0.95rem; margin: 10px 0;">';
        html += '<thead><tr style="background-color: #000; color: #fff;"><th style="border: 1px solid #000; padding: 8px; text-align: left;">Category</th><th style="border: 1px solid #000; padding: 8px; text-align: left;">Total Score</th><th style="border: 1px solid #000; padding: 8px; text-align: left;">Average</th></tr></thead>';
        html += '<tbody>';
        
        for (let j = 0; j < categories.length; j++) {
            const category = categories[j];
            const categoryScores = result.categoryBreakdown[category];
            
            let totalCategoryScore = 0;
            
            if (categoryScores && categoryScores.length > 0) {
                for (let k = 0; k < categoryScores.length; k++) {
                    totalCategoryScore += categoryScores[k];
                }
            }
            
            const categoryName = categoryNames[category];
            const categoryAverage = result.categoryAverages[category];
            html += '<tr>';
            html += '<td style="border: 1px solid #000; padding: 8px;">' + categoryName + '</td>';
            html += '<td style="border: 1px solid #000; padding: 8px;"><strong>' + totalCategoryScore + '</strong></td>';
            html += '<td style="border: 1px solid #000; padding: 8px;"><strong>' + categoryAverage + '</strong></td>';
            html += '</tr>';
        }
        
        html += '</tbody></table>';
        
        html += '<div style="margin: 15px 0; padding: 10px; border: 1px solid #000;">';
        html += '<p><strong>Total All Scores:</strong> ' + result.total + '</p>';
        html += '</div>';
        
        html += '</div>';
    }

    html += '</div>';

    html += '<div style="background: #fff; border: 2px solid #000; padding: 1.5rem; margin-bottom: 2rem;">';
    html += '<div style="background-color: #000; color: #fff; padding: 1rem; margin: -1.5rem -1.5rem 1rem -1.5rem; font-weight: bold; border-bottom: 2px solid #000;">Judge Overall Averages Per Contestant</div>';
    html += '<table style="width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 0.95rem; margin: 10px 0;">';
    html += '<thead><tr style="background-color: #000; color: #fff;"><th style="border: 1px solid #000; padding: 8px; text-align: left;">Contestant #</th>';
    
    for (let j = 0; j < judges.length; j++) {
        html += '<th style="border: 1px solid #000; padding: 8px; text-align: left;">Judge #' + judges[j] + '</th>';
    }
    html += '<th style="border: 1px solid #000; padding: 8px; text-align: left;">Judge Avg</th></tr></thead>';
    html += '<tbody>';

    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        html += '<tr>';
        html += '<td style="border: 1px solid #000; padding: 8px;"><strong>Contestant #' + result.contestantNumber + '</strong></td>';

        const judgeAverages = {};
        for (let c = 0; c < categories.length; c++) {
            const category = categories[c];
            if (scoresData[category]) {
                for (let s = 0; s < scoresData[category].length; s++) {
                    const scoreItem = scoresData[category][s];
                    if (scoreItem.contestantNumber == result.contestantNumber) {
                        if (!judgeAverages[scoreItem.judgeNumber]) {
                            judgeAverages[scoreItem.judgeNumber] = [];
                        }
                        judgeAverages[scoreItem.judgeNumber].push(scoreItem.score);
                    }
                }
            }
        }

        let allJudgeScores = [];
        for (let j = 0; j < judges.length; j++) {
            const judgeNum = judges[j];
            let judgeAvg = '-';
            if (judgeAverages[judgeNum]) {
                let judgeTotal = 0;
                for (let s = 0; s < judgeAverages[judgeNum].length; s++) {
                    judgeTotal += judgeAverages[judgeNum][s];
                    allJudgeScores.push(judgeAverages[judgeNum][s]);
                }
                judgeAvg = (judgeTotal / judgeAverages[judgeNum].length).toFixed(2);
            }
            html += '<td style="border: 1px solid #000; padding: 8px;">' + judgeAvg + '</td>';
        }

        let judgeOverallAvg = '-';
        if (allJudgeScores.length > 0) {
            let totalJudgeScores = 0;
            for (let s = 0; s < allJudgeScores.length; s++) {
                totalJudgeScores += allJudgeScores[s];
            }
            judgeOverallAvg = (totalJudgeScores / allJudgeScores.length).toFixed(2);
        }
        html += '<td style="border: 1px solid #000; padding: 8px;"><strong>' + judgeOverallAvg + '</strong></td>';
        html += '</tr>';
    }

    html += '</tbody></table>';
    html += '</div>';

    display.innerHTML = html;
}

// jQuery Accordion initialization
$(document).ready(function() {
    $("#accordion").accordion({
        collapsible: true,
        active: 0
    });
});

// Load stored data on page load
loadFromStorage();

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const createContestantBtn = document.getElementById('createContestantBtn');
    const createCategoryBtn = document.getElementById('createCategoryBtn');
    const createJudgeBtn = document.getElementById('createJudgeBtn');
    const calculateBtn = document.getElementById('calculateBtn');
    const exportBtn = document.getElementById('exportBtn');
    const clearBtn = document.getElementById('clearBtn');
    const outlierToggle = document.getElementById('outlierToggle');
    const loadDemoBtn = document.getElementById('loadDemoBtn');

    if (createContestantBtn) createContestantBtn.addEventListener('click', setupContestants);
    if (createCategoryBtn) createCategoryBtn.addEventListener('click', setupCategories);
    if (createJudgeBtn) createJudgeBtn.addEventListener('click', setupJudges);
    if (calculateBtn) calculateBtn.addEventListener('click', calculateFinalScores);
    if (exportBtn) exportBtn.addEventListener('click', exportToCSV);
    if (clearBtn) clearBtn.addEventListener('click', clearAllData);
    if (outlierToggle) outlierToggle.addEventListener('change', toggleOutliers);
    if (loadDemoBtn) loadDemoBtn.addEventListener('click', loadAllDemo);
});