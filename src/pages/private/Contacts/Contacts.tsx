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
import {
  initialContactType,
  type ContactInfoType,
  type ContactInfoWithActions,
} from "../../../types/contact";
import UpdateContactModal from "./modals/UpdateContactModal";
import DeleteContactModal from "./modals/DeleteContactModal";
import { useGetContactsQuery } from "../../../services/ContactService";

const renderIcon = (params: { data: ContactInfoType }) => {
  const hasProof = !!params.data?.address_proof;

  return hasProof ? (
    <FaCheckCircle className="text-green-600 text-xl" />
  ) : (
    <FaTimesCircle className="text-red-600 text-xl" />
  );
};

const Contacts = () => {
  const [search, setSearch] = useState<string>("");
  const {
    data: contactsQueryData,
    isLoading: isGetContactsLoading,
    isSuccess: isGetContactsSuccess,
  } = useGetContactsQuery();
  const [addContactOpen, setAddContactOpen] = useState<boolean>(false);
  const [updateContactOpen, setUpdateContactOpen] = useState<boolean>(false);
  const [deleteContactOpen, setDeleteContactOpen] = useState<boolean>(false);
  const [contactData, setContactData] = useState<ContactInfoType[]>([]);

  const [deleteContactId, setDeleteContactId] = useState<string>("");
  const [filteredData, setFilteredData] = useState<ContactInfoType[]>([]);
  const [updateContactData, setUpdateContactData] =
    useState<ContactInfoType>(initialContactType);
  console.log("updateContactData: ", updateContactData);

  const colDefs: ColDef<ContactInfoWithActions>[] = [
    {
      field: "name",
      headerName: "Name",
      pinned: "left",
      flex: 1,
      minWidth: 200,
      headerClass: "ag-header-wrap",
      filter: "agTextColumnFilter",
    },
    {
      field: "personal_number",
      headerName: "Phone\nNumber",
      flex: 1,
      minWidth: 200,
      headerClass: "ag-header-wrap",
      filter: "agTextColumnFilter",
    },
    {
      field: "office_number",
      headerName: "Office Number",
      flex: 1,
      minWidth: 200,
      headerClass: "ag-header-wrap",
      filter: "agTextColumnFilter",
    },
    { field: "gstin", headerName: "GSTIN", minWidth: 100, flex: 1 },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      autoHeight: true,
      minWidth: 180,
      cellStyle: {
        whiteSpace: "normal",
        wordBreak: "break-word",
        lineHeight: "1.4",
      },
      filter: "agTextColumnFilter",
      wrapText: true,
    },
    {
      field: "address_proof",
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
                setDeleteContactId(rowData._id);
                setDeleteContactOpen(true);
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
            data.personal_number.toLowerCase().includes(search.toLowerCase()) ||
            data.office_number.toLowerCase().includes(search.toLowerCase())
        )
      );
    } else {
      setFilteredData(contactData);
    }
  }, [contactData, search]);

  useEffect(() => {
    if (isGetContactsSuccess) setContactData(contactsQueryData);
  }, [contactsQueryData, isGetContactsSuccess]);

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
          isLoading={isGetContactsLoading}
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
