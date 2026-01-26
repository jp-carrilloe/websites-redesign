const supabaseUrl = "https://kostnrxyjxuiutbtncyp.supabase.co/functions/v1/generate";
const MESSAGE_LIMIT = 10;

// UI Elements
const aiInput = document.getElementById('ai-input');
const aiBtn = document.getElementById('ai-btn');
const aiResultContainer = document.getElementById('ai-result-container');
const aiLoading = document.getElementById('ai-loading');
const aiResponse = document.getElementById('ai-response');
const aiCta = document.getElementById('ai-cta');
const cursor = document.getElementById('cursor');

// Custom Cursor
document.addEventListener('mousemove', (e) => {
    if (cursor) {
        cursor.style.left = e.clientX - 12 + 'px';
        cursor.style.top = e.clientY - 12 + 'px';
    }
});

document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.style.transform = 'scale(1.5)');
    el.addEventListener('mouseleave', () => cursor.style.transform = 'scale(1)');
});

function getLimitStatus() {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('zd_limit_date');
    let count = parseInt(localStorage.getItem('zd_message_count') || '0');

    if (lastDate !== today) {
        count = 0;
        localStorage.setItem('zd_limit_date', today);
        localStorage.setItem('zd_message_count', '0');
    }
    return count;
}

function incrementMessageCount() {
    const current = getLimitStatus();
    localStorage.setItem('zd_message_count', (current + 1).toString());
}

// AI Recommendation Logic
async function getAiRecommendation() {
    const userQuery = aiInput.value.trim();
    if (!userQuery) return;

    // Check Limit (10 per day)
    if (getLimitStatus() >= MESSAGE_LIMIT) {
        aiResultContainer.classList.remove('hidden');
        aiResponse.innerHTML = "<span class='text-red-400 font-medium'>Du har nått din dagliga gräns på 10 meddelanden för denna demo. Vänligen kontakta ägaren för att få fler krediter.</span>";
        aiCta.classList.add('hidden');
        return;
    }

    // UI Feedback
    aiResultContainer.classList.remove('hidden');
    aiLoading.classList.remove('hidden');
    aiResponse.innerText = "";
    aiCta.classList.add('hidden');
    aiBtn.disabled = true;

    const systemPrompt = `Du är en expert-tandvårdskoordinator för kliniken Zen Dentistry i Stockholm. 
    Vårt sortiment inkluderar: 
    - Invisalign (osynlig tandställning för vuxna och tonåringar)
    - Skalfasader (keramiska för perfekt estetik)
    - Tandblekning (klinikblekning med Zoom)
    - Tandimplantat (permanenta lösningar för förlorade tänder)
    - Allmän tandvård (undersökning, lagningar)
    - Airflow (professionell rengöring).
    
    Baserat på användarens beskrivning, rekommendera EN eller TVÅ mest lämpliga behandlingar. 
    Svara vänligt, förtroendeingivande och kortfattat (max 3-4 meningar). 
    Språk: Svenska. Avsluta med att säga att en klinisk undersökning alltid krävs för en definitiv behandlingsplan.`;

    const payload = {
        contents: [{
            parts: [{ text: userQuery }]
        }],
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        }
    };

    try {
        const response = await fetch(supabaseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Failed to fetch recommendation');

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
            aiResponse.innerText = text;
            aiCta.classList.remove('hidden');
            incrementMessageCount();
        } else {
            throw new Error("Empty response");
        }
    } catch (err) {
        aiResponse.innerHTML = "<span class='text-red-400 font-medium'>Systemet är tillfälligt otillgängligt. Vänligen kontakta oss personligen.</span>";
    } finally {
        aiLoading.classList.add('hidden');
        aiBtn.disabled = false;
    }
}

if (aiBtn) aiBtn.addEventListener('click', getAiRecommendation);

// Scroll Reveal Observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== "#") {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});
