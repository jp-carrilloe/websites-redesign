const supabaseUrl = "https://kostnrxyjxuiutbtncyp.supabase.co/functions/v1/generate";
const MESSAGE_LIMIT = 10;

const aiInput = document.getElementById('ai-input');
const aiBtn = document.getElementById('ai-btn');
const aiResultContainer = document.getElementById('ai-result-container');
const aiLoading = document.getElementById('ai-loading');
const aiResponse = document.getElementById('ai-response');
const aiCta = document.getElementById('ai-cta');
const cursor = document.getElementById('cursor');

// Soft Cursor
document.addEventListener('mousemove', (e) => {
    if (cursor) {
        cursor.style.left = e.clientX - 10 + 'px';
        cursor.style.top = e.clientY - 10 + 'px';
    }
});

document.querySelectorAll('a, button, .feature-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.style.transform = 'scale(3)');
    el.addEventListener('mouseleave', () => cursor.style.transform = 'scale(1)');
});

function getLimitStatus() {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('bb_limit_date');
    let count = parseInt(localStorage.getItem('bb_message_count') || '0');

    if (lastDate !== today) {
        count = 0;
        localStorage.setItem('bb_limit_date', today);
        localStorage.setItem('bb_message_count', '0');
    }
    return count;
}

function incrementMessageCount() {
    const current = getLimitStatus();
    localStorage.setItem('bb_message_count', (current + 1).toString());
}

async function getAiRecommendation() {
    const userQuery = aiInput.value.trim();
    if (!userQuery) return;

    // Check Limit (10 per day)
    if (getLimitStatus() >= MESSAGE_LIMIT) {
        aiResultContainer.classList.remove('hidden');
        aiResponse.innerHTML = "<span class='text-rose-400'>Du har nått din dagliga gräns på 10 meddelanden för denna demo. Vänligen kontakta ägaren för att få fler krediter eller en fullständig demonstration.</span>";
        aiCta.classList.add('hidden');
        return;
    }

    aiResultContainer.classList.remove('hidden');
    aiLoading.classList.remove('hidden');
    aiResponse.innerText = "";
    aiCta.classList.add('hidden');
    aiBtn.disabled = true;

    const systemPrompt = `Du är en expert-hudkonsult för kliniken Beauty Box Stockholm. 
    Vårt sortiment inkluderar: 
    - Botox (för dynamiska rynkor)
    - Fillers (volym och konturering)
    - Dermapen 4 (microneedling för ärr, textur, lyster)
    - Kemisk Peeling (för akne, pigmentering)
    - HIFU (icke-kirurgiskt lyft)
    - EMSCULPT (muskeltoning).
    
    Baserat på användarens beskrivning, rekommendera EN eller TVÅ mest lämpliga behandlingar. 
    Svara vänligt, professionellt och kortfattat (max 3-4 meningar). 
    Språk: Svenska. Avsluta med att säga att en konsultation på plats alltid krävs.`;

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
        aiResponse.innerHTML = "<span class='text-rose-400'>Vi kan tyvärr inte nå vår specialist just nu. Välkommen att kontakta oss via telefon.</span>";
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
