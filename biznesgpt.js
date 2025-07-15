// BiznesGPT JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Wyświetlanie powitania
    const greetingElement = document.getElementById('greeting');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    
    // Komunikat powitalny
    const welcomeMessage = `
        Witaj w BiznesGPT! 👋
        
        Jestem Twoim asystentem biznesowym AI, gotowym pomóc Ci w:
        • Analizie strategii biznesowej
        • Planowaniu finansowym
        • Optymalizacji procesów
        • Rozwiązywaniu problemów operacyjnych
        
        Zadaj mi pytanie, a postaram się pomóc!
    `;
    
    greetingElement.textContent = welcomeMessage;
    
    // Funkcja obsługi wysłania wiadomości
    function handleSendMessage() {
        const message = userInput.value.trim();
        
        if (message === '') {
            alert('Proszę wpisać pytanie!');
            return;
        }
        
        // Prosty przykład odpowiedzi
        const responses = [
            "Dziękuję za pytanie! To bardzo interesujący temat biznesowy.",
            "Świetne pytanie! W kontekście biznesowym warto rozważyć kilka aspektów.",
            "To ważny element strategii biznesowej. Przeanalizujmy to razem.",
            "Doskonały punkt! Z perspektywy biznesowej mogę zasugerować...",
            "Interesujące zagadnienie! W świecie biznesu często spotykamy się z tym wyzwaniem."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // Wyświetlenie odpowiedzi
        greetingElement.innerHTML = `
            <strong>Twoje pytanie:</strong> ${message}
            <br><br>
            <strong>BiznesGPT:</strong> ${randomResponse}
            <br><br>
            <em>Zadaj kolejne pytanie, aby kontynuować rozmowę!</em>
        `;
        
        // Wyczyszczenie pola input
        userInput.value = '';
    }
    
    // Obsługa kliknięcia przycisku
    sendButton.addEventListener('click', handleSendMessage);
    
    // Obsługa naciśnięcia Enter
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });
    
    // Fokus na pole input przy załadowaniu strony
    userInput.focus();
    
    // Animacja powitania
    setTimeout(function() {
        greetingElement.style.opacity = '0';
        setTimeout(function() {
            greetingElement.style.opacity = '1';
        }, 100);
    }, 500);
});

// Dodatkowe funkcje pomocnicze
function getCurrentTime() {
    return new Date().toLocaleTimeString('pl-PL');
}

function addMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'user-message' : 'bot-message';
    messageDiv.textContent = `[${getCurrentTime()}] ${message}`;
    
    return messageDiv;
}

console.log('BiznesGPT załadowany pomyślnie! 🚀');