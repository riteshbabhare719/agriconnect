/* ============================================================
   ASSISTANT.JS — AI Farming Assistant (DEMO with predefined answers)
   Focus: Vidarbha — orange (Nagpur santra), cotton, soybean, tur.
 
   How matching works: each FAQ entry has keywords. The entry whose
   LONGEST matching keyword is found in the question wins, so a
   specific question ("pink bollworm") beats a generic one ("pest").
   English plus a few Marathi/Hindi keywords are understood.
 
   FUTURE: replace getBotReplyMock() with
     fetch(`${AGRI.api.base}/ai/assistant`, { method:'POST', body: JSON.stringify({ question }) })
   ============================================================ */
 
/* Suggestion chips (rendered by JS, so no HTML edit is needed) */
const SUGGESTIONS = [
  'How do I control pink bollworm in cotton?',
  'Why are my orange fruits dropping?',
  'Which crops suit black soil?',
  'My crop leaves are turning yellow',
];
 
const FAQ_RESPONSES = [
  /* ---------------- Cotton ---------------- */
  {
    keys: ['pink bollworm', 'bollworm', 'boll worm', 'बोंडअळी', 'गुलाबी'],
    reply: 'Pink bollworm control is mostly about prevention: sow on time and avoid mixing varieties of different duration, install pheromone traps to monitor moth catches, remove and destroy crop residue and leftover bolls after the last picking, and spray only when catches cross the threshold advised by your local Krishi Vigyan Kendra (KVK). Avoid unnecessary calendar sprays.',
    mr: 'गुलाबी बोंडअळीच्या नियंत्रणासाठी: वेळेवर पेरणी करा, कामगंध सापळे लावून पतंगांवर लक्ष ठेवा, शेवटच्या वेचणीनंतर कापसाच्या काड्या व उरलेली बोंडे नष्ट करा, आणि फवारणी फक्त तुमच्या कृषी विज्ञान केंद्राने (KVK) सांगितलेल्या मर्यादेनंतरच करा.',
  },
  {
    keys: ['boll drop', 'boll shedding', 'flower drop', 'cotton shedding', 'square drop'],
    reply: 'Shedding of squares and bolls in cotton is commonly caused by water stress, long cloudy spells, too much nitrogen, or pest damage. Keep irrigation even during flowering and boll formation, avoid excess urea, and scout for bollworm and sucking pests. Your local KVK can advise on growth regulators if needed.',
  },
  {
    keys: ['cotton fertilizer', 'fertilizer for cotton', 'cotton nutrient', 'cotton urea', 'cotton dap'],
    reply: 'For cotton, apply DAP at sowing for phosphorus, then split nitrogen (urea) into doses at around 30 and 60 days. Avoid heavy late nitrogen as it promotes leaf growth over bolls. A soil test will help fine-tune quantities for your field.',
  },
  {
    keys: ['cotton sowing', 'sow cotton', 'when to sow cotton', 'cotton planting'],
    reply: 'In Vidarbha, cotton is usually sown in June to early July once the monsoon has delivered good soaking rain (roughly 75-100 mm). Sowing too early on stored moisture risks poor germination and early pest build-up. Check your local KVK for the recommended window this season.',
  },
  {
    keys: ['cotton', 'कापूस', 'कपास'],
    reply: 'Cotton does best on deep, well-drained black soil. Key things to watch in Vidarbha: pink bollworm, sucking pests (aphids, jassids, whitefly), water stress at flowering and boll formation, and balanced nutrition. Ask me about pink bollworm, fertilizer, sowing time or boll shedding for details.',
  },
 
  /* ---------------- Orange (Nagpur santra) ---------------- */
  {
    keys: ['fruit drop', 'fruits dropping', 'fruit dropping', 'orange drop', 'फळगळ'],
    reply: 'Fruit drop in orange is often caused by water stress, nutrient or micronutrient deficiency, hormonal imbalance, extreme heat, or pest and disease damage. Keep irrigation even (drip helps), mulch the basin, apply balanced fertilizer with micronutrients like zinc, and inspect for pests and gummosis. For growth-regulator sprays, get the exact dose from your KVK or ICAR-Central Citrus Research Institute (CCRI), Nagpur.',
    mr: 'संत्र्याची फळगळ पाण्याचा ताण, अन्नद्रव्यांची कमतरता, संजीवकांचे असंतुलन, उष्णता किंवा कीड-रोगामुळे होते. सिंचन समान ठेवा (ठिबक उपयुक्त), आच्छादन करा, झिंकसारख्या सूक्ष्म अन्नद्रव्यांसह संतुलित खते द्या. संजीवकांची अचूक मात्रा जवळच्या कृषी विज्ञान केंद्राकडून किंवा नागपूरच्या केंद्रीय लिंबूवर्गीय फळ संशोधन संस्थेकडून घ्या.',
  },
  {
    keys: ['gummosis', 'gum oozing', 'trunk oozing', 'bark rot', 'foot rot', 'phytophthora'],
    reply: 'Gum oozing from the trunk of orange trees is usually gummosis (Phytophthora). Improve drainage, keep the bud union well above ground level, avoid water touching the trunk, scrape affected bark and apply a protective paste as advised by your KVK. Waterlogged black soil makes this worse.',
  },
  {
    keys: ['bahar', 'ambia', 'mrig', 'flowering orange', 'orange flowering'],
    reply: 'Nagpur mandarin is managed through "bahar" (flowering seasons). Ambia bahar flowers around January-February and Mrig bahar around June-July. The choice depends on water availability and market timing, and bahar treatment (a short water-stress period) needs care. Please confirm the schedule for your orchard with CCRI Nagpur or your KVK.',
  },
  {
    keys: ['orange', 'santra', 'mandarin', 'citrus', 'संत्रा', 'संत्री'],
    reply: 'For Nagpur oranges: plant on well-drained soil (waterlogging invites gummosis), prefer drip irrigation, apply balanced nutrients with zinc and iron, and manage citrus psylla and canker. Ask me about fruit drop, gummosis or bahar management for more detail.',
  },
 
  /* ---------------- Other Vidarbha crops ---------------- */
  {
    keys: ['soybean', 'soyabean', 'सोयाबीन'],
    reply: 'Soybean in Vidarbha is sown in June-July after good rain. Watch for yellow mosaic virus (spread by whitefly), stem fly and girdle beetle. Use certified seed, keep fields weed-free in the first 30-40 days, and harvest when pods turn brown and leaves have dropped, avoiding delays that cause pod shattering.',
  },
  {
    keys: ['tur', 'pigeon pea', 'arhar', 'तूर'],
    reply: 'Tur (pigeon pea) suits intercropping with cotton or soybean. Key risks are pod borer (Helicoverpa) and wilt. Use wilt-tolerant varieties, pheromone traps to monitor pod borer, and avoid waterlogging. Spray only on KVK-advised thresholds.',
  },
  {
    keys: ['irrigate wheat', 'water wheat', 'wheat irrigation', 'wheat'],
    reply: 'Wheat generally needs irrigation at crown root initiation (~21 days after sowing), then at tillering, jointing, flowering and grain filling, roughly every 18-21 days depending on soil type. Avoid waterlogging.',
  },
 
  /* ---------------- General farming ---------------- */
  {
    keys: ['black soil', 'regur', 'काळी जमीन'],
    reply: 'Black soil (regur) holds moisture well and suits cotton, soybean, tur and gram in Vidarbha. Oranges also grow on medium black soil, but only if drainage is good because heavy, waterlogged soil encourages root rot and gummosis. It becomes sticky when wet and cracks when dry, so avoid working it when too wet.',
  },
  {
    keys: ['yellow', 'turning yellow', 'leaf yellowing', 'yellowing', 'पिवळी'],
    reply: 'Yellow leaves can mean nitrogen deficiency, overwatering or poor drainage, or micronutrient deficiency (zinc/iron, common in oranges, and magnesium in cotton). Check soil moisture and drainage first, look at whether older or newer leaves are affected, and do a soil or leaf test before adding fertilizer. Yellow patches with curling may also point to a virus spread by whitefly.',
  },
  {
    keys: ['pest', 'pests', 'insect', 'insects', 'control pest', 'कीड'],
    reply: 'For general pest control: monitor with traps (yellow sticky traps for sucking pests, pheromone traps for moths), rotate crops, use neem-based sprays early, protect natural enemies, and spray chemicals only on the threshold advised by your local Krishi Vigyan Kendra. Always read the label and wear protection.',
  },
  {
    keys: ['drip', 'irrigation', 'water management', 'सिंचन', 'ठिबक'],
    reply: 'Drip irrigation saves water and works well for orange orchards and cotton. Irrigate early morning or evening, avoid both waterlogging and long dry spells during flowering and fruit or boll formation, and mulch to hold moisture. Schedules depend on soil and weather, so check the Weather page before irrigating.',
  },
  {
    keys: ['fertilizer', 'fertiliser', 'urea', 'dap', 'npk', 'खत'],
    reply: 'Fertilizer needs depend on the crop and your soil. A soil test (available through your KVK or soil testing lab) is the best starting point. Use balanced N-P-K, add organic matter like vermicompost, and split nitrogen into several doses rather than applying it all at once.',
  },
 
  /* ---------------- App guidance ---------------- */
  {
    keys: ['price', 'mandi', 'rate', 'sell', 'bhav', 'भाव'],
    reply: 'Check the Market Prices page for sample mandi rates for orange, cotton, soybean and tur at Nagpur, Katol, Akola, Amravati and more. Compare nearby mandis and also factor in transport cost before you decide where to sell.',
  },
  {
    keys: ['weather', 'rain', 'forecast', 'temperature', 'हवामान', 'पाऊस'],
    reply: 'Open the Weather page for live conditions and a 5-day forecast for your district, along with a farming advisory (for example, whether to delay spraying before rain).',
  },
  {
    keys: ['transport', 'truck', 'vehicle', 'tractor'],
    reply: 'The Transport page lists vehicles near you, including tractor trolleys, mini trucks and a refrigerated van for oranges. Compare capacity and price before booking.',
  },
  {
    keys: ['scheme', 'subsidy', 'insurance', 'pm-kisan', 'pmfby', 'loan'],
    reply: 'Government schemes such as PM-KISAN (income support) and PMFBY (crop insurance) exist, and some states offer subsidies for drip irrigation and inputs. Eligibility and deadlines change, so confirm details at your nearest CSC, bank or taluka agriculture office.',
  },
];
 
