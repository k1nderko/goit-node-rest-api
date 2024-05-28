import * as contactsServices from "../services/contactsServices.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";

const getAllContacts = async (req, res) => {
    const result = await contactsServices.listContacts();
    res.json(result);
};

const getOneContact = async (req, res) => {
        const {id} = req.params;
        const result = await contactsServices.getContactById(id);
        if(!result) {
           throw HttpError(404, "Not found");
        }
        res.json(result);
};

const deleteContact = async (req, res) => {
    const {id} = req.params;
    const result = await contactsServices.removeContact(id);
    if(!result) {
        throw HttpError(404, "Not found");
     }
     res.json(result);
};

const createContact = async (req, res) => {
        const result = await contactsServices.addContact(req.body);
        res.status(201).json(result);
};

const updateContact = async (req, res) => {
        const {id} = req.params;
        const result = await contactsServices.updateContactById(id, req.body);
        if(!result) {
            throw HttpError(404, "Not found");
         }
        res.json(result);
};

export default {
    getAllContacts: ctrlWrapper(getAllContacts),
    getOneContact: ctrlWrapper(getOneContact),
    deleteContact: ctrlWrapper(deleteContact),
    createContact: ctrlWrapper(createContact),
    updateContact: ctrlWrapper(updateContact)
}