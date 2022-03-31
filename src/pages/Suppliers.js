import React, { useCallback, useState, useEffect } from "react";
import cloneDeep from "lodash/cloneDeep";
import { toast } from "react-toastify";
import { Box, Grid, InputAdornment, makeStyles, TextField, Typography } from "@material-ui/core";
import CsvDownload from "react-json-to-csv";
import format from "date-fns/format";

import Icons from "../constants/icons";
import addSupplier from "../constants/forms/add-supplier";
import { createSupplier, createSupplierBank, updateSupplier, get } from "../services/api";
import usePageData from "../services/PageData";

import { FormDialog } from "../components/Form";
import { Button, Dialog, Icon, Loader, SectionHeader, StatCard, ToggleButtons } from "../components";
import { SupplierInfo } from "../components/entitywise/Supplier";
import debounce from "lodash/debounce";
import { getResellerStatusToBeUpdated, RESELLER_STATUS_CHANGE_BUTTON_TEXTS } from "../constants";
import BankDetails from "../components/entitywise/BankDetails";

import addBank from "../constants/forms/add-bank";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import moment from "moment";

const addBankForm = cloneDeep(addBank);
const addSupplierForm = cloneDeep(addSupplier);
const updateSupplierForm = cloneDeep(addSupplier);
const useStyles = makeStyles(theme => ({
  fullScreen: {
    flexGrow: 1
  },
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      width: "22ch"
    },
    "& .MuiTextField-root:first-child": {
      marginLeft: theme.spacing(0)
    }
  }
}));

