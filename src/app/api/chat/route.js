
// import Ably from 'ably/promises';
// import dbConnect from '@/lib/db';
// import Conversation from '@/models/Conversation';
// import Message from '@/models/Message';

// const ably = new Ably.Realtime(process.env.ABLY_API_KEY);

// export default async function handler(req, res) {
//   if (req.method === 'POST') {
//     try {
//       await dbConnect();
      
//       const { conversationId, senderId, content, messageType = 'text' } = req.body;

//       // Save to MongoDB
//       const message = await Message.create({
//         conversationId,
//         senderId,
//         content,
//         messageType
//       });

//       // Get conversation details
//       const conversation = await Conversation.findById(conversationId)
//         .populate('participants', 'name dp');

//       // Update conversation last message
//       await Conversation.findByIdAndUpdate(conversationId, {
//         'lastMessage.content': content,
//         'lastMessage.senderId': senderId,
//         'lastMessage.timestamp': new Date(),
//         'lastMessage.messageType': messageType
//       });

//       // Get sender details
//       const populatedMessage = await Message.findById(message._id)
//         .populate('senderId', 'name dp');

//       // Send via Ably for real-time
//       const channel = ably.channels.get(`chat-${conversationId}`);
//       await channel.publish('message', {
//         _id: message._id,
//         conversationId,
//         senderId,
//         senderName: populatedMessage.senderId.name,
//         senderDp: populatedMessage.senderId.dp,
//         content,
//         messageType,
//         createdAt: message.createdAt
//       });

//       res.status(201).json({ success: true, message: populatedMessage });
//     } catch (error) {
//       res.status(500).json({ success: false, error: error.message });
//     }
//   }
// }



import Ably from 'ably';
import dbConnect from '@/lib/db';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';

// Use Ably Realtime client
const ably = new Ably.Realtime({ key: process.env.ABLY_API_KEY });

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await dbConnect();

      const { conversationId, senderId, content, messageType = 'text' } = req.body;

      // Save to MongoDB
      const message = await Message.create({
        conversationId,
        senderId,
        content,
        messageType,
      });

      // Get conversation details
      const conversation = await Conversation.findById(conversationId)
        .populate('participants', 'name dp');

      // Update conversation last message
      await Conversation.findByIdAndUpdate(conversationId, {
        'lastMessage.content': content,
        'lastMessage.senderId': senderId,
        'lastMessage.timestamp': new Date(),
        'lastMessage.messageType': messageType,
      });

      // Get sender details
      const populatedMessage = await Message.findById(message._id)
        .populate('senderId', 'name dp');

      // Send via Ably for real-time
      const channel = ably.channels.get(`chat-${conversationId}`);
      channel.publish('message', {
        _id: message._id,
        conversationId,
        senderId,
        senderName: populatedMessage.senderId.name,
        senderDp: populatedMessage.senderId.dp,
        content,
        messageType,
        createdAt: message.createdAt,
      });

      res.status(201).json({ success: true, message: populatedMessage });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
