import React, { useCallback, useState, useEffect } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import { toast } from 'react-toastify'
import { Box, Grid, InputAdornment, makeStyles, TextField, Typography } from '@material-ui/core'
import CsvDownload from 'react-json-to-csv'
import format from 'date-fns/format'

import Icons from '../constants/icons'
import addReseller from '../constants/forms/add-reseller'
import { createResellerBank, updateReseller, get } from '../services/api'
import usePageData from '../services/PageData'
import { getUsers } from '../services/api'

import { FormDialog } from '../components/Form'
import { Button, Dialog, Icon, Loader, SectionHeader, StatCard, ToggleButtons } from '../components'
import { ResellerInfo } from '../components/entitywise/Reseller'
import { getResellerStatusToBeUpdated, RESELLER_STATUS_CHANGE_BUTTON_TEXTS } from '../constants'
import debounce from 'lodash/debounce'
import BankDetails from '../components/entitywise/BankDetails'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useTheme } from '@material-ui/core/styles'
import addBank from '../constants/forms/add-bank'

const updateResellerForm = cloneDeep(addReseller)
const addBankForm = cloneDeep(addBank)
const useStyles = makeStyles(theme => ({
  fullScreen: {
    flexGrow: 1,
  },
  root: {
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: '22ch',
    },
    '& .MuiTextField-root:first-child': {
      marginLeft: theme.spacing(0),
    },
  },
}))

