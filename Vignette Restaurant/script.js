const supabaseUrl = "https://kostnrxyjxuiutbtncyp.supabase.co/functions/v1/generate";
const MESSAGE_LIMIT = 10;

const aiInput = document.getElementById('ai-input');
const aiBtn = document.getElementById('ai-btn');
const aiResultContainer = document.getElementById('ai-result-container');
const aiLoading = document.getElementById('ai-loading');
const aiResponse = document.getElementById('ai-response');
const aiCta = document.getElementById('ai-cta');
const cursor = document.getElementById('cursor');

// Elegant Cursor
document.addEventListener('mousemove', (e) => {
    if (cursor) {
        cursor.style.left = e.clientX - 10 + 'px';
        cursor.style.top = e.clientY - 10 + 'px';
    }
});

document.querySelectorAll('a, button, .menu-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.style.transform = 'scale(2.5)';
        cursor.style.borderColor = 'white';
    });
    el.addEventListener('mouseleave', () => {
        cursor.style.transform = 'scale(1)';
        cursor.style.borderColor = 'var(--gold)';
    });
});

function getLimitStatus() {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('vr_limit_date');
    let count = parseInt(localStorage.getItem('vr_message_count') || '0');

    if (lastDate !== today) {
        count = 0;
        localStorage.setItem('vr_limit_date', today);
        localStorage.setItem('vr_message_count', '0');
    }
    return count;
}

function incrementMessageCount() {
    const current = getLimitStatus();
    localStorage.setItem('vr_message_count', (current + 1).toString());
}

async function getAiRecommendation() {
    const userQuery = aiInput.value.trim();
    if (!userQuery) return;

    // Check Limit (10 per day)
    if (getLimitStatus() >= MESSAGE_LIMIT) {
        aiResultContainer.classList.remove('hidden');
        aiResponse.innerHTML = "<span class='text-amber-200'>Du har nått din dagliga gräns på 10 meddelanden för denna demo. Kontakta ägaren för tillgång till hela sortimentet.</span>";
        aiCta.classList.add('hidden');
        return;
    }

    aiResultContainer.classList.remove('hidden');
    aiLoading.classList.remove('hidden');
    aiResponse.innerText = "";
    aiCta.classList.add('hidden');
    aiBtn.disabled = true;

    const systemPrompt = `Du är en expert-sommelier och värd för restaurangen Vignette. 
    Vårt utbud inkluderar: 
    - Säsongens Avsmakningsmeny (7 rätter, fokus på nordiska råvaror)
    - Klassiskt Vinpaket (noggrant utvalda klassiker)
    - Prestigepaket (sällsynta och exklusiva viner)
    - Alkoholfria Hantverksdrycker (egenproducerade juicer och extrakt)
    - Private Dining (för grupper upp till 12 personer).
    
    Baserat på användarens beskrivning, rekommendera en matchning mellan mat och dryck eller beskriv en del av upplevelsen. 
    Svara poetiskt, initierat och kortfattat (max 3-4 meningar). 
    Språk: Svenska. Avsluta med att hälsa dem varmt välkomna till bords.`;

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
        aiResponse.innerHTML = "<span class='text-amber-200'>Vår sommelier är tillfälligt upptagen i källaren. Vänligen fråga oss vid ankomst.</span>";
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
