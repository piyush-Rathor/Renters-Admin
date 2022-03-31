import React, { useCallback, useEffect, useState } from "react";
import { batch, useDispatch, useSelector } from "react-redux";
import { GridContextProvider, GridDropZone, GridItem, swap } from "react-grid-dnd";
import cloneDeep from "lodash/cloneDeep";
import { toast } from "react-toastify";
import { Box, Chip, InputAdornment, makeStyles, TextField, Typography } from "@material-ui/core";

import Icons from "../constants/icons";
import { CATEGORY_STATUS_CHANGE_BUTTON_TEXTS, getCategoryStatusToBeUpdated } from "../constants";
import { getPermissions, PERMISSION_CODES } from "../constants/permissions";
import addCategory from "../constants/forms/add-category";
import { toggleProcessIndicator } from "../store/reducers/app";
import { setArray, setItem, updateItem } from "../store/reducers/arrayReducers";
import { createCategory, get, updateCategory } from "../services/api";

import { FormDialog } from "../components/Form";
import { Button, Icon, Loader, SectionHeader, ToggleButtons } from "../components";
import { CategoryCard } from "../components/entitywise/Category";
import debounce from "lodash/debounce";

const addCategoryForm = cloneDeep(addCategory);
const updateCategoryForm = cloneDeep(addCategory);

const useStyles = makeStyles(theme => ({
  p8: { padding: theme.spacing(1) }
}));

function Categories() {
  const classes = useStyles();

  const state = useSelector(state => state);
  const PERMISSIONS = state.auth?.user?.permissions;
  const categories = state.categories;
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
    Promise.all([get.categories(filters)]).then(resp => {
      batch(() => {
        dispatch(setArray("categories", resp[0]));
      });
    });
  }, [filters]);
  const resetFilters = () => {
    setCategoriesQuery("");
    setStartDateValue("")
    setEndDateValue("")
    setDateRange({ startDate:null, endDate: null })
  setFilters({ status: "Active" });
  };
  useEffect(() => {
    dispatch(toggleProcessIndicator(true));
    Promise.all([get.categories(filters)]).then(resp => {
      batch(() => {
        dispatch(setArray("categories", resp[0]));
        dispatch(toggleProcessIndicator(false));
      });
    });
  }, [dispatch]);

  const _createCategory = async values => {
    await createCategory(values).then(resp => dispatch(setItem("categories", resp)));
    toast.success("Category added successfully.");
    setFilters({ ...filters, status: "Pending Approval" });
  };

  const _updateCategory = async (_id, values) => {
    await updateCategory(_id, values).then(resp => dispatch(updateItem("categories", resp)));
    toast.success("Category updated successfully.");
  };

  function onChange(sourceId, sourceIndex, targetIndex, targetId) {
    if (sourceIndex === targetIndex) return;
    _updateCategory(categories[targetIndex]._id, { order: sourceIndex });
    _updateCategory(categories[sourceIndex]._id, { order: targetIndex });

    const nextState = swap(categories, sourceIndex, targetIndex);
    dispatch(setArray("categories", nextState));
  }

  const allowAdd = getPermissions(PERMISSIONS, "category").includes(PERMISSION_CODES.category[1]);
  const allowUpdate = getPermissions(PERMISSIONS, "category").includes(PERMISSION_CODES.category[2]);

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

  if (!categories) return <Loader absolute />;
  return (
    <Box>
      <SectionHeader
        icon={Icons.categories}
        label="Categories"
        leftComponent={<Chip label={categories.length} />}
        rightComponent={
          allowAdd && (
            <FormDialog
              title="Add Category"
              formProps={{
                formConfig: addCategoryForm,
                submitHandler: _createCategory
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
            onChange={v => setFilters({ ...filters, status: v })}
          />
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
          defaultValue={endDateValue}
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

      {categories.length ? (
        <GridContextProvider onChange={onChange}>
          <GridDropZone
            boxesPerRow={4}
            rowHeight={390}
            style={{ height: Math.ceil(categories.length / 4) * 390 }}>
            {categories.filter(s => filters.status ? s.status === filters.status : true).map(s => (
              <GridItem key={s._id} className={classes.p8}>
                <CategoryCard
                  category={s}
                  actions={
                    allowUpdate && [
                      <Button
                        key={"change-status-button" + s._id}
                        variant="outlined"
                        size="small"
                        onClick={() =>
                          _updateCategory(s._id, { status: getCategoryStatusToBeUpdated(s.status) })
                        }
                        color={{ Hide: "warning" }[CATEGORY_STATUS_CHANGE_BUTTON_TEXTS[s.status]]}
                        style={{ marginRight: 8 }}
                        text={CATEGORY_STATUS_CHANGE_BUTTON_TEXTS[s.status]}
                      />,
                      <FormDialog
                        key={"update-button" + s._id}
                        title="Update Category"
                        buttonProps={{ icon: Icons.edit }}
                        formProps={{
                          formConfig: updateCategoryForm,
                          submitHandler: val => _updateCategory(s._id, val),
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
          <Typography variant="body2">No categories in system.</Typography>
        </Box>
      )}
    </Box>
  );
}

export default Categories;
