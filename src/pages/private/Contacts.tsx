import { useEffect, useState } from "react";
import CustomButton from "../../styled/CustomButtom";
import CustomInput from "../../styled/CustomInput";
import { LuPlus, LuUpload } from "react-icons/lu";
import { BsSearch } from "react-icons/bs";
import CustomTable from "../../styled/CustomTable";
import { FiEdit } from "react-icons/fi";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { Modal } from "@mui/material";
import { AiOutlineDelete } from "react-icons/ai";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { PiWarningFill } from "react-icons/pi";
import CustomSelect from "../../styled/CustomSelect";

type ContactInfoType = {
  id: string;
  name: string;
  type: string;
  personalNumber: string;
  officeNumber: string;
  email: string;
  address: string;
  pincode: string;
  addressProof?: string;
  companyName?: string;
  actions?: string;
};

type NewContactType = {
  name: "";
  type: "";
  personalNumber: "";
  officeNumber: "";
  email: "";
  address: "";
  pincode: "";
  addressProof: "";
  companyName: "";
};

const renderIcon = (params: any) => {
  const hasProof = !!params.data?.addressProof;

  return hasProof ? (
    <FaCheckCircle className="text-green-600 text-xl" />
  ) : (
    <FaTimesCircle className="text-red-600 text-xl" />
  );
};

