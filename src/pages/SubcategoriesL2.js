import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import cloneDeep from 'lodash/cloneDeep'
import { useSnackbar } from 'notistack'
import { Box, Card, CardActions, CardContent, CardMedia, Chip, Grid, Typography } from '@material-ui/core'

import Icons from '../constants/icons'
import { addSubcategoryL2 } from '../constants/forms'
import { Button, Icon, SectionHeader } from '../components'
import { FormDialog } from '../components/Form'

import * as API from '../services/api'
import { toggleProcessIndicator } from '../store/reducers/app'
import { removeFalsyFieldsRecursive } from '../utils'
import { mdiChevronRight } from '@mdi/js'

export default function SubcategoriesL2() {
  const dispatch = useDispatch()
  const { enqueueSnackbar } = useSnackbar()

  const _getSubcategoriesL2 = useCallback(async () => {
    dispatch(toggleProcessIndicator(true))
    try {
      const { data: categories } = await API.getCategories()
      const { data: subcategories } = await API.getSubcategories()
      setOptions({
        categories: categories.map(c => ({ label: c.name, value: c._id })),
        subcategories: subcategories.map(c => ({ label: c.name, value: c._id, category: c.category._id })),
      })

      const { data } = await API.getSubcategoriesL2()
      setSubcategoriesL2(
        data.map(s => ({
          ...s,
          category: s.category?._id,
          _category: s.category,
          subcategory: s.subcategory._id,
          _subcategory: s.subcategory,
        }))
      )
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message ?? e.message, { variant: 'error' })
    }
    dispatch(toggleProcessIndicator())
  }, [dispatch, enqueueSnackbar])

  const [options, setOptions] = useState({ categories: [], subcategories: [] })
  const [subcategoriesL2, setSubcategoriesL2] = useState(null)
  useEffect(() => {
    _getSubcategoriesL2()
  }, [_getSubcategoriesL2])

  const _addSubcategoryL2 = async values => {
    await API.addSubcategoryL2(values)
    await _getSubcategoriesL2()
    enqueueSnackbar('Subcategory added successfully at level 2.', { variant: 'success' })
  }

  const updateSubcategoryL2Form = cloneDeep(addSubcategoryL2)
  addSubcategoryL2.category.options = options.categories
  addSubcategoryL2.subcategory.options = (pathArr, { backTracePath, getValueAtPath }) => {
    return options.subcategories.filter(s => s.category === getValueAtPath(backTracePath(pathArr, 'category')))
  }
  updateSubcategoryL2Form.category.options = options.categories
  updateSubcategoryL2Form.subcategory.options = (pathArr, { backTracePath, getValueAtPath }) => {
    return options.subcategories.filter(s => s.category === getValueAtPath(backTracePath(pathArr, 'category')))
  }
  const _updateSubcategoryL2 = async (_id, values) => {
    await API.updateSubcategoryL2(_id, values)
    await _getSubcategoriesL2()
    enqueueSnackbar('Subcategory updated successfully.', { variant: 'success' })
  }

  if (!subcategoriesL2) return null
  return (
    <>
      <SectionHeader
        icon={Icons.subcategoriesL2}
        label="Subcategories Level 2"
        rightComponent={
          <FormDialog
            title="Add Level 2 Subcategory"
            formProps={{ formConfig: addSubcategoryL2, submitHandler: values => _addSubcategoryL2(removeFalsyFieldsRecursive(values)) }}
          />
        }
      />

      {subcategoriesL2.length ? (
        <Grid container spacing={3}>
          {subcategoriesL2.map(c => (
            <Grid key={c._id} item xs={4}>
              <Card style={{ position: 'relative' }}>
                <Box position="absolute" top={8} left={8}>
                  <Chip label={c.status} color="primary" size="small" />
                </Box>
                <CardMedia image={c.image} style={{ height: 240 }} />

                <CardContent style={{ display: 'flex', alignItems: 'center' }}>
                  <Chip label={c._subcategory.name} color="default" size="small" />

                  <Icon path={mdiChevronRight} />

                  <Typography component="span" variant="h6" noWrap title={c.name}>
                    {c.name}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Box flexGrow={1} />

                  <FormDialog
                    title="Update"
                    buttonProps={{ icon: Icons.edit }}
                    formProps={{
                      formConfig: updateSubcategoryL2Form,
                      incomingValue: c,
                      submitHandler: values => _updateSubcategoryL2(c._id, removeFalsyFieldsRecursive(values)),
                    }}
                  />

                  <Button
                    size="small"
                    variant="outlined"
                    color={c.status === 'ACTIVE' ? 'error' : 'primary'}
                    onClick={() =>
                      _updateSubcategoryL2(c._id, { status: { PENDING: 'ACTIVE', ACTIVE: 'BLOCKED', BLOCKED: 'ACTIVE' }[c.status] })
                    }>
                    {c.status === 'PENDING' && 'Approve'}
                    {c.status === 'ACTIVE' && 'Block'}
                    {c.status === 'BLOCKED' && 'Unblock'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box mt={4}>
          <Typography variant="body2">No level 2 subcategories in system.</Typography>
        </Box>
      )}
    </>
  )
}
