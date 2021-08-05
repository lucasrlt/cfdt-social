import * as chatService from "../services/chat.services";

export const postNewMessage = async (req, res, next) => {
  try {
    const { to, message } = req.body;
    const { npa } = req.user;

    const result = await chatService.new_message(npa, to, message);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getAllConversations = async (req, res, next) => {
  try {
    const { npa } = req.user;
    const result = await chatService.get_all_conversations(npa);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getAllMessages = async (req, res, next) => {
  try {
    const { withUser } = req.query;
    const { npa } = req.user;

    const result = await chatService.get_all_messages(withUser, npa);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
