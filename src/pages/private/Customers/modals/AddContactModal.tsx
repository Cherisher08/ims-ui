import React, { useEffect, useState } from "react";
import CustomButton from "../../../../styled/CustomButton";
import { FaTimesCircle } from "react-icons/fa";
import { LuUpload } from "react-icons/lu";
import CustomInput from "../../../../styled/CustomInput";
import { Modal } from "@mui/material";
import {
  ContactWithFile,
  initialContactType,
  type ContactInfoType,
} from "../../../../types/contact";
import { MdClose } from "react-icons/md";
import { useCreateContactMutation, useGetContactsQuery } from "../../../../services/ContactService";
import { toast } from "react-toastify";
import { TOAST_IDS } from "../../../../constants/constants";

export type AddContactModalType = {
  addContactOpen: boolean;
  setAddContactOpen: (value: boolean) => void;
};

const AddContactModal = ({ addContactOpen, setAddContactOpen }: AddContactModalType) => {
  const [newContactData, setNewContactData] = useState<ContactInfoType>(initialContactType);
  const [
    createNewContact,
    { isSuccess: isCreateContactSuccess, isError: isCreateContactError, reset },
  ] = useCreateContactMutation();
  const [addressProof, setAddressProof] = useState<File | null>(null);
  const { data: contacts } = useGetContactsQuery();
  const [error, setError] = useState<string | null>(null);

  const handleAddContact = () => {
    const contactWithFile: ContactWithFile = {
      ...newContactData,
      file: addressProof,
    };
    createNewContact(contactWithFile);
    setAddressProof(null);
    setNewContactData(initialContactType);
  };

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (files) {
      setAddressProof(files[0]);
    }
  };

  const handleContactChange = (key: keyof ContactInfoType, value: string | number) => {
    setNewContactData((prev) => {
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  useEffect(() => {
    if (isCreateContactSuccess) {
      toast.success("Contact created successfully", {
        toastId: TOAST_IDS.SUCCESS_CONTACT_CREATE,
      });
      reset();
      setAddContactOpen(false);
    }
    if (isCreateContactError) {
      toast.error("Error in creating contact", {
        toastId: TOAST_IDS.ERROR_CONTACT_CREATE,
      });
      reset();
      setAddContactOpen(false);
    }
  }, [isCreateContactError, isCreateContactSuccess, reset, setAddContactOpen]);

  return (
    <Modal
      open={addContactOpen}
      onClose={() => {
        setAddContactOpen(false);
        setNewContactData(initialContactType);
        setAddressProof(null);
      }}
      className="w-screen h-screen flex justify-center items-center"
    >
      <div className="flex flex-col gap-4 justify-center items-center max-w-3/4 max-h-4/5 bg-white rounded-lg p-4">
        <div className="flex justify-between w-full">
          <p className="text-primary text-xl font-semibold w-full text-start">New Customer</p>
          <MdClose
            size={25}
            className="cursor-pointer"
            onClick={() => {
              setAddContactOpen(false);
              setNewContactData(initialContactType);
              setAddressProof(null);
            }}
          />
        </div>
        <div className=" flex flex-col gap-3 h-4/5 px-3 overflow-y-auto scrollbar-stable">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-x-5 gap-y-2">
            <CustomInput
              label="Name"
              value={newContactData?.name ?? ""}
              onChange={(value) => handleContactChange("name", value)}
              placeholder="Enter Name"
            />
            <CustomInput
              type="number"
              label="Personal Number"
              error={error !== null && newContactData.personal_number !== ""}
              helperText={error || ""}
              value={newContactData?.personal_number ?? ""}
              onChange={(value) => {
                const exists = contacts?.find((contact) => contact.personal_number === value);
                if (!exists || value === "") {
                  setError(null);
                } else {
                  setError("Contact already exists");
                }
                handleContactChange("personal_number", value);
              }}
              placeholder="Enter Personal Number"
            />
            <CustomInput
              label="Email"
              value={newContactData?.email ?? ""}
              onChange={(value) => handleContactChange("email", value)}
              placeholder="Enter Email"
            />
            <CustomInput
              label="Company"
              value={newContactData?.company_name ?? ""}
              onChange={(value) => handleContactChange("company_name", value)}
              placeholder="Enter Company Name"
            />
            <CustomInput
              type="number"
              label="Office Number"
              value={newContactData?.office_number ?? ""}
              onChange={(value) => handleContactChange("office_number", value)}
              placeholder="Enter Office Number"
            />

            <CustomInput
              label="GSTIN"
              value={newContactData?.gstin ?? ""}
              onChange={(value) => handleContactChange("gstin", value)}
              placeholder="Enter GSTIN"
            />
            <div className="flex flex-col lg:col-span-2">
              <div className="">
                <CustomInput
                  label="Address"
                  multiline
                  value={newContactData?.address ?? ""}
                  onChange={(value) => handleContactChange("address", value)}
                  placeholder="Enter Address"
                />
              </div>

              <div className="">
                <CustomInput
                  label="Pincode"
                  value={newContactData?.pincode ?? ""}
                  onChange={(value) => handleContactChange("pincode", value)}
                  placeholder="Enter Pincode"
                />
              </div>
            </div>

            <div className="flex flex-col sm:h-4/5 w-full gap-1">
              <label className="w-full line-clamp-2 break-words h-auto min-h-6">Upload Proof</label>
              <div className="h-full min-h-[10rem] max-w-[12rem] w-full relative">
                {addressProof === null ? (
                  <>
                    <input
                      id="new-contact-proof"
                      name="new-contact-proof"
                      className="hidden"
                      type="file"
                      onChange={handleProofChange}
                    />
                    <label
                      htmlFor="new-contact-proof"
                      className="border rounded-sm flex flex-col items-center justify-center h-full w-full cursor-pointer"
                    >
                      <LuUpload />
                      <p className="text-xs text-center px-2">Upload Proof</p>
                    </label>
                  </>
                ) : (
                  <>
                    <FaTimesCircle
                      size={20}
                      color="red"
                      className="absolute top-2 right-2 cursor-pointer z-10"
                      onClick={() => setAddressProof(null)}
                    />
                    <img
                      src={URL.createObjectURL(addressProof)}
                      className="rounded-sm h-full w-full object-cover"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full gap-3 justify-end">
          <CustomButton
            onClick={() => {
              setAddContactOpen(false);
              setNewContactData(initialContactType);
              setAddressProof(null);
            }}
            label="Discard"
            variant="outlined"
            className="bg-white"
          />
          <CustomButton
            onClick={handleAddContact}
            disabled={error !== null || newContactData.name === ""}
            label="Add Contact"
          />
        </div>
      </div>
    </Modal>
  );
};

export default AddContactModal;
