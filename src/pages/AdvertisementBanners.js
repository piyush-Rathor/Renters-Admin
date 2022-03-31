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
import { Icon } from '../components'
import addAdvertisement from "../constants/forms/add-advertisement";
import { createAdvertisementBanner, deleteAdvertisement, deleteAdvertisementBanner, get, updateAdvertisement, updateAdvertisementBanner } from "../services/api";
import usePageData from "../services/PageData";

import { FormDialog } from "../components/Form";
import { Button, Loader, SectionHeader, StatCard } from "../components";
import { AdvertisementBannerCard } from "../components/entitywise/AdvertisementBannerTemplate/AdvertisementBannerCard";
import { toggleProcessIndicator } from "../store/reducers/app";
import { GridContextProvider, GridDropZone, GridItem, swap } from "react-grid-dnd";
import { setObject } from "../store/reducers/objectReducers";
import { addAdvertisementDisplayLocation } from "../constants/forms/add-advertisement-template";
import AdvertisementBannerTemplate from "../components/entitywise/AdvertisementBannerTemplate/AdvertisementBannerTemplate";
import { Layout } from "../components/entitywise/AdvertisementBannerTemplate/Layouts";

const addAdvertisementForm = cloneDeep(addAdvertisement);
const updateAdvertisementForm = cloneDeep(addAdvertisement);
const advertisementDisplayForm = cloneDeep(addAdvertisementDisplayLocation);
const useStyles = makeStyles(theme => ({
  p8: { padding: theme.spacing(1) }
}));

