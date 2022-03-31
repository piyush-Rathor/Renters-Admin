import React, { useCallback, useState, useEffect } from "react";
import { Box, Grid, InputAdornment, makeStyles, MenuItem, TextField, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, } from "@material-ui/core";
import useDeepCompareEffect from 'use-deep-compare-effect'
import Icons from "../constants/icons";
import usePageData from "../services/PageData";
import { get, createCoupon, updateCoupon, deleteCoupon } from "../services/api";
import { Table } from "../components/Table";
import { Button, Icon, Loader, SectionHeader, StatCard, ToggleButtons } from "../components";
import { toast } from "react-toastify";
import debounce from "lodash/debounce";
import format from "date-fns/format";
import CsvDownload from "react-json-to-csv";
import { v4 as uuidv4 } from 'uuid'

import cloneDeep from "lodash/cloneDeep";
import { FormDialog } from "../components/Form";
import addCoupon from "../constants/forms/add-coupon";
import { useSelector } from "react-redux";
import { getPermissions, PERMISSION_CODES } from "../constants/permissions";
import { useParams } from "react-router";

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

const addCouponForm = cloneDeep(addCoupon);

function Coupons() {
  const classes = useStyles();
  const params = useParams()
  const [status, setStatus] = useState('Existing')
  const [couponId, setCouponId] = useState(params.couponCode || "");
  const {
    coupons: bonuses,
    totalItems,
    containerRef,
    Pagination,
    filters,
    filter,
    permissions,
    refresh,
  } = usePageData("coupons", { filters: { status, couponId } });

  const [couponCodeQuery, setCouponCodeQuery] = useState(filters.couponCode || "");
  const [lastQuery, setLastQuery] = useState(filters.couponCode || "")
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filterByCouponCode = useCallback(
    debounce(q => {
      if (q !== lastQuery) {
        setLastQuery(q)
        filter(f => ({ ...f, couponCode: q }))
      }
    }, 1250),
    [filter]
  );

  const _addCoupon = async (values) => {
    let payload = {
      couponCode: values.couponCode,
      discountType: values.discountType,
      discount: values.discount,
    }
   
    if (values.date) payload = { ...payload, validity:  new Date(values.date).toISOString()}
    if (values.description) payload = { ...payload, description:  values.description}
    payload = (values.totalUsage) ? { ...payload, totalUsage: values.totalUsage } : { ...payload, totalUsage: 0 }
    payload = (values.perUserUsage) ? { ...payload, perUserUsage: values.perUserUsage } : { ...payload, perUserUsage: 0 }
    await createCoupon(payload).then(resp => refresh());
    toast.success("Coupon updated successfully.");
  };

  const _updateCoupon = async (_id, values) => {
    let payload = {
      couponCode: values.couponCode,
      discountType: values.discountType,
      discount: values.discount,
    }
    if (values.date) payload = { ...payload, validity:  new Date(values.date).toISOString()}
    payload = (values.totalUsage) ? { ...payload, totalUsage: values.totalUsage } : { ...payload, totalUsage: 0 }
    payload = (values.perUserUsage) ? { ...payload, perUserUsage: values.perUserUsage } : { ...payload, perUserUsage: 0 }
    if (values.description) payload = { ...payload, description:  values.description}

    await updateCoupon(_id, payload).then(resp => refresh());
    toast.success("Coupon updated successfully.");
  };

  const [downloadableData, setDownloadableData] = useState([])
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteAdvertisementId, setDeleteAdvertisementId] = useState(null);

  const handleClickOpen = () => {
    setConfirmDelete(true);
  };

  const handleClose = () => {
    setConfirmDelete(false);
  };
  const _deleteAdvertisement = async (_id) => {
    if (!_id)
      return;
    await deleteCoupon(_id).then(resp => refresh());
    toast.success("Coupon deleted successfully.");
  };
  const clearFilters = () => {
    setCouponId("")
    setCouponCodeQuery("");
    filter({});
  };

  async function getDownloadableData(params) {
    const res = await get['coupons']({ params })
    let data = res.data.map(o => ({
      "Coupon Code": o.couponCode,
      "Validity": o.validity ? format(new Date(o?.validity), "MMM do, yyyy") : "-",
      "Total Usage Allowed": o.totalUsage,
      "Per User Usage Allowed": o.perUserUsage,
      "Total Used": o.totalUsed,
      "Description": o.description,
    }));
    setDownloadableData(data)
  }

  useEffect(() => {
    getDownloadableData({ status, getAll: true })
  }, [])


  useDeepCompareEffect(() => {
    getDownloadableData({ ...filters, getAll: true })
  }, [filters])

  const state = useSelector(state => state);
  const PERMISSIONS = state.auth?.user?.permissions;
  const allowUpdate = getPermissions(PERMISSIONS, "coupon").includes(PERMISSION_CODES.coupon[2]);
  return (
    <Box ref={containerRef}>
      {!bonuses ? (
        <Loader absolute />
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid item xs={3}>
              <StatCard label="# of coupons" count={totalItems} />
            </Grid>
          </Grid>

          <Box mt={5}>
            <SectionHeader
              icon={Icons.coupon}
              label="Coupons"
              rightComponent={
                <>
                  {
                    bonuses.length ?
                      <CsvDownload data={downloadableData}
                        filename={`Coupons.${format(new Date(), "MMM-do-yyyy")}.csv`}
                        style={{
                          background: "#738C4A",
                          color: "#fff",
                          padding: "6px  16px",
                          fontWeight: 500,
                          lineHeight: 1.75,
                          border: 0,
                          borderRadius: "4px",
                          cursor: "pointer",
                          marginRight: "20px"
                        }}>
                        Download Report
                      </CsvDownload> : <></>
                  }
                  {permissions.CREATE && <FormDialog
                    title='Add Coupon'
                    formProps={{
                      formConfig: addCouponForm,
                      submitHandler: val => _addCoupon(val),
                    }}
                  />}
                </>
              }
            />
          </Box>

          <Box display="flex" alignItems="flex-end" my={2} className={classes.root}>
            <Box mr={2} mb={1}>
              <Icon color="primary" path={Icons.filter} />
            </Box>
            <Box mr={5} mb={-0.5}>
              <TextField
                label="Search"
                placeholder="Coupon Code"
                variant="outlined"
                value={couponCodeQuery}
                onChange={e => {
                  setCouponId("")
                  setCouponCodeQuery(e.target.value);
                  filterByCouponCode(e.target.value);
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
            <Box mr={1} mb={1}>
              <ToggleButtons
                options={[
                  { label: 'All', value: null },
                  { label: 'Existing', value: 'Existing' },
                  { label: 'Expired', value: 'Expired' },
                ]}
                value={status}
                onChange={v => setCouponId("") & setStatus(v) & filter(f => ({ ...f, status: v }))}
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
                    { field: "couponCode", label: "Coupon Code" },
                    { field: "discountType", label: "Discount Type" },
                    { field: "discount", label: "Discount" },
                    { field: "validity", label: "Validity" },
                    { field: "totalUsage", label: "Total Usage Allowed" },
                    { field: "perUserUsage", label: "Per User Usage Allowed" },
                    { field: "totalUsed", label: "Total Used" },
                    { field: "description", label: "Description" },
                    { field: "actions", label: "" }
                  ]}

                  rows={[
                    ...bonuses.map(o => ({
                      couponId: o._id,
                      couponCode: o.couponCode,
                      discountType: o.discountType,
                      discount: o.discount,
                      validity: o.validity ? format(new Date(o?.validity), "MMM do, yyyy") : "-",
                      totalUsage:  o.totalUsage > 0 ? o.totalUsage : '-',
                      perUserUsage:  o.perUserUsage > 0 ? o.perUserUsage : '-',
                      totalUsed: o.totalUsed,
                      description: o.description,
                      actions: allowUpdate && [
                        <FormDialog
                          key={"update-button" + o._id}
                          title="Update Coupon"
                          buttonProps={{ icon: Icons.edit }}
                          formProps={{
                            formConfig: addCouponForm,
                            submitHandler: val => _updateCoupon(o._id, val),
                            incomingValue: {
                              ...o,
                              date: o.validity || '',
                              totalUsage: o.totalUsage > 0 ? o.totalUsage : '',
                              perUserUsage: o.perUserUsage > 0 ? o.perUserUsage : '',
                            }
                          }}
                        />,

                        <Button onClick={() => {
                          setDeleteAdvertisementId(o._id);
                          handleClickOpen();
                        }} icon={Icons.delete} />
                      ]
                    }))
                  ]}
                />
              </Box>
            ) : (
              <Box mt={4} display="flex" justifyContent="space-between">
                <Typography variant="body2">No Bonus in system.</Typography>
              </Box>
            )}
            {
              confirmDelete && <Dialog
                open={confirmDelete}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">{"Delete coupon"}</DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    Are you sure you want to delete this coupon?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose} color="primary">
                    Disagree
                  </Button>
                  <Button onClick={() => {
                    _deleteAdvertisement(deleteAdvertisementId);
                    handleClose();
                    setDeleteAdvertisementId(null);
                  }} color="primary" autoFocus>
                    Agree
                  </Button>
                </DialogActions>
              </Dialog>
            }
          </Box>

          <Pagination />
        </>
      )}
    </Box>
  );
}

export default Coupons;
