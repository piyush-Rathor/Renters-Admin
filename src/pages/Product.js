import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import cloneDeep from "lodash/cloneDeep";
import { toast } from "react-toastify";
import { Box, Card, CardMedia, Typography } from "@material-ui/core";

import Icons from "../constants/icons";
import { getProductStatusToBeUpdated, PRODUCT_STATUS_CHANGE_BUTTON_TEXTS } from "../constants";
import { getPermissions, PERMISSION_CODES } from "../constants/permissions";
import addProduct from "../constants/forms/add-product";
import { createOrder, get, updateProduct } from "../services/api";

import { FormDialog } from "../components/Form";
import { Button, ContentCell, Loader } from "../components";
import { useDispatch, useSelector } from "react-redux";
import { toggleProcessIndicator } from "../store/reducers/app";
import { formatCurrency, getDiscountedPrice, getErfaPrice } from "../utils";
import addOrder from "../constants/forms/add-order";

const updateProductForm = cloneDeep(addProduct);
const addOrderForm = cloneDeep(addOrder);

function Product() {
  const params = useParams();

  const state = useSelector(state => state);
  const PERMISSIONS = state.auth?.user?.permissions;
  const { categories, subcategories } = state;
  const subSubcategories = state["sub-subcategories"];
  const dispatch = useDispatch();

  const [suppliers, setSuppliers] = useState(null);
  const [p, setProduct] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const refresh = () => setRefreshCount(refreshCount + 1);
  useEffect(() => {
    dispatch(toggleProcessIndicator(true));
    Promise.all([get.allSuppliers({ params: {status:"Active"} }), get.product(params.productId)])
      .then(resp => {
        setSuppliers(resp[0]);
        setProduct(resp[1]);
      })
      .catch(console.log)
      .finally(() => dispatch(toggleProcessIndicator(false)));
  }, [dispatch, params.productId, refreshCount]);

  useEffect(() => {
    if (categories && categories.length) {
      // const categoryOptions = categories.filter(c=>c.status==='Active').map(c => ({ label: c.name, value: c._id }));
      const categoryOptions = categories.map(c => ({ label: c.name, value: c._id }));
      updateProductForm.category.options = categoryOptions;
    }

    if (subcategories && subcategories.length) {
      // const subcategoryOptions = subcategories.filter(c=>c.status==='Active').map(sc => ({
      const subcategoryOptions = subcategories.map(sc => ({
        label: sc.name,
        value: sc._id,
        category: sc.category
      }));
      updateProductForm.subcategory.options = (path, { getValueAtPath }) =>
        subcategoryOptions.filter(c => c.category === getValueAtPath(["category"]));
    }

    if (subSubcategories && subSubcategories.length) {
      // const subSubcategoryOptions = subSubcategories.filter(c=>c.status==='Active').map(ssc => ({
      const subSubcategoryOptions = subSubcategories.map(ssc => ({
        label: ssc.name,
        value: ssc._id,
        subcategory: ssc.subcategory
      }));
      updateProductForm.subSubcategory.options = (path, { getValueAtPath }) =>
        subSubcategoryOptions.filter(c => c.subcategory === getValueAtPath(["subcategory"]));
    }

    if (suppliers && suppliers.length) {
      const supplierOptions = suppliers.filter(c=>c.status==='Active').map(s => ({ label: s.name, value: s._id }));
      updateProductForm.supplier.options = supplierOptions;
    }
  }, [categories, subcategories, subSubcategories, suppliers]);

  const _updateProduct = async (_id, { erfaPrice, discountedPrice, ...values }) => {
    values['discountedPrice'] = discountedPrice;
    await updateProduct(_id, values).then(resp => refresh());
    toast.success("Product updated successfully.");
  };

  const allowUpdate = getPermissions(PERMISSIONS, "product").includes(PERMISSION_CODES.product[2]);

  if (!p) return <Loader absolute />;

  const supplier = suppliers && suppliers.filter(_s => _s._id === p.supplier)[0];
  const category = categories && categories.filter(_s => _s._id === p.category)[0];
  const subcategory = subcategories && subcategories.filter(_s => _s._id === p.subcategory)[0];
  const subSubcategory = subSubcategories && subSubcategories.filter(_s => _s._id === p.subSubcategory)[0];

  const parseProduct = (product) => {
    const { supplierPrice, platformMarginType, platformMargin, discountType, discount } = product;
    return {
      ...product,
      erfaPrice: getErfaPrice(supplierPrice, platformMarginType, platformMargin),
      discountedPrice: getDiscountedPrice(supplierPrice, platformMarginType, platformMargin, discountType, discount)
    };
  };

  const parseLocalStorage = (p) => {
    p = cloneDeep(parseProduct(p));
    const localstorageData = cloneDeep(JSON.parse(localStorage.getItem("add-order-admin")));
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
    return { ...p, ...localstorageData }
  };

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
        reseller
      } = val;
      let items = [];
      items.push({
        product: p._id,
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
      let orderData = { customer, shippingAddress, items,reseller };
      await createOrder(orderData);
      toast.success("Order created successfully");
      localStorage.removeItem("add-order-admin");
      refresh()
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <>
      {p.name && <ContentCell label="Name" content={p.name} />}
      {p.SKU && <ContentCell label="SKU" content={p.SKU} />}
      {supplier && <ContentCell label="Supplier" content={supplier?.name} />}
      {category && <ContentCell label="Category" content={category?.name} />}
      {subcategory && <ContentCell label="Subcategory" content={subcategory?.name} />}
      {subSubcategory && <ContentCell label="Sub-Subcategory" content={subSubcategory?.name} />}
      {p.description && (
        <ContentCell label="Description" inline={false}>
          <Typography variant="body1" style={{ whiteSpace: "break-spaces", paddingLeft: 4 }}>
            {p.description}
          </Typography>
        </ContentCell>
      )}
      {p.images && (
        <ContentCell label="Images" inline={false}>
          <Box pl={1} display="flex">
            {p.images.map((i, idx) => (
              <Card key={"image" + idx} style={{ marginRight: 4 }}>
                <CardMedia image={i.image?.thumbnail} style={{ height: 120, width: 120 }} />
              </Card>
            ))}
          </Box>
        </ContentCell>
      )}
      {p.features && (
        <ContentCell label="Features" inline={false}>
          <Box pl={1}>
            {p.features.map(f => (
              <ContentCell key={f.label} label={f.label} content={f.details} />
            ))}
          </Box>
        </ContentCell>
      )}

      <ContentCell label="Cost Breakup" inline={false}>
        <Box display="flex" alignItems="center" textAlign="center" pt={0.5} pl={2}>
          <ContentCell label="Supplier Price" inline={false} containerProps={{ style: { marginRight: 36 } }}>
            <Typography variant="body2">{formatCurrency(p.supplierPrice)}</Typography>
          </ContentCell>

          <ContentCell label="+" inline={false} containerProps={{ style: { marginRight: 36 } }} />

          <ContentCell label="Platform Margin" inline={false} containerProps={{ style: { marginRight: 36 } }}>
            <Typography variant="body2">
              {p.platformMarginType === "Percentage"
                ? p.platformMargin + "%"
                : formatCurrency(p.platformMargin)}
            </Typography>
          </ContentCell>

          <ContentCell label="=" inline={false} containerProps={{ style: { marginRight: 36 } }} />

          <ContentCell label="ERFA Price" inline={false} containerProps={{ style: { marginRight: 36 } }}>
            <Typography variant="body2">
              {formatCurrency(
                p.supplierPrice +
                (p.platformMarginType === "Percentage"
                  ? (p.supplierPrice * p.platformMargin) / 100
                  : p.platformMargin)
              )}
            </Typography>
          </ContentCell>

          <ContentCell label="-" inline={false} containerProps={{ style: { marginRight: 36 } }} />

          <ContentCell label="Discount" inline={false} containerProps={{ style: { marginRight: 36 } }}>
            <Typography variant="body2">
              {p.discountType === "Percentage" ? p.discount + "%" : formatCurrency(p.discount)}
            </Typography>
          </ContentCell>

          <ContentCell label="=" inline={false} containerProps={{ style: { marginRight: 36 } }} />

          <ContentCell
            label="Discounted Price"
            inline={false}
            containerProps={{ style: { marginRight: 36 } }}>
            <Typography variant="body2">
              {formatCurrency(
                p.supplierPrice +
                (p.platformMarginType === "Percentage"
                  ? (p.supplierPrice * p.platformMargin) / 100
                  : p.platformMargin) - (p.discountType === "Percentage" ? ((p.supplierPrice +
                (p.platformMarginType === "Percentage"
                  ? (p.supplierPrice * p.platformMargin) / 100
                  : p.platformMargin)) * p.discount) / 100 : p.discount)
              )}
            </Typography>
          </ContentCell>
        </Box>
      </ContentCell>

      {!!p.sizes?.length && (
        <ContentCell label="Sizes & Stock" inline={false}>
          <Box pl={1}>
            {p.sizes.map(f => (
              <ContentCell key={f.size} label={f.size} content={f.stock.toString()} />
            ))}
          </Box>
        </ContentCell>
      )}
      {p.stock && !p.sizes?.length && <ContentCell label="Stock" content={p.stock + " Units"} />}
      {p.deliveryAvailability && (
        <ContentCell label="Delivery Availability" content={p.deliveryAvailability.join(", ")} />
      )}

      <Box display="flex" alignItems="center" justifyContent="flex-end">
        <>
          {
            PERMISSIONS["order"].includes("CREATE") && (
              <FormDialog
                title="Add Order"
                formProps={{
                  formConfig: addOrderForm,
                  submitHandler: _createOrder,
                  incomingValue: parseLocalStorage(p)
                }}
              />
            )
          }
          {allowUpdate && [
            <Box flexGrow={0.01} />,
            <Button
              key={"change-status-button" + p._id}
              variant="outlined"
              size="small"
              onClick={() =>
                _updateProduct(p._id, {
                  status: getProductStatusToBeUpdated(p.status)
                })
              }
              color={{ Hide: "warning" }[PRODUCT_STATUS_CHANGE_BUTTON_TEXTS[p.status]]}
              style={{ marginRight: 8 }}
              text={PRODUCT_STATUS_CHANGE_BUTTON_TEXTS[p.status]}
            />,
            <FormDialog
              key={"update-button" + p._id}
              title="Update Product"
              buttonProps={{ icon: Icons.edit }}
              formProps={{
                formConfig: updateProductForm,
                submitHandler: val => _updateProduct(p._id, val),
                incomingValue: parseProduct(p)
              }}
            />
          ]}
        </>
      </Box>
    </>
  );
}

export default Product;