const Contacts = () => {
  const [search, setSearch] = useState<string>("");
  const [addContactOpen, setAddContactOpen] = useState<boolean>(false);
  const [updateContactOpen, setUpdateContactOpen] = useState<boolean>(false);
  const [deleteContactOpen, setDeleteContactOpen] = useState<boolean>(false);
  const [addressProof, setAddressProof] = useState<File | null>(null);
  const [contactData, setContactData] = useState<ContactInfoType[]>([
    {
      id: "a1f9k2",
      name: "Alice Johnson",
      type: "Employee",
      personalNumber: "9876543210",
      officeNumber: "04429874561",
      email: "alice.johnson@example.com",
      address: "123 MG Road, Chennai",
      pincode: "600001",
      addressProof:
        "https://upload.wikimedia.org/wikipedia/commons/3/36/Aadhaar_Card.jpg",
    },
    {
      id: "b3e4m8",
      name: "Bob Smith",
      type: "Contractor",
      personalNumber: "9123456780",
      officeNumber: "08023456789",
      email: "bob.smith@example.com",
      address: "456 Brigade Road, Bangalore",
      pincode: "560001",
      addressProof:
        "https://upload.wikimedia.org/wikipedia/commons/2/2e/Indian_Passport_Cover.jpg",
    },
    {
      id: "c5r2t1",
      name: "Carol Davis",
      type: "Employee",
      personalNumber: "9988776655",
      officeNumber: "02223456780",
      email: "carol.davis@example.com",
      address: "789 Andheri West, Mumbai",
      pincode: "400053",
      addressProof:
        "https://upload.wikimedia.org/wikipedia/commons/f/f1/Voter_ID_Card_India.png",
    },
    {
      id: "d9x7h3",
      name: "David Brown",
      type: "Employee",
      personalNumber: "9871234560",
      officeNumber: "01122334455",
      email: "david.brown@example.com",
      address: "12 Janpath, Delhi",
      pincode: "110001",
      addressProof:
        "https://upload.wikimedia.org/wikipedia/commons/0/0c/Driving_License_Sample_India.jpg",
    },
    {
      id: "e8y6z0",
      name: "Eva Green",
      type: "Vendor",
      personalNumber: "9811122233",
      officeNumber: "04022334455",
      email: "eva.green@example.com",
      address: "34 Banjara Hills, Hyderabad",
      pincode: "500034",
      addressProof: "https://via.placeholder.com/150?text=Electricity+Bill",
    },
    {
      id: "f2k3l9",
      name: "Frank Lee",
      type: "Employee",
      personalNumber: "9844556677",
      officeNumber: "08077665544",
      email: "frank.lee@example.com",
      address: "7 Whitefield, Bangalore",
      pincode: "560066",
      addressProof:
        "https://upload.wikimedia.org/wikipedia/commons/3/36/Aadhaar_Card.jpg",
    },
    {
      id: "g3w1n4",
      name: "Grace Kim",
      type: "Employee",
      personalNumber: "9733221144",
      officeNumber: "02255566778",
      email: "grace.kim@example.com",
      address: "9 Churchgate, Mumbai",
      pincode: "400020",
      addressProof:
        "https://upload.wikimedia.org/wikipedia/commons/2/2e/Indian_Passport_Cover.jpg",
    },
    {
      id: "h7v9j5",
      name: "Henry Ford",
      type: "Contractor",
      personalNumber: "9911887766",
      officeNumber: "01144556677",
      email: "henry.ford@example.com",
      address: "5 Connaught Place, Delhi",
      pincode: "110001",
      addressProof:
        "https://upload.wikimedia.org/wikipedia/commons/f/f1/Voter_ID_Card_India.png",
    },
    {
      id: "i6t2p3",
      name: "Ivy Chen",
      type: "Employee",
      personalNumber: "9788112233",
      officeNumber: "03322334411",
      email: "ivy.chen@example.com",
      address: "88 Salt Lake, Kolkata",
      pincode: "700091",
      addressProof: "https://via.placeholder.com/150?text=Student+ID",
    },
    {
      id: "j5b8q2",
      name: "Jake White",
      type: "Employee",
      personalNumber: "9898776655",
      officeNumber: "04455667788",
      email: "jake.white@example.com",
      address: "21 T Nagar, Chennai",
      pincode: "600017",
      addressProof:
        "https://upload.wikimedia.org/wikipedia/commons/0/0c/Driving_License_Sample_India.jpg",
    },
    {
      id: "k1m7d9",
      name: "Karen Young",
      type: "Vendor",
      personalNumber: "9822223344",
      officeNumber: "08066778899",
      email: "karen.young@example.com",
      address: "18 Koramangala, Bangalore",
      pincode: "560034",
      addressProof: "https://via.placeholder.com/150?text=Electricity+Bill",
    },
    {
      id: "l9n3f1",
      name: "Liam Taylor",
      type: "Contractor",
      personalNumber: "9765432189",
      officeNumber: "01133445566",
      email: "liam.taylor@example.com",
      address: "45 Saket, Delhi",
      pincode: "110030",
      addressProof:
        "https://upload.wikimedia.org/wikipedia/commons/2/2e/Indian_Passport_Cover.jpg",
    },
    {
      id: "m8a5s4",
      name: "Mia Anderson",
      type: "Employee",
      personalNumber: "9810011223",
      officeNumber: "02266778855",
      email: "mia.anderson@example.com",
      address: "16 Bandra East, Mumbai",
      pincode: "400051",
      addressProof:
        "https://upload.wikimedia.org/wikipedia/commons/f/f1/Voter_ID_Card_India.png",
    },
    {
      id: "n2c7x6",
      name: "Noah Wilson",
      type: "Vendor",
      personalNumber: "9755544332",
      officeNumber: "04066778899",
      email: "noah.wilson@example.com",
      address: "31 Jubilee Hills, Hyderabad",
      pincode: "500033",
      addressProof: "https://via.placeholder.com/150?text=College+ID",
    },
    {
      id: "o4u2z7",
      name: "Olivia Thomas",
      type: "Employee",
      personalNumber: "9876554433",
      officeNumber: "08033445566",
      email: "olivia.thomas@example.com",
      address: "23 Indiranagar, Bangalore",
      pincode: "560038",
      addressProof:
        "https://upload.wikimedia.org/wikipedia/commons/3/36/Aadhaar_Card.jpg",
    },
    {
      id: "p6r4y8",
      name: "Paul Harris",
      type: "Contractor",
      personalNumber: "9911223344",
      officeNumber: "02212345678",
      email: "paul.harris@example.com",
      address: "2 Colaba, Mumbai",
      pincode: "400005",
      addressProof:
        "https://upload.wikimedia.org/wikipedia/commons/0/0c/Driving_License_Sample_India.jpg",
    },
    {
      id: "q1t8m3",
      name: "Quinn Walker",
      type: "Employee",
      personalNumber: "9800123456",
      officeNumber: "01199887766",
      email: "quinn.walker@example.com",
      address: "76 Rohini, Delhi",
      pincode: "110085",
      addressProof: "https://via.placeholder.com/150?text=Electricity+Bill",
    },
    {
      id: "r3w9v2",
      name: "Ruby Scott",
      type: "Vendor",
      personalNumber: "9833344455",
      officeNumber: "04422334411",
      email: "ruby.scott@example.com",
      address: "8 Anna Nagar, Chennai",
      pincode: "600040",
      addressProof:
        "https://upload.wikimedia.org/wikipedia/commons/f/f1/Voter_ID_Card_India.png",
    },
    {
      id: "s8x1n0",
      name: "Steve Rogers",
      type: "Employee",
      personalNumber: "9811223344",
      officeNumber: "03399887766",
      email: "steve.rogers@example.com",
      address: "12 New Town, Kolkata",
      pincode: "700156",
      addressProof: "https://via.placeholder.com/150?text=Student+ID",
    },
    {
      id: "t7d5l4",
      name: "Tina Brooks",
      type: "Vendor",
      personalNumber: "9755511223",
      officeNumber: "04055667788",
      email: "tina.brooks@example.com",
      address: "10 Banjara Hills, Hyderabad",
      pincode: "500034",
      addressProof:
        "https://upload.wikimedia.org/wikipedia/commons/2/2e/Indian_Passport_Cover.jpg",
    },
  ]);
  const [newContactData, setNewContactData] = useState<ContactInfoType | null>({
    id: "",
    name: "",
    type: "",
    personalNumber: "",
    officeNumber: "",
    email: "",
    address: "",
    pincode: "",
  });

  const [deleteContact, setDeleteContact] = useState<ContactInfoType | null>(
    null
  );
  const [filteredData, setFilteredData] = useState<ContactInfoType[]>([]);
  const [updateContact, setUpdateContact] = useState<ContactInfoType | null>(
    null
  );

  const [colDefs, setColDefs] = useState<ColDef<ContactInfoType>[]>([
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      headerClass: "ag-header-wrap",
    },
    { field: "type", headerName: "Type", flex: 1, maxWidth: 80 },
    { field: "personalNumber", headerName: "Phone Number", flex: 1 },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      autoHeight: true,
      cellStyle: {
        whiteSpace: "normal",
        wordBreak: "break-word",
        lineHeight: "1.4",
      },
      wrapText: true,
    },
    {
      field: "addressProof",
      headerName: "Address\nProof",
      flex: 1,
      maxWidth: 100,
      cellRenderer: renderIcon,
      headerClass: "ag-header-wrap",
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      maxWidth: 100,
      cellRenderer: (params: ICellRendererParams) => {
        const rowData = params.data;

        return (
          <div className="flex gap-2 h-[2rem] w-fit items-center">
            <FiEdit
              size={19}
              className="cursor-pointer"
              onClick={() => {
                console.log(rowData);
                setUpdateContact(rowData);
                setUpdateContactOpen(true);
              }}
            />
            <AiOutlineDelete
              size={20}
              className="cursor-pointer"
              onClick={() => {
                setDeleteContactOpen(true);
                setDeleteContact(rowData);
              }}
            />
          </div>
        );
      },
    },
  ]);

  const [contactType, setContactType] = useState([
    { id: "1", value: "Employee" },
    { id: "2", value: "Contractor" },
    { id: "3", value: "Vendor" },
  ]);

  useEffect(() => {
    setFilteredData(contactData);
  }, [contactData]);

  useEffect(() => {
    if (search.trim()) {
      setFilteredData(
        contactData.filter(
          (data) =>
            data.name.toLowerCase().includes(search.toLowerCase()) ||
            data.personalNumber.toLowerCase().includes(search.toLowerCase()) ||
            data.officeNumber.toLowerCase().includes(search.toLowerCase()) ||
            data.type.toLowerCase().includes(search.toLowerCase())
        )
      );
    } else {
      setFilteredData(contactData);
    }
  }, [search]);

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

  const handelProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (files) {
      setAddressProof(files[0]);
    }
  };

  const handleAddContact = () => {
    if (newContactData) setFilteredData((prev) => [newContactData, ...prev]);
    setNewContactData(null);
    setAddContactOpen(false);
  };

  const handleUpdateContact = () => {
    if (updateContact) {
      const newData = filteredData.map((data) =>
        data.id === updateContact.id ? updateContact : data
      );
      setContactData(newData);
      setUpdateContact(null);
      setUpdateContactOpen(false);
    }
  };

  const handleDeleteContact = () => {
    setFilteredData((prev) =>
      prev.filter((contact) => contact.id !== deleteContact?.id)
    );
    console.log("deleted");
    setDeleteContact(null);
    setDeleteContactOpen(false);
  };

  return (
    <div className="h-fit">
      <div className="flex justify-between">
        <CustomButton
          onClick={() => setAddContactOpen(true)}
          label="Add Contact"
          icon={<LuPlus color="white" />}
        />
        <div className="w-[20rem]">
          <CustomInput
            label=""
            value={search}
            onChange={(value) => setSearch(value)}
            startIcon={<BsSearch />}
            placeholder="Search Person"
          />
        </div>
      </div>

      <div className="w-full h-fit overflow-y-auto">
        <CustomTable rowData={filteredData} colDefs={colDefs} />
      </div>

      {/* Add Contact */}
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
                <CustomSelect
                  label="Type"
                  options={contactType}
                  value={newContactData?.type ?? ""}
                  onChange={(value) => handleContactChange("type", value)}
                />
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
                  onChange={(value) =>
                    handleContactChange("officeNumber", value)
                  }
                  placeholder="Enter Office Number"
                />
              </div>

              <div className="flex flex-col gap-3">
                <CustomInput
                  label="Company"
                  value={newContactData?.companyName ?? ""}
                  onChange={(value) =>
                    handleContactChange("companyName", value)
                  }
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

      {/* Edit Contact */}
      <Modal
        open={updateContactOpen}
        onClose={() => {
          setUpdateContactOpen(false);
          setUpdateContact(null);
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
                setUpdateContact(null);
                setAddressProof(null);
              }}
            />
          </div>

          <div className=" flex flex-col gap-3 h-4/5 px-3 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ">
              <div className="flex flex-col gap-3">
                <CustomInput
                  label="Name"
                  value={updateContact?.name ?? ""}
                  onChange={(value) =>
                    setUpdateContact((prev) => {
                      if (prev) return { ...prev, name: value };
                      return null;
                    })
                  }
                  placeholder="Enter Name"
                />
                <CustomSelect
                  label="Type"
                  options={contactType}
                  value={updateContact?.type ?? ""}
                  onChange={(value) =>
                    setUpdateContact((prev) => {
                      if (prev) return { ...prev, type: value };
                      return null;
                    })
                  }
                />
              </div>

              <div className="flex flex-col gap-3">
                <CustomInput
                  label="Personal Number"
                  value={updateContact?.personalNumber ?? ""}
                  onChange={(value) =>
                    setUpdateContact((prev) => {
                      if (prev) return { ...prev, personalNumber: value };
                      return null;
                    })
                  }
                  placeholder="Enter Personal Number"
                />
                <CustomInput
                  label="Office Number"
                  value={updateContact?.officeNumber ?? ""}
                  onChange={(value) =>
                    setUpdateContact((prev) => {
                      if (prev) return { ...prev, officeNumber: value };
                      return null;
                    })
                  }
                  placeholder="Enter Office Number"
                />
              </div>

              <div className="flex flex-col gap-3">
                <CustomInput
                  label="Company"
                  value={updateContact?.companyName ?? ""}
                  onChange={(value) =>
                    setUpdateContact((prev) => {
                      if (prev) return { ...prev, companyName: value };
                      return null;
                    })
                  }
                  placeholder="Enter Company Name"
                />

                <CustomInput
                  label="Email"
                  value={updateContact?.email ?? ""}
                  onChange={(value) =>
                    setUpdateContact((prev) => {
                      if (prev) return { ...prev, email: value };
                      return null;
                    })
                  }
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
                    value={updateContact?.address ?? ""}
                    onChange={(value) =>
                      setUpdateContact((prev) => {
                        if (prev) return { ...prev, address: value };
                        return null;
                      })
                    }
                    placeholder="Enter Address"
                  />
                </div>

                <div className="lg:w-1/2">
                  <CustomInput
                    label="Pincode"
                    value={updateContact?.pincode ?? ""}
                    onChange={(value) =>
                      setUpdateContact((prev) => {
                        if (prev) return { ...prev, pincode: value };
                        return null;
                      })
                    }
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
                setUpdateContact(null);
                setAddressProof(null);
              }}
              label="Discard"
              variant="outlined"
              className="bg-white"
            />
            <CustomButton
              onClick={handleUpdateContact}
              label="Update Contact"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={deleteContactOpen}
        onClose={() => {
          setDeleteContact(null);
          setDeleteContactOpen(false);
        }}
        className="w-screen h-screen flex justify-center items-center"
      >
        <div className="flex flex-col gap-4 justify-center items-center w-2/5 max-h-4/5 bg-white rounded-lg p-4">
          <div className="flex justify-between w-full">
            <p className="text-primary text-xl font-semibold w-full text-start">
              Delete Contact
            </p>
            <MdClose
              size={25}
              className="cursor-pointer"
              onClick={() => {
                setDeleteContact(null);
                setDeleteContactOpen(false);
              }}
            />
          </div>

          <div className="bg-yellow flex flex-col w-full gap-2 p-2 rounded-sm">
            <div className="flex gap-2 items-center">
              <PiWarningFill size={25} />
              <span className="text-xl">Warning!</span>
            </div>
            <p>This action is irreversible!</p>
          </div>
          <div className="flex w-full gap-3 justify-end">
            <CustomButton
              onClick={() => {
                setDeleteContact(null);
                setDeleteContactOpen(false);
              }}
              label="Cancel"
              variant="outlined"
              className="bg-white"
            />
            <CustomButton
              onClick={() => handleDeleteContact()}
              label="Delete"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Contacts;
