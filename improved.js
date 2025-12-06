"use strict";

// store contestant numbers and names
let contestants = [];
let contestantNames = {};

// store judge numbers
let judges = [];

// store category names
let categories = [];
let categoryNames = {};

// store all scores
const scoresData = {};

// check if we should remove high and low scores
let dropOutliers = false;

// carousel variables
let currentCarouselIndex = 0;

// create contestant list
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
    }

    localStorage.setItem('pageantContestants', JSON.stringify(contestants));
}

// create category list
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
            html += '<div class="mb-3">';
            html += '<label for="categoryName' + i + '" class="form-label">Category #' + (i + 1) + ' Name:</label>';
            html += '<input type="text" id="categoryName' + i + '" class="form-control" placeholder="Enter category name" value="' + categoryNames[catKey] + '">';
            html += '</div>';
        }

        html += '<button id="saveCatBtn" class="btn btn-success">Save Category Names</button>';
        display.innerHTML = html;

        document.getElementById('saveCatBtn').addEventListener('click', saveCategoryNames);
    }

    localStorage.setItem('pageantCategories', JSON.stringify(categories));
    localStorage.setItem('pageantCategoryNames', JSON.stringify(categoryNames));
}

// Save the category names user typed
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

// create judge list
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
    }

    generateScoreTables();
    localStorage.setItem('pageantJudges', JSON.stringify(judges));
}

// create the score input tables for each category
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

        html += '<div class="card mb-4">';
        html += '<div class="card-header">';
        html += '<h4>' + categoryName + '</h4>';
        html += '</div>';
        html += '<table class="table table-bordered">';
        html += '<thead>';
        html += '<tr>';
        html += '<th>Contestant #</th>';

        for (let j = 0; j < judges.length; j++) {
            html += '<th>Judge #' + judges[j] + '</th>';
        }

        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';

        for (let c = 0; c < contestants.length; c++) {
            const contestantNum = contestants[c];
            html += '<tr>';
            html += '<td><strong>Contestant #' + contestantNum + '</strong></td>';

            for (let j = 0; j < judges.length; j++) {
                const judgeNum = judges[j];
                const inputId = 'score_' + category + '_' + contestantNum + '_' + judgeNum;
                html += '<td>';
                html += '<input type="number" id="' + inputId + '" class="form-control" min="1" max="1000" value="">';
                html += '</td>';
            }

            html += '</tr>';
        }

        html += '</tbody>';
        html += '</table>';
        html += '<button class="btn btn-success mt-2" data-category="' + category + '">Save ' + categoryName + ' Scores</button>';
        html += '</div>';
    }

    html += '<button class="btn btn-primary mt-3" id="calcBtn">Calculate Final Scores</button>';

    scoreTableContainer.innerHTML = html;
    scoreTableSection.style.display = 'block';

    // attach save button listeners
    const saveButtons = scoreTableContainer.querySelectorAll('button.btn-success');
    saveButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            saveScoresForCategory(this.getAttribute('data-category'));
        });
    });

    // attach calculate button listener
    const calcBtn = document.getElementById('calcBtn');
    if (calcBtn) {
        calcBtn.addEventListener('click', calculateFinalScores);
    }
}

// save all scores for one category
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

// turn on/off outlier removal
function toggleOutliers() {
    dropOutliers = !dropOutliers;
}

// clear all data and reset the calculator
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

