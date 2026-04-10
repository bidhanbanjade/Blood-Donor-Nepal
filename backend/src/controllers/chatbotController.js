const { body, validationResult } = require('express-validator');
const { AGENT_CARD, handleTask } = require('../services/chatbotService');

const chatbotValidators = [body('message').isString().isLength({ min: 2 })];

const getAgentCard = (req, res) => {
  return res.status(200).json(AGENT_CARD);
};

const runTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await handleTask({
      message: req.body.message,
      history: req.body.history || [],
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  chatbotValidators,
  getAgentCard,
  runTask,
};
