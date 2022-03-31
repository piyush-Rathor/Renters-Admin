import React, { useCallback, useEffect, useState } from "react";
import * as Yup from "yup";
import cloneDeep from "lodash/cloneDeep";
import debounce from "lodash/debounce";
import { toast } from "react-toastify";
import { Box, Grid, InputAdornment, makeStyles, MenuItem, TextField, Typography } from "@material-ui/core";

import Icons from "../constants/icons";
import addCollection from "../constants/forms/add-collection";
import { createCollection, get, updateCollection } from "../services/api";
import usePageData from "../services/PageData";

import { FormDialog } from "../components/Form";
import { Button, Icon, Loader, SectionHeader, StatCard, ToggleButtons } from "../components";
import { CollectionInfo } from "../components/entitywise/Collection";
import { useDispatch, useSelector } from "react-redux";
import { toggleProcessIndicator } from "../store/reducers/app";

const addCollectionForm = cloneDeep(addCollection);
const updateCollectionForm = cloneDeep(addCollection);
updateCollectionForm.goLiveTime.validator = Yup.number().required("Required");

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

function Collections() {
  const classes = useStyles();
  const state = useSelector(state => state);
  const [products, setProducts] = useState(null);
  const [suppliers, setSuppliers] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const subSubcategories = state["sub-subcategories"];
  const dispatch = useDispatch();

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
    dispatch(toggleProcessIndicator(true));
    Promise.all([get.allProducts({ params: { status: "Active" } }), get.allSuppliers({ params: { status: "Active" } })])
      .then(resp => {
        setProducts(resp[0]);
        setSuppliers(resp[1]);
      })
      .catch(console.log)
      .finally(() => dispatch(toggleProcessIndicator(false)));
  }, [dispatch]);

  useEffect(() => {
    if (categories && categories.length) {
      const categoryOptions = categories.map(c => ({ label: c.name, value: c._id }));
      // const categoryOptions = categories.filter(c=>c.status==='Active').map(c => ({ label: c.name, value: c._id }));
      addCollectionForm.category.options = categoryOptions;
      updateCollectionForm.category.options = categoryOptions;
    }

    if (subcategories && subcategories.length) {
      // const subcategoryOptions = subcategories.filter(c=>c.status==='Active').map(c => ({
      const subcategoryOptions = subcategories.map(c => ({
        label: c.name,
        value: c._id,
        category: c.category
      }));
      const subcategoryOptionsFilter = (path, { getValueAtPath }) =>
        subcategoryOptions.filter(c => c.category === getValueAtPath(["category"]));
      addCollectionForm.subcategory.options = subcategoryOptionsFilter;
      updateCollectionForm.subcategory.options = subcategoryOptionsFilter;
    }

    if (subSubcategories && subSubcategories.length) {
      // const subSubcategoryOptions = subSubcategories.filter(c=>c.status==='Active').map(c => ({
      const subSubcategoryOptions = subSubcategories.map(c => ({
        label: c.name,
        value: c._id,
        subcategory: c.subcategory
      }));
      const subSubcategoryOptionsFilter = (path, { getValueAtPath }) =>
        subSubcategoryOptions.filter(c => c.subcategory === getValueAtPath(["subcategory"]));
      addCollectionForm.subSubcategory.options = subSubcategoryOptionsFilter;
      updateCollectionForm.subSubcategory.options = subSubcategoryOptionsFilter;
    }

    if (products && products.length) {
      // const productOptions = products.filter(c=>c.status==='Active').map(p => ({
      const productOptions = products.map(p => ({
        label: `${p.name} ${p.SKU} ${p.productCode ? ", " + p.productCode : ""}`,
        value: p._id,
        category: p.category,
        subcategory: p.subcategory,
        subSubcategory: p.subSubcategory
      }));
      const productOptionsFilter = (path, { getValueAtPath }) => {
        const category = getValueAtPath(["category"]);
        const subcategory = getValueAtPath(["subcategory"]);
        const subSubcategory = getValueAtPath(["subSubcategory"]);
        if (!category || !subcategory) return [];
        const options = productOptions.filter(
          p => {
            let valid = p.category === category;
            if (subcategory)
              valid = p.category === category && p.subcategory === subcategory;
            if (subSubcategory)
              valid = p.category === category && p.subcategory === subcategory && p.subSubcategory === subSubcategory;
            return valid;
          }
        );
        return options;
      };
      addCollectionForm.products.options = productOptionsFilter;
      updateCollectionForm.products.options = productOptionsFilter;
    }
  }, [categories, subcategories, subSubcategories, products, suppliers]);

  const pageData = usePageData("collections", { filters: { status: "Active", sortBy: 'goLiveTime' } });
  const { collections, totalItems, containerRef, Pagination, refresh } = pageData;
  const { filters, filter, permissions } = pageData;

  const [collectionQuery, setCollectionQuery] = useState("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchCollection = useCallback(
    debounce(q => {
      if (q !== collectionQuery) {
        filter(f => ({ ...f, query: q }))
      }
    }, 1250),
    [filter]
  );

  const [collectionTagQuery, setCollectionTagQuery] = useState("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchCollectionTag = useCallback(
    debounce(q => {
      if (q !== collectionTagQuery) {
        filter(f => ({ ...f, collectionTag: q }))
      }
    }, 1250),
    [filter]
  );

  const resetFilters = () => {
    setCollectionQuery("");
    filter({ status: "Active" });
    setStartDateValue("")
    setEndDateValue("")
    setDateRange({ goLiveStartDate:null, goLiveEndDate: null })
  };

  const _createCollection = async values => {
    await createCollection(values).then(resp => refresh());
    toast.success("Collection added successfully.");
  };

  const _updateCollection = async (_id, values) => {
    await updateCollection(_id, values).then(resp => refresh());
    toast.success("Collection updated successfully.");
  };

  const [dateRate, setDateRange] = useState({ goLiveStartDate: null, goLiveEndDate: null });
  const [startDateValue, setStartDateValue] = useState(null)
  const [endDateValue, setEndDateValue] = useState(null)

  const handleFilterDate = (e) => {
    const { id, value } = e.target
    if (id === 'endDate') {
      if (new Date(startDateValue) > new Date(value)) {
        toast.error("End Date cannot be greater than start date");
        return;
      }
      let ed = new Date(value);
      ed.setHours(23, 0, 0, 0);
      setEndDateValue(value)
      setDateRange({ ...dateRate, goLiveEndDate: new Date(ed.getTime()).getTime() });
    }
    if (id === 'startDate') {
      if(endDateValue !== null){
        if (new Date(value) > new Date(endDateValue)) {
          toast.error("End Date cannot be greater than start date");
          return;
        }
      }
      setStartDateValue(value)
      setDateRange({ ...dateRate, goLiveStartDate: new Date(value).getTime() });
    }
  }

  useEffect(() => {
    if (dateRate.goLiveStartDate && dateRate.goLiveEndDate) {
      filter(filters => ({ ...filters, ...dateRate }))
    }
  }, [dateRate])

  return (
    <Box ref={containerRef}>
      {!collections ? (
        <Loader absolute />
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid item xs={3}>
              <StatCard label="# of Collections" count={totalItems} />
            </Grid>
          </Grid>

          <Box mt={5}>
            <SectionHeader
              icon={Icons.collections}
              label="Collections"
              rightComponent={
                permissions.CREATE && (
                  <FormDialog
                    title="Add Collection"
                    formProps={{
                      formConfig: addCollectionForm,
                      submitHandler: _createCollection
                    }}
                  />
                )
              }
            />

            <Box display="flex" alignItems="flex-end" my={2} className={classes.root}>
              <Box mr={4} mb={-0.5}>
                <TextField
                  label="Search"
                  placeholder="code, name"
                  variant="outlined"
                  value={collectionQuery}
                  onChange={e => {
                    setCollectionQuery(e.target.value);
                    searchCollection(e.target.value);
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
              <Box mr={2} mb={-0.5}>
                <TextField
                  variant="outlined"
                  placeholder={`Collection tag`}
                  value={collectionTagQuery}
                  onChange={e => {
                    setCollectionTagQuery(e.target.value);
                    searchCollectionTag(e.target.value);
                  }}
                  size="small"
                />
              </Box>
              <Box mr={2} mb={1}>
                <Icon color="primary" path={Icons.filter} />
              </Box>
              <Box mr={1} mb={1}>
                <ToggleButtons
                  options={[
                    { label: "All", value: null },
                    { label: "Active", value: "Active" },
                    { label: "Hidden", value: "Hidden" },
                    { label: "Pending Approval", value: "Pending Approval" }
                  ]}
                  value={filters.status}
                  onChange={v => filter(f => ({ ...f, status: v }))}
                />
              </Box>
              <TextField
                size="small"
                label="Category"
                value={filters.category || ""}
                onChange={e => {
                  if (e.target.value) {
                    filter(filters => ({ ...filters, category: e.target.value }))
                  }
                }}
                select>
                {(filters.status ? categories.filter(e => e.status === filters.status) : categories).length > 0 ? (filters.status ? categories.filter(e => e.status === filters.status) : categories).map(option => (
                  <MenuItem key={option._id} value={option._id}>
                    {option.name}
                  </MenuItem>
                )) :
                <MenuItem>
                  No Category found
                </MenuItem>
                }
              </TextField>
              <TextField
                size="small"
                label="Subcategory"
                value={filters.subcategory || ""}
                onChange={e => filter(filters => ({ ...filters, subcategory: e.target.value }))}
                disabled={
                  !filters.category || !subcategories.filter(i => ((i.category === filters.category) && (!filters.status || i.status === filters.status))).length
                }
                select>
                {subcategories
                  .filter(i => ((i.category === filters.category) && (!filters.status || i.status === filters.status)))
                  .map(option => (
                    <MenuItem key={option._id} value={option._id}>
                      {option.name}
                    </MenuItem>
                  ))}
              </TextField>
            </Box>
            <Box display="flex" alignItems="flex-end" my={2} className={classes.root}>
              <TextField
                size="small"
                label="Sub-Subcategory"
                value={filters.subSubcategory || ""}
                onChange={e => filter(filters => ({ ...filters, subSubcategory: e.target.value }))}
                disabled={
                  !filters.subcategory ||
                  !subSubcategories.filter(i => ((i.subcategory === filters.subcategory) && (!filters.status || i.status === filters.status))).length
                }
                select>
                {subSubcategories
                  .filter(i => ((i.subcategory === filters.subcategory) && (!filters.status || i.status === filters.status)))
                  .map(option => (
                    <MenuItem key={option._id} value={option._id}>
                      {option.name}
                    </MenuItem>
                  ))}
              </TextField>
              <TextField
                id="startDate"
                label="Select Start Date"
                type="date"
                onChange={handleFilterDate}
                value={startDateValue}
                InputLabelProps={{
                  shrink: true
                }}
              />
              <TextField
                id="endDate"
                label="Select End Date"
                type="date"
                onChange={handleFilterDate}
                value={endDateValue}
                InputLabelProps={{
                  shrink: true
                }}
              />
              <Box flexGrow={1} />
              {!!Object.values(filters).filter(Boolean).length && (
                <Box>
                  <Button variant="text" size="small" onClick={resetFilters} text="Reset" />
                </Box>
              )}
            </Box>

            {collections.length ? (
              collections.map(s => (
                <Box key={s._id} mb={1.5}>
                  <CollectionInfo
                    collection={{
                      ...s,
                      category: categories && categories.filter(c => c._id === s.category)[0],
                      subcategory: subcategories && subcategories.filter(c => c._id === s.subcategory)[0],
                      subSubcategory:
                        subSubcategories && subSubcategories.filter(c => c._id === s.subSubcategory)[0]
                    }}
                    actions={
                      permissions.UPDATE && (
                        <FormDialog
                          title="Update Collection"
                          buttonProps={{ icon: Icons.edit }}
                          formProps={{
                            formConfig: updateCollectionForm,
                            submitHandler: val => _updateCollection(s._id, val),
                            incomingValue: s
                          }}
                        />
                      )
                    }
                  />
                </Box>
              ))
            ) : (
              <Box mt={4}>
                <Typography variant="body2">No collections in system.</Typography>
              </Box>
            )}
          </Box>

          <Pagination />
        </>
      )}
    </Box>
  );
}

export default Collections;
