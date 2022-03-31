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


function SuppliersPayments() {
  const classes = useStyles();
  const {
    supplierPayment: suppliers,
    totalItems,
    containerRef,
    Pagination,
    filters,
    filter
  } = usePageData("supplierPayment", { filters: { status: null } });
  const [humanFriendlyIdQuery, setHumanFriendlyIdQuery] = useState(filters.supplier || "");
  const [lastQuery, setLastQuery] = useState(filters.reseller || "")
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filterByHumanFriendlyId = useCallback(
    debounce(q => {
      if (q !== lastQuery) {
        setLastQuery(q)
        filter(f => ({ ...f, supplier: q }))
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

  function getPhoneNumber({countryCode, areaCode, number}) {
    return `${countryCode || ''}${areaCode || ''}${number || ''}`
  }

  async function getDownloadableData(params) {
    const suppliers = await get['supplierPayment']({ params })
    let data = suppliers.data.map(r => ({
      "Supplier Id": r.suppliers.humanFriendlyId || r.suppliers._id,
      "Supplier Name": `${r.suppliers.name}`,
      "Phone": r.suppliers?.contactPerson?.phone ? getPhoneNumber(r.suppliers.contactPerson.phone) : 'N/A',
      "Payment Status": r._id.supplierPaymentStatus,
      "Total Amount": r.totalAmount,
      "Orders": r.payments.map(p => p.orderId).join(", "),
      "Payment Mode": r.payments[0].supplierPaymentMode,
      "Notes": r.payments[0].supplierPaymentNotes,
      "Transaction Date": r.payments[0].supplierTransactionDate,
      "Transaction Id": r.payments[0].supplierPaymentStatus,
      "Beneficiary Name": r.payments[0]?.supplierBankDetails?.beneficiaryName || '',
      "Bank Name": r.payments[0]?.supplierBankDetails?.bankName || '',
      "IBAN": r.payments[0]?.supplierBankDetails?.iban || '',
      "Last updated by": r.supplierUpdatedByData && r.supplierUpdatedByData.firstName? `${r.supplierUpdatedByData.firstName} ${r.supplierUpdatedByData.lastName || ''}`:''
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
      {!suppliers ? (
        <Loader absolute />
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid item xs={3}>
              <StatCard label="# of suppliers" count={totalItems} />
            </Grid>
          </Grid>
          <Box mt={5}>
            <SectionHeader
              icon={Icons.orders}
              label="Supplier Payments"
              rightComponent={
                <>
                  {
                    suppliers.length ?
                      <CsvDownload data={downloadableData}
                                   filename={`supplierPayments.${format(new Date(), "MMM-do-yyyy")}.csv`}
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
                value={filters.supplierPaymentStatus || ""}
                onChange={e => filter(filters => ({ ...filters, "supplierPaymentStatus": e.target.value }))}
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
                disabled={filters.supplierPaymentInfoStatus && filters.supplierPaymentInfoStatus !== "Paid"}
                value={filters.supplierPaymentMode || ""}
                onChange={e => filter(filters => ({ ...filters, "supplierPaymentMode": e.target.value }))}
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

            {suppliers.length ? (
              <Box mb={2}>
                <Table
                  getKey={v => uuidv4()}
                  columns={[
                    { field: "supplierId", label: "supplier Id" },
                    { field: "supplierName", label: "supplier Name" },
                    { field: "supplierPhone", label: "Phone" },
                    { field: "total", label: "Total Amount" },
                    { field: "supplierPaymentStatus", label: "Payment status" },
                    { field: "transactionMode", label: "Payment Mode" },
                    { field: "transactionId", label: "Transaction Id" },
                    { field: "transactionDate", label: "Transaction Date" },
                    { field: "updatedBy", label: "Updated By" },
                    { field: "actions", label: "" }
                  ]}
                  rows={[
                    ...suppliers.map(o => ({
                      supplierId: o.suppliers?.humanFriendlyId || o.suppliers?._id,
                      supplierName: `${o.suppliers?.name}`,
                      supplierPhone: o.suppliers?.contactPerson?.phone ? getPhoneNumber(o.suppliers.contactPerson.phone) : 'N/A',
                      total: formatCurrency(o.totalAmount),
                      transactionId: o._id.supplierTransactionId || "-",
                      transactionMode: o?.payments[0].supplierPaymentMode ? RS_PAYMENT_MODE.find(rp => rp.value === o?.payments[0].supplierPaymentMode).label : "-",
                      transactionDate: o?.payments[0].supplierTransactionDate ? format(new Date(o?.payments[0].supplierTransactionDate), "MMM do, yyyy") : "-",
                      status: o._id.supplierPaymentStatus,
                      updatedBy: `${o.supplierUpdatedByData && o.supplierUpdatedByData.firstName? `${o.supplierUpdatedByData.firstName} ${o.supplierUpdatedByData.lastName || ''}`:'-'}`,
                      actions: <Button component={Link}
                                       to={`/supplier-payments/${o._id.supplierId}/${o._id.supplierPaymentStatus}${o?._id?.supplierTransactionDate ? `/${o._id.supplierTransactionDate}` : ""}`}
                                       icon={Icons.send} />,
                      supplierPaymentStatus: <Status status={o._id.supplierPaymentStatus}
                                                     color={o._id.supplierPaymentStatus === RS_PAYMENT_STATUS[1] ? "secondary" : "primary"} />
                    }))
                  ]}
                />
              </Box>
            ) : (
              <Box mt={4} display="flex" justifyContent="space-between">
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

export default SuppliersPayments;
