import { Box, Grid, Typography } from '@material-ui/core'
import { Button, ContentCell, Loader, Section } from '../components'
import { Table } from '../components/Table'
import { formatCurrency } from '../utils'
import { Link, useParams } from 'react-router-dom'
import Icons from '../constants/icons'
import React, { useEffect, useState } from 'react'
import { get, updateResellerPayment } from '../services/api'
import { FormDialog } from '../components/Form'
import { cloneDeep } from 'lodash'
import resellerPaymentUpdate from '../constants/forms/reseller-payment-update'
import { toggleProcessIndicator } from '../store/reducers/app'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import format from 'date-fns/format'

const ResellersPayment = () => {
  const params = useParams()
  const [reseller, setReseller] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isReferralBonus, setIsReferralBonus] = useState(false)
  const dispatch = useDispatch()
  const [refreshCount, setRefreshCount] = useState(0)
  const refresh = () => setRefreshCount(refreshCount + 1)

  const _updateOrder = values => {
    // delete values.amountToPay
    const data = {
      resellerBankDetails: values.bankDetails,
      resellerPaymentStatus: values.status,
      resellerPaymentMode: values.mode,
      resellerTransactionDate: new Date(values.date).toISOString(),
      resellerTransactionId: values?.transactionId,
      resellerNotes: values.notes,
      paymentAmount: values.amountToPay
    }

    if (['Waiting Payout', 'Eligible for Payout', 'Not Payable'].includes(data.resellerPaymentStatus)) {
      data.resellerPaymentMode = null
      data.resellerTransactionDate = null
      data.resellerTransactionId = null
    }
    dispatch(toggleProcessIndicator(true))
    let ids = []
    if (values.orderIds) {
      values.orderIds.filter(id => {
        reseller.order.map(order => {
          if (order?.orderSystemId === id) {
            ids.push(order.orderId, id)
          }
        })
      })
    }
    if (values.bonusIds) ids = [...ids, ...values.bonusIds]
    return updateResellerPayment(ids, data)
      .then(resp => {
        toast.success('Order updated successfully.')
        if (data.resellerTransactionDate) {
          return window.location.pathname = `/reseller-payments/${params.reseller}/${data.resellerPaymentStatus}/${data.resellerTransactionDate}`
        } else {
          return window.location.pathname = `/reseller-payments/${params.reseller}/${data.resellerPaymentStatus}`
        }
      })
      .catch(() => toast('Something went wrong!', { type: 'error' }))
      .finally(() => {
        dispatch(toggleProcessIndicator(false))
      })
  }

  const sendEmail = () => {
    get['sendEmail'](params.reseller, params.status, params.transactionId || '', isReferralBonus, params.transactionDate)
      .then(res => {
        toast.success('Successfully Sent Email Receipt')
      })
      .catch(e => {
        toast.error(e)
      })
  }

  const resellerPaymentUpdateForm = cloneDeep(resellerPaymentUpdate)

  const _UpdateResellerPayment = async values => await _updateOrder(values)

  useEffect(() => {
    get['resellerPaymentDetail'](params.reseller, params.status, params.transactionDate || '')
      .then(r => {
        let order = [], bonus = [], payments = []
        if (r.data.length > 0) {
          r.data.map(data => {
            if (data.payments.length > 0) {
              data.payments.map(pay => {
                if (pay.bonusId !== undefined) {
                  if (pay.orderId !== undefined) {
                    setIsReferralBonus(true)
                  }
                  bonus.push(pay)
                } else {
                  order.push(pay)
                }
                payments.push(pay)
              })
            }
          })
        }
        if (!r.data[0]) {
          return window.location.pathname = 'reseller-payments'
        }
        setReseller({ ...r.data[0], order, bonus, payments })
      })
      .catch(e => console.log(e))
      .finally(() => setIsLoading(false))
  }, [params])

  if (reseller && reseller.order) {
    if (reseller.order.length) {
      resellerPaymentUpdateForm.orderIds.options = reseller.order.map(p => ({
        label: p.orderId,
        value: p?.orderSystemId,
      }))
    } else {
      resellerPaymentUpdateForm.orderIds._hide = () => true
    }
  }
  if (reseller && reseller.bonus && reseller.bonus.length) {
    resellerPaymentUpdateForm.bonusIds._hide = () => false
    resellerPaymentUpdateForm.bonusIds.options = reseller.bonus.map(p => ({
      label: p.bonusId,
      value: p.bonusId,
    }))
  }
  return (
    <Box>
      {(!reseller || !reseller.length) && isLoading ? (
        <Loader absolute />
      ) : (
        <>
          <Box mt={2.5} display="flex">
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Section
                  label="Reseller Details"
                  containerProps={{ pt: 0 }}
                  cardContent={
                    <Box pl={1} mt={-1}>
                      <ContentCell
                        label="Id"
                        content={reseller?.resellers?.humanFriendlyId || reseller?.resellers?._id}
                      />
                      <ContentCell
                        label="Name"
                        content={`${reseller?.resellers?.firstName} ${reseller?.resellers?.lastName || ''}`}
                      />
                      {reseller?.resellers?.email && (
                        <ContentCell label="Email" content={reseller.resellers.email} />
                      )}
                      {reseller?.totalAmount ? (
                        <ContentCell
                          label="Reseller Margin"
                          content={formatCurrency(reseller?.totalAmount || 0)}
                        />
                      ) : null}
                      {reseller?.payments[0]?.resellerPaymentStatus && (
                        <ContentCell
                          label="Payment Status"
                          content={reseller?.payments[0]?.resellerPaymentStatus}
                        />
                      )}
                      {reseller?.payments[0]?.resellerPaymentMode && (
                        <ContentCell
                          label="Payment Mode"
                          content={reseller?.payments[0]?.resellerPaymentMode}
                        />
                      )}
                      {reseller?.payments[0]?.resellerTransactionDate && (
                        <ContentCell
                          label="Transaction Date"
                          content={format(
                            new Date(reseller?.payments[0]?.resellerTransactionDate),
                            'MMM do, yyyy'
                          )}
                        />
                      )}
                      {reseller?.payments[0]?.resellerTransactionId && (
                        <ContentCell
                          label="Transaction Id"
                          content={reseller?.payments[0]?.resellerTransactionId}
                        />
                      )}
                      {reseller?.payments[0]?.resellerNotes && (
                        <ContentCell label="Notes" content={reseller?.payments[0]?.resellerNotes} />
                      )}
                      {reseller?.payments[0]?.resellerPaymentMode === 'bank' &&
                        reseller?.payments[0]?.resellerBankDetails && (
                          <ContentCell
                            label="Beneficiary Name"
                            content={reseller?.payments[0]?.resellerBankDetails.beneficiaryName}
                          />
                        )}
                      {reseller?.payments[0]?.resellerPaymentMode === 'bank' &&
                        reseller?.payments[0]?.resellerBankDetails && (
                          <ContentCell
                            label="Bank Name"
                            content={reseller?.payments[0]?.resellerBankDetails.bankName}
                          />
                        )}
                      {reseller?.payments[0]?.resellerPaymentMode === 'bank' &&
                        reseller?.payments[0]?.resellerBankDetails && (
                          <ContentCell
                            label="IBAN"
                            content={reseller?.payments[0]?.resellerBankDetails.iban}
                          />
                        )}
                    </Box>
                  }
                  rightComponent={
                    <>
                      {['Paid', 'Payment Initiated'].includes(params.status) &&
                        reseller.resellers.email &&
                        reseller.resellers.email.length && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            onClick={sendEmail}
                            text="Send Email"
                            style={{ marginLeft: 12, marginRight: 12 }}
                          />
                        )}
                      <FormDialog
                        title="Update Payments"
                        buttonProps={{
                          startIcon: Icons.reseller,
                          disabled:
                            reseller?.payments[0]?.resellerPaymentStatus === 'Not Payable' ||
                            reseller?.payments[0]?.resellerPaymentStatus === 'Waiting Payout',
                        }}
                        formProps={{
                          formConfig: resellerPaymentUpdateForm,
                          submitHandler: _UpdateResellerPayment,
                          incomingValue: {
                            entity: 'reseller',
                            payments: reseller.payments,
                            date: reseller.payments[0].resellerTransactionDate || new Date().toISOString(),
                            notes: reseller.payments[0].resellerNotes || '',
                            orderIds: reseller.order.map(p => p?.orderSystemId),
                            bonusIds: reseller.bonus.map(p => p.bonusId),
                            amountToPay: reseller.payments.reduce(
                              (total, next) => (total += next.resellerMargin),
                              0
                            ),
                            status: reseller.payments[0].resellerPaymentStatus,
                            mode: reseller.payments[0].resellerPaymentMode,
                            transactionId: reseller.payments[0].resellerTransactionId,
                            bankDetails:
                              reseller.resellers.banks && reseller.resellers.banks.length
                                ? { ...reseller.resellers.banks[0] }
                                : {},
                          },
                        }}
                      />
                    </>
                  }
                />
              </Grid>
            </Grid>
          </Box>
          <Box mt={5}>
            {reseller.order.length ? (
              <Box mb={2}>
                <Table
                  getKey={v => `${v.orderId}${new Date().getTime()}`}
                  columns={[
                    { field: 'orderId', label: 'Order Id' },
                    { field: 'orderDate', label: 'Order Date' },
                    { field: 'deliveredAt', label: 'Delivery Date' },
                    { field: 'total', label: 'Total Amount' },
                    { field: 'actions', label: '' },
                  ]}
                  rows={reseller.order.map(o => ({
                    orderId: o?.orderId,
                    orderDate: o.order ? format(new Date(o.order.createdAt), 'MMM do, yyyy') : null,
                    deliveredAt: o.order?.deliveredAt ? format(new Date(o.order.deliveredAt), 'MMM do, yyyy') : 'Not Yet Delivered',
                    total: formatCurrency(o.resellerMargin),
                    actions: <Button component={Link} to={`/orders/` + o.orderSystemId} icon={Icons.send} />,
                  }))}
                />
              </Box>
            ) : (
              <Box mt={4} display="flex" justifyContent="space-between">
                <Typography variant="body2">No orders in system.</Typography>
              </Box>
            )}
          </Box>
          <Box mt={5}>
            {reseller.bonus.length ? (
              <Box mb={2}>
                <Table
                  getKey={v => `${v.orderId}${new Date().getTime()}`}
                  columns={[
                    { field: 'bonusId', label: 'Bonus Id' },
                    { field: 'orderId', label: 'Order Id' },
                    { field: 'orderDate', label: 'Order Date' },
                    { field: 'bonusType', label: 'Bonus Type' },
                    { field: 'total', label: 'Total Amount' },
                  ]}
                  rows={reseller.bonus.map(o => ({
                    bonusId: (o?.orderId && o?.bonusId) ? <Link style={{ color: "#000" }} to={`/bonus/${o?.bonusId}`} >{o?.bonusId}</Link> : o?.bonusId,
                    orderId: o?.orderId,
                    orderDate: o?.order?.createdAt ? format(new Date(o?.order?.createdAt), 'MMM do, yyyy') : null,
                    bonusType: (o?.orderId && o?.bonusId) ? "Referral Bonus" : (!o?.orderId && o?.bonusId) ? "Joining Bonus" : "",
                    total: formatCurrency(o.resellerMargin),
                  }))}
                />
              </Box>
            ) : (
              <Box mt={4} display="flex" justifyContent="space-between">
                <Typography variant="body2">No bonuses in system.</Typography>
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  )
}

export default ResellersPayment