const FALLBACK_REPLY = "I don't have a specific answer for that yet in this demo. Try asking about pink bollworm, orange fruit drop, soil type, irrigation, fertilizer or yellow leaves, or check with your local Krishi Vigyan Kendra for detailed guidance.";
 
const GREETINGS = {
  en: "Namaste! I'm your AgriConnect assistant. Ask me about orange, cotton, soybean, pests, irrigation or soil.",
  mr: 'नमस्कार! मी तुमचा ॲग्रीकनेक्ट सहाय्यक आहे. संत्रा, कापूस, सोयाबीन, कीड, सिंचन किंवा जमिनीबद्दल विचारा.',
  hi: 'नमस्ते! मैं आपका एग्रीकनेक्ट सहायक हूँ। संतरा, कपास, सोयाबीन, कीट, सिंचाई या मिट्टी के बारे में पूछें।',
};
 
function currentLang() {
  return (window.AGRI && AGRI.getLang) ? AGRI.getLang() : 'en';
}
 
function getBotReplyMock(question) {
  const q = question.toLowerCase();
  const lang = currentLang();
 
  let best = null;
  let bestScore = 0;
  FAQ_RESPONSES.forEach(entry => {
    entry.keys.forEach(k => {
      if (q.includes(k.toLowerCase()) && k.length > bestScore) {
        best = entry;
        bestScore = k.length;
      }
    });
  });
 
  if (!best) return FALLBACK_REPLY;
  return (lang === 'mr' && best.mr) ? best.mr : best.reply;
}
 
