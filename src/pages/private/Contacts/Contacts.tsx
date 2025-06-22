import { useEffect, useState } from "react";
import CustomButton from "../../../styled/CustomButton";
import CustomInput from "../../../styled/CustomInput";
import { LuPlus } from "react-icons/lu";
import { BsSearch } from "react-icons/bs";
import CustomTable from "../../../styled/CustomTable";
import { FiEdit } from "react-icons/fi";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { AiOutlineDelete } from "react-icons/ai";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import AddContactModal from "./modals/AddContactModal";
import type {
  ContactInfoType,
  ContactInfoWithActions,
  UpdateContactInfoType,
} from "../../../types/contact";
import UpdateContactModal from "./modals/UpdateContactModal";
import DeleteContactModal from "./modals/DeleteContactModal";

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
  const [contactData, setContactData] = useState<ContactInfoType[]>([
    {
      id: "a1f9k2",
      name: "Alice Johnson",
      personalNumber: "9876543210",
      officeNumber: "04429874561",
      email: "alice.johnson@example.com",
      gstin: "21387891239",
      address: "123 MG Road, Chennai",
      pincode: "600001",
      addressProof:
        "https://upload.wikimedia.org/wikipedia/commons/3/36/Aadhaar_Card.jpg",
    },
    {
      id: "b3e4m8",
      name: "Bob Smith",
      personalNumber: "9123456780",
      officeNumber: "08023456789",
      email: "bob.smith@example.com",
      gstin: "21387891239",
      address: "456 Brigade Road, Bangalore",
      pincode: "560001",
      addressProof:
        "https://upload.wikimedia.org/wikipedia/commons/2/2e/Indian_Passport_Cover.jpg",
    },
    {
      id: "c5r2t1",
      name: "Carol Davis",
      gstin: "21387891239",
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
      gstin: "21387891239",
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
      gstin: "21387891239",
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
      gstin: "21387891239",
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
      gstin: "21387891239",
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
      gstin: "21387891239",
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
      gstin: "21387891239",
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
      gstin: "21387891239",
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
      gstin: "21387891239",
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
      gstin: "21387891239",
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
      gstin: "21387891239",
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
      gstin: "21387891239",
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
      gstin: "21387891239",
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
      gstin: "21387891239",
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
      gstin: "21387891239",
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
      gstin: "21387891239",
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
      gstin: "21387891239",
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
      gstin: "21387891239",
      personalNumber: "9755511223",
      officeNumber: "04055667788",
      email: "tina.brooks@example.com",
      address: "10 Banjara Hills, Hyderabad",
      pincode: "500034",
      addressProof:
        "https://upload.wikimedia.org/wikipedia/commons/2/2e/Indian_Passport_Cover.jpg",
    },
  ]);

  const [deleteContactId, setDeleteContactId] = useState<string>("");
  const [filteredData, setFilteredData] = useState<ContactInfoType[]>([]);
  const [updateContactData, setUpdateContactData] =
    useState<UpdateContactInfoType>({
      id: "",
      name: "",
      email: "",
      personalNumber: "",
      officeNumber: "",
      companyName: "",
      gstin: "",
      address: "",
      pincode: "",
      addressProof: "",
    });

  const colDefs: ColDef<ContactInfoWithActions>[] = [
    {
      field: "name",
      headerName: "Name",
      pinned: "left",
      flex: 1,
      maxWidth: 150,
      headerClass: "ag-header-wrap",
    },
    {
      field: "personalNumber",
      headerName: "Phone\nNumber",
      flex: 1,
      minWidth: 100,
      headerClass: "ag-header-wrap",
    },
    {
      field: "officeNumber",
      headerName: "Office Number",
      flex: 1,
      minWidth: 100,
      headerClass: "ag-header-wrap",
    },
    { field: "gstin", headerName: "GSTIN", minWidth: 100, flex: 1 },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      autoHeight: true,
      minWidth: 120,
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
      minWidth: 100,
      cellRenderer: renderIcon,
      headerClass: "ag-header-wrap",
    },
    {
      field: "actions",
      headerName: "Actions",
      pinned: "right",
      flex: 1,
      minWidth: 120,
      maxWidth: 130,
      cellRenderer: (params: ICellRendererParams) => {
        const rowData = params.data;

        return (
          <div className="flex gap-2 h-[2rem] w-fit items-center">
            <FiEdit
              size={19}
              className="cursor-pointer"
              onClick={() => {
                setUpdateContactData(rowData);
                setUpdateContactOpen(true);
              }}
            />
            <AiOutlineDelete
              size={20}
              className="cursor-pointer"
              onClick={() => {
                setDeleteContactOpen(true);
                setDeleteContactId(rowData.id);
              }}
            />
          </div>
        );
      },
    },
  ];

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
            data.officeNumber.toLowerCase().includes(search.toLowerCase())
        )
      );
    } else {
      setFilteredData(contactData);
    }
  }, [search]);

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
        <CustomTable
          rowData={filteredData}
          colDefs={colDefs}
          isLoading={false}
        />
      </div>

      <AddContactModal
        addContactOpen={addContactOpen}
        setAddContactOpen={(value: boolean) => setAddContactOpen(value)}
      />

      <UpdateContactModal
        updateContactOpen={updateContactOpen}
        setUpdateContactOpen={(value: boolean) => setUpdateContactOpen(value)}
        updateContactData={updateContactData}
        setUpdateContactData={setUpdateContactData}
      />

      <DeleteContactModal
        deleteContactOpen={deleteContactOpen}
        setDeleteContactOpen={(value) => setDeleteContactOpen(value)}
        deleteContactId={deleteContactId}
        setDeleteContactId={(value) => setDeleteContactId(value)}
      />
    </div>
  );
};

export default Contacts;
