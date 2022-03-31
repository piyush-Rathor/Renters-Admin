import React, { useCallback, useEffect, useRef, useState } from "react";
import format from "date-fns/format";
import debounce from "lodash/debounce";
import { Link } from "react-router-dom";
import useDeepCompareEffect from "use-deep-compare-effect";
import { Box, Grid, InputAdornment, makeStyles, MenuItem, TextField, Typography } from "@material-ui/core";

import Icons from "../constants/icons";
import { get } from "../services/api";
import usePageData from "../services/PageData";

import { Table } from "../components/Table";
import { Button, Icon, Loader, SectionHeader, StatCard, Status, ToggleButtons } from "../components";
import { getShippingAddressString } from "../components/Form/Inputs/ShippingAddress";
import { formatCurrency, getCouponDiscountedPrice, getPhoneString } from "../utils";
import { toast } from "react-toastify";
import CsvDownload from "react-json-to-csv";
import { RS_PAYMENT_STATUS } from "../constants";

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

function Orders() {
  const { orders: _orders, totalItems, containerRef, metaData, Pagination, filters, filter } = usePageData("orders", { filters: { activeStatus: 'Active' } });
  const classes = useStyles();
  const orderValueRangeRef = useRef([0, 100]);
  const [orders, setOrders] = useState(null);
  const [ordersReport, setOrdersReport] = useState(null);
  useDeepCompareEffect(() => {
    if (metaData) orderValueRangeRef.current = metaData.orderValueRange;

    if (_orders) {
      Promise.all([
        get["resellers"]({ params: { _id: _orders.map(o => o.reseller), limit: 0 } }),
        get["suppliers"]({ params: { _id: _orders.map(o => o.supplier), limit: 0 } }),
        get["orderReport"]({ params: filters })
      ]).then(([resellers, suppliers, orderReport]) => {
        setOrdersReport(orderReport);
        Promise.all(
          _orders.map(async ({ ...o }) => {
            o.supplier = suppliers.data.filter(s => o.supplier === s._id)[0];
            o.reseller = resellers.data.filter(r => o.reseller === r._id)[0];
            return o;
          })
        ).then(orders => setOrders(orders));
      });
    }
  }, [_orders || [null]]);

  const [resellerQuery, setResellerQuery] = useState("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filterByReseller = useCallback(
    debounce(q => filter(f => ({ ...f, reseller: q })), 1250),
    [filter]
  );
  const [supplierQuery, setSupplierQuery] = useState("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filterBySupplier = useCallback(
    debounce(q => filter(f => ({ ...f, supplier: q })), 1250),
    [filter]
  );
  const [humanFriendlyIdQuery, setHumanFriendlyIdQuery] = useState("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filterByHumanFriendlyId = useCallback(
    debounce(q => filter(f => ({ ...f, humanFriendlyId: q })), 1250),
    [filter]
  );

  const orderValueRange = orderValueRangeRef.current;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filterByPriceRange = useCallback(
    debounce(q => filter(f => ({ ...f, minPrice: q[0] || undefined, maxPrice: q[1] || undefined })), 1250),
    [filter]
  );

  useEffect(() => {
    get["orderReport"]({ params: filters }).then(orderReport => setOrdersReport(orderReport))
  }, []);

  const clearFilters = () => {
    setResellerQuery("");
    setSupplierQuery("");
    setHumanFriendlyIdQuery("");
    setMinOrderPrice("")
    setMaxOrderPrice("")
    setStartDateValue("")
    setEndDateValue("")
    setDateRange({ startDate:null, endDate: null })
    filter({});
  };

  const [dateRate, setDateRange] = useState({ startDate:null, endDate: null });
  const [minOrderPrice, setMinOrderPrice] = useState('');
  const [maxOrderPrice, setMaxOrderPrice] = useState('');

  // const getCouponDiscountedPrice = (price, resellerMargin = 0, shippingFee = 0, coupons = null) => {
  //   if (coupons) {
  //     let amount = price - resellerMargin - shippingFee
  //     let coupontDiscount = (coupons.discountType === 'Percentage' ? (amount * coupons.discount) / 100 : coupons.discount)
  //     if (coupontDiscount >= amount) {
  //       coupontDiscount = amount
  //     }
  //     return price - coupontDiscount
  //   }
  //   return price
  // }

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
      {(!orders || !_orders) ? (
        <Loader absolute />
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid item xs={3}>
              <StatCard label="# of Orders" count={totalItems} />
            </Grid>
          </Grid>

          <Box mt={5}>
            <SectionHeader
              icon={Icons.orders}
              label="Orders"
              rightComponent={
                <>
                  {
                    ordersReport.length ?
                      <CsvDownload data={ordersReport} filename={`orders.${format(new Date(), "MMM-do-yyyy")}.csv`}
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


            <Box display="flex" alignItems="flex-end" my={2} className={classes.root}>
              <Box mr={2} mb={1}>
                <Icon color="primary" path={Icons.filter} />
              </Box>
              <Box mr={4} mb={-0.5}>
                <TextField
                  label="Search"
                  placeholder="code"
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
                  variant="outlined"
                  placeholder="Reseller Name"
                  value={resellerQuery}
                  onChange={e => {
                    setResellerQuery(e.target.value);
                    filterByReseller(e.target.value);
                  }}
                  size="small"
                />
                <TextField
                  variant="outlined"
                  placeholder={`Supplier Name`}
                  value={supplierQuery}
                  onChange={e => {
                    setSupplierQuery(e.target.value);
                    filterBySupplier(e.target.value);
                  }}
                  size="small"
                />
                <TextField
                  label="Status"
                  size="small"
                  variant="outlined"
                  placeholder="status"
                  value={filters.status || ""}
                  onChange={e => filter(filters => ({ ...filters, status: e.target.value }))}
                  select>
                  {[
                    'Created',
                    'Accepted',
                    'Rejected',
                    'Ready to ship',
                    'Cancelled',
                    'Shipped',
                    'Out for delivery',
                    'Delivered',
                    'Exchange requested',
                    'Exchange accepted',
                    'Exchange rejected',
                    'Exchange initiated',
                    'Exchange picked up',
                    'Exchanged',
                    'Refund requested',
                    'Refund initiated',
                    'Refund accepted',
                    'Refund rejected',
                    'Refund processing',
                    'Refund processed',
                    'Return initiated',
                    'Return picked up',
                    'Returned',
                    'Cancelled refund request',
                    'Cancelled exchange request',
                  ].map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
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
              </Box>
            </Box>
            <Box display="flex" alignItems="flex-end" my={2} className={classes.root}>
              <Box mr={4} mb={-0.5} display="flex" alignItems={"center"}>
                <TextField
                  label="Payment Status"
                  size="small"
                  variant="outlined"
                  placeholder="payment status"
                  value={filters["resellerPaymentStatus"] || ""}
                  onChange={e => filter(filters => ({ ...filters, "resellerPaymentStatus": e.target.value }))}
                  select>
                  {RS_PAYMENT_STATUS.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
                <Box mr={1} mb={1}>
                  <ToggleButtons
                    options={[
                      { label: "All", value: null },
                      { label: "Active", value: "Active" },
                      { label: "Draft", value: "Draft" }
                    ]}
                    value={filters.activeStatus}
                    onChange={v => filter(f => ({ ...f, activeStatus: v }))}
                  />
                </Box>
              </Box>
            </Box>
            <Box display="flex" alignItems="flex-end" my={2} className={classes.root}>
              <Box mr={4} mb={-0.5} display="flex" alignItems={"center"}>
                <TextField
                  variant="outlined"
                  placeholder={`Min price`}
                  value={minOrderPrice}
                  onChange={(e) => {
                    setMinOrderPrice(Number(e.target.value));
                  }}
                  type="number"
                  size="small"
                  inputProps={{ min: orderValueRange[0], max: orderValueRange[1] }}
                />
                <TextField
                  variant="outlined"
                  type="number"
                  placeholder={`Max price`}
                  value={maxOrderPrice}
                  onChange={(e) => {
                    setMaxOrderPrice(Number(e.target.value));
                  }}
                  size="small"
                  inputProps={{ min: orderValueRange[0], max: orderValueRange[1] }}
                />
                <Button text={"Go"} onClick={() => {
                  if ((minOrderPrice !== '' && maxOrderPrice !== '') && (minOrderPrice > maxOrderPrice)) {
                    toast.error("Max price cannot be greater than minimum price");
                    return;
                  }
                  filterByPriceRange([minOrderPrice, maxOrderPrice]);
                }} />
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
              <Box flexGrow={1} />
            </Box>

            {orders.length ? (
              <Box mb={2}>
                <Table
                  getKey={v => v._id}
                  columns={[
                    { field: "order", label: "Order", props: { width: 76 } },
                    { field: "reseller", label: "Reseller Details" },
                    { field: "supplier", label: "Supplier Details" },
                    { field: "customer", label: "Customer Details" },
                    { field: "status", label: "Order Status" },
                    { field: "activeStatus", label: "Active Status" },
                    { field: "resellerPaymentStatus", label: "Reseller Payment Status" },
                    { field: "total", label: "Total (AED)*" },
                    { field: "actions", label: "", props: { width: 48 } }
                  ]}
                  rows={[
                    ...orders.map(o => ({
                      _id: o._id,
                      order: (
                        <Box>
                          <Typography variant="body2" noWrap>
                            ID: {o.humanFriendlyId}
                          </Typography>
                          <Typography variant="body2" noWrap>
                            @ {format(new Date(o.createdAt), "MMM do, yyyy")}
                          </Typography>
                        </Box>
                      ),
                      reseller: (
                        <Box>
                          {o.reseller?.firstName}
                          <Typography variant="body2" noWrap>
                            {getPhoneString(o.reseller?.phone)}
                          </Typography>
                        </Box>
                      ),
                      supplier: (
                        <Box>
                          {o.supplier?.name}
                          <Typography variant="body2">{o.supplier?.email}</Typography>
                        </Box>
                      ),
                      customer: (
                        <Box>
                          {o.customer?.name}
                        </Box>
                      ),
                      createdAt: format(new Date(o.createdAt), "MMM do, yyyy"),
                      status: o.status && <Status status={o.status} />,
                      activeStatus: o.activeStatus && <Status status={o.activeStatus} />,
                      resellerPaymentStatus: <Status status={o?.payments?.resellerPaymentStatus || 'Not Payable'}
                        color={o?.payments?.resellerPaymentStatus === RS_PAYMENT_STATUS[1] ? "secondary" : "primary"} />,
                      total: formatCurrency(o.orderValue),
                      // total: formatCurrency(o.orderValue - (getCouponDiscountedPrice((o.orderValue - o?.payments?.resellerMargin - o?.items[0]?.shippingFee), o.coupon))),
                      actions: <Button component={Link} to={`/orders/` + o._id} icon={Icons.send} />
                    }))
                  ]}
                />
              </Box>
            ) : (
              <Box mt={4} display="flex" justifyContent="space-between">
                <Typography variant="body2">No orders in system.</Typography>
              </Box>
            )}
          </Box>

          <Pagination />
        </>
      )}
    </Box>
  );
}

export default Orders;