// export scores to csv file
function exportToCSV() {
    if (Object.keys(scoresData).length === 0) {
        alert('No scores to export. Please enter some scores first.');
        return;
    }

    let csv = 'Contestant,Judge,Category,Score\n';

    for (const category in scoresData) {
        for (const scoreObj of scoresData[category]) {
            csv += scoreObj.contestantNumber + ',' + scoreObj.judgeNumber + ',' + category + ',' + scoreObj.score + '\n';
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

// remove the highest and lowest score from a list
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

// carousel functions
function carouselNext() {
    const slides = document.querySelectorAll('.carousel-slide');
    if (slides.length === 0) return;
    currentCarouselIndex = (currentCarouselIndex + 1) % slides.length;
    carouselShow(currentCarouselIndex);
}

function carouselPrev() {
    const slides = document.querySelectorAll('.carousel-slide');
    if (slides.length === 0) return;
    currentCarouselIndex = (currentCarouselIndex - 1 + slides.length) % slides.length;
    carouselShow(currentCarouselIndex);
}

function carouselShow(n) {
    const slides = document.querySelectorAll('.carousel-slide');
    const counter = document.getElementById('carouselCounter');
    
    if (slides.length === 0) return;
    if (n >= slides.length) currentCarouselIndex = 0;
    if (n < 0) currentCarouselIndex = slides.length - 1;
    
    slides.forEach(slide => slide.classList.remove('active'));
    slides[currentCarouselIndex].classList.add('active');
    
    if (counter) {
        counter.textContent = (currentCarouselIndex + 1) + ' / ' + slides.length;
    }
}

// calculate final scores and rank contestants
function calculateFinalScores() {
    console.log('calculateFinalScores called');
    const contestantScores = {};

    for (let i = 0; i < contestants.length; i++) {
        contestantScores[contestants[i]] = {};
        for (let c = 0; c < categories.length; c++) {
            contestantScores[contestants[i]][categories[c]] = [];
        }
    }

    for (let c = 0; c < categories.length; c++) {
        const category = categories[c];
        for (let i = 0; i < scoresData[category].length; i++) {
            const item = scoresData[category][i];
            if (contestantScores[item.contestantNumber]) {
                contestantScores[item.contestantNumber][category].push(item.score);
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

    console.log('Final calculation results (pre-display):', results);
    displayFinalScores(results);
}

// show all the results on the page
function displayFinalScores(results) {
    const display = document.getElementById('finalScoresDisplay');
    const carouselContainer = document.getElementById('carouselContainer');
    const carouselSlides = document.getElementById('carouselSlides');
    
    if (!display) return;
    
    // clear previous content
    display.innerHTML = '';
    carouselSlides.innerHTML = '';
    currentCarouselIndex = 0;
    
    // create carousel slides for each result
    if (results.length > 0) {
        const rankLabels = ['WINNER', '1ST ALTERNATE', '2ND ALTERNATE'];
        
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const rankLabel = rankLabels[i] || 'Rank #' + (i + 1);
            
            let slideHtml = '<div class="carousel-slide' + (i === 0 ? ' active' : '') + '">';
            slideHtml += '<h3>' + rankLabel + ' - Contestant #' + result.contestantNumber + '</h3>';
            slideHtml += '<p><strong>Total Score:</strong> ' + result.total + '</p>';
            slideHtml += '<p><strong>Average Score:</strong> ' + result.average + '</p>';
            
            slideHtml += '<h4>Category Breakdown:</h4>';
            slideHtml += '<table>';
            slideHtml += '<thead><tr><th>Category</th><th>Total Score</th><th>Average</th></tr></thead>';
            slideHtml += '<tbody>';
            
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
                slideHtml += '<tr>';
                slideHtml += '<td>' + categoryName + '</td>';
                slideHtml += '<td><strong>' + totalCategoryScore + '</strong></td>';
                slideHtml += '<td><strong>' + categoryAverage + '</strong></td>';
                slideHtml += '</tr>';
            }
            
            slideHtml += '</tbody></table>';
            slideHtml += '</div>';
            
            carouselSlides.innerHTML += slideHtml;
        }
        
        // show carousel and update counter
        carouselContainer.style.display = 'block';
        const counter = document.getElementById('carouselCounter');
        if (counter) {
            counter.textContent = '1 / ' + results.length;
        }
        
        // attach event listeners to carousel buttons
        const prevBtn = document.getElementById('carouselPrevBtn');
        const nextBtn = document.getElementById('carouselNextBtn');
        if (prevBtn) prevBtn.removeEventListener('click', carouselPrev);
        if (nextBtn) nextBtn.removeEventListener('click', carouselNext);
        if (prevBtn) prevBtn.addEventListener('click', carouselPrev);
        if (nextBtn) nextBtn.addEventListener('click', carouselNext);
    } else {
        carouselContainer.style.display = 'none';
    }

    // also display traditional final scores view below carousel
    let html = '';
    
    if (dropOutliers) {
        html += '<p><em>Outliers Removed</em></p>';
    }

    html += '<div style="margin-top: 2rem;">';
    html += '<h3>All Rankings - Detailed View</h3>';

    const rankLabels = ['WINNER', '1ST ALTERNATE', '2ND ALTERNATE'];

    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const rankLabel = rankLabels[i] || 'Rank #' + (i + 1);
        
        html += '<div style="margin: 1.5rem 0; padding: 1rem; border: 1px solid #ddd;">';
        html += '<h4>' + rankLabel + ' - Contestant #' + result.contestantNumber + '</h4>';
        
        html += '<p><strong>Total Score:</strong> ' + result.total + '</p>';
        html += '<p><strong>Average Score:</strong> ' + result.average + '</p>';
        
        html += '<h5>Category Breakdown:</h5>';
        html += '<table class="demo-table">';
        html += '<thead><tr><th>Category</th><th>Total Score</th><th>Average</th></tr></thead>';
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
            html += '<td>' + categoryName + '</td>';
            html += '<td><strong>' + totalCategoryScore + '</strong></td>';
            html += '<td><strong>' + categoryAverage + '</strong></td>';
            html += '</tr>';
        }
        
        html += '</tbody></table>';
        html += '</div>';
    }

    html += '</div>';
    display.innerHTML = html;
}

// save scores to browser storage
function saveToStorage() {
    localStorage.setItem('pageantScores', JSON.stringify(scoresData));
}

// load saved data from browser storage when page opens
function loadFromStorage() {
    const storedContestants = localStorage.getItem('pageantContestants');
    if (storedContestants) {
        contestants = JSON.parse(storedContestants);
        contestantNames = {};
        for (let i = 0; i < contestants.length; i++) {
            contestantNames[contestants[i]] = 'Contestant #' + contestants[i];
        }
    }

    const storedCategories = localStorage.getItem('pageantCategories');
    if (storedCategories) {
        categories = JSON.parse(storedCategories);
        const storedCategoryNames = localStorage.getItem('pageantCategoryNames');
        if (storedCategoryNames) {
            categoryNames = JSON.parse(storedCategoryNames);
        }
        for (let i = 0; i < categories.length; i++) {
            scoresData[categories[i]] = [];
        }
    }

    const storedJudges = localStorage.getItem('pageantJudges');
    if (storedJudges) {
        judges = JSON.parse(storedJudges);
    }

    const stored = localStorage.getItem('pageantScores');
    if (stored) {
        const parsed = JSON.parse(stored);
        for (const key in parsed) {
            scoresData[key] = parsed[key];
        }
    }
}

// demo data - load all demo data from example.json using ajax
function loadAllDemo() {
    console.log('Starting demo data load...');
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "example.json", true);
    
    xhr.onload = function() {
        console.log('XHR loaded, status:', xhr.status);
        if (xhr.status === 200) {
            try {
                console.log('Raw response:', xhr.responseText);
                const data = JSON.parse(xhr.responseText);
                console.log('Parsed successfully:', data);

                if (!data || typeof data !== 'object') {
                    alert("Invalid data structure");
                    return;
                }

                // load contestants - with safety checks
                contestants = [];
                contestantNames = {};
                if (data.contestants && Array.isArray(data.contestants) && data.contestants.length > 0) {
                    data.contestants.forEach(c => {
                        if (c && typeof c === 'object' && c.number !== undefined && c.name) {
                            contestants.push(c.number);
                            contestantNames[c.number] = c.name;
                        }
                    });
                    console.log('Loaded contestants:', contestants);
                }

                // load judges - with safety checks
                judges = [];
                if (data.judges && Array.isArray(data.judges) && data.judges.length > 0) {
                    judges = data.judges.slice();
                    console.log('Loaded judges:', judges);
                }

                // load categories - with safety checks
                categories = [];
                categoryNames = {};
                if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
                    data.categories.forEach(cat => {
                        if (cat && typeof cat === 'object' && cat.name) {
                            categories.push(cat.name);
                            categoryNames[cat.name] = cat.name;
                        }
                    });
                    console.log('Loaded categories:', categories);
                }

                // clear existing scores
                for (const key in scoresData) {
                    delete scoresData[key];
                }

                // initialize category arrays
                categories.forEach(cat => {
                    scoresData[cat] = [];
                });

                // load scores - with safety checks
                if (data.scores && Array.isArray(data.scores) && data.scores.length > 0) {
                    data.scores.forEach(score => {
                        if (score && typeof score === 'object' && score.category && score.contestant !== undefined && score.judge !== undefined && score.score !== undefined) {
                            if (!scoresData[score.category]) {
                                scoresData[score.category] = [];
                            }
                            scoresData[score.category].push({
                                contestantNumber: score.contestant,
                                judgeNumber: score.judge,
                                score: score.score
                            });
                        }
                    });
                    console.log('Loaded scores:', scoresData);
                }

                // save to localstorage
                localStorage.setItem("pageantContestants", JSON.stringify(contestants));
                localStorage.setItem("pageantContestantNames", JSON.stringify(contestantNames));
                localStorage.setItem("pageantJudges", JSON.stringify(judges));
                localStorage.setItem("pageantCategories", JSON.stringify(categories));
                localStorage.setItem("pageantCategoryNames", JSON.stringify(categoryNames));
                localStorage.setItem("pageantScores", JSON.stringify(scoresData));

                // update displays
                updateContestantDisplay();
                updateJudgeDisplay();
                updateCategoryDisplay();
                generateScoreTables();

                // calculate final scores
                setTimeout(() => {
                    calculateFinalScores();
                    alert("Demo data loaded successfully!");
                }, 300);

            } catch (err) {
                console.error("Parse error:", err);
                alert("Error: " + err.message);
            }
        } else {
            alert("Failed to load example.json (Status: " + xhr.status + ")");
        }
    };

    xhr.onerror = function() {
        alert("Cannot load example.json - check file exists in root directory");
    };

    xhr.send();
}

