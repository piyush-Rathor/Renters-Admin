import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { cloneDeep } from "lodash";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { Box, Card, CardActionArea, CardContent, CardMedia, Grid, Typography } from "@material-ui/core";

import { createOrder, get, updateOrder, updatePayment } from "../services/api";

import Icons from "../constants/icons";
import { getPermissions, PERMISSION_CODES } from "../constants/permissions";
import updateOrderCustomer from "../constants/forms/update-order-customer";
import updateOrderNotes from "../constants/forms/update-order-notes";
import { promptRemark } from "../constants/forms";
import { ContentCell, Icon, Loader, Menu, Section, Status } from "../components";
import { toggleProcessIndicator } from "../store/reducers/app";
import { getAddressString } from "../components/Form/Inputs/Address";
import { formatCurrency, getCouponDiscountedPrice, getDiscountedPrice, getErfaPrice, getPhoneString } from "../utils";
import { ORDER_STATUSES, RS_PAYMENT_MODE, RS_PAYMENT_STATUS } from "../constants";
import { Table } from "../components/Table";
import { FormDialog } from "../components/Form";
import { prompt } from "../components/Prompt";
import addOrder from "../constants/forms/add-order";


const addOrderForm = cloneDeep(addOrder);
const updateOrderCustomerForm = cloneDeep(updateOrderCustomer);
const updateOrderNotesForm = cloneDeep(updateOrderNotes);


