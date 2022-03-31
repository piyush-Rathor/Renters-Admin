import React, { useCallback, useState, useEffect } from "react";
import { Box, Grid, InputAdornment, makeStyles, MenuItem, TextField, Typography } from "@material-ui/core";
import useDeepCompareEffect from 'use-deep-compare-effect'
import Icons from "../constants/icons";
import usePageData from "../services/PageData";
import { get } from "../services/api";
import { Table } from "../components/Table";
import { Button, Icon, Loader, SectionHeader, StatCard, Status } from "../components";
import { formatCurrency } from "../utils";
import { Link } from "react-router-dom";
import { RS_PAYMENT_MODE, RS_PAYMENT_STATUS } from "../constants";
import { toast } from "react-toastify";
import debounce from "lodash/debounce";
import format from "date-fns/format";
import CsvDownload from "react-json-to-csv";
import { v4 as uuidv4 } from 'uuid'

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

function ResellersPayments() {
  const classes = useStyles();
  const {
    resellerPayment: resellers,
    totalItems,
    containerRef,
    Pagination,
    filters,
    filter
  } = usePageData("resellerPayment", { filters: { status: null } });
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

  const [transactionIdQuery, setTransactionIdQuery] = useState("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filterByTransactionId = useCallback(
    debounce(q => filter(f => ({ ...f, transactionId: q })), 1250),
    [filter]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filterByPriceRange = useCallback(
    debounce(q => filter(f => ({ ...f, minPrice: q[0], maxPrice: q[1] })), 1250),
    [filter]
  );
  const [priceRangeQuery, setPriceRangeQuery] = useState([-1, -1]);

  const [minOrderPrice, setMinOrderPrice] = useState("");
  const [maxOrderPrice, setMaxOrderPrice] = useState("");
  const [dateRate, setDateRange] = useState({ startDate:null, endDate: null });
  const [downloadableData, setDownloadableData] = useState([])
  const clearFilters = () => {
    setHumanFriendlyIdQuery("");
    setTransactionIdQuery("");
    setMaxOrderPrice("");
    setMinOrderPrice("");
    filter({});
    setStartDateValue("")
    setEndDateValue("")
    setDateRange({ startDate:null, endDate: null })
  };

  function getPhoneNumber({ countryCode, areaCode, number }) {
    return `${countryCode || ''}${areaCode || ''}${number || ''}`
  }

  async function getDownloadableData(params) {
    const resellers = await get['resellerPayment']({ params })
    let data = resellers.data.map(r => ({
      "Reseller Id": r.resellers.humanFriendlyId || r.resellers._id,
      "Reseller Name": `${r.resellers.firstName} ${r.resellers.lastName || ""}`,
      "Phone": r.resellers.phoneDetails[0] ? getPhoneNumber(r.resellers.phoneDetails[0]) : 'N/A',
      "Payment Status": r._id.resellerPaymentStatus,
      "Total Amount": r.totalAmount,
      "Orders": r.payments.map(p => p.orderId).join(", "),
      "Payment Mode": r.payments[0].resellerPaymentMode,
      "Notes": r.payments[0].resellerPaymentNotes,
      "Transaction Date": r.payments[0].resellerTransactionDate,
      "Transaction Id": r.payments[0].resellerPaymentStatus,
      "Beneficiary Name": r.payments[0]?.resellerBankDetails?.beneficiaryName || '',
      "Bank Name": r.payments[0]?.resellerBankDetails?.bankName || '',
      "IBAN": r.payments[0]?.resellerBankDetails?.iban || '',
      "Last updated by": r.resellerUpdatedByData && r.resellerUpdatedByData.firstName ? `${r.resellerUpdatedByData.firstName} ${r.resellerUpdatedByData.lastName || ''}` : ''
    }));
    setDownloadableData(data)
  }

  useEffect(() => {
    getDownloadableData({ getAll: true })
  }, [])

  useDeepCompareEffect(() => {
    getDownloadableData({ ...filters, getAll: true })
  }, [filters])

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
      {!resellers ? (
        <Loader absolute />
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid item xs={3}>
              <StatCard label="# of resellers payments" count={totalItems} />
            </Grid>
          </Grid>

          <Box mt={5}>
            <SectionHeader
              icon={Icons.orders}
              label="Resellers Payments"
              rightComponent={
                <>
                  {
                    resellers.length ?
                      <CsvDownload data={downloadableData}
                        filename={`resellerPayments.${format(new Date(), "MMM-do-yyyy")}.csv`}
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
          <Box display="flex" alignItems="flex-end" my={2} className={classes.root}>

            <Box mr={2} mb={1}>
              <Icon color="primary" path={Icons.filter} />
            </Box>
            <Box mr={4} mb={-0.5}>
              <TextField
                label="Search"
                placeholder="code,name"
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
                label="Payment Mode"
                size="small"
                variant="outlined"
                placeholder="payment mode"
                disabled={filters.resellerPaymentInfoStatus && filters.resellerPaymentInfoStatus !== "Paid"}
                value={filters.resellerPaymentMode || ""}
                onChange={e => filter(filters => ({ ...filters, "resellerPaymentMode": e.target.value }))}
                select>
                {[
                  { label: "Cash", value: "cash" },
                  { label: "Card", value: "card" },
                  { label: "Bank", value: "bank" },
                  { label: "Wallet", value: "wallet" },
                  { label: "ATM", value: "atm" }
                ].map(option => (
                  <MenuItem key={option.label} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Search"
                placeholder="Transaction Id"
                variant="outlined"
                value={transactionIdQuery}
                onChange={e => {
                  setTransactionIdQuery(e.target.value);
                  filterByTransactionId(e.target.value);
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
              <TextField
                variant="outlined"
                placeholder={`Min price`}
                value={minOrderPrice}
                onChange={(e) => {
                  setMinOrderPrice(Number(e.target.value));
                }}
                size="small"
              />
              &nbsp;
              <TextField
                variant="outlined"
                placeholder={`Max price`}
                value={maxOrderPrice}
                onChange={(e) => {
                  setMaxOrderPrice(Number(e.target.value));
                }}
                size="small"
              />
              &nbsp;
              <Button text={"Go"} onClick={() => {
                if (maxOrderPrice && minOrderPrice > maxOrderPrice) {
                  toast.error("Max price cannot be greater than minimum price");
                  return;
                }
                setPriceRangeQuery([minOrderPrice, maxOrderPrice]);
                filterByPriceRange([minOrderPrice, maxOrderPrice]);
              }} />
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

            {resellers.length ? (
              <Box mb={2}>
                <Table
                  getKey={v => uuidv4()}
                  columns={[
                    { field: "resellerId", label: "Reseller Id" },
                    { field: "resellerName", label: "Reseller Name" },
                    { field: "resellerPhone", label: "Phone" },
                    { field: "total", label: "Total Amount" },
                    { field: "resellerPaymentStatus", label: "Payment status" },
                    { field: "transactionMode", label: "Payment Mode" },
                    { field: "transactionId", label: "Transaction Id" },
                    { field: "transactionDate", label: "Transaction Date" },
                    { field: "bonus", label: "Bonus" },
                    { field: "updatedBy", label: "Updated By" },
                    { field: "actions", label: "" }
                  ]}
                  rows={[
                    ...resellers.map(o => ({
                      resellerId: o.resellers?.humanFriendlyId || o.resellers?._id,
                      resellerName: `${o.resellers?.firstName} ${o.resellers?.lastName || ""}`,
                      resellerPhone: o.resellers?.phoneDetails[0] ? getPhoneNumber(o.resellers.phoneDetails[0]) : 'N/A',
                      total: formatCurrency(o.totalAmount),
                      transactionId: o._id.resellerTransactionId || "-",
                      transactionMode: o?.payments[0].resellerPaymentMode ? RS_PAYMENT_MODE.find(rp => rp.value === o?.payments[0].resellerPaymentMode).label : "-",
                      transactionDate: o?.payments[0].resellerTransactionDate ? format(new Date(o?.payments[0].resellerTransactionDate), "MMM do, yyyy") : "-",
                      status: o._id.resellerPaymentStatus,
                      updatedBy: `${o.resellerUpdatedByData && o.resellerUpdatedByData.firstName ? `${o.resellerUpdatedByData.firstName} ${o.resellerUpdatedByData.lastName || ''}` : '-'}`,
                      actions: <Button component={Link}
                        to={`/reseller-payments/${o._id.resellerId}/${o._id.resellerPaymentStatus}${o?._id?.resellerTransactionDate ? `/${o._id.resellerTransactionDate}` : ""}`}
                        icon={Icons.send} />,
                      resellerPaymentStatus: <Status status={o._id.resellerPaymentStatus}
                        color={o._id.resellerPaymentStatus === RS_PAYMENT_STATUS[1] ? "secondary" : "primary"} />,
                      bonus: (o?.payments[0]?.bonusId) ?  <Link style={{color:"#000"}} to={`/reseller-payments/${o._id.resellerId}/${o._id.resellerPaymentStatus}${o?._id?.resellerTransactionDate ? `/${o._id.resellerTransactionDate}` : ""}`} > Bonus </Link>:""
                    }))
                  ]}
                />
              </Box>
            ) : (
              <Box mt={4} display="flex" justifyContent="space-between">
                <Typography variant="body2">No resellers in system.</Typography>
              </Box>
            )}
          </Box>

          <Pagination />
        </>
      )}
    </Box>
  );
}

export default ResellersPayments;