// helper function to update contestant display
function updateContestantDisplay() {
    const display = document.getElementById('contestantListDisplay');
    if (display) {
        let html = '<h4>Demo Contestants Loaded</h4>';
        html += '<table class="table table-sm">';
        html += '<thead><tr><th>Contestant #</th><th>Name</th></tr></thead>';
        html += '<tbody>';
        contestants.forEach(c => {
            html += `<tr><td><strong>${c}</strong></td><td>${contestantNames[c]}</td></tr>`;
        });
        html += '</tbody></table>';
        display.innerHTML = html;
    }
}

// helper function to update judge display
function updateJudgeDisplay() {
    const display = document.getElementById('judgeListDisplay');
    if (display) {
        let html = '<h4>Demo Judges Loaded</h4>';
        html += '<table class="table table-sm">';
        html += '<thead><tr><th>Judge Number</th></tr></thead>';
        html += '<tbody>';
        judges.forEach(j => {
            html += `<tr><td><strong>Judge #${j}</strong></td></tr>`;
        });
        html += '</tbody></table>';
        display.innerHTML = html;
    }
}

// helper function to update category display
function updateCategoryDisplay() {
    const display = document.getElementById('categoryInputsDisplay');
    if (display) {
        let html = '<h4>Demo Categories Loaded</h4>';
        html += '<table class="table table-sm">';
        html += '<thead><tr><th>Category ID</th><th>Category Name</th></tr></thead>';
        html += '<tbody>';
        categories.forEach(c => {
            html += `<tr><td>${c}</td><td>${categoryNames[c]}</td></tr>`;
        });
        html += '</tbody></table>';
        display.innerHTML = html;
    }
}