function appendMessage(text, sender) {
  const chat = document.getElementById('chatWindow');
  const msg = document.createElement('div');
  msg.className = `chat-msg ${sender}`;
  msg.textContent = text;           // textContent keeps user input safe from HTML injection
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}
 
function sendMessage(text) {
  text = text.trim();
  if (!text) return;
  appendMessage(text, 'user');
 
  const chat = document.getElementById('chatWindow');
  const typing = document.createElement('div');
  typing.className = 'chat-msg bot';
  typing.textContent = 'Typing…';
  chat.appendChild(typing);
  chat.scrollTop = chat.scrollHeight;
 
  setTimeout(() => {
    typing.remove();
    appendMessage(getBotReplyMock(text), 'bot');
  }, 600);
}
 
function renderSuggestions() {
  const box = document.querySelector('.chat-suggestions');
  if (!box) return;
  box.innerHTML = '';
  SUGGESTIONS.forEach(text => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip-btn';
    btn.textContent = text;
    btn.addEventListener('click', () => sendMessage(text));
    box.appendChild(btn);
  });
}
 
function initAssistant() {
  const form = document.getElementById('chatForm');
  if (!form) return;
  const input = document.getElementById('chatInput');
 
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage(input.value);
    input.value = '';
  });
 
  renderSuggestions();
  appendMessage(GREETINGS[currentLang()] || GREETINGS.en, 'bot');
}
 
document.addEventListener('DOMContentLoaded', initAssistant);