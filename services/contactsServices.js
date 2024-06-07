import Contact from "../models/Contact.js"

export const listContacts = (search = {}) => {
    const {filter = {}} = search;
    return Contact.find(filter)};

export const getContactById = async (_id) => {
    const result = await Contact.findById(_id);
    return result;
};

export const removeContact = (id) => Contact.findByIdAndDelete(id);

export const addContact = data => Contact.create(data);

export const updateContactById = async (id, data) => Contact.findByIdAndUpdate(id, data);

export const updateStatusContactById = async (id, data) => {
    const { favorite } = data;
    const updatedContact = await Contact.findByIdAndUpdate(id, { favorite }, { new: true });

    if (!updatedContact) {
        return null;
    }

    return updatedContact;
};