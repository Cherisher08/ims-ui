import React, { useState } from "react";
import CustomButton from "../../../../styled/CustomButton";
import { FaTimesCircle } from "react-icons/fa";
import { LuUpload } from "react-icons/lu";
import CustomInput from "../../../../styled/CustomInput";
import { Modal } from "@mui/material";
import type {
  AddContactModalType,
  ContactInfoType,
} from "../../../../types/contact";
import { MdClose } from "react-icons/md";

const AddContactModal = ({
  addContactOpen,
  setAddContactOpen,
}: AddContactModalType) => {
  const [newContactData, setNewContactData] =
    useState<ContactInfoType | null>();
  const [addressProof, setAddressProof] = useState<File | null>(null);

  const handleAddContact = () => {
    setNewContactData(null);
    setAddContactOpen(false);
  };

  const handelProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (files) {
      setAddressProof(files[0]);
    }
  };

  const handleContactChange = (key: string, value: string | number) => {
    setNewContactData((prev) => {
      if (prev)
        return {
          ...prev,
          [key]: value,
        };
      return null;
    });
  };

  return (
    <Modal
      open={addContactOpen}
      onClose={() => {
        setAddContactOpen(false);
        setNewContactData(null);
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
              setNewContactData(null);
              setAddressProof(null);
            }}
          />
        </div>

        <div className=" flex flex-col gap-3 h-4/5 px-3 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ">
            <div className="flex flex-col gap-3">
              <CustomInput
                label="Name"
                value={newContactData?.name ?? ""}
                onChange={(value) => handleContactChange("name", value)}
                placeholder="Enter Name"
              />
              {/* <CustomSelect
                  label="Type"
                  options={contactType}
                  value={newContactData?.type ?? { id: "", value: "" }}
                  onChange={(value) => handleContactChange("type", value)}
                /> */}
            </div>

            <div className="flex flex-col gap-3">
              <CustomInput
                label="Personal Number"
                value={newContactData?.personalNumber ?? ""}
                onChange={(value) =>
                  handleContactChange("personalNumber", value)
                }
                placeholder="Enter Personal Number"
              />
              <CustomInput
                label="Office Number"
                value={newContactData?.officeNumber ?? ""}
                onChange={(value) => handleContactChange("officeNumber", value)}
                placeholder="Enter Office Number"
              />
            </div>

            <div className="flex flex-col gap-3">
              <CustomInput
                label="Company"
                value={newContactData?.companyName ?? ""}
                onChange={(value) => handleContactChange("companyName", value)}
                placeholder="Enter Company Name"
              />

              <CustomInput
                label="Email"
                value={newContactData?.email ?? ""}
                onChange={(value) => handleContactChange("email", value)}
                placeholder="Enter Email"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 w-full md:w-1/2 lg:w-full lg:grid-cols-3">
            <div className="flex flex-col lg:col-span-2">
              <div className="lg:w-2/3">
                <CustomInput
                  label="Address"
                  multiline
                  value={newContactData?.address ?? ""}
                  onChange={(value) => handleContactChange("address", value)}
                  placeholder="Enter Address"
                />
              </div>

              <div className="lg:w-1/2">
                <CustomInput
                  label="Pincode"
                  value={newContactData?.pincode ?? ""}
                  onChange={(value) => handleContactChange("pincode", value)}
                  placeholder="Enter Pincode"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[auto_2fr] justify-center items-center sm:h-4/5 w-full gap-4">
              <label className="pt-2 w-[5rem] line-clamp-2 break-words h-fit">
                Upload Proof
              </label>
              {addressProof === null ? (
                <div className="h-full">
                  <input
                    id="new-contact-proof"
                    name="new-contact-proof"
                    className="hidden"
                    type="file"
                    onChange={handelProofChange}
                  ></input>
                  <label
                    htmlFor="new-contact-proof"
                    className="border rounded-sm flex flex-col items-center justify-center h-full"
                  >
                    <LuUpload />
                    <p>Upload Proof</p>
                  </label>
                </div>
              ) : (
                <div className="aspect-square relative">
                  <FaTimesCircle
                    size={20}
                    color="red"
                    colorInterpolation="green"
                    className="absolute top-2 right-2 cursor-pointer"
                    onClick={() => setAddressProof(null)}
                  />
                  <img
                    src={URL.createObjectURL(addressProof)}
                    className="rounded-sm aspect-square w-full"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex w-full gap-3 justify-end">
          <CustomButton
            onClick={() => {
              setAddContactOpen(false);
              setNewContactData(null);
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
