import React, { useCallback, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import useDeepCompareEffect from 'use-deep-compare-effect'
import { useDispatch, useSelector } from 'react-redux'
import { Box, makeStyles, MenuItem, TextField, Typography } from '@material-ui/core'
import { Pagination as MuiPagination } from '@material-ui/lab'

import { getPermissions, PERMISSION_CODES } from '../../constants/permissions'

import { get } from '../api'
import { toggleProcessIndicator } from '../../store/reducers/app'
import { updateObject } from '../../store/reducers/objectReducers'

const getPermissionKey = entity => {
  const entities = {
    suppliers: 'supplier',
    resellers: 'reseller',
    collections: 'collection',
    products: 'product',
    advertisements: 'advertisement',
    advertisementBanners: 'advertisementBanners',
    orders: 'order',
    superusers: 'superuser',
    resellerPayment: 'resellerPayment',
    supplierPayment: 'supplierPayment',
    bonuses: 'bonus',
    coupons: 'coupon',
    referralNetwork: 'reseller',
  }
  return entities[entity]
}

const useStyles = makeStyles(theme => ({
  paginationContainer: {
    position: 'fixed',
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    padding: `${theme.spacing(1.5)}px ${theme.spacing(2)}px`,
    background: theme.palette.background.paper,
    borderTopRightRadius: theme.spacing(1),
    borderTopLeftRadius: theme.spacing(1),
    boxShadow: theme.shadows[4],
  },
}))

const usePageData = (entity, defaults) => {
  const containerRef = useRef(null)
  const classes = useStyles()
  const history = useHistory()

  const defaultFilters = defaults?.filters || {}

  const state = useSelector(state => state)
  const PERMISSIONS = state.auth?.user?.permissions
  const permissionKey = getPermissionKey(entity)
  const data = state[entity]
  const dispatch = useDispatch()

  useDeepCompareEffect(() => {
    if (!getPermissions(PERMISSIONS, permissionKey).includes(PERMISSION_CODES[permissionKey][0])) {
      history.replace('/')
      return () => { }
    }

    dispatch(toggleProcessIndicator(true))
    get[entity]({
      params: { limit: data.limit, page: data.currentPage, ...defaultFilters, ...data.filters },
    })
      .then(resp => {
        const { data: results, totalItems, filteredItemsCount, totalPages, metaData } = resp
        dispatch(
          updateObject(entity, {
            items: results,
            totalItems,
            filteredItemsCount,
            totalPages,
            metaData,
            currentPage: data.currentPage <= totalPages ? data.currentPage : 1,
          })
        )
      })
      .catch(e => {
        console.log(e)
      })
      .finally(() => {
        dispatch(toggleProcessIndicator(false))
      })
  }, [dispatch, entity, data.limit, data.currentPage, data.filters, data.refreshCount])

  const { totalItems, filteredItemsCount, totalPages, metaData } = data
  const { left, width } = containerRef.current?.getBoundingClientRect() ?? {}
  const handleOnPageChange = (e, n) => dispatch(updateObject(entity, { currentPage: n }))
  const Pagination = () => (
    <Box
      className={classes.paginationContainer}
      style={{ left, width, display: width && filteredItemsCount ? 'flex' : 'none' }}>
      <TextField
        variant="outlined"
        size="small"
        label="Item per page"
        style={{ width: 104 }}
        value={data.limit}
        onChange={event => {
          dispatch(updateObject(entity, { limit: event.target.value }))
        }}
        select>
        {[5, 10, 15].map(option => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>
      <Typography variant="caption" style={{ marginLeft: 12 }}>
        {data.currentPage} of {totalPages} pages
      </Typography>
      <Box flexGrow={1} />
      <MuiPagination
        count={totalPages}
        page={data.currentPage}
        onChange={handleOnPageChange}
        shape="rounded"
      />
    </Box>
  )

  const refresh = () => dispatch(updateObject(entity, { refreshCount: data.refreshCount + 1 }))
  const filter = useCallback(
    filters =>
      dispatch(
        updateObject(entity, {
          currentPage: 1,
          filters: typeof filters === 'function' ? filters(data.filters) : filters,
        })
      ),
    [data.filters, dispatch, entity]
  )
  const filters = { ...defaultFilters, ...data.filters }
  const permissions = {
    CREATE: getPermissions(PERMISSIONS, permissionKey).includes('CREATE'),
    UPDATE: getPermissions(PERMISSIONS, permissionKey).includes('UPDATE'),
  }
  return {
    [entity]: data.items,
    totalItems: filteredItemsCount || totalItems,
    metaData,
    containerRef,
    filters,
    filter,
    Pagination,
    refresh,
    permissions,
  }
}

export default usePageData
