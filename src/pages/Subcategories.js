import React, { useCallback, useEffect, useState } from "react";
import { batch, useDispatch, useSelector } from "react-redux";
import { GridContextProvider, GridDropZone, GridItem, swap } from "react-grid-dnd";
import cloneDeep from "lodash/cloneDeep";
import { toast } from "react-toastify";
import { Box, Chip, InputAdornment, makeStyles, MenuItem, TextField, Typography } from "@material-ui/core";

import Icons from "../constants/icons";
import { CATEGORY_STATUS_CHANGE_BUTTON_TEXTS, getCategoryStatusToBeUpdated } from "../constants";
import { getPermissions, PERMISSION_CODES } from "../constants/permissions";
import addSubcategory from "../constants/forms/add-subcategory";
import { toggleProcessIndicator } from "../store/reducers/app";
import { setArray, setItem, updateItem } from "../store/reducers/arrayReducers";
import { createSubcategory, get, updateSubcategory } from "../services/api";

import { FormDialog } from "../components/Form";
import { Button, Icon, Loader, SectionHeader, ToggleButtons } from "../components";
import { SubcategoryCard } from "../components/entitywise/Subcategory";
import debounce from "lodash/debounce";

const addSubcategoryForm = cloneDeep(addSubcategory);
const updateSubcategoryForm = cloneDeep(addSubcategory);

