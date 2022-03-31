import React, { useEffect, useState } from 'react'
import { batch, useDispatch } from 'react-redux'
import { Switch, Route } from 'react-router-dom'

import { logout } from '../store/reducers/auth'
import { checkLogin, get } from '../services/api'
import { setArray } from '../store/reducers/arrayReducers'
import { setObject } from '../store/reducers/objectReducers'
import { updateUser } from '../store/reducers/auth'

import { Loader } from '../components'
import Dashboard from '../pages/Dashboard'
import Suppliers from '../pages/Suppliers'
import Supplier from '../pages/Supplier'
import Resellers from '../pages/Resellers'
import Categories from '../pages/Categories'
import Subcategories from '../pages/Subcategories'
import SubSubcategories from '../pages/SubSubcategories'
import Collections from '../pages/Collections'
import Collection from '../pages/Collection'
import Products from '../pages/Products'
import Product from '../pages/Product'
import Advertisements from '../pages/Advertisements'
import Order from '../pages/Order'
import Orders from '../pages/Orders'
import Superusers from '../pages/Superusers'
import Settings from '../pages/Settings'
import ResellersPayments from '../pages/ResellersPayments'
import SuppliersPayments from '../pages/SuppliersPayments'
import Bonus from '../pages/Bonus'
import Bonuses from '../pages/Bonuses'
import ResellersPayment from '../pages/ResellersPayment'
import SupplierPayment from '../pages/SupplierPayment'
import AdvertisementBanners from '../pages/AdvertisementBanners'
import Coupons from '../pages/Coupons'
import Reseller from '../pages/Reseller'

export default function AppRoutes() {
  const dispatch = useDispatch()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    // ;(async () => {
    //   try {
    //     const user = await checkLogin()
    //     dispatch(updateUser(user))
    //     const resp = await Promise.all([
    //       get.categories(),
    //       get.subcategories(),
    //       get.subSubcategories(),
    //       get.settings(),
    //     ])
    //     batch(() => {
    //       dispatch(setArray('categories', resp[0]))
    //       dispatch(setArray('subcategories', resp[1]))
    //       dispatch(setArray('sub-subcategories', resp[2]))

    //       dispatch(setObject('settings', resp[3]))
    //     })
    //   } catch (e) {
    //     dispatch(logout())
    //   } finally {
    //     setIsProcessing(false)
    //   }
    // })()
    setIsProcessing(false)
  }, [dispatch])

  if (isProcessing) return <Loader absolute />
  return (
    <Switch>
      {/* <Route path="/settings" exact>
        <Settings />
      </Route>
      <Route path="/superusers" exact>
        <Superusers />
      </Route>
      <Route path="/orders/:orderId" exact>
        <Order />
      </Route>
      <Route path="/orders" exact>
        <Orders />
      </Route>
      <Route path="/advertisements" exact>
        <Advertisements />
      </Route>
      <Route path="/advertisement-banners" exact>
        <AdvertisementBanners />
      </Route>
      <Route path="/products" exact>
        <Products />
      </Route>
      <Route path="/products/:productId" exact>
        <Product />
      </Route>
      <Route path="/collections/:collectionId" exact>
        <Collection />
      </Route>
      <Route path="/collections" exact>
        <Collections />
      </Route>
      <Route path="/sub-subcategories" exact>
        <SubSubcategories />
      </Route>
      <Route path="/subcategories" exact>
        <Subcategories />
      </Route>
      <Route path="/categories" exact>
        <Categories />
      </Route>
      <Route path="/resellers" exact>
        <Resellers />
      </Route>
      <Route path="/resellers/:resellerId" exact>
        <Reseller />
      </Route>
      <Route path="/suppliers/:supplierId" exact>
        <Supplier />
      </Route>
      <Route path="/suppliers" exact>
        <Suppliers />
      </Route>
      <Route path="/reseller-payments" exact>
        <ResellersPayments />
      </Route>
      <Route path="/reseller-payment" exact>
        <ResellersPayment />
      </Route>
      <Route path="/reseller-payments/:reseller/:status/:transactionDate?" exact>
        <ResellersPayment />
      </Route>
      <Route path="/supplier-payments" exact>
        <SuppliersPayments />
      </Route>
      <Route path="/bonus/:bonusId" exact>
        <Bonus />
      </Route>
      <Route path="/bonus" exact>
        <Bonuses />
      </Route>
      <Route path="/coupons/:couponCode" exact>
        <Coupons />
      </Route>
      <Route path="/coupons" exact>
        <Coupons />
      </Route>
      <Route path="/supplier-payments/:supplier/:status/:transactionDate?" exact>
        <SupplierPayment />
      </Route> */}
      <Route path="/tenants" exact>
        <Resellers />
      </Route>
      <Route path="/tenant/:tenantId" exact>
        <Reseller />
      </Route>
      <Route path="/payments/tenants" exact>
        <Dashboard />
      </Route>
      <Route path="/" exact>
        <Dashboard />
      </Route>
    </Switch>
  )
}