function AdvertisementBanners() {
  const state = useSelector(state => state);
  const [collections, setCollections] = useState(null);
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const subSubcategories = state["sub-subcategories"];
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteAdvertisementId, setDeleteAdvertisementId] = useState(null);
  const [showAdvertisementTemplate, setShowAdvertisementTemplate] = useState(false);
  const [advertisementBannerForm, setAdvertisementBannerForm] = useState(false);
  const [bannerData, setBannerData] = useState({});

  const dispatch = useDispatch();
  const classes = useStyles();
  useEffect(() => {
    dispatch(toggleProcessIndicator(true));
    Promise.all([get.allCollections({ params: { status:"Active" } })])
      .then(resp => {
        setCollections(resp[0]);
      })
      .catch(console.log)
      .finally(() => dispatch(toggleProcessIndicator(false)));
  }, [dispatch]);

  useEffect(() => {
    dispatch(toggleProcessIndicator(true));
    async function getCategoriesData() {
      try {
        const [categories, subcategories] = await Promise.all([get.categories(), get.subcategories()])
        setCategories(categories);
        setSubcategories(subcategories);
        dispatch(toggleProcessIndicator(false));
      } catch(e) {
        dispatch(toggleProcessIndicator(false));
      }
    }
    getCategoriesData()
  }, [])

  useEffect(() => {
    if (!categories || !categories.length) return;
    const categoryOptions = categories.filter(s=>s.status === 'Active').map(c => ({ label: c.name, value: c._id }));
    advertisementDisplayForm.category.options = categoryOptions;

    if (!subcategories || !subcategories.length) return;
    const subcategoryOptions = subcategories.filter(s=>s.status === 'Active').map(c => ({ label: c.name, value: c._id, category: c.category }));
      advertisementDisplayForm.subcategory.options = (path, { getValueAtPath }) =>
      subcategoryOptions.filter(c => c.category === getValueAtPath(["category"]));

    if (!subSubcategories || !subSubcategories.length) return;
    const subSubcategoryOptions = subSubcategories.filter(s=>s.status === 'Active').map(c => ({
      label: c.name,
      value: c._id,
      subcategory: c.subcategory
    }));

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
    //advertisementDisplayForm._collection.options = collectionOptionsFilter;
  }, [categories, subcategories, subSubcategories, collections]);

  const advertisements = []

  let { advertisementBanners, totalItems, containerRef, refresh, permissions  } = usePageData(
    "advertisementBanners"
  );

  const saveBannerData = (data) => {
    if(!advertisementBannerForm?.displayLocation || !advertisementBannerForm?.status) {
      toast.error("Please fill all the details!");
      return
    }
    const tempData = {
      displayLocation: advertisementBannerForm?.displayLocation,
      status: advertisementBannerForm?.status,
      category: advertisementBannerForm.category,
      bannerData: data
    }
    if(bannerData && bannerData?._id) {
      _updateAdvertisement(bannerData._id, tempData)
    }
    else
    _createAdvertisement(tempData)
  }

  const closeAdTemplate = () => {
    setShowAdvertisementTemplate();
    setAdvertisementBannerForm();
    setBannerData();

  }

  const _createAdvertisement = async data => {
    await createAdvertisementBanner(data).then(resp => refresh());
    closeAdTemplate()
    toast.success("Advertisement added successfully.");
  };

  const _updateAdvertisement = async (_id, data, noToast = false) => {
    await updateAdvertisementBanner(_id, data).then(resp => refresh());
    closeAdTemplate()
    !noToast && toast.success("Advertisement updated successfully.");
  };

  const _deleteAdvertisement = async (_id) => {
    if (!_id)
      return;
    await deleteAdvertisementBanner(_id).then(resp => refresh());
    toast.success("Advertisement deleted successfully.");
  };

  const _createAdvertisementLayout = values => {
    setBannerData();
    setShowAdvertisementTemplate(true)
    setAdvertisementBannerForm(values)
  }

  const _openEditBannerScreen = (ad, values) => {
    if(!values?.displayLocation || !values?.status) {
      toast.error("Please fill all the details!");
      return
    }
    const data = {
      ...Layout,
      layouts: {
        ...ad.bannerData.coords,
        lg: ad.bannerData.map(e => ({
          ...e.coords,
          data: e.data
        }))
      }
    }
    setAdvertisementBannerForm(values)
    setBannerData({_id: ad._id, data})
    setShowAdvertisementTemplate(true)
  }

  const handleClickOpen = () => {
    setConfirmDelete(true);
  };

  const handleClose = () => {
    setConfirmDelete(false);
  };

  function onChange(sourceId, sourceIndex, targetIndex, targetId) {
    // try {
    //   if (sourceIndex === targetIndex) return;
    //   _updateAdvertisement(advertisementBanners[targetIndex - 1]._id, { order: sourceIndex }, true);
    //   _updateAdvertisement(advertisementBanners[sourceIndex - 1]._id, { order: targetIndex }, true);
    //   const nextState = swap(advertisementBanners, sourceIndex - 1, targetIndex - 1);
    //   dispatch(setObject("advertisementBanners", nextState));
    // } catch (e) {
    //   toast.error(e.message);
    // }
  }

  if(showAdvertisementTemplate)

  return (
    <Box ref={containerRef}>
    {!advertisementBanners ? (
      <Loader absolute />
    ) : (
      <>
        <AdvertisementBannerTemplate categories={categories} subcategories={subcategories} getBannerData={(data) => saveBannerData(data)} permissions={permissions} defaultBanner={bannerData?.data} showScreen={closeAdTemplate} />
      </>
    )}
    </Box>
  )
  return (
    <Box ref={containerRef}>
      {!advertisementBanners ? (
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
              label="Advertisements Banner"
              rightComponent={
                permissions.CREATE && (
                  <FormDialog
                    title="Add Banner"
                    formProps={{
                      formConfig: advertisementDisplayForm,
                      uiProps: { ctaAreaBoxProps: { pt: 2 }, submitButtonText: 'Next' },
                      submitHandler: _createAdvertisementLayout
                    }}
                  />
                )
              }
            />
            <Box mb={2} />

            {advertisementBanners.length ? (
              <GridContextProvider onChange={onChange}>
                <GridDropZone
                  boxesPerRow={4}
                  rowHeight={300}
                  style={{ height: Math.ceil(advertisements.length / 4) * 300 }}>
                  {advertisementBanners.map(s => (
                    <GridItem key={s._id} className={classes.p8}>
                      <AdvertisementBannerCard
                        advertisement={{
                          ...s,
                          category: s.category && categories && categories.filter(c => c._id === s.category)[0],
                          subcategory: s.subcategory && subcategories && subcategories.filter(c => c._id === s.subcategory)[0]
                        }}
                        actions={
                          permissions.UPDATE && (
                            <>
                              <FormDialog
                                title="Update Advertisement"
                                buttonProps={{ icon: Icons.edit }}

                                formProps={{
                                  formConfig: advertisementDisplayForm,
                                  submitHandler: val => _openEditBannerScreen(s, val),
                                  incomingValue: s,
                                  uiProps: { ctaAreaBoxProps: { pt: 2 }, submitButtonText: 'Next' },
                                  selfDisabled: true
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

export default AdvertisementBanners;
