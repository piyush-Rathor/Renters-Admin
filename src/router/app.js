import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Switch, Route } from 'react-router-dom'
import { Box, CircularProgress } from '@material-ui/core'

import { logout } from '../store/reducers/auth'
import * as API from '../services/api'

import Layout from '../pages/_layout'
import Dashboard from '../pages/Dashboard'
import Suppliers from '../pages/Suppliers'
import Resellers from '../pages/Resellers'
import Categories from '../pages/Categories'
import Subcategories from '../pages/Subcategories'
import SubcategoriesL2 from '../pages/SubcategoriesL2'
import Collections from '../pages/Collections'
import Products from '../pages/Products'
import Advertisements from '../pages/Advertisements'
import ResellersPayments from "../pages/ResellersPayments";
import SuppliersPayments from "../pages/SuppliersPayments";
import ResellersPayment from "../pages/ResellersPayment";
import SupplierPayment from "../pages/SupplierPayment";
import AdvertisementBanners from '../pages/AdvertisementBanners'

export default function AppRoutes() {
  const dispatch = useDispatch()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    API.checkLogin()
      .then(res => setIsProcessing(false))
      .catch(e => dispatch(logout()))
  }, [dispatch])

  if (isProcessing)
    return (
      <Box>
        <CircularProgress size="large" />
      </Box>
    )
  return (
    <Layout>
      <Switch>
        <Route path="/suppliers" exact>
          <Suppliers />
        </Route>
        <Route path="/resellers" exact>
          <Resellers />
        </Route>
        <Route path="/categories" exact>
          <Categories />
        </Route>
        <Route path="/subcategories" exact>
          <Subcategories />
        </Route>
        <Route path="/subcategories-l2" exact>
          <SubcategoriesL2 />
        </Route>
        <Route path="/collections" exact>
          <Collections />
        </Route>
        <Route path="/products" exact>
          <Products />
        </Route>
        <Route path="/advertisements" exact>
          <Advertisements />
        </Route>
        <Route path="/advertisement-banners" exact>
          <AdvertisementBanners />
        </Route>
        <Route path="/reseller-payments" exact>
          <ResellersPayments />
        </Route>
        <Route path="/reseller-payments/:reseller/:status/:transactionDate?" exact>
          <ResellersPayment />
        </Route>
        <Route path="/supplier-payments" exact>
          <SuppliersPayments />
        </Route>
        <Route path="/supplier-payments/:supplier/:status/:transactionDate?" exact>
          <SupplierPayment />
        </Route>

        <Route path="/" exact>
          <Dashboard />
        </Route>
      </Switch>
    </Layout>
  )
}
