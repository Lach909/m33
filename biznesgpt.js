// BiznesGPT - JavaScript functionality

// Global variables
let currentData = [];
let analysisResults = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('BiznesGPT initialized');
    initializeApp();
});

function initializeApp() {
    // Set up event listeners
    const businessDataTextarea = document.getElementById('businessData');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    // Auto-save functionality
    businessDataTextarea.addEventListener('input', function() {
        localStorage.setItem('biznesGPT_data', this.value);
    });
    
    // Load saved data
    const savedData = localStorage.getItem('biznesGPT_data');
    if (savedData) {
        businessDataTextarea.value = savedData;
    }
    
    // Initialize table
    updateDataTable();
}

// Main analysis function
function analyzeData() {
    const businessData = document.getElementById('businessData').value.trim();
    
    if (!businessData) {
        showMessage('Wprowadź dane do analizy', 'error');
        return;
    }
    
    // Show loading state
    const analyzeBtn = document.getElementById('analyzeBtn');
    const originalText = analyzeBtn.textContent;
    analyzeBtn.innerHTML = '<span class="loading"></span> Analizuję...';
    analyzeBtn.disabled = true;
    
    // Simulate analysis delay
    setTimeout(() => {
        try {
            // Parse and analyze data
            const parsedData = parseBusinessData(businessData);
            const analysis = performAnalysis(parsedData);
            
            // Update results
            displayResults(analysis);
            updateDataTable(parsedData);
            
            showMessage('Analiza zakończona pomyślnie', 'success');
        } catch (error) {
            showMessage('Błąd podczas analizy: ' + error.message, 'error');
        } finally {
            // Restore button state
            analyzeBtn.textContent = originalText;
            analyzeBtn.disabled = false;
        }
    }, 1500);
}

// Parse business data from text input
function parseBusinessData(data) {
    const lines = data.split('\n').filter(line => line.trim());
    const parsedData = [];
    
    lines.forEach((line, index) => {
        const parts = line.split(',').map(part => part.trim());
        if (parts.length >= 2) {
            parsedData.push({
                id: index + 1,
                parameter: parts[0],
                value: parts[1],
                unit: parts[2] || '',
                rawLine: line
            });
        }
    });
    
    if (parsedData.length === 0) {
        throw new Error('Nie znaleziono danych do analizy. Użyj formatu: parametr, wartość, jednostka');
    }
    
    return parsedData;
}

// Perform business analysis
function performAnalysis(data) {
    const analysis = {
        summary: {
            totalParameters: data.length,
            numericValues: 0,
            textValues: 0
        },
        insights: [],
        recommendations: []
    };
    
    // Analyze each data point
    data.forEach(item => {
        const numericValue = parseFloat(item.value);
        if (!isNaN(numericValue)) {
            analysis.summary.numericValues++;
            
            // Generate insights based on numeric values
            if (numericValue > 100) {
                analysis.insights.push(`${item.parameter}: Wysoka wartość (${numericValue})`);
            } else if (numericValue < 10) {
                analysis.insights.push(`${item.parameter}: Niska wartość (${numericValue})`);
            }
        } else {
            analysis.summary.textValues++;
        }
    });
    
    // Generate recommendations
    if (analysis.summary.numericValues > 0) {
        analysis.recommendations.push('Zidentyfikowano ' + analysis.summary.numericValues + ' parametrów liczbowych do dalszej analizy.');
    }
    
    if (analysis.summary.textValues > 0) {
        analysis.recommendations.push('Zidentyfikowano ' + analysis.summary.textValues + ' parametrów tekstowych wymagających interpretacji.');
    }
    
    analysis.recommendations.push('Rozważ dodanie więcej szczegółów do analizy dla lepszych wyników.');
    
    return analysis;
}

// Display analysis results
function displayResults(analysis) {
    const resultsContainer = document.getElementById('resultsContainer');
    
    let resultText = `=== ANALIZA BIZNESOWA ===\n\n`;
    resultText += `Podsumowanie:\n`;
    resultText += `- Całkowita liczba parametrów: ${analysis.summary.totalParameters}\n`;
    resultText += `- Wartości liczbowe: ${analysis.summary.numericValues}\n`;
    resultText += `- Wartości tekstowe: ${analysis.summary.textValues}\n\n`;
    
    if (analysis.insights.length > 0) {
        resultText += `Spostrzeżenia:\n`;
        analysis.insights.forEach(insight => {
            resultText += `- ${insight}\n`;
        });
        resultText += '\n';
    }
    
    if (analysis.recommendations.length > 0) {
        resultText += `Rekomendacje:\n`;
        analysis.recommendations.forEach(recommendation => {
            resultText += `- ${recommendation}\n`;
        });
    }
    
    resultsContainer.textContent = resultText;
    analysisResults = analysis;
}