function Resellers() {
  const classes = useStyles()
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const [users, setUsers] = useState([])
  const [nonFilter,setNonFilter] = useState([])
  const [reset,setReset]=useState(false);
  const [loadding, setLodding] = useState(true)
  // const {
  //   filters,
  //   filter,
  //   resellers,
  //   totalItems,
  //   containerRef,
  //   Pagination,
  //   refresh,
  //   permissions
  // } = usePageData("resellers", { filters: { status: "Active" } });
  // const [collectionQuery, setCollectionQuery] = useState("");
  // const [numberQuery, setNumberQuery] = useState("");
  const [dateRate, setDateRange] = useState({ startDate: null, endDate: null });
  // const [downloadableData, setDownloadableData] = useState([])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // const searchCollection = useCallback(
  //   debounce(q => filter(f => ({ ...f, query: q })), 1250),
  //   [filter]
  // );
  // const searchByNumber = useCallback(
  //   debounce(q => filter(f => ({ ...f, number: q })), 1250),
  //   [filter]
  // );
  // useEffect(() => {
  //   function getPhoneNumber({countryCode, areaCode, number}) {
  //     return `${countryCode || ''}-${areaCode || ''}-${number || ''}`
  //   }
  //   async function getDownloadableData() {
  //     const resellers = await get['resellers']({ params: { getAll: true }})
  //     let data = resellers.data.map(r => ({
  //       "First Name": r.firstName,
  //       "Last Name": r.lastName,
  //       "Phone": r.phone ? getPhoneNumber(r.phone) : 'N/A',
  //       "Email": r.email,
  //       "Status": r.status,
  //       "Display Name": r.displayName,
  //       "Gender": r.gender,
  //       "Language": r.language,
  //       "Occupation": r.occupation,
  //       "Human Friendly Id": r.humanFriendlyId,
  //       "Created At": format(new Date(r.createdAt), 'MMM do, yyyy'),
  //     }));
  //     setDownloadableData(data)
  //   }
  //   getDownloadableData()
  // }, [])
  // updateResellerForm.phone.countryCode.disabled = true;
  // updateResellerForm.phone.areaCode.disabled = true;
  // updateResellerForm.phone.number.disabled = true;
  // const _updateReseller = async (_id, values) => {
  //   if (values.shippingAddresses && values.shippingAddresses.length) {
  //     values.shippingAddresses = values.shippingAddresses.map(a => {
  //       if (a.address) {
  //         return {
  //           ...a.address
  //         };
  //       } else
  //         return {
  //           ...a
  //         };
  //     });
  //   }
  //   await updateReseller(_id, values).then(resp => refresh());
  //   toast.success("Reseller updated successfully.");
  // };

  // const resetFilters = () => {
  //   setCollectionQuery("");
  //   filter({ status: "Active" });
  //   setNumberQuery("");
  //   setStartDateValue("")
  //   setEndDateValue("")
  //   setDateRange({ startDate:null, endDate: null })
  // };

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

  // function getDownloadableData() {
  //   let data = resellers.map(r => ({
  //     "First Name": r.firstName,
  //     "Last Name": r.lastName,
  //     "Email": r.email,
  //     "Status": r.status,
  //     "Display Name": r.displayName,
  //     "Gender": r.gender,
  //     "Language": r.language,
  //     "Occupation": r.occupation,
  //     "Human Friendly Id": r.humanFriendlyId,
  //     "Created At": format(new Date(r.createdAt), 'MMM do, yyyy'),
  //   }));
  //   return data
  // }

  // const _createResellerBank = async (resellerId, val) => {
  //   try {
  //     delete val.entityId
  //     let bank = await createResellerBank(resellerId, val);
  //     if (!bank)
  //       throw new Error("Bank cannot be created, try again");
  //     refresh()
  //     toast.success("Bank added successfully");
  //   } catch (e) {
  //     toast.error(e.message);
  //   }
  // };

  const [startDateValue, setStartDateValue] = useState(null)
  const [endDateValue, setEndDateValue] = useState(null)

  // const handleFilterDate = (e) => {
  //   const { id, value } = e.target
  //   if (id === 'endDate') {
  //     if (new Date(startDateValue) > new Date(value)) {
  //       toast.error("End Date cannot be greater than start date");
  //       return;
  //     }
  //     let ed = new Date(value);
  //     ed.setHours(23, 0, 0, 0);
  //     setEndDateValue(value)
  //     setDateRange({ ...dateRate, endDate: new Date(ed.getTime()).toISOString() });
  //   }
  //   if (id === 'startDate') {
  //     if(endDateValue !== null){
  //       if (new Date(value) > new Date(endDateValue)) {
  //         toast.error("End Date cannot be greater than start date");
  //         return;
  //       }
  //     }
  //     setStartDateValue(value)
  //     setDateRange({ ...dateRate, startDate: new Date(value).toISOString() });
  //   }
  // }

  // useEffect(() => {
  //   if (dateRate.startDate && dateRate.endDate) {
  //     filter(filters => ({ ...filters, ...dateRate }))
  //   }
  // }, [dateRate])

  const filterByName=(name)=>{
    const filtered=users?.users?.filter(user => {
      return `user ${user?.id}`.includes(name.toLowerCase())})
    setUsers(user=>{
      return {...user,users: filtered}
    })
  }

  const filterByNumber=(number)=>{
    const filtered=users?.users?.filter(user => {
     return user?.mobileNumber?.toString().includes(number)})
    setUsers(user=>{
      return {...user,users: filtered}
    })
  }

  useEffect(() => {
    getUsersDetails()
    setStartDateValue(null)
    setEndDateValue(null)
  }, [reset])

  const getUsersDetails = async () => {
    try {
      const { data } = await getUsers()
      setUsers(data)
      setNonFilter(data?.users)
      setLodding(false)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const filterDate=(e)=>{
    const { id, value } = e.target;
    if (id === 'endDate') {
      if (new Date(startDateValue) > new Date(value)) {
        toast.error("End Date cannot be greater than start date");
        return;
      }
      let ed = new Date(value);
      ed.setHours(23, 0, 0, 0);
      setEndDateValue(value)
      setDateRange({ ...dateRate, endDate: new Date(ed.getTime()).toISOString() });
    }
    if (id === 'startDate') {
      if(endDateValue !== null){
        if (new Date(value) > new Date(endDateValue)) {
          toast.error("End Date cannot be greater than start date");
          return;
        }
      }
      setStartDateValue(value)
      setDateRange({ ...dateRate, startDate: new Date(value).toISOString() });
    }
  }

  useEffect(()=>{
    let filtered=nonFilter
    if(startDateValue){
      filtered=nonFilter?.filter(user => {
        return new Date(user?.createdAt).getTime()>=new Date(dateRate.startDate).getTime()
    })
  }
    if(endDateValue){
      filtered=filtered.filter(user => {
        return new Date(user?.createdAt).getTime()<=new Date(dateRate.endDate).getTime()
      })
    }
    setUsers(user=>{
      return {...user,users: filtered}
    })

  },[startDateValue, endDateValue,nonFilter,dateRate])

  return (
    <Box>
      {loadding ? (
        <Loader absolute />
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid item xs={3}>
              <StatCard label="# of Users" count={ users?.totalCount } />
            </Grid>
          </Grid>
          <Box mt={5}>
            <SectionHeader
              icon={Icons.orders}
              label="Tenants"
              rightComponent={
                <>
                  {users?.users?.length ? (
                    <CsvDownload
                      //  data={downloadableData}
                      //              filename={`Resellers.${format(new Date(), "MMM-do-yyyy")}.csv`}
                      style={{
                        background: '#738C4A',
                        color: '#fff',
                        padding: '6px  16px',
                        fontWeight: 500,
                        lineHeight: 1.75,
                        border: 0,
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}>
                      Download Report
                    </CsvDownload>
                  ) : (
                    <></>
                  )}
                </>
              }
            />
          </Box>
          <Box mt={5}>
            <SectionHeader icon={Icons.reseller} label="Tenants" />
            <Box display="flex" alignItems="flex-end" my={2} className={classes.root}>
              <Box mr={4} mb={-0.5}>
                <TextField
                  label="Search"
                  placeholder="name, id"
                  variant="outlined"
                  // value={collectionQuery}
                  onChange={e => {
                    if (e.target.value === "") {
                      setReset(e=>!e);
                    } else {
                      filterByName(e.target.value);
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon color="primary" path={Icons.search} />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Box>
              <Box mr={6} mb={-0.5}>
                <TextField
                  label="Search by Number"
                  placeholder="number (either number or area code)"
                  variant="outlined"
                  // value={numberQuery}
                  onChange={e => {
                    if (e.target.value === "") {
                      setReset(e=>!e);
                    } else {
                      filterByNumber(e.target.value);
                    }}}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon color="primary" path={Icons.search} />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Box>
              {/* <Box mr={2} mb={1}>
                <Icon color="primary" path={Icons.filter} />
              </Box> */}
              {/* <Box mr={1} mb={1}>
                <ToggleButtons
                  options={[
                    { label: 'All', value: null },
                    { label: 'Active', value: 'Active' },
                    { label: 'Block', value: 'Blocked' },
                  ]}
                  // value={filters.status}
                  // onChange={v => filter(f => ({ ...f, status: v }))}
                />
              </Box> */}
              <TextField
                id="startDate"
                label="Select Start Date"
                type="date"
                onChange={filterDate}
                value={startDateValue&&startDateValue}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                id="endDate"
                label="Select End Date"
                type="date"
                onChange={filterDate}
                value={endDateValue&&endDateValue}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <Box flexGrow={1} />
              {!!Object.values([true]).filter(Boolean).length && (
                <Box>
                  <Button variant="text" size="small" text="Reset" onClick={() =>{
                    setReset(e=>!e)}}/>
                </Box>
              )}
            </Box>
            <Box mb={2} />
          </Box>
          <Box mb={2} />
          {users?.users?.length? (
            users?.users.map(s => (
              <Box key={s.id} mb={1.5}>
                <ResellerInfo
                  reseller={s}
                  actions={
                    <>
                      {true && (
                        <FormDialog
                          title="Update Reseller"
                          buttonProps={{ icon: Icons.edit }}
                          formProps={{
                            formConfig: updateResellerForm,
                            // submitHandler: val => _updateReseller(s._id, val),
                            // incomingValue: parseReseller(s),
                            renderPosition: 'ACTION_BUTTON_AREA',
                            render: () => (
                              <Button
                                variant="outlined"
                                size="small"
                                // onClick={() =>
                                //   _updateReseller(s._id, {
                                //     status: getResellerStatusToBeUpdated(s.status)
                                //   })
                                // }
                                color={{ Block: 'warning' }[RESELLER_STATUS_CHANGE_BUTTON_TEXTS[s.status]]}
                                style={{ marginRight: 8 }}
                                text={RESELLER_STATUS_CHANGE_BUTTON_TEXTS[s.status]}
                              />
                            ),
                          }}
                        />
                      )}
                      {/* {
                          s.banks.length < 1 && <FormDialog
                            title="Add Bank"
                            buttonProps={{ icon: Icons.bankAdd }}
                            formProps={{
                              formConfig: addBankForm,
                              // submitHandler: val => _createResellerBank(s.humanFriendlyId || s._id, val),
                              incomingValue: { entityId: s.humanFriendlyId || s._id }
                            }}
                          />
                        } */}
                      {/* {
                          s.banks.length >=1  && <Dialog
                            width={"sm"}
                            dialogProps={{ fullScreen }}
                            title="Update Bank"
                            buttonProps={{ icon: Icons.bank }}
                          >
                            {
                              <div className={classes.fullScreen}>
                                <Grid container spacing={3}>
                                  {
                                    s.banks.map(m =>
                                      <Grid item xs="12">
                                        <BankDetails {...m} _id={s.humanFriendlyId || s._id} entity='resellers'  />
                                      </Grid>)
                                  }
                                </Grid>
                              </div>
                            }
                          </Dialog>
                        } */}
                    </>
                  }
                />
              </Box>
            ))
          ) : (
            <Box mt={4}>
              <Typography variant="body2">No User in system.</Typography>
            </Box>
          )}
          {/* <Pagination /> */}
        </>
      )}
    </Box>
  )
}

export default Resellers
