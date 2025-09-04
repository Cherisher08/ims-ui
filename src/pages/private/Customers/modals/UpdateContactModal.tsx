import { Modal } from "@mui/material";
import React, { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import CustomInput from "../../../../styled/CustomInput";
import { FaTimesCircle } from "react-icons/fa";
import { LuUpload } from "react-icons/lu";
import CustomButton from "../../../../styled/CustomButton";
import { ContactInfoType, ContactWithFile, initialContactType } from "../../../../types/contact";
import type { Dispatch, SetStateAction } from "react";
import { useGetContactsQuery, useUpdateContactMutation } from "../../../../services/ContactService";
import { toast } from "react-toastify";
import { TOAST_IDS } from "../../../../constants/constants";

export type UpdateContactModalType = {
  updateContactOpen: boolean;
  setUpdateContactOpen: (value: boolean) => void;
  updateContactData: ContactInfoType;
  setUpdateContactData: Dispatch<SetStateAction<ContactInfoType>>;
};

const UpdateContactModal = ({
  updateContactOpen,
  setUpdateContactOpen,
  updateContactData,
  setUpdateContactData,
}: UpdateContactModalType) => {
  const [addressProof, setAddressProof] = useState<File | null>(null);
  const [
    updateContact,
    { isSuccess: isUpdateContactSuccess, isError: IsUpdateContactError, reset },
  ] = useUpdateContactMutation();
  const { data: contacts } = useGetContactsQuery();
  const [error, setError] = useState<string | null>(null);

  const handleUpdateContact = () => {
    const contactWithFile: ContactWithFile = {
      ...updateContactData,
      file: addressProof,
    };
    updateContact(contactWithFile);
    setUpdateContactData(initialContactType);
  };

  const handelProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (files) {
      setAddressProof(files[0]);
    }
  };

  const handleContactChange = (key: keyof ContactInfoType, value: string | number) => {
    setUpdateContactData((prev) => {
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  useEffect(() => {
    if (isUpdateContactSuccess) {
      toast.success("Contact updated successfully", {
        toastId: TOAST_IDS.SUCCESS_CONTACT_CREATE,
      });
      setUpdateContactOpen(false);
      reset();
    }
    if (IsUpdateContactError) {
      toast.error("Error in creating contact", {
        toastId: TOAST_IDS.ERROR_CONTACT_CREATE,
      });
      setUpdateContactOpen(false);
      reset();
    }
  }, [IsUpdateContactError, isUpdateContactSuccess, reset, setUpdateContactOpen]);

  return (
    <Modal
      open={updateContactOpen}
      onClose={() => {
        setUpdateContactData(initialContactType);
        setUpdateContactOpen(false);
        setAddressProof(null);
      }}
      className="w-screen h-screen flex justify-center items-center"
    >
      <div className="flex flex-col gap-4 justify-center items-center max-w-4/5 max-h-4/5 bg-white rounded-lg p-4">
        <div className="flex justify-between w-full">
          <p className="text-primary text-xl font-semibold w-full text-start">Update Contact</p>
          <MdClose
            size={25}
            className="cursor-pointer"
            onClick={() => {
              setUpdateContactOpen(false);
              setUpdateContactData(initialContactType);
              setAddressProof(null);
            }}
          />
        </div>

        <div className=" flex flex-col gap-3 h-4/5 px-3 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ">
            <CustomInput
              label="Name"
              value={updateContactData?.name ?? ""}
              onChange={(value) => handleContactChange("name", value)}
              placeholder="Enter Name"
            />
            <CustomInput
              label="Personal Number"
              error={error !== null && updateContactData.personal_number !== ""}
              helperText={error || ""}
              value={updateContactData?.personal_number ?? ""}
              onChange={(value) => {
                const normalizedValue = value.trim();
                handleContactChange("personal_number", normalizedValue);
                if (!normalizedValue) {
                  setError(null);
                  return;
                }

                const exists = contacts?.find(
                  (contact) =>
                    contact.personal_number === normalizedValue &&
                    contact._id !== updateContactData._id
                );

                setError(exists ? "Contact already exists" : null);
              }}
              placeholder="Enter Personal Number"
            />
            <CustomInput
              label="Email"
              value={updateContactData?.email ?? ""}
              onChange={(value) => handleContactChange("email", value)}
              placeholder="Enter Email"
            />

            <CustomInput
              label="Company"
              value={updateContactData?.company_name ?? ""}
              onChange={(value) => handleContactChange("company_name", value)}
              placeholder="Enter Company Name"
            />
            <CustomInput
              label="Office Number"
              value={updateContactData?.office_number ?? ""}
              onChange={(value) => handleContactChange("office_number", value)}
              placeholder="Enter Office Number"
            />

            <CustomInput
              label="GSTIN"
              value={updateContactData?.gstin ?? ""}
              onChange={(value) => handleContactChange("gstin", value)}
              placeholder="Enter GSTIN"
            />
            <div className="flex flex-col lg:col-span-2">
              <CustomInput
                label="Address"
                multiline
                value={updateContactData?.address ?? ""}
                onChange={(value) => handleContactChange("address", value)}
                placeholder="Enter Address"
              />

              <CustomInput
                label="Pincode"
                value={updateContactData?.pincode ?? ""}
                onChange={(value) => handleContactChange("pincode", value)}
                placeholder="Enter Pincode"
              />
            </div>
            <div className="flex flex-col sm:h-4/5 w-full gap-1">
              <label className="w-full line-clamp-2 break-words h-auto min-h-6">Upload Proof</label>
              <div className="h-full min-h-[10rem] max-w-[12rem] w-full relative">
                {addressProof === null ? (
                  <>
                    {updateContactData.address_proof ? (
                      <>
                        <FaTimesCircle
                          size={20}
                          color="red"
                          className="absolute top-2 right-2 cursor-pointer z-10"
                          onClick={() => handleContactChange("address_proof", "")}
                        />
                        <img
                          src={updateContactData.address_proof}
                          className="rounded-sm h-full min-h-[10rem] max-w-[12rem] w-full object-cover"
                        />
                      </>
                    ) : (
                      <>
                        <input
                          id="new-contact-proof"
                          name="new-contact-proof"
                          className="hidden"
                          type="file"
                          onChange={handelProofChange}
                        />
                        <label
                          htmlFor="new-contact-proof"
                          className="border rounded-sm flex flex-col items-center justify-center h-full w-full cursor-pointer"
                        >
                          <LuUpload />
                          <p className="text-xs text-center px-2">Upload Proof</p>
                        </label>
                      </>
                    )}
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

          {/* <div className="grid grid-cols-1 w-1/2 lg:w-full lg:grid-cols-3">
            <div className="flex flex-col lg:col-span-2"></div> */}
        </div>
        <div className="flex w-full gap-3 justify-end">
          <CustomButton
            onClick={() => {
              setUpdateContactOpen(false);
              setUpdateContactData(initialContactType);
              setAddressProof(null);
            }}
            label="Discard"
            variant="outlined"
            className="bg-white"
          />
          <CustomButton
            onClick={handleUpdateContact}
            disabled={error !== null || updateContactData.name === ""}
            label="Update Contact"
          />
        </div>
      </div>
    </Modal>
  );
};

export default UpdateContactModal;