function Order() {
  const params = useParams();

  const [refreshCount, setRefreshCount] = useState(0);
  const refresh = () => setRefreshCount(refreshCount + 1);
  const [order, setOrder] = useState(null);

  const state = useSelector(state => state);
  const PERMISSIONS = state.auth?.user?.permissions;
  const dispatch = useDispatch();

  const resellerStatus = ["Cancelled", "Return requested", "Exchange requested", "Refund requested", "Cancelled refund request", "Cancelled exchange request"];
  const rejectedOrderPaymentStatus = [
    'Cancelled',
    'Rejected',
    'Exchange accepted',
    'Exchange rejected',
    'Exchange initiated',
    'Exchange picked up',
    'Exchanged',
    'Refund accepted',
    'Refund rejected',
    'Refund processing',
    'Refund processed',
    'Return initiated',
    'Return picked up',
    'Returned',
  ]
  useEffect(() => {
    dispatch(toggleProcessIndicator(true));
    get["order"](params.orderId)
      .then(async o => {
        const [items, actions, notes, reseller] = await Promise.all([
          await Promise.all(
            o.items.map(async ({ ...i }) => {
              i.product = await get["product"](i.product);
              i.product.supplier = await get["supplier"](i.product.supplier);
              return i;
            })
          ),
          await Promise.all(
            o.actions.reverse().map(async ({ ...a }) => {
              const superuser = await get[
                resellerStatus.includes(a.status) ? "reseller" : "superuser"
              ](a.updatedBy);
              a.updatedBy = [superuser.firstName, superuser.lastName].filter(Boolean).join(" ");
              return a;
            })
          ),
          await Promise.all(
            o.notes.reverse().map(async ({ ...a }) => {
              const superuser = await get["superuser"](a.updatedBy);
              a.updatedBy = [superuser.firstName, superuser.lastName].filter(Boolean).join(" ");
              return a;
            })
          ),
          get["reseller"](o.reseller)
        ]);
        o.items = items;
        o.actions = actions;
        o.notes = notes;
        o.reseller = reseller;
        setOrder(o);
      })
      .catch(console.log)
      .finally(() => dispatch(toggleProcessIndicator(false)));
  }, [dispatch, params.orderId, refreshCount]);

  const _updateOrder = async values => {
    dispatch(toggleProcessIndicator(true));
    return updateOrder(order._id, values)
      .then(resp => {
        toast.success("Order updated successfully.");
        refresh();
      })
      .catch(() => toast("Something went wrong!", { type: "error" }))
      .finally(() => {
        dispatch(toggleProcessIndicator(false));
      });
  };

  const _updatePayment = async values => {
    dispatch(toggleProcessIndicator(true));
    return updatePayment(order.humanFriendlyId, {...values, ids:[order.humanFriendlyId]})
      .then(resp => {
        toast.success("Order Payment updated successfully.");
        refresh();
      })
      .catch(() => toast("Something went wrong!", { type: "error" }))
      .finally(() => {
        dispatch(toggleProcessIndicator(false));
      });
  }
  const updatePaymentActions = RS_PAYMENT_STATUS.filter(s => s !== RS_PAYMENT_STATUS[2] && s !== RS_PAYMENT_STATUS[3]).map(s => ({
    _id: s,
    label: s,
    onClick: () => prompt(`Payment Status`, `Reseller and Supplier Payment Status to ${s}`, () => _updatePayment({ "resellerPaymentStatus": s, "supplierPaymentStatus": s }))
  }));

  const updateActions = ORDER_STATUSES.map(s => ({
    _id: s,
    label: s,
    onClick: () =>
      resellerStatus.includes(s) ? toast.info("Can be only done by reseller") : prompt(`Updating status to '${s}'`, "Add remark (optional)", {
        formConfig: promptRemark,
        selfDisabled: false,
        submitHandler: ({ remark }) => _updateOrder({ status: s, remark })
      })
  }));

  const allowUpdate = getPermissions(PERMISSIONS, "order").includes(PERMISSION_CODES.order[1]);

  if (!order) return <Loader absolute />;

  async function _createOrder(val) {
    try {
      const {
        size,
        quantity,
        supplierPrice,
        platformMargin,
        platformMarginType,
        discount,
        resellerMargin,
        discountType,
        shippingFee,
        customer,
        shippingAddress,
        reseller,
        lastOrder
      } = val;
      let items = [];
      items.push({
        product: order.items[0].product._id,
        size,
        quantity,
        supplierPrice,
        platformMargin,
        platformMarginType,
        discount,
        resellerMargin,
        discountType,
        shippingFee
      });
      if (!reseller) {
        toast.error("Please provide reseller Id");
        return;
      }
      let orderData = { customer, shippingAddress, items, reseller, lastOrder };
      await createOrder(orderData);
      toast.success("Order created successfully");
      localStorage.removeItem("add-order-admin");
    } catch (e) {
      if (e.response.data.message) {
        toast.error(e.response.data.message);
      } else
        toast.error(e.response.data);
    }
  }

  function parseOrder(lastOrder) {
    let data = { ...lastOrder, reseller: lastOrder.reseller.humanFriendlyId || lastOrder.reseller._id };
    Object.keys(lastOrder.items[0].product).map(op => data[op] = lastOrder.items[0]["product"][op]);
    let p = cloneDeep({
      ...data,
      quantity: 0,
      resellerMargin: 0,
      shippingFee: 0,
      size: "",
      lastOrder: lastOrder.humanFriendlyId || lastOrder._id
    });
    let localstorageData = cloneDeep(JSON.parse(localStorage.getItem("add-order-admin")));
    if (localstorageData) {
      if (!localstorageData.size) {
        if (localstorageData.quantity) localstorageData.quantity = 0;
      } else {
        let localSize = p.sizes.find(ps => ps.size === localstorageData.size);
        let localQuantity = localstorageData.quantity;
        if (!localSize)
          localstorageData.quantity = 0;
        if (localQuantity && localSize) {
          if (localQuantity >= localSize.stock)
            localstorageData.quantity = localSize.stock;
        }
      }
      localstorageData.orderTotal = ((p.discountedPrice) * (localstorageData.quantity || 0)) + (localstorageData.resellerMargin || 0) + (localstorageData.shippingFee || 0);
    }
    return { ...localstorageData, ...p };
  }

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        {allowUpdate ? (
          <Menu
            activator={(clickHandler, isOpen) => (
              <Box display="flex" onClick={clickHandler} style={{ cursor: "pointer" }} tabIndex="0">
                <Status status={order.status} />
                <Icon path={isOpen ? Icons.upArrow : Icons.downArrow} />
              </Box>
            )}
            items={updateActions}
            menuProps={{
              anchorOrigin: { vertical: "bottom", horizontal: "left" },
              transformOrigin: { vertical: "top", horizontal: "left" }
            }}
          />
        ) : (
          <Status status={order.status} />
        )}

        {order.createdAt && (
          <ContentCell label="Order Time" content={format(new Date(order.createdAt), "dd/MM/yyyy hh:mma")} />
        )}
      </Box>

      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Box display="flex" flexDirection="column">
          <ContentCell label="Order ID" content={order.humanFriendlyId || order._id} />
          {order?.paymentInfo?.paymentMode && <ContentCell label="Payment Method"
            content={RS_PAYMENT_MODE.find(p => p.value === order.paymentInfo.paymentMode).label} />}
            {order?.paymentInfo?.transactionId && <ContentCell label="Transaction ID"
              content={order.paymentInfo.transactionId} />}
        </Box>
        <Box display="flex">
          <FormDialog
            title="Add New Order"
            formProps={{
              formConfig: addOrderForm,
              submitHandler: _createOrder,
              incomingValue: parseOrder(order)
            }}
          />
        </Box>
      </Box>
      {order.trackingLink && (
        <ContentCell label="Tracking Link">
          <a href={order.trackingLink} target="_blank" rel="noreferrer">
            <Typography variant="body1" component="span">
              {order.trackingLink}
            </Typography>
          </a>
        </ContentCell>
      )}
      {order.lastOrder && (
        <ContentCell label="Previous Order">
          <a href={order.lastOrders._id} target="_blank" rel="noreferrer">
            <Typography variant="body1" component="span">
              {order.lastOrders.humanFriendlyId || order.lastOrders._id.substring(0, 6)}
            </Typography>
          </a>
        </ContentCell>
      )}

      <Box mt={2.5} display="flex">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Section
              label="Customer Details"
              containerProps={{ pt: 0 }}
              cardContent={
                <Box pl={1} mt={-1}>
                  <ContentCell label="Name" content={order.customer.name} />
                  <ContentCell label="Phone" content={getPhoneString(order.customer?.phone)} />
                  {!!order.customer?.email && <ContentCell label="Email" content={order.customer?.email} />}
                  {order.shippingAddress && (
                    <ContentCell label="Shipping Address" content={getAddressString(order.shippingAddress)} />
                  )}
                </Box>
              }
              rightComponent={
                <FormDialog
                  title="Update Details"
                  buttonProps={{ icon: Icons.edit }}
                  formProps={{
                    formConfig: updateOrderCustomerForm,
                    submitHandler: val =>
                      _updateOrder({
                        customer: { name: val.name, phone: val.phone },
                        shippingAddress: val.address,
                        trackingLink: val.trackingLink
                      }),
                    incomingValue: {
                      ...order.customer,
                      address: order.shippingAddress,
                      trackingLink: order.trackingLink
                    }
                  }}
                />
              }
            />
          </Grid>
          <Grid item xs={6}>
            <Section
              label="Reseller Details"
              containerProps={{ pt: 0 }}
              cardContent={
                order.reseller?.firstName && (
                  <Box pl={1} mt={-1}>
                    <Box display="flex">
                      <Typography
                        variant="body1">{`${order.reseller?.firstName} ${order.reseller?.lastName} (${order.reseller?.humanFriendlyId || order.reseller?._id})`}</Typography>
                      <Box ml={1}>
                        {(order?.payments?.resellerPaymentStatus === RS_PAYMENT_STATUS[0] || order?.payments?.resellerPaymentStatus === RS_PAYMENT_STATUS[1] || order?.payments?.resellerPaymentStatus === RS_PAYMENT_STATUS[4]) && (order.status === ORDER_STATUSES[6]) && !rejectedOrderPaymentStatus.includes(order.status) ? (
                          <Menu
                            activator={(clickHandler, isOpen) => (
                              <Box display="flex" onClick={clickHandler} style={{ cursor: "pointer" }} tabIndex="0">
                                <Status status={order.payments.resellerPaymentStatus}
                                  color={order.payments.resellerPaymentStatus === "Eligible for Payout" ? "secondary" : "primary"} />
                                <Icon path={isOpen ? Icons.upArrow : Icons.downArrow} />
                              </Box>
                            )}
                            items={updatePaymentActions}
                            menuProps={{
                              anchorOrigin: { vertical: "bottom", horizontal: "left" },
                              transformOrigin: { vertical: "top", horizontal: "left" }
                            }}
                          />
                        ) : (
                          <Status status={order?.payments?.resellerPaymentStatus || "Not Payable"}
                            color={order?.payments?.resellerPaymentStatus === "Eligible for Payout" ? "secondary" : "primary"} />
                        )}
                      </Box>
                    </Box>

                    <ContentCell label="Phone" content={getPhoneString(order.reseller?.phone)} />
                  </Box>
                )
              }
            />
          </Grid>
          <Grid item xs={6}>
            <Section
              label="Supplier Details"
              containerProps={{ pt: 0 }}
              cardContent={
                order.items[0] && (
                  <Box pl={1} mt={-1}>
                    <Typography
                      variant="body1">{`${order.items[0].product?.supplier?.name} (${order.items[0].product?.supplier?.humanFriendlyId || order.items[0].product?.supplier?._id})`}</Typography>
                    <ContentCell label="Email" content={order.items[0].product?.supplier?.email} />
                    {(order?.payments?.supplierPaymentStatus === RS_PAYMENT_STATUS[0] || order?.payments?.supplierPaymentStatus === RS_PAYMENT_STATUS[1] || order?.payments?.supplierPaymentStatus === RS_PAYMENT_STATUS[4]) && (order.status === ORDER_STATUSES[6]) && !rejectedOrderPaymentStatus.includes(order.status) ? (
                      <Menu
                        activator={(clickHandler, isOpen) => (
                          <Box display="flex" onClick={clickHandler} style={{ cursor: "pointer" }} tabIndex="0">
                            <Status status={order.payments.supplierPaymentStatus}
                              color={order.payments.supplierPaymentStatus === "Eligible for Payout" ? "secondary" : "primary"} />
                            <Icon path={isOpen ? Icons.upArrow : Icons.downArrow} />
                          </Box>
                        )}
                        items={updatePaymentActions}
                        menuProps={{
                          anchorOrigin: { vertical: "bottom", horizontal: "left" },
                          transformOrigin: { vertical: "top", horizontal: "left" }
                        }}
                      />
                    ) : (
                      <Status status={order?.payments?.supplierPaymentStatus || "Not Payable"}
                        color={order?.payments?.supplierPaymentStatus === "Eligible for Payout" ? "secondary" : "primary"} />
                    )}
                  </Box>
                )
              }
            />
          </Grid>
          <Grid item xs={8}>
            <Section
              label="Items"
              containerProps={{ pt: 0 }}
              cardContent={order.items.map(item => {
                const supplierPrice = item.supplierPrice;
                const platformMargin =
                  item.platformMarginType === "Percentage"
                    ? formatCurrency(((item.supplierPrice * item.platformMargin) / 100) * item.quantity)
                    : formatCurrency(item.platformMargin * item.quantity);
                const erfaPrice = getErfaPrice(supplierPrice, item.platformMarginType, item.platformMargin);
                const discount =
                  item.discountType === "Percentage" ? item.discount + "%" : formatCurrency(item.discount);
                const discountedPrice = getDiscountedPrice(
                  supplierPrice,
                  item.platformMarginType,
                  item.platformMargin,
                  item.discountType,
                  item.discount
                );
                const discountedCouponPrice = getCouponDiscountedPrice(
                  discountedPrice * item.quantity, order?.coupons
                )

                return (
                  <Card key={item._id} style={{ marginRight: 4 }}>
                    <CardActionArea component={Link} to={`/products/${item.product._id}`}>
                      <Box style={{ display: "flex", alignItems: "center" }}>
                        <CardMedia
                          image={item.product?.images[0]?.image.thumbnail}
                          style={{ height: 120, width: 120 }}
                        />
                        <CardContent>
                          <Typography variant="body1" noWrap>
                            {item.product.name}
                          </Typography>
                          <Box display="flex">
                            <ContentCell label="Size" content={item.size} />
                            <Box px={2} />
                            <ContentCell label="Quantity" content={item.quantity} />
                          </Box>
                        </CardContent>
                      </Box>
                    </CardActionArea>
                    <CardContent style={{ alignItems: "flex-start", display: "block" }}>
                      <ContentCell label="Cost Breakup" inline={false}>
                        <Box pl={1} pt={1}>
                          <Table
                            hideHeader
                            containerProps={{ style: { width: 360 } }}
                            getKey={v => v.id}
                            columns={[
                              { field: "label", label: "Label" },
                              { field: "operator", label: "Op", props: { width: 12 } },
                              { field: "value", label: "Value" }
                            ]}
                            rows={[
                              ["Quantity", null, item.quantity],
                              ["Supplier Price", null, formatCurrency(item.supplierPrice)],
                              ["Supplier Total", null, formatCurrency(item.supplierPrice * item.quantity)],
                              ["Platform Margin", null, formatCurrency((discountedPrice * item.quantity) - (item.supplierPrice * item.quantity))],
                              ["Order Unit", null, formatCurrency(discountedPrice)],
                              ["Sub total", null, formatCurrency(discountedPrice * item.quantity)],
                              ["Coupon Discount", null, `- ${formatCurrency(discountedCouponPrice)}`, null],
                              ["Shipping Fee", null, formatCurrency(item.shippingFee)],
                              ["Reseller Margin", null, formatCurrency(item.resellerMargin)],
                              [
                                "Customer Price",
                                null,
                                formatCurrency((discountedPrice * item.quantity) + item.resellerMargin + item.shippingFee - discountedCouponPrice)
                              ]
                            ].map((o, idx, arr) => ({
                              id: o[0],
                              label: (
                                <Typography variant={idx === arr.length - 1 ? "body1" : "body2"} noWrap >
                                  {(o[0] === "Coupon Discount" && order?.coupons) ? <>{o[0]} ({order?.coupons?.couponCode})</> : o[0]}
                                </Typography>
                              ),
                              operator: (
                                <Typography variant={idx === arr.length - 1 ? "body1" : "body2"} noWrap>
                                  {o[1]}
                                </Typography>
                              ),
                              value: (
                                <Typography variant={idx === arr.length - 1 ? "body1" : "body2"} noWrap>
                                  {o[2]}
                                </Typography>
                              )
                            }))}
                            size="small"
                          />
                        </Box>
                      </ContentCell>
                    </CardContent>
                  </Card>
                );
              })}
            />
          </Grid>

          <Grid item xs={4}>
            <Section
              label="Order Actions"
              containerProps={{ pt: 0 }}
              cardContent={
                order.actions && order.actions.length ? (
                  order.actions.map(a => (
                    <Card key={a._id} style={{ marginBottom: 8 }}>
                      <CardContent>
                        <Typography variant="body1">
                          Status updated to `{a.status}` by {a.updatedBy} at{" "}
                          {format(new Date(a.updatedAt), "hh:mma MMM do, yyyy")}
                          {a.remark && ` with remark "${a.remark}"`}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Typography variant="body1">No actions yet.</Typography>
                )
              }
            />

            <Box pt={1} />

            <Section
              label="Order Notes"
              containerProps={{ pt: 0 }}
              cardContent={
                order.notes && order.notes.length ? (
                  order.notes.map(a => (
                    <Card key={a._id} style={{ marginBottom: 8, cursor: "pointer" }}
                      onClick={() => prompt("Update Note", `${a._id}`, {
                        formConfig: updateOrderNotesForm,
                        incomingValue: a,
                        submitHandler: val => _updateOrder({ noteId: a._id, ...val })
                      })}>
                      <CardContent>
                        <Box mb={1}>
                          <Typography variant="caption">
                            {a.updatedBy} @{format(new Date(a.updatedAt), "hh:mma MMM do, yyyy")}
                          </Typography>
                        </Box>
                        <Box style={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="body1">
                            <Icon path={Icons.quote} size={0.8} />
                            {a.message}
                          </Typography>
                          <Icon style={{ cursor: "pointer" }} path={Icons.edit} size={0.8} />
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Typography variant="body1">No order note yet.</Typography>
                )
              }
              rightComponent={
                <FormDialog
                  title="Add Note"
                  buttonProps={{ icon: Icons.add }}
                  formProps={{
                    formConfig: updateOrderNotesForm,
                    submitHandler: val => _updateOrder(val)
                  }}
                />
              }
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default Order;
