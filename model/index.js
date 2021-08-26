const fs = require("fs/promises");
const path = require("path");
const { v4: uuid } = require("uuid");

const filePath = path.join(__dirname, "contacts.json");

const readContacts = async () => {
  const data = await fs.readFile(filePath);
  return JSON.parse(data);
};

const listContacts = async () => {
  return await readContacts();
};

const getContactById = async (contactId) => {
  const data = await readContacts();
  const result = data.filter((contact) => contact.id === +contactId);
  return result;
};

const removeContact = async (contactId) => {
  const data = await readContacts();
  const contactIndex = data.findIndex((contact) => contact.id === +contactId);
  if (contactIndex !== -1) {
    const result = data.splice(contactIndex, 1);
    await fs.writeFile(filePath, JSON.stringify(data));
    return result;
  }
  return null;
};

const addContact = async (body) => {
  const id = uuid();
  const record = {
    id,
    ...body,
  };
  const data = await readContacts();
  data.push(record);
  await fs.writeFile(filePath, JSON.stringify(data));
  return record;
};

const updateContact = async (contactId, body) => {
  const data = await readContacts();
  const [result] = data.filter((contact) => contact.id === +contactId);
  if (result) {
    Object.assign(result, body);
    await fs.writeFile(filePath, JSON.stringify(data));
  }
  return result;
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
