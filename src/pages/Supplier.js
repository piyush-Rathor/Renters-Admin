import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import cloneDeep from 'lodash/cloneDeep'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Box, Card, CardContent, CardMedia, Typography } from '@material-ui/core'

import Icons from '../constants/icons'
import addSupplier from '../constants/forms/add-supplier'
import { getPermissions, PERMISSION_CODES } from '../constants/permissions'
import { get, updateSupplier } from '../services/api'
import { toggleProcessIndicator } from '../store/reducers/app'
import { getPhoneString } from '../utils'
import config from '../constants/config'

import { FormDialog } from '../components/Form'
import { Avatar, ContentCell, Loader, SectionHeader } from '../components'
import { getAddressString } from '../components/Form/Inputs/Address'
import { CollectionInfo } from '../components/entitywise/Collection'

const updateSupplierForm = cloneDeep(addSupplier)

function Suppliers() {
  const params = useParams()

  const state = useSelector(state => state)
  const PERMISSIONS = state.auth?.user?.permissions
  const dispatch = useDispatch()

  const [s, setSupplier] = useState(null)
  const [refreshCount, setRefreshCount] = useState(0)
  const refresh = () => setRefreshCount(refreshCount + 1)
  useEffect(() => {
    dispatch(toggleProcessIndicator(true))
    Promise.all([get.supplier(params.supplierId), get.supplierProfile(params.supplierId)])
      .then(resp => {
        const supplier = resp[0]
        supplier.collections = resp[1]?.collections
        supplier.categories = resp[1]?.categories
        setSupplier(supplier)
      })
      .catch(console.log)
      .finally(() => dispatch(toggleProcessIndicator(false)))
  }, [dispatch, params.supplierId, refreshCount])

  const _updateSupplier = async (_id, values) => {
    await updateSupplier(_id, values).then(resp => refresh())
    toast.success('Supplier updated successfully.')
  }

  const allowUpdate = getPermissions(PERMISSIONS, 'supplier').includes(PERMISSION_CODES.supplier[2])

  if (!s) return <Loader absolute />
  return (
    <>
      <Card style={{ overflow: 'initial' }}>
        <CardMedia image={s.cover?.original} style={{ height: 240 }} />
        <CardContent style={{ position: 'relative', padding: 0 }}>
          <Avatar
            size={100}
            text={s.name}
            src={s.logo?.thumbnail}
            style={{ position: 'absolute', top: -50, left: 50 }}
          />
        </CardContent>
      </Card>
      <Box pl={22} pt={2} pb={1} display="flex" justifyContent="space-between">
        <Typography variant="h6"> {s.name}</Typography>

        {allowUpdate && (
          <FormDialog
            title="Update Supplier"
            buttonProps={{ icon: Icons.edit }}
            formProps={{
              formConfig: updateSupplierForm,
              submitHandler: val => _updateSupplier(s._id, val),
              incomingValue: s,
            }}
          />
        )}
      </Box>

      {s.createdAt && (
        <ContentCell
          label="Date of Registration"
          content={format(new Date(s.createdAt), 'dd/MM/yyyy hh:mma')}
        />
      )}
      {s._id && <ContentCell label="Supplier ID" content={s.humanFriendlyId || s._id} />}
      {s.contactPerson && (
        <ContentCell label="Contact Person" inline={false}>
          <Box pl={1}>
            <ContentCell label="Name" content={s.contactPerson.firstName} />
            {s.contactPerson.email && <ContentCell label="Email" content={s.contactPerson.email} />}
            {s.contactPerson.phone && (
              <ContentCell label="Phone" content={getPhoneString(s.contactPerson?.phone)} />
            )}
          </Box>
        </ContentCell>
      )}
      {s.phone && <ContentCell label="Phone" content={getPhoneString(s.phone)} />}
      {s.address && (
        <ContentCell label="Address" inline={false}>
          <Box pl={1}>
            <Typography variant="body1">• {getAddressString(s.address)}</Typography>
          </Box>
        </ContentCell>
      )}

      {s._id && (
        <ContentCell label="Store Link">
          <Typography
            variant="body1"
            component="a"
            href={`${config.WEBSITE_URL}/suppliers/${s._id}`}
            target="_blank"
            rel="noreferrer">
            {`${config.WEBSITE_URL}/suppliers/${s._id}`}
          </Typography>
        </ContentCell>
      )}

      <Box mt={5}>
        <SectionHeader icon={Icons.collections} label="Collections" />

        {s.collections.length ? (
          s.collections.map(c => {
            const category = s.categories?.filter(ca => ca._id === c.category)[0]
            const subcategory = category?.subcategories?.filter(sc => sc._id === c.subcategory)[0]
            const subSubcategory = subcategory?.subSubcategories?.filter(
              ssc => ssc._id === c.subSubcategory
            )[0]
            return (
              <Box key={c._id} mb={1.5}>
                <CollectionInfo collection={{ ...c, category, subcategory, subSubcategory }} />
              </Box>
            )
          })
        ) : (
          <Box mt={4}>
            <Typography variant="body2">No collections by {s.name}.</Typography>
          </Box>
        )}
      </Box>
    </>
  )
}

export default Suppliers
