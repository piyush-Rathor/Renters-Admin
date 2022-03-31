import React, { useCallback, useEffect, useState } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import { toast } from 'react-toastify'
import { Box, Grid, InputAdornment, makeStyles, MenuItem, TextField, Typography } from '@material-ui/core'
import debounce from 'lodash/debounce'
import Icons from '../constants/icons'
import addProduct from '../constants/forms/add-product'
import { createProduct, get, updateProduct } from '../services/api'
import usePageData from '../services/PageData'

import { FormDialog } from '../components/Form'
import { Avatar, Button, Icon, Loader, SectionHeader, StatCard, Status, ToggleButtons } from '../components'
import { useDispatch, useSelector } from 'react-redux'
import { toggleProcessIndicator } from '../store/reducers/app'
import { Table } from '../components/Table'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { getDiscountedPrice, getErfaPrice, downloadPDFBlob } from '../utils'


const addProductForm = cloneDeep(addProduct)
const updateProductForm = cloneDeep(addProduct)

const useStyles = makeStyles(theme => ({
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

function Products() {
  const classes = useStyles()
  const state = useSelector(state => state)
  const [suppliers, setSuppliers] = useState(null)
  const [status, setStatus] = useState('Active')
  const [stock, setStock] = useState(null)
  const [startDateValue,setStartDateValue] = useState(null)
  const [endDateValue,setEndDateValue] = useState(null)
  const [forObjChange, setforObjChange] = useState(false)
  const [selectedCategory, setselectedCategory] = useState(null)
  const [selectedSubCategory, setselectedSubCategory] = useState(null)
  const [selectedsubSubcategory, setselectedsubSubcategory ] = useState(null)
  const [filteredSupplier, setfilteredSupplier] = useState()
  const { settings } = state
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const subSubcategories = state['sub-subcategories']
  const dispatch = useDispatch()
  const [dateRate, setDateRange] = useState({ startDate: null, endDate: null })
  const [supplierQuery, setSupplierQuery] = useState('')
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
    dispatch(toggleProcessIndicator(true))
    Promise.all([get.allSuppliers({ params: { status: "Active" } })])
      .then(resp => {
        setSuppliers(resp[0])
      })
      .catch(console.log)
      .finally(() => dispatch(toggleProcessIndicator(false)))
  }, [dispatch])

  useEffect(() => {
    if (categories && categories.length) {
      // const categoryOptions = categories.filter(c=>c.status==='Active').map(c => ({ label: c.name, value: c._id }))
      const categoryOptions = categories.map(c => ({ label: c.name, value: c._id }))
      addProductForm.category.options = categoryOptions
      updateProductForm.category.options = categoryOptions
    }

    if (subcategories && subcategories.length) {
      // const subcategoryOptions = subcategories.filter(c=>c.status==='Active').map(c => ({
      const subcategoryOptions = subcategories.map(c => ({
        label: c.name,
        value: c._id,
        category: c.category,
      }))
      addProductForm.subcategory.options = (path, { getValueAtPath }) =>
        subcategoryOptions.filter(c => c.category === getValueAtPath(['category']))
      updateProductForm.subcategory.options = (path, { getValueAtPath }) =>
        subcategoryOptions.filter(c => c.category === getValueAtPath(['category']))
    }

    if (subSubcategories && subSubcategories.length) {
      // const subSubcategoryOptions = subSubcategories.filter(c=>c.status==='Active').map(c => ({
      const subSubcategoryOptions = subSubcategories.map(c => ({
        label: c.name,
        value: c._id,
        subcategory: c.subcategory,
      }))
      addProductForm.subSubcategory.options = (path, { getValueAtPath }) =>
        subSubcategoryOptions.filter(c => c.subcategory === getValueAtPath(['subcategory']))
      updateProductForm.subSubcategory.options = (path, { getValueAtPath }) =>
        subSubcategoryOptions.filter(c => c.subcategory === getValueAtPath(['subcategory']))
    }

    if (suppliers && suppliers.length) {
      const supplierOptions = suppliers.filter(c=>c.status==='Active').map(s => ({ label: s.name, value: s._id }))
      addProductForm.supplier.options = supplierOptions
      updateProductForm.supplier.options = supplierOptions
    }
  }, [categories, subcategories, subSubcategories, suppliers])

  const pageData = usePageData('products', { filters: { status: status, stock: stock } })
  const [suppliersIds, setSuppliersIds] = useState([])
  const { products, totalItems, containerRef, Pagination, refresh } = pageData
  const { filters, filter, permissions } = pageData

  const [productQuery, setProductQuery] = useState(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchProduct = useCallback(
    debounce(q => {
      if (q !== productQuery) {
        filter(f => ({ ...f, query: q }))
      }
    }, 1250),
    [filter],
  )


  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filterBySupplier = useCallback(
    debounce(q => {
      console.log({q, suppliersIds})
      if ((q || []).join('') !== (suppliersIds || []).join('')) {
        setSuppliersIds(q)
        filter(f => ({ ...f, supplier: q }))
      }
    }, 1250),
    [filter],
  )

  const handleSearchQuery = () =>{ 
    filter(f => ({ ...f, query: productQuery, supplier: filteredSupplier, status: status, stock:stock, category: selectedCategory, subcategory : selectedSubCategory, subSubcategory: selectedsubSubcategory,
      startDate: dateRate.startDate  , endDate:dateRate.endDate,
    }))

  }

  const resetFilters = async() => {
    if(filters.query || filters.category || filters.subcategory || filters.subSubcategory || filters.supplier || filters.startDate || filters.endDate || filters.stock || filters.status != 'Active' ){
      filter({})
      }
    setProductQuery('')
    setselectedCategory(null)
    setselectedSubCategory(null)
    setselectedsubSubcategory(null)
    setfilteredSupplier(null)
    setStartDateValue(null)
    setEndDateValue(null)
    setStatus('Active')
    setStock(null)
    setSupplierQuery('')
    setDateRange({ startDate:null, endDate: null })
   
  }

  const _createProduct = async ({ erfaPrice, discountedPrice, ...values }) => {
    await createProduct(values).then(resp => refresh())
    toast.success('Product added successfully.')
  }

  const _updateProduct = async (_id, { erfaPrice, discountedPrice, ...values }) => {
    values['discountedPrice'] = discountedPrice;
    if (!values.eligibleForFreeShipping)
      values.eligibleForFreeShipping = false
    await updateProduct(_id, values).then(resp => refresh()).catch(e => toast.error(e.message))
    toast.success('Product updated successfully.')
  }

  const getSupplier = (supplier) => {
    return suppliers && suppliers.filter(_s => _s._id === supplier)[0]
  }

  const getCategory = (category) => {
    return categories && categories.filter(_s => _s._id === category)[0]
  }

  const getSubCategory = (subcategory) => {
    return subcategories && subcategories.filter(_s => _s._id === subcategory)[0]
  }

  const getSubSubCategory = (subSubcategory) => {
    return subSubcategories && subSubcategories.filter(_s => _s._id === subSubcategory)[0]
  }

  const parseProduct = (product) => {
    const { supplierPrice, platformMarginType, platformMargin, discountType, discount } = product
    return {
      ...product,
      erfaPrice: getErfaPrice(supplierPrice, platformMarginType, platformMargin),
      discountedPrice: getDiscountedPrice(supplierPrice, platformMarginType, platformMargin, discountType, discount),
    }
  }

  const downloadPdf = async () => {
    const res = await get["products"]({ params: {...filters, pdf: true}}, {responseType: 'blob'})
    downloadPDFBlob(res)
  }

  return (
    <Box ref={containerRef}>
      {!products ? (
        <Loader absolute />
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid item xs={3}>
              <StatCard label='# of Products' count={totalItems} />
            </Grid>
          </Grid>

          <Box mt={5}>
            <SectionHeader
              icon={Icons.products}
              label='Products'
              rightComponent={
                (<>
                <Button variant='outlined' size='small' color="primary" style={{marginRight: '20px'}} onClick={downloadPdf} text='Download PDF' />
                {permissions.CREATE && <FormDialog
                    title='Add Product'
                    formProps={{
                      formConfig: addProductForm,
                      submitHandler: _createProduct,
                      incomingValue: {
                        platformMarginType: settings.platformMarginType,
                        platformMargin: settings.platformMargin,
                      },
                    }}
                  />}
                </>)
              }
            />

            <Box display='flex' alignItems='flex-end' my={2} className={classes.root}>
              <Box mr={4} mb={-0.5} width="40%">
                <TextField
                  label='Search'
                  placeholder='code, name, sku'
                  variant='outlined'
                  value={productQuery}
                  style={{width: '35%'}}
                  onChange={e => {
                    setProductQuery(e.target.value)
                  //  searchProduct(e.target.value)
                  
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Icon color='primary' path={Icons.search} />
                      </InputAdornment>
                    ),
                  }}
                  size='small'
                />
                <TextField
                  variant='outlined'
                  placeholder={`Supplier Name`}
                  value={supplierQuery}
                  style={{width: '30%'}}
                  onChange={e => {
                    let _selectedSupplier = e.target.value
                    if (_selectedSupplier === '') {
                      setSupplierQuery('')
                      return
                    }
                    let _suppliers = suppliers.filter(s => s.name.toLowerCase().includes(_selectedSupplier)).map(s => s._id)
                    setSupplierQuery(_selectedSupplier)
                    setfilteredSupplier(_suppliers)  
                  }}
                  size='small'
                />
              </Box>
              <Box mr={2} mb={1}>
                <Icon color='primary' path={Icons.filter} />
              </Box>
              <Box mr={1} mb={1}>
                <ToggleButtons
                  options={[
                    { label: 'All', value: null },
                    { label: 'Active', value: 'Active' },
                    { label: 'Hidden', value: 'Hidden' },
                    { label: 'Pending Approval', value: 'Pending Approval' },
                  ]}
                  value={status}
                  onChange={v => setStatus(v) & filter(f => ({ ...f, status: v }))}
                />
              </Box>
              <Box mr={1} mb={1}>
                <ToggleButtons
                  options={[
                    { label: 'All', value: null },
                    { label: 'In-Stock', value: 'inStock' },
                    { label: 'Out of Stock', value: 'outStock' },
                  ]}
                  value={stock}
                  onChange={v => setStock(v) & filter(f => ({ ...f, stock: v }))}
                />
              </Box>
            </Box>
            <Box display='flex' alignItems='flex-end' my={2} className={classes.root}>
              <Box mr={1} mb={-0.5}>
                <TextField
                  style={{width:"20ch"}}
                  size='small'
                  label='Category'
                  value={selectedCategory || ''}
                  onChange={e => setselectedCategory(e.target.value)}
                  select>
                  {(filters.status ? categories.filter(e => e.status === filters.status) : categories).map(option => (
                    <MenuItem key={option._id} value={option._id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  size='small'
                  label='Subcategory'
                  value={selectedSubCategory || ''}
                  onChange={e => setselectedSubCategory(e.target.value)}
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
                  size='small'
                  label='Sub-Subcategory'
                  value={selectedsubSubcategory || ''}
                  onChange={e => setselectedsubSubcategory(e.target.value)}
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
                  id='start_date'
                  label='Select Start Date'
                  type='date'
                  value={startDateValue}
                  onChange={e => {
                    setDateRange({ ...dateRate, startDate: new Date(e.target.value).toISOString() })
                    setStartDateValue(e.target.value)
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  id='end_date'
                  label='Select End Date'
                  type='date'
                  onChange={e => {
                    let value = e.target.value
                    if (new Date(dateRate.startDate) > new Date(value)) {
                      toast.error('End Date cannot be greater than start date')
                      return
                    }
                    let ed = new Date(value)
                    ed.setHours(23, 0, 0, 0)
                    setDateRange({ ...dateRate, endDate: new Date(ed.getTime()).toISOString() })
                    setEndDateValue(e.target.value)
                  }}
                  value={endDateValue}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Box>
              <Box flexGrow={1} />
                <Box mb={1}>
                  <Button variant='text' size='small' onClick={handleSearchQuery} text='Search' />
                </Box>
                <Box mb={1}>
                  <Button variant='text' size='small' onClick={resetFilters} text='Reset' />
                </Box>
            </Box>

            {products.length ? (
              <Box mb={2}>
                <Table
                  getKey={v => v.key + Date.now().toString()}
                  columns={[
                    { field: 'avatar', label: 'Avatar' },
                    { field: 'sku', label: 'SKU' },
                    { field: 'name', label: 'Name' },
                    { field: 'supplier', label: 'Supplier' },
                    { field: 'category', label: 'Category' },
                    { field: 'size', label: 'Stocks' },
                    { field: 'status', label: 'Status' },
                    { field: 'created', label: 'Created At' },
                    { field: 'actions', label: '', props: { width: 48 } },
                  ]}
                  rows={[
                    ...products.map(o => ({
                      avatar: (
                        <Box>
                          {o.images.slice(0, 1).map((i, idx) => (
                            <Avatar
                              key={'image' + idx}
                              className={classes.image}
                              size={100}
                              text={o.name}
                              src={i.image?.thumbnail}
                              variant='rounded'
                              style={{ margin: -8, marginLeft: idx ? -104 : -8 }}
                            />
                          ))}
                        </Box>
                      ),
                      sku: o.SKU,
                      key: o._id,
                      name: (
                        <Box>
                          <Typography variant='body2' noWrap>
                            {o.name}
                          </Typography>
                        </Box>
                      ),
                      supplier: (
                        <Box>
                          {getSupplier(o.supplier)?.name}
                          <Typography display='flex' variant='body2'>{getSupplier(o.supplier)?.email}</Typography>
                        </Box>
                      ),
                      category: (
                        <Box>
                          {[getCategory(o.category)?.name, getSubCategory(o.subcategory)?.name, getSubSubCategory(o.subSubcategory)?.name]
                            .filter(Boolean)
                            .join(' > ')}
                        </Box>
                      ),
                      size: o.stocks,
                      created: format(new Date(o.createdAt), 'MMM do, yyyy'),
                      status: <Status status={o.status} />,
                      actions: <Box display='flex'>
                        {permissions.UPDATE && (
                          <FormDialog
                            title='Update Product'
                            buttonProps={{ icon: Icons.edit }}
                            formProps={{
                              formConfig: updateProductForm,
                              submitHandler: val => _updateProduct(o._id, val),
                              incomingValue: parseProduct(o),
                            }}
                          />
                        )
                        }
                        <Button component={Link} to={`/products/` + o._id} icon={Icons.send} />
                      </Box>,
                    })),
                  ]}
                />
              </Box>
            ) : (
              <Box mt={4}>
                <Typography variant='body2'>No products in system.</Typography>
              </Box>
            )}
          </Box>

          <Pagination />
        </>
      )}
    </Box>
  )
}

export default Products
