const express = require("express");
const router = express.Router();
const ctrl = require("../../../controllers/contacts");
const guard = require("../../../helpers/guard");

const {
  validationCreateContact,
  validationUpdateContact,
  validateMongoId,
} = require("./validation");

router.get("/", guard, ctrl.listContacts);

router.get("/:contactId", validateMongoId, ctrl.getContactById);

router.post("/", validationCreateContact, ctrl.addContact);

router.delete("/:contactId", validateMongoId, ctrl.removeContact);

router.put(
  "/:contactId",
  validateMongoId,
  validationUpdateContact,
  ctrl.updateContact
);

router.patch(
  "/:contactId/favorite",
  validationUpdateContact,
  ctrl.updateContact
);

module.exports = router;
