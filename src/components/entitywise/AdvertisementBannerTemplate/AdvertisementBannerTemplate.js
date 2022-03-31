import React, { useEffect, useState } from 'react'
import { Box, Card, CardActionArea, CardActions, CardContent, CardMedia, Chip, Grid, makeStyles, Typography } from '@material-ui/core'
import {Responsive, WidthProvider} from 'react-grid-layout';
import MaterialUIReactGridLayoutBuilder, {connectReactGridLayoutBuilder, withOpeningDock} from 'react-grid-layout-builder';
import cloneDeep from "lodash/cloneDeep";
import _ from 'lodash';
import AdBannerTemplateCard from './AdBannerTemplateCard';
import Icons from "../../../constants/icons";
import { addAdvertisementTemplate } from '../../../constants/forms';
import { FormDialog } from '../../Form';
import { Button, Icon, SectionHeader } from '../..';
import { useDispatch, useSelector } from "react-redux";
import { Layout } from './Layouts';
import { toast } from 'react-toastify';
import { toggleProcessIndicator } from "../../../store/reducers/app";
import { get } from "../../../services/api";

const ResponsiveReactGridLayout = connectReactGridLayoutBuilder(WidthProvider(Responsive));

const addAdvertisementForm = cloneDeep(addAdvertisementTemplate);

const useStyles = makeStyles(theme => ({
  gridWrapper : {
    margin: 'auto !important',
    position: 'relative',

    '&::before': {
      content: '"Screen Height"',
      position: 'absolute',
      right: -100,
      top: 10,
      height: 470,
      width: 50,
      border: "3px solid #999",
      borderLeft: 'none',
      display: 'flex',
      fontSize: 15,
      alignItems: 'center',
      textAlign: 'right',
      color: "#fff"
    },
    '&::after': {
      content: '"Screen Height"',
      position: 'absolute',
      left: -100,
      top: 10,
      height: 470,
      width: 50,
      border: "3px solid #999",
      borderRight: 'none',
      display: 'flex',
      fontSize: 15,
      alignItems: 'center',
      color: "#fff"
    }
  },
  layoutButtonWrapper: {
    marginTop: 15,
    textAlign: "right"
  }
}));