// Update data table
function updateDataTable(data = null) {
    const tableBody = document.getElementById('dataTableBody');
    tableBody.innerHTML = '';
    
    if (!data || data.length === 0) {
        const row = tableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 3;
        cell.textContent = 'Brak danych do wyświetlenia';
        cell.style.textAlign = 'center';
        cell.style.color = '#666';
        return;
    }
    
    data.forEach(item => {
        const row = tableBody.insertRow();
        
        const paramCell = row.insertCell();
        paramCell.textContent = item.parameter;
        
        const valueCell = row.insertCell();
        valueCell.textContent = item.value + (item.unit ? ' ' + item.unit : '');
        
        const analysisCell = row.insertCell();
        const numericValue = parseFloat(item.value);
        if (!isNaN(numericValue)) {
            if (numericValue > 100) {
                analysisCell.textContent = 'Wysoka wartość';
                analysisCell.style.color = '#dc3545';
            } else if (numericValue < 10) {
                analysisCell.textContent = 'Niska wartość';
                analysisCell.style.color = '#ffc107';
            } else {
                analysisCell.textContent = 'Wartość normalna';
                analysisCell.style.color = '#28a745';
            }
        } else {
            analysisCell.textContent = 'Wartość tekstowa';
            analysisCell.style.color = '#6c757d';
        }
    });
    
    currentData = data;
}

// Clear all data
function clearData() {
    if (confirm('Czy na pewno chcesz wyczyścić wszystkie dane?')) {
        document.getElementById('businessData').value = '';
        document.getElementById('resultsContainer').textContent = '';
        localStorage.removeItem('biznesGPT_data');
        currentData = [];
        analysisResults = {};
        updateDataTable();
        showMessage('Dane zostały wyczyszczone', 'success');
    }
}

// File operations
function saveToFile() {
    const filename = document.getElementById('filename').value || 'biznesgpt.csv';
    const businessData = document.getElementById('businessData').value;
    
    if (!businessData.trim()) {
        showMessage('Brak danych do zapisania', 'error');
        return;
    }
    
    // Prepare CSV content
    let csvContent = 'Parametr,Wartość,Jednostka,Analiza\n';
    
    if (currentData.length > 0) {
        currentData.forEach(item => {
            const analysis = getAnalysisForItem(item);
            csvContent += `"${item.parameter}","${item.value}","${item.unit}","${analysis}"\n`;
        });
    } else {
        // Fallback to raw data
        const lines = businessData.split('\n').filter(line => line.trim());
        lines.forEach(line => {
            const parts = line.split(',').map(part => part.trim());
            csvContent += `"${parts[0] || ''}","${parts[1] || ''}","${parts[2] || ''}",""\n`;
        });
    }
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showMessage('Plik został zapisany: ' + filename, 'success');
}

function loadFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const lines = content.split('\n').filter(line => line.trim());
            
            // Skip header if present
            let dataLines = lines;
            if (lines[0] && lines[0].toLowerCase().includes('parametr')) {
                dataLines = lines.slice(1);
            }
            
            // Convert CSV to text format
            const textData = dataLines.map(line => {
                const parts = line.split(',').map(part => part.replace(/"/g, '').trim());
                return parts.join(', ');
            }).join('\n');
            
            document.getElementById('businessData').value = textData;
            localStorage.setItem('biznesGPT_data', textData);
            
            showMessage('Plik został wczytany: ' + file.name, 'success');
        } catch (error) {
            showMessage('Błąd podczas wczytywania pliku: ' + error.message, 'error');
        }
    };
    
    reader.readAsText(file);
}

// Helper functions
function getAnalysisForItem(item) {
    const numericValue = parseFloat(item.value);
    if (!isNaN(numericValue)) {
        if (numericValue > 100) return 'Wysoka wartość';
        if (numericValue < 10) return 'Niska wartość';
        return 'Wartość normalna';
    }
    return 'Wartość tekstowa';
}

function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert message at the top of main container
    const mainContainer = document.querySelector('.main-container');
    mainContainer.insertBefore(messageDiv, mainContainer.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        parseBusinessData,
        performAnalysis,
        getAnalysisForItem
    };
}