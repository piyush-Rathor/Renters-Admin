import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import { Link, useParams } from "react-router-dom";
import cloneDeep from "lodash/cloneDeep";
import last from "lodash/last";
import omit from "lodash/omit";
import { toast } from "react-toastify";
import { Box, Card, CardActionArea, CardContent, CardMedia, Typography } from "@material-ui/core";

import Icons from "../constants/icons";
import { COLLECTION_STATUS_CHANGE_BUTTON_TEXTS, getCollectionStatusToBeUpdated } from "../constants";
import { getPermissions, PERMISSION_CODES } from "../constants/permissions";
import addCollection from "../constants/forms/add-collection";
import addProduct from "../constants/forms/add-product";
import { createProduct, get, updateCollection } from "../services/api";

import { FormDialog } from "../components/Form";
import { Button, ContentCell, Icon, Loader, Status } from "../components";
import { toggleProcessIndicator } from "../store/reducers/app";
import { prompt } from "../components/Prompt";

const updateCollectionForm = cloneDeep(addCollection);
const addProductForm = cloneDeep(addProduct);

function Collections() {
  const params = useParams();

  const state = useSelector(state => state);
  const PERMISSIONS = state.auth?.user?.permissions;
  const { categories, subcategories } = state;
  const subSubcategories = state["sub-subcategories"];
  const dispatch = useDispatch();

  const [products, setProducts] = useState(null);
  const [suppliers, setSuppliers] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const refresh = () => setRefreshCount(refreshCount + 1);
  const [collection, setCollection] = useState(null);
  useEffect(() => {
    dispatch(toggleProcessIndicator(true));
    Promise.all([
      get.allProducts({ params: {status:"Active"} }),
      get.allSuppliers({ params: {status:"Active"} }),

      get["collection"](params.collectionId).then(async resp => {
        if (resp.products && resp.products.length) {
          resp.products = (await get["products"]({ params: { _id: resp.products, limit: 0 } })).data;
          ["category", "subcategory", "subSubcategory"].forEach(i => {
            addProductForm[i].defaultValue = resp[i] || "";
            addProductForm[i].disabled = !!resp[i];
          });
        }

        return resp;
      })
    ])
      .then(resp => {
        setProducts(resp[0]);
        setSuppliers(resp[1]);
        setCollection(resp[2]);
      })
      .catch(console.log)
      .finally(() => dispatch(toggleProcessIndicator(false)));
  }, [dispatch, params.collectionId, refreshCount]);

  useEffect(() => {
    if (categories && categories.length) {
      // const categoryOptions = categories.filter(c=>c.status==='Active').map(c => ({ label: c.name, value: c._id }));
      const categoryOptions = categories.map(c => ({ label: c.name, value: c._id }));
      updateCollectionForm.category.options = categoryOptions;
      addProductForm.category.options = categoryOptions;
    }

    if (subcategories && subcategories.length) {
      // const subcategoryOptions = subcategories.filter(c=>c.status==='Active').map(c => ({
      const subcategoryOptions = subcategories.map(c => ({
        label: c.name,
        value: c._id,
        category: c.category
      }));
      updateCollectionForm.subcategory.options = (path, { getValueAtPath }) =>
        subcategoryOptions.filter(c => c.category === getValueAtPath(["category"]));
      addProductForm.subcategory.options = (path, { getValueAtPath }) =>
        subcategoryOptions.filter(c => c.category === getValueAtPath(["category"]));
    }

    if (subSubcategories && subSubcategories.length) {
      // const subSubcategoryOptions = subSubcategories.filter(c=>c.status==='Active').map(c => ({
      const subSubcategoryOptions = subSubcategories.map(c => ({
        label: c.name,
        value: c._id,
        subcategory: c.subcategory
      }));
      updateCollectionForm.subSubcategory.options = (path, { getValueAtPath }) =>
        subSubcategoryOptions.filter(c => c.subcategory === getValueAtPath(["subcategory"]));
      addProductForm.subSubcategory.options = (path, { getValueAtPath }) =>
        subSubcategoryOptions.filter(c => c.subcategory === getValueAtPath(["subcategory"]));
    }

    if (products && products.length) {
      const productOptions = products.filter(c=>c.status==='Active').map(p => ({
        label: `${p.name} ${p.SKU},${p?.productCode}`,
        value: p._id,
        category: p.category,
        subcategory: p.subcategory,
        subSubcategory: p.subSubcategory
      }));
      const getProductOptions = (path, { getValueAtPath }) => {
        const category = getValueAtPath(["category"]);
        const subcategory = getValueAtPath(["subcategory"]);
        const subSubcategory = getValueAtPath(["subSubcategory"]);
        if (!category || !subcategory) return [];
        const options = productOptions.filter(
          p => p.category === category || p.subcategory === subcategory || p.subSubcategory === subSubcategory
        );
        return options;
      };
      updateCollectionForm.products.options = getProductOptions;
    }

    if (suppliers && suppliers.length) {
      const supplierOptions = suppliers.map(s => ({ label: s.name, value: s._id }));
      addProductForm.supplier.options = supplierOptions;
    }
  }, [categories, subcategories, subSubcategories, products, suppliers]);

  const _updateCollection = async (_id, values) => {
    await updateCollection(_id, values).then(resp => refresh());
    toast.success("Collection updated successfully.");
  };

  const createAndAddProduct = async values => {
    return await createProduct(values).then(async resp => {
      await _updateCollection(collection._id, {
        products: [...collection.products.map(p => p._id), resp._id]
      });
      refresh();
      toast.success("Product added successfully.");
    });
  };

  const removeProduct = _id => {
    prompt(null, "Are you sure you want to remove this product from collection?", async proceed => {
      if (proceed) {
        await _updateCollection(collection._id, {
          products: collection.products.map(p => p._id).filter(p => p !== _id)
        });
        refresh();
        toast.success("Product removed successfully.");
      }
    });
  };

  const allowUpdate = getPermissions(PERMISSIONS, "collection").includes(PERMISSION_CODES.collection[2]);

  if (!collection) return <Loader />;

  const category = categories && categories.filter(c => c._id === collection.category)[0];
  const subcategory = subcategories && subcategories.filter(c => c._id === collection.subcategory)[0];
  const subSubcategory =
    subSubcategories && subSubcategories.filter(c => c._id === collection.subSubcategory)[0];

  return (
    <Box>
      <Box display="flex">
        <CardMedia image={collection.cover.thumbnail} style={{ width: 280, height: 280 }} />
        <Box display="flex" flexDirection="column" pl={2} pt={2} style={{ width: "calc(100% - 280px)" }}>
          <Box display="flex" justifyContent="space-between">
            <Status status={collection.status || "Active"} />
            <Box display="flex" flexDirection="column" alignItems="flex-end">
            {collection.createdAt && (
              <ContentCell
                label="Creation Date"
                content={format(new Date(collection.createdAt), "dd/MM/yyyy hh:mma")}
              />
            )}
            {collection.goLiveTime && (
              <ContentCell
                label="Go Live Time"
                content={format(new Date(collection.goLiveTime), "dd/MM/yyyy hh:mma")}
              />
            )}
            </Box>
          </Box>
          {collection._id && <ContentCell label="Collection code" content={collection.collectionCode} />}
          <Typography variant="body1">
            {[category?.name, subcategory?.name, subSubcategory?.name].filter(Boolean).join(" > ")}
          </Typography>
          {collection.description && (
            <ContentCell label="Description" inline={false}>
              <Box pl={1}>
                <Typography variant="body1" style={{ whiteSpace: "break-spaces" }}>
                  {collection.description}
                </Typography>
              </Box>
            </ContentCell>
          )}
          {collection.tags && (
            <ContentCell label="Tags" inline={false}>
              <Box pl={1}>{collection.tags.join(", ")}</Box>
            </ContentCell>
          )}
          <Box flexGrow={1} />
          <Box display="flex" alignItems="center" justifyContent="flex-end">
            {allowUpdate && [
              <Button
                key={"change-status-button" + collection._id}
                variant="outlined"
                size="small"
                onClick={() =>
                  _updateCollection(collection._id, {
                    status: getCollectionStatusToBeUpdated(collection.status)
                  })
                }
                color={{ Hide: "warning" }[COLLECTION_STATUS_CHANGE_BUTTON_TEXTS[collection.status]]}
                style={{ marginRight: 8 }}
                text={COLLECTION_STATUS_CHANGE_BUTTON_TEXTS[collection.status]}
              />,
              <FormDialog
                key={"update-button" + collection._id}
                title="Update Collection"
                buttonProps={{ icon: Icons.edit }}
                formProps={{
                  formConfig: updateCollectionForm,
                  submitHandler: val => _updateCollection(collection._id, val),
                  incomingValue: { ...collection, products: collection.products.map(p => p._id) }
                }}
              />
            ]}
          </Box>
        </Box>
      </Box>
      <Box mt={2}>
        {collection.products && (
          <ContentCell label="Products" inline={false}>
            <Box pl={1} mt={2} display="flex">
              {collection.products.map(p => (
                <Card key={p._id} style={{ marginRight: 12, width: 140, position: "relative" }}>
                  <CardActionArea component={Link} to={`/products/${p._id}`}>
                    <CardMedia image={p.images[0]?.image.thumbnail} style={{ height: 140, width: 140 }} />
                    <CardContent style={{ padding: 4 }}>
                      <Typography variant="body2" noWrap title={p.name}>
                        {p.name}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                  <Button
                    variant="contained"
                    color="error"
                    icon={Icons.minus}
                    onClick={() => removeProduct(p._id)}
                    containerProps={{ style: { position: "absolute", top: -10, right: -10 } }}
                    style={{ background: "white" }}
                  />
                </Card>
              ))}
              <FormDialog
                title="Add Product"
                key={last(collection.products)?._id}
                formProps={{
                  formConfig: addProductForm,
                  submitHandler: createAndAddProduct,
                  incomingValue: omit(last(collection.products), ["SKU", "name", "images"])
                }}
                activator={openDialog => (
                  <Card style={{ marginRight: 12, width: 140 }}>
                    <CardActionArea onClick={openDialog}>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        style={{ height: 140, width: 140 }}>
                        <Icon path={Icons.add} size={2} />
                      </Box>
                      <CardContent style={{ padding: 4 }}>
                        <Typography variant="body2" align="center" noWrap>
                          Add Product
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                )}
              />
            </Box>
          </ContentCell>
        )}
      </Box>
    </Box>
  );
}

export default Collections;
