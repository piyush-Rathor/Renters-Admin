import React from 'react'
import { cloneDeep } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { Box } from '@material-ui/core'

import Icons from '../constants/icons'
import tables from '../constants/tables'
import updateSettings from '../constants/forms/update-settings'
import { TableSection } from '../components/Table'
import { FormDialog } from '../components/Form'
import { ContentCell, Loader, SectionHeader } from '../components'
import { updateSettings as updateSettingsAPI } from '../services/api'
import { updateObject } from '../store/reducers/objectReducers'
import { formatCurrency } from '../utils'

const shippingDetailsTable = cloneDeep(tables['shippingDetails'])
const updateSettingsForm = cloneDeep(updateSettings)

function Settings() {
  const settings = useSelector(state => state.settings)
  const dispatch = useDispatch()

  if (!settings) return <Loader absolute />
  return (
    <>
      <SectionHeader
        icon={Icons.settings}
        label="Settings"
        rightComponent={
          <FormDialog
            title="Update Settings"
            buttonProps={{ icon: Icons.edit }}
            formProps={{
              formConfig: updateSettingsForm,
              submitHandler: val =>
                updateSettingsAPI({
                  ...val,
                  shippingDetails: val.shippingDetails.map(f => ({...f, source: f.source.trim(), destination: f.destination.trim()}))
                })
                  .then(resp => dispatch(updateObject('settings', resp)))
                  .catch(e => console.log(e)),
              incomingValue: settings,
            }}
          />
        }
      />

      <Box mt={3} mb={2}>
        {/*{!!settings.platformMargin && (
          <ContentCell
            label="Platform Margin"
            content={
              settings.platformMarginType === 'Percentage'
                ? settings.platformMargin + '%'
                : formatCurrency(settings.platformMargin)
            }
          />
        )}*/}
        {!!settings.returnHoldPeriod && (
          <ContentCell label="Return hold period (days)" content={settings.returnHoldPeriod + ' days'} />
        )}
      </Box>

      <TableSection
        icon={shippingDetailsTable.icon}
        label={shippingDetailsTable.label}
        getKey={row => row._id}
        columns={shippingDetailsTable.columns}
        rows={settings.shippingDetails}
      />

      <Box mt={4}>
        {!!settings.minimumRequiredAppVersions && (
          <ContentCell
            label="Minimum required app versions"
            inline={false}
            content={
              <Box display="flex" pl={1} pt={1}>
                <ContentCell label="Android" content={settings.minimumRequiredAppVersions.android} />
                <Box px={4} />
                <ContentCell label="iOS" content={settings.minimumRequiredAppVersions.iOS} />
              </Box>
            }
          />
        )}
      </Box>
    </>
  )
}

export default Settings
