import savingSuggestionService from '../services/savingSuggestionService.js';

export const getSuggestions = async (req, res) => {
  const suggestions = await savingSuggestionService(req.user._id);
  res.json(suggestions);
};
