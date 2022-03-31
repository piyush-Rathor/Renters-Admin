import { Box, Grid, Typography } from "@material-ui/core";
import { Button, ContentCell, Loader, Section } from "../components";
import { Table } from "../components/Table";
import { formatCurrency } from "../utils";
import { Link, useParams } from "react-router-dom";
import Icons from "../constants/icons";
import React, { useEffect, useState } from "react";
import { get, updateSupplierPayment } from "../services/api";
import { FormDialog } from "../components/Form";
import { cloneDeep } from "lodash";
import supplierPaymentUpdate from "../constants/forms/reseller-payment-update";
import { toggleProcessIndicator } from "../store/reducers/app";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import format from "date-fns/format";

const SupplierPayment = () => {
  const params = useParams();
  const [supplier, setsupplier] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const [refreshCount, setRefreshCount] = useState(0);
  const refresh = () => setRefreshCount(refreshCount + 1);

  const _updateOrder = (values) => {
    delete values.amountToPay
    const data = {
      supplierBankDetails: values.bankDetails,
      supplierPaymentStatus: values.status,
      supplierPaymentMode: values.mode,
      supplierTransactionDate: new Date(values.date).toISOString(),
      supplierTransactionId: values?.transactionId,
      supplierNotes: values.notes
    };
    if (['Waiting Payout', 'Eligible for Payout', 'Not Payable'].includes(data.supplierPaymentStatus)) {
      data.supplierPaymentMode = null
      data.supplierTransactionDate = null
      data.supplierTransactionId = null
    }
    dispatch(toggleProcessIndicator(true));
    let ids = []
    if (values.orderIds) {
      values.orderIds.filter(id => {
        supplier.payments.map(order => {
          if (order?.orderSystemId === id) {
            ids.push(order?.orderId, id)
          }
        })
      })
    }
    return updateSupplierPayment(ids, data)
      .then(resp => {
        toast.success("Order updated successfully.");
        refresh();
        window.location.href = "/supplier-payments";
      })
      .catch(() => toast("Something went wrong!", { type: "error" }))
      .finally(() => {
        dispatch(toggleProcessIndicator(false));
      });
  };

  const supplierPaymentUpdateForm = cloneDeep(supplierPaymentUpdate);
  const _UpdateSupplierPayment = async values => await _updateOrder(values);

  useEffect(() => {
    get["supplierPaymentDetail"](params.supplier, params.status, params.transactionDate || "").then(r => setsupplier(r.data[0])).catch(e => console.log(e)).finally(() => setIsLoading(false));
  }, [params]);

  if(supplier && supplier.payments && supplier.payments.length)
  {
    supplierPaymentUpdateForm.orderIds.options = supplier.payments.map(p=>({label:p.orderId,value:p.order?._id}))
  }

  const [totalAmount, setTotalAmount] = useState(0)
  useEffect(() => {
    if(!!supplier?.payments?.length){
      let amt = supplier.payments.reduce((total,next)=> total += (next.supplierPrice * next.order?.items[0].quantity),0)
      setTotalAmount(amt)
    }
  }, [supplier])

  return (
    <Box>
      {!supplier.length && isLoading ? (
        <Loader absolute />
      ) : (
        <>

          <Box mt={2.5} display="flex">
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Section
                  label="supplier Details"
                  containerProps={{ pt: 0 }}
                  cardContent={
                    <Box pl={1} mt={-1}>
                      <ContentCell label="Id" content={supplier.suppliers.humanFriendlyId || supplier.suppliers?._id} />
                      <ContentCell label="Name"
                                   content={`${supplier.suppliers.name}`} />
                      {supplier?.suppliers?.email && <ContentCell label="Email" content={supplier.suppliers.email} />}
                      {supplier?.totalAmount ? <ContentCell label="Supplier Margin" content={formatCurrency(totalAmount)} /> : null}
                      {supplier?.payments[0]?.supplierPaymentStatus &&
                      <ContentCell label="Payment Status" content={supplier?.payments[0]?.supplierPaymentStatus} />}
                      {supplier?.payments[0]?.supplierPaymentMode &&
                      <ContentCell label="Payment Mode" content={supplier?.payments[0]?.supplierPaymentMode} />}
                      {supplier?.payments[0]?.supplierTransactionDate && <ContentCell label="Transaction Date"
                                                                                      content={format(new Date(supplier?.payments[0]?.supplierTransactionDate), "MMM do, yyyy")} />}
                      {supplier?.payments[0]?.supplierTransactionId &&
                      <ContentCell label="Transaction Id" content={supplier?.payments[0]?.supplierTransactionId} />}
                      {supplier?.payments[0]?.supplierNotes &&
                      <ContentCell label="Notes" content={supplier?.payments[0]?.supplierNotes} />}
                      {supplier?.payments[0]?.supplierPaymentMode === 'bank' &&  supplier?.payments[0]?.supplierBankDetails && <ContentCell label="Beneficiary Name" content={supplier?.payments[0]?.supplierBankDetails.beneficiaryName} />}
                      {supplier?.payments[0]?.supplierPaymentMode === 'bank' &&  supplier?.payments[0]?.supplierBankDetails && <ContentCell label="Bank Name" content={supplier?.payments[0]?.supplierBankDetails.bankName} />}
                      {supplier?.payments[0]?.supplierPaymentMode === 'bank' &&  supplier?.payments[0]?.supplierBankDetails && <ContentCell label="IBAN" content={supplier?.payments[0]?.supplierBankDetails.iban} />}
                    </Box>
                  }
                  rightComponent={
                    <FormDialog
                      title="Update Payments"
                      buttonProps={{ startIcon: Icons.supplier, disabled: (supplier?.payments[0]?.supplierPaymentStatus === 'Not Payable' || supplier?.payments[0]?.supplierPaymentStatus === 'Waiting Payout') }}
                      formProps={{
                        formConfig: supplierPaymentUpdateForm,
                        submitHandler: _UpdateSupplierPayment,
                        incomingValue: {
                          entity:"supplier",
                          payments:supplier.payments,
                          date: supplier.payments[0].supplierTransactionDate || "",
                          notes: supplier.payments[0].supplierNotes || "",
                          orderIds: supplier.payments.map(p => p.order?._id),
                          amountToPay: totalAmount,
                          status: supplier.payments[0].supplierPaymentStatus,
                          mode: supplier.payments[0].supplierPaymentMode,
                          transactionId: supplier.payments[0].supplierTransactionId,
                          bankDetails: supplier.suppliers.banks && supplier.suppliers.banks.length ? { ...supplier.suppliers.banks[0] } : {}}
                      }}
                    />
                  }
                />
              </Grid>
            </Grid>
          </Box>
          <Box mt={5}>
            {supplier.payments.length ? (
              <Box mb={2}>
                <Table
                  getKey={v => `${v.supplierId}${new Date().getTime()}`}
                  columns={[
                    { field: "orderId", label: "Order Id" },
                    { field: "orderDate", label: "Order Date" },
                    { field: 'deliveredAt', label: 'Delivery Date' },
                    { field: "total", label: "Total Amount" },
                    { field: "actions", label: "" }
                  ]}
                  rows={[
                    ...supplier.payments.map(o => ({
                      orderId: o?.orderId,
                      orderDate: format(new Date(o.order?.createdAt), "MMM do, yyyy"),
                      deliveredAt: o.order?.deliveredAt ? format(new Date(o.order.deliveredAt), 'MMM do, yyyy') : 'Not Yet Delivered',
                      total: formatCurrency(o.supplierPrice * o.order?.items[0].quantity),
                      actions: <Button component={Link} to={`/orders/` + o.orderSystemId} icon={Icons.send} />
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
        </>
      )}
    </Box>
  );
};

export default SupplierPayment;
