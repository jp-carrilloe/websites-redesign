const supabaseUrl = "https://kostnrxyjxuiutbtncyp.supabase.co/functions/v1/generate";
const MESSAGE_LIMIT = 10;

const aiInput = document.getElementById('ai-input');
const aiBtn = document.getElementById('ai-btn');
const aiResultContainer = document.getElementById('ai-result-container');
const aiLoading = document.getElementById('ai-loading');
const aiResponse = document.getElementById('ai-response');
const aiCta = document.getElementById('ai-cta');
const cursor = document.getElementById('cursor');

// Square Custom Cursor
document.addEventListener('mousemove', (e) => {
    if (cursor) {
        cursor.style.left = e.clientX - 16 + 'px';
        cursor.style.top = e.clientY - 16 + 'px';
    }
});

document.querySelectorAll('a, button, .practice-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.style.transform = 'rotate(45deg) scale(0.5)';
        cursor.style.background = 'rgba(15, 23, 42, 0.1)';
    });
    el.addEventListener('mouseleave', () => {
        cursor.style.transform = 'rotate(0deg) scale(1)';
        cursor.style.background = 'transparent';
    });
});

function getLimitStatus() {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('al_limit_date');
    let count = parseInt(localStorage.getItem('al_message_count') || '0');

    if (lastDate !== today) {
        count = 0;
        localStorage.setItem('al_limit_date', today);
        localStorage.setItem('al_message_count', '0');
    }
    return count;
}

function incrementMessageCount() {
    const current = getLimitStatus();
    localStorage.setItem('al_message_count', (current + 1).toString());
}

async function getAiRecommendation() {
    const userQuery = aiInput.value.trim();
    if (!userQuery) return;

    // Check Limit (10 per day)
    if (getLimitStatus() >= MESSAGE_LIMIT) {
        aiResultContainer.classList.remove('hidden');
        aiResponse.innerHTML = "<span class='text-red-400'>Du har nått din dagliga gräns på 10 meddelanden för denna demo. Vänligen kontakta ägaren för fler krediter.</span>";
        aiCta.classList.add('hidden');
        return;
    }

    aiResultContainer.classList.remove('hidden');
    aiLoading.classList.remove('hidden');
    aiResponse.innerText = "";
    aiCta.classList.add('hidden');
    aiBtn.disabled = true;

    const systemPrompt = `Du är en expert-juridisk koordinator för byrån Ascent Law, en ledande affärsjuridisk byrå. 
    Vårt sortiment inkluderar: 
    - Bolagsjuridik (M&A, avtalsrätt, etableringar)
    - Tvistelösning (skiljeförfaranden, domstolsprocesser)
    - Fastighetsrätt (transaktioner, hyra, exploatering)
    - Immaterialrätt (IP, varumärken, patent)
    - Arbetsrätt (anställningsavtal, omstruktureringar).
    
    Baserat på användarens beskrivning av sitt ärende, rekommendera vilket eller vilka rättsområden som är mest relevanta. 
    Svara professionellt, sakligt och kortfattat (max 3-4 meningar). 
    Språk: Svenska. Avsluta med att säga att AI-svaret inte utgör juridisk rådgivning och att en konsultation krävs.`;

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
        aiResponse.innerHTML = "<span class='text-red-400'>Systemet är tillfälligt underhåll. Vänligen ring vårt kontor för omedelbar assistans.</span>";
    } finally {
        aiLoading.classList.add('hidden');
        aiBtn.disabled = false;
    }
}

if (aiBtn) aiBtn.addEventListener('click', getAiRecommendation);

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));

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