const AdvertisementBannerTemplate = ({ getBannerData, defaultBanner, permissions, showScreen, categories, subcategories}) => {
  const state = useSelector(state => state);
  const [collections, setCollections] = useState(null);
  const subSubcategories = state["sub-subcategories"];

  const [gridLayout, setGridLayout] = useState({...Layout})

  const [gridComponents, setGridComponents] = useState([...Layout.layouts.lg])
  const [errors, setErrors] = useState([])

  const [openFormDialog, setOpenFormDialog] = useState()
  const [selectedReactGrid, setSelectedReactGrid] = useState()
  const [selectedReactGridData, setSelectedReactGridData] = useState()

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
    if(defaultBanner && defaultBanner?.layouts) {
      setGridComponents(defaultBanner?.layouts?.lg)
      setGridLayout({...defaultBanner })
    }
    else {
      setGridLayout({...Layout })

    }
  }, [defaultBanner])

  useEffect(() => {
    if (!categories || !categories.length) return;
    const categoryOptions = categories.filter(s=>s.status === 'Active').map(c => ({ label: c.name, value: c._id }));
    addAdvertisementForm.category.options = categoryOptions;

    if (!subcategories || !subcategories.length) return;
    const subcategoryOptions = subcategories.filter(s=>s.status === 'Active').map(c => ({ label: c.name, value: c._id, category: c.category }));
    addAdvertisementForm.subcategory.options = (path, { getValueAtPath }) =>
      subcategoryOptions.filter(c => c.category === getValueAtPath(["category"]));

    if (!subSubcategories || !subSubcategories.length) return;
    const subSubcategoryOptions = subSubcategories.filter(s=>s.status === 'Active').map(c => ({
      label: c.name,
      value: c._id,
      subcategory: c.subcategory
    }));
    addAdvertisementForm.subSubcategory.options = (path, { getValueAtPath }) =>
      subSubcategoryOptions.filter(c => c.subcategory === getValueAtPath(["subcategory"]));

    if (!collections || !collections.length) return;
    const collectionOptions = collections.map(c => ({
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
  }, [categories, subcategories, subSubcategories, collections]);

  const updateConfig = (newGridLayout) => {
    // setGridLayout({...newGridLayout});
  }

  const updateConfigLayout = (newGridLayout) => {
    setGridLayout({...gridLayout, layouts: {lg: newGridLayout} })

  }

  const _addComponent = () => {
    const tempLayout = gridLayout?.layouts?.lg || []
    const newLayout = {
      "x": 0,
      "y": gridLayout.layouts.lg[gridLayout.layouts.lg.length - 1].y,
      "w": 12,
      "h": 4,
      "i": `${gridLayout.layouts.lg.length}`,
      "static": false,
      "minH": 1,
      "maxH": 8
    }
    tempLayout.push(newLayout)
    setGridLayout({...gridLayout, layouts: {lg: tempLayout,} })
    setGridComponents([...gridComponents,{...newLayout}])
  }

  const _removeComponent = (index) => {
    const tempLayout = gridLayout.layouts.lg
    const tempLayoutComp = gridComponents
    tempLayout.splice(index, 1)
    tempLayoutComp.splice(index, 1)
    tempLayout.forEach((e, i) => {
      e.i = `${i}`
    })
    tempLayoutComp.forEach((e, i) => {
      e.i = `${i}`
    })
    setGridLayout({...gridLayout, layouts: {lg: tempLayout} })
    setGridComponents(tempLayoutComp)
  }

  const _addAdvertisement = (index, data) => {
    setOpenFormDialog(false)
    const tempLayout = gridComponents
    tempLayout[index] = {...tempLayout[index], data  }

    setGridComponents(tempLayout)
    setGridLayout({...gridLayout})
  }

  const _saveTemplate = () => {
    let errorTemp = []
    const finalLayout = gridComponents.map((ly, i) => {
      if(!ly.data) errorTemp[i] = true
      else errorTemp[i] = false
      return ({
      ...ly,
      coords: {
        w: gridLayout.layouts.lg[i].w,
        h: gridLayout.layouts.lg[i].h,
        i: gridLayout.layouts.lg[i].i,
        x: gridLayout.layouts.lg[i].x,
        y: gridLayout.layouts.lg[i].y
      }
      })
    })
    setErrors(errorTemp)
    if(errorTemp.filter(e => !!e).length) {
      toast.error('Add all the images!')
      return
    }
    getBannerData(finalLayout)

  }

  const _openFormDialogBox = (i) => {
    setSelectedReactGrid(i)
    let gridData = gridComponents[i]?.data
    gridData = {
      ...gridData,
      category: gridData?.category ? gridData?.category._id : '',
      subcategory: gridData?.subcategory ? gridData?.subcategory._id : '',
      subSubcategory: gridData?.subSubcategory ? gridData?.subSubcategory._id : '',
      _collection: gridData?._collection ? gridData?._collection._id : '',
      product: gridData?.product ? gridData?.product._id : '',
    }
    setSelectedReactGridData(gridData)
    setOpenFormDialog(true)
  }
  return (
    <>
      <SectionHeader
        icon={Icons.ads}
        label='Advertisement'
        alignItems={'flex-start'}
        rightComponent={
          <>
            <div>
              <Grid>
                <Button style={{marginLeft: 10}}
                variant="outlined"
                onClick={showScreen}>
                  Cancel
                </Button>
                <Button style={{marginLeft: 10}}
                // size="small"
                onClick={_saveTemplate}>
                  Save
                </Button>
              </Grid>
              <Grid className={classes.layoutButtonWrapper}>
                <Button
                startIcon={<Icon path={Icons.add} />}
                variant="outlined" size="small"
                onClick={_addComponent}
              >{'Add Layout'}</Button>
              </Grid>
            </div>

          </>
        }
      />

      <Grid item xs={12} style={{backgroundColor: '#777777', padding: "30px 0", minHeight: 550}} >
        <Grid item xs={12} style={{margin: 15}}>
          <Typography>The size is adjusted according to screen size - 414x680 (W x H)</Typography>
        </Grid>
        <Grid item xs={3} className={`${classes.gridWrapper}`} style={{border: "3px dashed #999"}}>
          <div >
            <ResponsiveReactGridLayout className="layout"
              {...gridLayout}
              updateConfigFunc={updateConfig}
              onLayoutChange={updateConfigLayout}
              >

              {_.map(gridLayout.layouts.lg, (l, i) => {
                return (
                  <AdBannerTemplateCard key={i} l={l} i={i}
                  advertisement={gridComponents[i]?.data}

                  actions={
                    permissions.UPDATE && (
                      <>
                        <Button onClick={() => {
                          _openFormDialogBox(i)
                        }} icon={Icons.edit} />
                        <Button onClick={() => {
                          _removeComponent(i);
                        }} icon={Icons.delete} />
                      </>
                    )
                  }
                  />
                );
              })}
            </ResponsiveReactGridLayout>
          </div>
        </Grid>
      </Grid>
      <FormDialog
        title="Add Image"
        buttonProps={{ icon: <></>}}
        formProps={{
          formConfig: addAdvertisementForm,
          submitHandler: val => _addAdvertisement(selectedReactGrid, val),
          uiProps: { ctaAreaBoxProps: { pt: 2 }, submitButtonText: 'Add' },
          incomingValue: selectedReactGridData || {}
        }}
        dialogOpen={{
          open: openFormDialog,
          setOpen: setOpenFormDialog,
          handleClose: () => {setOpenFormDialog(false)}
        }}
      />
  </>
  )
}
export default AdvertisementBannerTemplate
