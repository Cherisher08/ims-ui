import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { useEffect, useState } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { BsSearch } from 'react-icons/bs';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { FiEdit } from 'react-icons/fi';
import { IoEyeOutline } from 'react-icons/io5';
import { LuPlus, LuReceiptIndianRupee } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { useGetContactsQuery } from '../../../services/ContactService';
import CustomButton from '../../../styled/CustomButton';
import CustomInput from '../../../styled/CustomInput';
import CustomTable from '../../../styled/CustomTable';
import {
  initialContactType,
  type ContactInfoType,
  type ContactInfoWithActions,
} from '../../../types/contact';
import AddContactModal from './modals/AddContactModal';
import DeleteContactModal from './modals/DeleteContactModal';
import UpdateContactModal from './modals/UpdateContactModal';
import ViewImageModal from './modals/ViewImageModal';

const renderIcon = (params: { data: ContactInfoType }) => {
  const hasProof = !!params.data?.address_proof;

  return hasProof ? (
    <FaCheckCircle className="text-green-600 text-xl" />
  ) : (
    <FaTimesCircle className="text-red-600 text-xl" />
  );
};

const Contacts = () => {
  const [search, setSearch] = useState<string>('');
  const navigate = useNavigate();
  const {
    data: contactsQueryData,
    isLoading: isGetContactsLoading,
    isSuccess: isGetContactsSuccess,
  } = useGetContactsQuery();
  const [addContactOpen, setAddContactOpen] = useState<boolean>(false);
  const [updateContactOpen, setUpdateContactOpen] = useState<boolean>(false);
  const [deleteContactOpen, setDeleteContactOpen] = useState<boolean>(false);
  const [contactData, setContactData] = useState<ContactInfoType[]>([]);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [deleteContactId, setDeleteContactId] = useState<string>('');
  const [filteredData, setFilteredData] = useState<ContactInfoType[]>([]);
  const [updateContactData, setUpdateContactData] = useState<ContactInfoType>(initialContactType);

  const colDefs: ColDef<ContactInfoWithActions>[] = [
    {
      field: 'name',
      headerName: 'Name',
      pinned: 'left',
      flex: 1,
      minWidth: 200,
      headerClass: 'ag-header-wrap',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'personal_number',
      headerName: 'Phone\nNumber',
      flex: 1,
      minWidth: 200,
      headerClass: 'ag-header-wrap',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'office_number',
      headerName: 'Office Number',
      flex: 1,
      minWidth: 200,
      headerClass: 'ag-header-wrap',
      filter: 'agTextColumnFilter',
    },
    { field: 'gstin', headerName: 'GSTIN', minWidth: 100, flex: 1 },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      autoHeight: true,
      minWidth: 180,
      cellStyle: {
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        lineHeight: '1.4',
      },
      filter: 'agTextColumnFilter',
      wrapText: true,
    },
    {
      field: 'address_proof',
      headerName: 'Address\nProof',
      flex: 1,
      minWidth: 100,
      cellRenderer: renderIcon,
      headerClass: 'ag-header-wrap',
    },
    {
      headerName: 'Image Proof',
      flex: 1,
      minWidth: 120,
      headerClass: 'ag-header-wrap',
      cellRenderer: (params: ICellRendererParams) => {
        const rowData = params.data;

        return (
          <IoEyeOutline
            size={25}
            onClick={() => {
              setImageUrl(rowData.address_proof);
            }}
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      pinned: 'right',
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
            <LuReceiptIndianRupee
              size={20}
              className="cursor-pointer"
              onClick={() => navigate(`/contacts/${rowData._id}`)}
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
      <div className="flex justify-between mb-3">
        <CustomButton
          onClick={() => setAddContactOpen(true)}
          label="Add Customer"
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
        <CustomTable rowData={filteredData} colDefs={colDefs} isLoading={isGetContactsLoading} />
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

      <ViewImageModal imageUrl={imageUrl} setImageUrl={(val) => setImageUrl(val)} />
    </div>
  );
};

export default Contacts;
