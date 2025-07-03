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
import { useCreateContactMutation } from "../../../../services/ContactService";
import { toast } from "react-toastify";
import { TOAST_IDS } from "../../../../constants/constants";

export type AddContactModalType = {
  addContactOpen: boolean;
  setAddContactOpen: (value: boolean) => void;
};

type ErrorType = {
  name: boolean;
  email: boolean;
  personal_number: boolean;
  office_number: boolean;
  company_name: boolean;
  gstin: boolean;
  address: boolean;
  pincode: boolean;
};

const initialErrorState = {
  name: false,
  email: false,
  personal_number: false,
  office_number: false,
  company_name: false,
  gstin: false,
  address: false,
  pincode: false,
};

const AddContactModal = ({
  addContactOpen,
  setAddContactOpen,
}: AddContactModalType) => {
  const [newContactData, setNewContactData] =
    useState<ContactInfoType>(initialContactType);
  const [
    createNewContact,
    { isSuccess: isCreateContactSuccess, isError: isCreateContactError, reset },
  ] = useCreateContactMutation();
  const [addressProof, setAddressProof] = useState<File | null>(null);
  const [errors, setErrors] = useState<ErrorType>(initialErrorState);

  const handleAddContact = () => {
    const validationResult = validateContact();

    const hasAnyError = Object.values(validationResult).some(
      (val) => val === true
    );
    if (hasAnyError) return;
    const contactWithFile: ContactWithFile = {
      ...newContactData,
      file: addressProof,
    };
    createNewContact(contactWithFile);
    setAddressProof(null);
    setNewContactData(initialContactType);
  };

  const validateContact = () => {
    const newErrors = { ...initialErrorState };

    newErrors.name =
      !newContactData.name ||
      newContactData.name.length < 3 ||
      newContactData.name.length > 20;

    newErrors.email = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      newContactData.email || ""
    );

    newErrors.personal_number = !/^\d{10}$/.test(
      newContactData.personal_number || ""
    );

    if (newContactData.office_number)
      newErrors.office_number = !/^\d{10}$/.test(newContactData.office_number);

    if (newContactData.company_name)
      newErrors.company_name = newContactData.company_name.length > 20;

    if (newContactData.gstin)
      newErrors.gstin = newContactData.gstin.length > 15;

    if (newContactData.address)
      newErrors.address = newContactData.address.length > 100;

    if (newContactData.pincode)
      newErrors.pincode = newContactData.pincode.length !== 6;

    setErrors(newErrors);
    return newErrors;
  };

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (files) {
      setAddressProof(files[0]);
    }
  };

  const handleContactChange = (
    key: keyof ContactInfoType,
    value: string | number
  ) => {
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
    console.log("isCreateContactError: ", isCreateContactError);
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
      <div className="flex flex-col gap-4 justify-center items-center max-w-4/5 max-h-4/5 bg-white rounded-lg p-4">
        <div className="flex justify-between w-full">
          <p className="text-primary text-xl font-semibold w-full text-start">
            New Contact
          </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ">
            <div className="flex flex-col gap-3">
              <CustomInput
                label="Name"
                error={errors.name}
                helperText="Name is required"
                value={newContactData?.name ?? ""}
                onChange={(value) => handleContactChange("name", value)}
                placeholder="Enter Name"
              />
              <CustomInput
                label="Email"
                error={errors.email}
                helperText="Email is rquired"
                value={newContactData?.email ?? ""}
                onChange={(value) => handleContactChange("email", value)}
                placeholder="Enter Email"
              />
            </div>

            <div className="flex flex-col gap-3">
              <CustomInput
                label="Personal Number"
                error={errors.personal_number}
                helperText="Mobile Number must be 10 digit"
                value={newContactData?.personal_number ?? ""}
                onChange={(value) =>
                  handleContactChange("personal_number", value)
                }
                placeholder="Enter Personal Number"
              />
              <CustomInput
                label="Office Number"
                error={errors.office_number}
                helperText="Mobile Number must be 10 digit"
                value={newContactData?.office_number ?? ""}
                onChange={(value) =>
                  handleContactChange("office_number", value)
                }
                placeholder="Enter Office Number"
              />
            </div>

            <div className="flex flex-col gap-3">
              <CustomInput
                label="Company"
                error={errors.company_name}
                helperText="Name must be less than 20 letters"
                value={newContactData?.company_name ?? ""}
                onChange={(value) => handleContactChange("company_name", value)}
                placeholder="Enter Company Name"
              />

              <CustomInput
                label="GSTIN"
                error={errors.gstin}
                helperText="GSTIN must be 15 digit"
                value={newContactData?.gstin ?? ""}
                onChange={(value) => handleContactChange("gstin", value)}
                placeholder="Enter GSTIN"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 w-full md:w-1/2 lg:w-full lg:grid-cols-3">
            <div className="flex flex-col lg:col-span-2">
              <div className="lg:w-2/3">
                <CustomInput
                  label="Address"
                  error={errors.address}
                  helperText="Address must be less than 100"
                  multiline
                  value={newContactData?.address ?? ""}
                  onChange={(value) => handleContactChange("address", value)}
                  placeholder="Enter Address"
                />
              </div>

              <div className="lg:w-1/2">
                <CustomInput
                  label="Pincode"
                  error={errors.pincode}
                  helperText="Invalid pincode"  
                  value={newContactData?.pincode ?? ""}
                  onChange={(value) => handleContactChange("pincode", value)}
                  placeholder="Enter Pincode"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[auto_2fr] justify-center items-center sm:h-4/5 w-full gap-4">
              <label className="pt-2 w-[4rem] line-clamp-2 break-words h-fit min-h-10">
                Upload Proof
              </label>

              <div className="h-[12rem] w-[12rem] relative">
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
          <CustomButton onClick={handleAddContact} label="Add Product" />
        </div>
      </div>
    </Modal>
  );
};

export default AddContactModal;
