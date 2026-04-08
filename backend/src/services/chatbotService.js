const axios = require('axios');
const config = require('../config/config');

const AGENT_CARD = {
  name: 'Blood Donation Nepal Assistant',
  description: 'Assistant for donation eligibility, nearby hospitals, FAQs, and emergency guidance.',
  intents: ['eligibility_screening', 'location_guidance', 'donation_faqs', 'emergency_guidance'],
};

const detectIntent = (message) => {
  const normalized = (message || '').toLowerCase();

  if (/eligible|eligibility|can i donate|weight|age|hemoglobin/.test(normalized)) {
    return 'eligibility_screening';
  }

  if (/nearest|nearby|hospital|map|location/.test(normalized)) {
    return 'location_guidance';
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
    location_guidance:
      'Share your location (lat/lng) and I can help you find nearby hospitals or emergency support options.',
    donation_faqs:
      'Most donors can donate whole blood every 56 days. Stay hydrated and eat a healthy meal before donation.',
    emergency_guidance:
      'For life-threatening emergencies, contact local emergency services first. I can also help you with the hospital alert workflow.',
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
