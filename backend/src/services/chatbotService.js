const Groq = require('groq-sdk');
const { Op } = require('sequelize');
const { Donor, User, BloodBank, Inventory, Alert, Hospital } = require('../models');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a compassionate and helpful blood donation assistant for Blood Donor Nepal.
You help people find blood donors, check blood availability, and learn about blood donation.

You serve 4 cities in Nepal: Kathmandu Valley, Butwal, Pokhara, and Chitwan.

When someone asks about blood availability or donors, ALWAYS use the tools to get real data before answering.
Never make up donor names, phone numbers, or inventory data.

Keep responses concise, warm, and helpful. If blood is urgently needed, emphasize urgency and provide contact info directly.
Format donor lists clearly with name, blood type, and phone number when available.`;

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_donors',
      description: 'Search for eligible blood donors in a city, optionally filtered by blood type.',
      parameters: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
            description: 'City to search in. One of: Kathmandu, Butwal, Pokhara, Chitwan',
          },
          bloodType: {
            type: 'string',
            description: 'Blood type filter e.g. A+, A-, B+, B-, AB+, AB-, O+, O-. Omit for all types.',
          },
        },
        required: ['city'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_blood_banks',
      description: 'Get blood banks and their inventory in a city.',
      parameters: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
            description: 'City name. One of: Kathmandu, Butwal, Pokhara, Chitwan',
          },
        },
        required: ['city'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_inventory',
      description: 'Check how many units of a blood type are available across blood banks in a city.',
      parameters: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
            description: 'City name',
          },
          bloodType: {
            type: 'string',
            description: 'Blood type e.g. A+, O-',
          },
        },
        required: ['city'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_active_alerts',
      description: 'Get current active urgent blood requests from hospitals and blood banks.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
];

// --- Tool Implementations ---

const searchDonors = async (city, bloodType) => {
  const where = { isEligible: true };
  if (bloodType) where.bloodType = bloodType;
  if (city) where.city = { [Op.iLike]: `%${city}%` };

  const donors = await Donor.findAll({
    where,
    include: [{ model: User, as: 'user', attributes: ['fullName', 'phone', 'email'] }],
    limit: 8,
  });

  if (donors.length === 0) {
    return {
      found: 0,
      message: `No eligible donors found in ${city}${bloodType ? ` with blood type ${bloodType}` : ''}.`,
    };
  }

  return {
    found: donors.length,
    city,
    bloodType: bloodType || 'all types',
    donors: donors.map((d) => ({
      name: d.user?.fullName || 'Anonymous',
      bloodType: d.bloodType,
      city: d.city,
      phone: d.user?.phone || 'Not provided',
      email: d.user?.email || 'Not provided',
    })),
  };
};

const getBloodBanks = async (city) => {
  const banks = await BloodBank.findAll({
    where: { city: { [Op.iLike]: `%${city}%` } },
    include: [{ model: Inventory, as: 'inventory' }],
    limit: 5,
  });

  if (banks.length === 0) {
    return { found: 0, message: `No blood banks found in ${city}.` };
  }

  return {
    found: banks.length,
    city,
    bloodBanks: banks.map((b) => ({
      name: b.name,
      city: b.city,
      address: b.address || 'N/A',
      phone: b.contactPhone || 'N/A',
      inventory: b.inventory?.map((i) => `${i.bloodType}: ${i.units} units`) || [],
    })),
  };
};

const checkInventory = async (city, bloodType) => {
  const inventoryWhere = {};
  if (bloodType) inventoryWhere.bloodType = bloodType;

  const bankWhere = city ? { city: { [Op.iLike]: `%${city}%` } } : {};

  const inventories = await Inventory.findAll({
    where: inventoryWhere,
    include: [
      {
        model: BloodBank,
        as: 'bloodBank',
        where: bankWhere,
        attributes: ['name', 'city', 'contactPhone'],
      },
    ],
    limit: 20,
  });

  if (inventories.length === 0) {
    return {
      found: 0,
      message: `No ${bloodType || 'blood'} inventory found in ${city}.`,
    };
  }

  return {
    found: inventories.length,
    city,
    bloodType: bloodType || 'all types',
    inventory: inventories.map((i) => ({
      bloodType: i.bloodType,
      units: i.units,
      bloodBank: i.bloodBank?.name,
      city: i.bloodBank?.city,
      phone: i.bloodBank?.contactPhone || 'N/A',
    })),
  };
};

const getActiveAlerts = async () => {
  const alerts = await Alert.findAll({
    where: { status: { [Op.in]: ['active', 'sent'] } },
    include: [
      { model: BloodBank, as: 'bloodBank', attributes: ['name', 'city'] },
      { model: Hospital, as: 'hospital', attributes: ['name', 'city'] },
    ],
    order: [['createdAt', 'DESC']],
    limit: 10,
  });

  if (alerts.length === 0) {
    return { found: 0, message: 'No active blood requests at the moment.' };
  }

  return {
    found: alerts.length,
    alerts: alerts.map((a) => ({
      bloodType: a.bloodType,
      urgency: a.urgency,
      message: a.message,
      city: a.bloodBank?.city || a.hospital?.city || 'Unknown',
      source: a.bloodBank?.name || a.hospital?.name || 'Unknown',
    })),
  };
};

const executeTool = async (name, args) => {
  switch (name) {
    case 'search_donors':
      return searchDonors(args.city, args.bloodType);
    case 'get_blood_banks':
      return getBloodBanks(args.city);
    case 'check_inventory':
      return checkInventory(args.city, args.bloodType);
    case 'get_active_alerts':
      return getActiveAlerts();
    default:
      return { error: `Unknown tool: ${name}` };
  }
};

// --- Main handler ---

const AGENT_CARD = {
  name: 'Blood Donation Nepal Assistant',
  description: 'AI assistant for finding donors, checking blood availability, and urgent alerts.',
  model: 'llama-3.3-70b-versatile',
  provider: 'groq',
};

const handleTask = async ({ message, history = [] }) => {
  if (!process.env.GROQ_API_KEY) {
    return {
      reply: 'Chatbot is not configured. Please set GROQ_API_KEY.',
      source: 'error',
    };
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: message },
  ];

  // Agentic loop — keep going until no more tool calls (max 5 iterations)
  for (let i = 0; i < 5; i++) {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      tools: TOOLS,
      tool_choice: 'auto',
      max_tokens: 1024,
      temperature: 0.4,
    });

    const choice = response.choices[0];
    const assistantMessage = choice.message;
    messages.push(assistantMessage);

    if (choice.finish_reason === 'tool_calls' && assistantMessage.tool_calls) {
      for (const toolCall of assistantMessage.tool_calls) {
        let args = {};
        try {
          args = JSON.parse(toolCall.function.arguments);
        } catch (_) {}

        const result = await executeTool(toolCall.function.name, args);

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }
    } else {
      return {
        reply: assistantMessage.content,
        source: 'groq',
      };
    }
  }

  return {
    reply: 'Sorry, I could not complete the request. Please try again.',
    source: 'groq',
  };
};

module.exports = { AGENT_CARD, handleTask };
