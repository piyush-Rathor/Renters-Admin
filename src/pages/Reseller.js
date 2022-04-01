import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@material-ui/core'

import Icons from '../constants/icons'
import { addReferralNetwork, deleteReferral, get } from '../services/api'
import { toggleProcessIndicator } from '../store/reducers/app'
import { getTanent } from '../services/api'

import { Avatar, Button, ContentCell, Loader, SectionHeader } from '../components'
import { getAddressString } from '../components/Form/Inputs/Address'
import { ResellerInfo } from '../components/entitywise/Reseller'
import usePageData from '../services/PageData'
import { FormDialog } from '../components/Form'
import { cloneDeep } from 'lodash'
import { toast } from 'react-toastify'
import addReferral from '../constants/forms/add-referral'
import Autocomplete from '@material-ui/lab/Autocomplete'

const addReferralForm = cloneDeep(addReferral)

function Reseller() {
  const { tenantId } = useParams()
  const [tenant, setTenant] = useState(null)
  const [loadding, setLoadding] = useState(true)
  // const dispatch = useDispatch()
  // const userData = usePageData("referralNetwork", { filters: { id: params.resellerId } });
  // const {
  //   filters,
  //   filter,
  //   referralNetwork,
  //   containerRef,
  //   totalItems,
  //   Pagination,
  //   refresh,
  // } = userData

  // const [r, setReseller] = useState(null)
  // const [allowedResellers, setAllowedResellers] = useState(null);
  // const [confirmDelete, setConfirmDelete] = useState(false);
  // const [showAddReseller, setShowAddReseller] = useState(false)
  // const [deleteId, setDeleteId] = useState(null);
  // const [open, setOpen] = useState(true);
  // const [inputValue, setInputValue] = useState("");
  // const [selectedReseller, setSelectedReseller] = useState({})

  // useEffect(() => {
  //   dispatch(toggleProcessIndicator(true))
  //   Promise.all([get.reseller(params.resellerId), get.allowedReferralReseller(params.resellerId)])
  //     .then(resp => {
  //       const reseller = resp[0]
  //       setReseller(reseller)
  //       setAllowedResellers(resp[1].data)
  //     })
  //     .catch(e => console.log(e))
  //     .finally(() => dispatch(toggleProcessIndicator(false)))
  //     refresh()
  // }, [dispatch, params.resellerId])

  // const parseReseller = (r) => {
  //   if (r.shippingAddresses && r.shippingAddresses.length) {
  //     r.shippingAddresses = r.shippingAddresses.map(s => {
  //       if (s.address) {
  //         return s;
  //       } else {
  //         return {
  //           address: { ...s }
  //         };
  //       }
  //     });
  //   }
  //   return r;
  // };

  // const setAllowedReferralReseller = () => {
  //   Promise.all([get.allowedReferralReseller(params.resellerId)])
  //     .then(resp => {
  //       setAllowedResellers(resp[0].data)
  //     })
  //     .catch(e => console.log(e))
  // }
  // useEffect(() => {
  //   if(allowedResellers && allowedResellers.length){
  //     const options = allowedResellers.map(c => ({ label: c.firstName + " " + c.lastName, value: c._id }));
  //     addReferralForm.reseller.options = options
  //   }
  // }, [allowedResellers]);

  // const _addReferralNetwork = async (values) => {
  //   await addReferralNetwork(values._id, {referralId: params.resellerId}).then(resp => {refresh(); setAllowedReferralReseller()})
  //   toast.success('Referral added successfully.')
  // }

  // const handleClickOpen = () => {
  //   setConfirmDelete(true);
  // };

  // const handleClose = () => {
  //   setConfirmDelete(false);
  // };

  // const _deleteReferral = async (_id) => {
  //   if (!_id)
  //     return;
  //   await deleteReferral(_id).then(resp => {refresh(); setAllowedReferralReseller()});
  //   toast.success("Referral deleted successfully.");
  // };

  useEffect(() => {
    const GetTanent = async () => {
      try {
        const { data } = await getTanent(tenantId)
        setTenant(data)
      } catch (error) {
        console.log(error.message)
      }
    }
    GetTanent()
    setLoadding(false)
  }, [tenantId])

  return (
    <Box>
      {loadding ? (
        <Loader absolute />
      ) : (
        <>
          <Card style={{ overflow: 'initial' }}>
            <CardMedia image={tenant?.avatar?.original} style={{ height: 240 }} alt=""/>
            <CardContent style={{ position: 'relative', padding: 0 }}>
              <Avatar
                size={100}
                text={tenant?.displayName || `${tenant?.firstName} ${tenant?.lastName || ''}`.trim()}
                src={tenant?.avatar?.thumbnail}
                style={{ position: 'absolute', top: -50, left: 50 }}
              />
            </CardContent>
          </Card>
          <Box pl={22} pt={2} pb={1} display="flex" justifyContent="space-between">
            <Typography variant="h6">{`User ${tenant?.id}`}</Typography>
          </Box>

          {tenant?.createdAt && (
            <ContentCell
              label="Date of Registration"
              content={format(new Date(tenant?.createdAt), 'dd/MM/yyyy hh:mma')}
            />
          )}
          {tenant?.id && <ContentCell label="User ID" content={tenant?.humanFriendlyId || tenant?.id} />}
          {tenant?.gender && <ContentCell label="Gender" content={tenant?.gender||"Male"} />}
          {tenant?.displayName && <ContentCell label="Display Name" content={tenant?.displayName || `User ${tenant?.id}`} />}
          {tenant?.email && <ContentCell label="Email" content={tenant?.email} />}

          {tenant?.ageGroup && <ContentCell label="Age Group" content={tenant?.ageGroup} />}
          {tenant?.occupation && <ContentCell label="Occupation" content={tenant?.occupation} />}
          {tenant?.language && <ContentCell label="Language" content={tenant?.language} />}
          
        </>
      )}
    </Box>
  )
}

export default Reseller
