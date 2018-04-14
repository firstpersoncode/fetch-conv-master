const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const channelSchema = mongoose.Schema({
   id: {
     type: String,
     required: true,
     index: true,
     unique: true
   },
   created: String,
   creator: String,
   is_archived: Boolean,
   is_channel: Boolean,
   is_general: Boolean,
   is_member: Boolean,
   is_mpim: Boolean,
   is_org_shared: Boolean,
   is_private: Boolean,
   is_shared: Boolean,
   members: mongoose.Schema.Types.Mixed,
   name: String,
   name_normalized: String,
   previous_names: mongoose.Schema.Types.Mixed,
   purpose: mongoose.Schema.Types.Mixed,
   topic: mongoose.Schema.Types.Mixed,
   unlinked: Number,
   unread_count: Number,
   unread_count_display: Number
});
channelSchema.plugin(uniqueValidator)
const Channel = mongoose.model('Channel', channelSchema);
module.exports = Channel;
