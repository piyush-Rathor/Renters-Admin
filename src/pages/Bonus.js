import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import { Box, Card, CardActionArea, CardContent, CardMedia, Grid, Typography } from "@material-ui/core";

import { get } from "../services/api";
import { ContentCell, Loader, Section, Status } from "../components";
import { toggleProcessIndicator } from "../store/reducers/app";
import { formatCurrency, getCouponDiscountedPrice, getDiscountedPrice, getErfaPrice, getPhoneString } from "../utils";
import { Table } from "../components/Table";


function Order() {
  const params = useParams();

  const [refreshCount, setRefreshCount] = useState(0);
  const refresh = () => setRefreshCount(refreshCount + 1);
  const [bonus, setBonus] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(toggleProcessIndicator(true));
    get["bonus"](params.bonusId)
      .then(res => res.data)
      .then(async b => {
        b.type = "Joining Bonus"
        if (b[0].payment?.orderSystemId) {
          await get["order"](b[0].payment?.orderSystemId)
            .then(async o => {
              const [items] = await Promise.all([
                await Promise.all(
                  o.items.map(async ({ ...i }) => {
                    i.product = await get["product"](i.product);
                    return i;
                  })
                )
              ]);
              b.items = items
              b.order = o
              b.type = "Referral Bonus"
            })
            .catch(console.log)
            .finally(() => dispatch(toggleProcessIndicator(false)));
        }
        let reseller = await get["reseller"](b[0].referredResellerId)
        b.reseller = reseller;
        setBonus(b);
      })
      .catch(console.log)
      .finally(() => dispatch(toggleProcessIndicator(false)));
  }, [dispatch, params.bonusId, refreshCount]);

  if (!bonus) return <Loader absolute />;

  return (
    <>
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Box display="flex" flexDirection="column">
          <ContentCell label="Bonus ID" content={bonus[0].humanFriendlyId || bonus[0]._id} />
        </Box>
        <ContentCell label="Bonus Type" content={bonus.type} />
      </Box>

      <Box mt={2.5} display="flex">
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Section
              label="Reseller Details"
              containerProps={{ pt: 0 }}
              cardContent={
                bonus.reseller?.firstName && (
                  <Box pl={1} mt={-1}>
                    <Box display="flex">
                      <Typography
                        variant="body1">{`${bonus.reseller?.firstName} ${bonus.reseller?.lastName} (${bonus.reseller?.humanFriendlyId || bonus.reseller?._id})`}</Typography>
                      <Box ml={1}>
                        <Status status={bonus?.payment?.resellerPaymentStatus || "Not Payable"}
                          color={bonus?.payment?.resellerPaymentStatus === "Eligible for Payout" ? "secondary" : "primary"} />
                      </Box>
                    </Box>
                    <ContentCell label="Phone" content={getPhoneString(bonus.reseller?.phone)} />
                    <ContentCell label="Email" content={bonus.reseller?.email} />
                  </Box>
                )
              }
            />
          </Grid>
          {
            bonus[0].payment?.orderSystemId !== undefined ?
              <>
                <Grid item xs={6}>
                  <Section
                    label="Order Details"
                    containerProps={{ pt: 0 }}
                    cardContent={
                      bonus.reseller?.firstName && (
                        <Box pl={1} mt={-1}>
                          <ContentCell label="Order ID" content={bonus?.order?.humanFriendlyId || bonus?.order?._id} />
                          {bonus?.order?.createdAt && (
                            <ContentCell label="Order Time" content={format(new Date(bonus?.order?.createdAt), "dd/MM/yyyy hh:mma")} />
                          )}
                          <Status status={bonus?.order?.status} />
                        </Box>
                      )
                    }
                  />
                </Grid>
                <Grid item xs={8}>
                  <Section
                    label="Items"
                    containerProps={{ pt: 0 }}
                    cardContent={bonus?.items?.map(item => {
                      const supplierPrice = item.supplierPrice;
                      const platformMargin = item.platformMarginType === "Percentage"
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
                        discountedPrice * item.quantity, bonus?.order?.coupons
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
                                      <Typography variant={idx === arr.length - 1 ? "body1" : "body2"} noWrap>
                                        {o[0]}
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
              </>
              : null
          }
        </Grid>
      </Box>
    </>
  );
}

export default Order;
