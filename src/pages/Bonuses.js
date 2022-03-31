import React, { useCallback, useState, useEffect } from "react";
import { Box, Grid, InputAdornment, makeStyles, MenuItem, TextField, Typography } from "@material-ui/core";
import useDeepCompareEffect from 'use-deep-compare-effect'
import Icons from "../constants/icons";
import usePageData from "../services/PageData";
import { get, updateBonus } from "../services/api";
import { Table } from "../components/Table";
import { Button, Icon, Loader, SectionHeader, StatCard, Status } from "../components";
import { formatCurrency, isValidateDateRange } from "../utils";
import { Link } from "react-router-dom";
import { RS_PAYMENT_MODE, RS_PAYMENT_STATUS } from "../constants";
import { toast } from "react-toastify";
import debounce from "lodash/debounce";
import format from "date-fns/format";
import CsvDownload from "react-json-to-csv";
import { v4 as uuidv4 } from 'uuid'

import cloneDeep from "lodash/cloneDeep";
import { FormDialog } from "../components/Form";
import updateBonuses from "../constants/forms/update-bonus";
import { createSupplier } from "../services/api";
import { updateItem } from "../store/reducers/arrayReducers";
import { useDispatch } from "react-redux";

const useStyles = makeStyles(theme => ({
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

const updateBonusForm = cloneDeep(updateBonuses);

function Bonus() {
  const classes = useStyles();
  const {
    bonuses: bonuses,
    totalItems,
    containerRef,
    Pagination,
    filters,
    filter,
    permissions,
    refresh,
  } = usePageData("bonuses", { filters: { status: null } });

  const [humanFriendlyIdQuery, setHumanFriendlyIdQuery] = useState(filters.reseller || "");
  const [lastQuery, setLastQuery] = useState(filters.reseller || "")
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filterByHumanFriendlyId = useCallback(
    debounce(q => {
      if (q !== lastQuery) {
        setLastQuery(q)
        filter(f => ({ ...f, reseller: q }))
      }
    }, 1250),
    [filter]
  );

  const _updateBonus = async (values) => {
    let opt = {}
    opt = {
      type: values.type,
      config: {
        [values.amountType]: values.amount,
        expiryDate: values.expiryDate
      }
    }
    await updateBonus(opt).then(resp => getBonusSettings());
    toast.success("Bonus updated successfully.");
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filterByTransactionId = useCallback(
    debounce(q => filter(f => ({ ...f, transactionId: q })), 1250),
    [filter]
  );

  const [downloadableData, setDownloadableData] = useState([])
  const [bonusSetting, setBonusSetting] = useState([])
  const [bonusType, setBonusType] = useState([])

  const clearFilters = () => {
    setHumanFriendlyIdQuery("");
    setStartDateValue("")
    setEndDateValue("")
    setDateRange({ startDate:null, endDate: null })
    filter({});
  };

  async function getDownloadableData(params) {
    const res = await get['bonuses']({ params })
    let data = res.data.map(r => ({
      "Bonus Id": r._id,
      "Reseller Id": r.reseller.humanFriendlyId || r.reseller_id,
      "Reseller Name": `${r.reseller.firstName} ${r.reseller.lastName}`,
      "Referral Id": r.reseller?.referralCode,
      "Bonus Type": r.bonusConfig.type,
      "Total Amount": r.amount,
      "Payment Status": r.payment.resellerPaymentStatus,
    }));
    setDownloadableData(data)
  }

  useEffect(() => {
    getDownloadableData({ getAll: true })
    getBonusSettings()
  }, [])
  useDeepCompareEffect(() => {
    getDownloadableData({ ...filters, getAll: true })
  }, [filters])


  const getBonusSettings = async () => {
    const res = await get['bonusSettings']({ page:1,limit:10 })
    setBonusSetting(res)
  }

  useEffect(() => {
    if (bonusSetting.length > 0) {
      let opt = []
      let amountTypeOpt = []
      bonusSetting?.map(item => {
        if(item.type === 'joiningBonus') return // to hide joiningBouns
        if(!item['isActive']) return
        let object = item.config;
        let config = {}
        for (const property in object) {
          if (property === "expiryDate") {
            config = {
              ...config, ...{
                [property]: {
                  type: "date",
                  label: "Expiry Date",
                  name: property,
                  value: object[property],
                  breakpoints: { xs: 6 },
                }
              }
            }
          } else {
            config = {
              ...config, ...{
                amount: {
                  type: "text",
                  label: property,
                  name: property,
                  defaultValue: object[property],
                  value: object[property],
                  breakpoints: { xs: 6 },
                }
              }
            }
          }
        }
        opt.push({
          label: item.type,
          value: item.type,
          config
        })
        amountTypeOpt = [
          {
            label: 'fixedAmount',
            value: 'fixedAmount',
            config
          },
          {
            label: 'percentage',
            value: 'percentage',
            config
          }
        ];
      })
      setBonusType(opt)
      updateBonusForm.type.options = opt
      updateBonusForm.type.defaultValue = opt[0].value
      updateBonusForm.amountType.options = amountTypeOpt
      updateBonusForm.amountType.defaultValue = opt[0]?.config?.amount?.name
      updateBonusForm.amount.defaultValue = opt[0].config.amount?.value
      updateBonusForm.expiryDate.defaultValue = opt[0].config?.expiryDate?.value

      updateBonusForm.amountType.onChange = (currentPath, currentValue, { setFieldValue, backTracePath, getDefaultValue }) => {
        if (currentValue !== '') {
          let filtered = amountTypeOpt.filter(c => c.value === currentValue)[0]
          setFieldValue(backTracePath(currentPath, 'amount'), filtered?.config?.amount?.value)
          setFieldValue(backTracePath(currentPath, 'expiryDate'), filtered?.config?.expiryDate?.value)
        }
      }
    }
  }, [bonusSetting])

  useDeepCompareEffect(() => {
    getDownloadableData({ ...filters, page:1,limit:10 })
  }, [filters])

  const [dateRate, setDateRange] = useState({ startDate: null, endDate: null });
  const [startDateValue, setStartDateValue] = useState(null)
  const [endDateValue, setEndDateValue] = useState(null)

  const handleFilterDate = (e) => {
    const { id, value } = e.target
    if (id === 'endDate') {
      if (!isValidateDateRange(startDateValue, value)) {
        toast.error("End Date cannot be greater than start date");
        return;
      }
      setEndDateValue(value)
    }
    if (id === 'startDate') {
      if (endDateValue !== null && !isValidateDateRange(value, endDateValue)){
        toast.error("End Date cannot be greater than start date");
        return;
      }
      setStartDateValue(value)
    }
    setDateRange({ ...dateRate, [id]: new Date(value).toISOString() });
  }

  useEffect(() => {
    if (dateRate.startDate && dateRate.endDate) {
      filter(filters => ({ ...filters, ...dateRate }))
    }
  }, [dateRate])

  return (
    <Box ref={containerRef}>
      {!bonuses ? (
        <Loader absolute />
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid item xs={3}>
              <StatCard label="# of bonuses" count={totalItems} />
            </Grid>
          </Grid>

          <Box mt={5}>
            <SectionHeader
              icon={Icons.orders}
              label="Bonus"
              rightComponent={
                <>
                  {
                    bonuses.length ?
                      <CsvDownload data={downloadableData}
                        filename={`Bonus.${format(new Date(), "MMM-do-yyyy")}.csv`}
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
              icon={Icons.bonus}
              label="Bonus"
              rightComponent={
                permissions.UPDATE && (
                  <FormDialog
                    title="Setting"
                    buttonProps={{ icon: Icons.settings }}
                    formProps={{
                      formConfig: updateBonusForm,
                      submitHandler: val => _updateBonus(val),
                    }}
                  />
                )
              }
            />
          </Box>

          <Box display="flex" alignItems="flex-end" my={2} className={classes.root}>
            <Box mr={2} mb={1}>
              <Icon color="primary" path={Icons.filter} />
            </Box>
            <Box mr={4} mb={-0.5}>
              <TextField
                label="Search"
                placeholder="name"
                variant="outlined"
                value={humanFriendlyIdQuery}
                onChange={e => {
                  setHumanFriendlyIdQuery(e.target.value);
                  filterByHumanFriendlyId(e.target.value);
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
              <TextField
                label="Payment Status"
                size="small"
                variant="outlined"
                placeholder="payment status"
                value={filters.resellerPaymentStatus || ""}
                onChange={e => filter(filters => ({ ...filters, "resellerPaymentStatus": e.target.value }))}
                select>
                {RS_PAYMENT_STATUS.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Bonus type"
                size="small"
                variant="outlined"
                placeholder="Bonus type"
                value={filters.bonusType || ""}
                onChange={e => filter(filters => ({ ...filters, "bonusType": e.target.value }))}
                select>
                {bonusType.map(option => (
                  <MenuItem key={option?.label} value={option?.value}>
                    {option?.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                id="startDate"
                size="small"
                variant="outlined"
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
                size="small"
                variant="outlined"
                label="Select End Date"
                type="date"
                onChange={handleFilterDate}
                value={endDateValue}
                InputLabelProps={{
                  shrink: true
                }}
              />
            </Box>
          </Box>

          {!!Object.values(filters).filter(Boolean).length && (
            <Button
              size="small"
              variant="outlined"
              color="warning"
              onClick={clearFilters}
              text="Clear Filters"
              style={{ marginLeft: 12 }}
            />
          )}

          <Box mt={5}>
            {bonuses.length ? (
              <Box mb={2}>
                <Table
                  getKey={v => uuidv4()}
                  columns={[
                    { field: "bonusCreatedDate", label: "Date" },
                    { field: "resellerId", label: "Reseller Id" },
                    { field: "resellerName", label: "Reseller Name" },
                    { field: "referralName", label: "Referral Name" },
                    { field: "orderId", label: "Order Id" },
                    { field: "type", label: "Bonus Type" },
                    { field: "total", label: "Bonus Amount" },
                    { field: "paymentStatus", label: "Payment status" },
                    // { field: "updatedBy", label: "Updated By" },
                    { field: "actions", label: "" }
                  ]}

                  rows={[
                    ...bonuses.map(o => ({
                      bonusCreatedDate: format(new Date(o.bonusCreatedDate), "MMM do, yyyy"),
                      resellerId: o.reseller?.humanFriendlyId || o.reseller_id,
                      resellerName: `${o.reseller?.firstName} ${o.reseller?.lastName}`,
                      referralName: `${o.referredReseller?.firstName} ${o.referredReseller?.lastName}`,
                      referralId: o.reseller?.referralCode || o.reseller?.referralId,
                      orderId: o?.payment?.orderId ? <Link style={{ color: "rgba(0, 0, 0, 0.87)" }} to={`/orders/${o?.payment?.orderSystemId}`}>{o?.payment?.orderId}</Link> : "-",
                      type: o.bonusConfig?.type,
                      total: formatCurrency(o.amount),
                      paymentStatus: <Status status={o.payment.resellerPaymentStatus}
                        color={o.payment.resellerPaymentStatus === RS_PAYMENT_STATUS[1] ? "secondary" : "primary"} />
                    }))
                  ]}
                />
              </Box>
            ) : (
              <Box mt={4} display="flex" justifyContent="space-between">
                <Typography variant="body2">No Bonus in system.</Typography>
              </Box>
            )}
          </Box>

          <Pagination />
        </>
      )}
    </Box>
  );
}

export default Bonus;
