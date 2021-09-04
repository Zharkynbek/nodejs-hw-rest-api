const Contact = require("../model/contact");

const listContacts = async (userId, query) => {
  // const results = await Contact.find({ owner: userId }).populate({
  //   path: "owner",
  //   select: "name email gender -_contactId",
  // });
  const { sortBy, sortByDesc, filter, limit = 5, offset = 0 } = query;
  const optionsSearch = { owner: userId };
  const results = await Contact.paginate(optionsSearch, { limit, offset });
  return results;
};

const getContactById = async (userId, contactId) => {
  const result = await Contact.findOne({
    _contactId: contactId,
    owner: userId,
  }).populate({
    path: "owner",
    select: "name email gender",
  });
  return result;
};

const removeContact = async (userId, contactId) => {
  const result = await Contact.findOneAndDelete({
    _contactId: contactId,
    owner: userId,
  });
  return result;
};

const addContact = async (userId, body) => {
  const result = await Contact.create({ owner: userId, ...body });
  return result;
};

const updateContact = async (userId, contactId, body) => {
  const result = await Contact.findOneAndUpdate(
    { _contactId: contactId, owner: userId },
    { ...body },
    { new: true }
  );
  return result;
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