// main initialization - only runs once when dom is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DOM Content Loaded ===');
    
    // load stored data
    loadFromStorage();
    
    // initialize accordion
    $("#accordion").accordion({
        collapsible: true,
        active: 0
    });
    
    // get all buttons
    const createContestantBtn = document.getElementById('createContestantBtn');
    const createCategoryBtn = document.getElementById('createCategoryBtn');
    const createJudgeBtn = document.getElementById('createJudgeBtn');
    const calculateBtn = document.getElementById('calculateBtn');
    const exportBtn = document.getElementById('exportBtn');
    const clearBtn = document.getElementById('clearBtn');
    const outlierToggle = document.getElementById('outlierToggle');
    const loadDemoBtn = document.getElementById('loadDemoBtn');

    console.log('Button check:', {
        createContestant: !!createContestantBtn,
        createCategory: !!createCategoryBtn,
        createJudge: !!createJudgeBtn,
        calculate: !!calculateBtn,
        export: !!exportBtn,
        clear: !!clearBtn,
        toggle: !!outlierToggle,
        demo: !!loadDemoBtn
    });

    // Attach event listeners
    if (createContestantBtn) {
        createContestantBtn.addEventListener('click', setupContestants);
        console.log('✓ Contestant button ready');
    }
    if (createCategoryBtn) {
        createCategoryBtn.addEventListener('click', setupCategories);
        console.log('✓ Category button ready');
    }
    if (createJudgeBtn) {
        createJudgeBtn.addEventListener('click', setupJudges);
        console.log('✓ Judge button ready');
    }
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateFinalScores);
        console.log('✓ Calculate button ready');
    }
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
        console.log('✓ Export button ready');
    }
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAllData);
        console.log('✓ Clear button ready');
    }
    if (outlierToggle) {
        outlierToggle.addEventListener('change', toggleOutliers);
        console.log('✓ Outlier toggle ready');
    }
    if (loadDemoBtn) {
        loadDemoBtn.addEventListener('click', loadAllDemo);
        console.log('✓ Demo button ready');
    }
});