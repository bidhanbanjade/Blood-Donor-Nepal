const axios = require('axios');
const config = require('../config/config');

const AGENT_CARD = {
  name: 'Blood Donation Nepal Assistant',
  description: 'Assistant for donation eligibility, nearest blood bank, FAQs, and emergency guidance.',
  intents: ['eligibility_screening', 'nearest_blood_bank', 'donation_faqs', 'emergency_guidance'],
};

const detectIntent = (message) => {
  const normalized = (message || '').toLowerCase();

  if (/eligible|eligibility|can i donate|weight|age|hemoglobin/.test(normalized)) {
    return 'eligibility_screening';
  }

  if (/nearest|nearby|blood bank|map|location/.test(normalized)) {
    return 'nearest_blood_bank';
  }

  if (/emergency|urgent|critical|help now/.test(normalized)) {
    return 'emergency_guidance';
  }

  return 'donation_faqs';
};

const localIntentResponse = (intent) => {
  const responses = {
    eligibility_screening:
      'General eligibility: age 18-65, healthy condition, and adequate hemoglobin level. Please consult a clinician for final screening.',
    nearest_blood_bank:
      'Share your location (lat/lng) and I can help find nearby blood banks through the location search endpoint.',
    donation_faqs:
      'Most donors can donate whole blood every 56 days. Stay hydrated and eat a healthy meal before donation.',
    emergency_guidance:
      'For life-threatening emergencies, contact local emergency services first. I can also trigger a blood alert workflow for hospitals and blood banks.',
  };

  return responses[intent] || responses.donation_faqs;
};

const handleTask = async ({ message, context }) => {
  const intent = detectIntent(message);

  if (config.a2a.agentUrl) {
    const response = await axios.post(
      config.a2a.agentUrl,
      {
        card: AGENT_CARD,
        task: { message, context, intent },
      },
      {
        headers: config.a2a.apiKey ? { Authorization: `Bearer ${config.a2a.apiKey}` } : {},
      }
    );

    return {
      intent,
      source: 'a2a',
      reply: response.data.reply || response.data.message || 'No response from agent.',
    };
  }

  return {
    intent,
    source: 'local-fallback',
    reply: localIntentResponse(intent),
  };
};

module.exports = {
  AGENT_CARD,
  handleTask,
};
