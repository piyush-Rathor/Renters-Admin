import React, { useEffect, useState } from "react";
import cloneDeep from "lodash/cloneDeep";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  makeStyles,
  Typography
} from "@material-ui/core";

import Icons from "../constants/icons";
import addAdvertisement from "../constants/forms/add-advertisement";
import { createAdvertisement, deleteAdvertisement, get, updateAdvertisement } from "../services/api";
import usePageData from "../services/PageData";

import { FormDialog } from "../components/Form";
import { Button, Loader, SectionHeader, StatCard } from "../components";
import { AdvertisementCard } from "../components/entitywise/Advertisement";
import { toggleProcessIndicator } from "../store/reducers/app";
import { GridContextProvider, GridDropZone, GridItem, swap } from "react-grid-dnd";
import { setObject } from "../store/reducers/objectReducers";

const addAdvertisementForm = cloneDeep(addAdvertisement);
const updateAdvertisementForm = cloneDeep(addAdvertisement);
const useStyles = makeStyles(theme => ({
  p8: { padding: theme.spacing(1) }
}));

function Advertisements() {
  const state = useSelector(state => state);
  const [collections, setCollections] = useState(null);
  const [categories,setCategories] = useState(state.categories)
  const [subcategories,setSubcategories] = useState(state.subcategory)
  const subSubcategories = state["sub-subcategories"];
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteAdvertisementId, setDeleteAdvertisementId] = useState(null);
  const dispatch = useDispatch();
  const classes = useStyles();
  useEffect(() => {
    dispatch(toggleProcessIndicator(true));
    Promise.all([get.allCollections({ params: { status:"Active" } }),get.allCategories({ params: { status:"Active" } }),get.allSubcategories({ params: { status:"Active" } })])
      .then(resp => {
        setCollections(resp[0]);
        setCategories(resp[1]);
        setSubcategories(resp[2]);
      })
      .catch(console.log)
      .finally(() => dispatch(toggleProcessIndicator(false)));
  }, [dispatch]);

  useEffect(() => {
    if (!categories || !categories.length) return;
    const categoryOptions = categories.filter(s=>s.status === 'Active').map(c => ({ label: c.name, value: c._id }));
    addAdvertisementForm.category.options = categoryOptions;
    updateAdvertisementForm.category.options = categoryOptions;

    if (!subcategories || !subcategories.length) return;
    const subcategoryOptions = subcategories.filter(s=>s.status === 'Active').map(c => ({ label: c.name, value: c._id, category: c.category }));
    addAdvertisementForm.subcategory.options = (path, { getValueAtPath }) =>
      subcategoryOptions.filter(c => c.category === getValueAtPath(["category"]));
    updateAdvertisementForm.subcategory.options = (path, { getValueAtPath }) =>
      subcategoryOptions.filter(c => c.category === getValueAtPath(["category"]));

    if (!subSubcategories || !subSubcategories.length) return;
    const subSubcategoryOptions = subSubcategories.filter(s=>s.status === 'Active').map(c => ({
      label: c.name,
      value: c._id,
      subcategory: c.subcategory
    }));
    addAdvertisementForm.subSubcategory.options = (path, { getValueAtPath }) =>
      subSubcategoryOptions.filter(c => c.subcategory === getValueAtPath(["subcategory"]));
    updateAdvertisementForm.subSubcategory.options = (path, { getValueAtPath }) =>
      subSubcategoryOptions.filter(c => c.subcategory === getValueAtPath(["subcategory"]));

    if (!collections || !collections.length) return;
    const collectionOptions = collections.filter(s=>s.status === 'Active').map(c => ({
      label: c.name,
      value: c._id,
      category: c.category,
      subcategory: c.subcategory,
      subSubcategory: c.subSubcategory
    }));
    const collectionOptionsFilter = (path, { getValueAtPath }) =>
      collectionOptions.filter(c => {
        const subSubcategory = getValueAtPath(["subSubcategory"]);
        if (subSubcategory) return c.subSubcategory === subSubcategory;
        const subcategory = getValueAtPath(["subcategory"]);
        if (subcategory) return c.subcategory === subcategory;
        const category = getValueAtPath(["category"]);
        if (category) return c.category === category;
        return false;
      });
    addAdvertisementForm._collection.options = collectionOptionsFilter;
    updateAdvertisementForm._collection.options = collectionOptionsFilter;
  }, [categories, subcategories, subSubcategories, collections]);

  const { advertisements, totalItems, containerRef, refresh, permissions } = usePageData(
    "advertisements"
  );

  const _createAdvertisement = async values => {
    await createAdvertisement(values).then(resp => refresh());
    toast.success("Advertisement added successfully.");
  };

  const _updateAdvertisement = async (_id, values) => {
    await updateAdvertisement(_id, values).then(resp => refresh());
    toast.success("Advertisement updated successfully.");
  };

  const _deleteAdvertisement = async (_id) => {
    if (!_id)
      return;
    await deleteAdvertisement(_id).then(resp => refresh());
    toast.success("Advertisement deleted successfully.");
  };

  const handleClickOpen = () => {
    setConfirmDelete(true);
  };

  const handleClose = () => {
    setConfirmDelete(false);
  };

  function onChange(sourceId, sourceIndex, targetIndex, targetId) {
    try {
      if (sourceIndex === targetIndex) return;
      _updateAdvertisement(advertisements[targetIndex]._id, { order: sourceIndex });
      _updateAdvertisement(advertisements[sourceIndex]._id, { order: targetIndex });
      const nextState = swap(advertisements, sourceIndex, targetIndex);
      dispatch(setObject("advertisements", nextState));
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <Box ref={containerRef}>
      {!advertisements ? (
        <Loader absolute />
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid item xs={3}>
              <StatCard label="# of Advertisements" count={totalItems} />
            </Grid>
          </Grid>

          <Box mt={5}>
            <SectionHeader
              icon={Icons.ads}
              label="Advertisements"
              rightComponent={
                permissions.CREATE && (
                  <FormDialog
                    title="Add Advertisement"
                    formProps={{
                      formConfig: addAdvertisementForm,
                      submitHandler: _createAdvertisement
                    }}
                  />
                )
              }
            />
            <Box mb={2} />

            {advertisements.length ? (
              <GridContextProvider onChange={onChange}>
                <GridDropZone
                  boxesPerRow={4}
                  rowHeight={300}
                  style={{ height: Math.ceil(advertisements.length / 4) * 300 }}>
                  {advertisements.map(s => (
                    <GridItem key={s._id} className={classes.p8}>
                      <AdvertisementCard
                        advertisement={{
                          ...s,
                          category: categories && categories.filter(c => c._id === s.category)[0],
                          subcategory: subcategories && subcategories.filter(c => c._id === s.subcategory)[0],
                          subSubcategory:
                            subSubcategories && subSubcategories.filter(c => c._id === s.subSubcategory)[0]
                        }}
                        actions={
                          permissions.UPDATE && (
                            <>
                              <FormDialog
                                title="Update Advertisement"
                                buttonProps={{ icon: Icons.edit }}
                                formProps={{
                                  formConfig: updateAdvertisementForm,
                                  submitHandler: val => _updateAdvertisement(s._id, val),
                                  incomingValue: {
                                    ...s,
                                    category: s?.category ? s?.category._id : '',
                                    subcategory: s?.subcategory ? s?.subcategory._id : '',
                                    subSubcategory: s?.subSubcategory ? s?.subSubcategory._id : '',
                                    _collection: s?._collection ? s?._collection._id : '',
                                    product: s?.product ? s?.product._id : '',
                                  }
                                }}
                              />
                              <Button onClick={() => {
                                setDeleteAdvertisementId(s._id);
                                handleClickOpen();
                              }} icon={Icons.delete} />
                            </>
                          )
                        }
                      />
                    </GridItem>
                  ))}
                </GridDropZone>
              </GridContextProvider>
            ) : (
              <Box mt={4}>
                <Typography variant="body2">No advertisements in system.</Typography>
              </Box>
            )}
            {
              confirmDelete && <Dialog
                open={confirmDelete}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">{"Delete advertisement"}</DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    Are you sure you want to delete this advertisement?
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
        </>
      )}
    </Box>
  );
}

export default Advertisements;