function Suppliers() {
  const classes = useStyles();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const {
    filters,
    filter,
    suppliers,
    totalItems,
    containerRef,
    Pagination,
    refresh,
    permissions
  } = usePageData("suppliers", { filters: { status: "Active" } });
  const [collectionQuery, setCollectionQuery] = useState("");
  const [dateRate, setDateRange] = useState({ startDate: null, endDate: null });
  const [downloadableData, setDownloadableData] = useState([])
  const _createSupplier = async values => {
    await createSupplier(values).then(resp => refresh());
    toast.success("Supplier added successfully.");
  };

  const _updateSupplier = async (_id, values) => {
    await updateSupplier(_id, values).then(resp => refresh());
    toast.success("Supplier updated successfully.");
  };

  useEffect(() => {
    function getPhoneNumber({ countryCode, areaCode, number }) {
      return `${countryCode || ''}-${areaCode || ''}-${number || ''}`
    }
    async function getDownloadableData() {
      const suppliers = await get['suppliers']({ params: { getAll: true } })
      let data = suppliers.data.map(r => ({
        "Name": r.name,
        "Email": r.email,
        "Status": r.status,
        "Contact Person Name": r.contactPerson?.firstName,
        "Contact Person Phone": r.contactPerson.phone ? getPhoneNumber(r.contactPerson.phone) : 'N/A',
        "Human Friendly Id": r.humanFriendlyId,
        "Created At": format(new Date(r.createdAt), 'MMM do, yyyy'),
      }));
      setDownloadableData(data)
    }
    getDownloadableData()
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchCollection = useCallback(
    debounce(q => filter(f => ({ ...f, query: q })), 1250),
    [filter]
  );

  const resetFilters = () => {
    setCollectionQuery("");
    filter({ status: "Active" });
    setStartDateValue("")
    setEndDateValue("")
    setDateRange({ startDate:null, endDate: null })
  };


  const _createSupplierBank = async (resellerId, val) => {
    try {
      delete val.entityId;
      let bank = await createSupplierBank(resellerId, val);
      if (!bank)
        throw new Error("Bank cannot be created, try again");
      refresh();
      toast.success("Bank added successfully");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const [startDateValue, setStartDateValue] = useState(null)
  const [endDateValue, setEndDateValue] = useState(null)

  const handleFilterDate = (e) => {
    const { id, value } = e.target
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

  useEffect(() => {
    if (dateRate.startDate && dateRate.endDate) {
      filter(filters => ({ ...filters, ...dateRate }))
    }
  }, [dateRate])

  return (
    <Box ref={containerRef}>
      {!suppliers ? (
        <Loader absolute />
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid item xs={3}>
              <StatCard label="# of Suppliers" count={totalItems} />
            </Grid>
          </Grid>
          <Box mt={5}>
            <SectionHeader
              icon={Icons.orders}
              label="Suppliers"
              rightComponent={
                <>
                  {
                    suppliers.length ?
                      <CsvDownload data={downloadableData}
                        filename={`Suppliers.${format(new Date(), "MMM-do-yyyy")}.csv`}
                        style={{
                          background: "#738C4A",
                          color: "#fff",
                          padding: "6px  16px",
                          fontWeight: 500,
                          lineHeight: 1.75,
                          border: 0,
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}>
                        Download Report
                      </CsvDownload> : <></>
                  }
                </>
              }
            />
          </Box>
          <Box mt={5}>
            <SectionHeader
              icon={Icons.supplier}
              label="Suppliers"
              rightComponent={
                permissions.CREATE && (
                  <FormDialog
                    title="Add Supplier"
                    formProps={{
                      formConfig: addSupplierForm,
                      submitHandler: _createSupplier
                    }}
                  />
                )
              }
            />
            <Box display="flex" alignItems="flex-end" my={2} className={classes.root}>
              <Box mr={4} mb={-0.5}>
                <TextField
                  label="Search"
                  placeholder="name, id"
                  variant="outlined"
                  value={collectionQuery}
                  onChange={e => {
                    if (e.target.value === "") {
                      resetFilters();
                    } else {
                      searchCollection(e.target.value);
                    }
                    setCollectionQuery(e.target.value);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon color="primary" path={Icons.search} />
                      </InputAdornment>
                    )
                  }}
                  size="small"
                />
              </Box>

              <Box mr={2} mb={1}>
                <Icon color="primary" path={Icons.filter} />
              </Box>
              <Box mr={1} mb={1}>
                <ToggleButtons
                  options={[
                    { label: "All", value: null },
                    { label: "Active", value: "Active" },
                    { label: "Block", value: "Blocked" }
                  ]}
                  value={filters.status}
                  onChange={v => filter(f => ({ ...f, status: v }))}
                />
              </Box>
              <TextField
                id="startDate"
                label="Select Start Date"
                type="date"
                onChange={handleFilterDate}
                value={startDateValue}
                InputLabelProps={{
                  shrink: true
                }}
              />
              <TextField
                id="endDate"
                label="Select End Date"
                type="date"
                onChange={handleFilterDate}
                value={endDateValue}
                InputLabelProps={{
                  shrink: true
                }}
              />
              <Box flexGrow={1} />
              {!!Object.values(filters).filter(Boolean).length && (
                <Box>
                  <Button variant="text" size="small" onClick={resetFilters} text="Reset" />
                </Box>
              )}
            </Box>
            <Box mb={2} />

            {suppliers.length ? (
              suppliers.map(s => (
                <Box key={s._id} mb={1.5}>
                  <SupplierInfo
                    supplier={s}
                    actions={
                      <>
                        {
                          permissions.UPDATE && (
                            <FormDialog
                              title="Update Supplier"
                              buttonProps={{ icon: Icons.edit }}
                              formProps={{
                                formConfig: updateSupplierForm,
                                submitHandler: val => _updateSupplier(s._id, val),
                                incomingValue: s,
                                renderPosition: "ACTION_BUTTON_AREA",
                                render: () => (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() =>
                                      _updateSupplier(s._id, {
                                        status: getResellerStatusToBeUpdated(s.status)
                                      })
                                    }
                                    color={{ Block: "warning" }[RESELLER_STATUS_CHANGE_BUTTON_TEXTS[s.status]]}
                                    style={{ marginRight: 8 }}
                                    text={RESELLER_STATUS_CHANGE_BUTTON_TEXTS[s.status]}
                                  />
                                )
                              }}
                            />
                          )
                        }
                        {
                          s.banks.length < 1 && <FormDialog
                            title="Add Bank"
                            buttonProps={{ icon: Icons.bankAdd }}
                            formProps={{
                              formConfig: addBankForm,
                              submitHandler: val => _createSupplierBank(s.humanFriendlyId || s._id, val),
                              incomingValue: { entityId: s.humanFriendlyId || s._id }
                            }}
                          />
                        }
                        {
                          <Dialog
                            width={"sm"}
                            dialogProps={{ fullScreen }}
                            title="Update Bank"
                            buttonProps={{ icon: Icons.bank }}
                          >
                            {
                              <div className={classes.fullScreen}>
                                <Grid container spacing={3}>
                                  {
                                    s?.banks.map(m =>
                                      <Grid item xs="12">
                                        <BankDetails {...m} _id={s.humanFriendlyId || s._id} entity='suppliers' />
                                      </Grid>)
                                  }
                                </Grid>
                              </div>
                            }
                          </Dialog>
                        }
                      </>
                    }
                  />
                </Box>
              ))
            ) : (
              <Box mt={4}>
                <Typography variant="body2">No suppliers in system.</Typography>
              </Box>
            )}
          </Box>

          <Pagination />
        </>
      )}
    </Box>
  );
}

export default Suppliers;