const useStyles = makeStyles(theme => ({
  p8: { padding: theme.spacing(1) },
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

function Subcategories() {
  const classes = useStyles();

  const state = useSelector(state => state);
  const PERMISSIONS = state.auth?.user?.permissions;
  const { categories, subcategories } = state;
  const dispatch = useDispatch();

  const [filters, setFilters] = useState({ status: "Active" });
  const [categoriesQuery, setCategoriesQuery] = useState("");
  const [dateRate, setDateRange] = useState({ startDate: null, endDate: null });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchCategory = useCallback(
    debounce(q => setFilters({ ...filters, query: q }), 1250),
    [filters]
  );

  useEffect(() => {
    Promise.all([get.subcategories(filters)]).then(resp => {
      batch(() => {
        dispatch(setArray("subcategories", resp[0]));
      });
    });
  }, [filters]);
  const resetFilters = () => {
    setCategoriesQuery("");
    setFilters({ status: "Active" });
    setStartDateValue("")
    setEndDateValue("")
    setDateRange({ startDate:null, endDate: null })
  };

  useEffect(() => {
    dispatch(toggleProcessIndicator(true));
    Promise.all([get.categories(), get.subcategories(filters)]).then(resp => {
      batch(() => {
        dispatch(setArray("categories", resp[0]));
        dispatch(setArray("subcategories", resp[1]));
        dispatch(toggleProcessIndicator(false));
      });
    });
  }, [dispatch]);

  useEffect(() => {
    if (!categories || !categories.length) return;
    addSubcategoryForm.category.options = categories.filter(c => c.status === "Active").map(c => ({
      label: c.name,
      value: c._id
    }));
    updateSubcategoryForm.category.options = categories.filter(c => c.status === "Active").map(c => ({
      label: c.name,
      value: c._id
    }));
  }, [categories]);

  const _createSubcategory = async values => {
    await createSubcategory(values).then(resp => dispatch(setItem("subcategories", resp)));
    toast.success("Subcategory added successfully.");
    setFilters({...filters,status: 'Pending Approval'})
  };

  const _updateSubcategory = async (_id, values) => {
    await updateSubcategory(_id, values).then(resp => dispatch(updateItem("subcategories", resp)));
    toast.success("Subcategory updated successfully.");
  };

  function onChange(sourceId, sourceIndex, targetIndex, targetId) {
    if (sourceIndex === targetIndex) return;
    _updateSubcategory(subcategories[targetIndex]._id, { order: sourceIndex });
    _updateSubcategory(subcategories[sourceIndex]._id, { order: targetIndex });

    const nextState = swap(subcategories, sourceIndex, targetIndex);
    dispatch(setArray("subcategories", nextState));
  }

  const allowAdd = getPermissions(PERMISSIONS, "subcategory").includes(PERMISSION_CODES.subcategory[1]);
  const allowUpdate = getPermissions(PERMISSIONS, "subcategory").includes(PERMISSION_CODES.subcategory[2]);

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
      setDateRange({ ...dateRate, endDate: new Date(ed.getTime()).toISOString() });
    }
    if (id === 'startDate') {
      if(endDateValue !== null){
        if (new Date(value) > new Date(endDateValue)) {
          toast.error("End Date cannot be greater than start date");
          return;
        }
      }
      setStartDateValue(value)
      setDateRange({ ...dateRate, startDate: new Date(value).toISOString() });
    }
  }

  useEffect(() => {
    if (dateRate.startDate && dateRate.endDate) {
      setFilters(filters => ({ ...filters, ...dateRate }))
    }
  }, [dateRate])

  if (!subcategories) return <Loader absolute />;
  return (
    <Box>
      <SectionHeader
        icon={Icons.subcategories}
        label="Subcategories"
        leftComponent={<Chip label={subcategories.length} />}
        rightComponent={
          allowAdd && (
            <FormDialog
              title="Add Subcategory"
              formProps={{
                formConfig: addSubcategoryForm,
                submitHandler: _createSubcategory
              }}
            />
          )
        }
      />
      <Box display="flex" alignItems="flex-end" my={2} className={classes.root}>
        <Box mr={4} mb={-0.5}>
          <TextField
            label="Search"
            placeholder="name"
            variant="outlined"
            value={categoriesQuery}
            onChange={e => {
              if (e.target.value === "")
                resetFilters();
              setCategoriesQuery(e.target.value);
              searchCategory(e.target.value);
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
        <Box mr={2} mb={1}>
          <ToggleButtons
            options={[
              { label: "All", value: null },
              { label: "Active", value: "Active" },
              { label: "Hidden", value: "Hidden" },
              { label: "Pending Approval", value: "Pending Approval" }
            ]}
            value={filters.status}
            onChange={v => setFilters({ ...filters, status: v })}
          />
        </Box>
        <Box mr={4} mb={-0.5}>
          <TextField
            size="small"
            label="Category"
            value={filters.category || ""}
            onChange={e => setFilters({ ...filters, category: e.target.value })}
            select>
            {(filters.status ? categories.filter(e => e.status === filters.status) : categories).map(option => (
              <MenuItem key={option._id} value={option._id}>
                {option.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
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
      <Box mb={2} />

      {subcategories.length ? (
        <GridContextProvider onChange={onChange}>
          <GridDropZone
            boxesPerRow={4}
            rowHeight={416}
            style={{ height: Math.ceil(subcategories.length / 4) * 416 }}>
            {subcategories.filter(s => filters.status ? s.status === filters.status : true).map(s => (
              <GridItem key={s._id} className={classes.p8}>
                <SubcategoryCard
                  category={categories.filter(c => c._id === s.category)[0]}
                  subcategory={s}
                  actions={
                    allowUpdate && [
                      <Button
                        key={"change-status-button" + s._id}
                        variant="outlined"
                        size="small"
                        onClick={() =>
                          _updateSubcategory(s._id, { status: getCategoryStatusToBeUpdated(s.status) })
                        }
                        color={{ Hide: "warning" }[CATEGORY_STATUS_CHANGE_BUTTON_TEXTS[s.status]]}
                        style={{ marginRight: 8 }}
                        text={CATEGORY_STATUS_CHANGE_BUTTON_TEXTS[s.status]}
                      />,
                      <FormDialog
                        key={"update-button" + s._id}
                        title="Update Subcategory"
                        buttonProps={{ icon: Icons.edit }}
                        formProps={{
                          formConfig: updateSubcategoryForm,
                          submitHandler: val => _updateSubcategory(s._id, val),
                          incomingValue: s
                        }}
                      />
                    ]
                  }
                />
              </GridItem>
            ))}
          </GridDropZone>
        </GridContextProvider>
      ) : (
        <Box mt={4}>
          <Typography variant="body2">No subcategories in system.</Typography>
        </Box>
      )}
    </Box>
  );
}

export default Subcategories;
