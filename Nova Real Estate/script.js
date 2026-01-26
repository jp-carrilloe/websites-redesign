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

// Custom Cursor (Different Style)
document.addEventListener('mousemove', (e) => {
    if (cursor) {
        cursor.style.left = e.clientX - 6 + 'px';
        cursor.style.top = e.clientY - 6 + 'px';
    }
});

document.querySelectorAll('a, button, .property-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.style.transform = 'scale(6)');
    el.addEventListener('mouseleave', () => cursor.style.transform = 'scale(1)');
});

function getLimitStatus() {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('nr_limit_date');
    let count = parseInt(localStorage.getItem('nr_message_count') || '0');

    if (lastDate !== today) {
        count = 0;
        localStorage.setItem('nr_limit_date', today);
        localStorage.setItem('nr_message_count', '0');
    }
    return count;
}

function incrementMessageCount() {
    const current = getLimitStatus();
    localStorage.setItem('nr_message_count', (current + 1).toString());
}

async function getAiRecommendation() {
    const userQuery = aiInput.value.trim();
    if (!userQuery) return;

    // Check Limit (10 per day)
    if (getLimitStatus() >= MESSAGE_LIMIT) {
        aiResultContainer.classList.remove('hidden');
        aiResponse.innerHTML = "<span class='text-amber-500'>Du har nått din dagliga gräns på 10 meddelanden för denna demo. Vänligen kontakta ägaren för exklusiv tillgång.</span>";
        aiCta.classList.add('hidden');
        return;
    }

    aiResultContainer.classList.remove('hidden');
    aiLoading.classList.remove('hidden');
    aiResponse.innerText = "";
    aiCta.classList.add('hidden');
    aiBtn.disabled = true;

    const systemPrompt = `Du är en expert-fastighetsrådgivare för Nova Estate, en lyxmäklare. 
    Vårt sortiment inkluderar: 
    - Exklusiva Villor (havsnära, moderna residens)
    - Penthouses (stadens bästa vyer, takterrasser)
    - Arkitektritade lägenheter (unika detaljer, premiummaterial)
    - Off-market objekt (diskreta försäljningar till utvalda köpare).
    
    Baserat på användarens livsstilsbeskrivning, rekommendera vilken TYP av objekt de bör fokusera på och varför. 
    Svara elegant, inspirerande och kortfattat (max 3-4 meningar). 
    Språk: Svenska. Avsluta med att bjuda in till ett privat möte för att diskutera dolda objekt.`;

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
        aiResponse.innerHTML = "<span class='text-amber-500'>Privat rådgivning är tillfälligt otillgänglig. Vänligen kontakta vår concierge.</span>";
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
