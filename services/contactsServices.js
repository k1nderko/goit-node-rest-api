import Contact from "../models/Contact.js"

export const listContacts = (search = {}) => {
    const {filter = {}, fields = "", settings = {}} = search;
    if ("favorite" in filter) {
        filter.favorite = filter.favorite === "true";
    }
    return Contact.find(filter, fields, settings).populate("owner", "email subscription");
};

export const getContact = filter => Contact.findOne(filter);

export const removeContact = filter => Contact.findOneAndDelete(filter);

export const addContact = data => Contact.create(data);

export const updateContact = (filter, data) => Contact.findOneAndUpdate(filter, data);

export const updateStatusContact = async (filter, data) => {
    const { favorite } = data;
    const updatedContact = await Contact.findOneAndUpdate(filter, { favorite }, { new: true });

    if (!updatedContact) {
        return null;
    }

    return updatedContact;
};