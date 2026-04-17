import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import Chat from "../models/chatModel.js";
import Notification from "../models/notificationModel.js";

// @desc    Get all messages
// @route   GET /api/message/:chatId
// @access  Private
const allMessages = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      res.status(404);
      throw new Error("Chat not found");
    }

    if (!chat.users.some((userId) => userId.toString() === req.user._id.toString())) {
      res.status(403);
      throw new Error("You do not have access to this chat");
    }

    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Create new message
// @route   POST /api/message
// @access  Private
const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      res.status(404);
      throw new Error("Chat not found");
    }

    if (!chat.users.some((userId) => userId.toString() === req.user._id.toString())) {
      res.status(403);
      throw new Error("You do not have access to this chat");
    }

    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name email");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });

    // Create notifications for other users in the chat
    const recipients = chat.users.filter(
      (userId) => userId.toString() !== req.user._id.toString()
    );

    for (const recipientId of recipients) {
      await Notification.create({
        recipient: recipientId,
        sender: req.user._id,
        type: "message",
        content: `New message from ${req.user.name}: "${content.slice(0, 30)}${content.length > 30 ? "..." : ""}"`,
        link: `/chat`,
      });
    }

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

export { allMessages, sendMessage };
