import React, { useCallback, useEffect, useState } from 'react'
import { batch, useDispatch, useSelector } from 'react-redux'
import cloneDeep from 'lodash/cloneDeep'
import { toast } from 'react-toastify'
import { Box, Chip, Grid, InputAdornment, makeStyles, MenuItem, TextField, Typography } from '@material-ui/core'

import Icons from '../constants/icons'
import { CATEGORY_STATUS_CHANGE_BUTTON_TEXTS, getCategoryStatusToBeUpdated } from '../constants'
import { getPermissions, PERMISSION_CODES } from '../constants/permissions'
import addSubSubcategory from '../constants/forms/add--sub-subcategory'
import { toggleProcessIndicator } from '../store/reducers/app'
import { setArray, setItem, updateItem } from '../store/reducers/arrayReducers'
import { createSubSubcategory, get, updateSubSubcategory } from '../services/api'

import { FormDialog } from '../components/Form'
import { Button, Icon, Loader, SectionHeader, ToggleButtons } from '../components'
import { SubSubcategoryCard } from '../components/entitywise/SubSubcategory'
import debounce from 'lodash/debounce'

const addSubSubcategoryForm = cloneDeep(addSubSubcategory)
const updateSubSubcategoryForm = cloneDeep(addSubSubcategory)

const useStyles = makeStyles(theme => ({
  p8: { padding: theme.spacing(1) },
  root: {
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: '22ch',
    },
    '& .MuiTextField-root:first-child': {
      marginLeft: theme.spacing(0),
    },
  },
}))

function SubSubcategories() {
  const state = useSelector(state => state)
  const PERMISSIONS = state.auth?.user?.permissions
  const { categories, subcategories } = state
  const subSubcategories = state['sub-subcategories']
  const dispatch = useDispatch()
  const classes = useStyles()
  const [filters, setFilters] = useState({ status: 'Active' })
  const [categoriesQuery, setCategoriesQuery] = useState('')
  const [dateRate, setDateRange] = useState({ startDate: null, endDate: null });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchCategory = useCallback(
    debounce(q => setFilters({ ...filters, query:q }), 1250),
    [filters],
  )

  useEffect(()=>{
    Promise.all([get.subSubcategories(filters)]).then(resp => {
      batch(() => {
        dispatch(setArray('sub-subcategories', resp[0]))
      })
    })
  },[filters])
  const resetFilters = () => {
    setCategoriesQuery('')
    setFilters({ status: 'Active' })
    setStartDateValue("")
    setEndDateValue("")
    setDateRange({ startDate:null, endDate: null })
  }
  useEffect(() => {
    dispatch(toggleProcessIndicator(true))
    Promise.all([get.categories(), get.subcategories(), get.subSubcategories(filters)]).then(resp => {
      batch(() => {
        dispatch(setArray('categories', resp[0]))
        dispatch(setArray('subcategories', resp[1]))
        dispatch(setArray('sub-subcategories', resp[2]))
        dispatch(toggleProcessIndicator(false))
      })
    })
  }, [dispatch])

  useEffect(() => {
    if (!categories || !categories.length || !subcategories || !subcategories.length) return
    const categoryOptions = categories.filter(s=>s.status === 'Active').map(c => ({ label: c.name, value: c._id }))
    const subcategoryOptions = subcategories.filter(s=>s.status === 'Active').map(c => ({ label: c.name, value: c._id, category: c.category }))
    addSubSubcategoryForm.category.options = categoryOptions
    updateSubSubcategoryForm.category.options = categoryOptions
    addSubSubcategoryForm.subcategory.options = (path, { getValueAtPath }) =>
      subcategoryOptions.filter(c => c.category === getValueAtPath(['category']))
    updateSubSubcategoryForm.subcategory.options = (path, { getValueAtPath }) =>
      subcategoryOptions.filter(c => c.category === getValueAtPath(['category']))
  }, [categories, subcategories])

  const _createSubSubcategory = async values => {
    await createSubSubcategory(values).then(resp => dispatch(setItem('sub-subcategories', resp)))
    toast.success('Sub-Subcategory added successfully.')
    setFilters({...filters,status: 'Pending Approval'})
  }

  const _updateSubSubcategory = async (_id, values) => {
    await updateSubSubcategory(_id, values).then(resp => dispatch(updateItem('sub-subcategories', resp)))
    toast.success('Sub-Subcategory updated successfully.')
  }

  const allowAdd = getPermissions(PERMISSIONS, 'subSubcategory').includes(PERMISSION_CODES.subSubcategory[1])
  const allowUpdate = getPermissions(PERMISSIONS, 'subSubcategory').includes(
    PERMISSION_CODES.subSubcategory[2]
  )

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

  if (!subSubcategories) return <Loader absolute />
  return (
    <Box>
      <SectionHeader
        icon={Icons.subSubcategories}
        label="Sub-Subcategories"
        leftComponent={<Chip label={subSubcategories.length} />}
        rightComponent={
          allowAdd && (
            <FormDialog
              title="Add Sub-Subcategory"
              formProps={{
                formConfig: addSubSubcategoryForm,
                submitHandler: _createSubSubcategory,
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
      </Box>
      <Box display="flex" alignItems="flex-end" my={2} className={classes.root}>
        <Box mr={4} mb={-0.5}>
          <TextField
            size="small"
            label="Category"
            value={filters.category || ''}
            onChange={e => setFilters({ ...filters,category: e.target.value })}
            select>
            {(filters.status ? categories.filter(e => e.status === filters.status) : categories).map(option => (
              <MenuItem key={option._id} value={option._id}>
                {option.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            label="Subcategory"
            value={filters.subcategory || ''}
            onChange={e => setFilters({ ...filters, subcategory: e.target.value })}
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
        </Box>
        <Box flexGrow={1} />
        {!!Object.values(filters).filter(Boolean).length && (
          <Box>
            <Button variant="text" size="small" onClick={resetFilters} text="Reset" />
          </Box>
        )}
      </Box>
      <Box mb={2} />

      {subSubcategories.length ? (
        <Grid container spacing={2}>
          {subSubcategories.filter(s => filters.status ? s.status === filters.status : true).map(s => (
            <Grid key={s._id} item xs={3}>
              <SubSubcategoryCard
                category={categories.filter(c => c._id === s.category)[0]}
                subcategory={subcategories.filter(c => c._id === s.subcategory)[0]}
                subSubcategory={s}
                actions={
                  allowUpdate && [
                    <Button
                      key={'change-status-button' + s._id}
                      variant="outlined"
                      size="small"
                      onClick={() =>
                        _updateSubSubcategory(s._id, { status: getCategoryStatusToBeUpdated(s.status) })
                      }
                      color={{ Hide: 'warning' }[CATEGORY_STATUS_CHANGE_BUTTON_TEXTS[s.status]]}
                      style={{ marginRight: 8 }}
                      text={CATEGORY_STATUS_CHANGE_BUTTON_TEXTS[s.status]}
                    />,
                    <FormDialog
                      key={'update-button' + s._id}
                      title="Update Subcategory"
                      buttonProps={{ icon: Icons.edit }}
                      formProps={{
                        formConfig: updateSubSubcategoryForm,
                        submitHandler: val => _updateSubSubcategory(s._id, val),
                        incomingValue: s,
                      }}
                    />,
                  ]
                }
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box mt={4}>
          <Typography variant="body2">No Sub-Subcategories in system.</Typography>
        </Box>
      )}
    </Box>
  )
}

export default SubSubcategories
