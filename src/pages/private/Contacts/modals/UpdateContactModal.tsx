import { Modal } from "@mui/material";
import React, { useState } from "react";
import { MdClose } from "react-icons/md";
import CustomInput from "../../../../styled/CustomInput";
import { FaTimesCircle } from "react-icons/fa";
import { LuUpload } from "react-icons/lu";
import type { UpdateContactModalType } from "../../../../types/contact";
import CustomButton from "../../../../styled/CustomButton";

const UpdateContactModal = ({
  updateContactOpen,
  setUpdateContactOpen,
  updateContactData,
  setUpdateContactData,
}: UpdateContactModalType) => {
  const [addressProof, setAddressProof] = useState<File | null>(null);

  const handleUpdateContact = () => {
    if (updateContactData) {
      setUpdateContactData(null);
      setUpdateContactOpen(false);
    }
  };

  const handelProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (files) {
      setAddressProof(files[0]);
    }
  };

  const handleContactChange = (key: string, value: string) => {
    setUpdateContactData((prev) => {
      if (prev) {
        return {
          ...prev,
          [key]: value,
        };
      }
      return null;
    });
  };

  return (
    <Modal
      open={updateContactOpen}
      onClose={() => {
        setUpdateContactData(null);
        setUpdateContactOpen(false);
        setAddressProof(null);
      }}
      className="w-screen h-screen flex justify-center items-center"
    >
      <div className="flex flex-col gap-4 justify-center items-center max-w-4/5 max-h-4/5 bg-white rounded-lg p-4">
        <div className="flex justify-between w-full">
          <p className="text-primary text-xl font-semibold w-full text-start">
            Update Contact
          </p>
          <MdClose
            size={25}
            className="cursor-pointer"
            onClick={() => {
              setUpdateContactOpen(false);
              setUpdateContactData(null);
              setAddressProof(null);
            }}
          />
        </div>

        <div className=" flex flex-col gap-3 h-4/5 px-3 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ">
            <div className="flex flex-col gap-3">
              <CustomInput
                label="Name"
                value={updateContactData?.name ?? ""}
                onChange={(value) => handleContactChange("name", value)}
                placeholder="Enter Name"
              />
              {/* <CustomSelect
                  label="Type"
                  options={contactType}
                  value={updateContactData?.type ?? { id: "", value: "" }}
                  onChange={(value) =>
                    setUpdateContactData((prev) => {
                      if (prev) return { ...prev, type: JSON.parse(value) };
                      return null;
                    })
                  }
                /> */}
            </div>

            <div className="flex flex-col gap-3">
              <CustomInput
                label="Personal Number"
                value={updateContactData?.personalNumber ?? ""}
                onChange={(value) =>
                  handleContactChange("personalNumber", value)
                }
                placeholder="Enter Personal Number"
              />
              <CustomInput
                label="Office Number"
                value={updateContactData?.officeNumber ?? ""}
                onChange={(value) => handleContactChange("officeNumber", value)}
                placeholder="Enter Office Number"
              />
            </div>

            <div className="flex flex-col gap-3">
              <CustomInput
                label="Company"
                value={updateContactData?.companyName ?? ""}
                onChange={(value) => handleContactChange("companyName", value)}
                placeholder="Enter Company Name"
              />

              <CustomInput
                label="Email"
                value={updateContactData?.email ?? ""}
                onChange={(value) => handleContactChange("email", value)}
                placeholder="Enter Email"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 w-1/2 lg:w-full lg:grid-cols-3">
            <div className="flex flex-col lg:col-span-2">
              <div className="lg:w-2/3">
                <CustomInput
                  label="Address"
                  multiline
                  value={updateContactData?.address ?? ""}
                  onChange={(value) => handleContactChange("address", value)}
                  placeholder="Enter Address"
                />
              </div>

              <div className="lg:w-1/2">
                <CustomInput
                  label="Pincode"
                  value={updateContactData?.pincode ?? ""}
                  onChange={(value) => handleContactChange("pincode", value)}
                  placeholder="Enter Pincode"
                />
              </div>
            </div>

            <div className="grid grid-cols-[auto_2fr] justify-center items-center h-4/5 w-full gap-4">
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
                <div className="aspect-square w-full overflow-hidden relative">
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
              setUpdateContactOpen(false);
              setUpdateContactData(null);
              setAddressProof(null);
            }}
            label="Discard"
            variant="outlined"
            className="bg-white"
          />
          <CustomButton onClick={handleUpdateContact} label="Update Contact" />
        </div>
      </div>
    </Modal>
  );
};

export default UpdateContactModal;
